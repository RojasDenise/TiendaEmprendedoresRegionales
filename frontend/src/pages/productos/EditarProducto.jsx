import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, updateProduct } from '../../services/productoService';

const BASE_URL = 'http://localhost:5000/api';

export default function EditarProducto() {
  const { id } = useParams();
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' });
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar categorías y datos del producto
    Promise.all([
      getCategories(),
      fetch(`${BASE_URL}/productos/${id}`).then(r => r.json())
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
        parseInt(form.id_categoria)
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
    <div>
      <div style={s.header}>
        <h1 style={s.titulo}>Editar Producto</h1>
      </div>

      {mensaje.texto && <Alerta mensaje={mensaje} />}

      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          <div style={s.campo}>
            <label style={s.label}>Nombre del Producto *</label>
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
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" disabled={cargando} style={s.btnGuardar}>
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
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

function Alerta({ mensaje }) {
  return (
    <div style={{
      padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: 6,
      backgroundColor: mensaje.tipo === 'error' ? '#fde8e8' : '#e8f5e9',
      color: mensaje.tipo === 'error' ? '#c0392b' : '#27ae60',
      border: `1px solid ${mensaje.tipo === 'error' ? '#e74c3c' : '#2ecc71'}`
    }}>{mensaje.texto}</div>
  );
}

const s = {
  header: { marginBottom: '1.5rem' },
  titulo: { margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' },
  card: { backgroundColor: 'white', borderRadius: 8, padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 600 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  label: { fontWeight: '500', fontSize: '0.95rem', color: '#333' },
  input: { padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  btnGuardar: { padding: '0.6rem 1.5rem', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' },
  btnCancelar: { padding: '0.6rem 1.2rem', backgroundColor: 'white', color: '#333', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' },
};