/**
 * @fileoverview Servicio de valoraciones de productos.
 * Permite registrar valoraciones y consultar el promedio por producto.
 *
 * @module valoracionService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const sql = require('mssql');
const { getConnection } = require('../config/db');

const agregarValoracion = async ({
  id_factura,
  id_producto,
  id_cliente,
  puntaje,
  comentario
}) => {
  if (!id_cliente) {
    throw new Error('Cliente no encontrado');
  }

  if (!id_factura) {
    throw new Error('Factura no encontrada');
  }

  if (!id_producto) {
    throw new Error('Producto no encontrado');
  }

  const pool = await getConnection();

  const clienteResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT id_cliente
      FROM Cliente
      WHERE id_cliente = @id_cliente
    `);

  if (clienteResult.recordset.length === 0) {
    throw new Error('Cliente no encontrado');
  }

  const facturaResult = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .query(`
      SELECT 
        f.id_factura,
        p.id_cliente,
        e.id_estado_envio
      FROM Factura f
      INNER JOIN Pedido p ON f.id_pedido = p.id_pedido
      INNER JOIN Envio e ON p.id_envio = e.id_envio
      WHERE f.id_factura = @id_factura
    `);

  if (facturaResult.recordset.length === 0) {
    throw new Error('Factura no encontrada');
  }

  const productoResult = await pool.request()
    .input('id_producto', sql.Int, parseInt(id_producto))
    .query(`
      SELECT id_producto
      FROM Producto
      WHERE id_producto = @id_producto
    `);

  if (productoResult.recordset.length === 0) {
    throw new Error('Producto no encontrado');
  }

  const factura = facturaResult.recordset[0];

  const compraValida = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_producto', sql.Int, parseInt(id_producto))
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT 1
      FROM Factura f
      INNER JOIN Pedido p ON f.id_pedido = p.id_pedido
      INNER JOIN DetalleFactura df ON f.id_factura = df.id_factura
      WHERE f.id_factura = @id_factura
        AND p.id_cliente = @id_cliente
        AND df.id_producto = @id_producto
    `);

  if (compraValida.recordset.length === 0) {
    throw new Error('No puede valorar productos que no compró');
  }

  if (factura.id_estado_envio !== 3) {
    throw new Error('Solo podés valorar productos de compras entregadas');
  }

  if (
    puntaje === undefined ||
    puntaje === null ||
    puntaje === ''
  ) {
    throw new Error('El puntaje es un campo requerido');
  }

  const puntajeNumerico = parseInt(puntaje);

  if (
    isNaN(puntajeNumerico) ||
    puntajeNumerico < 1 ||
    puntajeNumerico > 5
  ) {
    throw new Error('El puntaje debe estar entre 1 y 5');
  }

  const existe = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_producto', sql.Int, parseInt(id_producto))
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT 1
      FROM Valoración
      WHERE id_factura = @id_factura
        AND id_producto = @id_producto
        AND id_cliente = @id_cliente
    `);

  if (existe.recordset.length > 0) {
    throw new Error('Ya valoraste este producto para esta compra');
  }

  await pool.request()
    .input('puntaje', sql.Int, puntajeNumerico)
    .input('comentario', sql.VarChar(255), comentario || null)
    .input('fecha', sql.DateTime, new Date())
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_producto', sql.Int, parseInt(id_producto))
    .query(`
      INSERT INTO Valoración
      (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
      VALUES
      (@puntaje, @comentario, @fecha, @id_cliente, @id_factura, @id_producto)
    `);

  return {
    mensaje: 'Valoración registrada con éxito'
  };
};

const obtenerValoracionesPorProducto = async (id_producto) => {
  if (!id_producto) {
    throw new Error('Producto no encontrado');
  }

  const pool = await getConnection();

  const result = await pool.request()
    .input('id_producto', sql.Int, parseInt(id_producto))
    .query(`
      SELECT
        v.id_valoracion,
        v.puntaje,
        v.comentario,
        v.fecha,
        c.apellidoNombre AS nombre_cliente
      FROM Valoración v
      JOIN Cliente c ON v.id_cliente = c.id_cliente
      WHERE v.id_producto = @id_producto
      ORDER BY v.fecha DESC
    `);

  const total = result.recordset.length;

  const promedio = total > 0
    ? parseFloat(
        (
          result.recordset.reduce(
            (acc, v) => acc + v.puntaje,
            0
          ) / total
        ).toFixed(1)
      )
    : 0;

  return {
    promedio,
    total,
    valoraciones: result.recordset
  };
};

module.exports = {
  agregarValoracion,
  obtenerValoracionesPorProducto
};