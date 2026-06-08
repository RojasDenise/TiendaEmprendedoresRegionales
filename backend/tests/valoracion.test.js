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

  return { mensaje: 'Valoración registrada con éxito' };
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

describe('Pruebas unitarias - Valoraciones', () => {
  describe('agregarValoracion', () => {
    it('CV-C01 - debe crear una valoración válida', () => {
      expect(agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        comentario: 'Excelente',
        compraValida: true,
        yaValorado: false
      })).toEqual({ mensaje: 'Valoración registrada con éxito' });
    });

    it('CV-C02 - debe rechazar factura faltante', () => {
      expect(() => agregarValoracion({
        id_factura: null,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      })).toThrow('Faltan campos requeridos');
    });

    it('CV-C03 - debe rechazar producto faltante', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: null,
        id_cliente: 1,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      })).toThrow('Faltan campos requeridos');
    });

    it('CV-C04 - debe rechazar cliente faltante', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: null,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      })).toThrow('Faltan campos requeridos');
    });

    it('CV-C05 - debe rechazar puntaje faltante', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: null,
        compraValida: true,
        yaValorado: false
      })).toThrow('Faltan campos requeridos');
    });

    it('CV-C06 - debe rechazar puntaje menor al mínimo', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 0,
        compraValida: true,
        yaValorado: false
      })).toThrow('El puntaje debe estar entre 1 y 5');
    });

    it('CV-C07 - debe rechazar puntaje mayor al máximo', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 6,
        compraValida: true,
        yaValorado: false
      })).toThrow('El puntaje debe estar entre 1 y 5');
    });

    it('CV-C08 - debe aceptar puntaje mínimo válido', () => {
      expect(agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 1,
        compraValida: true,
        yaValorado: false
      })).toEqual({ mensaje: 'Valoración registrada con éxito' });
    });

    it('CV-C09 - debe aceptar puntaje máximo válido', () => {
      expect(agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        compraValida: true,
        yaValorado: false
      })).toEqual({ mensaje: 'Valoración registrada con éxito' });
    });

    it('CV-C10 - debe rechazar producto no comprado por el cliente', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 4,
        compraValida: false,
        yaValorado: false
      })).toThrow('No puede valorar productos que no compró');
    });

    it('CV-C11 - debe rechazar valoración duplicada', () => {
      expect(() => agregarValoracion({
        id_factura: 7,
        id_producto: 1,
        id_cliente: 1,
        puntaje: 5,
        compraValida: true,
        yaValorado: true
      })).toThrow('Ya valoraste este producto para esta compra');
    });
  });

  describe('obtenerValoracionesPorProducto', () => {
    it('CV-O01 - debe calcular promedio con varias valoraciones', () => {
      const valoraciones = [
        { puntaje: 5 },
        { puntaje: 4 },
        { puntaje: 3 }
      ];

      expect(obtenerValoracionesPorProducto(valoraciones)).toEqual({
        promedio: 4,
        total: 3,
        valoraciones
      });
    });

    it('CV-O02 - debe devolver promedio cero si no hay valoraciones', () => {
      expect(obtenerValoracionesPorProducto([])).toEqual({
        promedio: 0,
        total: 0,
        valoraciones: []
      });
    });

    it('CV-O03 - debe calcular promedio decimal', () => {
      const valoraciones = [
        { puntaje: 5 },
        { puntaje: 5 },
        { puntaje: 4 }
      ];

      expect(obtenerValoracionesPorProducto(valoraciones).promedio).toBe(4.7);
    });

    it('CV-O04 - debe calcular promedio con una valoración mínima', () => {
      const valoraciones = [{ puntaje: 1 }];

      expect(obtenerValoracionesPorProducto(valoraciones)).toEqual({
        promedio: 1,
        total: 1,
        valoraciones
      });
    });

    it('CV-O05 - debe calcular promedio con una valoración máxima', () => {
      const valoraciones = [{ puntaje: 5 }];

      expect(obtenerValoracionesPorProducto(valoraciones)).toEqual({
        promedio: 5,
        total: 1,
        valoraciones
      });
    });
  });
});