const sql = require('mssql');
const { getConnection } = require('../config/db');

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

const createProduct = async ({ nombre, descripcion, precio, stock, id_categoria, id_usuario }) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.VarChar(50), nombre)
    .input('descripcion', sql.Text, descripcion)
    .input('precio', sql.Decimal(10, 2), precio)
    .input('stock', sql.Int, stock)
    .input('id_categoria', sql.Int, id_categoria)
    .input('id_usuario', sql.Int, id_usuario)
    .input('estado', sql.Int, 1)
    .query(`
      INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_usuario, id_estado_prod)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, @precio, @stock, @id_categoria, @id_usuario, @estado)
    `);
  return result.recordset[0];
};

const updateProduct = async (id, { nombre, descripcion, precio, stock, id_categoria }) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .input('nombre', sql.VarChar(50), nombre)
    .input('descripcion', sql.Text, descripcion)
    .input('precio', sql.Decimal(10, 2), precio)
    .input('stock', sql.Int, stock)
    .input('id_categoria', sql.Int, id_categoria)
    .query(`
      UPDATE Producto
      SET nombre = @nombre, descripcion = @descripcion,
          precio = @precio, stock = @stock, id_categoria = @id_categoria
      WHERE id_producto = @id AND id_estado_prod = 1
    `);
  return result.rowsAffected[0] > 0;
};

const deleteProduct = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query('UPDATE Producto SET id_estado_prod = 2 WHERE id_producto = @id');
  return result.rowsAffected[0] > 0;
};

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