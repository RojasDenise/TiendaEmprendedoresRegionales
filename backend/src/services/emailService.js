/**
 * @fileoverview Envío de correos de la tienda a través de Brevo.
 *
 * Render, en el plan gratuito, bloquea la salida por SMTP, así que los mails
 * se mandan por la API HTTP de Brevo (https://developers.brevo.com).
 *
 * Variables de entorno:
 * - BREVO_API_KEY   : clave de API de Brevo (SMTP y API → Claves API).
 * - MAIL_REMITENTE  : correo verificado en Brevo como remitente.
 * - APP_URL         : dirección pública del frontend, para armar los enlaces.
 *                     Si falta, se usa la primera de FRONTEND_URL.
 *
 * Sin BREVO_API_KEY (por ejemplo, en local) no se manda nada: el enlace se
 * muestra en la consola del backend para poder probar igual.
 *
 * @module emailService
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const NOMBRE_TIENDA = 'Tienda de Emprendedores Regionales';

/** Dirección pública del frontend, sin barra final. */
const urlApp = () =>
  (process.env.APP_URL || (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0])
    .trim()
    .replace(/\/+$/, '');

/** Escapa texto para meterlo en el HTML del mail (nombres que escribe la gente). */
const escapar = (texto = '') =>
  String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Plantilla común de los mails: marca, título, texto, botón y aclaración.
 * Estilos en línea porque los clientes de correo ignoran las hojas de estilo.
 */
const plantilla = ({ titulo, parrafos, boton, enlace, aclaracion }) => `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#F7F6F3;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #ebebeb;border-radius:14px;">
        <tr><td style="padding:32px 32px 8px;">
          <div style="font-family:Georgia,serif;font-size:17px;">${NOMBRE_TIENDA}</div>
        </td></tr>
        <tr><td style="padding:16px 32px 0;">
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:26px;line-height:1.2;">${titulo}</h1>
          ${parrafos.map(p => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#444;">${p}</p>`).join('')}
        </td></tr>
        <tr><td style="padding:8px 32px 24px;">
          <a href="${enlace}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:15px;padding:13px 22px;border-radius:9px;">${boton}</a>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="margin:0 0 10px;font-size:12.5px;line-height:1.6;color:#888;">${aclaracion}</p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#aaa;word-break:break-all;">Si el botón no funciona, copiá este enlace en el navegador:<br>${enlace}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

/**
 * Manda un correo. Lanza un error si Brevo lo rechaza.
 *
 * @param {{ para: string, nombre?: string, asunto: string, html: string, texto: string }} datos
 */
const enviarCorreo = async ({ para, nombre, asunto, html, texto }) => {
  const clave = process.env.BREVO_API_KEY;

  if (!clave) {
    console.log(`\n[correo sin enviar: falta BREVO_API_KEY] Para: ${para}\nAsunto: ${asunto}\n${texto}\n`);
    return;
  }
  if (!process.env.MAIL_REMITENTE) {
    throw new Error('Falta configurar MAIL_REMITENTE en el servidor.');
  }

  const respuesta = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': clave, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: NOMBRE_TIENDA, email: process.env.MAIL_REMITENTE },
      to: [{ email: para, ...(nombre ? { name: nombre } : {}) }],
      subject: asunto,
      htmlContent: html,
      textContent: texto,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '');
    // Error con `code`: así errores.js no le muestra el detalle técnico al usuario.
    const error = new Error(`Brevo respondió ${respuesta.status}: ${detalle}`);
    error.code = 'CORREO_NO_ENVIADO';
    throw error;
  }
};

/**
 * Mail de confirmación de cuenta, con el enlace a /verificar.
 *
 * @param {{ email: string, nombre: string, token: string }} datos
 */
const enviarVerificacion = ({ email, nombre, token }) => {
  const enlace = `${urlApp()}/verificar?token=${encodeURIComponent(token)}`;
  return enviarCorreo({
    para: email,
    nombre,
    asunto: 'Confirmá tu correo',
    html: plantilla({
      titulo: `Hola, ${escapar(nombre)}`,
      parrafos: ['Gracias por crear tu cuenta. Para empezar a usarla, confirmá que este correo es tuyo.'],
      boton: 'Confirmar mi correo',
      enlace,
      aclaracion: 'El enlace vence en 48 horas. Si no creaste una cuenta en la tienda, ignorá este mensaje.',
    }),
    texto: `Hola, ${nombre}. Confirmá tu correo entrando a este enlace (vence en 48 horas): ${enlace}`,
  });
};

/**
 * Mail para restablecer la contraseña, con el enlace a /restablecer.
 *
 * @param {{ email: string, nombre: string, token: string }} datos
 */
const enviarRecuperacion = ({ email, nombre, token }) => {
  const enlace = `${urlApp()}/restablecer?token=${encodeURIComponent(token)}`;
  return enviarCorreo({
    para: email,
    nombre,
    asunto: 'Restablecé tu contraseña',
    html: plantilla({
      titulo: `Hola, ${escapar(nombre)}`,
      parrafos: ['Recibimos un pedido para restablecer la contraseña de tu cuenta. Elegí una nueva desde este botón.'],
      boton: 'Elegir nueva contraseña',
      enlace,
      aclaracion: 'El enlace vence en 1 hora y sirve una sola vez. Si no lo pediste, ignorá este mensaje: tu contraseña sigue igual.',
    }),
    texto: `Hola, ${nombre}. Para elegir una nueva contraseña entrá a este enlace (vence en 1 hora): ${enlace}`,
  });
};

module.exports = { enviarVerificacion, enviarRecuperacion };
