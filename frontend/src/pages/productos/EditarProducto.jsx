import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, updateProduct } from '../../services/productoService';

const BASE_URL = 'http://localhost:5000/api';

export default function EditarProducto() {
  const { id } = useParams();
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' });
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getCategories(),
      fetch(`${BASE_URL}/productos/${id}`).then(r => r.json()),
    ]).then(([cats, producto]) => {
      setCategorias(cats);
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        id_categoria: producto.id_categoria,
      });
    }).catch(e => mostrarMensaje(e.message, 'error'));
  }, [id]);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await updateProduct(
        id, 
        form.nombre, 
        form.descripcion,
        parseFloat(form.precio), 
        parseInt(form.stock),
        parseInt(form.id_categoria),
        nuevaImagen
      );
      mostrarMensaje('Producto actualizado con éxito');
      setTimeout(() => navigate('/dashboard/productos'), 1500);
    } catch (e) {
      mostrarMensaje(e.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={s.topbar}>
        <button onClick={() => navigate('/dashboard/productos')} style={s.btnVolver}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Productos
        </button>
        <h1 style={s.titulo}>Editar producto</h1>
        <p style={s.subtitulo}>Modificá los datos del producto</p>
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
              maxLength={50} required style={s.input} />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Descripción *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              required rows={3} style={{ ...s.input, resize: 'vertical' }} />
          </div>

          <div style={s.grid2}>
            <div style={s.campo}>
              <label style={s.label}>Precio *</label>
              <input name="precio" type="number" min="0.01" step="0.01"
                value={form.precio} onChange={handleChange} required style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Stock *</label>
              <input name="stock" type="number" min="0"
                value={form.stock} onChange={handleChange} required style={s.input} />
            </div>
          </div>

          <div style={s.campo}>
            <label style={s.label}>Categoría *</label>
            <select name="id_categoria" value={form.id_categoria}
              onChange={handleChange} required style={s.input}>
              <option value="">Seleccioná una categoría</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.descripcion}</option>
              ))}
            </select>
          </div>
          
          <div style={s.campo}>
              <label style={s.label}>Cambiar imagen (opcional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setNuevaImagen(e.target.files[0])} 
                style={s.input} 
              />
              <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>
                Dejá este campo vacío si no querés cambiar la imagen actual.
              </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" disabled={cargando} style={s.btnGuardar}>
              {cargando ? 'Guardando...' : 'Guardar cambios'}
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