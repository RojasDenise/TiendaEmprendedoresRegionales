const express = require("express");
const router = express.Router();
const reclamoController = require("../controllers/reclamoController");

// Listar reclamos del emprendedor
// GET /api/reclamos?id_usuario=X
router.get("/", reclamoController.listarReclamos);

// Ver detalle de un reclamo
// GET /api/reclamos/:id_reclamo
router.get("/:id_reclamo", reclamoController.obtenerDetalle);

// Responder un reclamo (crea MensajeReclamo + cambia estado a Respondido)
// POST /api/reclamos/:id_reclamo/responder
router.post("/:id_reclamo/responder", reclamoController.responderReclamo);

// Marcar como Resuelto
// PATCH /api/reclamos/:id_reclamo/resolver
router.patch("/:id_reclamo/resolver", reclamoController.resolverReclamo);

module.exports = router;