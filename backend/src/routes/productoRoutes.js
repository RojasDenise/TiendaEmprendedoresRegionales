const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getProducts);
router.get('/:id', productoController.getProductById);
router.post('/', productoController.createProduct);
router.put('/:id', productoController.updateProduct);
router.delete('/:id', productoController.deleteProduct);

module.exports = router;