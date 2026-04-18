const express = require('express');
const cors = require('cors');
const { getConnection } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// 1. Configuración de Middlewares
app.use(cors());
app.use(express.json());

// 2. Ruta de prueba rápida para descartar errores
app.post('/api/test', (req, res) => {
    res.json({ message: "¡Servidor encendido y respondiendo!" });
});

// 3. Rutas de la Aplicación
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Emprendedores funcionando');
});

// 4. Encendido del Servidor (Puerto 5000)
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==========================================`);
    console.log(`SERVIDOR ESCUCHANDO EN EL PUERTO: ${PORT}`);
    console.log(`Rutas: /api/auth/register, /api/auth/login`);
    console.log(`==========================================\n`);
    
    // Intentar conectar a la DB sin que bloquee el servidor
    getConnection()
        .then(() => console.log(" SQL Server conectado correctamente"))
        .catch(err => console.log(" Error de conexión DB:", err.message));
});