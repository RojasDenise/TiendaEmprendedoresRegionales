const express = require('express');
const router = express.Router();
// Importamos ambas funciones desde el controlador
const { login, register } = require('../controllers/authController'); 

/**
 * RUTAS DE AUTENTICACIÓN Y ACCESO
 */

//Ruta para iniciar sesión 
router.post('/login', login);

//Ruta para registro de emprendedores y clientes 
router.post('/register', register);

module.exports = router;