/**
 * @fileoverview Datos que aparecen en la Política de Privacidad, los Términos
 * y Condiciones y la página de arrepentimiento de compra.
 *
 * ANTES DE COMPARTIR EL SITIO hay que reemplazar los tres valores que dicen
 * "COMPLETAR". Mientras quede alguno sin completar, las páginas legales
 * muestran un aviso amarillo de "borrador".
 *
 * Si se cambia el texto de la política o de los términos, hay que actualizar
 * `version` y `fechaVigencia` acá, y VERSION_TERMINOS en
 * backend/src/controllers/authController.js (es la versión que queda
 * registrada cuando alguien acepta al crear su cuenta).
 *
 * @module pages/legal/datosLegales
 */

export const LEGAL = {
  nombreSitio: 'Tienda de Emprendedores Regionales',

  /** Persona o entidad responsable de la base de datos (nombre y apellido, o razón social). */
  responsable: 'COMPLETAR: nombre del responsable',

  /** Domicilio legal donde se pueden enviar notificaciones. */
  domicilio: 'COMPLETAR: domicilio (calle, número, ciudad, provincia)',

  /** Correo para consultas y para ejercer los derechos sobre los datos personales. */
  emailContacto: 'COMPLETAR: correo de contacto',

  /** Edad mínima para crear una cuenta. Tiene que coincidir con la que valida el registro. */
  edadMinima: 16,

  /** Versión vigente de los textos legales. */
  version: '2026-10-09',
  fechaVigencia: '9 de octubre de 2026',
};

/** true si todavía falta completar algún dato de arriba. */
export const faltanDatosLegales = [LEGAL.responsable, LEGAL.domicilio, LEGAL.emailContacto]
  .some((valor) => valor.startsWith('COMPLETAR'));
