const login = async (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        return res.status(400).json({ message: "Ingrese credenciales completas." });
    }

    try {
        const pool = await getConnection();
        
        // 1. Buscamos en Usuario
        const resultUser = await pool.request()
            .input('email', sql.VarChar, email)
            // IMPORTANTE: Usamos [contraseña] con corchetes por la Ñ
            .query('SELECT id_usuario, apellidoNombre, [contraseña], id_rol, id_estado FROM Usuario WHERE email = @email');

        if (resultUser.recordset.length > 0) {
            const user = resultUser.recordset[0];
            
            // Comparamos usando el nombre exacto de la base de datos
            const match = await bcrypt.compare(contraseña, user['contraseña']);

            if (match) {
                // Si es emprendedor (rol 2), checkeamos que esté aprobado (estado 1)
                if (user.id_rol !== 1 && user.id_estado !== 1) {
                    return res.status(403).json({ message: "Acceso denegado: cuenta pendiente de aprobación." });
                }
                
                delete user['contraseña']; // Quitamos la clave de la respuesta por seguridad
                return res.json({ message: "Bienvenido", user });
            }
        }
        
        // ... justo después de la línea del query de Usuario:
console.log("------------------------------------------");
console.log("Intentando login para:", email);
console.log("¿Usuario encontrado en BD?:", resultUser.recordset.length > 0);
if (resultUser.recordset.length > 0) {
    console.log("Hash recuperado:", resultUser.recordset[0]['contraseña']);
}
console.log("------------------------------------------");
        // 2. Si no es usuario, buscamos en Cliente
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