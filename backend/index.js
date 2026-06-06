const express = require('express');
const cors = require('cors');
const { getConnection } = require('./src/config/db');

/**
 * @fileoverview Punto de entrada principal del servidor.
 * @module app
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

// 1. Importación de los Routers
const authRoutes       = require('./src/routes/authRoutes');
const usuarioRoutes    = require('./src/routes/usuarioRoutes');
const productoRoutes   = require('./src/routes/productoRoutes');
const categoriaRoutes  = require('./src/routes/categoriaRoutes');
const facturaRoutes    = require('./src/routes/facturaRoutes');
const reclamoRoutes    = require('./src/routes/reclamoRoutes');
const valoracionRoutes = require('./src/routes/valoracionRoutes');

const app = express();

// 2. Middlewares Globales
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// 3. Rutas de Diagnóstico
app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Emprendedores funcionando correctamente.');
});

app.get('/api/ping', (req, res) => {
    res.json({ mensaje: "API escuchando correctamente", timestamp: new Date() });
});

app.post('/api/test', (req, res) => {
    res.json({ message: "¡Servidor encendido y respondiendo!" });
});

// 4. Rutas de la Aplicación
app.use('/api/auth',        authRoutes);
app.use('/api/usuarios',    usuarioRoutes);
app.use('/api/productos',   productoRoutes);
app.use('/api/categorias',  categoriaRoutes);
app.use('/api/facturas',    facturaRoutes);
app.use('/api/reclamos',    reclamoRoutes);
app.use('/api/valoraciones', valoracionRoutes);

// 5. Manejo de Rutas no Encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        path: req.originalUrl
    });
});

// 6. Arranque del Servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log('==============================================');
    console.log(`Servidor iniciado en: http://localhost:${PORT}`);

    try {
        await getConnection();
        console.log('Conexión exitosa a SQL Server');
    } catch (error) {
        console.error('Error crítico de conexión a la BD:', error.message);
    }

    console.log('==============================================');
    console.log('Rutas disponibles:');
    console.log('  /api/auth');
    console.log('  /api/usuarios');
    console.log('  /api/productos');
    console.log('  /api/categorias');
    console.log('  /api/facturas');
    console.log('  /api/reclamos');
    console.log('  /api/valoraciones');
    console.log('==============================================');
});