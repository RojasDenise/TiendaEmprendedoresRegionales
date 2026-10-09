const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

/**
 * @fileoverview Rutas y lógica para la gestión de categorías.
 *
 * @module categoriaRoutes
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * @route GET /api/categorias
 * @description Retorna todas las categorías ordenadas alfabéticamente por descripción.
 * @access Público
 */
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.query('SELECT * FROM Categoria ORDER BY descripcion');
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

/**
 * @route GET /api/categorias/:id
 * @description Retorna una categoría por su ID.
 * @access Público
 */
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.query(
      'SELECT * FROM Categoria WHERE id_categoria = $1',
      [parseInt(req.params.id)]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al obtener la categoría' });
  }
});

/**
 * @route POST /api/categorias
 * @description Crea una nueva categoría.
 * @body {string} descripcion - Nombre de la categoría (requerido, máx 50 caracteres)
 * @access Privado
 */
router.post('/', async (req, res) => {
  try {
    const { descripcion } = req.body;

    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ message: 'La descripción es obligatoria' });
    }

    const pool = await getConnection();

    // Verificar nombre duplicado
    const existe = await pool.query(
      'SELECT id_categoria FROM Categoria WHERE LOWER(descripcion) = LOWER($1)',
      [descripcion.trim()]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ message: `Ya existe una categoría con el nombre "${descripcion}"` });
    }

    const result = await pool.query(
      'INSERT INTO Categoria (descripcion) VALUES ($1) RETURNING *',
      [descripcion.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
});

/**
 * @route PUT /api/categorias/:id
 * @description Actualiza la descripción de una categoría existente.
 * @body {string} descripcion - Nuevo nombre (requerido)
 * @access Privado
 */
router.put('/:id', async (req, res) => {
  try {
    const { descripcion } = req.body;
    const id = parseInt(req.params.id);

    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ message: 'La descripción es obligatoria' });
    }

    const pool = await getConnection();

    // Verificar que exista
    const categoria = await pool.query(
      'SELECT id_categoria FROM Categoria WHERE id_categoria = $1',
      [id]
    );

    if (!categoria.rows[0]) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar nombre duplicado (excluyendo la propia)
    const duplicado = await pool.query(`
        SELECT id_categoria FROM Categoria
        WHERE LOWER(descripcion) = LOWER($1)
          AND id_categoria <> $2
      `, [descripcion.trim(), id]);

    if (duplicado.rows.length > 0) {
      return res.status(409).json({ message: `Ya existe una categoría con el nombre "${descripcion}"` });
    }

    const result = await pool.query(
      'UPDATE Categoria SET descripcion = $1 WHERE id_categoria = $2 RETURNING *',
      [descripcion.trim(), id]
    );

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
});

/**
 * @route DELETE /api/categorias/:id
 * @description Elimina una categoría si no tiene productos activos asociados.
 * @access Privado
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pool = await getConnection();

    // Verificar que exista
    const categoria = await pool.query(
      'SELECT * FROM Categoria WHERE id_categoria = $1',
      [id]
    );

    if (!categoria.rows[0]) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar productos activos asociados
    const productos = await pool.query(
      'SELECT COUNT(*) AS total FROM Producto WHERE id_categoria = $1 AND id_estado_prod = 1',
      [id]
    );

    if (productos.rows[0].total > 0) {
      return res.status(409).json({
        message: `No se puede eliminar la categoría "${categoria.rows[0].descripcion}" porque tiene productos activos asociados`
      });
    }

    await pool.query('DELETE FROM Categoria WHERE id_categoria = $1', [id]);

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
});

module.exports = router;