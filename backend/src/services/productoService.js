const sql = require('mssql');
const { getConnection } = require('../config/db');

/**
 * @fileoverview Servicio de productos.
 * Contiene la lógica de acceso a datos para la tabla `Producto`,
 * incluyendo consultas con JOINs, eliminación lógica y restauración.
 *
 * @module productoService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Obtiene todos los productos activos (id_estado_prod = 1).
 * Si se proporciona un id_usuario, filtra los productos de ese emprendedor.
 * Incluye el nombre de la categoría y el nombre del estado del producto mediante JOINs.
 * Los resultados se ordenan por id_producto de forma descendente.
 *
 * @async
 * @function getProducts
 * @param {number|null} [id_usuario=null] - ID del usuario (emprendedor) para filtrar. Si es null, retorna todos los productos activos.
 * @returns {Promise<Object[]>} Lista de productos activos con categoría y estado incluidos.
 */
const getProducts = async (id_usuario = null) => {
  const pool = await getConnection();
  const request = pool.request();
  
  let query = `
    SELECT p.*, c.descripcion AS categoria_nombre, ep.descripcion AS estado_nombre
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Estado_Producto ep ON p.id_estado_prod = ep.id_estado_prod
    WHERE p.id_estado_prod = 1
  `;

  if (id_usuario) {
    request.input('id_usuario', sql.Int, parseInt(id_usuario));
    query += ' AND p.id_usuario = @id_usuario';
  }

  query += ' ORDER BY p.id_producto DESC';
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Obtiene todos los productos eliminados lógicamente (id_estado_prod = 2).
 * Si se proporciona un id_usuario, filtra los productos de ese emprendedor.
 * Incluye el nombre de la categoría mediante JOIN.
 * Los resultados se ordenan por id_producto de forma descendente.
 *
 * @async
 * @function getDeletedProducts
 * @param {number|null} [id_usuario=null] - ID del usuario (emprendedor) para filtrar. Si es null, retorna todos los productos eliminados.
 * @returns {Promise<Object[]>} Lista de productos eliminados con categoría incluida.
 */
const getDeletedProducts = async (id_usuario = null) => {
  const pool = await getConnection();
  const request = pool.request();

  let query = `
    SELECT p.*, c.descripcion AS categoria_nombre
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    WHERE p.id_estado_prod = 2
  `;

  if (id_usuario) {
    request.input('id_usuario', sql.Int, parseInt(id_usuario));
    query += ' AND p.id_usuario = @id_usuario';
  }

  query += ' ORDER BY p.id_producto DESC';
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Obtiene un producto activo por su ID.
 * Solo retorna el producto si su id_estado_prod es 1 (activo).
 * Incluye el nombre de la categoría y el nombre del estado mediante JOINs.
 *
 * @async
 * @function getProductById
 * @param {number|string} id - ID del producto a buscar.
 * @returns {Promise<Object|null>} El producto encontrado, o null si no existe o está eliminado.
 */
const getProductById = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query(`
      SELECT p.*, c.descripcion AS categoria_nombre, ep.descripcion AS estado_nombre
      FROM Producto p
      JOIN Categoria c ON p.id_categoria = c.id_categoria
      JOIN Estado_Producto ep ON p.id_estado_prod = ep.id_estado_prod
      WHERE p.id_producto = @id AND p.id_estado_prod = 1
    `);
  return result.recordset[0] || null;
};

/**
 * Inserta un nuevo producto en la base de datos con estado activo (id_estado_prod = 1).
 * Utiliza OUTPUT INSERTED.* para retornar el registro recién creado.
 *
 * @async
 * @function createProduct
 * @param {Object} producto - Datos del producto a crear.
 * @param {string} producto.nombre - Nombre del producto (máx. 50 caracteres).
 * @param {string} producto.descripcion - Descripción del producto (máx. 200 caracteres).
 * @param {number} producto.precio - Precio del producto (decimal, 10 enteros y 2 decimales).
 * @param {number} producto.stock - Cantidad disponible en stock.
 * @param {number} producto.id_categoria - ID de la categoría asociada.
 * @param {number} producto.id_usuario - ID del emprendedor dueño del producto.
 * @param {string|null} producto.imagen - Nombre del archivo de imagen, o null si no se subió.
 * @returns {Promise<Object>} El producto recién insertado con todos sus campos.
 */
const createProduct = async ({ nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen }) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.VarChar(50), nombre)
    .input('descripcion', sql.VarChar(200), descripcion)  // ✅ corregido
    .input('precio', sql.Decimal(10, 2), precio)
    .input('stock', sql.Int, stock)
    .input('id_categoria', sql.Int, id_categoria)
    .input('id_usuario', sql.Int, id_usuario)
    .input('estado', sql.Int, 1)
    .input('imagen', sql.VarChar(255), imagen)
    .query(`
      INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_usuario, id_estado_prod, imagen)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, @precio, @stock, @id_categoria, @id_usuario, @estado, @imagen)
    `);
  return result.recordset[0];
};

/**
 * Actualiza los datos de un producto existente.
 * Si se proporciona una nueva imagen, se incluye en la actualización;
 * de lo contrario, el campo imagen no se modifica.
 * Retorna el producto actualizado mediante un SELECT posterior al UPDATE.
 *
 * @async
 * @function updateProduct
 * @param {number|string} id - ID del producto a actualizar.
 * @param {Object} datos - Nuevos datos del producto.
 * @param {string} datos.nombre - Nuevo nombre del producto (máx. 50 caracteres).
 * @param {string} datos.descripcion - Nueva descripción (máx. 200 caracteres).
 * @param {number} datos.precio - Nuevo precio (decimal, 10 enteros y 2 decimales).
 * @param {number} datos.stock - Nuevo stock disponible.
 * @param {number} datos.id_categoria - Nueva categoría del producto.
 * @param {string|undefined} datos.imagen - Nombre del nuevo archivo de imagen, o undefined si no se cambió.
 * @returns {Promise<Object|undefined>} El producto actualizado, o undefined si no se encontró.
 */
const updateProduct = async (id, { nombre, descripcion, precio, stock, id_categoria, imagen }) => {
  const pool = await getConnection();
  const request = pool.request();

  request.input('id', sql.Int, parseInt(id));
  request.input('nombre', sql.VarChar(50), nombre);
  request.input('descripcion', sql.VarChar(200), descripcion);  // ✅ corregido
  request.input('precio', sql.Decimal(10, 2), precio);
  request.input('stock', sql.Int, stock);
  request.input('id_categoria', sql.Int, id_categoria);

  let queryImagen = "";
  if (imagen) {
    request.input('imagen', sql.VarChar(255), imagen);
    queryImagen = ", imagen = @imagen";
  }

  const result = await request.query(`
    UPDATE Producto 
    SET nombre = @nombre, 
        descripcion = @descripcion, 
        precio = @precio, 
        stock = @stock, 
        id_categoria = @id_categoria
        ${queryImagen}
    WHERE id_producto = @id;
    
    SELECT * FROM Producto WHERE id_producto = @id;
  `);
  
  return result.recordset[0];
};

/**
 * Elimina lógicamente un producto cambiando su id_estado_prod a 2.
 * No borra el registro de la base de datos.
 *
 * @async
 * @function deleteProduct
 * @param {number|string} id - ID del producto a eliminar.
 * @returns {Promise<boolean>} true si se afectó al menos una fila, false si no se encontró el producto.
 */
const deleteProduct = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query('UPDATE Producto SET id_estado_prod = 2 WHERE id_producto = @id');
  return result.rowsAffected[0] > 0;
};

/**
 * Restaura un producto eliminado lógicamente cambiando su id_estado_prod a 1.
 *
 * @async
 * @function restoreProduct
 * @param {number|string} id - ID del producto a restaurar.
 * @returns {Promise<boolean>} true si se afectó al menos una fila, false si no se encontró el producto.
 */
const restoreProduct = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query('UPDATE Producto SET id_estado_prod = 1 WHERE id_producto = @id');
  return result.rowsAffected[0] > 0;
};

module.exports = { 
  getProducts,
  getDeletedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct
};