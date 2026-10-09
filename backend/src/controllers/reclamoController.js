const reclamoService = require('../services/reclamoService');
const { upload, guardarImagen } = require('../config/upload');
const { responderError, responderErrorInterno } = require('../utils/errores');

// ─── Controllers ─────────────────────────────────────────────────────────────

const listarReclamos = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    if (!id_usuario) return res.status(400).json({ error: 'Se requiere id_usuario' });
    const reclamos = await reclamoService.obtenerReclamos(parseInt(id_usuario));
    res.json(reclamos);
  } catch (error) {
    responderErrorInterno(res, error, 'listarReclamos');
  }
};

const obtenerDetalle = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const reclamo = await reclamoService.obtenerDetalle(parseInt(id_reclamo));
    res.json(reclamo);
  } catch (error) {
    const status = error.message === 'Reclamo no encontrado' ? 404 : 500;
    responderError(res, error, status, 'obtenerDetalle');
  }
};

const obtenerMensajes = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const mensajes = await reclamoService.obtenerMensajes(parseInt(id_reclamo));
    res.json(mensajes);
  } catch (error) {
    responderErrorInterno(res, error, 'obtenerMensajes');
  }
};

const responderReclamo = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const { id_usuario, contenido } = req.body;
    if (!id_usuario || !contenido) {
      return res.status(400).json({ error: 'Complete todos los campos' });
    }
    const imagen = await guardarImagen(req.file, 'reclamos');
    const result = await reclamoService.responderReclamo(
      parseInt(id_reclamo), parseInt(id_usuario), contenido, imagen
    );
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('vacío') ? 400 : 500;
    responderError(res, error, status, 'responderReclamo');
  }
};

const responderCliente = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const { id_cliente, contenido } = req.body;
    if (!id_cliente || !contenido) {
      return res.status(400).json({ error: 'Complete todos los campos' });
    }
    const imagen = await guardarImagen(req.file, 'reclamos');
    const result = await reclamoService.responderCliente(
      parseInt(id_reclamo), parseInt(id_cliente), contenido, imagen
    );
    res.status(201).json(result);
  } catch (error) {
    responderError(res, error, 400, 'responderCliente');
  }
};

const resolverReclamo = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const result = await reclamoService.resolverReclamo(parseInt(id_reclamo));
    res.json(result);
  } catch (error) {
    const status = error.message.includes('no encontrado') ? 404 : 400;
    responderError(res, error, status, 'resolverReclamo');
  }
};

const crearReclamo = async (req, res) => {
  try {
    const imagen = await guardarImagen(req.file, 'reclamos');
    const result = await reclamoService.crearReclamo({ ...req.body, imagen });
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('Ya existe') ? 409
      : error.message.includes('entregadas') ? 403
      : error.message.includes('no realizadas') ? 403
      : 400;

    responderError(res, error, status, 'crearReclamo');
  }
};

const obtenerReclamosCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const reclamos = await reclamoService.obtenerReclamosCliente(parseInt(id_cliente));
    res.json(reclamos);
  } catch (error) {
    responderErrorInterno(res, error, 'obtenerReclamosCliente');
  }
};

module.exports = {
  upload,
  listarReclamos,
  obtenerDetalle,
  obtenerMensajes,
  responderReclamo,
  responderCliente,
  resolverReclamo,
  crearReclamo,
  obtenerReclamosCliente,
};