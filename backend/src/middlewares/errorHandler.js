const multer = require('multer');
const { MENSAJE_GENERICO } = require('../utils/errores');
const { TAMANIO_MAXIMO_MB } = require('../config/upload');

/**
 * @fileoverview Manejador de errores global de Express.
 * Atrapa todo lo que no se respondió en los controllers: errores de Multer,
 * JSON mal formado y cualquier excepción inesperada. Nunca devuelve
 * detalles internos al cliente.
 *
 * @module middlewares/errorHandler
 */

const MENSAJES_MULTER = {
  LIMIT_FILE_SIZE: `La imagen supera el tamaño máximo de ${TAMANIO_MAXIMO_MB} MB.`,
  LIMIT_FILE_COUNT: 'Solo se puede subir una imagen.',
  LIMIT_UNEXPECTED_FILE: 'Se envió un archivo en un campo no permitido.',
};

const responder = (res, status, mensaje) =>
  res.status(status).json({ message: mensaje, error: mensaje });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Errores de subida de archivos
  if (err instanceof multer.MulterError) {
    return responder(res, 400, MENSAJES_MULTER[err.code] || 'Error al subir el archivo.');
  }

  // Errores de express.json()
  if (err.type === 'entity.parse.failed') {
    return responder(res, 400, 'El cuerpo de la solicitud no es un JSON válido.');
  }
  if (err.type === 'entity.too.large') {
    return responder(res, 413, 'La solicitud es demasiado grande.');
  }

  // Errores 4xx que lanzamos a propósito (ej. el fileFilter de imágenes)
  if (err.status >= 400 && err.status < 500) {
    return responder(res, err.status, err.message);
  }

  console.error('[error no controlado]', err);
  return responder(res, 500, MENSAJE_GENERICO);
};

module.exports = errorHandler;
