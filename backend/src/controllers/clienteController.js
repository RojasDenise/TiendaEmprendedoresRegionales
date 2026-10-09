const bcrypt = require('bcrypt');
const { getConnection } = require('../config/db');
const { responderErrorInterno } = require('../utils/errores');

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
    const result = await pool.query(`
        SELECT id_cliente, nombre, apellido, "DNI", fecha_nacimiento, email
        FROM Cliente
        WHERE id_cliente = $1
      `, [parseInt(id)]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Cliente no encontrado.' });

    res.json(result.rows[0]);
  } catch (error) {
    responderErrorInterno(res, error, 'obtenerPerfil');
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
  const { nombre, apellido, email, contraseñaActual, contraseñaNueva } = req.body;

  if (!nombre || !apellido || !email)
    return res.status(400).json({ message: 'Nombre, apellido y email son obligatorios.' });

  try {
    const pool   = await getConnection();

    // Verificar contraseña actual si quiere cambiarla
    if (contraseñaNueva) {
      if (!contraseñaActual)
        return res.status(400).json({ message: 'Ingresá tu contraseña actual para cambiarla.' });

      const result = await pool.query(
        `SELECT "contraseña" FROM Cliente WHERE id_cliente = $1`,
        [parseInt(id)]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ message: 'Cliente no encontrado.' });

      const match = await bcrypt.compare(contraseñaActual, result.rows[0]['contraseña']);
      if (!match)
        return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });

      const hash = await bcrypt.hash(contraseñaNueva, 10);
      await pool.query(`
          UPDATE Cliente
          SET nombre       = $2,
              apellido     = $3,
              email        = $4,
              "contraseña" = $5
          WHERE id_cliente = $1
        `, [parseInt(id), nombre, apellido, email, hash]);
    } else {
      await pool.query(`
          UPDATE Cliente
          SET nombre   = $2,
              apellido = $3,
              email    = $4
          WHERE id_cliente = $1
        `, [parseInt(id), nombre, apellido, email]);
    }

    // Devolver datos actualizados (sin contraseña)
    const updated = await pool.query(`
        SELECT id_cliente, nombre, apellido, "DNI", fecha_nacimiento, email
        FROM Cliente WHERE id_cliente = $1
      `, [parseInt(id)]);

    res.json({ message: 'Perfil actualizado correctamente.', cliente: updated.rows[0] });
  } catch (error) {
    responderErrorInterno(res, error, 'editarPerfil');
  }
};

module.exports = { obtenerPerfil, editarPerfil };