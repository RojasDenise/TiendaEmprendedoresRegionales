import { describe, it, expect } from 'vitest';

const agregarValoracion = ({
  id_factura,
  id_producto,
  id_cliente,
  puntaje,
  comentario,
  compraValida,
  yaValorado
}) => {
  if (
    id_factura == null ||
    id_producto == null ||
    id_cliente == null ||
    puntaje == null
  ) {
    throw new Error('Faltan campos requeridos');
  }

  if (puntaje < 1 || puntaje > 5) {
    throw new Error('El puntaje debe estar entre 1 y 5');
  }

  if (!compraValida) {
    throw new Error('No puede valorar productos que no compró');
  }

  if (yaValorado) {
    throw new Error('Ya valoraste este producto para esta compra');
  }

  return {
    mensaje: 'Valoración registrada con éxito'
  };
};

const obtenerValoracionesPorProducto = (valoraciones) => {
  const total = valoraciones.length;

  const promedio =
    total > 0
      ? parseFloat(
          (
            valoraciones.reduce(
              (acumulador, valoracion) => acumulador + valoracion.puntaje,
              0
            ) / total
          ).toFixed(1)
        )
      : 0;

  return {
    promedio,
    total,
    valoraciones
  };
};

describe('Valoración', () => {
  describe('agregarValoracion', () => {
    it('acepta una valoración válida', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        comentario: 'Excelente producto.',
        compraValida: true,
        yaValorado: false
      };

      expect(agregarValoracion(valoracion)).toEqual({
        mensaje: 'Valoración registrada con éxito'
      });
    });

    it('rechaza puntaje mayor a 5', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 7,
        comentario: 'Buen producto.',
        compraValida: true,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('El puntaje debe estar entre 1 y 5');
    });

    it('rechaza puntaje menor a 1', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 0,
        comentario: 'Buen producto.',
        compraValida: true,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('El puntaje debe estar entre 1 y 5');
    });

    it('rechaza producto no comprado por el cliente', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 3,
        id_cliente: 1,
        puntaje: 4,
        comentario: 'Buen producto.',
        compraValida: false,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('No puede valorar productos que no compró');
    });

    it('rechaza valoración duplicada', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        comentario: 'Excelente producto.',
        compraValida: true,
        yaValorado: true
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('Ya valoraste este producto para esta compra');
    });

    it('rechaza factura faltante', () => {
      const valoracion = {
        id_factura: null,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('Faltan campos requeridos');
    });

    it('rechaza producto faltante', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: null,
        id_cliente: 1,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('Faltan campos requeridos');
    });

    it('rechaza cliente faltante', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 1,
        id_cliente: null,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('Faltan campos requeridos');
    });

    it('rechaza puntaje faltante', () => {
      const valoracion = {
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: null,
        compraValida: true,
        yaValorado: false
      };

      expect(() => agregarValoracion(valoracion))
        .toThrow('Faltan campos requeridos');
    });
  });

  describe('obtenerValoracionesPorProducto', () => {
    it('calcula promedio y total de valoraciones', () => {
      const valoraciones = [
        { puntaje: 5, comentario: 'Excelente' },
        { puntaje: 4, comentario: 'Muy bueno' },
        { puntaje: 3, comentario: 'Bueno' }
      ];

      expect(obtenerValoracionesPorProducto(valoraciones)).toEqual({
        promedio: 4,
        total: 3,
        valoraciones
      });
    });

    it('devuelve promedio 0 si no hay valoraciones', () => {
      expect(obtenerValoracionesPorProducto([])).toEqual({
        promedio: 0,
        total: 0,
        valoraciones: []
      });
    });

    it('calcula correctamente promedio decimal', () => {
      const valoraciones = [
        { puntaje: 5 },
        { puntaje: 5 },
        { puntaje: 4 }
      ];

      expect(obtenerValoracionesPorProducto(valoraciones).promedio)
        .toBe(4.7);
    });
  });
});