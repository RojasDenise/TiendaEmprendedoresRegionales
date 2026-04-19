import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BASE_URL = 'http://localhost:5000/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', contraseña: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas.');

      // Guardar sesión
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir según rol
      if (data.user.id_rol === 1) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo / Marca */}
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
            </svg>
          </div>
          <span style={s.brandName}>Kora</span>
        </div>

        <h1 style={s.titulo}>Bienvenido</h1>
        <p style={s.subtitulo}>Ingresá con tu cuenta para continuar</p>

        {error && <div style={s.alerta}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.campo}>
            <label style={s.label}>Correo electrónico</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} required
              style={s.input} placeholder="tu@email.com"
            />
          </div>
          <div style={s.campo}>
            <label style={s.label}>Contraseña</label>
            <input
              name="contraseña" type="password" value={form.contraseña}
              onChange={handleChange} required
              style={s.input} placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={cargando} style={s.btn}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={s.link}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={s.linkA}>Registrate</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#fff',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: '100%', maxWidth: 400, padding: '2.5rem 2rem',
    border: '0.5px solid #e5e5e5', borderRadius: 16,
    background: '#fff',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: '2rem',
  },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10, background: '#111',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: 500, color: '#111', fontFamily: "'DM Serif Display', serif" },
  titulo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26, fontWeight: 400, color: '#111', margin: '0 0 6px',
  },
  subtitulo: { fontSize: 13.5, color: '#888', margin: '0 0 1.75rem' },
  alerta: {
    background: '#FEE2E2', color: '#991B1B',
    border: '0.5px solid #FECACA',
    borderRadius: 8, padding: '0.65rem 0.9rem',
    fontSize: 13, marginBottom: '1rem',
  },
  campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  label: { fontSize: 13, fontWeight: 500, color: '#444' },
  input: {
    padding: '0.6rem 0.8rem', border: '0.5px solid #ddd',
    borderRadius: 8, fontSize: 14, color: '#111',
    outline: 'none', width: '100%', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  },
  btn: {
    width: '100%', padding: '0.7rem', background: '#111',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
    marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif",
  },
  link: { textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#888' },
  linkA: { color: '#111', fontWeight: 500, textDecoration: 'none' },
};