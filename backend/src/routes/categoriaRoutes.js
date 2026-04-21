const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

/**
 * @fileoverview Rutas y lógica para la gestión de categorías.
 * Obtiene el listado de categorías disponibles directamente desde la base de datos.
 *
 * @module categoriaRoutes
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * @route GET /api/categorias
 * @description Retorna todas las categorías ordenadas alfabéticamente por descripción.
 * Realiza la consulta directamente sobre la tabla `Categoria`.
 * @access Público
 *
 * @throws {500} Si ocurre un error al consultar la base de datos.
 */
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