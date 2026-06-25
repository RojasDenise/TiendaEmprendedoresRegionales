import { useEffect, useState } from 'react';

/**
 * @fileoverview Página de perfil del cliente.
 * Permite ver y editar nombre, email y contraseña.
 *
 * @module Perfil
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const BASE_URL = 'http://localhost:5000/api';

export default function Perfil() {
  const user       = JSON.parse(sessionStorage.getItem('user') || 'null');
  const id_cliente = user?.id_usuario;

  const [perfil,    setPerfil]    = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [editando,  setEditando]  = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState({ msg: '', ok: true });

  // Campos del formulario
  const [nombre,          setNombre]          = useState('');
  const [apellido, setApellido] = useState('');
  const [email,           setEmail]           = useState('');
  const [passActual,      setPassActual]      = useState('');
  const [passNueva,       setPassNueva]       = useState('');
  const [passConfirm,     setPassConfirm]     = useState('');
  const [cambiarPass,     setCambiarPass]     = useState(false);
  const [error,           setError]           = useState('');

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${BASE_URL}/clientes/${id_cliente}`);
      const data = await res.json();
      setPerfil(data);
      setNombre(data.nombre);
      setApellido(data.apellido);
      setEmail(data.email);
    } catch { mostrarToast('Error al cargar el perfil', false); }
    finally  { setCargando(false); }
  };

  const mostrarToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 4000);
  };

  const handleGuardar = async () => {
    setError('');
    if (!nombre.trim() || !apellido.trim() || !email.trim()) return setError('Nombre, apellido y email son obligatorios.');
    if (cambiarPass) {
      if (!passActual)              return setError('Ingresá tu contraseña actual.');
      if (passNueva.length < 6)     return setError('La nueva contraseña debe tener al menos 6 caracteres.');
      if (passNueva !== passConfirm) return setError('Las contraseñas no coinciden.');
    }

    setGuardando(true);
    try {
      const body = { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim() };
      if (cambiarPass) {
        body.contraseñaActual = passActual;
        body.contraseñaNueva  = passNueva;
      }

      const res  = await fetch(`${BASE_URL}/clientes/${id_cliente}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar');

      // Actualizar sessionStorage con el nuevo nombre
      const userActualizado = { ...user, nombre: data.cliente.nombre, apellido: data.cliente.apellido };
      sessionStorage.setItem('user', JSON.stringify(userActualizado));

      setPerfil(data.cliente);
      setEditando(false);
      setCambiarPass(false);
      setPassActual(''); setPassNueva(''); setPassConfirm('');
      mostrarToast('Perfil actualizado correctamente.');
    } catch (e) { setError(e.message); }
    finally    { setGuardando(false); }
  };

  const handleCancelar = () => {
    setEditando(false);
    setCambiarPass(false);
    setError('');
    setNombre(perfil.nombre);
    setApellido(perfil.apellido);
    setEmail(perfil.email);
    setPassActual(''); setPassNueva(''); setPassConfirm('');
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (cargando) return (
    <div style={s.loadingWrap}>
      <div style={s.spinner} />
      <p style={{ color: '#bbb', fontSize: 14, marginTop: 12 }}>Cargando perfil...</p>
    </div>
  );

  const initials =`${perfil?.nombre?.charAt(0) || ''}${perfil?.apellido?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 560 }}>

      {toast.msg && (
        <div style={{ ...s.toast, background: toast.ok ? '#111' : '#DC2626' }}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={s.topbar}>
        <h1 style={s.titulo}>Mi perfil</h1>
        <p style={s.subtitulo}>Tus datos personales</p>
      </div>

      {/* Avatar + nombre */}
      <div style={s.avatarRow}>
        <div style={s.avatar}>{initials}</div>
        <div>
          <div style={s.avatarNombre}> {perfil?.nombre} {perfil?.apellido}
</div>
          <div style={s.avatarEmail}>{perfil?.email}</div>
        </div>
      </div>

      {/* Card datos */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={s.cardTitulo}>Datos de la cuenta</h3>
          {!editando && (
            <button onClick={() => setEditando(true)} style={s.btnEditar}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
          )}
        </div>

        {!editando ? (
          /* ── Vista ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Campo label="Nombre" valor={perfil?.nombre} />
            <Campo label="Apellido" valor={perfil?.apellido} />
            <Campo label="Email"           valor={perfil?.email} />
            <Campo label="DNI"             valor={perfil?.DNI} />
            <Campo label="Fecha de nacimiento" valor={perfil?.fecha_nacimiento ? formatearFecha(perfil.fecha_nacimiento) : '—'} />
            <Campo label="Contraseña"      valor="••••••••" />
          </div>
        ) : (
          /* ── Edición ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div style={s.err}>{error}</div>}

            <div>
              <div style={s.label}>Nombre</div>
              <input style={s.input} value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>

            <div>
              <div style={s.label}>Apellido</div>
              <input
                style={s.input} value={apellido} onChange={e => setApellido(e.target.value)}
              />
            </div>

            <div>
              <div style={s.label}>Email</div>
              <input style={s.input} type="email" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>

            {/* DNI y fecha — solo lectura */}
            <Campo label="DNI"                 valor={perfil?.DNI} />
            <Campo label="Fecha de nacimiento" valor={perfil?.fecha_nacimiento ? formatearFecha(perfil.fecha_nacimiento) : '—'} />

            {/* Toggle cambiar contraseña */}
            <label style={s.togglePass} onClick={() => { setCambiarPass(!cambiarPass); setError(''); }}>
              <span style={{ ...s.toggleCircle, background: cambiarPass ? '#111' : '#e0e0e0' }}>
                <span style={{ ...s.toggleInner, transform: cambiarPass ? 'translateX(14px)' : 'translateX(0)' }} />
              </span>
              Cambiar contraseña
            </label>

            {cambiarPass && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', background: '#F7F6F3', borderRadius: 10 }}>
                <div>
                  <div style={s.label}>Contraseña actual</div>
                  <input style={s.input} type="password" value={passActual}
                    onChange={e => setPassActual(e.target.value)} placeholder="Tu contraseña actual" />
                </div>
                <div>
                  <div style={s.label}>Nueva contraseña</div>
                  <input style={s.input} type="password" value={passNueva}
                    onChange={e => setPassNueva(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <div style={s.label}>Confirmar nueva contraseña</div>
                  <input style={s.input} type="password" value={passConfirm}
                    onChange={e => setPassConfirm(e.target.value)} placeholder="Repetí la nueva contraseña" />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={handleCancelar} style={s.btnSec}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} style={{ ...s.btnPrimary, opacity: guardando ? 0.7 : 1 }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Campo({ label, valor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#111' }}>{valor || '—'}</span>
    </div>
  );
}

const s = {
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' },
  spinner:     { width: 28, height: 28, border: '2.5px solid #f0f0f0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  toast:       { position: 'fixed', bottom: 24, right: 24, color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10, fontSize: 13.5, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 8 },
  topbar:      { marginBottom: '1.5rem' },
  titulo:      { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: '0 0 4px' },
  subtitulo:   { fontSize: 12.5, color: '#aaa', margin: 0 },
  avatarRow:   { display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14 },
  avatar:      { width: 52, height: 52, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, flexShrink: 0 },
  avatarNombre:{ fontSize: 15, fontWeight: 500, color: '#111' },
  avatarEmail: { fontSize: 12.5, color: '#aaa', marginTop: 2 },
  card:        { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14, padding: '1.5rem' },
  cardTitulo:  { fontFamily: "'DM Serif Display', serif", fontSize: 17, fontWeight: 400, color: '#111', margin: 0 },
  btnEditar:   { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#F7F6F3', color: '#555', border: '0.5px solid #e0e0e0', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  label:       { fontSize: 12.5, fontWeight: 500, color: '#555', marginBottom: 5 },
  input:       { width: '100%', padding: '0.65rem 0.9rem', border: '0.5px solid #e0e0e0', borderRadius: 9, fontSize: 13.5, color: '#111', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  togglePass:  { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#444', cursor: 'pointer', userSelect: 'none' },
  toggleCircle:{ width: 32, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', padding: '0 2px', transition: 'background 0.2s', flexShrink: 0 },
  toggleInner: { width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s' },
  err:         { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13 },
  btnPrimary:  { background: '#111', color: '#fff', border: 'none', borderRadius: 9, padding: '0.65rem 1.35rem', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnSec:      { background: '#fff', color: '#555', border: '0.5px solid #ddd', borderRadius: 9, padding: '0.65rem 1rem', fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};