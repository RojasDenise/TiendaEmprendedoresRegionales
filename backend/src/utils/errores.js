/**
 * @fileoverview Utilidades para responder errores sin exponer detalles internos.
 *
 * Los services lanzan `new Error('mensaje')` para errores de negocio
 * (ej. "Stock insuficiente", "Ya valoraste este producto"): esos mensajes
 * están pensados para el usuario y se devuelven tal cual.
 *
 * Cualquier otro error (de la base de datos, TypeError, errores del sistema)
 * puede contener nombres de tablas, columnas o rutas del servidor. Esos se
 * registran en la consola del servidor y al usuario le llega un mensaje genérico.
 *
 * @module utils/errores
 */

const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Intentá de nuevo más tarde.';

/**
 * Indica si el error fue lanzado a propósito por nuestro código
 * (`throw new Error('...')`) y por lo tanto su mensaje se puede mostrar.
 * Los errores de pg (DatabaseError...) son subclases
 * de Error y los errores del sistema traen `code`, así que quedan afuera.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
const esErrorDeNegocio = (error) =>
  error instanceof Error && error.constructor === Error && !error.code;

/**
 * Responde un error de forma segura.
 * - Error de negocio → responde con `status` y el mensaje original.
 * - Cualquier otro → lo loguea y responde 500 con un mensaje genérico.
 *
 * La respuesta incluye el mensaje en `message` y en `error` porque
 * distintas pantallas del frontend leen una u otra propiedad.
 *
 * @param {import('express').Response} res
 * @param {unknown} error
 * @param {number} [status=400] - Status a usar si es un error de negocio.
 * @param {string} [contexto] - Nombre de la función, para el log.
 */
const responderError = (res, error, status = 400, contexto = 'error') => {
  if (esErrorDeNegocio(error)) {
    return res.status(status).json({ message: error.message, error: error.message });
  }
  console.error(`[${contexto}]`, error);
  return res.status(500).json({ message: MENSAJE_GENERICO, error: MENSAJE_GENERICO });
};

/**
 * Responde siempre 500 con el mensaje genérico, registrando el error.
 * Para los catch que solo pueden venir de fallas internas.
 *
 * @param {import('express').Response} res
 * @param {unknown} error
 * @param {string} [contexto]
 */
const responderErrorInterno = (res, error, contexto = 'error') => {
  console.error(`[${contexto}]`, error);
  return res.status(500).json({ message: MENSAJE_GENERICO, error: MENSAJE_GENERICO });
};

module.exports = { MENSAJE_GENERICO, esErrorDeNegocio, responderError, responderErrorInterno };
