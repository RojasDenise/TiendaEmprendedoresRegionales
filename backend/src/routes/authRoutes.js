const express = require('express');
const router = express.Router();
// Importamos ambas funciones desde el controlador
const { iniciarSesion, registrar } = require('../controllers/authController');

/**
 * @fileoverview Rutas de autenticación y acceso.
 * Define los endpoints públicos para inicio de sesión y registro
 * de Emprendedores y Clientes.
 *
 * @module authRoutes
 * @author Tu Nombre
 */

/**
 * @route POST /api/auth/login
 * @description Inicia sesión de un usuario o cliente.
 * Busca primero en la tabla `Usuario` (Administradores y Emprendedores)
 * y luego en `Cliente`. Retorna los datos del usuario autenticado.
 * @access Público
 * @see module:authController~login
 */
router.post('/login', iniciarSesion);

/**
 * @route POST /api/auth/register
 * @description Registra un nuevo Emprendedor (id_rol 2) o Cliente (id_rol 3).
 * Valida campos obligatorios, edad mínima y DNI duplicado antes de insertar.
 * @access Público
 * @see module:authController~register
 */
router.post('/register', registrar);

module.exports = router;