/**
 * @fileoverview Servicio de acceso a la API para la gestión del carrito de compras.
 * Centraliza todas las peticiones HTTP relacionadas con el carrito:
 * obtención, agregar items, quitar items y confirmar compra.
 *
 * @module carritoService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const BASE_URL = 'http://localhost:5000/api';

/**
 * Obtiene el carrito del cliente con todos sus items.
 *
 * @async
 * @param {number} id_cliente
 * @returns {Promise<Array<Object>>}
 */
export const obtenerCarrito = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/carrito?id_cliente=${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener el carrito');
  return await res.json();
};

/**
 * Agrega un producto al carrito del cliente.
 * Si el producto ya existe, incrementa la cantidad.
 *
 * @async
 * @param {number} id_cliente
 * @param {number} id_producto
 * @param {number} [cantidad=1]
 * @returns {Promise<Object>}
 */
export const agregarAlCarrito = async (id_cliente, id_producto, cantidad = 1) => {
  const res = await fetch(`${BASE_URL}/carrito/agregar`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id_cliente, id_producto, cantidad }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al agregar al carrito');
  return json;
};

/**
 * Quita un item del carrito por su id_itemCarrito.
 *
 * @async
 * @param {number} id_itemCarrito
 * @returns {Promise<Object>}
 */
export const quitarDelCarrito = async (id_itemCarrito) => {
  const res = await fetch(`${BASE_URL}/carrito/item/${id_itemCarrito}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al quitar del carrito');
  return json;
};

/**
 * Confirma la compra generando envío, pedido, factura y pago.
 *
 * @async
 * @param {number} id_cliente
 * @param {number} id_formaPago  - 1: Tarjeta de Débito | 2: Efectivo/Transferencia
 * @returns {Promise<{message: string, id_factura: number}>}
 */
export const confirmarCompra = async (id_cliente, id_formaPago) => {
  const res = await fetch(`${BASE_URL}/carrito/confirmar`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id_cliente, id_formaPago }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al confirmar la compra');
  return json;
};