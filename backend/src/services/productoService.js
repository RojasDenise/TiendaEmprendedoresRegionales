const sql = require('mssql');
const { getConnection } = require('../config/db');

// ====================================================================
// PATRÓN OBSERVER - ObserverStock
// ====================================================================

// Lista de observadores registrados (Clientes y Emprendedores)
const observadores = [];

/**
 * Agrega un observador a la lista.
 * @param {Object} obs - Debe tener un método actualizar(producto, mensaje)
 */
const agregarObservador = (obs) => {
  observadores.push(obs);
};

/**
 * Elimina un observador de la lista.
 */
const eliminarObservador = (obs) => {
  const index = observadores.indexOf(obs);
  if (index > -1) observadores.splice(index, 1);
};

/**
 * Notifica a todos los observadores registrados.
 */
const notificarObservadores = (producto, mensaje) => {
  observadores.forEach(obs => obs.actualizar(producto, mensaje));
};

/**
 * Verifica si el stock bajó del mínimo y notifica si es necesario.
 */
const verificarStock = (producto) => {
  const STOCK_MINIMO = 5; // podés moverlo a .env si querés
  if (producto.stock <= STOCK_MINIMO) {
    const mensaje = `⚠️ Stock bajo: el producto "${producto.nombre}" tiene solo ${producto.stock} unidades disponibles.`;
    notificarObservadores(producto, mensaje);
  }
};

// Observador Emprendedor: imprime en consola (simulación de alerta interna)
const observadorEmprendedor = {
  actualizar: (producto, mensaje) => {
    console.log(`[ALERTA EMPRENDEDOR] ${mensaje}`);
    // Aquí podrías enviar un email, push notification, etc.
  }
};

// Observador Cliente: imprime en consola (simulación de notificación)
const observadorCliente = {
  actualizar: (producto, mensaje) => {
    console.log(`[NOTIFICACIÓN CLIENTE] ${mensaje}`);
    // Aquí podrías guardar en una tabla Notificaciones, enviar email, etc.
  }
};

// Registrar observadores al iniciar el módulo
agregarObservador(observadorEmprendedor);
agregarObservador(observadorCliente);

// ====================================================================
// SERVICIOS DE PRODUCTO
// ====================================================================

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
    .input('imagen', sql.VarChar(255), imagen)
    .query(`
      INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_usuario, id_estado_prod, imagen)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, @precio, @stock, @id_categoria, @id_usuario, @estado, @imagen)
    `);

  const producto = result.recordset[0];

  // Observer: verificar stock al crear
  verificarStock(producto);

  return producto;
};

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

  const producto = result.recordset[0];

  // Observer: verificar stock al actualizar
  verificarStock(producto);

  return producto;
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
  restaurarProducto,
  // Exportar para uso externo si se necesita registrar observadores dinámicamente
  agregarObservador,
  eliminarObservador
};