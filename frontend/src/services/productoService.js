/**
 * @fileoverview Servicio de acceso a la API para la gestión de productos.
 * Centraliza todas las peticiones HTTP relacionadas con productos:
 * obtención, creación, edición, eliminación y restauración.
 *
 * @module productoService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const BASE_URL = 'http://localhost:5000/api';

/**
 * Obtiene la lista de productos desde la API.
 * Si se proporciona un ID de usuario, filtra los productos de ese emprendedor.
 *
 * @async
 * @param {number} [id_usuario]
 * @returns {Promise<Array<Object>>}
 */
export const getProducts = async (id_usuario) => {
  const url = id_usuario ? `${BASE_URL}/productos?id_usuario=${id_usuario}` : `${BASE_URL}/productos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
};

/**
 * Obtiene un producto por su ID, incluyendo nombreEmprendimiento del emprendedor.
 *
 * @async
 * @param {number|string} id - ID del producto.
 * @returns {Promise<Object>} Producto con datos del emprendedor.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const getProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`);
  if (!res.ok) throw new Error('Error al obtener el producto');
  return await res.json();
};

/**
 * Obtiene la lista de productos eliminados (soft delete) desde la API.
 *
 * @async
 * @param {number} [id_usuario]
 * @returns {Promise<Array<Object>>}
 */
export const getDeletedProducts = async (id_usuario) => {
  const url = id_usuario
    ? `${BASE_URL}/productos/eliminados?id_usuario=${id_usuario}`
    : `${BASE_URL}/productos/eliminados`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener productos eliminados');
  return await res.json();
};

/**
 * Obtiene la lista de categorías disponibles desde la API.
 *
 * @async
 * @returns {Promise<Array<Object>>}
 */
export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías del servidor');
  return await res.json();
};

/**
 * Crea un nuevo producto en la plataforma.
 *
 * @async
 * @returns {Promise<Object>}
 */
export const createProduct = async (nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen) => {
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('precio', precio);
  formData.append('stock', stock);
  formData.append('id_categoria', id_categoria);
  formData.append('id_usuario', id_usuario);
  if (imagen) formData.append('imagen', imagen);

  const res = await fetch(`${BASE_URL}/productos`, { method: 'POST', body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al crear producto');
  return json;
};

/**
 * Actualiza los datos de un producto existente.
 *
 * @async
 * @returns {Promise<Object>}
 */
export const updateProduct = async (id, nombre, descripcion, precio, stock, id_categoria, imagen) => {
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('precio', precio);
  formData.append('stock', stock);
  formData.append('id_categoria', id_categoria);
  if (imagen) formData.append('imagen', imagen);

  const res = await fetch(`${BASE_URL}/productos/${id}`, { method: 'PUT', body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al actualizar producto');
  return json;
};

/**
 * Elimina un producto por su ID (soft delete).
 *
 * @async
 * @returns {Promise<Object>}
 */
export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al eliminar producto');
  return json;
};

/**
 * Restaura un producto previamente eliminado por su ID.
 *
 * @async
 * @returns {Promise<Object>}
 */
export const restoreProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}/restaurar`, { method: 'PUT' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al restaurar producto');
  return json;
};