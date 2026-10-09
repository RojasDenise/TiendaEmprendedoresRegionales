import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';
import { Correo } from './PoliticaPrivacidad';

/**
 * @fileoverview Botón de arrepentimiento (ruta pública `/arrepentimiento`).
 *
 * La Resolución 424/2020 de la Secretaría de Comercio Interior pide que los
 * sitios que venden por internet tengan un enlace visible desde la página de
 * inicio para revocar una compra, sin exigir registro previo.
 *
 * PENDIENTE: por ahora el pedido se hace por correo. Lo que pide la norma es
 * un formulario que registre el pedido y devuelva un código de trámite dentro
 * de las 24 horas; eso requiere una tabla y un endpoint nuevos en el backend.
 *
 * @module pages/legal/Arrepentimiento
 */
export default function Arrepentimiento() {
  return (
    <LegalLayout titulo="Botón de arrepentimiento">
      <div className="legal-resumen">
        Si compraste algo en la tienda y te arrepentiste, podés cancelar la compra dentro de los{' '}
        <strong>10 días corridos</strong> desde que recibiste el producto o desde que hiciste la compra, lo
        último que ocurra. No tenés que dar explicaciones y no tiene costo para vos.
      </div>

      <h2>Cómo pedirlo</h2>
      <p>Escribí a <Correo /> con estos datos:</p>
      <ul>
        <li>Tu nombre y apellido.</li>
        <li>El número de factura de la compra (lo ves en "Mis compras").</li>
        <li>El producto o los productos que querés devolver.</li>
      </ul>
      <p>
        No hace falta que inicies sesión ni que expliques el motivo.
      </p>

      <h2>Qué pasa después</h2>
      <ul>
        <li>Dentro de las 24 horas te respondemos con un código para identificar tu trámite.</li>
        <li>Coordinamos con el emprendedor la devolución del producto. Los gastos de envío de la devolución están a cargo del vendedor.</li>
        <li>Una vez devuelto el producto, se te reintegra lo que pagaste.</li>
      </ul>
      <p>
        El producto tiene que devolverse en el estado en que lo recibiste. Este derecho surge del artículo 34
        de la Ley 24.240 de Defensa del Consumidor y del artículo 1110 del Código Civil y Comercial.
      </p>
      <p>
        Más información en los <Link to="/terminos">Términos y condiciones</Link>.
      </p>
    </LegalLayout>
  );
}
