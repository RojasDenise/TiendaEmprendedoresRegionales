const express = require('express');
const cors = require('cors');
const { getConnection } = require('./src/config/db');

/**
 * @fileoverview Punto de entrada principal del servidor.
 * Configura la aplicación Express, middlewares globales, rutas
 * y el arranque del servidor con verificación de conexión a la base de datos.
 *
 * @module app
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

// 1. Importación de los Routers
const productoRoutes = require('./src/routes/productoRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

/**
 * Sirve archivos estáticos (imágenes, CSS, JS del cliente) desde la carpeta `public`.
 * Permite acceder a las imágenes subidas mediante `/uploads/nombre_archivo`.
 */
app.use(express.static('public'));

// 2. Middlewares Globales

/**
 * Habilita CORS para permitir solicitudes desde distintos orígenes.
 * Necesario para que el frontend pueda comunicarse con esta API.
 */
app.use(cors());

/**
 * Permite parsear el cuerpo de las solicitudes entrantes en formato JSON.
 */
app.use(express.json());

// 3. Rutas de Prueba y Diagnóstico

/**
 * @route GET /
 * @description Ruta raíz. Confirma que el servidor está en ejecución.
 * @access Público
 */
app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Emprendedores funcionando correctamente.');
});

/**
 * @route GET /api/ping
 * @description Verifica que la API esté escuchando. Retorna un mensaje y el timestamp actual.
 * @access Público
 */
app.get('/api/ping', (req, res) => {
    res.json({ mensaje: "API escuchando correctamente", timestamp: new Date() });
});

/**
 * @route POST /api/test
 * @description Ruta de prueba para verificar que el servidor responde a solicitudes POST.
 * @access Público
 */
app.post('/api/test', (req, res) => {
    res.json({ message: "¡Servidor encendido y respondiendo!" });
});

// 4. Registro de Rutas de la Aplicación
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);

// 5. Manejo de Rutas no encontradas (404)

/**
 * Middleware de manejo de rutas no encontradas.
 * Se ejecuta cuando ninguna ruta registrada coincide con la solicitud entrante.
 * Retorna un JSON con el error y la ruta que se intentó acceder.
 *
 * @param {import('express').Request} req - Request de Express.
 * @param {import('express').Response} res - Response de Express.
 */
app.use((req, res) => {
    res.status(404).json({ 
        error: "Ruta no encontrada", 
        path: req.originalUrl 
    });
});

// 6. Configuración del Puerto y Arranque

/**
 * Puerto en el que escucha el servidor.
 * Se toma de la variable de entorno PORT, o se usa 5000 por defecto.
 *
 * @type {number|string}
 */
const PORT = process.env.PORT || 5000;

/**
 * Inicia el servidor en el puerto configurado.
 * Al arrancar, verifica la conexión a SQL Server e informa el resultado por consola.
 * Si la conexión falla, registra el error pero el servidor continúa ejecutándose.
 */
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
    console.log(`Rutas listas: /api/productos, /api/categorias, /api/auth`);
});