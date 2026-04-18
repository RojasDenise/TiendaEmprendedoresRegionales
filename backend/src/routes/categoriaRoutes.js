const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Categoria ORDER BY descripcion');
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

module.exports = router;