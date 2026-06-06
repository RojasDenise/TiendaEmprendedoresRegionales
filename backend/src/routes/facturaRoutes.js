const express = require('express');
const router  = express.Router();
const { obtenerFacturasCliente } = require('../controllers/facturaController');

// GET /api/facturas/cliente/:id_cliente
router.get('/cliente/:id_cliente', obtenerFacturasCliente);

module.exports = router;