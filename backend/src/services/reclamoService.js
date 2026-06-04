const sql = require('mssql');
const { getConnection } = require('../config/db');

const obtenerReclamos = async (id_usuario) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id_usuario', sql.Int, parseInt(id_usuario))
    .query(`
      SELECT DISTINCT
        r.id_reclamo,
        r.fecha_reclamo,
        r.motivo,
        er.descripcion AS estado,
        c.apellidoNombre AS nombre_cliente,
        c.email AS email_cliente,
        f.id_factura,
        f.total AS total_factura
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      JOIN Cliente c         ON r.id_cliente = c.id_cliente
      JOIN Factura f         ON r.id_factura = f.id_factura
      JOIN DetalleFactura df ON f.id_factura = df.id_factura
      JOIN Producto p        ON df.id_producto = p.id_producto
      WHERE p.id_usuario = @id_usuario
      ORDER BY r.fecha_reclamo DESC
    `);
  return result.recordset;
};

const obtenerDetalle = async (id_reclamo) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id_reclamo', sql.Int, parseInt(id_reclamo))
    .query(`
      SELECT
        r.id_reclamo,
        r.fecha_reclamo,
        r.motivo,
        er.descripcion AS estado,
        c.apellidoNombre AS nombre_cliente,
        c.email AS email_cliente,
        f.id_factura,
        f.total AS total_factura,
        mr.contenido AS respuesta,
        mr.fecha_emision_mensaje AS fecha_respuesta
      FROM Reclamo r
      JOIN Estado_Reclamo er  ON r.id_estadoReclamo = er.id_estadoReclamo
      JOIN Cliente c          ON r.id_cliente = c.id_cliente
      JOIN Factura f          ON r.id_factura = f.id_factura
      JOIN Mensaje_Reclamo mr ON r.id_mensaje = mr.id_mensaje
      WHERE r.id_reclamo = @id_reclamo
    `);

  if (!result.recordset[0]) {
    throw new Error('Reclamo no encontrado');
  }
  return result.recordset[0];
};

const responderReclamo = async (id_reclamo, id_usuario, contenido) => {
  if (!contenido || contenido.trim() === '') {
    throw new Error('El contenido de la respuesta no puede estar vacío');
  }

  const pool = await getConnection();

  const check = await pool.request()
    .input('id_reclamo', sql.Int, parseInt(id_reclamo))
    .query(`
      SELECT r.id_reclamo, er.descripcion AS estado
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      WHERE r.id_reclamo = @id_reclamo
    `);

  if (!check.recordset[0]) throw new Error('Reclamo no encontrado');
  if (check.recordset[0].estado === 'Resuelto') {
    throw new Error('No se puede responder un reclamo que ya fue resuelto');
  }

  const msgResult = await pool.request()
    .input('contenido', sql.VarChar(255), contenido.trim())
    .input('fecha', sql.DateTime, new Date())
    .query(`
      INSERT INTO Mensaje_Reclamo (contenido, fecha_emision_mensaje)
      OUTPUT INSERTED.id_mensaje
      VALUES (@contenido, @fecha)
    `);

  const id_mensaje = msgResult.recordset[0].id_mensaje;

  await pool.request()
    .input('id_reclamo', sql.Int, parseInt(id_reclamo))
    .input('id_mensaje', sql.Int, id_mensaje)
    .query(`
      UPDATE Reclamo SET id_mensaje = @id_mensaje
      WHERE id_reclamo = @id_reclamo
    `);

  return { mensaje: 'Respuesta registrada con éxito', id_mensaje };
};

const resolverReclamo = async (id_reclamo) => {
  const pool = await getConnection();

  const check = await pool.request()
    .input('id_reclamo', sql.Int, parseInt(id_reclamo))
    .query(`
      SELECT r.id_reclamo, er.descripcion AS estado
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      WHERE r.id_reclamo = @id_reclamo
    `);

  if (!check.recordset[0]) throw new Error('Reclamo no encontrado');
  if (check.recordset[0].estado === 'Resuelto') {
    throw new Error('El reclamo ya se encuentra resuelto');
  }

  const estadoResult = await pool.request()
    .query(`SELECT id_estadoReclamo FROM Estado_Reclamo WHERE descripcion = 'Resuelto'`);

  const id_estadoResuelto = estadoResult.recordset[0].id_estadoReclamo;

  await pool.request()
    .input('id_reclamo', sql.Int, parseInt(id_reclamo))
    .input('id_estadoReclamo', sql.Int, id_estadoResuelto)
    .query(`
      UPDATE Reclamo SET id_estadoReclamo = @id_estadoReclamo
      WHERE id_reclamo = @id_reclamo
    `);

  return { mensaje: 'El reclamo ha sido marcado como resuelto' };
};

module.exports = {
  obtenerReclamos,
  obtenerDetalle,
  responderReclamo,
  resolverReclamo
};