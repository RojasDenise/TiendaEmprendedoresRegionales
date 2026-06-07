import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProductos, eliminarProducto } from '../../services/productoService';

/**
 * @fileoverview Componente para listar los productos del emprendedor autenticado.
 * Muestra una tabla con imagen, nombre, precio, stock y estado de cada producto,
 * con soporte para búsqueda en tiempo real y eliminación con confirmación inline.
 *
 * @module ListadoProductos
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const IMG_URL = 'http://localhost:5000/uploads/';

export default function ListadoProductos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const userRaw = sessionStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  /**
   * Muestra un mensaje de feedback temporal que desaparece a los 3 segundos.
   * @param {string} mensaje - Texto a mostrar.
   * @param {'exito'|'error'} tipo - Tipo de notificación.
   */
  const mostrarToast = (mensaje, tipo = 'exito') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargar = () => {
    setCargando(true);
    obtenerProductos(user?.id_usuario)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  /**
   * Elimina un producto por su ID tras la confirmación del usuario.
   * Muestra toast de éxito o error según el resultado.
   *
   * @async
   * @param {number} id - ID del producto a eliminar.
   */
  const handleEliminar = async (id) => {
    try {
      await eliminarProducto(id);
      setConfirmando(null);
      cargar();
      mostrarToast('Producto eliminado con éxito');
    } catch (e) {
      mostrarToast(e.message, 'error');
    }
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          ...s.toast,
          background: toast.tipo === 'error' ? '#FEE2E2' : '#DCFCE7',
          color: toast.tipo === 'error' ? '#991B1B' : '#166534',
          border: `0.5px solid ${toast.tipo === 'error' ? '#FECACA' : '#BBF7D0'}`,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={toast.tipo === 'error' ? '#991B1B' : '#166534'} strokeWidth="2.5">
            {toast.tipo === 'error'
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <polyline points="20 6 9 17 4 12"/>
            }
          </svg>
          {toast.mensaje}
        </div>
      )}

      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.titulo}>Productos</h1>
          <p style={s.subtitulo}>{productos.length} productos en tu catálogo</p>
        </div>
        <button onClick={() => navigate('/dashboard/productos/agregar')} style={s.btnNuevo}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Búsqueda */}
      <div style={s.searchWrap}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          style={s.searchInput}
        />
      </div>

      {/* Tabla */}
      <div style={s.tabla}>
        {cargando ? (
          <div style={s.empty}>Cargando productos...</div>
        ) : filtrados.length === 0 ? (
          <div style={s.empty}>
            {busqueda ? `Sin resultados para "${busqueda}"` : 'Aún no tenés productos.'}
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Imagen', 'Producto', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id_producto} style={s.tr}>
                  <td style={s.td}>
                    {p.imagen ? (
                      <img
                        src={`${IMG_URL}${p.imagen}`}
                        alt={p.nombre}
                        style={s.img}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={s.sinImagen}>Sin imagen</div>
                    )}
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500, color: '#111', fontSize: 13.5 }}>{p.nombre}</div>
                    {p.descripcion && (
                      <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>
                        {p.descripcion.length > 50 ? p.descripcion.slice(0, 50) + '...' : p.descripcion}
                      </div>
                    )}
                  </td>
                  <td style={s.td}>${Number(p.precio).toLocaleString('es-AR')}</td>
                  <td style={s.td}>{p.stock}</td>
                  <td style={s.td}>
                    <span style={Number(p.stock) > 0 ? s.badgeActivo : s.badgeAgotado}>
                      {Number(p.stock) > 0 ? 'En stock' : 'Agotado'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/dashboard/productos/editar/${p.id_producto}`)}
                        style={s.btnEditar}
                      >
                        Editar
                      </button>
                      {confirmando === p.id_producto ? (
                        <>
                          <button onClick={() => handleEliminar(p.id_producto)} style={s.btnEliminarConf}>
                            Confirmar
                          </button>
                          <button onClick={() => setConfirmando(null)} style={s.btnCancelar}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmando(p.id_producto)} style={s.btnEliminar}>
                          Eliminar
                        </button>
                      )}
                    </div>
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

const s = {
  toast: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 8, fontSize: 13,
    fontWeight: 500, marginBottom: '1rem',
  },
  topbar: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  titulo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26, fontWeight: 400, color: '#111', margin: 0,
  },
  subtitulo: { fontSize: 12.5, color: '#aaa', margin: '4px 0 0' },
  btnNuevo: {
    display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff',
    border: 'none', padding: '0 14px', height: 34, borderRadius: 8,
    fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '0.5px solid #e8e8e8',
    borderRadius: 8, padding: '0 12px', height: 36,
    marginBottom: '1rem', maxWidth: 320,
  },
  searchInput: {
    border: 'none', background: 'transparent', fontSize: 13, color: '#111',
    outline: 'none', width: '100%', fontFamily: "'DM Sans', sans-serif",
  },
  tabla: {
    background: '#fff', border: '0.5px solid #ebebeb',
    borderRadius: 12, overflow: 'hidden',
  },
  empty: {
    textAlign: 'center', color: '#bbb', fontSize: 14,
    padding: '3rem 1rem',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontSize: 11, color: '#aaa', fontWeight: 500, textAlign: 'left',
    padding: '0.85rem 1.25rem', borderBottom: '0.5px solid #f0f0f0',
    letterSpacing: '0.04em', background: '#fafafa',
  },
  tr: { borderBottom: '0.5px solid #f8f8f8' },
  td: { fontSize: 13.5, color: '#555', padding: '0.9rem 1.25rem' },
  img: {
    width: 48, height: 48, objectFit: 'cover',
    borderRadius: 8, border: '0.5px solid #f0f0f0',
  },
  sinImagen: {
    width: 48, height: 48, borderRadius: 8,
    background: '#f5f5f5', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 10, color: '#ccc',
  },
  badgeActivo: {
    background: '#DCFCE7', color: '#166534', fontSize: 11,
    padding: '2px 8px', borderRadius: 20, fontWeight: 500,
  },
  badgeAgotado: {
    background: '#FEE2E2', color: '#991B1B', fontSize: 11,
    padding: '2px 8px', borderRadius: 20, fontWeight: 500,
  },
  btnEditar: {
    background: 'none', border: '0.5px solid #e0e0e0', borderRadius: 6,
    padding: '0.3rem 0.75rem', fontSize: 12, color: '#555',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  btnEliminar: {
    background: 'none', border: '0.5px solid #FECACA', borderRadius: 6,
    padding: '0.3rem 0.75rem', fontSize: 12, color: '#DC2626',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  btnEliminarConf: {
    background: '#DC2626', border: 'none', borderRadius: 6,
    padding: '0.3rem 0.75rem', fontSize: 12, color: '#fff',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  btnCancelar: {
    background: 'none', border: '0.5px solid #e0e0e0', borderRadius: 6,
    padding: '0.3rem 0.75rem', fontSize: 12, color: '#555',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
};