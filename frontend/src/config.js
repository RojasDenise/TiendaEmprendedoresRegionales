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
