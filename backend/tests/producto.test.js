import { describe, it, expect } from 'vitest';

const crearProducto = (producto) => {
  if (!producto.nombre) {
    return { ok: false, mensaje: 'El nombre es obligatorio' };
  }

  if (!producto.descripcion) {
    return { ok: false, mensaje: 'La descripción es obligatoria' };
  }

  if (!producto.precio || producto.precio <= 0) {
    return { ok: false, mensaje: 'El precio debe ser mayor a 0' };
  }

  if (producto.stock < 0) {
    return { ok: false, mensaje: 'El stock no puede ser negativo' };
  }

  if (!producto.id_categoria) {
    return { ok: false, mensaje: 'La categoría es obligatoria' };
  }

  return { ok: true, mensaje: 'Producto válido' };
};

const actualizarProducto = (producto) => {
  return crearProducto(producto);
};

const eliminarProducto = (id_producto) => {
  if (!id_producto) {
    return { ok: false, mensaje: 'Debe seleccionar un producto' };
  }

  return { ok: true, mensaje: 'Producto eliminado correctamente' };
};

const obtenerProductos = (productos) => {
  return Array.isArray(productos);
};

describe('Pruebas unitarias - CRUD Producto', () => {
  describe('crearProducto', () => {
    it('debe aceptar un producto con datos válidos', () => {
      const producto = {
        nombre: 'Mate de vidrio',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      };

      expect(crearProducto(producto)).toEqual({
        ok: true,
        mensaje: 'Producto válido'
      });
    });

    it('debe rechazar un producto sin nombre', () => {
      const producto = {
        nombre: '',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      };

      expect(crearProducto(producto).ok).toBe(false);
    });

    it('debe rechazar descripción vacía', () => {
      const producto = {
        nombre: 'Mate',
        descripcion: '',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      };

      expect(crearProducto(producto).ok).toBe(false);
    });

    it('debe rechazar un producto con precio inválido', () => {
      const producto = {
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 0,
        stock: 4,
        id_categoria: 2
      };

      expect(crearProducto(producto).ok).toBe(false);
    });

    it('debe rechazar stock negativo', () => {
      const producto = {
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: -1,
        id_categoria: 2
      };

      expect(crearProducto(producto).ok).toBe(false);
    });

    it('debe aceptar stock igual a cero', () => {
      const producto = {
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 0,
        id_categoria: 2
      };

      expect(crearProducto(producto).ok).toBe(true);
    });

    it('debe rechazar categoría vacía', () => {
      const producto = {
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: null
      };

      expect(crearProducto(producto).ok).toBe(false);
    });
  });

  describe('actualizarProducto', () => {
    it('debe aceptar la actualización de un producto válido', () => {
      const producto = {
        nombre: 'Mate actualizado',
        descripcion: 'Actualizado desde prueba',
        precio: 18000,
        stock: 5,
        id_categoria: 2
      };

      expect(actualizarProducto(producto).ok).toBe(true);
    });
  });

  describe('eliminarProducto', () => {
    it('debe permitir eliminar si existe id_producto', () => {
      expect(eliminarProducto(1).ok).toBe(true);
    });

    it('debe rechazar eliminar sin id_producto', () => {
      expect(eliminarProducto(null).ok).toBe(false);
    });
  });

  describe('obtenerProductos', () => {
    it('debe devolver una lista de productos', () => {
      const productos = [
        { id_producto: 1, nombre: 'Mate' },
        { id_producto: 2, nombre: 'Bombilla' }
      ];

      expect(obtenerProductos(productos)).toBe(true);
    });
  });
});