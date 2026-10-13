import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config';
import AuthMarco, { IconoResultado } from './AuthMarco';
import { estilos as s } from './authEstilos';

/** Tiene que coincidir con LARGO_MINIMO_CONTRASENA del backend (authController). */
const LARGO_MINIMO = 8;

/**
 * @fileoverview Pantalla que abre el enlace del mail de recuperación (/restablecer?token=...).
 * Pide la contraseña nueva dos veces y la guarda.
 *
 * @module RestablecerContrasena
 */
export default function RestablecerContrasena() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (contrasena.length < LARGO_MINIMO) return setError(`La contraseña tiene que tener al menos ${LARGO_MINIMO} caracteres.`);
    if (contrasena !== repetida) return setError('Las dos contraseñas no coinciden.');

    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/auth/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, contraseña: contrasena }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'No pudimos cambiar la contraseña.');
      setListo(data.message);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'No pudimos conectarnos con el servidor.' : err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
      <AuthMarco titulo="Enlace incompleto" icono={<IconoResultado ok={false} />}>
        <p style={s.texto}>Al enlace le falta el código. Abrilo de nuevo desde el mail o pedí uno nuevo.</p>
        <Link to="/olvide" className="tr-btn" style={s.btn}>Pedir un enlace nuevo</Link>
      </AuthMarco>
    );
  }

  if (listo) {
    return (
      <AuthMarco titulo="Contraseña cambiada" icono={<IconoResultado ok />}>
        <p style={s.texto}>{listo}</p>
        <Link to="/login" className="tr-btn" style={s.btn}>Ingresar</Link>
      </AuthMarco>
    );
  }

  return (
    <AuthMarco titulo="Elegí una contraseña nueva" subtitulo={`Usá al menos ${LARGO_MINIMO} caracteres.`}>
      {error && (
        <div style={s.alertaError}>
          {error}
          {error.includes('venció') && <> <Link to="/olvide" style={{ color: 'inherit', fontWeight: 600 }}>Pedir otro enlace</Link></>}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={s.campo}>
          <label htmlFor="nueva" style={s.label}>Contraseña nueva</label>
          <input id="nueva" type="password" value={contrasena} onChange={e => setContrasena(e.target.value)}
            required minLength={LARGO_MINIMO} autoComplete="new-password" style={s.input} />
        </div>
        <div style={s.campo}>
          <label htmlFor="repetida" style={s.label}>Repetila</label>
          <input id="repetida" type="password" value={repetida} onChange={e => setRepetida(e.target.value)}
            required autoComplete="new-password" style={s.input} />
        </div>
        <button type="submit" disabled={cargando} style={{ ...s.btn, opacity: cargando ? 0.7 : 1 }}>
          {cargando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthMarco>
  );
}
