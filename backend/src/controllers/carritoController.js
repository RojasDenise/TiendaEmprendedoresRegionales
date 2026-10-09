const carritoService = require('../services/carritoService');
const { responderError, responderErrorInterno } = require('../utils/errores');

const obtenerCarrito = async (req, res) => {
  try {
    const { id_cliente } = req.query;

    const carrito = await carritoService.obtenerCarrito(id_cliente);

    res.json(carrito);
  } catch (error) {
    responderErrorInterno(res, error, 'obtenerCarrito');
  }
};

const agregarAlCarrito = async (req, res) => {
  try {
    const resultado = await carritoService.agregarAlCarrito(req.body);

    res.status(201).json(resultado);
  } catch (error) {
    responderError(res, error, 400, 'agregarAlCarrito');
  }
};

const quitarDelCarrito = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await carritoService.quitarDelCarrito(id);

    res.json(resultado);
  } catch (error) {
    responderError(res, error, 400, 'quitarDelCarrito');
  }
};

const confirmarCompra = async (req, res) => {
  try {
    const resultado = await carritoService.confirmarCompra(req.body);

    res.status(201).json(resultado);
  } catch (error) {
    responderError(res, error, 400, 'confirmarCompra');
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  confirmarCompra
};