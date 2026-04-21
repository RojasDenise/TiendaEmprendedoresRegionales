const productoService = require('../services/productoService');

/**
 * @fileoverview Controlador de productos.
 * Gestiona las operaciones CRUD sobre productos, incluyendo
 * soporte para eliminación lógica, restauración y carga de imágenes.
 *
 * @module productoController
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Obtiene todos los productos activos de un usuario (emprendedor).
 *
 * @async
 * @function getProducts
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.query - Parámetros de consulta.
 * @param {string} req.query.id_usuario - ID del usuario dueño de los productos.
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Lista de productos activos en formato JSON.
 *
 * @throws {500} Si ocurre un error al consultar la base de datos.
 */
const getProducts = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    const productos = await productoService.getProducts(id_usuario);
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

/**
 * Obtiene todos los productos eliminados (lógicamente) de un usuario.
 *
 * @async
 * @function getDeletedProducts
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.query - Parámetros de consulta.
 * @param {string} req.query.id_usuario - ID del usuario dueño de los productos eliminados.
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Lista de productos eliminados en formato JSON.
 *
 * @throws {500} Si ocurre un error al consultar la base de datos.
 */
const getDeletedProducts = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    const productos = await productoService.getDeletedProducts(id_usuario);
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos eliminados' });
  }
};

/**
 * Obtiene un producto específico por su ID.
 *
 * @async
 * @function getProductById
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - ID del producto a buscar.
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Objeto del producto en formato JSON.
 *
 * @throws {404} Si no existe un producto con el ID indicado.
 * @throws {500} Si ocurre un error al consultar la base de datos.
 */
const getProductById = async (req, res) => {
  try {
    const producto = await productoService.getProductById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

/**
 * Crea un nuevo producto asociado a un usuario (emprendedor).
 *
 * Valida que todos los campos obligatorios estén presentes y que
 * precio y stock sean valores válidos. Si se adjunta una imagen
 * (via multipart/form-data), se guarda el nombre del archivo.
 *
 * @async
 * @function createProduct
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.nombre - Nombre del producto.
 * @param {string} req.body.descripcion - Descripción del producto.
 * @param {number} req.body.precio - Precio del producto (debe ser mayor a 0).
 * @param {number} req.body.stock - Cantidad en stock (debe ser mayor o igual a 0).
 * @param {number} req.body.id_categoria - ID de la categoría del producto.
 * @param {number} req.body.id_usuario - ID del usuario (emprendedor) dueño del producto.
 * @param {Express.Multer.File} [req.file] - Archivo de imagen subido (opcional).
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Mensaje de éxito y objeto del producto creado.
 *
 *
 * @throws {400} Si faltan campos obligatorios o precio/stock son inválidos.
 * @throws {500} Si ocurre un error al insertar en la base de datos.
 */
const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, id_categoria, id_usuario } = req.body;
    const imagen = req.file ? req.file.filename : null;

    console.log('📦 Body recibido:', req.body);
    console.log('🖼️ Imagen recibida:', req.file);

    if (!nombre || !descripcion || !precio || !stock || !id_categoria || !id_usuario) {
      return res.status(400).json({ message: 'Complete todos los campos' });
    }
    if (precio <= 0 || stock < 0) {
      return res.status(400).json({ message: 'Precio y stock deben ser valores positivos' });
    }

    const nuevo = await productoService.createProduct({ nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen });
    res.status(201).json({ message: 'Producto agregado con éxito', producto: nuevo });
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

/**
 * Actualiza los datos de un producto existente.
 *
 * Valida campos obligatorios y valores de precio/stock antes de actualizar.
 * Si se adjunta una nueva imagen, reemplaza la anterior; si no se envía,
 * el campo imagen se omite de la actualización (queda `undefined`).
 *
 * @async
 * @function updateProduct
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - ID del producto a actualizar.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.nombre - Nuevo nombre del producto.
 * @param {string} req.body.descripcion - Nueva descripción del producto.
 * @param {number} req.body.precio - Nuevo precio (debe ser mayor a 0).
 * @param {number} req.body.stock - Nuevo stock (debe ser mayor o igual a 0).
 * @param {number} req.body.id_categoria - Nueva categoría del producto.
 * @param {Express.Multer.File} [req.file] - Nueva imagen (opcional).
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Mensaje de éxito si el producto fue actualizado.
 *
 *
 * @throws {400} Si faltan campos obligatorios o precio/stock son inválidos.
 * @throws {404} Si no existe un producto con el ID indicado.
 * @throws {500} Si ocurre un error al actualizar en la base de datos.
 */
const updateProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, id_categoria } = req.body;
    const imagen = req.file ? req.file.filename : undefined;

    if (!nombre || !descripcion || !precio || stock === undefined || !id_categoria) {
      return res.status(400).json({ message: 'Complete todos los campos' });
    }
    if (precio <= 0 || stock < 0) {
      return res.status(400).json({ message: 'Precio y stock deben ser valores positivos' });
    }

    const actualizado = await productoService.updateProduct(req.params.id, { nombre, descripcion, precio, stock, id_categoria, imagen });
    if (!actualizado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

/**
 * Elimina lógicamente un producto por su ID.
 *
 * No borra el registro de la base de datos, sino que lo marca
 * como eliminado. Puede ser recuperado posteriormente con `restoreProduct`.
 *
 * @async
 * @function deleteProduct
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - ID del producto a eliminar.
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Mensaje de éxito si el producto fue eliminado.
 *
 * @throws {404} Si no existe un producto con el ID indicado.
 * @throws {500} Si ocurre un error al eliminar en la base de datos.
 */
const deleteProduct = async (req, res) => {
  try {
    const eliminado = await productoService.deleteProduct(req.params.id);
    if (!eliminado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

/**
 * Restaura un producto previamente eliminado de forma lógica.
 *
 * Revierte la eliminación lógica, volviendo a hacer visible
 * el producto en el listado activo del emprendedor.
 *
 * @async
 * @function restoreProduct
 * @param {import('express').Request} req - Request de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - ID del producto a restaurar.
 * @param {import('express').Response} res - Response de Express.
 *
 * @returns {Promise<void>} Mensaje de éxito si el producto fue restaurado.
 *
 *
 * @throws {404} Si no existe un producto con el ID indicado.
 * @throws {500} Si ocurre un error al restaurar en la base de datos.
 */
const restoreProduct = async (req, res) => {
  try {
    const restaurado = await productoService.restoreProduct(req.params.id);
    if (!restaurado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto restaurado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al restaurar producto' });
  }
};

module.exports = { getProducts, getDeletedProducts, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct };