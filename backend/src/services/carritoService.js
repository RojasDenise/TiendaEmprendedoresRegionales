const sql = require('mssql');
const { getConnection } = require('../config/db');

const obtenerCarrito = async (id_cliente) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT 
        c.id_carrito,
        ic.id_itemCarrito,
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen,
        ic.cantidad,
        ic.precio AS precio_carrito,
        (ic.cantidad * ic.precio) AS subtotal
      FROM Carrito c
      INNER JOIN ItemCarrito ic ON c.id_carrito = ic.id_carrito
      INNER JOIN Producto p ON ic.id_producto = p.id_producto
      WHERE c.id_cliente = @id_cliente
    `);

  return result.recordset;
};

const agregarAlCarrito = async ({ id_cliente, id_producto, cantidad }) => {
  const pool = await getConnection();

  const productoResult = await pool.request()
    .input('id_producto', sql.Int, parseInt(id_producto))
    .query(`
      SELECT precio, stock
      FROM Producto
      WHERE id_producto = @id_producto
        AND id_estado_prod = 1
    `);

  const producto = productoResult.recordset[0];

  if (!producto) {
    throw new Error('Producto no disponible');
  }

  if (producto.stock < cantidad) {
    throw new Error('Stock insuficiente');
  }

  let carritoResult = await pool.request()
    .input('id_cliente', sql.Int, parseInt(id_cliente))
    .query(`
      SELECT id_carrito
      FROM Carrito
      WHERE id_cliente = @id_cliente
    `);

  let id_carrito;

  if (carritoResult.recordset.length === 0) {
    const nuevoCarrito = await pool.request()
      .input('id_cliente', sql.Int, parseInt(id_cliente))
      .query(`
        INSERT INTO Carrito (fecha_creacion, subTotal, id_cliente)
        OUTPUT INSERTED.id_carrito
        VALUES (GETDATE(), 0, @id_cliente)
      `);

    id_carrito = nuevoCarrito.recordset[0].id_carrito;
  } else {
    id_carrito = carritoResult.recordset[0].id_carrito;
  }

  const itemExistente = await pool.request()
    .input('id_carrito', sql.Int, id_carrito)
    .input('id_producto', sql.Int, parseInt(id_producto))
    .query(`
      SELECT id_itemCarrito, cantidad
      FROM ItemCarrito
      WHERE id_carrito = @id_carrito
        AND id_producto = @id_producto
    `);

  if (itemExistente.recordset.length > 0) {
    await pool.request()
      .input('id_itemCarrito', sql.Int, itemExistente.recordset[0].id_itemCarrito)
      .input('cantidad', sql.Int, parseInt(cantidad))
      .query(`
        UPDATE ItemCarrito
        SET cantidad = cantidad + @cantidad
        WHERE id_itemCarrito = @id_itemCarrito
      `);
  } else {
    await pool.request()
      .input('cantidad', sql.Int, parseInt(cantidad))
      .input('precio', sql.Float, producto.precio)
      .input('id_producto', sql.Int, parseInt(id_producto))
      .input('id_carrito', sql.Int, id_carrito)
      .query(`
        INSERT INTO ItemCarrito (cantidad, precio, id_producto, id_carrito)
        VALUES (@cantidad, @precio, @id_producto, @id_carrito)
      `);
  }

  await actualizarSubtotal(id_carrito);

  return { message: 'Producto agregado al carrito' };
};

const actualizarSubtotal = async (id_carrito) => {
  const pool = await getConnection();

  await pool.request()
    .input('id_carrito', sql.Int, id_carrito)
    .query(`
      UPDATE Carrito
      SET subTotal = (
        SELECT ISNULL(SUM(cantidad * precio), 0)
        FROM ItemCarrito
        WHERE id_carrito = @id_carrito
      )
      WHERE id_carrito = @id_carrito
    `);
};

const quitarDelCarrito = async (id_itemCarrito) => {
  const pool = await getConnection();

  const carritoResult = await pool.request()
    .input('id_itemCarrito', sql.Int, parseInt(id_itemCarrito))
    .query(`
      SELECT id_carrito
      FROM ItemCarrito
      WHERE id_itemCarrito = @id_itemCarrito
    `);

  if (carritoResult.recordset.length === 0) {
    throw new Error('Item no encontrado');
  }

  const id_carrito = carritoResult.recordset[0].id_carrito;

  await pool.request()
    .input('id_itemCarrito', sql.Int, parseInt(id_itemCarrito))
    .query(`
      DELETE FROM ItemCarrito
      WHERE id_itemCarrito = @id_itemCarrito
    `);

  await actualizarSubtotal(id_carrito);

  return { message: 'Producto quitado del carrito' };
};

const confirmarCompra = async ({ id_cliente, id_direccion, id_formaPago }) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = new sql.Request(transaction);

    const carritoResult = await request
      .input('id_cliente', sql.Int, parseInt(id_cliente))
      .query(`
        SELECT id_carrito, subTotal
        FROM Carrito
        WHERE id_cliente = @id_cliente
      `);

    if (carritoResult.recordset.length === 0) {
      throw new Error('El cliente no tiene carrito');
    }

    const carrito = carritoResult.recordset[0];

    const itemsResult = await new sql.Request(transaction)
      .input('id_carrito', sql.Int, carrito.id_carrito)
      .query(`
        SELECT *
        FROM ItemCarrito
        WHERE id_carrito = @id_carrito
      `);

    if (itemsResult.recordset.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const envioResult = await new sql.Request(transaction)
      .query(`
        INSERT INTO Envio (fecha_envio, fecha_entrega, id_estado_envio, id_tipo_envio)
        OUTPUT INSERTED.id_envio
        VALUES (GETDATE(), NULL, 1, 1)
      `);

    const id_envio = envioResult.recordset[0].id_envio;

    const pedidoResult = await new sql.Request(transaction)
      .input('id_cliente', sql.Int, parseInt(id_cliente))
      .input('id_direccion', sql.Int, parseInt(id_direccion))
      .input('id_envio', sql.Int, id_envio)
      .query(`
        INSERT INTO Pedido (fecha_pedido, id_estadoPedido, id_envio, id_cliente, id_direccion)
        OUTPUT INSERTED.id_pedido
        VALUES (GETDATE(), 2, @id_envio, @id_cliente, @id_direccion)
      `);

    const id_pedido = pedidoResult.recordset[0].id_pedido;

    const facturaResult = await new sql.Request(transaction)
      .input('total', sql.Float, carrito.subTotal)
      .input('id_pedido', sql.Int, id_pedido)
      .query(`
        INSERT INTO Factura (fecha, total, id_pedido)
        OUTPUT INSERTED.id_factura
        VALUES (GETDATE(), @total, @id_pedido)
      `);

    const id_factura = facturaResult.recordset[0].id_factura;

    for (const item of itemsResult.recordset) {
      await new sql.Request(transaction)
        .input('cantidad', sql.Int, item.cantidad)
        .input('precio_unitario', sql.Float, item.precio)
        .input('id_factura', sql.Int, id_factura)
        .input('id_producto', sql.Int, item.id_producto)
        .input('id_carrito', sql.Int, carrito.id_carrito)
        .query(`
          INSERT INTO DetalleFactura (
            cantidad,
            precio_unitario,
            id_factura,
            id_producto,
            id_carrito
          )
          VALUES (
            @cantidad,
            @precio_unitario,
            @id_factura,
            @id_producto,
            @id_carrito
          )
        `);
    }

    await new sql.Request(transaction)
      .input('montoTotal', sql.Float, carrito.subTotal)
      .input('id_factura', sql.Int, id_factura)
      .input('id_formaPago', sql.Int, parseInt(id_formaPago))
      .query(`
        INSERT INTO Pago (
          fecha,
          montoTotal,
          id_factura,
          id_formaPago,
          id_estadoPago
        )
        VALUES (
          GETDATE(),
          @montoTotal,
          @id_factura,
          @id_formaPago,
          2
        )
      `);

    await new sql.Request(transaction)
      .input('id_carrito', sql.Int, carrito.id_carrito)
      .query(`
        DELETE FROM ItemCarrito
        WHERE id_carrito = @id_carrito
      `);

    await new sql.Request(transaction)
      .input('id_carrito', sql.Int, carrito.id_carrito)
      .query(`
        UPDATE Carrito
        SET subTotal = 0
        WHERE id_carrito = @id_carrito
      `);

    await transaction.commit();

    return {
      message: 'Compra realizada con éxito',
      id_factura
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  confirmarCompra
};