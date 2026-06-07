const carritoService = require('../services/carritoService');

const obtenerCarrito = async (req, res) => {
  try {
    const { id_cliente } = req.query;

    const carrito = await carritoService.obtenerCarrito(id_cliente);

    res.json(carrito);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const agregarAlCarrito = async (req, res) => {
  try {
    const resultado = await carritoService.agregarAlCarrito(req.body);

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const quitarDelCarrito = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await carritoService.quitarDelCarrito(id);

    res.json(resultado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const confirmarCompra = async (req, res) => {
  try {
    const resultado = await carritoService.confirmarCompra(req.body);

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  confirmarCompra
};