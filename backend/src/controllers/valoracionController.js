const valoracionService = require('../services/valoracionService');
const { responderError, responderErrorInterno } = require('../utils/errores');

// POST /api/valoraciones
const crearValoracion = async (req, res) => {
  try {
    const result = await valoracionService.agregarValoracion(req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('Ya valoraste') ? 409 : 400;
    responderError(res, error, status, 'crearValoracion');
  }
};

// GET /api/valoraciones/producto/:id_producto
const obtenerValoracionesProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;
    const result = await valoracionService.obtenerValoracionesPorProducto(parseInt(id_producto));
    res.json(result);
  } catch (error) {
    responderErrorInterno(res, error, 'obtenerValoracionesProducto');
  }
};

module.exports = { crearValoracion, obtenerValoracionesProducto };