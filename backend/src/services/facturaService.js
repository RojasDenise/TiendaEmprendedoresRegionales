/**
 * @fileoverview Servicio de facturas para el cliente.
 * Obtiene las facturas con sus items desde DetalleFactura,
 * estado de envío, forma de pago, valoraciones y reclamos.
 *
 * @module facturaService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const sql = require('mssql');
const { getConnection } = require('../config/db');

const obtenerFacturasPorCliente = async (id_cliente) => {
  const pool = await getConnection();

  // 1. Facturas del cliente con estado de envío y forma de pago
  const factResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT
        f.id_factura,
        f.fecha,
        f.total,
        ee.descripcion    AS estado_envio,
        ee.id_estado_envio,
        fp.descripcion    AS forma_pago,
        pg.montoTotal     AS monto_pago
      FROM Factura f
      JOIN Pedido      p  ON f.id_pedido       = p.id_pedido
      JOIN Envio       e  ON p.id_envio         = e.id_envio
      JOIN estado_envio ee ON e.id_estado_envio = ee.id_estado_envio
      LEFT JOIN Pago   pg ON f.id_factura       = pg.id_factura
      LEFT JOIN FormaPago fp ON pg.id_formaPago = fp.id_formaPago
      WHERE p.id_cliente = @id_cliente
      ORDER BY f.fecha DESC
    `);

  if (factResult.recordset.length === 0) return [];

  const facturaIds = factResult.recordset.map(f => f.id_factura);
  const idsStr     = facturaIds.join(',');

  // 2. Items desde DetalleFactura con imagen del producto
  const itemsResult = await pool.request()
    .query(`
      SELECT
        df.id_detalleFactura,
        df.id_factura,
        df.cantidad,
        df.precio_unitario,
        df.id_producto,
        prod.nombre       AS producto_nombre,
        prod.imagen       AS producto_imagen,
        cat.descripcion   AS categoria,
        u.apellidoNombre  AS vendedor
      FROM DetalleFactura df
      JOIN Producto  prod ON df.id_producto    = prod.id_producto
      JOIN Categoria cat  ON prod.id_categoria = cat.id_categoria
      JOIN Usuario   u    ON prod.id_usuario   = u.id_usuario
      WHERE df.id_factura IN (${idsStr})
    `);

  // 3. Valoraciones ya hechas por este cliente
  const valorResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT id_factura, id_producto
      FROM Valoración
      WHERE id_cliente = @id_cliente
        AND id_factura IN (${idsStr})
    `);

  // 4. Reclamos del cliente con descripción del estado
  const reclamoResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT r.id_factura, r.id_estadoReclamo, er.descripcion AS estado_reclamo_desc
      FROM Reclamo r
      JOIN Estado_Reclamo er ON r.id_estadoReclamo = er.id_estadoReclamo
      WHERE r.id_cliente = @id_cliente
        AND r.id_factura IN (${idsStr})
    `);

  // ── Armar estructuras de búsqueda rápida ──
  const valoradas = new Set(
    valorResult.recordset.map(v => `${v.id_factura}-${v.id_producto}`)
  );

  const reclamosPorFactura = {};
  reclamoResult.recordset.forEach(r => {
    reclamosPorFactura[r.id_factura] = {
      id_estadoReclamo:    r.id_estadoReclamo,
      estado_reclamo_desc: r.estado_reclamo_desc,
    };
  });

  const itemsPorFactura = {};
  itemsResult.recordset.forEach(item => {
    if (!itemsPorFactura[item.id_factura]) {
      itemsPorFactura[item.id_factura] = [];
    }
    itemsPorFactura[item.id_factura].push({
      ...item,
      ya_valorado: valoradas.has(`${item.id_factura}-${item.id_producto}`),
    });
  });

  // ── Resultado final ──
  return factResult.recordset.map(f => ({
    ...f,
    items:               itemsPorFactura[f.id_factura] || [],
    tiene_reclamo:       reclamosPorFactura[f.id_factura] !== undefined,
    estado_reclamo:      reclamosPorFactura[f.id_factura]?.id_estadoReclamo || null,
    estado_reclamo_desc: reclamosPorFactura[f.id_factura]?.estado_reclamo_desc || null,
  }));
};

module.exports = { obtenerFacturasPorCliente };