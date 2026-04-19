const BASE_URL = 'http://localhost:5000/api';

export const getProducts = async (id_usuario) => {
  const url = id_usuario ? `${BASE_URL}/productos?id_usuario=${id_usuario}` : `${BASE_URL}/productos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
};

export const getDeletedProducts = async (id_usuario) => {
  const url = id_usuario
    ? `${BASE_URL}/productos/eliminados?id_usuario=${id_usuario}`
    : `${BASE_URL}/productos/eliminados`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener productos eliminados');
  return await res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías del servidor');
  return await res.json();
};

export const createProduct = async (nombre, descripcion, precio, stock, id_categoria, id_usuario) => {
  const res = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      id_categoria: parseInt(id_categoria),
      id_usuario: parseInt(id_usuario),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al crear producto');
  return json;
};

export const updateProduct = async (id, nombre, descripcion, precio, stock, id_categoria) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, descripcion, precio, stock, id_categoria }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al actualizar producto');
  return json;
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al eliminar producto');
  return json;
};

export const restoreProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}/restaurar`, { method: 'PUT' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al restaurar producto');
  return json;
};