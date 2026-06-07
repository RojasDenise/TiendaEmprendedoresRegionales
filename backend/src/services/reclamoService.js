const sql = require('mssql');
const { getConnection } = require('../config/db');

// ====================================================================
// FUNCIONES INTERNAS
// ====================================================================

const insertarMensaje = async (pool, contenido, fecha, id_reclamo, id_usuario = null, imagen = null) => {
  const result = await pool.request()
    .input('contenido',  sql.VarChar(255), contenido)
    .input('fecha',      sql.DateTime,     fecha)
    .input('id_reclamo', sql.Int,          id_reclamo)
    .input('id_usuario', sql.Int,          id_usuario)
    .input('imagen',     sql.VarChar(255), imagen)
    .query(`
      INSERT INTO Mensaje_Reclamo (contenido, fecha_emision_mensaje, id_reclamo, id_usuario, imagen)
      OUTPUT INSERTED.id_mensaje
      VALUES (@contenido, @fecha, @id_reclamo, @id_usuario, @imagen)
    `);
  return result.recordset[0].id_mensaje;
};

const insertarReclamo = async (pool, fecha, motivo, id_estadoReclamo, id_factura, id_cliente) => {
  const result = await pool.request()
    .input('fecha_reclamo',    sql.DateTime,     fecha)
    .input('motivo',           sql.VarChar(255), motivo)
    .input('id_estadoReclamo', sql.Int,          id_estadoReclamo)
    .input('id_factura',       sql.Int,          id_factura)
    .input('id_cliente',       sql.Int,          id_cliente)
    .query(`
      INSERT INTO Reclamo (fecha_reclamo, motivo, id_estadoReclamo, id_factura, id_cliente)
      OUTPUT INSERTED.id_reclamo
      VALUES (@fecha_reclamo, @motivo, @id_estadoReclamo, @id_factura, @id_cliente)
    `);
  return result.recordset[0].id_reclamo;
};

const actualizarEstadoReclamo = async (pool, id_reclamo, id_estadoReclamo) => {
  await pool.request()
    .input('id_reclamo',       sql.Int, id_reclamo)
    .input('id_estadoReclamo', sql.Int, id_estadoReclamo)
    .query(`
      UPDATE Reclamo 
      SET id_estadoReclamo = @id_estadoReclamo
      WHERE id_reclamo = @id_reclamo
    `);
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
        mr.imagen,
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

const responderReclamo = async (id_reclamo, id_usuario, contenido, imagen = null) => {
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
    pool, contenido.trim(), new Date(), parseInt(id_reclamo), parseInt(id_usuario), imagen
  );

  const id_estadoRespondido = await obtenerIdEstado(pool, 'Respondido');
  await actualizarEstadoReclamo(pool, parseInt(id_reclamo), id_estadoRespondido);

  return { mensaje: 'Respuesta registrada con éxito'};
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

const crearReclamo = async ({ id_factura, id_cliente, motivo, descripcion, imagen = null }) => {
  if (!id_factura || !id_cliente || !motivo || !descripcion) {
    throw new Error('Faltan campos requeridos');
  }

  const pool = await getConnection();

  const envioResult = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .query(`
      SELECT e.id_estado_envio
      FROM Factura f
      JOIN Pedido p  ON f.id_pedido = p.id_pedido
      JOIN Envio e   ON p.id_envio  = e.id_envio
      WHERE f.id_factura = @id_factura
    `);

  if (!envioResult.recordset[0] || envioResult.recordset[0].id_estado_envio !== 3) {
    throw new Error('No puede realizar reclamos sobre compras que no fueron realizadas por usted');
  }
  // Verificar que la factura pertenezca al cliente
const facturaCliente = await pool.request()
  .input('id_factura', sql.Int, parseInt(id_factura))
  .input('id_cliente', sql.Int, parseInt(id_cliente))
  .query(`
    SELECT 1
    FROM Factura f
    JOIN Pedido p ON f.id_pedido = p.id_pedido
    WHERE f.id_factura = @id_factura
      AND p.id_cliente = @id_cliente
  `);

if (facturaCliente.recordset.length === 0) {
  throw new Error('No puede realizar reclamos sobre compras no realizadas por el cliente');
}

  const existe = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`SELECT 1 FROM Reclamo WHERE id_factura = @id_factura AND id_cliente = @id_cliente`);

  if (existe.recordset.length > 0) throw new Error('Ya existe un reclamo para esta compra');

  const fecha = new Date();
  const id_estadoReclamo = await obtenerIdEstado(pool, 'Pendiente');
  const id_reclamo = await insertarReclamo(pool, fecha, motivo.trim(), id_estadoReclamo, parseInt(id_factura), parseInt(id_cliente));

  await insertarMensaje(pool, descripcion.trim(), fecha, id_reclamo, null, imagen);

  return { mensaje: 'Reclamo registrado con éxito'};
};

const responderCliente = async (id_reclamo, id_cliente, contenido, imagen = null) => {
  if (!contenido || contenido.trim() === '') {
    throw new Error('El contenido no puede estar vacío');
  }

  const pool = await getConnection();
  const reclamo = await verificarReclamo(pool, parseInt(id_reclamo));
  if (!reclamo) throw new Error('Reclamo no encontrado');
  if (reclamo.estado === 'Resuelto') {
    throw new Error('No se puede responder un reclamo ya resuelto');
  }

  const id_mensaje = await insertarMensaje(
    pool, contenido.trim(), new Date(), parseInt(id_reclamo), null, imagen
  );

  return { mensaje: 'Mensaje enviado con éxito'};
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