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

  const existe = await pool.request()
    .input('id_factura',  sql.Int, parseInt(id_factura))
    .input('id_producto', sql.Int, parseInt(id_producto))
    .input('id_cliente',  sql.Int, parseInt(id_cliente))
    .query(`
      SELECT 1 FROM Valoración
      WHERE id_factura  = @id_factura
        AND id_producto = @id_producto
        AND id_cliente  = @id_cliente
    `);

  if (existe.recordset.length > 0) {
    throw new Error('Ya valoraste este producto para esta compra');
  }

  const result = await pool.request()
    .input('puntaje',    sql.Int,          parseInt(puntaje))
    .input('comentario', sql.VarChar(255), comentario || null)
    .input('fecha',      sql.DateTime,     new Date())
    .input('id_cliente', sql.Int,          parseInt(id_cliente))
    .input('id_factura', sql.Int,          parseInt(id_factura))
    .input('id_producto',sql.Int,          parseInt(id_producto))
    .query(`
      INSERT INTO Valoración (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
      OUTPUT INSERTED.id_valoracion
      VALUES (@puntaje, @comentario, @fecha, @id_cliente, @id_factura, @id_producto)
    `);

  return {
    mensaje: 'Valoración registrada con éxito',
    id_valoracion: result.recordset[0].id_valoracion,
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

  const total    = result.recordset.length;
  const promedio = total > 0
    ? parseFloat((result.recordset.reduce((acc, v) => acc + v.puntaje, 0) / total).toFixed(1))
    : 0;

  return { promedio, total, valoraciones: result.recordset };
};

module.exports = { agregarValoracion, obtenerValoracionesPorProducto };