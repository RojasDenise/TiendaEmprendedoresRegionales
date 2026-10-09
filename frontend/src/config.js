/**
 * URL base del backend. Se configura con la variable VITE_API_URL
 * en frontend/.env (ver .env.example). Si no está definida, usa el
 * backend local para desarrollo.
 */
export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

/** Base de todos los endpoints de la API. */
export const API_URL = `${API_BASE}/api`;

/** Carpeta pública donde el backend sirve las imágenes subidas. */
export const UPLOADS_URL = `${API_BASE}/uploads/`;

/**
 * Devuelve la dirección completa de una imagen guardada en la base.
 * - Si ya es una URL (las imágenes en Cloudinary), la devuelve tal cual.
 * - Si es solo un nombre de archivo (imágenes en disco), le antepone UPLOADS_URL.
 *
 * Uso: <img src={urlImagen(producto.imagen)} />
 *
 * @param {string|null} imagen - Valor de la columna `imagen`.
 * @returns {string}
 */
export const urlImagen = (imagen) => {
  if (!imagen) return '';
  return /^https?:\/\//i.test(imagen) ? imagen : `${UPLOADS_URL}${imagen}`;
};
