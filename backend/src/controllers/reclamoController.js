const reclamoService = require("../services/reclamoService");

// GET /api/reclamos?id_usuario=X
const listarReclamos = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    if (!id_usuario) {
      return res.status(400).json({ error: "Se requiere id_usuario" });
    }
    const reclamos = await reclamoService.obtenerReclamos(parseInt(id_usuario));
    res.json(reclamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/reclamos/:id_reclamo
const obtenerDetalle = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const reclamo = await reclamoService.obtenerDetalle(parseInt(id_reclamo));
    res.json(reclamo);
  } catch (error) {
    const status = error.message === "Reclamo no encontrado" ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

// POST /api/reclamos/:id_reclamo/responder
// Body: { id_usuario: int, contenido: string }
const responderReclamo = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const { id_usuario, contenido } = req.body;

    if (!id_usuario || !contenido) {
      return res.status(400).json({ error: "Complete todos los campos" });
    }

    const result = await reclamoService.responderReclamo(
      parseInt(id_reclamo),
      parseInt(id_usuario),
      contenido
    );
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes("vacío") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

// PATCH /api/reclamos/:id_reclamo/resolver
const resolverReclamo = async (req, res) => {
  try {
    const { id_reclamo } = req.params;
    const result = await reclamoService.resolverReclamo(parseInt(id_reclamo));
    res.json(result);
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

module.exports = { listarReclamos, obtenerDetalle, responderReclamo, resolverReclamo };