import { Link } from 'react-router-dom';
import { LEGAL, faltanDatosLegales } from './datosLegales';
import './legal.css';

/**
 * @fileoverview Marco común de las páginas legales: barra con la marca,
 * tarjeta de contenido y pie con los enlaces entre ellas.
 * Son páginas públicas: se pueden leer sin iniciar sesión.
 *
 * @module pages/legal/LegalLayout
 */

/**
 * Muestra un dato de datosLegales.js. Si todavía dice "COMPLETAR",
 * lo resalta en amarillo para que no pase desapercibido.
 *
 * @param {{ valor: string }} props
 */
export function Dato({ valor }) {
  return valor.startsWith('COMPLETAR')
    ? <span className="legal-falta">{valor}</span>
    : <>{valor}</>;
}

/** Renglón de enlaces legales para el pie de la tienda y de los paneles. */
export function PieLegal() {
  return (
    <footer className="tr-pie-legal">
      <Link to="/privacidad">Política de privacidad</Link>
      <Link to="/terminos">Términos y condiciones</Link>
      <Link to="/arrepentimiento">Botón de arrepentimiento</Link>
    </footer>
  );
}

/**
 * @param {Object} props
 * @param {string} props.titulo - Título de la página.
 * @param {React.ReactNode} props.children - Contenido.
 */
export default function LegalLayout({ titulo, children }) {
  return (
    <div className="legal-pagina">
      <header className="legal-barra">
        <Link to="/catalogo" className="legal-marca">
          <span className="legal-marca-icono">
            <svg width="17" height="17" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M8 12h16l-2 12H10L8 12z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M12 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </span>
          <span className="legal-marca-nombre">{LEGAL.nombreSitio}</span>
        </Link>
        <Link to="/catalogo" className="legal-volver">← Volver al catálogo</Link>
      </header>

      <main className="legal-contenido">
        {faltanDatosLegales && (
          <div className="legal-borrador">
            <strong>Borrador.</strong> Faltan completar los datos del responsable en{' '}
            <code>frontend/src/pages/legal/datosLegales.js</code>. Este texto todavía no fue revisado por un profesional.
          </div>
        )}

        <article className="legal-tarjeta">
          <h1>{titulo}</h1>
          <p className="legal-vigencia">Vigente desde el {LEGAL.fechaVigencia} · Versión {LEGAL.version}</p>
          {children}
        </article>

        <nav className="legal-pie">
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/arrepentimiento">Botón de arrepentimiento</Link>
        </nav>
      </main>
    </div>
  );
}
