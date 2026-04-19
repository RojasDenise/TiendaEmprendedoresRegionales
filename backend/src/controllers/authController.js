const { getConnection } = require('../config/db');
const sql = require('mssql');

/**
 * AUTH CONTROLADOR: Centraliza la Seguridad y Validación
 */

// --- 1. FUNCIÓN DE REGISTRO
const register = async (req, res) => {
    const { apellidoNombre, DNI, fecha_nacimiento, email, contraseña, id_rol } = req.body;

    // --- BLOQUE DE VALIDACIONES
    // Validar campos obligatorios 
    if (!apellidoNombre || !DNI || !email || !contraseña) {
        return res.status(400).json({ message: "Error: Todos los campos son obligatorios." });
    }

    // Validar DNI: exactamente 8 dígitos
    const dniStr = DNI.toString();
    if (isNaN(DNI) || dniStr.length !== 8) {
        return res.status(400).json({ message: "El DNI debe ser un número de exactamente 8 dígitos." });
    }

    // Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El formato de correo electrónico no es válido." });
    }

    // Validar Contraseña (mínimo 6 caracteres)
    if (contraseña.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const pool = await getConnection();

        if (id_rol) { 
            //Tabla Usuario EMPRENDEDOR 
            await pool.request()
                .input('nombre', sql.VarChar, apellidoNombre)
                .input('dni', sql.Int, DNI)
                .input('fecha', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar, email)
                .input('pass', sql.VarChar, contraseña)
                .input('rol', sql.Int, id_rol)
                .input('estado', sql.Int, 2) // 2 = Pendiente
                .query(`INSERT INTO Usuario (apellidoNombre, DNI, fecha_nacimiento, email, contraseña, id_rol, id_estado) 
                        VALUES (@nombre, @dni, @fecha, @email, @pass, @rol, @estado)`);
            
            res.status(201).json({ message: "Registro exitoso. Su cuenta de emprendedor aguarda aprobación." });
        } else {
            //Tabla Cliente 
            await pool.request()
                .input('nombre', sql.VarChar, apellidoNombre)
                .input('dni', sql.Int, DNI)
                .input('fecha', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar, email)
                .input('pass', sql.VarChar, contraseña)
                .query(`INSERT INTO Cliente (apellidoNombre, DNI, fecha_nacimiento, email, contraseña) 
                        VALUES (@nombre, @dni, @fecha, @email, @pass)`);
            
            res.status(201).json({ message: "Cliente registrado con éxito." });
        }
    } catch (error) {
        if (error.number === 2627) { 
            return res.status(400).json({ message: "El Email o DNI ya se encuentra registrado." });
        }
        res.status(500).json({ error: "Error interno: " + error.message });
    }
};

// --- 2. FUNCIÓN DE LOGIN
const login = async (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        return res.status(400).json({ message: "Ingrese credenciales completas." });
    }

    try {
        const pool = await getConnection();
        
        // 1. Verificar en tabla Usuario
        const resultUser = await pool.request()
            .input('email', sql.VarChar, email)
            .input('pass', sql.VarChar, contraseña)
            .query('SELECT id_usuario, apellidoNombre, id_rol, id_estado FROM Usuario WHERE email = @email AND contraseña = @pass');

        if (resultUser.recordset.length > 0) {
            const user = resultUser.recordset[0];
            if (user.id_estado === 2) {
                return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
            }
            return res.json({ message: "Bienvenido Emprendedor/Admin", user });
        }

        // 2. Verificar en tabla Cliente
        const resultCliente = await pool.request()
            .input('email', sql.VarChar, email)
            .input('pass', sql.VarChar, contraseña)
            .query('SELECT id_cliente, apellidoNombre FROM Cliente WHERE email = @email AND contraseña = @pass');

        if (resultCliente.recordset.length > 0) {
            return res.json({ message: "Bienvenido Cliente", user: resultCliente.recordset[0] });
        }

        res.status(401).json({ message: "Credenciales incorrectas." });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor: " + error.message });
    }
};

module.exports = { register, login };