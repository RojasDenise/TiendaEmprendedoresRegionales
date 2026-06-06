const valoracionService = require('../services/valoracionService');

// POST /api/valoraciones
const crearValoracion = async (req, res) => {
  try {
    const result = await valoracionService.agregarValoracion(req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('Ya valoraste') ? 409 : 400;
    res.status(status).json({ message: error.message });
  }
};

// GET /api/valoraciones/producto/:id_producto
const obtenerValoracionesProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;
    const result = await valoracionService.obtenerValoracionesPorProducto(parseInt(id_producto));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearValoracion, obtenerValoracionesProducto };