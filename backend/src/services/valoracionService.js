/**
 * @fileoverview Servicio de valoraciones de productos.
 * Permite registrar valoraciones y consultar el promedio por producto.
 *
 * @module valoracionService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const sql = require('mssql');
const { getConnection } = require('../config/db');

const agregarValoracion = async ({ id_factura, id_producto, id_cliente, puntaje, comentario }) => {
  if (!id_factura || !id_producto || !id_cliente || !puntaje) {
    throw new Error('Faltan campos requeridos');
  }

  if (puntaje < 1 || puntaje > 5) {
    throw new Error('El puntaje debe estar entre 1 y 5');
  }

  const pool = await getConnection();

  // 1. Verificar que la factura pertenezca al cliente,
  // que el producto esté dentro de esa factura
  // y que la compra haya sido entregada.
  const compraValida = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_producto', sql.Int, parseInt(id_producto))
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT 1
      FROM Factura f
      JOIN Pedido p ON f.id_pedido = p.id_pedido
      JOIN Envio e ON p.id_envio = e.id_envio
      JOIN DetalleFactura df ON f.id_factura = df.id_factura
      WHERE f.id_factura = @id_factura
        AND p.id_cliente = @id_cliente
        AND df.id_producto = @id_producto
        AND e.id_estado_envio = 3
    `);

  if (compraValida.recordset.length === 0) {
    throw new Error('No puede valorar productos que no compró');
  }

  // 2. Verificar que no exista una valoración previa
  // para ese cliente, factura y producto.
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

  // 3. Registrar valoración.
  await pool.request()
    .input('puntaje', sql.Int, parseInt(puntaje))
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
    ? parseFloat((result.recordset.reduce((acc, v) => acc + v.puntaje, 0) / total).toFixed(1))
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