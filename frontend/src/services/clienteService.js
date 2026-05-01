/**
 * @fileoverview Servicio de acceso a la API para funcionalidades del cliente.
 * Centraliza las peticiones HTTP de facturas, valoraciones y reclamos.
 *
 * @module clienteService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const BASE_URL = 'http://localhost:5000/api';

// ─── Facturas ────────────────────────────────────────────────────────────────

/**
 * Retorna las facturas del cliente con items y estado de envio.
 * @param {number} id_cliente
 */
export const getFacturas = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/facturas/cliente/${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener facturas');
  return res.json();
};

// ─── Valoraciones ─────────────────────────────────────────────────────────────

/**
 * Retorna valoraciones y promedio de un producto.
 * @param {number} id_producto
 */
export const getValoraciones = async (id_producto) => {
  const res = await fetch(`${BASE_URL}/valoraciones/producto/${id_producto}`);
  if (!res.ok) throw new Error('Error al obtener valoraciones');
  return res.json();
};

/**
 * Registra una valoracion del cliente sobre un producto.
 * @param {Object} datos - { id_factura, id_producto, id_cliente, puntaje, comentario }
 */
export const addValoracion = async (datos) => {
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
export const getReclamos = async (id_cliente) => {
  const res = await fetch(`${BASE_URL}/reclamos/cliente/${id_cliente}`);
  if (!res.ok) throw new Error('Error al obtener reclamos');
  return res.json();
};

/**
 * Registra un reclamo vinculado a una factura.
 * @param {Object} datos - { id_factura, id_cliente, motivo, descripcion }
 */
export const addReclamo = async (datos) => {
  const res = await fetch(`${BASE_URL}/reclamos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al registrar reclamo');
  return json;
};