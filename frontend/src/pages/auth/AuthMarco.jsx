import { Link } from 'react-router-dom';
import { estilos } from './authEstilos';

/**
 * @fileoverview Marco común de las pantallas de cuenta que se abren desde un mail
 * (confirmar correo, olvidé mi contraseña, elegir contraseña nueva).
 * Usa el mismo diseño que Login y Register: tarjeta centrada con la marca arriba.
 *
 * @module AuthMarco
 */

/** Tarjeta con la marca, el título y el contenido. */
export default function AuthMarco({ titulo, subtitulo, icono, children }) {
  return (
    <div className="tr-auth-page" style={estilos.page}>
      <div className="tr-auth-card tr-pagina" style={estilos.card}>
        <Link to="/" style={estilos.brand}>
          <span style={estilos.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M8 12h16l-2 12H10L8 12z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M12 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="13" cy="21" r="1" fill="#111" />
              <circle cx="19" cy="21" r="1" fill="#111" />
            </svg>
          </span>
          <span style={estilos.brandName}>Tienda de Emprendedores Regionales</span>
        </Link>

        {icono}
        <h1 style={estilos.titulo}>{titulo}</h1>
        {subtitulo && <p style={estilos.subtitulo}>{subtitulo}</p>}
        {children}
      </div>
    </div>
  );
}

/** Ícono grande de resultado: tilde verde (ok) o cruz roja. */
export function IconoResultado({ ok }) {
  const color = ok ? '#166534' : '#991B1B';
  return (
    <svg className="tr-exito" width="64" height="64" viewBox="0 0 52 52" fill="none" aria-hidden="true" style={{ display: 'block', margin: '0 0 1rem' }}>
      <circle cx="26" cy="26" r="24" stroke={color} strokeWidth="2.5" />
      {ok
        ? <polyline points="15 27 23 35 38 18" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M18 18L34 34M34 18L18 34" stroke={color} strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}
