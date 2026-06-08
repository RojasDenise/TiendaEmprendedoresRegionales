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

  if (!producto.id_categoria || producto.id_categoria <= 0) {
    return { ok: false, mensaje: 'La categoría es obligatoria' };
  }

  return { ok: true, mensaje: 'Producto válido' };
};

const actualizarProducto = (producto) => {
  if (!producto.id_producto || producto.id_producto <= 0) {
    return { ok: false, mensaje: 'Debe seleccionar un producto' };
  }

  if (producto.productoExiste === false) {
    return { ok: false, mensaje: 'Producto no encontrado' };
  }

  const validacion = crearProducto(producto);

  if (!validacion.ok) {
    return validacion;
  }

  return { ok: true, mensaje: 'Producto actualizado correctamente' };
};

const eliminarProducto = ({
  id_producto,
  productoExiste = true,
  tieneVentasAsociadas = false,
  tieneCarritoAsociado = false
}) => {
  if (!id_producto || id_producto <= 0) {
    return { ok: false, mensaje: 'Debe seleccionar un producto' };
  }

  if (!productoExiste) {
    return { ok: false, mensaje: 'Producto no encontrado' };
  }

  if (tieneVentasAsociadas) {
    return {
      ok: false,
      mensaje: 'No se puede eliminar un producto asociado a una venta'
    };
  }

  if (tieneCarritoAsociado) {
    return {
      ok: false,
      mensaje: 'No se puede eliminar un producto agregado a un carrito activo'
    };
  }

  return { ok: true, mensaje: 'Producto eliminado correctamente' };
};

describe('Pruebas unitarias - CRUD Producto', () => {
  describe('crearProducto', () => {
    it('CP-C01 - debe aceptar un producto con datos válidos', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      })).toEqual({ ok: true, mensaje: 'Producto válido' });
    });

    it('CP-C02 - debe rechazar nombre vacío', () => {
      expect(crearProducto({
        nombre: '',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('El nombre es obligatorio');
    });

    it('CP-C03 - debe rechazar nombre nulo', () => {
      expect(crearProducto({
        nombre: null,
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('El nombre es obligatorio');
    });

    it('CP-C04 - debe rechazar descripción vacía', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: '',
        precio: 15000,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('La descripción es obligatoria');
    });

    it('CP-C05 - debe rechazar descripción nula', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: null,
        precio: 15000,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('La descripción es obligatoria');
    });

    it('CP-C06 - debe rechazar precio igual a cero', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 0,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('El precio debe ser mayor a 0');
    });

    it('CP-C07 - debe rechazar precio negativo', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: -100,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('El precio debe ser mayor a 0');
    });

    it('CP-C08 - debe rechazar precio nulo', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: null,
        stock: 4,
        id_categoria: 2
      }).mensaje).toBe('El precio debe ser mayor a 0');
    });

    it('CP-C09 - debe rechazar stock negativo', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: -1,
        id_categoria: 2
      }).mensaje).toBe('El stock no puede ser negativo');
    });

    it('CP-C10 - debe aceptar stock igual a cero', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 0,
        id_categoria: 2
      }).ok).toBe(true);
    });

    it('CP-C11 - debe rechazar categoría nula', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: null
      }).mensaje).toBe('La categoría es obligatoria');
    });

    it('CP-C12 - debe rechazar categoría inválida', () => {
      expect(crearProducto({
        nombre: 'Mate',
        descripcion: 'Mate artesanal',
        precio: 15000,
        stock: 4,
        id_categoria: 0
      }).mensaje).toBe('La categoría es obligatoria');
    });
  });

  describe('actualizarProducto', () => {
    it('CP-U01 - debe actualizar un producto válido', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate actualizado',
        descripcion: 'Actualizado',
        precio: 18000,
        stock: 5,
        id_categoria: 2
      })).toEqual({ ok: true, mensaje: 'Producto actualizado correctamente' });
    });

    it('CP-U02 - debe rechazar producto no seleccionado', () => {
      expect(actualizarProducto({ id_producto: null }).mensaje)
        .toBe('Debe seleccionar un producto');
    });

    it('CP-U03 - debe rechazar producto inexistente', () => {
      expect(actualizarProducto({
        id_producto: 99,
        productoExiste: false
      }).mensaje).toBe('Producto no encontrado');
    });

    it('CP-U04 - debe rechazar nombre vacío al editar', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: '',
        descripcion: 'Actualizado',
        precio: 18000,
        stock: 5,
        id_categoria: 2
      }).mensaje).toBe('El nombre es obligatorio');
    });

    it('CP-U05 - debe rechazar descripción vacía al editar', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate',
        descripcion: '',
        precio: 18000,
        stock: 5,
        id_categoria: 2
      }).mensaje).toBe('La descripción es obligatoria');
    });

    it('CP-U06 - debe rechazar precio igual a cero al editar', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate',
        descripcion: 'Actualizado',
        precio: 0,
        stock: 5,
        id_categoria: 2
      }).mensaje).toBe('El precio debe ser mayor a 0');
    });

    it('CP-U07 - debe rechazar precio negativo al editar', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate',
        descripcion: 'Actualizado',
        precio: -100,
        stock: 5,
        id_categoria: 2
      }).mensaje).toBe('El precio debe ser mayor a 0');
    });

    it('CP-U08 - debe rechazar stock negativo al editar', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate',
        descripcion: 'Actualizado',
        precio: 18000,
        stock: -1,
        id_categoria: 2
      }).mensaje).toBe('El stock no puede ser negativo');
    });

    it('CP-U09 - debe permitir editar producto dejando stock en cero', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate',
        descripcion: 'Actualizado',
        precio: 18000,
        stock: 0,
        id_categoria: 2
      }).ok).toBe(true);
    });

    it('CP-U10 - debe rechazar categoría faltante al editar', () => {
      expect(actualizarProducto({
        id_producto: 1,
        nombre: 'Mate',
        descripcion: 'Actualizado',
        precio: 18000,
        stock: 5,
        id_categoria: null
      }).mensaje).toBe('La categoría es obligatoria');
    });
  });

  describe('eliminarProducto', () => {
    it('CP-D01 - debe eliminar producto existente', () => {
      expect(eliminarProducto({ id_producto: 1 })).toEqual({
        ok: true,
        mensaje: 'Producto eliminado correctamente'
      });
    });

    it('CP-D02 - debe rechazar eliminar sin seleccionar producto', () => {
      expect(eliminarProducto({ id_producto: null }).mensaje)
        .toBe('Debe seleccionar un producto');
    });

    it('CP-D03 - debe rechazar ID inválido', () => {
      expect(eliminarProducto({ id_producto: 0 }).mensaje)
        .toBe('Debe seleccionar un producto');
    });

    it('CP-D04 - debe rechazar producto inexistente', () => {
      expect(eliminarProducto({
        id_producto: 99,
        productoExiste: false
      }).mensaje).toBe('Producto no encontrado');
    });

    it('CP-D05 - debe rechazar producto con ventas asociadas', () => {
      expect(eliminarProducto({
        id_producto: 1,
        tieneVentasAsociadas: true
      }).mensaje).toBe('No se puede eliminar un producto asociado a una venta');
    });

    it('CP-D06 - debe rechazar producto agregado a carrito activo', () => {
      expect(eliminarProducto({
        id_producto: 1,
        tieneCarritoAsociado: true
      }).mensaje).toBe('No se puede eliminar un producto agregado a un carrito activo');
    });
  });
});