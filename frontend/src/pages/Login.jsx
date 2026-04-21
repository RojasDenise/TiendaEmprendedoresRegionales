import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * @fileoverview Componente de inicio de sesión de la plataforma.
 * Permite al usuario autenticarse con email y contraseña.
 * Redirige automáticamente según el rol del usuario: admin, emprendedor o cliente.
 *
 * @module Login
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/** URL base de la API para las peticiones de autenticación. */
const BASE_URL = 'http://localhost:5000/api';

/**
 * Componente Login.
 * Renderiza el formulario de acceso a la plataforma y gestiona la autenticación del usuario.
 *
 * Comportamiento principal:
 * - Envía las credenciales al endpoint de login mediante una petición POST.
 * - Si la autenticación es exitosa, guarda el usuario en `sessionStorage`.
 * - Redirige según el rol: id_rol 1 → /admin, id_rol 2 → /dashboard, id_rol 3 → /catalogo.
 * - Si las credenciales son incorrectas o el servidor responde con error, muestra una alerta.
 * - Muestra feedback de carga en el botón mientras la petición está en curso.
 *
 * @component
 * @returns {JSX.Element} Formulario de inicio de sesión con marca, campos y enlace a registro.
 */
export default function Login() {
  const [form, setForm] = useState({ email: '', contraseña: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  /**
   * Actualiza el estado del formulario al modificar cualquier campo de texto.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input.
   */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Maneja el envío del formulario de login.
   * Envía las credenciales a la API, guarda el usuario en sessionStorage
   * y redirige según el rol recibido en la respuesta.
   *
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - Evento de envío del formulario.
   * @returns {Promise<void>}
   * @throws {Error} Si la respuesta del servidor no es exitosa, muestra el mensaje de error al usuario.
   */
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

      sessionStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.id_rol === 1) {
        navigate('/admin');
      } else if (data.user.id_rol === 2) {
        navigate('/dashboard');
      } else if (data.user.id_rol === 3) {
        navigate('/catalogo');
      }
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
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12h16l-2 12H10L8 12z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
              <path d="M12 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="13" cy="21" r="1" fill="#111"/>
              <circle cx="19" cy="21" r="1" fill="#111"/>
            </svg>
          </div>
          <span style={s.brandName}>Tienda de Emprendedores Regionales</span>
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

/**
 * Estilos en línea del componente Login.
 * Se definen como objeto para mantener el estilo junto al componente
 * y evitar dependencias de archivos CSS externos.
 *
 * @type {Object}
 */
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