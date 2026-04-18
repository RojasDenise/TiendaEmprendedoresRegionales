import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function DashboardEmprendedor() {
  const navigate = useNavigate();

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <h2 style={s.logo}>Tienda</h2>
          <p style={s.subtitulo}>Emprendedores</p>
        </div>
        <nav>
          <NavLink to="/dashboard/productos"
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}>
            📦 Mis Productos
          </NavLink>
          {/* Tu compañera va a agregar más links acá */}
        </nav>
        <div style={s.sidebarFooter}>
          <button onClick={() => navigate('/')} style={s.btnCerrar}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' },
  sidebar: {
    width: 220, backgroundColor: '#2c3e50', color: 'white',
    display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
    position: 'fixed', top: 0, left: 0, height: '100vh'
  },
  sidebarHeader: { padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #3d5166' },
  logo: { margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#2ecc71' },
  subtitulo: { margin: '4px 0 0', fontSize: '0.8rem', color: '#95a5a6' },
  navLink: {
    display: 'block', padding: '0.75rem 1.5rem', color: '#bdc3c7',
    textDecoration: 'none', fontSize: '0.95rem', transition: 'all 0.2s'
  },
  navLinkActive: { backgroundColor: '#3d5166', color: 'white', borderLeft: '3px solid #2ecc71' },
  sidebarFooter: { marginTop: 'auto', padding: '1rem 1.5rem' },
  btnCerrar: {
    width: '100%', padding: '0.6rem', backgroundColor: 'transparent',
    color: '#95a5a6', border: '1px solid #3d5166', borderRadius: 6,
    cursor: 'pointer', fontSize: '0.9rem'
  },
  main: { marginLeft: 220, padding: '2rem', flex: 1 },
};