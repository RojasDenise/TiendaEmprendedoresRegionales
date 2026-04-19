const bcrypt = require('bcrypt');
const sql = require('mssql');
const { getConnection } = require('../config/db');

const login = async (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        return res.status(400).json({ message: "Ingrese credenciales completas." });
    }

    try {
        const pool = await getConnection();
        
        // Buscamos en Usuario 
        const resultUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_usuario, apellidoNombre, [contraseña], id_rol, id_estado FROM Usuario WHERE email = @email');

        if (resultUser.recordset.length > 0) {
            const user = resultUser.recordset[0];
            const match = await bcrypt.compare(contraseña, user['contraseña']);

            if (match) {
                // Solo validamos estado para Emprendedores 
                if (user.id_rol === 2 && user.id_estado !== 1) {
                    return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
                }
                delete user['contraseña'];
                return res.json({ message: "Bienvenido", user });
            }
        }

        // Buscamos en Cliente 
        const resultCliente = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_cliente AS id_usuario, apellidoNombre, [contraseña] FROM Cliente WHERE email = @email');

        if (resultCliente.recordset.length > 0) {
            const cliente = resultCliente.recordset[0];
            const matchCliente = await bcrypt.compare(contraseña, cliente['contraseña']);

            if (matchCliente) {
                delete cliente['contraseña'];
                // De forma virtual asi el front lo reconoce como cliente.
                return res.json({ message: "Bienvenido Cliente", user: { ...cliente, id_rol: 3 } });
            }
        }

        res.status(401).json({ message: "Credenciales incorrectas." });

    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ error: "Error de servidor: " + error.message });
    }
};

const register = async (req, res) => {
    const { apellidoNombre, DNI, fecha_nacimiento, email, contraseña, id_rol, reseña } = req.body;

    // 1. Advertencia de campos obligatorios
    if (!apellidoNombre || !DNI || !fecha_nacimiento || !email || !contraseña || !id_rol) {
        return res.status(400).json({ message: "Debe completar todos los campos del formulario." });
    }

    // 2. Validación de edad
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

        // 3. Filtro por DNI 
        const checkDniU = await pool.request().input('dni', sql.VarChar, DNI).query('SELECT id_usuario FROM Usuario WHERE DNI = @dni');
        const checkDniC = await pool.request().input('dni', sql.VarChar, DNI).query('SELECT id_cliente FROM Cliente WHERE DNI = @dni');

        if (checkDniU.recordset.length > 0 || checkDniC.recordset.length > 0) {
            return res.status(409).json({ message: "El DNI ingresado ya pertenece a una cuenta activa." });
        }

        const hash = await bcrypt.hash(contraseña, 10);

        // LÓGICA DE SEPARACIÓN DE TABLAS
        if (parseInt(id_rol) === 2) {
            // EMPRENDEDOR -> Tabla Usuario 
            await pool.request()
                .input('nombre', sql.VarChar, apellidoNombre)
                .input('dni', sql.VarChar, DNI)
                .input('fecha', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar, email)
                .input('pass', sql.VarChar, hash)
                .input('resena', sql.VarChar, reseña || '')
                .query(`
                    INSERT INTO Usuario (apellidoNombre, DNI, fecha_nacimiento, email, [contraseña], id_rol, id_estado, reseña)
                    VALUES (@nombre, @dni, @fecha, @email, @pass, 2, 2, @resena)
                `);

            return res.status(201).json({ message: "Registro exitoso. Su solicitud de emprendedor está siendo revisada." });

        } else if (parseInt(id_rol) === 3) {
            // CLIENTE -> Tabla Cliente
            await pool.request()
                .input('nombre', sql.VarChar, apellidoNombre)
                .input('dni', sql.VarChar, DNI)
                .input('fecha', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar, email)
                .input('pass', sql.VarChar, hash)
                .query(`
                    INSERT INTO Cliente (apellidoNombre, DNI, fecha_nacimiento, email, [contraseña])
                    VALUES (@nombre, @dni, @fecha, @email, @pass)
                `);

            return res.status(201).json({ message: "Registro exitoso. ¡Bienvenido a la tienda!" });
        }

    } catch (error) {
        console.error("Error en register:", error.message);
        res.status(500).json({ error: "Error interno: " + error.message });
    }
};

module.exports = { login, register };