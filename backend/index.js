require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getConnection } = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');

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
const carritoRoutes    = require('./src/routes/carritoRoutes');
const clienteRoutes    = require('./src/routes/clienteRoutes');

const app = express();
const esProduccion = process.env.NODE_ENV === 'production';

// En producción el backend corre detrás de un proxy (Render, Railway...).
// Esto hace que el rate limit use la IP real del usuario y no la del proxy.
if (esProduccion) {
    app.set('trust proxy', 1);
}

// Orígenes que pueden llamar a la API. FRONTEND_URL acepta varios separados por coma.
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

// 2. Middlewares Globales

// Headers de seguridad. crossOriginResourcePolicy en 'cross-origin' porque
// el frontend (otro dominio) necesita mostrar las imágenes de /uploads.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
    origin: origenesPermitidos,
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, 'public'), {
    index: false,
    dotfiles: 'ignore',
}));

// Límite general para toda la API: frena abusos sin afectar el uso normal.
const limiteGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Demasiadas solicitudes. Esperá unos minutos y volvé a intentar.' },
});

// Límite estricto para login y registro: evita probar contraseñas por fuerza bruta.
const limiteAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Demasiados intentos. Esperá 15 minutos y volvé a intentar.' },
});

app.use('/api', limiteGeneral);

// 3. Rutas de Diagnóstico
app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Emprendedores funcionando correctamente.');
});

app.get('/api/ping', (req, res) => {
    res.json({ mensaje: 'API escuchando correctamente', timestamp: new Date() });
});

// 4. Rutas de la Aplicación
app.use('/api/auth',         limiteAuth, authRoutes);
app.use('/api/usuarios',     usuarioRoutes);
app.use('/api/productos',    productoRoutes);
app.use('/api/categorias',   categoriaRoutes);
app.use('/api/facturas',     facturaRoutes);
app.use('/api/reclamos',     reclamoRoutes);
app.use('/api/valoraciones', valoracionRoutes);
app.use('/api/carrito',      carritoRoutes);
app.use('/api/clientes',     clienteRoutes);

// 5. Manejo de Rutas no Encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
    });
});

// 6. Manejo global de errores (debe ir al final)
app.use(errorHandler);

// 7. Arranque del Servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log('==============================================');
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log(`Orígenes permitidos (CORS): ${origenesPermitidos.join(', ')}`);

    try {
        await getConnection();
        console.log('Conexión exitosa a PostgreSQL');
    } catch (error) {
        console.error('Error crítico de conexión a la BD:', error.message);
    }

    console.log('==============================================');
});
