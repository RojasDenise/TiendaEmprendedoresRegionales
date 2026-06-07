const bcrypt = require('bcrypt');
const sql    = require('mssql');
const { getConnection } = require('../config/db');

/**
 * @fileoverview Controlador de perfil del cliente.
 * Permite obtener y editar los datos del cliente autenticado.
 *
 * @module clienteController
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Retorna los datos del cliente por su id.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const obtenerPerfil = async (req, res) => {
  const { id } = req.params;
  try {
    const pool   = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT id_cliente, apellidoNombre, DNI, fecha_nacimiento, email
        FROM Cliente
        WHERE id_cliente = @id
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'Cliente no encontrado.' });

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en obtenerPerfil:', error.message);
    res.status(500).json({ error: 'Error interno: ' + error.message });
  }
};

/**
 * Edita el perfil del cliente: nombre, email y/o contraseña.
 * Si se envía contraseñaNueva, se hashea antes de guardar.
 * Se verifica la contraseña actual antes de permitir cambios.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const editarPerfil = async (req, res) => {
  const { id } = req.params;
  const { apellidoNombre, email, contraseñaActual, contraseñaNueva } = req.body;

  if (!apellidoNombre || !email)
    return res.status(400).json({ message: 'Nombre y email son obligatorios.' });

  try {
    const pool   = await getConnection();

    // Verificar contraseña actual si quiere cambiarla
    if (contraseñaNueva) {
      if (!contraseñaActual)
        return res.status(400).json({ message: 'Ingresá tu contraseña actual para cambiarla.' });

      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`SELECT [contraseña] FROM Cliente WHERE id_cliente = @id`);

      if (result.recordset.length === 0)
        return res.status(404).json({ message: 'Cliente no encontrado.' });

      const match = await bcrypt.compare(contraseñaActual, result.recordset[0]['contraseña']);
      if (!match)
        return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });

      const hash = await bcrypt.hash(contraseñaNueva, 10);
      await pool.request()
        .input('id',             sql.Int,     parseInt(id))
        .input('apellidoNombre', sql.VarChar, apellidoNombre)
        .input('email',          sql.VarChar, email)
        .input('pass',           sql.VarChar, hash)
        .query(`
          UPDATE Cliente
          SET apellidoNombre = @apellidoNombre,
              email          = @email,
              [contraseña]   = @pass
          WHERE id_cliente = @id
        `);
    } else {
      await pool.request()
        .input('id',             sql.Int,     parseInt(id))
        .input('apellidoNombre', sql.VarChar, apellidoNombre)
        .input('email',          sql.VarChar, email)
        .query(`
          UPDATE Cliente
          SET apellidoNombre = @apellidoNombre,
              email          = @email
          WHERE id_cliente = @id
        `);
    }

    // Devolver datos actualizados (sin contraseña)
    const updated = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT id_cliente, apellidoNombre, DNI, fecha_nacimiento, email
        FROM Cliente WHERE id_cliente = @id
      `);

    res.json({ message: 'Perfil actualizado correctamente.', cliente: updated.recordset[0] });
  } catch (error) {
    console.error('Error en editarPerfil:', error.message);
    res.status(500).json({ error: 'Error interno: ' + error.message });
  }
};

module.exports = { obtenerPerfil, editarPerfil };