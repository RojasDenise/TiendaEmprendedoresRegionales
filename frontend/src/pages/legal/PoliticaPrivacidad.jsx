import { Link } from 'react-router-dom';
import LegalLayout, { Dato } from './LegalLayout';
import { LEGAL } from './datosLegales';

/**
 * @fileoverview Política de Privacidad (ruta pública `/privacidad`).
 *
 * Describe qué datos personales guarda la plataforma y para qué, tomando como
 * base la Ley 25.326 de Protección de Datos Personales de Argentina.
 *
 * IMPORTANTE: el texto describe lo que el sistema hace HOY. Si se agrega una
 * función que guarda datos nuevos (por ejemplo, una pasarela de pagos, la
 * ubicación de ferias o un servicio de envío de mails), hay que actualizar
 * esta página y subir la versión en datosLegales.js.
 *
 * @module pages/legal/PoliticaPrivacidad
 */

/** Correo de contacto: enlace `mailto:` si ya está cargado, o el aviso de "falta completar". */
export function Correo() {
  return LEGAL.emailContacto.startsWith('COMPLETAR')
    ? <Dato valor={LEGAL.emailContacto} />
    : <a href={`mailto:${LEGAL.emailContacto}`}>{LEGAL.emailContacto}</a>;
}

export default function PoliticaPrivacidad() {
  return (
    <LegalLayout titulo="Política de privacidad">
      <div className="legal-resumen">
        <strong>En pocas palabras:</strong> guardamos los datos que nos das al crear tu cuenta y al comprar o
        vender, los usamos solo para que la tienda funcione, no los vendemos, y podés pedir en cualquier
        momento verlos, corregirlos o que los borremos.
      </div>

      <h2 id="responsable">1. Quién es responsable de tus datos</h2>
      <p>
        El responsable de la base de datos de {LEGAL.nombreSitio} es <Dato valor={LEGAL.responsable} />,
        con domicilio en <Dato valor={LEGAL.domicilio} />. Para cualquier consulta sobre esta política o
        sobre tus datos podés escribir a <Correo />.
      </p>

      <h2 id="datos">2. Qué datos guardamos</h2>
      <div className="legal-tabla-wrap">
        <table className="legal-tabla">
          <thead>
            <tr><th>Cuándo</th><th>Qué datos</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Al crear una cuenta</td>
              <td>Nombre, apellido, DNI, fecha de nacimiento, correo electrónico y contraseña.</td>
            </tr>
            <tr>
              <td>Si te registrás como emprendedor</td>
              <td>Además, el nombre de tu emprendimiento, la reseña que escribas y los productos que publiques, con sus fotos.</td>
            </tr>
            <tr>
              <td>Al comprar</td>
              <td>Los productos, cantidades e importes, la forma de pago que elijas, la fecha y el estado del envío. No guardamos números de tarjeta ni claves bancarias.</td>
            </tr>
            <tr>
              <td>Al valorar o reclamar</td>
              <td>El puntaje y el comentario de tus valoraciones, y los mensajes y fotos que envíes en un reclamo.</td>
            </tr>
            <tr>
              <td>Al usar el sitio</td>
              <td>La dirección IP y la fecha de cada pedido al servidor, que quedan en registros técnicos por seguridad.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        No pedimos datos sensibles (salud, religión, opiniones políticas u otros de ese tipo). Por favor, no
        los incluyas en comentarios, reseñas ni mensajes.
      </p>

      <h2 id="finalidad">3. Para qué los usamos</h2>
      <ul>
        <li>Crear tu cuenta, verificar tu identidad y tu edad, y permitirte iniciar sesión.</li>
        <li>Revisar y aprobar las solicitudes de emprendedores.</li>
        <li>Gestionar las compras: armar el pedido, emitir el comprobante y hacer el seguimiento del envío.</li>
        <li>Atender reclamos entre clientes y emprendedores.</li>
        <li>Mostrar las valoraciones de los productos.</li>
        <li>Prevenir fraudes y usos abusivos del sitio.</li>
        <li>Cumplir obligaciones legales.</li>
      </ul>
      <p>
        No usamos tus datos para enviarte publicidad ni los vendemos o alquilamos a terceros.
      </p>

      <h2 id="consentimiento">4. Por qué podemos tratarlos</h2>
      <p>
        Tratamos tus datos porque nos diste tu consentimiento al crear la cuenta, aceptando esta política, y
        porque son necesarios para cumplir con la compra o venta que hacés en la plataforma (artículo 5 de la
        Ley 25.326). Darnos los datos es voluntario, pero sin ellos no podemos crear la cuenta ni gestionar
        pedidos.
      </p>

      <h2 id="quien-los-ve">5. Quién puede ver tus datos</h2>
      <h3>Otras personas que usan la tienda</h3>
      <ul>
        <li>
          <strong>Si sos cliente:</strong> el emprendedor al que le reclamás ve tu nombre, tu correo y los
          datos de esa compra. Tu nombre y apellido se muestran públicamente junto a las valoraciones que
          escribas.
        </li>
        <li>
          <strong>Si sos emprendedor:</strong> tu nombre, tu apellido y el nombre de tu emprendimiento se
          muestran públicamente en tus productos.
        </li>
        <li>
          <strong>Administración:</strong> quienes administran la plataforma pueden ver los datos de las
          cuentas para aprobar emprendedores y resolver problemas.
        </li>
      </ul>

      <h3>Proveedores que nos prestan servicios</h3>
      <p>
        Para funcionar, la plataforma usa servicios de otras empresas, que guardan o procesan los datos por
        nuestra cuenta y solo para ese fin:
      </p>
      <div className="legal-tabla-wrap">
        <table className="legal-tabla">
          <thead>
            <tr><th>Proveedor</th><th>Para qué</th><th>Dónde</th></tr>
          </thead>
          <tbody>
            <tr><td>Neon</td><td>Base de datos (cuentas, productos, compras, reclamos)</td><td>Estados Unidos</td></tr>
            <tr><td>Render</td><td>Servidores del sitio</td><td>Estados Unidos</td></tr>
            <tr><td>Cloudinary</td><td>Fotos de productos y de reclamos</td><td>Estados Unidos</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Transferencia internacional.</strong> Como esos servidores están fuera de Argentina, tus
        datos se guardan en el exterior. Al aceptar esta política das tu consentimiento expreso para esa
        transferencia, en los términos del artículo 12 de la Ley 25.326.
      </p>

      <h3>Autoridades</h3>
      <p>
        Podemos entregar datos a una autoridad judicial o administrativa cuando lo exija una norma o una
        orden válida.
      </p>

      <h2 id="plazo">6. Cuánto tiempo los guardamos</h2>
      <p>
        Guardamos tus datos mientras tu cuenta esté activa. Si pedís que la demos de baja, los eliminamos o
        los volvemos anónimos, salvo los que debamos conservar por obligaciones legales (por ejemplo, los
        comprobantes de las compras) o para resolver un reclamo que esté abierto.
      </p>

      <h2 id="seguridad">7. Cómo los cuidamos</h2>
      <ul>
        <li>Las contraseñas se guardan cifradas de forma irreversible: ni el equipo de la plataforma puede leerlas.</li>
        <li>La comunicación entre tu navegador y el sitio viaja cifrada (HTTPS).</li>
      </ul>
      <p>
        Ningún sistema es completamente seguro. Si detectamos un incidente que afecte tus datos, te vamos a
        avisar por correo.
      </p>

      <h2 id="derechos">8. Tus derechos</h2>
      <p>Como titular de los datos, podés:</p>
      <ul>
        <li><strong>Acceder:</strong> saber qué datos tuyos tenemos.</li>
        <li><strong>Rectificar y actualizar:</strong> corregirlos si son inexactos o están desactualizados. Tu nombre, apellido, correo y contraseña los podés cambiar vos desde tu perfil.</li>
        <li><strong>Suprimir:</strong> pedir que los borremos y que demos de baja tu cuenta.</li>
      </ul>
      <p>
        Para ejercerlos, escribí a <Correo /> desde el correo de tu cuenta, indicando tu nombre y qué
        necesitás. El pedido es gratuito. Respondemos los pedidos de acceso dentro de los 10 días corridos y
        los de rectificación, actualización o supresión dentro de los 5 días hábiles.
      </p>
      <div className="legal-leyenda">
        El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en
        forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al
        efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.
      </div>
      <div className="legal-leyenda">
        La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley
        Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten
        afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de
        datos personales.
      </div>
      <p>
        Si considerás que no respondimos bien a tu pedido, podés presentar un reclamo ante la{' '}
        <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noreferrer">Agencia de Acceso a la Información Pública</a>.
      </p>

      <h2 id="menores">9. Menores de edad</h2>
      <p>
        Para crear una cuenta hay que tener al menos {LEGAL.edadMinima} años. No recolectamos a sabiendas
        datos de personas menores de esa edad; si detectamos una cuenta así, la damos de baja. Quienes
        tengan menos de 18 años deben usar la plataforma con autorización de su madre, padre o tutor.
      </p>

      <h2 id="cookies">10. Cookies y almacenamiento en tu navegador</h2>
      <p>
        No usamos cookies de publicidad ni herramientas de seguimiento. Para mantener tu sesión iniciada, el
        sitio guarda en tu navegador los datos básicos de tu cuenta (nombre, apellido y tipo de usuario).
        Esa información se borra al cerrar sesión o al cerrar la pestaña.
      </p>

      <h2 id="cambios">11. Cambios en esta política</h2>
      <p>
        Si cambiamos esta política, vamos a publicar la nueva versión en esta página con su fecha de
        vigencia. Si el cambio es importante, por ejemplo porque empezamos a usar tus datos para algo nuevo,
        te vamos a pedir que la aceptes de nuevo.
      </p>

      <h2 id="contacto">12. Contacto</h2>
      <p>
        <Dato valor={LEGAL.responsable} /> · <Dato valor={LEGAL.domicilio} /> · <Correo />
      </p>
      <p>
        También podés leer los <Link to="/terminos">Términos y condiciones</Link> de uso de la plataforma.
      </p>
    </LegalLayout>
  );
}
