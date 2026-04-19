const express = require('express');
const cors = require('cors');
const { getConnection } = require('./src/config/db');

// 1. Importación de los Routers (Tus rutas + las de Denise)
const productoRoutes = require('./src/routes/productoRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta 'public'

// 2. Middlewares Globales
app.use(cors());
app.use(express.json());

// 3. Rutas de Prueba y Diagnóstico
app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Emprendedores funcionando correctamente.');
});

app.get('/api/ping', (req, res) => {
    res.json({ mensaje: "API escuchando correctamente", timestamp: new Date() });
});

app.post('/api/test', (req, res) => {
    res.json({ message: "¡Servidor encendido y respondiendo!" });
});

// 4. Registro de Rutas de la Aplicación
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);

// 5. Manejo de Rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ 
        error: "Ruta no encontrada", 
        path: req.originalUrl 
    });
});

// 6. Configuración del Puerto y Arranque
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log('==============================================');
    console.log(`🚀 Servidor iniciado en: http://localhost:${PORT}`);
    
    try {
        await getConnection();
        console.log('✅ Conexión exitosa a SQL Server');
    } catch (error) {
        console.error('❌ Error crítico de conexión a la BD:', error.message);
    }
    console.log('==============================================');
    console.log(`Rutas listas: /api/productos, /api/categorias, /api/auth`);
});