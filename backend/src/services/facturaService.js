/**
 * @fileoverview Servicio de facturas para el cliente.
 * Obtiene las facturas con sus items, estado de envio,
 * y si cada producto ya fue valorado por ese cliente.
 *
 * @module facturaService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const sql = require('mssql');
const { getConnection } = require('../config/db');

const obtenerFacturasPorCliente = async (id_cliente) => {
  const pool = await getConnection();

  const factResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT
        f.id_factura,
        f.fecha,
        f.total,
        ep.descripcion    AS estado_pedido,
        ee.descripcion    AS estado_envio,
        ee.id_estado_envio,
        fp.descripcion    AS forma_pago,
        pg.montoTotal     AS monto_pago
      FROM Factura f
      JOIN Pedido p          ON f.id_pedido        = p.id_pedido
      JOIN Estado_pedido ep  ON p.id_estadoPedido  = ep.id_estadoPedido
      JOIN Envio e           ON p.id_envio          = e.id_envio
      JOIN estado_envio ee   ON e.id_estado_envio  = ee.id_estado_envio
      LEFT JOIN Pago pg      ON f.id_factura        = pg.id_factura
      LEFT JOIN FormaPago fp ON pg.id_formaPago     = fp.id_formaPago
      WHERE p.id_cliente = @id_cliente
      ORDER BY f.fecha DESC
    `);

  if (factResult.recordset.length === 0) return [];

  const facturaIds = factResult.recordset.map(f => f.id_factura);

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
      JOIN Producto prod  ON df.id_producto    = prod.id_producto
      JOIN Categoria cat  ON prod.id_categoria = cat.id_categoria
      JOIN Usuario u      ON prod.id_usuario   = u.id_usuario
      WHERE df.id_factura IN (${facturaIds.join(',')})
    `);

  const valorResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT id_factura, id_producto
      FROM Valoración
      WHERE id_cliente = @id_cliente
        AND id_factura IN (${facturaIds.join(',')})
    `);

  const reclamoResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT id_factura, id_estadoReclamo
      FROM Reclamo
      WHERE id_cliente = @id_cliente
        AND id_factura IN (${facturaIds.join(',')})
    `);

  const valoradas = new Set(
    valorResult.recordset.map(v => `${v.id_factura}-${v.id_producto}`)
  );

  const reclamosPorFactura = {};
  reclamoResult.recordset.forEach(r => {
    reclamosPorFactura[r.id_factura] = r.id_estadoReclamo;
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

  return factResult.recordset.map(f => ({
    ...f,
    items:          itemsPorFactura[f.id_factura] || [],
    tiene_reclamo:  reclamosPorFactura[f.id_factura] !== undefined,
    estado_reclamo: reclamosPorFactura[f.id_factura] || null,
  }));
};

module.exports = { obtenerFacturasPorCliente };