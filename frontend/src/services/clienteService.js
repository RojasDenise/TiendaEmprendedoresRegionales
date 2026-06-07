const BASE_URL = 'http://localhost:5000/api';

// ─── Facturas ─────────────────────────────────────────────────────────────────
export const obtenerFacturas = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/facturas/cliente/${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener facturas');
  return res.json();
};

// ─── Valoraciones ─────────────────────────────────────────────────────────────
export const obtenerValoraciones = async (id_producto) => {
  const res = await fetch(`${BASE_URL}/valoraciones/producto/${id_producto}`);
  if (!res.ok) throw new Error('Error al obtener valoraciones');
  return res.json();
};

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
export const obtenerReclamos = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/reclamos/cliente/${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener reclamos');
  return res.json();
};

/**
 * Registra un reclamo vinculado a una factura.
 * @param {Object} datos - { id_factura, id_cliente, motivo, descripcion, imagen? }
 */
export const agregarReclamo = async ({ id_factura, id_cliente, motivo, descripcion, imagen = null }) => {
  const formData = new FormData();
  formData.append('id_factura',  id_factura);
  formData.append('id_cliente',  id_cliente);
  formData.append('motivo',      motivo);
  formData.append('descripcion', descripcion);
  if (imagen) formData.append('imagen', imagen);

  const res = await fetch(`${BASE_URL}/reclamos`, {
    method: 'POST',
    body: formData,
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

/**
 * Envía un mensaje del cliente en un reclamo existente.
 * @param {number} id_reclamo
 * @param {number} id_cliente
 * @param {string} contenido
 * @param {File|null} imagen
 */
export const responderReclamo = async (id_reclamo, id_cliente, contenido, imagen = null) => {
  const formData = new FormData();
  formData.append('id_cliente', id_cliente);
  formData.append('contenido',  contenido || '📎 Imagen adjunta');
  if (imagen) formData.append('imagen', imagen);

  const res = await fetch(`${BASE_URL}/reclamos/${id_reclamo}/responder-cliente`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al enviar mensaje');
  return json;
};