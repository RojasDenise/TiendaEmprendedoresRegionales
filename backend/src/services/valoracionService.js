/**
 * @fileoverview Servicio de valoraciones de productos.
 * Permite registrar valoraciones y consultar el promedio por producto.
 *
 * @module valoracionService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const { getConnection } = require('../config/db');

/**
 * Registra una valoración de un cliente sobre un producto comprado.
 *
 * Valida que existan el cliente, la factura y el producto.
 * También verifica que el producto pertenezca a una factura del cliente,
 * que la compra tenga estado de envío entregado y que el puntaje esté entre 1 y 5.
 *
 * @async
 * @function agregarValoracion
 * @param {Object} datos - Datos necesarios para registrar la valoración.
 * @param {number|string} datos.id_factura - Identificador de la factura asociada a la compra.
 * @param {number|string} datos.id_producto - Identificador del producto valorado.
 * @param {number|string} datos.id_cliente - Identificador del cliente que realiza la valoración.
 * @param {number|string} datos.puntaje - Puntaje asignado al producto, entre 1 y 5.
 * @param {string} [datos.comentario] - Comentario opcional del cliente.
 * @returns {Promise<Object>} Mensaje de confirmación de la valoración registrada.
 * @throws {Error} Si falta cliente, factura o producto.
 * @throws {Error} Si el cliente intenta valorar un producto que no compró.
 * @throws {Error} Si la compra no fue entregada.
 * @throws {Error} Si el puntaje está vacío o fuera del rango permitido.
 * @throws {Error} Si el producto ya fue valorado para esa factura por ese cliente.
 */
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

  const clienteResult = await pool.query(`
      SELECT id_cliente
      FROM Cliente
      WHERE id_cliente = $1
    `, [parseInt(id_cliente)]);

  if (clienteResult.rows.length === 0) {
    throw new Error('Cliente no encontrado');
  }

  const facturaResult = await pool.query(`
      SELECT 
        f.id_factura,
        p.id_cliente,
        e.id_estado_envio
      FROM Factura f
      INNER JOIN Pedido p ON f.id_pedido = p.id_pedido
      INNER JOIN Envio e ON p.id_envio = e.id_envio
      WHERE f.id_factura = $1
    `, [parseInt(id_factura)]);

  if (facturaResult.rows.length === 0) {
    throw new Error('Factura no encontrada');
  }

  const productoResult = await pool.query(`
      SELECT id_producto
      FROM Producto
      WHERE id_producto = $1
    `, [parseInt(id_producto)]);

  if (productoResult.rows.length === 0) {
    throw new Error('Producto no encontrado');
  }

  const factura = facturaResult.rows[0];

  const compraValida = await pool.query(`
      SELECT 1
      FROM Factura f
      INNER JOIN Pedido p ON f.id_pedido = p.id_pedido
      INNER JOIN DetalleFactura df ON f.id_factura = df.id_factura
      WHERE f.id_factura = $1
        AND p.id_cliente = $2
        AND df.id_producto = $3
    `, [parseInt(id_factura), parseInt(id_cliente), parseInt(id_producto)]);

  if (compraValida.rows.length === 0) {
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

  const existe = await pool.query(`
      SELECT 1
      FROM Valoracion
      WHERE id_factura = $1
        AND id_producto = $2
        AND id_cliente = $3
    `, [parseInt(id_factura), parseInt(id_producto), parseInt(id_cliente)]);

  if (existe.rows.length > 0) {
    throw new Error('Ya valoraste este producto para esta compra');
  }

  await pool.query(`
      INSERT INTO Valoracion
      (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
      VALUES
      ($1, $2, $3, $4, $5, $6)
    `, [
      puntajeNumerico,
      comentario || null,
      new Date(),
      parseInt(id_cliente),
      parseInt(id_factura),
      parseInt(id_producto),
    ]);

  return {
    mensaje: 'Valoración registrada con éxito'
  };
};

/**
 * Obtiene las valoraciones asociadas a un producto y calcula su promedio.
 *
 * Consulta todas las valoraciones realizadas sobre un producto determinado,
 * incluyendo el puntaje, comentario, fecha y nombre completo del cliente.
 *
 * @async
 * @function obtenerValoracionesPorProducto
 * @param {number|string} id_producto - Identificador del producto consultado.
 * @returns {Promise<Object>} Objeto con promedio, total de valoraciones y listado de valoraciones.
 * @throws {Error} Si no se informa el identificador del producto.
 */
const obtenerValoracionesPorProducto = async (id_producto) => {
  if (!id_producto) {
    throw new Error('Producto no encontrado');
  }

  const pool = await getConnection();

  const result = await pool.query(`
      SELECT
        v.id_valoracion,
        v.puntaje,
        v.comentario,
        v.fecha,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente
      FROM Valoracion v
      JOIN Cliente c ON v.id_cliente = c.id_cliente
      WHERE v.id_producto = $1
      ORDER BY v.fecha DESC
    `, [parseInt(id_producto)]);

  const total = result.rows.length;

  const promedio = total > 0
    ? parseFloat(
        (
          result.rows.reduce(
            (acc, v) => acc + v.puntaje,
            0
          ) / total
        ).toFixed(1)
      )
    : 0;

  return {
    promedio,
    total,
    valoraciones: result.rows
  };
};

module.exports = {
  agregarValoracion,
  obtenerValoracionesPorProducto
};