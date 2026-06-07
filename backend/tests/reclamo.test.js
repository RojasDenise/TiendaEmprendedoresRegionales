import { describe, it, expect } from 'vitest';

const crearReclamo = ({
  id_factura,
  id_cliente,
  motivo,
  descripcion,
  estado_envio,
  facturaPerteneceCliente,
  yaExisteReclamo
}) => {
  if (!id_factura || !id_cliente || !motivo || !descripcion) {
    throw new Error('Faltan campos requeridos');
  }

  if (estado_envio !== 'Entregado') {
    throw new Error('Solo podés reclamar compras que ya fueron entregadas');
  }

  if (!facturaPerteneceCliente) {
    throw new Error('No puede realizar reclamos sobre compras no realizadas por el cliente');
  }

  if (yaExisteReclamo) {
    throw new Error('Ya existe un reclamo para esta compra');
  }

  return {
    mensaje: 'Reclamo registrado con éxito'
  };
};

const responderReclamo = ({
  id_reclamo,
  id_usuario,
  contenido,
  estado
}) => {
  if (!id_reclamo || !id_usuario || !contenido) {
    throw new Error('Complete todos los campos');
  }

  if (estado === 'Respondido') {
    throw new Error('El reclamo ya fue respondido');
  }

  if (estado === 'Resuelto') {
    throw new Error('No se puede responder un reclamo que ya fue resuelto');
  }

  return {
    mensaje: 'Respuesta registrada con éxito'
  };
};

const resolverReclamo = ({ id_reclamo, estado }) => {
  if (!id_reclamo) {
    throw new Error('Reclamo no encontrado');
  }

  if (estado === 'Resuelto') {
    throw new Error('El reclamo ya se encuentra resuelto');
  }

  return {
    mensaje: 'El reclamo ha sido marcado como resuelto'
  };
};

describe('Reclamo', () => {
  describe('crearReclamo', () => {
    it('acepta un reclamo válido', () => {
      const reclamo = {
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'El producto llegó roto.',
        estado_envio: 'Entregado',
        facturaPerteneceCliente: true,
        yaExisteReclamo: false
      };

      expect(crearReclamo(reclamo)).toEqual({
        mensaje: 'Reclamo registrado con éxito'
      });
    });

    it('rechaza motivo vacío', () => {
      const reclamo = {
        id_factura: 7,
        id_cliente: 1,
        motivo: '',
        descripcion: 'El producto llegó roto.',
        estado_envio: 'Entregado',
        facturaPerteneceCliente: true,
        yaExisteReclamo: false
      };

      expect(() => crearReclamo(reclamo))
        .toThrow('Faltan campos requeridos');
    });

    it('rechaza descripción vacía', () => {
      const reclamo = {
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: '',
        estado_envio: 'Entregado',
        facturaPerteneceCliente: true,
        yaExisteReclamo: false
      };

      expect(() => crearReclamo(reclamo))
        .toThrow('Faltan campos requeridos');
    });

    it('rechaza compra no entregada', () => {
      const reclamo = {
        id_factura: 2,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'El producto llegó roto.',
        estado_envio: 'En Camino',
        facturaPerteneceCliente: true,
        yaExisteReclamo: false
      };

      expect(() => crearReclamo(reclamo))
        .toThrow('Solo podés reclamar compras que ya fueron entregadas');
    });

    it('rechaza factura que no pertenece al cliente', () => {
      const reclamo = {
        id_factura: 9,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'El producto llegó roto.',
        estado_envio: 'Entregado',
        facturaPerteneceCliente: false,
        yaExisteReclamo: false
      };

      expect(() => crearReclamo(reclamo))
        .toThrow('No puede realizar reclamos sobre compras no realizadas por el cliente');
    });

    it('rechaza reclamo duplicado', () => {
      const reclamo = {
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'El producto llegó roto.',
        estado_envio: 'Entregado',
        facturaPerteneceCliente: true,
        yaExisteReclamo: true
      };

      expect(() => crearReclamo(reclamo))
        .toThrow('Ya existe un reclamo para esta compra');
    });
  });

  describe('responderReclamo', () => {
    it('acepta respuesta válida', () => {
      const respuesta = {
        id_reclamo: 6,
        id_usuario: 8,
        contenido: 'Lamentamos el inconveniente. Nos comunicaremos para solucionar el problema.',
        estado: 'Pendiente'
      };

      expect(responderReclamo(respuesta)).toEqual({
        mensaje: 'Respuesta registrada con éxito'
      });
    });

    it('rechaza respuesta vacía', () => {
      const respuesta = {
        id_reclamo: 6,
        id_usuario: 8,
        contenido: '',
        estado: 'Pendiente'
      };

      expect(() => responderReclamo(respuesta))
        .toThrow('Complete todos los campos');
    });

    it('rechaza reclamo inexistente', () => {
      const respuesta = {
        id_reclamo: null,
        id_usuario: 8,
        contenido: 'Respuesta válida',
        estado: 'Pendiente'
      };

      expect(() => responderReclamo(respuesta))
        .toThrow('Complete todos los campos');
    });

    it('rechaza reclamo ya respondido', () => {
      const respuesta = {
        id_reclamo: 6,
        id_usuario: 8,
        contenido: 'Se procederá al reemplazo.',
        estado: 'Respondido'
      };

      expect(() => responderReclamo(respuesta))
        .toThrow('El reclamo ya fue respondido');
    });

    it('rechaza reclamo resuelto', () => {
      const respuesta = {
        id_reclamo: 7,
        id_usuario: 8,
        contenido: 'Se procederá al reemplazo.',
        estado: 'Resuelto'
      };

      expect(() => responderReclamo(respuesta))
        .toThrow('No se puede responder un reclamo que ya fue resuelto');
    });
  });

  describe('resolverReclamo', () => {
    it('resuelve un reclamo pendiente', () => {
      const reclamo = {
        id_reclamo: 6,
        estado: 'Pendiente'
      };

      expect(resolverReclamo(reclamo)).toEqual({
        mensaje: 'El reclamo ha sido marcado como resuelto'
      });
    });

    it('rechaza resolver un reclamo inexistente', () => {
      const reclamo = {
        id_reclamo: null,
        estado: 'Pendiente'
      };

      expect(() => resolverReclamo(reclamo))
        .toThrow('Reclamo no encontrado');
    });

    it('rechaza resolver un reclamo ya resuelto', () => {
      const reclamo = {
        id_reclamo: 7,
        estado: 'Resuelto'
      };

      expect(() => resolverReclamo(reclamo))
        .toThrow('El reclamo ya se encuentra resuelto');
    });
  });
});