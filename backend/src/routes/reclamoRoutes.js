const express = require('express');
const router  = express.Router();
const reclamoController = require('../controllers/reclamoController');

const { upload } = reclamoController;

router.get('/',                                reclamoController.listarReclamos);
router.get('/cliente/:id_cliente',             reclamoController.obtenerReclamosCliente);
router.get('/:id_reclamo/mensajes',            reclamoController.obtenerMensajes);
router.get('/:id_reclamo',                     reclamoController.obtenerDetalle);
router.post('/',                               upload.single('imagen'), reclamoController.crearReclamo);
router.post('/:id_reclamo/responder',          upload.single('imagen'), reclamoController.responderReclamo);
router.post('/:id_reclamo/responder-cliente',  upload.single('imagen'), reclamoController.responderCliente);
router.patch('/:id_reclamo/resolver',          reclamoController.resolverReclamo);

module.exports = router;