import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config';
import AuthMarco, { IconoResultado } from './AuthMarco';
import { estilos as s } from './authEstilos';

/**
 * @fileoverview Pantalla que abre el enlace del mail de confirmación (/verificar?token=...).
 * Manda el token al backend y muestra si la cuenta quedó confirmada.
 *
 * El token se envía con un POST desde la página y no al abrir el enlace: así los
 * antivirus de correo que "abren" los enlaces para revisarlos no lo gastan.
 *
 * @module VerificarCorreo
 */
export default function VerificarCorreo() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [estado, setEstado] = useState(token ? 'cargando' : 'error');
  const [mensaje, setMensaje] = useState(token ? '' : 'Falta el código del enlace. Abrí de nuevo el enlace del mail.');
  const enviado = useRef(false); // en desarrollo React monta dos veces: el token se manda una sola

  useEffect(() => {
    if (!token || enviado.current) return;
    enviado.current = true;
    fetch(`${API_URL}/auth/verificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        setEstado(res.ok ? 'ok' : 'error');
        setMensaje(data.message || (res.ok ? 'Correo confirmado.' : 'No pudimos confirmar el correo.'));
      })
      .catch(() => {
        setEstado('error');
        setMensaje('No pudimos conectarnos con el servidor. Probá de nuevo en un minuto.');
      });
  }, [token]);

  if (estado === 'cargando') {
    return (
      <AuthMarco titulo="Confirmando tu correo…" subtitulo="Esto tarda unos segundos." />
    );
  }

  return (
    <AuthMarco
      titulo={estado === 'ok' ? 'Correo confirmado' : 'No se pudo confirmar'}
      icono={<IconoResultado ok={estado === 'ok'} />}
    >
      <p style={s.texto}>{mensaje}</p>
      {estado === 'ok' ? (
        <Link to="/login" className="tr-btn" style={s.btn}>Ingresar</Link>
      ) : (
        <Link to="/login" state={{ pedirReenvio: true }} className="tr-btn" style={s.btn}>Pedir un enlace nuevo</Link>
      )}
    </AuthMarco>
  );
}
