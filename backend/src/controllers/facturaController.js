const facturaService = require('../services/facturaService');

// GET /api/facturas/cliente/:id_cliente
const obtenerFacturasCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    if (!id_cliente || isNaN(id_cliente)) {
      return res.status(400).json({ error: 'id_cliente inválido' });
    }
    const facturas = await facturaService.obtenerFacturasPorCliente(parseInt(id_cliente));
    res.json(facturas);
  } catch (error) {
    console.error('[facturaController]', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerFacturasCliente };