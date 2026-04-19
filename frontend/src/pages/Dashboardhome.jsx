import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productoService';

export default function DashboardHome() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();
  const userRaw = sessionStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    if (user?.id_usuario) {
      getProducts(user.id_usuario)
        .then(setProductos)
        .catch(console.error);
    }
  }, []);

  const totalStock = productos.reduce((a, p) => a + Number(p.stock), 0);
  const stockBajo = productos.filter(p => Number(p.stock) < 5).length;
  const totalValor = productos.reduce((a, p) => a + Number(p.precio) * Number(p.stock), 0);

  const nombre = user?.apellidoNombre?.split(',')[0] || 'Emprendedor';

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.titulo}>Panel de control</h1>
          <p style={s.subtitulo}>Resumen general de tu catálogo</p>
        </div>
        <button onClick={() => navigate('/dashboard/productos/agregar')} style={s.btnNuevo}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Métricas */}
      <div style={s.metricas}>
        {/* Hero card */}
        <div style={{ ...s.card, ...s.cardHero }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardIcon, background: 'rgba(255,255,255,0.12)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div style={s.cardLabelHero}>Valor en stock</div>
          <div style={s.cardValorHero}>${totalValor.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</div>
        </div>

        {/* Card productos activos */}
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          label="Productos activos"
          valor={productos.length}
        />

        {/* Card unidades */}
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
          label="Unidades en stock"
          valor={totalStock.toLocaleString('es-AR')}
        />

        {/* Card stock bajo */}
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Stock bajo"
          valor={stockBajo}
          alerta={stockBajo > 0}
        />
      </div>

      {/* Tabla reciente */}
      <div style={s.tabla}>
        <div style={s.tablaHeader}>
          <div>
            <div style={s.tablaLabel}>Productos recientes</div>
            <div style={s.tablaSubtitulo}>Últimos {Math.min(5, productos.length)} productos de tu catálogo</div>
          </div>
          <button onClick={() => navigate('/dashboard/productos')} style={s.btnVerTodos}>
            Ver todos →
          </button>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              {['Producto', 'Precio', 'Stock', 'Estado'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.slice(0, 5).map(p => (
              <tr key={p.id_producto} style={s.tr}>
                <td style={s.td}>
                  <div style={{ fontWeight: 500, color: '#111', fontSize: 13.5 }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{p.descripcion?.slice(0, 40)}...</div>
                </td>
                <td style={s.td}>${Number(p.precio).toLocaleString('es-AR')}</td>
                <td style={s.td}>{p.stock}</td>
                <td style={s.td}>
                  <span style={Number(p.stock) > 0 ? s.badgeActivo : s.badgeAgotado}>
                    {Number(p.stock) > 0 ? 'En stock' : 'Agotado'}
                  </span>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '2rem' }}>
                  Aún no tenés productos. <span style={{ color: '#111', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => navigate('/dashboard/productos/agregar')}>Agregá uno</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, valor, alerta }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.cardIcon}>{icon}</div>
      </div>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValor, color: alerta ? '#DC2626' : '#111' }}>{valor}</div>
    </div>
  );
}

const s = {
  topbar: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  titulo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26, fontWeight: 400, color: '#111', margin: 0,
  },
  subtitulo: { fontSize: 12.5, color: '#aaa', margin: '4px 0 0' },
  btnNuevo: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#111', color: '#fff', border: 'none',
    padding: '0 14px', height: 34, borderRadius: 8,
    fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  metricas: {
    display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12, marginBottom: '1.5rem',
  },
  card: {
    background: '#fff', border: '0.5px solid #ebebeb',
    borderRadius: 12, padding: '1.1rem 1.25rem',
  },
  cardHero: {
    background: '#111', border: 'none',
    gridColumn: 'span 2',
  },
  cardHeader: { marginBottom: '0.75rem' },
  cardIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: '#F5F4F0', border: '0.5px solid #ebebeb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#aaa', fontWeight: 500, marginBottom: 6,
  },
  cardLabelHero: {
    fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 6,
  },
  cardValor: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28, fontWeight: 400, lineHeight: 1,
  },
  cardValorHero: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 32, fontWeight: 400, color: '#fff', lineHeight: 1,
  },
  tabla: {
    background: '#fff', border: '0.5px solid #ebebeb',
    borderRadius: 12, padding: '1.25rem 1.5rem',
  },
  tablaHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  tablaLabel: { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', fontWeight: 500, marginBottom: 3 },
  tablaSubtitulo: { fontFamily: "'DM Serif Display', serif", fontSize: 17, fontWeight: 400, color: '#111' },
  btnVerTodos: {
    background: 'none', border: '0.5px solid #e0e0e0', borderRadius: 7,
    padding: '0.35rem 0.9rem', fontSize: 12.5, color: '#555',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontSize: 11, color: '#aaa', fontWeight: 500, textAlign: 'left',
    padding: '0 0.75rem 0.75rem', borderBottom: '0.5px solid #f0f0f0',
    letterSpacing: '0.04em',
  },
  tr: { borderBottom: '0.5px solid #f8f8f8' },
  td: { fontSize: 13.5, color: '#555', padding: '0.8rem 0.75rem' },
  badgeActivo: {
    background: '#DCFCE7', color: '#166534', fontSize: 11,
    padding: '2px 8px', borderRadius: 20, fontWeight: 500,
  },
  badgeAgotado: {
    background: '#FEE2E2', color: '#991B1B', fontSize: 11,
    padding: '2px 8px', borderRadius: 20, fontWeight: 500,
  },
};