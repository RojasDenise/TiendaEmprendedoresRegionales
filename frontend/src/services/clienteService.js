const BASE_URL = 'http://localhost:5000/api';

// ─── Facturas ─────────────────────────────────────────────────────────────────

/**
 * Retorna las facturas del cliente con items, estado de envio,
 * flag de valoración por producto y flag de reclamo por factura.
 * @param {number} id_cliente
 */
export const obtenerFacturas = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/facturas/cliente/${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener facturas');
  return res.json();
};

// ─── Valoraciones ─────────────────────────────────────────────────────────────

/**
 * Retorna valoraciones y promedio de un producto.
 * @param {number} id_producto
 */
export const obtenerValoraciones = async (id_producto) => {
  const res = await fetch(`${BASE_URL}/valoraciones/producto/${id_producto}`);
  if (!res.ok) throw new Error('Error al obtener valoraciones');
  return res.json();
};

/**
 * Registra una valoracion del cliente sobre un producto.
 * @param {Object} datos - { id_factura, id_producto, id_cliente, puntaje, comentario }
 */
export const agregarValoracion = async (datos) => {
  const res = await fetch(`${BASE_URL}/valoraciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al registrar valoracion');
  return json;
};

// ─── Reclamos ─────────────────────────────────────────────────────────────────

/**
 * Retorna todos los reclamos del cliente.
 * @param {number} id_cliente
 */
export const obtenerReclamos = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/reclamos/cliente/${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener reclamos');
  return res.json();
};

/**
 * Registra un reclamo vinculado a una factura.
 * @param {Object} datos - { id_factura, id_cliente, motivo, descripcion }
 */
export const agregarReclamo = async (datos) => {
  const res = await fetch(`${BASE_URL}/reclamos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al registrar reclamo');
  return json;
};

export const obtenerMensajesReclamo = async (id_reclamo) => {
  const res = await fetch(`${BASE_URL}/reclamos/${id_reclamo}/mensajes`);
  if (!res.ok) throw new Error('Error al obtener mensajes');
  return res.json();
};

export const responderReclamo = async (id_reclamo, id_cliente, contenido) => {
  const res = await fetch(`${BASE_URL}/reclamos/${id_reclamo}/responder-cliente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_cliente, contenido }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al enviar mensaje');
  return json;
};