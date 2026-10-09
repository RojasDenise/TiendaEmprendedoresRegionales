const { getConnection } = require('../config/db');

/**
 * @fileoverview Servicio de carrito de compras adaptado al schema real de la BD.
 * Gestiona obtención, agregar/quitar items y confirmación de compra.
 *
 * @module carritoService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

// ─────────────────────────────────────────────
//  OBTENER CARRITO
// ─────────────────────────────────────────────

/**
 * Devuelve todos los items del carrito activo de un cliente.
 *
 * @async
 * @param {number} id_cliente
 * @returns {Promise<Array<Object>>}
 */
const obtenerCarrito = async (id_cliente) => {
  const pool = await getConnection();

  const result = await pool.query(`
      SELECT
        c.id_carrito,
        ic."id_itemCarrito",
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen,
        ic.cantidad,
        ic.precio          AS precio_carrito,
        (ic.cantidad * ic.precio) AS subtotal
      FROM Carrito c
      INNER JOIN ItemCarrito ic ON c.id_carrito = ic.id_carrito
      INNER JOIN Producto     p  ON ic.id_producto = p.id_producto
      WHERE c.id_cliente = $1
    `, [parseInt(id_cliente)]);

  return result.rows;
};

// ─────────────────────────────────────────────
//  AGREGAR AL CARRITO
// ─────────────────────────────────────────────

/**
 * Agrega un producto al carrito. Si ya existe el item, suma la cantidad.
 * Crea el Carrito si el cliente aún no tiene uno.
 *
 * @async
 * @param {Object} param
 * @param {number} param.id_cliente
 * @param {number} param.id_producto
 * @param {number} param.cantidad
 * @returns {Promise<{message: string}>}
 */
const agregarAlCarrito = async ({ id_cliente, id_producto, cantidad }) => {
  const pool = await getConnection();

  // Verificar producto activo y stock
  const productoResult = await pool.query(`
      SELECT precio, stock
      FROM Producto
      WHERE id_producto = $1
        AND id_estado_prod = 1
    `, [parseInt(id_producto)]);

  const producto = productoResult.rows[0];
  if (!producto) throw new Error('Producto no disponible');
  if (producto.stock < cantidad) throw new Error('Stock insuficiente');

  // Buscar o crear carrito
  let carritoResult = await pool.query(`
      SELECT id_carrito
      FROM Carrito
      WHERE id_cliente = $1
    `, [parseInt(id_cliente)]);

  let id_carrito;

  if (carritoResult.rows.length === 0) {
    const nuevoCarrito = await pool.query(`
        INSERT INTO Carrito (fecha_creacion, "subTotal", id_cliente)
        VALUES (NOW(), 0, $1)
        RETURNING id_carrito
      `, [parseInt(id_cliente)]);
    id_carrito = nuevoCarrito.rows[0].id_carrito;
  } else {
    id_carrito = carritoResult.rows[0].id_carrito;
  }

  // Verificar si el item ya existe en el carrito
  const itemExistente = await pool.query(`
      SELECT "id_itemCarrito", cantidad
      FROM ItemCarrito
      WHERE id_carrito  = $1
        AND id_producto = $2
    `, [id_carrito, parseInt(id_producto)]);

  if (itemExistente.rows.length > 0) {
    await pool.query(`
        UPDATE ItemCarrito
        SET cantidad = cantidad + $1
        WHERE "id_itemCarrito" = $2
      `, [parseInt(cantidad), itemExistente.rows[0].id_itemCarrito]);
  } else {
    await pool.query(`
        INSERT INTO ItemCarrito (cantidad, precio, id_producto, id_carrito)
        VALUES ($1, $2, $3, $4)
      `, [parseInt(cantidad), producto.precio, parseInt(id_producto), id_carrito]);
  }

  return { message: 'Producto agregado al carrito' };
};

// ─────────────────────────────────────────────
//  QUITAR DEL CARRITO
// ─────────────────────────────────────────────

/**
 * Elimina un item del carrito por su id_itemCarrito.
 *
 * @async
 * @param {number} id_itemCarrito
 * @returns {Promise<{message: string}>}
 */
const quitarDelCarrito = async (id_itemCarrito) => {
  const pool = await getConnection();

  const itemResult = await pool.query(`
      SELECT id_carrito
      FROM ItemCarrito
      WHERE "id_itemCarrito" = $1
    `, [parseInt(id_itemCarrito)]);

  if (itemResult.rows.length === 0) throw new Error('Item no encontrado');

  await pool.query(`
      DELETE FROM ItemCarrito
      WHERE "id_itemCarrito" = $1
    `, [parseInt(id_itemCarrito)]);

  return { message: 'Producto quitado del carrito' };
};

// ─────────────────────────────────────────────
//  CONFIRMAR COMPRA
// ─────────────────────────────────────────────

/**
 * Confirma la compra en una transacción atómica.
 *
 * @async
 * @param {Object} param
 * @param {number} param.id_cliente
 * @param {number} param.id_formaPago
 * @returns {Promise<{message: string, id_factura: number}>}
 */
const confirmarCompra = async ({ id_cliente, id_formaPago }) => {
  const pool = await getConnection();

  // Una transacción necesita usar siempre la MISMA conexión:
  // se pide una al pool y se devuelve al final con release().
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const carritoResult = await client.query(`
        SELECT id_carrito
        FROM Carrito
        WHERE id_cliente = $1
      `, [parseInt(id_cliente)]);

    if (carritoResult.rows.length === 0)
      throw new Error('El cliente no tiene carrito');

    const id_carrito = carritoResult.rows[0].id_carrito;

    const itemsResult = await client.query(`
        SELECT "id_itemCarrito", cantidad, precio, id_producto
        FROM ItemCarrito
        WHERE id_carrito = $1
      `, [id_carrito]);

    if (itemsResult.rows.length === 0)
      throw new Error('El carrito está vacío');

    const total = itemsResult.rows.reduce(
      (acc, item) => acc + item.cantidad * item.precio,
      0
    );

    const envioResult = await client.query(`
        INSERT INTO Envio (fecha_envio, fecha_entrega, id_estado_envio, id_tipo_envio)
        VALUES (NOW(), NOW() + INTERVAL '7 days', 3, 1)
        RETURNING id_envio
      `);

    const id_envio = envioResult.rows[0].id_envio;

    const pedidoResult = await client.query(`
        INSERT INTO Pedido (fecha_pedido, "id_estadoPedido", id_envio, id_cliente, id_direccion)
        VALUES (NOW(), 2, $1, $2, 1)
        RETURNING id_pedido
      `, [id_envio, parseInt(id_cliente)]);

    const id_pedido = pedidoResult.rows[0].id_pedido;

    const facturaResult = await client.query(`
        INSERT INTO Factura (fecha, total, id_pedido)
        VALUES (NOW(), $1, $2)
        RETURNING id_factura
      `, [total, id_pedido]);

    const id_factura = facturaResult.rows[0].id_factura;

    for (const item of itemsResult.rows) {
      await client.query(`
          INSERT INTO DetalleFactura (cantidad, precio_unitario, id_factura, id_producto, id_carrito)
          VALUES ($1, $2, $3, $4, $5)
        `, [item.cantidad, item.precio, id_factura, item.id_producto, id_carrito]);
    }

    // Este INSERT dispara el trigger tr_ActualizarStockYEstado (descuenta stock)
    await client.query(`
        INSERT INTO Pago (fecha, "montoTotal", id_factura, "id_formaPago", "id_estadoPago")
        VALUES (NOW(), $1, $2, $3, 2)
      `, [total, id_factura, parseInt(id_formaPago)]);

    await client.query(`
        DELETE FROM ItemCarrito
        WHERE id_carrito = $1
      `, [id_carrito]);

    await client.query('COMMIT');

    return { message: 'Compra realizada con éxito', id_factura };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  confirmarCompra,
};