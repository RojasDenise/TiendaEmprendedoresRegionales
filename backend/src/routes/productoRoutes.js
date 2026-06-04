const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const multer = require('multer');
const path = require('path');

/**
 * @fileoverview Rutas para la gestión de productos.
 * Define los endpoints CRUD de productos, incluyendo soporte para
 * carga de imágenes con Multer, eliminación lógica y restauración.
 *
 * @module productoRoutes
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Configuración del almacenamiento de imágenes con Multer.
 * Los archivos se guardan en `public/uploads/` con el nombre
 * compuesto por el timestamp actual más la extensión original del archivo.
 *
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

/**
 * Instancia de Multer configurada con el almacenamiento en disco definido.
 * Se utiliza como middleware en las rutas de creación y actualización de productos.
 *
 * @type {multer.Multer}
 */
const upload = multer({ storage });

/**
 * @route GET /api/productos/eliminados
 * @description Retorna todos los productos eliminados lógicamente de un usuario.
 * Debe definirse antes de `GET /:id` para evitar conflictos de rutas.
 * @access Privado
 * @see module:productoController~obtenerProductosEliminados
 */
router.get('/eliminados', productoController.obtenerProductosEliminados);

/**
 * @route PUT /api/productos/:id/restaurar
 * @description Restaura un producto previamente eliminado de forma lógica.
 * @access Privado
 * @param {string} id - ID del producto a restaurar.
 * @see module:productoController~restaurarProducto
 */
router.put('/:id/restaurar', productoController.restaurarProducto);

/**
 * @route GET /api/productos
 * @description Retorna todos los productos activos de un usuario (emprendedor).
 * @access Privado
 * @see module:productoController~obtenerProductos
 */
router.get('/', productoController.obtenerProductos);

/**
 * @route GET /api/productos/:id
 * @description Retorna un producto específico por su ID.
 * @access Privado
 * @param {string} id - ID del producto a buscar.
 * @see module:productoController~obtenerProductoPorId
 */
router.get('/:id', productoController.obtenerProductoPorId);

/**
 * @route POST /api/productos
 * @description Crea un nuevo producto. Acepta una imagen opcional
 * enviada como `multipart/form-data` bajo el campo `imagen`.
 * @access Privado
 * @see module:productoController~crearProducto
 */
router.post('/', upload.single('imagen'), productoController.crearProducto);

/**
 * @route PUT /api/productos/:id
 * @description Actualiza los datos de un producto existente. Acepta una nueva imagen
 * opcional enviada como `multipart/form-data` bajo el campo `imagen`.
 * @access Privado
 * @param {string} id - ID del producto a actualizar.
 * @see module:productoController~actualizarProducto
 */
router.put('/:id', upload.single('imagen'), productoController.actualizarProducto);

/**
 * @route DELETE /api/productos/:id
 * @description Elimina lógicamente un producto por su ID.
 * @access Privado
 * @param {string} id - ID del producto a eliminar.
 * @see module:productoController~eliminarProducto
 */
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;