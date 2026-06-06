const express = require('express');
const router  = express.Router();
const { crearValoracion, obtenerValoracionesProducto } = require('../controllers/valoracionController');

// POST /api/valoraciones
router.post('/', crearValoracion);

// GET /api/valoraciones/producto/:id_producto
router.get('/producto/:id_producto', obtenerValoracionesProducto);

module.exports = router;