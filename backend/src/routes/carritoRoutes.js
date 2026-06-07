const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.get('/', carritoController.obtenerCarrito);

router.post('/agregar', carritoController.agregarAlCarrito);

router.delete('/item/:id', carritoController.quitarDelCarrito);

router.post('/confirmar', carritoController.confirmarCompra);

module.exports = router;