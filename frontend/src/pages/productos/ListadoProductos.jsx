import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/productoService';

const ID_USUARIO_LOGUEADO = 1; // reemplazar con contexto de auth

export default function ListadoProductos() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProducts(ID_USUARIO_LOGUEADO);
      setProductos(data);
    } catch (e) {
      mostrarMensaje(e.message, 'error');
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      mostrarMensaje('Producto eliminado con éxito');
      cargarProductos();
    } catch (e) {
      mostrarMensaje(e.message, 'error');
    }
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.titulo}>Listado de Productos</h1>
        <button onClick={() => navigate('/dashboard/productos/agregar')} style={s.btnAgregar}>
          + Agregar Producto
        </button>
      </div>

      {mensaje.texto && <Alerta mensaje={mensaje} />}

      {productos.some(p => p.stock < 5) && (
        <div style={s.alertaStock}>
          ⚠️ <strong>Stock bajo:</strong> Tenés productos con menos de 5 unidades disponibles.
        </div>
      )}

      <div style={s.tablaWrapper}>
        {productos.length === 0 ? (
          <p style={s.vacio}>Todavía no cargaste ningún producto.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Categoría</th>
                <th style={s.th}>Precio</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id_producto}
                  style={{ backgroundColor: p.stock < 5 ? '#fff8e1' : 'white' }}>
                  <td style={s.td}>{p.nombre}</td>
                  <td style={s.td}>{p.categoria_nombre}</td>
                  <td style={s.td}>${parseFloat(p.precio).toFixed(2)}</td>
                  <td style={s.td}>
                    {p.stock < 5
                      ? <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{p.stock} ⚠️</span>
                      : p.stock}
                  </td>
                  <td style={s.td}>
                    <button onClick={() => navigate(`/dashboard/productos/editar/${p.id_producto}`)}
                      style={s.btnEditar}>Editar</button>
                    <button onClick={() => handleEliminar(p.id_producto)}
                      style={s.btnEliminar}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  titulo: { margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' },
  tablaWrapper: { backgroundColor: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #eee', fontSize: '0.9rem', color: '#555' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid #f0f0f0' },
  vacio: { color: '#888', textAlign: 'center', padding: '3rem' },
  alertaStock: {
    padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: 6,
    backgroundColor: '#fff8e1', border: '1px solid #f0ad4e', color: '#856404'
  },
  btnAgregar: {
    padding: '0.6rem 1.2rem', backgroundColor: '#2ecc71', color: 'white',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'
  },
  btnEditar: {
    padding: '0.35rem 0.8rem', marginRight: 6, backgroundColor: '#3498db',
    color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'
  },
  btnEliminar: {
    padding: '0.35rem 0.8rem', backgroundColor: '#e74c3c',
    color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'
  },
};