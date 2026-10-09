import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { obtenerCarrito } from '../../services/carritoService';
import Carrito from './Carrito';
import { PieLegal } from '../legal/LegalLayout';

// `privado: true` = solo se muestra y se puede abrir con sesión de cliente.
const navCliente = [
  {
    to: '/catalogo',
    end: true,
    privado: false,
    label: 'Catálogo',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/catalogo/mis-compras',
    end: false,
    privado: true,
    label: 'Mis compras',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    to: '/catalogo/perfil',
    end: false,
    privado: true,
    label: 'Perfil',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

/** Rutas del layout que necesitan sesión de cliente. El catálogo y el detalle de producto son públicos. */
const RUTAS_PRIVADAS = /^\/catalogo\/(mis-compras|checkout|perfil)(\/|$)/;

export default function ClienteLayout() {
  const user       = JSON.parse(sessionStorage.getItem('user') || 'null');
  const esCliente  = user?.id_rol === 3;
  const id_cliente = esCliente ? user.id_usuario : null;

  const location     = useLocation();
  const navigate     = useNavigate();
  const rutaPrivada  = RUTAS_PRIVADAS.test(location.pathname);
  // Admin y emprendedor tienen su propio panel: no navegan la tienda como clientes.
  const panelPropio  = user && !esCliente ? (user.id_rol === 1 ? '/admin' : '/dashboard') : null;

  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [itemsCarrito,   setItemsCarrito]   = useState([]);

  useEffect(() => {
    if (panelPropio) {
      navigate(panelPropio, { replace: true });
    } else if (!esCliente && rutaPrivada) {
      // Visitante sin sesión en una pantalla privada: al login, y después vuelve a donde quería ir.
      navigate('/login', { replace: true, state: { volverA: location.pathname } });
    }
  }, [panelPropio, esCliente, rutaPrivada, location.pathname, navigate]);

  const cargarCarrito = useCallback(async () => {
    if (!id_cliente) return;
    try {
      const data = await obtenerCarrito(id_cliente);
      setItemsCarrito(data);
    } catch {
      setItemsCarrito([]);
    }
  }, [id_cliente]);

  useEffect(() => { cargarCarrito(); }, [cargarCarrito]);

  // Escucha el evento que disparan Catalogo y DetalleProducto al agregar un item
  useEffect(() => {
    const handler = () => cargarCarrito();
    window.addEventListener('carrito:actualizar', handler);
    return () => window.removeEventListener('carrito:actualizar', handler);
  }, [cargarCarrito]);

  const totalItems = itemsCarrito.reduce((acc, i) => acc + i.cantidad, 0);

  const initials =
  `${user?.nombre?.charAt(0) || ''}${user?.apellido?.charAt(0) || ''}`.toUpperCase() || 'U';

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.replace('/catalogo');
  };

  // Mientras se redirige no se dibuja nada, así la pantalla privada no llega a pedir datos.
  if (panelPropio || (!esCliente && rutaPrivada)) return null;

  return (
    <div className="tr-shell" style={s.shell}>
      <nav className="tr-sidebar" style={s.sidebar}>
        <div className="tr-brand" style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 12h16l-2 12H10L8 12z"
                fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"
              />
              <path
                d="M12 12c0-2.21 1.79-4 4-4s4 1.79 4 4"
                stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"
              />
              <circle cx="13" cy="21" r="1" fill="#111" />
              <circle cx="19" cy="21" r="1" fill="#111" />
            </svg>
          </div>
          <div>
            <div style={s.brandName}>Tienda de Emprendedores Regionales</div>
          </div>
        </div>

        <div className="tr-nav-section" style={s.navSection}>Tienda</div>

        {/* En pantallas chicas este bloque pasa a ser una fila de pestañas (ver responsive.css) */}
        <div className="tr-nav">
        {navCliente.filter((item) => esCliente || !item.privado).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              ...s.navItem,
              ...(isActive ? s.navItemActive : {}),
            })}
          >
            <span style={{ opacity: 0.7 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Botón carrito con badge (solo con sesión de cliente) */}
        {esCliente && (
        <button onClick={() => setCarritoAbierto(true)} style={s.btnCarrito}>
          <span style={{ opacity: 0.7, display: 'flex' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </span>
          Carrito
          {totalItems > 0 && (
            <span style={s.badge}>{totalItems > 99 ? '99+' : totalItems}</span>
          )}
        </button>
        )}
        </div>

        {esCliente ? (
        <div className="tr-footer" style={s.sidebarFooter}>
          <div className="tr-user" style={s.userRow}>
            <div style={s.avatar}>{initials}</div>
            <div className="tr-user-name" style={s.userName}> {user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Usuario'}
          </div>
          
        </div>
          <button onClick={handleLogout} style={s.btnLogout} className="tr-logout" title="Cerrar sesión" aria-label="Cerrar sesión">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="tr-logout-text">Cerrar sesión</span>
          </button>
        </div>
        ) : (
        <div className="tr-footer" style={s.sidebarFooter}>
          <div className="tr-visit-text" style={s.visitanteTexto}>Ingresá para comprar y ver tus pedidos.</div>
          <Link to="/login" state={{ volverA: location.pathname }} className="tr-visit-btn" style={s.btnIngresar}>Ingresar</Link>
          <Link to="/register" state={{ volverA: location.pathname }} className="tr-visit-btn" style={s.btnCrearCuenta}>Crear cuenta</Link>
        </div>
        )}
      </nav>

      <main className="tr-main" style={s.main}>
        <Outlet />
        <PieLegal />
      </main>

      {/* Sidebar carrito */}
      <Carrito
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        items={itemsCarrito}
        onActualizar={cargarCarrito}
      />
    </div>
  );
}

const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F7F6F3',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#fff',
    borderRight: '0.5px solid #e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 1.25rem 1.5rem',
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandName: {
    fontSize: 15,
    fontWeight: 500,
    color: '#111',
    fontFamily: "'DM Serif Display', serif",
  },
  navSection: {
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#bbb',
    padding: '0 1.25rem 0.5rem',
    fontWeight: 500,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0.55rem 1.25rem',
    fontSize: 13.5,
    color: '#888',
    textDecoration: 'none',
    transition: 'background 0.15s',
  },
  navItemActive: {
    background: '#F7F6F3',
    color: '#111',
    fontWeight: 500,
    borderRadius: '0 8px 8px 0',
  },
  btnCarrito: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0.55rem 1.25rem',
    fontSize: 13.5,
    color: '#888',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
    textAlign: 'left',
    position: 'relative',
  },
  badge: {
    background: '#111',
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    minWidth: 17,
    height: 17,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    marginLeft: 'auto',
  },
  sidebarFooter: {
    marginTop: 'auto',
    borderTop: '0.5px solid #f0f0f0',
    padding: '1rem 1.25rem 0',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: '0.75rem',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: '#111',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 500,
  },
  userName: {
    fontSize: 12.5,
    color: '#555',
    fontWeight: 500,
  },
  visitanteTexto: {
    fontSize: 12,
    color: '#999',
    lineHeight: 1.4,
    marginBottom: '0.75rem',
  },
  btnIngresar: {
    display: 'block',
    textAlign: 'center',
    background: '#111',
    color: '#fff',
    borderRadius: 8,
    padding: '0.55rem 0',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    marginBottom: 8,
  },
  btnCrearCuenta: {
    display: 'block',
    textAlign: 'center',
    background: '#fff',
    color: '#111',
    border: '0.5px solid #ddd',
    borderRadius: 8,
    padding: '0.55rem 0',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
  },
  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12.5,
    color: '#999',
    padding: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
};