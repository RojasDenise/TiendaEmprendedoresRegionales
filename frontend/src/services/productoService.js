const BASE_URL = 'http://localhost:5000/api';

/**
 * Obtiene la lista de productos. 
 * Si se pasa id_usuario, filtra los productos de ese emprendedor.
 */
export const getProducts = async (id_usuario) => {
    try {
        const url = id_usuario ? `${BASE_URL}/productos?id_usuario=${id_usuario}` : `${BASE_URL}/productos`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener productos');
        return await res.json();
    } catch (error) {
        console.error("Error en getProducts:", error);
        throw error;
    }
};

/**
 * Obtiene todas las categorías para el select del formulario.
 */
export const getCategories = async () => {
    try {
        // Importante: La URL debe ser exactamente esta (sin tildes)
        const res = await fetch(`${BASE_URL}/categorias`);
        if (!res.ok) throw new Error('Error al obtener categorías del servidor');
        
        const data = await res.json();
        return data; // Retorna el array de categorías [ {id_categoria, descripcion}, ... ]
    } catch (error) {
        console.error("Error en getCategories:", error);
        throw error;
    }
};

/**
 * Crea un nuevo producto en la base de datos.
 */
export const createProduct = async (nombre, descripcion, precio, stock, id_categoria, id_usuario) => {
    try {
        const res = await fetch(`${BASE_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre, 
                descripcion, 
                precio: parseFloat(precio), 
                stock: parseInt(stock), 
                id_categoria: parseInt(id_categoria), 
                id_usuario: parseInt(id_usuario) 
            }),
        });
        
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error al crear producto');
        return json;
    } catch (error) {
        console.error("Error en createProduct:", error);
        throw error;
    }
};

/**
 * Actualiza un producto existente.
 */
export const updateProduct = async (id, nombre, descripcion, precio, stock, id_categoria) => {
    try {
        const res = await fetch(`${BASE_URL}/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, precio, stock, id_categoria }),
        });
        
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error al actualizar producto');
        return json;
    } catch (error) {
        console.error("Error en updateProduct:", error);
        throw error;
    }
};

/**
 * Elimina un producto por su ID.
 */
export const deleteProduct = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/productos/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error al eliminar producto');
        return json;
    } catch (error) {
        console.error("Error en deleteProduct:", error);
        throw error;
    }
};