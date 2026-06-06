const sql = require('mssql');
const { getConnection } = require('../config/db');

const StockObservable = require("../observers/StockObservable");
const EmprendedorObserver = require("../observers/EmprendedorObserver");

const stockObservable = new StockObservable();
stockObservable.agregarObservador(new EmprendedorObserver());

const verificarStock = (producto) => {
  const STOCK_MINIMO = 5;

  if (producto && producto.stock <= STOCK_MINIMO) {
    const mensaje = `Stock bajo: el producto "${producto.nombre}" tiene solo ${producto.stock} unidades disponibles.`;

    stockObservable.notificarObservadores(producto, mensaje);

    return {
      stockBajo: true,
      mensaje
    };
  }

  return {
    stockBajo: false,
    mensaje: null
  };
};
// ====================================================================
// SERVICIOS DE PRODUCTO
// ====================================================================

const obtenerProductos = async (id_usuario = null) => {
  const pool = await getConnection();
  const request = pool.request();

  request.input(
    'id_usuario',
    sql.Int,
    id_usuario ? parseInt(id_usuario) : null
  );

  const result = await request.execute('sp_obtenerProductos');

  return result.recordset;
};

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
    .input('imagen', sql.VarChar(sql.MAX), imagen)
    .query(`
      INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_usuario, id_estado_prod, imagen)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, @precio, @stock, @id_categoria, @id_usuario, @estado, @imagen)
    `);

  const producto = result.recordset[0];

const alertaStock = verificarStock(producto);

return {
  producto,
  alertaStock
};
};

const actualizarProducto = async (
  id,
  { nombre, descripcion, precio, stock, id_categoria, imagen }
) => {

  const pool = await getConnection();

  const result = await pool.request()
    .input('id_producto', sql.Int, parseInt(id))
    .input('nombre', sql.VarChar(50), nombre)
    .input('descripcion', sql.VarChar(sql.MAX), descripcion)
    .input('precio', sql.Decimal(10, 2), parseFloat(precio))
    .input('stock', sql.Int, parseInt(stock))
    .input('id_categoria', sql.Int, parseInt(id_categoria))
    .input('imagen', sql.VarChar(sql.MAX), imagen || null)
    .execute('sp_actualizarProducto');

const producto = result.recordset[0];

const alertaStock = verificarStock(producto);

return {
  producto,
  alertaStock
};
};
const eliminarProducto = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, parseInt(id))
    .query('UPDATE Producto SET id_estado_prod = 2 WHERE id_producto = @id');
  return result.rowsAffected[0] > 0;
};

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