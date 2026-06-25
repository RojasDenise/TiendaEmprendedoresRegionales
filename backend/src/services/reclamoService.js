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

/**
 * Obtiene todos los reclamos asociados a los productos de un emprendedor.
 *
 * Retorna la información general del reclamo junto con los datos del cliente,
 * la factura y el estado actual del reclamo.
 *
 * @async
 * @function obtenerReclamos
 * @param {number|string} id_usuario - Identificador del emprendedor.
 * @returns {Promise<Array>} Listado de reclamos asociados al emprendedor.
 */

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
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
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

/**
 * Obtiene el detalle de un reclamo específico.
 *
 * Recupera la información principal del reclamo, incluyendo cliente,
 * factura, motivo y estado actual.
 *
 * @async
 * @function obtenerDetalle
 * @param {number|string} id_reclamo - Identificador del reclamo.
 * @returns {Promise<Object>} Información detallada del reclamo.
 * @throws {Error} Si el reclamo no existe.
 */

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
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
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

/**
 * Obtiene el historial de mensajes de un reclamo.
 *
 * Devuelve todos los mensajes intercambiados entre cliente y emprendedor,
 * ordenados cronológicamente.
 *
 * @async
 * @function obtenerMensajes
 * @param {number|string} id_reclamo - Identificador del reclamo.
 * @returns {Promise<Array>} Historial de mensajes del reclamo.
 */

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

/**
 * Registra una respuesta del emprendedor a un reclamo.
 *
 * Inserta un nuevo mensaje y actualiza automáticamente el estado
 * del reclamo a "Respondido".
 *
 * @async
 * @function responderReclamo
 * @param {number|string} id_reclamo - Identificador del reclamo.
 * @param {number|string} id_usuario - Identificador del emprendedor.
 * @param {string} contenido - Mensaje de respuesta.
 * @param {string|null} [imagen=null] - Imagen adjunta opcional.
 * @returns {Promise<Object>} Mensaje de confirmación.
 * @throws {Error} Si el reclamo no existe, está resuelto o el contenido está vacío.
 */

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

/**
 * Marca un reclamo como resuelto.
 *
 * Actualiza el estado del reclamo a "Resuelto".
 *
 * @async
 * @function resolverReclamo
 * @param {number|string} id_reclamo - Identificador del reclamo.
 * @returns {Promise<Object>} Mensaje de confirmación.
 * @throws {Error} Si el reclamo no existe o ya fue resuelto.
 */

const resolverReclamo = async (id_reclamo) => {
  const pool = await getConnection();
  const reclamo = await verificarReclamo(pool, parseInt(id_reclamo));
  if (!reclamo) throw new Error('Reclamo no encontrado');
  if (reclamo.estado === 'Resuelto') throw new Error('El reclamo ya se encuentra resuelto');

  const id_estadoResuelto = await obtenerIdEstado(pool, 'Resuelto');
  await actualizarEstadoReclamo(pool, parseInt(id_reclamo), id_estadoResuelto);

  return { mensaje: 'El reclamo ha sido marcado como resuelto' };
};

/**
 * Registra un nuevo reclamo realizado por un cliente.
 *
 * Verifica la existencia del cliente y la factura, valida que la compra
 * pertenezca al cliente, que haya sido entregada y que no exista un reclamo
 * previo para esa compra. Luego crea el reclamo y el mensaje inicial.
 *
 * @async
 * @function crearReclamo
 * @param {Object} datos - Información del reclamo.
 * @param {number|string} datos.id_factura - Identificador de la factura.
 * @param {number|string} datos.id_cliente - Identificador del cliente.
 * @param {string} datos.motivo - Motivo del reclamo.
 * @param {string} datos.descripcion - Descripción del reclamo.
 * @param {string|null} [datos.imagen=null] - Imagen adjunta opcional.
 * @returns {Promise<Object>} Mensaje de confirmación.
 * @throws {Error} Si los datos son inválidos, la compra no corresponde al cliente, no fue entregada o ya existe un reclamo.
 */

const crearReclamo = async ({
  id_factura,
  id_cliente,
  motivo,
  descripcion,
  imagen = null
}) => {
  if (!id_cliente) {
    throw new Error('Cliente no encontrado');
  }

  if (!id_factura) {
    throw new Error('Factura no encontrada');
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

  const factura = facturaResult.recordset[0];

  if (factura.id_cliente !== parseInt(id_cliente)) {
    throw new Error(
      'No puede realizar reclamos sobre compras no realizadas por el cliente'
    );
  }

  if (factura.id_estado_envio !== 3) {
    throw new Error('Solo podés reclamar compras que ya fueron entregadas');
  }

  const reclamoExistente = await pool.request()
    .input('id_factura', sql.Int, parseInt(id_factura))
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT id_reclamo
      FROM Reclamo
      WHERE id_factura = @id_factura
        AND id_cliente = @id_cliente
    `);

  if (reclamoExistente.recordset.length > 0) {
    throw new Error('Ya existe un reclamo para esta compra');
  }

  if (
    motivo === undefined ||
    motivo === null ||
    motivo === '' ||
    descripcion === undefined ||
    descripcion === null ||
    descripcion === ''
  ) {
    throw new Error('Faltan campos requeridos');
  }

  if (motivo.trim() === '') {
    throw new Error('El motivo no contiene información válida');
  }

  if (descripcion.trim() === '') {
    throw new Error('La descripción no contiene información válida');
  }

  const fecha = new Date();
  const id_estadoReclamo = await obtenerIdEstado(pool, 'Pendiente');

  const id_reclamo = await insertarReclamo(
    pool,
    fecha,
    motivo.trim(),
    id_estadoReclamo,
    parseInt(id_factura),
    parseInt(id_cliente)
  );

  await insertarMensaje(
    pool,
    descripcion.trim(),
    fecha,
    id_reclamo,
    null,
    imagen
  );

  return {
    mensaje: 'Reclamo registrado con éxito'
  };
};

/**
 * Registra una respuesta del cliente dentro de un reclamo.
 *
 * Agrega un nuevo mensaje al historial del reclamo.
 *
 * @async
 * @function responderCliente
 * @param {number|string} id_reclamo - Identificador del reclamo.
 * @param {number|string} id_cliente - Identificador del cliente.
 * @param {string} contenido - Contenido del mensaje.
 * @param {string|null} [imagen=null] - Imagen adjunta opcional.
 * @returns {Promise<Object>} Mensaje de confirmación.
 * @throws {Error} Si el reclamo no existe, está resuelto o el contenido está vacío.
 */

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

/**
 * Obtiene todos los reclamos realizados por un cliente.
 *
 * Devuelve el listado de reclamos junto con la factura asociada
 * y el estado actual de cada uno.
 *
 * @async
 * @function obtenerReclamosCliente
 * @param {number|string} id_cliente - Identificador del cliente.
 * @returns {Promise<Array>} Listado de reclamos del cliente.
 */

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