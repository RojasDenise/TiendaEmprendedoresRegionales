const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
},
filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
}
});
const upload = multer({ storage });

// eliminados DEBE ir antes de /:id para evitar conflictos
router.get('/eliminados', productoController.getDeletedProducts);
router.put('/:id/restaurar', productoController.restoreProduct);

router.get('/', productoController.getProducts);
router.get('/:id', productoController.getProductById);
router.post('/', upload.single('imagen'), productoController.createProduct);
router.put('/:id', upload.single('imagen'), productoController.updateProduct);
router.delete('/:id', productoController.deleteProduct);

module.exports = router;