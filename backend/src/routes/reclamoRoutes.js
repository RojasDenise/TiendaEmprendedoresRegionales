const express = require('express');
const router  = express.Router();
const reclamoController = require('../controllers/reclamoController');

router.get('/',                              reclamoController.listarReclamos);
router.get('/cliente/:id_cliente',           reclamoController.obtenerReclamosCliente);
router.get('/:id_reclamo',                   reclamoController.obtenerDetalle);
router.get('/:id_reclamo/mensajes',          reclamoController.obtenerMensajes);
router.post('/',                             reclamoController.crearReclamo);
router.post('/:id_reclamo/responder',        reclamoController.responderReclamo);
router.post('/:id_reclamo/responder-cliente', reclamoController.responderCliente);
router.patch('/:id_reclamo/resolver',        reclamoController.resolverReclamo);

module.exports = router;