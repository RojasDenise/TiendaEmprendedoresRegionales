const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * @fileoverview Configuración única de Multer para la subida de imágenes
 * (productos y reclamos).
 *
 * Medidas de seguridad:
 * - Solo acepta JPG, PNG y WEBP (se revisan el tipo MIME y la extensión).
 * - Tamaño máximo de 5 MB y un solo archivo por request.
 * - El nombre del archivo lo genera el servidor, con la extensión según
 *   el tipo de imagen. Nunca se usa el nombre ni la extensión que manda
 *   el usuario, así no se puede subir un .html o .js disfrazado.
 *
 * @module config/upload
 */

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TAMANIO_MAXIMO_MB = 5;

/** Tipo MIME permitido → extensión con la que se guarda. */
const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const nombre = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, nombre + TIPOS_PERMITIDOS[file.mimetype]);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const tipoValido = Object.prototype.hasOwnProperty.call(TIPOS_PERMITIDOS, file.mimetype);

  if (tipoValido && EXTENSIONES_PERMITIDAS.includes(extension)) {
    return cb(null, true);
  }

  const error = new Error('Solo se permiten imágenes JPG, PNG o WEBP.');
  error.status = 400;
  cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMANIO_MAXIMO_MB * 1024 * 1024, files: 1 },
});

module.exports = { upload, UPLOAD_DIR, TAMANIO_MAXIMO_MB };
