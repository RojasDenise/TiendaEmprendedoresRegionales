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
        
        const resultUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_usuario, apellidoNombre, [contraseña], id_rol, id_estado FROM Usuario WHERE email = @email');

        if (resultUser.recordset.length > 0) {
            const user = resultUser.recordset[0];
            const match = await bcrypt.compare(contraseña, user['contraseña']);

            if (match) {
                if (user.id_rol !== 1 && user.id_estado !== 1) {
                    return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
                }
                delete user['contraseña'];
                return res.json({ message: "Bienvenido", user });
            }
        }

        const resultCliente = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_cliente, apellidoNombre, [contraseña] FROM Cliente WHERE email = @email');

        if (resultCliente.recordset.length > 0) {
            const cliente = resultCliente.recordset[0];
            const matchCliente = await bcrypt.compare(contraseña, cliente['contraseña']);

            if (matchCliente) {
                delete cliente['contraseña'];
                return res.json({ message: "Bienvenido Cliente", user: cliente });
            }
        }

        res.status(401).json({ message: "Credenciales incorrectas." });

    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ error: "Error de servidor: " + error.message });
    }
};

const register = async (req, res) => {
    const { apellidoNombre, DNI, fecha_nacimiento, email, contraseña, id_rol } = req.body;

    if (!apellidoNombre || !DNI || !fecha_nacimiento || !email || !contraseña || !id_rol) {
        return res.status(400).json({ message: "Complete todos los campos." });
    }

    try {
        const pool = await getConnection();

        // Verificar si el email ya existe en Usuario
        const existeUsuario = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_usuario FROM Usuario WHERE email = @email');

        // Verificar si el email ya existe en Cliente
        const existeCliente = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_cliente FROM Cliente WHERE email = @email');

        if (existeUsuario.recordset.length > 0 || existeCliente.recordset.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado." });
        }

        const hash = await bcrypt.hash(contraseña, 10);

        // id_rol 2 = Emprendedor (va a Usuario con estado 2 = Pendiente)
        // id_rol 3 = Cliente (va a tabla Cliente)
        if (parseInt(id_rol) === 2) {
            await pool.request()
                .input('apellidoNombre', sql.VarChar(100), apellidoNombre)
                .input('DNI', sql.VarChar(20), DNI)
                .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar(100), email)
                .input('contraseña', sql.VarChar(255), hash)
                .input('id_rol', sql.Int, 2)
                .input('id_estado', sql.Int, 2) // Pendiente de aprobación
                .query(`
                    INSERT INTO Usuario (apellidoNombre, DNI, fecha_nacimiento, email, [contraseña], id_rol, id_estado)
                    VALUES (@apellidoNombre, @DNI, @fecha_nacimiento, @email, @contraseña, @id_rol, @id_estado)
                `);

            return res.status(201).json({ message: "Registro exitoso. Tu cuenta está pendiente de aprobación." });

        } else {
            // Cliente
            await pool.request()
                .input('apellidoNombre', sql.VarChar(100), apellidoNombre)
                .input('DNI', sql.VarChar(20), DNI)
                .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar(100), email)
                .input('contraseña', sql.VarChar(255), hash)
                .query(`
                    INSERT INTO Cliente (apellidoNombre, DNI, fecha_nacimiento, email, [contraseña])
                    VALUES (@apellidoNombre, @DNI, @fecha_nacimiento, @email, @contraseña)
                `);

            return res.status(201).json({ message: "Registro exitoso. Ya podés iniciar sesión." });
        }

    } catch (error) {
        console.error("Error en register:", error.message);
        res.status(500).json({ error: "Error de servidor: " + error.message });
    }
};

module.exports = { login, register };