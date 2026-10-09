const bcrypt = require('bcrypt');
const { getConnection } = require('../config/db');
const { responderErrorInterno } = require('../utils/errores');

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
            'SELECT id_usuario, nombre, apellido, "contraseña", id_rol, id_estado FROM Usuario WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (resultUser.rows.length > 0) {
            const user = resultUser.rows[0];
            const match = await bcrypt.compare(contraseña, user['contraseña']);

            if (match) {
                // Solo validamos estado para Emprendedores (id_rol === 2)
                if (user.id_rol === 2 && user.id_estado !== 1) {
                    return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
                }
                delete user['contraseña'];
                return res.json({ message: "Bienvenido", user });
            }
        }

        // Buscamos en Cliente
        const resultCliente = await pool.query(
            'SELECT id_cliente AS id_usuario, nombre, apellido, "contraseña" FROM Cliente WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (resultCliente.rows.length > 0) {
            const cliente = resultCliente.rows[0];
            const matchCliente = await bcrypt.compare(contraseña, cliente['contraseña']);

            if (matchCliente) {
                delete cliente['contraseña'];
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
 * @throws {400} Si faltan campos obligatorios o el usuario es menor de 16 años.
 * @throws {409} Si el DNI ya está registrado en alguna tabla.
 * @throws {500} Si ocurre un error interno en el servidor.
 */
const registrar = async (req, res) => {
    // Se agrega nombreEmprendimiento a la desestructuración
    const { nombre, apellido, DNI, fecha_nacimiento, email, contraseña, id_rol, nombreEmprendimiento, reseña } = req.body;

    // 1. Validación de campos obligatorios
    if (!nombre || !apellido || !DNI || !fecha_nacimiento || !email || !contraseña || !id_rol) {
        return res.status(400).json({ message: "Debe completar todos los campos del formulario." });
    }

    // Solo se puede registrar como Emprendedor (2) o Cliente (3), nunca como Administrador.
    // Antes, con otro valor la request quedaba colgada sin respuesta.
    if (![2, 3].includes(parseInt(id_rol))) {
        return res.status(400).json({ message: "Tipo de cuenta inválido." });
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
            await pool.query(`
                    INSERT INTO Usuario (nombre, apellido, "DNI", fecha_nacimiento, email, "contraseña", id_rol, id_estado, "nombreEmprendimiento", "reseña")
                    VALUES ($1, $2, $3, $4, $5, $6, 2, 2, $7, $8)
                `, [nombre, apellido, DNI, fecha_nacimiento, email, hash, nombreEmprendimiento || '', reseña || '']);

            return res.status(201).json({ message: "Registro exitoso. Su solicitud de emprendedor está siendo revisada." });

        } else if (parseInt(id_rol) === 3) {
            // CLIENTE → Tabla Cliente
            await pool.query(`
                    INSERT INTO Cliente (nombre, apellido, "DNI", fecha_nacimiento, email, "contraseña")
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [nombre, apellido, DNI, fecha_nacimiento, email, hash]);

            return res.status(201).json({ message: "Registro exitoso. ¡Bienvenido a la tienda!" });
        }

    } catch (error) {
        responderErrorInterno(res, error, 'registrar');
    }
};

module.exports = { iniciarSesion, registrar };