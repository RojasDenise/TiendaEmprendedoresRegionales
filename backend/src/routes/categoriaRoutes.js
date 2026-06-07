const express = require('express');
const router = express.Router();
const sql = require('mssql');
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
    const result = await pool.request().query('SELECT * FROM Categoria ORDER BY descripcion');
    res.json(result.recordset);
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
    const result = await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('SELECT * FROM Categoria WHERE id_categoria = @id');

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(result.recordset[0]);
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
    const existe = await pool.request()
      .input('descripcion', sql.VarChar(50), descripcion.trim())
      .query('SELECT id_categoria FROM Categoria WHERE LOWER(descripcion) = LOWER(@descripcion)');

    if (existe.recordset.length > 0) {
      return res.status(409).json({ message: `Ya existe una categoría con el nombre "${descripcion}"` });
    }

    const result = await pool.request()
      .input('descripcion', sql.VarChar(50), descripcion.trim())
      .query('INSERT INTO Categoria (descripcion) OUTPUT INSERTED.* VALUES (@descripcion)');

    res.status(201).json(result.recordset[0]);
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
    const categoria = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id_categoria FROM Categoria WHERE id_categoria = @id');

    if (!categoria.recordset[0]) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar nombre duplicado (excluyendo la propia)
    const duplicado = await pool.request()
      .input('descripcion', sql.VarChar(50), descripcion.trim())
      .input('id', sql.Int, id)
      .query(`
        SELECT id_categoria FROM Categoria
        WHERE LOWER(descripcion) = LOWER(@descripcion)
          AND id_categoria <> @id
      `);

    if (duplicado.recordset.length > 0) {
      return res.status(409).json({ message: `Ya existe una categoría con el nombre "${descripcion}"` });
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('descripcion', sql.VarChar(50), descripcion.trim())
      .query('UPDATE Categoria SET descripcion = @descripcion OUTPUT INSERTED.* WHERE id_categoria = @id');

    res.json(result.recordset[0]);
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
    const categoria = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Categoria WHERE id_categoria = @id');

    if (!categoria.recordset[0]) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar productos activos asociados
    const productos = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) AS total FROM Producto WHERE id_categoria = @id AND id_estado_prod = 1');

    if (productos.recordset[0].total > 0) {
      return res.status(409).json({
        message: `No se puede eliminar la categoría "${categoria.recordset[0].descripcion}" porque tiene productos activos asociados`
      });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Categoria WHERE id_categoria = @id');

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
});

module.exports = router;