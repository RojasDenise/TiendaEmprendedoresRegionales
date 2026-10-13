import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import AuthMarco from './AuthMarco';
import { estilos as s } from './authEstilos';

/**
 * @fileoverview "Olvidé mi contraseña": pide el correo y manda el enlace para elegir una nueva.
 * La respuesta es la misma exista o no la cuenta (no revela qué correos están registrados).
 *
 * @module OlvideContrasena
 */
export default function OlvideContrasena() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/olvide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'No pudimos enviar el correo.');
      setListo(data.message);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'No pudimos conectarnos con el servidor.' : err.message);
    } finally {
      setCargando(false);
    }
  };

  if (listo) {
    return (
      <AuthMarco titulo="Revisá tu correo">
        <p style={s.texto}>{listo}</p>
        <p style={{ ...s.texto, fontSize: 13 }}>El enlace vence en 1 hora.</p>
        <Link to="/login" className="tr-btn" style={s.btn}>Volver a ingresar</Link>
      </AuthMarco>
    );
  }

  return (
    <AuthMarco titulo="¿Olvidaste tu contraseña?" subtitulo="Escribí el correo de tu cuenta y te mandamos un enlace para elegir una nueva.">
      {error && <div style={s.alertaError}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={s.campo}>
          <label htmlFor="email" style={s.label}>Correo electrónico</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            required autoComplete="email" style={s.input} placeholder="tu@email.com" />
        </div>
        <button type="submit" disabled={cargando} style={{ ...s.btn, opacity: cargando ? 0.7 : 1 }}>
          {cargando ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
      <p style={s.link}><Link to="/login" style={s.linkA}>Volver a ingresar</Link></p>
    </AuthMarco>
  );
}
