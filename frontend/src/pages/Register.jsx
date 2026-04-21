import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * @fileoverview Componente de registro de nuevos usuarios en la plataforma.
 * Permite crear cuentas de tipo emprendedor o cliente, con validación de edad mínima
 * y campo de reseña condicional para emprendedores.
 * Al registrarse con éxito, redirige al login tras 2 segundos.
 *
 * @module Register
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/** URL base de la API para las peticiones de autenticación. */
const BASE_URL = 'http://localhost:5000/api';

/**
 * Componente Register.
 * Permite a un nuevo usuario crear una cuenta en la plataforma seleccionando su rol.
 *
 * Comportamiento principal:
 * - Valida que el usuario tenga al menos 16 años antes de enviar el formulario.
 * - Limita el campo DNI a un máximo de 8 dígitos mediante validación en el handler de cambio.
 * - Si el tipo de cuenta es emprendedor (id_rol === '2'), muestra un campo adicional de reseña.
 * - Muestra alertas de éxito o error según la respuesta del servidor.
 * - Al registrarse con éxito, redirige automáticamente a `/login` tras 2 segundos.
 * - La fecha máxima del campo de nacimiento se calcula dinámicamente para reflejar la edad mínima.
 *
 * @component
 * @returns {JSX.Element} Formulario de registro con validaciones, campos condicionales y enlace al login.
 */
export default function Register() {
  const [form, setForm] = useState({
    apellidoNombre: '', DNI: '', fecha_nacimiento: '',
    email: '', contraseña: '', id_rol: '2', reseña: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  /**
   * Actualiza el estado del formulario al modificar cualquier campo.
   * Aplica una restricción específica para el campo DNI, limitándolo a 8 dígitos.
   *
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - Evento de cambio del input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'DNI' && value.length > 8) return;
    setForm({ ...form, [name]: value });
  };

  /**
   * Maneja el envío del formulario de registro.
   * Valida la edad mínima del usuario antes de realizar la petición.
   * Convierte el id_rol a entero antes de enviarlo a la API.
   * Muestra feedback de éxito o error y redirige al login si el registro fue exitoso.
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
    setExito('');
    const hoy = new Date();
    const cumple = new Date(form.fecha_nacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;

    if (edad < 16) {
      setError('La edad mínima para registrarse es de 16 años.');
      setCargando(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id_rol: parseInt(form.id_rol) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrarse.');
      setExito(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Fecha máxima permitida en el campo de nacimiento.
   * Calculada dinámicamente restando 16 años a la fecha actual,
   * para impedir que el usuario seleccione una edad menor a la requerida.
   *
   * @type {string} Fecha en formato ISO (YYYY-MM-DD).
   */
  const fechaMaxima = new Date();
  fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 16);
  const maxDate = fechaMaxima.toISOString().split('T')[0];

  return (
    <div style={s.page}>
      <div style={s.card}>
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

        <h1 style={s.titulo}>Bienvenido a la Tienda</h1>
        <p style={s.subtitulo}>Completá tus datos para registrarte</p>

        {error && <div style={s.alertaError}>{error}</div>}
        {exito && <div style={s.alertaExito}>{exito}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.campo}>
            <label style={s.label}>Apellido y nombre</label>
            <input name="apellidoNombre" value={form.apellidoNombre} onChange={handleChange}
              required style={s.input} placeholder="García, Juan" />
          </div>

          <div style={s.grid2}>
            <div style={s.campo}>
              <label style={s.label}>DNI</label>
              <input name="DNI" type="number" value={form.DNI} onChange={handleChange}
                required style={s.input} placeholder="12345678" />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Fecha de nacimiento</label>
              <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento}
                onChange={handleChange} required style={s.input} max={maxDate} />
            </div>
          </div>

          <div style={s.campo}>
            <label style={s.label}>Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              required style={s.input} placeholder="tu@email.com" />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Contraseña</label>
            <input name="contraseña" type="password" value={form.contraseña} onChange={handleChange}
              required style={s.input} placeholder="Mínimo 6 caracteres" />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Tipo de cuenta</label>
            <select name="id_rol" value={form.id_rol} onChange={handleChange} style={s.input}>
              <option value="2">Emprendedor</option>
              <option value="3">Cliente</option>
            </select>
          </div>

          {form.id_rol === '2' && (
            <div style={s.campo}>
              <label style={s.label}>¿Qué productos pensás vender?</label>
              <textarea
                name="reseña" value={form.reseña} onChange={handleChange} required
                style={{ ...s.input, minHeight: '80px', resize: 'none' }}
                placeholder="Contanos brevemente sobre tu emprendimiento..."
              />
            </div>
          )}

          <button type="submit" disabled={cargando} style={s.btn}>
            {cargando ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={s.link}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={s.linkA}>Ingresá</Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Estilos en línea del componente Register.
 * Se definen como objeto para mantener el estilo junto al componente
 * y evitar dependencias de archivos CSS externos.
 *
 * @type {Object}
 */
const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#fff',
    fontFamily: "'DM Sans', sans-serif", padding: '2rem 0',
  },
  card: {
    width: '100%', maxWidth: 440, padding: '2.5rem 2rem',
    border: '0.5px solid #e5e5e5', borderRadius: 16, background: '#fff',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10, background: '#111',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: 500, color: '#111', fontFamily: "'DM Serif Display', serif" },
  titulo: { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: '0 0 6px' },
  subtitulo: { fontSize: 13.5, color: '#888', margin: '0 0 1.75rem' },
  alertaError: {
    background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA',
    borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: 13, marginBottom: '1rem',
  },
  alertaExito: {
    background: '#DCFCE7', color: '#166534', border: '0.5px solid #BBF7D0',
    borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: 13, marginBottom: '1rem',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '0.9rem' },
  label: { fontSize: 13, fontWeight: 500, color: '#444' },
  input: {
    padding: '0.6rem 0.8rem', border: '0.5px solid #ddd', borderRadius: 8,
    fontSize: 14, color: '#111', outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
  },
  btn: {
    width: '100%', padding: '0.7rem', background: '#111', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif",
  },
  link: { textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#888' },
  linkA: { color: '#111', fontWeight: 500, textDecoration: 'none' },
};