import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const navEmprendedor = [
  {
    to: '/dashboard', end: true, label: 'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/dashboard/productos', end: false, label: 'Productos',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  },
];

const navAdmin = [
  {
    to: '/admin', end: true, label: 'Panel admin',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
];

export default function DashboardLayout({ rol }) {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isAdmin = rol === 'admin';
  const navItems = isAdmin ? navAdmin : navEmprendedor;
  const initials = user?.apellidoNombre?.split(',')[0].trim().slice(0, 2).toUpperCase() || 'U';

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={s.shell}>
      <nav style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
            </svg>
          </div>
          <div>
            <div style={s.brandName}>Tienda de Emprendedores Regionales</div>
            <div style={s.brandSub}>{isAdmin ? 'Admin' : 'Emprendedor'}</div>
          </div>
        </div>

        <div style={s.navSection}>General</div>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navItemActive : {}) })}>
            <span style={{ opacity: 0.7 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div style={s.sidebarFooter}>
          <div style={s.userRow}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.userName}>{user?.apellidoNombre?.split(',')[0] || 'Usuario'}</div>
          </div>
          <button onClick={handleLogout} style={s.btnLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: '#F7F6F3', fontFamily: "'DM Sans', sans-serif" },
  sidebar: {
    width: 220, minWidth: 220, background: '#fff', borderRight: '0.5px solid #e8e8e8',
    display: 'flex', flexDirection: 'column', padding: '1.25rem 0',
    position: 'sticky', top: 0, height: '100vh',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 1.25rem 1.5rem' },
  brandIcon: { width: 36, height: 36, borderRadius: 10, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandName: { fontSize: 15, fontWeight: 500, color: '#111', fontFamily: "'DM Serif Display', serif" },
  brandSub: { fontSize: 10, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' },
  navSection: { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', padding: '0 1.25rem 0.5rem', fontWeight: 500 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 1.25rem', fontSize: 13.5, color: '#888', textDecoration: 'none', transition: 'background 0.15s' },
  navItemActive: { background: '#F7F6F3', color: '#111', fontWeight: 500, borderRadius: '0 8px 8px 0' },
  sidebarFooter: { marginTop: 'auto', borderTop: '0.5px solid #f0f0f0', padding: '1rem 1.25rem 0' },
  userRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 },
  userName: { fontSize: 12.5, color: '#555', fontWeight: 500 },
  btnLogout: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#999', padding: 0, fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, padding: '2rem', overflowY: 'auto' },
};