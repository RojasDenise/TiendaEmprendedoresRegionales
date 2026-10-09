const { getConnection } = require('../config/db');
const { responderErrorInterno } = require('../utils/errores');

/**
 * @fileoverview Controlador de gestión de usuarios.
 * Permite al administrador listar, aprobar y rechazar solicitudes de emprendedores.
 *
 * @module usuarioController
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Retorna todos los emprendedores con estado pendiente (id_estado = 2).
 *
 * @async
 * @function obtenerSolicitudes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const obtenerSolicitudes = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.query(`
            SELECT id_usuario, nombre, apellido, "DNI", email, fecha_nacimiento,
                   "nombreEmprendimiento", "reseña", id_estado
            FROM Usuario
            WHERE id_rol = 2 AND id_estado = 2
            ORDER BY id_usuario DESC
        `);
        res.json(result.rows);
    } catch (error) {
        responderErrorInterno(res, error, 'obtenerSolicitudes');
    }
};

/**
 * Retorna todos los emprendedores activos (id_estado = 1).
 *
 * @async
 * @function obtenerEmprendedoresActivos
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const obtenerEmprendedoresActivos = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.query(`
            SELECT id_usuario, nombre, apellido, "DNI", email, fecha_nacimiento,
                   "nombreEmprendimiento", "reseña", id_estado
            FROM Usuario
            WHERE id_rol = 2 AND id_estado = 1
            ORDER BY "nombreEmprendimiento" ASC
        `);
        res.json(result.rows);
    } catch (error) {
        responderErrorInterno(res, error, 'obtenerEmprendedoresActivos');
    }
};

/**
 * Aprueba un emprendedor: cambia su id_estado a 1 (Activo).
 *
 * @async
 * @function aprobarEmprendedor
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const aprobarEmprendedor = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        await pool.query(
            `UPDATE Usuario SET id_estado = 1 WHERE id_usuario = $1 AND id_rol = 2`,
            [id]
        );
        res.json({ message: 'Emprendedor aprobado correctamente.' });
    } catch (error) {
        responderErrorInterno(res, error, 'aprobarEmprendedor');
    }
};

/**
 * Rechaza un emprendedor: mantiene su id_estado en 2 (Inactivo).
 * En la práctica lo deja como estaba pero se registra la acción.
 * Si en el futuro se agrega un estado "Rechazado", se cambia solo aquí.
 *
 * @async
 * @function rechazarEmprendedor
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const rechazarEmprendedor = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        // Por ahora eliminamos el registro para no acumular solicitudes rechazadas.
        // Si se quiere historial, cambiar por UPDATE id_estado = 3 con un nuevo estado.
        await pool.query(
            `DELETE FROM Usuario WHERE id_usuario = $1 AND id_rol = 2 AND id_estado = 2`,
            [id]
        );
        res.json({ message: 'Solicitud rechazada y eliminada.' });
    } catch (error) {
        responderErrorInterno(res, error, 'rechazarEmprendedor');
    }
};

module.exports = { obtenerSolicitudes, obtenerEmprendedoresActivos, aprobarEmprendedor, rechazarEmprendedor };