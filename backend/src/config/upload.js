const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');

/**
 * @fileoverview Subida de imágenes (productos y reclamos).
 *
 * Dónde se guardan:
 * - Con las variables CLOUDINARY_* definidas (producción): en Cloudinary.
 *   En la base se guarda la URL completa (https://res.cloudinary.com/...).
 * - Sin esas variables (desarrollo local sin cuenta): en backend/public/uploads.
 *   En la base se guarda solo el nombre del archivo, como antes.
 *
 * En Render el disco se borra en cada reinicio, por eso en producción
 * las imágenes tienen que ir a Cloudinary.
 *
 * Medidas de seguridad:
 * - Solo acepta JPG, PNG y WEBP (se revisan el tipo MIME y la extensión).
 * - Tamaño máximo de 5 MB y un solo archivo por request.
 * - El nombre del archivo lo genera el servidor (o Cloudinary). Nunca se usa
 *   el nombre ni la extensión que manda el usuario, así no se puede subir
 *   un .html o .js disfrazado.
 *
 * Uso en los controllers:
 *   router.post('/', upload.single('imagen'), controller)   // deja el archivo en req.file
 *   const imagen = await guardarImagen(req.file, 'productos'); // lo guarda y devuelve qué poner en la base
 *
 * @module config/upload
 */

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

const TAMANIO_MAXIMO_MB = 5;

/** Tipo MIME permitido → extensión con la que se guarda. */
const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp'];

/** Carpeta dentro de Cloudinary donde quedan todas las imágenes del proyecto. */
const CARPETA_CLOUDINARY = 'tienda-emprendedores';

const usaCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (usaCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

// memoryStorage: el archivo queda en req.file.buffer (en memoria) y recién
// se guarda cuando el controller llama a guardarImagen(), después de validar los datos.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: TAMANIO_MAXIMO_MB * 1024 * 1024, files: 1 },
});

/**
 * Sube un buffer a Cloudinary y devuelve la URL pública (https).
 * Las imágenes muy grandes se achican a 1600 px de lado como máximo.
 *
 * @param {Buffer} buffer
 * @param {string} carpeta - Subcarpeta ('productos' o 'reclamos').
 * @returns {Promise<string>}
 */
const subirACloudinary = (buffer, carpeta) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${CARPETA_CLOUDINARY}/${carpeta}`,
        resource_type: 'image',
        transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
      },
      (error, resultado) => {
        if (error) {
          // Cloudinary devuelve un objeto plano; lo convertimos en un Error real
          // para que el manejo de errores lo trate como una falla interna.
          const err = new Error(`Cloudinary: ${error.message || 'error al subir la imagen'}`);
          err.code = 'CLOUDINARY_ERROR';
          return reject(err);
        }
        resolve(resultado.secure_url);
      }
    );
    stream.end(buffer);
  });

/**
 * Guarda en disco (solo desarrollo local) y devuelve el nombre del archivo.
 *
 * @param {Express.Multer.File} file
 * @returns {Promise<string>}
 */
const guardarEnDisco = async (file) => {
  const nombre = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${TIPOS_PERMITIDOS[file.mimetype]}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, nombre), file.buffer);
  return nombre;
};

/**
 * Guarda la imagen recibida por Multer y devuelve el valor para la columna `imagen`:
 * la URL de Cloudinary, o el nombre del archivo si se guardó en disco.
 * Si no llegó ningún archivo devuelve null.
 *
 * @param {Express.Multer.File} [file] - req.file
 * @param {string} [carpeta='productos'] - 'productos' o 'reclamos'.
 * @returns {Promise<string|null>}
 */
const guardarImagen = async (file, carpeta = 'productos') => {
  if (!file) return null;
  return usaCloudinary ? subirACloudinary(file.buffer, carpeta) : guardarEnDisco(file);
};

module.exports = { upload, guardarImagen, usaCloudinary, UPLOAD_DIR, TAMANIO_MAXIMO_MB };
