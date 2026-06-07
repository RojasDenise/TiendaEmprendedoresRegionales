const express = require('express');
const router  = express.Router();
const { obtenerPerfil, editarPerfil } = require('../controllers/clienteController');

/**
 * @route GET /api/clientes/:id
 * @description Obtiene el perfil del cliente.
 */
router.get('/:id', obtenerPerfil);

/**
 * @route PUT /api/clientes/:id
 * @description Edita nombre, email y/o contraseña del cliente.
 */
router.put('/:id', editarPerfil);

module.exports = router;