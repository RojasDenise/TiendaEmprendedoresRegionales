import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createProduct } from '../../services/productoService';

const formInicial = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' };

export default function AgregarProducto() {
  const [form, setForm] = useState(formInicial);
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const userRaw = sessionStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(e => mostrarMensaje('No se pudieron cargar las categorías: ' + e.message, 'error'));
  }, []);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await createProduct(
        form.nombre, form.descripcion,
        parseFloat(form.precio), parseInt(form.stock),
        parseInt(form.id_categoria), user?.id_usuario || 1
      );
      mostrarMensaje('Producto agregado con éxito');
      setTimeout(() => navigate('/dashboard/productos'), 1500);
    } catch (e) {
      mostrarMensaje(e.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Topbar */}
      <div style={s.topbar}>
        <button onClick={() => navigate('/dashboard/productos')} style={s.btnVolver}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Productos
        </button>
        <h1 style={s.titulo}>Agregar producto</h1>
        <p style={s.subtitulo}>Completá los datos del nuevo producto</p>
      </div>

      {mensaje.texto && (
        <div style={mensaje.tipo === 'error' ? s.alertaError : s.alertaExito}>
          {mensaje.texto}
        </div>
      )}

      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          <div style={s.campo}>
            <label style={s.label}>Nombre del producto *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange}
              maxLength={50} required style={s.input} placeholder="Ej: Mermelada de durazno" />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Descripción *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              required rows={3} style={{ ...s.input, resize: 'vertical' }}
              placeholder="Describí tu producto..." />
          </div>

          <div style={s.grid2}>
            <div style={s.campo}>
              <label style={s.label}>Precio *</label>
              <input name="precio" type="number" min="0.01" step="0.01"
                value={form.precio} onChange={handleChange} required
                style={s.input} placeholder="0.00" />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Stock *</label>
              <input name="stock" type="number" min="0"
                value={form.stock} onChange={handleChange} required
                style={s.input} placeholder="0" />
            </div>
          </div>

          <div style={s.campo}>
            <label style={s.label}>Categoría *</label>
            <select name="id_categoria" value={form.id_categoria}
              onChange={handleChange} required style={s.input}>
              <option value="">Seleccioná una categoría</option>
              {categorias.length > 0
                ? categorias.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.descripcion}</option>
                  ))
                : <option disabled>Cargando categorías...</option>
              }
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" disabled={cargando} style={s.btnGuardar}>
              {cargando ? 'Guardando...' : 'Guardar producto'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard/productos')} style={s.btnCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  topbar: { marginBottom: '1.5rem' },
  btnVolver: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#999', padding: 0, marginBottom: '0.5rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  titulo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26, fontWeight: 400, color: '#111', margin: 0,
  },
  subtitulo: { fontSize: 12.5, color: '#aaa', margin: '4px 0 0' },
  alertaError: {
    background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA',
    borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: 13, marginBottom: '1rem',
  },
  alertaExito: {
    background: '#DCFCE7', color: '#166534', border: '0.5px solid #BBF7D0',
    borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: 13, marginBottom: '1rem',
  },
  card: {
    background: '#fff', border: '0.5px solid #ebebeb',
    borderRadius: 12, padding: '2rem', maxWidth: 580,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  label: { fontSize: 13, fontWeight: 500, color: '#444' },
  input: {
    padding: '0.6rem 0.8rem', border: '0.5px solid #ddd', borderRadius: 8,
    fontSize: 14, color: '#111', outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
  },
  btnGuardar: {
    padding: '0.65rem 1.5rem', background: '#111', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  btnCancelar: {
    padding: '0.65rem 1.2rem', background: '#fff', color: '#555',
    border: '0.5px solid #e0e0e0', borderRadius: 8, fontSize: 13.5,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
};