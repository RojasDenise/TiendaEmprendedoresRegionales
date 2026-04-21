/**
 * @fileoverview Servicio de acceso a la API para la gestión de productos.
 * Centraliza todas las peticiones HTTP relacionadas con productos:
 * obtención, creación, edición, eliminación y restauración.
 * Todas las funciones lanzan un Error con el mensaje del servidor si la respuesta no es exitosa.
 *
 * @module productoService
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/** URL base de la API para todos los endpoints del servicio. */
const BASE_URL = 'http://localhost:5000/api';

/**
 * Obtiene la lista de productos desde la API.
 * Si se proporciona un ID de usuario, filtra los productos de ese emprendedor.
 * Si no se proporciona, devuelve todos los productos de la plataforma.
 *
 * @async
 * @param {number} [id_usuario] - ID del emprendedor cuyos productos se quieren obtener. Opcional.
 * @returns {Promise<Array<Object>>} Lista de productos.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const getProducts = async (id_usuario) => {
  const url = id_usuario ? `${BASE_URL}/productos?id_usuario=${id_usuario}` : `${BASE_URL}/productos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
};

/**
 * Obtiene la lista de productos eliminados (soft delete) desde la API.
 * Si se proporciona un ID de usuario, filtra los eliminados de ese emprendedor.
 * Si no se proporciona, devuelve todos los productos eliminados de la plataforma.
 *
 * @async
 * @param {number} [id_usuario] - ID del emprendedor cuyos productos eliminados se quieren obtener. Opcional.
 * @returns {Promise<Array<Object>>} Lista de productos eliminados.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
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
 * @returns {Promise<Array<Object>>} Lista de categorías.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías del servidor');
  return await res.json();
};

/**
 * Crea un nuevo producto en la plataforma.
 * Construye un FormData para enviar los datos del producto junto con la imagen,
 * si el usuario seleccionó una. El Content-Type es asignado automáticamente por el browser.
 *
 * @async
 * @param {string} nombre - Nombre del producto.
 * @param {string} descripcion - Descripción del producto.
 * @param {number} precio - Precio del producto.
 * @param {number} stock - Stock disponible del producto.
 * @param {number} id_categoria - ID de la categoría a la que pertenece el producto.
 * @param {number} id_usuario - ID del emprendedor que crea el producto.
 * @param {File|null} imagen - Archivo de imagen del producto. Puede ser null si no se carga imagen.
 * @returns {Promise<Object>} Respuesta del servidor con los datos del producto creado.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const createProduct = async (nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen) => {
  // Creamos el contenedor para enviar texto + archivo físico
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('precio', precio);
  formData.append('stock', stock);
  formData.append('id_categoria', id_categoria);
  formData.append('id_usuario', id_usuario);
  
  if (imagen) {
    formData.append('imagen', imagen); 
  }

  const res = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    body: formData, 
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al crear producto');
  return json;
};

/**
 * Actualiza los datos de un producto existente.
 * Construye un FormData con los campos modificados e incluye la nueva imagen
 * solo si el usuario seleccionó una. Si no se adjunta imagen, el servidor conserva la actual.
 *
 * @async
 * @param {number} id - ID del producto a actualizar.
 * @param {string} nombre - Nuevo nombre del producto.
 * @param {string} descripcion - Nueva descripción del producto.
 * @param {number} precio - Nuevo precio del producto.
 * @param {number} stock - Nuevo stock del producto.
 * @param {number} id_categoria - Nuevo ID de categoría del producto.
 * @param {File|null} imagen - Nueva imagen del producto. Puede ser null para conservar la actual.
 * @returns {Promise<Object>} Respuesta del servidor con los datos del producto actualizado.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const updateProduct = async (id, nombre, descripcion, precio, stock, id_categoria, imagen) => {
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('precio', precio);
  formData.append('stock', stock);
  formData.append('id_categoria', id_categoria);
 
  if (imagen) {
    formData.append('imagen', imagen);
  }
 
  const res = await fetch(`http://localhost:5000/api/productos/${id}`, {
    method: 'PUT',
    body: formData, // ✅ sin Content-Type, el browser lo pone solo con el boundary
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al actualizar producto');
  return json;
};

/**
 * Elimina un producto por su ID (soft delete).
 * El producto deja de estar visible en el catálogo activo pero puede restaurarse.
 *
 * @async
 * @param {number} id - ID del producto a eliminar.
 * @returns {Promise<Object>} Respuesta del servidor confirmando la eliminación.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al eliminar producto');
  return json;
};

/**
 * Restaura un producto previamente eliminado por su ID.
 * El producto vuelve a estar visible en el catálogo activo del emprendedor.
 *
 * @async
 * @param {number} id - ID del producto a restaurar.
 * @returns {Promise<Object>} Respuesta del servidor confirmando la restauración.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
export const restoreProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}/restaurar`, { method: 'PUT' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al restaurar producto');
  return json;
};