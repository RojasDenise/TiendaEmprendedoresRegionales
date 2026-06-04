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
 * Incluye categoría, estado y nombre del emprendimiento mediante JOINs.
 *
 * @async
 * @function obtenerProductos
 * @param {number|null} [id_usuario=null] - ID del usuario para filtrar.
 * @returns {Promise<Object[]>} Lista de productos activos.
 */
const obtenerProductos = async (id_usuario = null) => {
  const pool = await getConnection();
  const request = pool.request();
  
  let query = `
    SELECT p.*, 
           c.descripcion AS categoria_nombre, 
           ep.descripcion AS estado_nombre,
           u.apellidoNombre AS nombre_usuario,
           u.nombreEmprendimiento
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Estado_Producto ep ON p.id_estado_prod = ep.id_estado_prod
    LEFT JOIN Usuario u ON p.id_usuario = u.id_usuario
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
 *
 * @async
 * @function obtenerProductosEliminados
 * @param {number|null} [id_usuario=null] - ID del usuario para filtrar.
 * @returns {Promise<Object[]>} Lista de productos eliminados.
 */
const obtenerProductosEliminados = async (id_usuario = null) => {
  const pool = await getConnection();
  const request = pool.request();

  let query = `
    SELECT p.*, 
           c.descripcion AS categoria_nombre,
           u.nombreEmprendimiento
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN Usuario u ON p.id_usuario = u.id_usuario
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
 * Incluye categoría, estado y datos del emprendedor mediante JOINs.
 *
 * @async
 * @function obtenerProductoPorId
 * @param {number|string} id - ID del producto a buscar.
 * @returns {Promise<Object|null>} El producto encontrado, o null si no existe.
 */
const obtenerProductoPorId = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query(`
      SELECT p.*, 
             c.descripcion AS categoria_nombre, 
             ep.descripcion AS estado_nombre,
             u.apellidoNombre AS nombre_usuario,
             u.nombreEmprendimiento
      FROM Producto p
      JOIN Categoria c ON p.id_categoria = c.id_categoria
      JOIN Estado_Producto ep ON p.id_estado_prod = ep.id_estado_prod
      LEFT JOIN Usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_producto = @id AND p.id_estado_prod = 1
    `);
  return result.recordset[0] || null;
};

/**
 * Inserta un nuevo producto en la base de datos con estado activo (id_estado_prod = 1).
 *
 * @async
 * @function crearProducto
 * @param {Object} producto - Datos del producto a crear.
 * @returns {Promise<Object>} El producto recién insertado.
 */
const crearProducto = async ({ nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen }) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.VarChar(200), nombre)
    .input('descripcion', sql.VarChar(sql.MAX), descripcion)
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
 *
 * @async
 * @function actualizarProducto
 * @param {number|string} id - ID del producto a actualizar.
 * @param {Object} datos - Nuevos datos del producto.
 * @returns {Promise<Object|undefined>} El producto actualizado.
 */
const actualizarProducto = async (id, { nombre, descripcion, precio, stock, id_categoria, imagen }) => {
  const pool = await getConnection();
  const request = pool.request();

  request.input('id', sql.Int, parseInt(id));
  request.input('nombre', sql.VarChar(200), nombre);
  request.input('descripcion', sql.VarChar(sql.MAX), descripcion);
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
 *
 * @async
 * @function eliminarProducto
 * @param {number|string} id - ID del producto a eliminar.
 * @returns {Promise<boolean>}
 */
const eliminarProducto = async (id) => {
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
 * @function restaurarProducto
 * @param {number|string} id - ID del producto a restaurar.
 * @returns {Promise<boolean>}
 */
const restaurarProducto = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query('UPDATE Producto SET id_estado_prod = 1 WHERE id_producto = @id');
  return result.rowsAffected[0] > 0;
};

module.exports = { 
  obtenerProductos,
  obtenerProductosEliminados,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  restaurarProducto
};