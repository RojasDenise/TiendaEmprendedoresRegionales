const BASE_URL = 'http://localhost:5000/api';

export const obtenerCarrito = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/carrito?id_cliente=${id_cliente}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al obtener carrito');
  return json;
};

export const agregarAlCarrito = async (id_cliente, id_producto, cantidad = 1) => {
  const res = await fetch(`${BASE_URL}/carrito/agregar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_cliente, id_producto, cantidad })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al agregar al carrito');
  return json;
};

export const quitarDelCarrito = async (id_itemCarrito) => {
  const res = await fetch(`${BASE_URL}/carrito/item/${id_itemCarrito}`, {
    method: 'DELETE'
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al quitar producto');
  return json;
};

export const confirmarCompra = async (id_cliente, id_direccion = 1, id_formaPago = 1) => {
  const res = await fetch(`${BASE_URL}/carrito/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_cliente, id_direccion, id_formaPago })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al confirmar compra');
  return json;
};