import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
/**
 * @fileoverview Componente del panel de administración de la plataforma.
 * Muestra métricas globales, tabla de productos, emprendedores activos
 * y solicitudes pendientes de aprobación.
 *
 * @module DashboardAdmin
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const BASE_URL = 'http://localhost:5000/api';

export default function DashboardAdmin() {
  const [productos, setProductos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [emprendedores, setEmprendedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState('productos'); // 'productos' | 'emprendedores' | 'solicitudes'

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([
      fetch(`${BASE_URL}/productos`).then(r => r.json()),
      fetch(`${BASE_URL}/usuarios/solicitudes`).then(r => r.json()),
      fetch(`${BASE_URL}/usuarios/emprendedores`).then(r => r.json()),
    ]).then(([prods, sols, emps]) => {
      setProductos(Array.isArray(prods) ? prods : []);
      setSolicitudes(Array.isArray(sols) ? sols : []);
      setEmprendedores(Array.isArray(emps) ? emps : []);
      setCargando(false);
    }).catch(() => setCargando(false));
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleAprobar = async (id) => {
    await fetch(`${BASE_URL}/usuarios/${id}/aprobar`, { method: 'PATCH' });
    cargarDatos();
  };

  const handleRechazar = async (id) => {
    if (!confirm('¿Seguro que querés rechazar esta solicitud? Se eliminará el registro.')) return;
    await fetch(`${BASE_URL}/usuarios/${id}/rechazar`, { method: 'DELETE' });
    cargarDatos();
  };

  const totalStock = productos.reduce((a, p) => a + Number(p.stock), 0);
  const stockBajo = productos.filter(p => Number(p.stock) < 5).length;

  const navigate = useNavigate();

useEffect(() => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user || user.id_rol !== 1) {
    navigate('/login', { replace: true });
  }
}, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.titulo}>Panel de administración</h1>
          <p style={s.subtitulo}>Resumen general de la plataforma</p>
        </div>
      </div>

      {/* Métricas */}
      <div style={s.metricas}>
        <div style={{ ...s.card, ...s.cardHero }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardIcon, background: 'rgba(255,255,255,0.12)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <div style={s.cardLabelHero}>Total de productos</div>
          <div style={s.cardValorHero}>{productos.length}</div>
        </div>

        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Emprendedores activos"
          valor={emprendedores.length}
        />
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
          label="Unidades en stock"
          valor={totalStock.toLocaleString('es-AR')}
        />
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Stock bajo"
          valor={stockBajo}
          alerta={stockBajo > 0}
        />
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.1 5.18 2 2 0 0 1 4.11 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91"/></svg>}
          label="Solicitudes pendientes"
          valor={solicitudes.length}
          alerta={solicitudes.length > 0}
        />
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { key: 'productos', label: 'Todos los productos' },
          { key: 'emprendedores', label: 'Emprendedores activos' },
          { key: 'solicitudes', label: `Solicitudes pendientes${solicitudes.length > 0 ? ` (${solicitudes.length})` : ''}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSeccion(tab.key)}
            style={{ ...s.tab, ...(seccion === tab.key ? s.tabActivo : {}) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido según tab */}
      <div style={s.tabla}>
        {cargando ? (
          <div style={s.empty}>Cargando...</div>
        ) : seccion === 'productos' ? (
          <TablaProductos productos={productos} />
        ) : seccion === 'emprendedores' ? (
          <TablaEmprendedores emprendedores={emprendedores} />
        ) : (
          <TablaSolicitudes
            solicitudes={solicitudes}
            onAprobar={handleAprobar}
            onRechazar={handleRechazar}
          />
        )}
      </div>
    </div>
  );
}

// ─── Subcomponentes de tabla ───────────────────────────────────────────────

function TablaProductos({ productos }) {
  const porEmprendedor = productos.reduce((acc, p) => {
    const id = p.id_usuario;
    if (!acc[id]) acc[id] = { nombre: p.nombre_usuario || `#${id}`, productos: 0 };
    acc[id].productos++;
    return acc;
  }, {});

  return (
    <>
      <div style={s.tablaHeader}>
        <div>
          <div style={s.tablaLabel}>Catálogo completo</div>
          <div style={s.tablaSubtitulo}>Todos los productos de la plataforma</div>
        </div>
      </div>
      <table style={s.table}>
        <thead>
          <tr>
            {['Producto', 'Emprendedor', 'Precio', 'Stock', 'Estado'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto} style={s.tr}>
              <td style={s.td}><div style={{ fontWeight: 500, color: '#111', fontSize: 13.5 }}>{p.nombre}</div></td>
              <td style={s.td}><span style={s.badgeGris}>{p.nombre_usuario || `#${p.id_usuario}`}</span></td>
              <td style={s.td}>${Number(p.precio).toLocaleString('es-AR')}</td>
              <td style={s.td}>{p.stock}</td>
              <td style={s.td}>
                <span style={Number(p.stock) > 0 ? s.badgeActivo : s.badgeAgotado}>
                  {Number(p.stock) > 0 ? 'En stock' : 'Agotado'}
                </span>
              </td>
            </tr>
          ))}
          {productos.length === 0 && <FilaVacia cols={5} mensaje="No hay productos registrados" />}
        </tbody>
      </table>
    </>
  );
}

function TablaEmprendedores({ emprendedores }) {
  return (
    <>
      <div style={s.tablaHeader}>
        <div>
          <div style={s.tablaLabel}>Emprendedores activos</div>
          <div style={s.tablaSubtitulo}>Cuentas habilitadas para operar</div>
        </div>
      </div>
      <table style={s.table}>
        <thead>
          <tr>
            {['Emprendimiento', 'Titular', 'DNI', 'Email', 'Estado'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {emprendedores.map(e => (
            <tr key={e.id_usuario} style={s.tr}>
              <td style={s.td}><div style={{ fontWeight: 500, color: '#111', fontSize: 13.5 }}>{e.nombreEmprendimiento || '—'}</div></td>
              <td style={s.td}>{e.apellidoNombre}</td>
              <td style={s.td}>{e.DNI}</td>
              <td style={s.td}>{e.email}</td>
              <td style={s.td}><span style={s.badgeActivo}>Activo</span></td>
            </tr>
          ))}
          {emprendedores.length === 0 && <FilaVacia cols={5} mensaje="No hay emprendedores activos" />}
        </tbody>
      </table>
    </>
  );
}

function TablaSolicitudes({ solicitudes, onAprobar, onRechazar }) {
  return (
    <>
      <div style={s.tablaHeader}>
        <div>
          <div style={s.tablaLabel}>Solicitudes pendientes</div>
          <div style={s.tablaSubtitulo}>Emprendedores esperando aprobación</div>
        </div>
      </div>
      <table style={s.table}>
        <thead>
          <tr>
            {['Emprendimiento', 'Titular', 'DNI', 'Reseña', 'Acciones'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {solicitudes.map(s_ => (
            <tr key={s_.id_usuario} style={s.tr}>
              <td style={s.td}><div style={{ fontWeight: 500, color: '#111', fontSize: 13.5 }}>{s_.nombreEmprendimiento || '—'}</div></td>
              <td style={s.td}>{s_.apellidoNombre}</td>
              <td style={s.td}>{s_.DNI}</td>
              <td style={{ ...s.td, maxWidth: 220, color: '#777', fontSize: 12.5 }}>
                {s_.reseña?.slice(0, 80)}{s_.reseña?.length > 80 ? '...' : ''}
              </td>
              <td style={s.td}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onAprobar(s_.id_usuario)} style={s.btnAprobar}>Aprobar</button>
                  <button onClick={() => onRechazar(s_.id_usuario)} style={s.btnRechazar}>Rechazar</button>
                </div>
              </td>
            </tr>
          ))}
          {solicitudes.length === 0 && <FilaVacia cols={5} mensaje="No hay solicitudes pendientes" />}
        </tbody>
      </table>
    </>
  );
}

function FilaVacia({ cols, mensaje }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', color: '#bbb', padding: '2.5rem 1rem', fontSize: 13.5 }}>
        {mensaje}
      </td>
    </tr>
  );
}

function MetricCard({ icon, label, valor, alerta }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}><div style={s.cardIcon}>{icon}</div></div>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValor, color: alerta ? '#DC2626' : '#111' }}>{valor}</div>
    </div>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────

const s = {
  topbar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  titulo: { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: 0 },
  subtitulo: { fontSize: 12.5, color: '#aaa', margin: '4px 0 0' },
  metricas: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: '1.5rem' },
  card: { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, padding: '1.1rem 1.25rem' },
  cardHero: { background: '#111', border: 'none', gridColumn: 'span 2' },
  cardHeader: { marginBottom: '0.75rem' },
  cardIcon: { width: 32, height: 32, borderRadius: 8, background: '#F5F4F0', border: '0.5px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', fontWeight: 500, marginBottom: 6 },
  cardLabelHero: { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 6 },
  cardValor: { fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, lineHeight: 1 },
  cardValorHero: { fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: '#fff', lineHeight: 1 },
  tabs: { display: 'flex', gap: 4, marginBottom: 0, borderBottom: '0.5px solid #ebebeb' },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '0.6rem 1rem', fontSize: 13, color: '#aaa', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: -1 },
  tabActivo: { color: '#111', fontWeight: 500, borderBottom: '2px solid #111' },
  tabla: { background: '#fff', border: '0.5px solid #ebebeb', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' },
  tablaHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '0.5px solid #f5f5f5' },
  tablaLabel: { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', fontWeight: 500, marginBottom: 3 },
  tablaSubtitulo: { fontFamily: "'DM Serif Display', serif", fontSize: 17, fontWeight: 400, color: '#111' },
  empty: { textAlign: 'center', color: '#bbb', fontSize: 14, padding: '3rem 1rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 11, color: '#aaa', fontWeight: 500, textAlign: 'left', padding: '0.85rem 1.25rem', borderBottom: '0.5px solid #f0f0f0', letterSpacing: '0.04em', background: '#fafafa' },
  tr: { borderBottom: '0.5px solid #f8f8f8' },
  td: { fontSize: 13.5, color: '#555', padding: '0.9rem 1.25rem' },
  badgeActivo: { background: '#DCFCE7', color: '#166534', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  badgeAgotado: { background: '#FEE2E2', color: '#991B1B', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  badgeGris: { background: '#F5F4F0', color: '#555', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  btnAprobar: { background: '#111', color: '#fff', border: 'none', borderRadius: 7, padding: '0.3rem 0.85rem', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnRechazar: { background: '#fff', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 7, padding: '0.3rem 0.85rem', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};