const express = require('express');
const router = express.Router();
const {
    getSolicitudes,
    getEmprendedoresActivos,
    aprobarEmprendedor,
    rechazarEmprendedor
} = require('../controllers/usuarioController');

/**
 * @fileoverview Rutas de gestión de usuarios y emprendedores.
 * Endpoints exclusivos para el administrador.
 *
 * @module usuarioRoutes
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/** GET /api/usuarios/solicitudes — Emprendedores pendientes de aprobación */
router.get('/solicitudes', getSolicitudes);

/** GET /api/usuarios/emprendedores — Emprendedores activos */
router.get('/emprendedores', getEmprendedoresActivos);

/** PATCH /api/usuarios/:id/aprobar — Aprobar un emprendedor */
router.patch('/:id/aprobar', aprobarEmprendedor);

/** PATCH /api/usuarios/:id/rechazar — Rechazar una solicitud */
router.delete('/:id/rechazar', rechazarEmprendedor);

module.exports = router;