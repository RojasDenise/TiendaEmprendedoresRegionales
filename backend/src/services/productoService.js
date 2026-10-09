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

// Antes era el procedimiento almacenado sp_obtenerProductos.
// Si id_usuario es null trae los productos activos de todos los emprendedores.
const obtenerProductos = async (id_usuario = null) => {
  const pool = await getConnection();

  const result = await pool.query(`
    SELECT
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.imagen,
      p.id_categoria,
      p.id_usuario,
      p.id_estado_prod,
      c.descripcion AS categoria_nombre,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
      u."nombreEmprendimiento"
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN Usuario u ON p.id_usuario = u.id_usuario
    WHERE p.id_estado_prod = 1
      AND ($1::int IS NULL OR p.id_usuario = $1::int)
  `, [id_usuario ? parseInt(id_usuario) : null]);

  return result.rows;
};

const obtenerProductosEliminados = async (id_usuario = null) => {
  const pool = await getConnection();
  const params = [];

  let query = `
    SELECT p.*, 
           c.descripcion AS categoria_nombre,
           u."nombreEmprendimiento"
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN Usuario u ON p.id_usuario = u.id_usuario
    WHERE p.id_estado_prod = 2
  `;

  if (id_usuario) {
    params.push(parseInt(id_usuario));
    query += ' AND p.id_usuario = $1';
  }

  query += ' ORDER BY p.id_producto DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

const obtenerProductoPorId = async (id) => {
  const pool = await getConnection();
  const result = await pool.query(`
      SELECT p.*, 
             c.descripcion AS categoria_nombre, 
             ep.descripcion AS estado_nombre,
             CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
             u."nombreEmprendimiento"
      FROM Producto p
      JOIN Categoria c ON p.id_categoria = c.id_categoria
      JOIN Estado_Producto ep ON p.id_estado_prod = ep.id_estado_prod
      LEFT JOIN Usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_producto = $1 AND p.id_estado_prod = 1
    `, [parseInt(id)]);
  return result.rows[0] || null;
};

const crearProducto = async ({ nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen }) => {
  const pool = await getConnection();
  const result = await pool.query(`
      INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_usuario, id_estado_prod, imagen)
      VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
      RETURNING *
    `, [nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen]);

  const producto = result.rows[0];

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

  // Antes era el procedimiento almacenado sp_actualizarProducto.
  // COALESCE: si no se envía una imagen nueva, se conserva la que ya tenía.
  const result = await pool.query(`
      UPDATE Producto
      SET nombre       = $2,
          descripcion  = $3,
          precio       = $4,
          stock        = $5,
          id_categoria = $6,
          imagen       = COALESCE($7, imagen)
      WHERE id_producto = $1
      RETURNING *
    `, [
      parseInt(id),
      nombre,
      descripcion,
      parseFloat(precio),
      parseInt(stock),
      parseInt(id_categoria),
      imagen || null,
    ]);

const producto = result.rows[0];

const alertaStock = verificarStock(producto);

return {
  producto,
  alertaStock
};
};
const eliminarProducto = async (id) => {
  const pool = await getConnection();
  const result = await pool.query(
    'UPDATE Producto SET id_estado_prod = 2 WHERE id_producto = $1',
    [parseInt(id)]
  );
  return result.rowCount > 0;
};

const restaurarProducto = async (id) => {
  const pool = await getConnection();
  const result = await pool.query(
    'UPDATE Producto SET id_estado_prod = 1 WHERE id_producto = $1',
    [parseInt(id)]
  );
  return result.rowCount > 0;
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