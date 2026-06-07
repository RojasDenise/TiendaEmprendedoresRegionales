const reclamoService = require('../services/reclamoService');
const multer = require('multer');
const path = require('path');

// ─── Configuración multer ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|webp/;
  permitidos.test(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Controllers ─────────────────────────────────────────────────────────────

const listarReclamos = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    if (!id_usuario) return res.status(400).json({ error: 'Se requiere id_usuario' });
    const reclamos = await reclamoService.obtenerReclamos(parseInt(id_usuario));
    res.json(reclamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerDetalle = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const reclamo = await reclamoService.obtenerDetalle(parseInt(id_reclamo));
    res.json(reclamo);
  } catch (error) {
    const status = error.message === 'Reclamo no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

const obtenerMensajes = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const mensajes = await reclamoService.obtenerMensajes(parseInt(id_reclamo));
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const responderReclamo = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const { id_usuario, contenido } = req.body;
    if (!id_usuario || !contenido) {
      return res.status(400).json({ error: 'Complete todos los campos' });
    }
    const imagen = req.file ? req.file.filename : null;
    const result = await reclamoService.responderReclamo(
      parseInt(id_reclamo), parseInt(id_usuario), contenido, imagen
    );
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('vacío') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

const responderCliente = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const { id_cliente, contenido } = req.body;
    if (!id_cliente || !contenido) {
      return res.status(400).json({ error: 'Complete todos los campos' });
    }
    const imagen = req.file ? req.file.filename : null;
    const result = await reclamoService.responderCliente(
      parseInt(id_reclamo), parseInt(id_cliente), contenido, imagen
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resolverReclamo = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const result = await reclamoService.resolverReclamo(parseInt(id_reclamo));
    res.json(result);
  } catch (error) {
    const status = error.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

const crearReclamo = async (req, res) => {
  try {
    const imagen = req.file ? req.file.filename : null;
    const result = await reclamoService.crearReclamo({ ...req.body, imagen });
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('Ya existe') ? 409
      : error.message.includes('entregadas') ? 403
      : error.message.includes('no realizadas') ? 403
      : 400;

    res.status(status).json({ message: error.message });
  }
};

const obtenerReclamosCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const reclamos = await reclamoService.obtenerReclamosCliente(parseInt(id_cliente));
    res.json(reclamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
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