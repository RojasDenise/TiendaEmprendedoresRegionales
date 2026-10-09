import { Link } from 'react-router-dom';
import LegalLayout, { Dato } from './LegalLayout';
import { Correo } from './PoliticaPrivacidad';
import { LEGAL } from './datosLegales';

/**
 * @fileoverview Términos y Condiciones de uso (ruta pública `/terminos`).
 *
 * Igual que la política de privacidad, describe cómo funciona la plataforma
 * HOY. Al sumar funciones (pasarela de pagos, compras entre emprendedores,
 * costos de envío) hay que revisar este texto.
 *
 * @module pages/legal/TerminosCondiciones
 */
export default function TerminosCondiciones() {
  return (
    <LegalLayout titulo="Términos y condiciones">
      <div className="legal-resumen">
        <strong>En pocas palabras:</strong> {LEGAL.nombreSitio} es un espacio donde emprendedores de la región
        publican sus productos y los clientes los compran. Cada emprendedor es quien vende y responde por lo
        que ofrece; la plataforma facilita el contacto y ordena la compra.
      </div>

      <h2 id="aceptacion">1. Aceptación</h2>
      <p>
        Estos términos regulan el uso de {LEGAL.nombreSitio}, a cargo de <Dato valor={LEGAL.responsable} />,
        con domicilio en <Dato valor={LEGAL.domicilio} />. Al crear una cuenta aceptás estos términos y
        la <Link to="/privacidad">Política de privacidad</Link>. Si no estás de acuerdo, no uses la
        plataforma.
      </p>

      <h2 id="cuentas">2. Cuentas</h2>
      <ul>
        <li>El catálogo se puede ver sin cuenta. Para comprar o vender hay que registrarse.</li>
        <li>Para registrarte tenés que tener al menos {LEGAL.edadMinima} años. Si tenés menos de 18, necesitás la autorización de tu madre, padre o tutor.</li>
        <li>Los datos que cargues tienen que ser verdaderos y estar actualizados.</li>
        <li>Tu contraseña es personal. Sos responsable de lo que se haga desde tu cuenta; si creés que alguien más la usó, avisanos.</li>
        <li>Las cuentas de emprendedor quedan pendientes hasta que la administración las apruebe.</li>
      </ul>

      <h2 id="rol">3. Qué hace la plataforma y qué hace cada emprendedor</h2>
      <p>
        La plataforma publica los productos, arma el pedido y ofrece un canal de reclamos. El vendedor de
        cada producto es el emprendedor que lo publica: él define la descripción, el precio y el stock, y es
        responsable de que el producto sea el anunciado, de entregarlo y de responder por su calidad.
      </p>

      <h2 id="emprendedores">4. Reglas para emprendedores</h2>
      <ul>
        <li>Publicá solo productos propios, que puedas vender legalmente y que tengas disponibles.</li>
        <li>Describilos con precisión y usá fotos reales del producto.</li>
        <li>Mantené actualizados el precio y el stock.</li>
        <li>Respondé los reclamos de tus clientes en un plazo razonable.</li>
        <li>Usá los datos de tus clientes únicamente para gestionar esa venta.</li>
      </ul>
      <p>
        No se pueden publicar productos prohibidos o que requieran una habilitación especial que no tengas,
        ni contenido ofensivo, engañoso o que infrinja derechos de otras personas.
      </p>

      <h2 id="compras">5. Compras</h2>
      <ul>
        <li>Los precios están expresados en pesos argentinos e incluyen los impuestos que correspondan.</li>
        <li>La compra queda confirmada cuando tocás "Confirmar compra" en el checkout. Vas a poder verla en "Mis compras".</li>
        <li>Las formas de pago disponibles son las que se muestran al momento de pagar.</li>
        <li>Si un producto se queda sin stock antes de confirmar, la compra no se completa y no se te cobra.</li>
      </ul>

      <h2 id="arrepentimiento">6. Derecho de arrepentimiento</h2>
      <p>
        Por tratarse de una compra a distancia, tenés derecho a arrepentirte dentro de los 10 días corridos
        desde que recibiste el producto o desde que hiciste la compra, lo último que ocurra, sin dar
        explicaciones y sin costo (artículo 34 de la Ley 24.240 y artículo 1110 del Código Civil y
        Comercial). Los gastos de devolución están a cargo del vendedor.
      </p>
      <p>
        Para usarlo, entrá a <Link to="/arrepentimiento">Botón de arrepentimiento</Link>.
      </p>

      <h2 id="reclamos">7. Reclamos</h2>
      <p>
        Si tenés un problema con una compra que ya fue entregada, podés iniciar un reclamo desde "Mis
        compras". El emprendedor te responde por ese mismo canal. Si no llegan a un acuerdo, podés escribir
        a <Correo /> o acudir a la autoridad de Defensa del Consumidor de tu jurisdicción.
      </p>

      <h2 id="valoraciones">8. Valoraciones y comentarios</h2>
      <p>
        Solo podés valorar productos que compraste y recibiste. Las valoraciones se publican con tu nombre y
        apellido. No se permiten insultos, datos personales de terceros ni contenido ajeno al producto;
        podemos quitar las valoraciones que no cumplan con esto.
      </p>

      <h2 id="conductas">9. Usos no permitidos</h2>
      <ul>
        <li>Crear cuentas con datos falsos o hacerse pasar por otra persona.</li>
        <li>Intentar acceder a cuentas o datos ajenos, o afectar el funcionamiento del sitio.</li>
        <li>Copiar el contenido del catálogo de forma masiva o automatizada.</li>
      </ul>
      <p>
        Ante un incumplimiento podemos suspender o dar de baja la cuenta, avisándote el motivo.
      </p>

      <h2 id="contenido">10. Contenido y marcas</h2>
      <p>
        Las fotos y descripciones de los productos pertenecen a cada emprendedor, que nos autoriza a
        mostrarlas en la plataforma mientras estén publicadas. El nombre, el diseño y el código del sitio
        pertenecen a sus responsables.
      </p>

      <h2 id="responsabilidad">11. Disponibilidad del servicio</h2>
      <p>
        Hacemos lo posible para que el sitio funcione de forma continua, pero puede tener interrupciones por
        mantenimiento o por fallas de los proveedores que usamos. Nada de lo que dice este documento limita
        los derechos que la Ley 24.240 de Defensa del Consumidor te reconoce.
      </p>

      <h2 id="cambios">12. Cambios</h2>
      <p>
        Podemos actualizar estos términos. La versión vigente es siempre la publicada en esta página, con su
        fecha. Si el cambio es importante, te vamos a avisar y a pedir que los aceptes de nuevo.
      </p>

      <h2 id="ley">13. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Ante un conflicto, si sos
        consumidor podés reclamar ante los tribunales de tu domicilio.
      </p>

      <h2 id="contacto">14. Contacto</h2>
      <p>
        <Dato valor={LEGAL.responsable} /> · <Dato valor={LEGAL.domicilio} /> · <Correo />
      </p>
    </LegalLayout>
  );
}
