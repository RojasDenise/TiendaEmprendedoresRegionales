const sql = require('mssql');
const { getConnection } = require('../config/db');

// ====================================================================
// FUNCIONES INTERNAS
// ====================================================================

const insertarMensaje = async (pool, contenido, fecha, id_reclamo, id_usuario = null) => {
  const result = await pool.request()
    .input('contenido',   sql.VarChar(255), contenido)
    .input('fecha',       sql.DateTime,     fecha)
    .input('id_reclamo',  sql.Int,          id_reclamo)
    .input('id_usuario',  sql.Int,          id_usuario)
    .query(`
      INSERT INTO Mensaje_Reclamo (contenido, fecha_emision_mensaje, id_reclamo, id_usuario)
      OUTPUT INSERTED.id_mensaje
      VALUES (@contenido, @fecha, @id_reclamo, @id_usuario)
    `);
  return result.recordset[0].id_mensaje;
};

const actualizarEstadoReclamo = async (pool, id_reclamo, id_estadoReclamo, id_mensaje = null) => {
  const request = pool.request()
    .input('id_reclamo',      sql.Int, id_reclamo)
    .input('id_estadoReclamo', sql.Int, id_estadoReclamo);

  if (id_mensaje) {
    request.input('id_mensaje', sql.Int, id_mensaje);
    await request.query(`
      UPDATE Reclamo 
      SET id_estadoReclamo = @id_estadoReclamo,
          id_mensaje = @id_mensaje
      WHERE id_reclamo = @id_reclamo
    `);
  } else {
    await request.query(`
      UPDATE Reclamo 
      SET id_estadoReclamo = @id_estadoReclamo
      WHERE id_reclamo = @id_reclamo
    `);
  }
};

const obtenerIdEstado = async (pool, descripcion) => {
  const result = await pool.request()
    .input('descripcion', sql.VarChar(50), descripcion)
    .query(`SELECT id_estadoReclamo FROM Estado_Reclamo WHERE descripcion = @descripcion`);
  return result.recordset[0].id_estadoReclamo;
};

const verificarReclamo = async (pool, id_reclamo) => {
  const result = await pool.request()
    .input('id_reclamo', sql.Int, id_reclamo)
    .query(`
      SELECT r.id_reclamo, er.descripcion AS estado
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      WHERE r.id_reclamo = @id_reclamo
    `);
  return result.recordset[0] || null;
};

// ====================================================================
// SERVICIOS PÚBLICOS
// ====================================================================

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
        f.total AS total_factura
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      JOIN Cliente c         ON r.id_cliente = c.id_cliente
      JOIN Factura f         ON r.id_factura = f.id_factura
      WHERE r.id_reclamo = @id_reclamo
    `);

  if (!result.recordset[0]) throw new Error('Reclamo no encontrado');
  return result.recordset[0];
};

const obtenerMensajes = async (id_reclamo) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id_reclamo', sql.Int, parseInt(id_reclamo))
    .query(`
      SELECT
        mr.id_mensaje,
        mr.contenido,
        mr.fecha_emision_mensaje AS fecha,
        mr.id_usuario,
        CASE 
          WHEN mr.id_usuario IS NULL THEN 'cliente'
          ELSE 'emprendedor'
        END AS emisor
      FROM Mensaje_Reclamo mr
      WHERE mr.id_reclamo = @id_reclamo
      ORDER BY mr.fecha_emision_mensaje ASC
    `);
  return result.recordset;
};

const responderReclamo = async (id_reclamo, id_usuario, contenido) => {
  if (!contenido || contenido.trim() === '') {
    throw new Error('El contenido de la respuesta no puede estar vacío');
  }

  const pool = await getConnection();
  const reclamo = await verificarReclamo(pool, parseInt(id_reclamo));
  if (!reclamo) throw new Error('Reclamo no encontrado');
  if (reclamo.estado === 'Resuelto') {
    throw new Error('No se puede responder un reclamo que ya fue resuelto');
  }

  const id_mensaje = await insertarMensaje(
    pool, contenido.trim(), new Date(), parseInt(id_reclamo), parseInt(id_usuario)
  );

  const id_estadoRespondido = await obtenerIdEstado(pool, 'Respondido');
  await actualizarEstadoReclamo(pool, parseInt(id_reclamo), id_estadoRespondido, id_mensaje);

  return { mensaje: 'Respuesta registrada con éxito', id_mensaje };
};

const resolverReclamo = async (id_reclamo) => {
  const pool = await getConnection();
  const reclamo = await verificarReclamo(pool, parseInt(id_reclamo));
  if (!reclamo) throw new Error('Reclamo no encontrado');
  if (reclamo.estado === 'Resuelto') throw new Error('El reclamo ya se encuentra resuelto');

  const id_estadoResuelto = await obtenerIdEstado(pool, 'Resuelto');
  await actualizarEstadoReclamo(pool, parseInt(id_reclamo), id_estadoResuelto);

  return { mensaje: 'El reclamo ha sido marcado como resuelto' };
};

const crearReclamo = async ({ id_factura, id_cliente, motivo, descripcion }) => {
  if (!id_factura || !id_cliente || !motivo || !descripcion) {
    throw new Error('Faltan campos requeridos');
  }

  const pool = await getConnection();

  const existe = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT 1 FROM Reclamo
      WHERE id_factura = @id_factura AND id_cliente = @id_cliente
    `);

  if (existe.recordset.length > 0) throw new Error('Ya existe un reclamo para esta compra');

  const fecha = new Date();

  // Primero insertamos el reclamo sin id_mensaje para obtener su id
  const estadoResult = await pool.request()
    .input('descripcion', sql.VarChar(50), 'Pendiente')
    .query(`SELECT id_estadoReclamo FROM Estado_Reclamo WHERE descripcion = @descripcion`);
  const id_estadoReclamo = estadoResult.recordset[0].id_estadoReclamo;

  const reclamoResult = await pool.request()
    .input('fecha_reclamo',    sql.DateTime,     fecha)
    .input('motivo',           sql.VarChar(255), motivo.trim())
    .input('id_estadoReclamo', sql.Int,          id_estadoReclamo)
    .input('id_factura',       sql.Int,          parseInt(id_factura))
    .input('id_cliente',       sql.Int,          parseInt(id_cliente))
    .query(`
      INSERT INTO Reclamo (fecha_reclamo, motivo, id_estadoReclamo, id_factura, id_cliente)
      OUTPUT INSERTED.id_reclamo
      VALUES (@fecha_reclamo, @motivo, @id_estadoReclamo, @id_factura, @id_cliente)
    `);

  const id_reclamo = reclamoResult.recordset[0].id_reclamo;

  // Ahora insertamos el mensaje con el id_reclamo real
  const id_mensaje = await insertarMensaje(pool, descripcion.trim(), fecha, id_reclamo, null);

  // Actualizamos el reclamo con el id_mensaje inicial
  await pool.request()
    .input('id_reclamo', sql.Int, id_reclamo)
    .input('id_mensaje', sql.Int, id_mensaje)
    .query(`UPDATE Reclamo SET id_mensaje = @id_mensaje WHERE id_reclamo = @id_reclamo`);

  return { mensaje: 'Reclamo registrado con éxito', id_reclamo };
};

const responderCliente = async (id_reclamo, id_cliente, contenido) => {
  if (!contenido || contenido.trim() === '') {
    throw new Error('El contenido no puede estar vacío');
  }

  const pool = await getConnection();
  const reclamo = await verificarReclamo(pool, parseInt(id_reclamo));
  if (!reclamo) throw new Error('Reclamo no encontrado');
  if (reclamo.estado === 'Resuelto') {
    throw new Error('No se puede responder un reclamo ya resuelto');
  }

  // Mensaje del cliente: id_usuario = NULL
  const id_mensaje = await insertarMensaje(
    pool, contenido.trim(), new Date(), parseInt(id_reclamo), null
  );

  return { mensaje: 'Mensaje enviado con éxito', id_mensaje };
};

const obtenerReclamosCliente = async (id_cliente) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT
        r.id_reclamo,
        r.fecha_reclamo,
        r.motivo,
        er.descripcion AS estado,
        f.id_factura,
        f.total AS total_factura
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      JOIN Factura f          ON r.id_factura       = f.id_factura
      WHERE r.id_cliente = @id_cliente
      ORDER BY r.fecha_reclamo DESC
    `);
  return result.recordset;
};

module.exports = {
  obtenerReclamos,
  obtenerDetalle,
  obtenerMensajes,
  responderReclamo,
  responderCliente,
  resolverReclamo,
  crearReclamo,
  obtenerReclamosCliente,
};