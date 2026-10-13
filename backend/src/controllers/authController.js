const bcrypt = require('bcrypt');
const { getConnection } = require('../config/db');
const { responderErrorInterno } = require('../utils/errores');
const { crearToken, consumirToken } = require('../services/tokenCorreoService');
const { enviarVerificacion, enviarRecuperacion } = require('../services/emailService');

/** Largo mínimo de contraseña (registro y restablecimiento). */
const LARGO_MINIMO_CONTRASENA = 8;

/**
 * Respuesta para los pedidos por email (reenviar confirmación, olvidé mi contraseña).
 * Es siempre la misma exista o no la cuenta, para que nadie pueda usar estos
 * formularios para averiguar qué correos están registrados.
 */
const RESPUESTA_CORREO_GENERICA = { message: 'Si el correo corresponde a una cuenta, te llega un mensaje en unos minutos. Revisá también la carpeta de spam.' };

/**
 * Versión de la Política de Privacidad y los Términos que se acepta al registrarse.
 * Tiene que coincidir con `version` en frontend/src/pages/legal/datosLegales.js.
 * Queda guardada junto a la cuenta, como constancia de qué texto aceptó cada persona.
 */
const VERSION_TERMINOS = '2026-10-09';

/**
 * @fileoverview Controlador de autenticación.
 * Maneja el inicio de sesión y registro de usuarios (Emprendedores y Clientes),
 * operando sobre dos tablas distintas: `Usuario` y `Cliente`.
 *
 * @module authController
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Inicia sesión de un usuario o cliente.
 *
 * Busca primero en la tabla `Usuario` (Administradores y Emprendedores).
 * Si no encuentra coincidencia, busca en la tabla `Cliente`.
 * En ambos casos compara la contraseña usando bcrypt.
 *
 * - Los Emprendedores (id_rol === 2) deben tener id_estado === 1 (aprobado) para poder ingresar.
 * - Los Clientes reciben un id_rol virtual de 3 para que el frontend los identifique correctamente.
 *
 * @async
 * @function login
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.email - Email del usuario o cliente.
 * @param {string} req.body.contraseña - Contraseña en texto plano.
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>}
 *
 * @throws {400} Si faltan email o contraseña en el body.
 * @throws {401} Si las credenciales no coinciden con ningún registro.
 * @throws {403} Si el Emprendedor tiene la cuenta pendiente de aprobación.
 * @throws {500} Si ocurre un error interno en el servidor.
 */
const iniciarSesion = async (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        return res.status(400).json({ message: "Ingrese credenciales completas." });
    }

    try {
        const pool = await getConnection();

        // Buscamos en Usuario (Administradores y Emprendedores)
        // LOWER(): el email no distingue mayúsculas de minúsculas (igual que antes en SQL Server)
        const resultUser = await pool.query(
            'SELECT id_usuario, nombre, apellido, "contraseña", id_rol, id_estado, email_verificado FROM Usuario WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (resultUser.rows.length > 0) {
            const user = resultUser.rows[0];
            const match = await bcrypt.compare(contraseña, user['contraseña']);

            if (match) {
                // Sin confirmar el correo no se entra (se avisa recién después de validar la contraseña).
                if (!user.email_verificado) {
                    return res.status(403).json({ message: "Todavía no confirmaste tu correo. Buscá el mail que te enviamos al registrarte.", codigo: 'EMAIL_NO_VERIFICADO' });
                }
                // Solo validamos estado para Emprendedores (id_rol === 2)
                if (user.id_rol === 2 && user.id_estado !== 1) {
                    return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
                }
                delete user['contraseña'];
                delete user.email_verificado;
                return res.json({ message: "Bienvenido", user });
            }
        }

        // Buscamos en Cliente
        const resultCliente = await pool.query(
            'SELECT id_cliente AS id_usuario, nombre, apellido, "contraseña", email_verificado FROM Cliente WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (resultCliente.rows.length > 0) {
            const cliente = resultCliente.rows[0];
            const matchCliente = await bcrypt.compare(contraseña, cliente['contraseña']);

            if (matchCliente) {
                if (!cliente.email_verificado) {
                    return res.status(403).json({ message: "Todavía no confirmaste tu correo. Buscá el mail que te enviamos al registrarte.", codigo: 'EMAIL_NO_VERIFICADO' });
                }
                delete cliente['contraseña'];
                delete cliente.email_verificado;
                // id_rol virtual para que el frontend identifique al cliente correctamente
                return res.json({ message: "Bienvenido Cliente", user: { ...cliente, id_rol: 3 } });
            }
        }

        res.status(401).json({ message: "Credenciales incorrectas." });

    } catch (error) {
        responderErrorInterno(res, error, 'iniciarSesion');
    }
};

/**
 * Registra un nuevo Emprendedor o Cliente en el sistema.
 *
 * Aplica las siguientes validaciones antes de insertar:
 * 1. Verifica que todos los campos obligatorios estén presentes.
 * 2. Valida que el usuario tenga al menos 16 años.
 * 3. Verifica que el DNI no esté registrado ni en `Usuario` ni en `Cliente`.
 *
 * Según el rol indicado (id_rol), inserta en tablas distintas:
 * - `id_rol === 2` → Tabla `Usuario`, con estado inicial 2 (pendiente de aprobación).
 * - `id_rol === 3` → Tabla `Cliente`.
 *
 * La contraseña se hashea con bcrypt (10 salt rounds) antes de almacenarse.
 *
 * @async
 * @function register
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.nombre - Nombre completo del usuario.
 * @param {string} req.body.apellido - Apellido del usuario.
 * @param {string} req.body.DNI - Documento Nacional de Identidad (debe ser único).
 * @param {string} req.body.fecha_nacimiento - Fecha de nacimiento en formato ISO (YYYY-MM-DD).
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {string} req.body.contraseña - Contraseña en texto plano (se hashea antes de guardar).
 * @param {number|string} req.body.id_rol - Rol del usuario: 2 = Emprendedor, 3 = Cliente.
 * @param {string} [req.body.nombreEmprendimiento] - Nombre del emprendimiento (solo para id_rol === 2).
 * @param {string} [req.body.reseña] - Descripción del emprendedor (solo para id_rol === 2).
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>}
 *
 * @throws {400} Si faltan campos obligatorios, no se aceptaron los términos o el usuario es menor de 16 años.
 * @throws {409} Si el DNI ya está registrado en alguna tabla.
 * @throws {500} Si ocurre un error interno en el servidor.
 */
const registrar = async (req, res) => {
    // Se agrega nombreEmprendimiento a la desestructuración
    const { nombre, apellido, DNI, fecha_nacimiento, email, contraseña, id_rol, nombreEmprendimiento, reseña, aceptaTerminos } = req.body;

    // 1. Validación de campos obligatorios
    if (!nombre || !apellido || !DNI || !fecha_nacimiento || !email || !contraseña || !id_rol) {
        return res.status(400).json({ message: "Debe completar todos los campos del formulario." });
    }

    // Solo se puede registrar como Emprendedor (2) o Cliente (3), nunca como Administrador.
    // Antes, con otro valor la request quedaba colgada sin respuesta.
    if (![2, 3].includes(parseInt(id_rol))) {
        return res.status(400).json({ message: "Tipo de cuenta inválido." });
    }

    // Sin aceptación expresa de la política de privacidad y los términos no se crea la cuenta
    // (el consentimiento es lo que habilita a guardar los datos personales).
    if (aceptaTerminos !== true) {
        return res.status(400).json({ message: "Para crear la cuenta tenés que aceptar la Política de privacidad y los Términos y condiciones." });
    }

    if (String(contraseña).length < LARGO_MINIMO_CONTRASENA) {
        return res.status(400).json({ message: `La contraseña tiene que tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.` });
    }

    // 2. Validación de edad mínima (16 años)
    const hoy = new Date();
    const cumple = new Date(fecha_nacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    if (hoy.getMonth() < cumple.getMonth() || (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) {
        edad--;
    }
    if (edad < 16) {
        return res.status(400).json({ message: "La edad mínima para registrarse es de 16 años." });
    }

    try {
        const pool = await getConnection();

        // 3. Verificación de DNI duplicado en ambas tablas
        const checkDniU = await pool.query('SELECT id_usuario FROM Usuario WHERE "DNI" = $1', [DNI]);
        const checkDniC = await pool.query('SELECT id_cliente FROM Cliente WHERE "DNI" = $1', [DNI]);

        if (checkDniU.rows.length > 0 || checkDniC.rows.length > 0) {
            return res.status(409).json({ message: "El DNI ingresado ya pertenece a una cuenta activa." });
        }

        // Hash de la contraseña antes de almacenar
        const hash = await bcrypt.hash(contraseña, 10);

        // 4. Inserción según el rol
        if (parseInt(id_rol) === 2) {
            // EMPRENDEDOR → Tabla Usuario, estado inicial: 2 (pendiente de aprobación)
            // Se agrega nombreEmprendimiento al INSERT
            const nuevo = await pool.query(`
                    INSERT INTO Usuario (nombre, apellido, "DNI", fecha_nacimiento, email, "contraseña", id_rol, id_estado, "nombreEmprendimiento", "reseña", acepto_terminos_en, version_terminos)
                    VALUES ($1, $2, $3, $4, $5, $6, 2, 2, $7, $8, NOW(), $9)
                    RETURNING id_usuario
                `, [nombre, apellido, DNI, fecha_nacimiento, email, hash, nombreEmprendimiento || '', reseña || '', VERSION_TERMINOS]);

            const enviado = await mandarVerificacion(pool, { tabla: 'Usuario', idCuenta: nuevo.rows[0].id_usuario, email, nombre });
            return res.status(201).json({
                message: "Cuenta creada. Confirmá tu correo con el enlace que te enviamos; después un administrador revisa tu solicitud de emprendedor.",
                verificacion: true,
                correoEnviado: enviado,
            });

        } else if (parseInt(id_rol) === 3) {
            // CLIENTE → Tabla Cliente
            const nuevo = await pool.query(`
                    INSERT INTO Cliente (nombre, apellido, "DNI", fecha_nacimiento, email, "contraseña", acepto_terminos_en, version_terminos)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
                    RETURNING id_cliente
                `, [nombre, apellido, DNI, fecha_nacimiento, email, hash, VERSION_TERMINOS]);

            const enviado = await mandarVerificacion(pool, { tabla: 'Cliente', idCuenta: nuevo.rows[0].id_cliente, email, nombre });
            return res.status(201).json({
                message: "Cuenta creada. Confirmá tu correo con el enlace que te enviamos para poder ingresar.",
                verificacion: true,
                correoEnviado: enviado,
            });
        }

    } catch (error) {
        responderErrorInterno(res, error, 'registrar');
    }
};

/* ── Verificación de correo y recuperación de contraseña ─────────────── */

/**
 * Crea el enlace de confirmación y lo manda por mail.
 * Si el envío falla, la cuenta queda creada igual: la persona puede pedir
 * otro mail desde el login.
 *
 * @returns {Promise<boolean>} true si el mail salió.
 */
const mandarVerificacion = async (pool, { tabla, idCuenta, email, nombre }) => {
    try {
        const token = await crearToken(pool, { tipo: 'verificacion', tabla, idCuenta });
        await enviarVerificacion({ email, nombre, token });
        return true;
    } catch (error) {
        console.error('[mandarVerificacion]', error);
        return false;
    }
};

/**
 * Busca una cuenta por email en las dos tablas (primero Usuario, como el login).
 *
 * @returns {Promise<{ tabla: 'Usuario'|'Cliente', id: number, nombre: string, email: string, email_verificado: boolean } | null>}
 */
const buscarCuentaPorEmail = async (pool, email) => {
    const resultado = await pool.query(`
        SELECT 'Usuario' AS tabla, id_usuario AS id, nombre, email, email_verificado FROM Usuario WHERE LOWER(email) = LOWER($1)
        UNION ALL
        SELECT 'Cliente' AS tabla, id_cliente AS id, nombre, email, email_verificado FROM Cliente WHERE LOWER(email) = LOWER($1)
    `, [email]);
    return resultado.rows[0] || null;
};

/** Valida que el email venga como texto razonable antes de ir a la base. */
const emailValido = (email) => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Confirma el correo con el token del enlace.
 * @route POST /api/auth/verificar  — body: { token }
 */
const verificarCorreo = async (req, res) => {
    try {
        const pool = await getConnection();
        const cuenta = await consumirToken(pool, req.body?.token, 'verificacion');
        if (!cuenta) {
            return res.status(400).json({ message: 'El enlace no es válido o ya venció. Pedí uno nuevo desde la pantalla de ingreso.' });
        }
        const columnaId = cuenta.tabla === 'Usuario' ? 'id_usuario' : 'id_cliente';
        await pool.query(`UPDATE ${cuenta.tabla} SET email_verificado = TRUE WHERE ${columnaId} = $1`, [cuenta.id_cuenta]);
        res.json({ message: '¡Listo! Tu correo quedó confirmado. Ya podés ingresar.' });
    } catch (error) {
        responderErrorInterno(res, error, 'verificarCorreo');
    }
};

/**
 * Vuelve a mandar el mail de confirmación.
 * @route POST /api/auth/reenviar-verificacion  — body: { email }
 */
const reenviarVerificacion = async (req, res) => {
    const { email } = req.body || {};
    if (!emailValido(email)) return res.status(400).json({ message: 'Ingresá un correo válido.' });
    try {
        const pool = await getConnection();
        const cuenta = await buscarCuentaPorEmail(pool, email);
        if (cuenta && !cuenta.email_verificado) {
            await mandarVerificacion(pool, { tabla: cuenta.tabla, idCuenta: cuenta.id, email: cuenta.email, nombre: cuenta.nombre });
        }
        res.json(RESPUESTA_CORREO_GENERICA);
    } catch (error) {
        responderErrorInterno(res, error, 'reenviarVerificacion');
    }
};

/**
 * Manda el mail para restablecer la contraseña.
 * @route POST /api/auth/olvide  — body: { email }
 */
const solicitarRecuperacion = async (req, res) => {
    const { email } = req.body || {};
    if (!emailValido(email)) return res.status(400).json({ message: 'Ingresá un correo válido.' });
    try {
        const pool = await getConnection();
        const cuenta = await buscarCuentaPorEmail(pool, email);
        if (cuenta) {
            try {
                const token = await crearToken(pool, { tipo: 'recuperacion', tabla: cuenta.tabla, idCuenta: cuenta.id });
                await enviarRecuperacion({ email: cuenta.email, nombre: cuenta.nombre, token });
            } catch (error) {
                // Se registra pero no se informa: la respuesta tiene que ser la misma haya cuenta o no.
                console.error('[solicitarRecuperacion]', error);
            }
        }
        res.json(RESPUESTA_CORREO_GENERICA);
    } catch (error) {
        responderErrorInterno(res, error, 'solicitarRecuperacion');
    }
};

/**
 * Guarda la contraseña nueva usando el token del enlace.
 * Como el enlace llegó al correo, también deja el correo confirmado.
 * @route POST /api/auth/restablecer  — body: { token, contraseña }
 */
const restablecerContrasena = async (req, res) => {
    const { token, contraseña } = req.body || {};
    if (typeof contraseña !== 'string' || contraseña.length < LARGO_MINIMO_CONTRASENA) {
        return res.status(400).json({ message: `La contraseña tiene que tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.` });
    }
    try {
        const pool = await getConnection();
        const cuenta = await consumirToken(pool, token, 'recuperacion');
        if (!cuenta) {
            return res.status(400).json({ message: 'El enlace no es válido o ya venció. Pedí uno nuevo.' });
        }
        const hash = await bcrypt.hash(contraseña, 10);
        const columnaId = cuenta.tabla === 'Usuario' ? 'id_usuario' : 'id_cliente';
        await pool.query(
            `UPDATE ${cuenta.tabla} SET "contraseña" = $1, email_verificado = TRUE WHERE ${columnaId} = $2`,
            [hash, cuenta.id_cuenta]
        );
        res.json({ message: 'Tu contraseña se cambió. Ya podés ingresar con la nueva.' });
    } catch (error) {
        responderErrorInterno(res, error, 'restablecerContrasena');
    }
};

module.exports = { iniciarSesion, registrar, verificarCorreo, reenviarVerificacion, solicitarRecuperacion, restablecerContrasena };