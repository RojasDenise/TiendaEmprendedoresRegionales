const { getConnection } = require('../config/db');
const sql = require('mssql');
const bcrypt = require('bcrypt');

/**
 * AUTH CONTROLADOR: Centraliza la Seguridad, Validación y Encriptación
 */

// --- 1. FUNCIÓN DE REGISTRO
const register = async (req, res) => {
    const { apellidoNombre, DNI, fecha_nacimiento, email, contraseña, id_rol } = req.body;

    // --- BLOQUE DE VALIDACIONES ---
    if (!apellidoNombre || !DNI || !email || !contraseña) {
        return res.status(400).json({ message: "Error: Todos los campos son obligatorios." });
    }

    const dniStr = DNI.toString();
    if (isNaN(DNI) || dniStr.length !== 8) {
        return res.status(400).json({ message: "El DNI debe ser un número de exactamente 8 dígitos." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El formato de correo electrónico no es válido." });
    }

    if (contraseña.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const pool = await getConnection();

        // --- ENCRIPTACIÓN DE CONTRASEÑA ---
        const saltRounds = 10;
        const contraseñaEncriptada = await bcrypt.hash(contraseña, saltRounds);

        if (id_rol) { 
            // Lógica de Estado: Admin (1) -> Activo (1) | Emprendedor (2) -> Pendiente (2)
            const estadoInicial = (id_rol === 1) ? 1 : 2; 

            // Tabla Usuario (Admin o Emprendedor)
            await pool.request()
                .input('nombre', sql.VarChar, apellidoNombre)
                .input('dni', sql.Int, DNI)
                .input('fecha', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar, email)
                .input('pass', sql.VarChar, contraseñaEncriptada) // Guardamos el Hash
                .input('rol', sql.Int, id_rol)
                .input('estado', sql.Int, estadoInicial) 
                .query(`INSERT INTO Usuario (apellidoNombre, DNI, fecha_nacimiento, email, contraseña, id_rol, id_estado) 
                        VALUES (@nombre, @dni, @fecha, @email, @pass, @rol, @estado)`);
            
            const responseMsg = (id_rol === 1) 
                ? "Administrador registrado correctamente y activo." 
                : "Registro exitoso. Su cuenta de emprendedor aguarda aprobación.";

            res.status(201).json({ message: responseMsg });

        } else {
            // Tabla Cliente
            await pool.request()
                .input('nombre', sql.VarChar, apellidoNombre)
                .input('dni', sql.Int, DNI)
                .input('fecha', sql.Date, fecha_nacimiento)
                .input('email', sql.VarChar, email)
                .input('pass', sql.VarChar, contraseñaEncriptada) // Guardamos el Hash
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
        
        // 1. Verificar en tabla Usuario (Buscamos por email solamente)
        const resultUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_usuario, apellidoNombre, contraseña, id_rol, id_estado FROM Usuario WHERE email = @email');

        if (resultUser.recordset.length > 0) {
            const user = resultUser.recordset[0];
            
            // COMPARAR CLAVE ENCRIPTADA
            const match = await bcrypt.compare(contraseña, user.contraseña);

            if (match) {
                // Verificar estado solo si NO es Admin
                if (user.id_rol !== 1 && user.id_estado === 2) {
                    return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
                }
                
                
                delete user.contraseña;
                return res.json({ message: "Bienvenido Emprendedor/Admin", user });
            }
        }

        // 2. Verificar en tabla Cliente (Si no se encontró en Usuario o la clave no dio match)
        const resultCliente = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id_cliente, apellidoNombre, contraseña FROM Cliente WHERE email = @email');

        if (resultCliente.recordset.length > 0) {
            const cliente = resultCliente.recordset[0];
            
            // COMPARAR CLAVE ENCRIPTADA
            const matchCliente = await bcrypt.compare(contraseña, cliente.contraseña);

            if (matchCliente) {
                delete cliente.contraseña;
                return res.json({ message: "Bienvenido Cliente", user: cliente });
            }
        }

        res.status(401).json({ message: "Credenciales incorrectas." });

    } catch (error) {
        res.status(500).json({ error: "Error de servidor: " + error.message });
    }
};

module.exports = { register, login };