import { describe, it, expect } from 'vitest';

const crearReclamo = ({
  id_factura,
  id_cliente,
  motivo,
  descripcion,
  estado_envio,
  facturaPerteneceCliente = true,
  yaExisteReclamo = false,
  facturaExiste = true
}) => {
  if (!id_factura || !id_cliente || !motivo || !descripcion) {
    throw new Error('Faltan campos requeridos');
  }

  if (!facturaExiste) {
    throw new Error('Factura no encontrada');
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

  return { mensaje: 'Reclamo registrado con éxito' };
};

const responderReclamo = ({
  id_reclamo,
  id_usuario,
  contenido,
  estado,
  reclamoExiste = true
}) => {
  if (!id_reclamo || !id_usuario || !contenido) {
    throw new Error('Complete todos los campos');
  }

  if (!reclamoExiste) {
    throw new Error('Reclamo no encontrado');
  }

  if (estado === 'Respondido') {
    throw new Error('El reclamo ya fue respondido');
  }

  if (estado === 'Resuelto') {
    throw new Error('No se puede responder un reclamo que ya fue resuelto');
  }

  return { mensaje: 'Respuesta registrada con éxito' };
};

const resolverReclamo = ({
  id_reclamo,
  estado,
  reclamoExiste = true
}) => {
  if (!id_reclamo || !reclamoExiste) {
    throw new Error('Reclamo no encontrado');
  }

  if (estado === 'Resuelto') {
    throw new Error('El reclamo ya se encuentra resuelto');
  }

  return { mensaje: 'El reclamo ha sido marcado como resuelto' };
};

describe('Pruebas unitarias - Reclamos', () => {
  describe('crearReclamo', () => {
    it('CR-C01 - debe crear un reclamo válido', () => {
      expect(crearReclamo({
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado'
      })).toEqual({ mensaje: 'Reclamo registrado con éxito' });
    });

    it('CR-C02 - debe rechazar factura faltante', () => {
      expect(() => crearReclamo({
        id_factura: null,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado'
      })).toThrow('Faltan campos requeridos');
    });

    it('CR-C03 - debe rechazar cliente faltante', () => {
      expect(() => crearReclamo({
        id_factura: 7,
        id_cliente: null,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado'
      })).toThrow('Faltan campos requeridos');
    });

    it('CR-C04 - debe rechazar motivo vacío', () => {
      expect(() => crearReclamo({
        id_factura: 7,
        id_cliente: 1,
        motivo: '',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado'
      })).toThrow('Faltan campos requeridos');
    });

    it('CR-C05 - debe rechazar descripción vacía', () => {
      expect(() => crearReclamo({
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: '',
        estado_envio: 'Entregado'
      })).toThrow('Faltan campos requeridos');
    });

    it('CR-C06 - debe rechazar compra no entregada', () => {
      expect(() => crearReclamo({
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'En camino'
      })).toThrow('Solo podés reclamar compras que ya fueron entregadas');
    });

    it('CR-C07 - debe rechazar factura que no pertenece al cliente', () => {
      expect(() => crearReclamo({
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado',
        facturaPerteneceCliente: false
      })).toThrow('No puede realizar reclamos sobre compras no realizadas por el cliente');
    });

    it('CR-C08 - debe rechazar reclamo duplicado', () => {
      expect(() => crearReclamo({
        id_factura: 7,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado',
        yaExisteReclamo: true
      })).toThrow('Ya existe un reclamo para esta compra');
    });

    it('CR-C09 - debe rechazar factura inexistente', () => {
      expect(() => crearReclamo({
        id_factura: 99,
        id_cliente: 1,
        motivo: 'Producto defectuoso',
        descripcion: 'Llegó roto',
        estado_envio: 'Entregado',
        facturaExiste: false
      })).toThrow('Factura no encontrada');
    });
  });

  describe('responderReclamo', () => {
    it('CR-R01 - debe responder un reclamo válido', () => {
      expect(responderReclamo({
        id_reclamo: 6,
        id_usuario: 8,
        contenido: 'Se revisará el caso',
        estado: 'Pendiente'
      })).toEqual({ mensaje: 'Respuesta registrada con éxito' });
    });

    it('CR-R02 - debe rechazar reclamo faltante', () => {
      expect(() => responderReclamo({
        id_reclamo: null,
        id_usuario: 8,
        contenido: 'Respuesta',
        estado: 'Pendiente'
      })).toThrow('Complete todos los campos');
    });

    it('CR-R03 - debe rechazar usuario faltante', () => {
      expect(() => responderReclamo({
        id_reclamo: 6,
        id_usuario: null,
        contenido: 'Respuesta',
        estado: 'Pendiente'
      })).toThrow('Complete todos los campos');
    });

    it('CR-R04 - debe rechazar contenido vacío', () => {
      expect(() => responderReclamo({
        id_reclamo: 6,
        id_usuario: 8,
        contenido: '',
        estado: 'Pendiente'
      })).toThrow('Complete todos los campos');
    });

    it('CR-R05 - debe rechazar reclamo ya respondido', () => {
      expect(() => responderReclamo({
        id_reclamo: 6,
        id_usuario: 8,
        contenido: 'Respuesta',
        estado: 'Respondido'
      })).toThrow('El reclamo ya fue respondido');
    });

    it('CR-R06 - debe rechazar reclamo resuelto', () => {
      expect(() => responderReclamo({
        id_reclamo: 6,
        id_usuario: 8,
        contenido: 'Respuesta',
        estado: 'Resuelto'
      })).toThrow('No se puede responder un reclamo que ya fue resuelto');
    });

    it('CR-R07 - debe rechazar reclamo inexistente', () => {
      expect(() => responderReclamo({
        id_reclamo: 99,
        id_usuario: 8,
        contenido: 'Respuesta',
        estado: 'Pendiente',
        reclamoExiste: false
      })).toThrow('Reclamo no encontrado');
    });
  });

  describe('resolverReclamo', () => {
    it('CR-S01 - debe resolver un reclamo pendiente', () => {
      expect(resolverReclamo({
        id_reclamo: 6,
        estado: 'Pendiente'
      })).toEqual({ mensaje: 'El reclamo ha sido marcado como resuelto' });
    });

    it('CR-S02 - debe rechazar reclamo faltante', () => {
      expect(() => resolverReclamo({
        id_reclamo: null,
        estado: 'Pendiente'
      })).toThrow('Reclamo no encontrado');
    });

    it('CR-S03 - debe rechazar reclamo inexistente', () => {
      expect(() => resolverReclamo({
        id_reclamo: 99,
        estado: 'Pendiente',
        reclamoExiste: false
      })).toThrow('Reclamo no encontrado');
    });

    it('CR-S04 - debe rechazar reclamo ya resuelto', () => {
      expect(() => resolverReclamo({
        id_reclamo: 7,
        estado: 'Resuelto'
      })).toThrow('El reclamo ya se encuentra resuelto');
    });

    it('CR-S05 - debe resolver reclamo respondido', () => {
      expect(resolverReclamo({
        id_reclamo: 8,
        estado: 'Respondido'
      })).toEqual({ mensaje: 'El reclamo ha sido marcado como resuelto' });
    });
  });
});