import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quitarDelCarrito } from '../../services/carritoService';

const IMG_URL = 'http://localhost:5000/uploads/';

/**
 * @fileoverview Sidebar deslizable del carrito de compras.
 * Se abre desde cualquier parte del layout del cliente.
 *
 * @module Carrito
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * @prop {boolean}   abierto       - Controla si el sidebar está visible
 * @prop {Function}  onCerrar      - Callback para cerrar el sidebar
 * @prop {Array}     items         - Items del carrito
 * @prop {Function}  onActualizar  - Callback para recargar el carrito tras quitar un item
 */
export default function Carrito({ abierto, onCerrar, items = [], onActualizar }) {
  const navigate  = useNavigate();
  const overlayRef = useRef(null);

  const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);

  const handleQuitar = async (id_itemCarrito) => {
    try {
      await quitarDelCarrito(id_itemCarrito);
      onActualizar();
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleCheckout = () => {
    onCerrar();
    navigate('/catalogo/checkout');
  };

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onCerrar}
        style={{
          ...s.overlay,
          opacity:        abierto ? 1 : 0,
          pointerEvents:  abierto ? 'all' : 'none',
        }}
      />

      {/* Sidebar */}
      <div style={{
        ...s.sidebar,
        transform: abierto ? 'translateX(0)' : 'translateX(100%)',
      }}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.titulo}>Mi carrito</h2>
            <p style={s.subtitulo}>
              {items.length === 0
                ? 'Sin productos'
                : `${items.length} ${items.length === 1 ? 'producto' : 'productos'}`}
            </p>
          </div>
          <button onClick={onCerrar} style={s.btnX}>✕</button>
        </div>

        {/* Items */}
        <div style={s.body}>
          {items.length === 0 ? (
            <div style={s.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p style={{ color: '#bbb', fontSize: 13.5, marginTop: 12 }}>
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item.id_itemCarrito} style={s.item}>
                  {/* Imagen */}
                  <div style={s.itemImg}>
                    {item.imagen ? (
                      <img
                        src={`${IMG_URL}${item.imagen}`}
                        alt={item.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div style={s.itemInfo}>
                    <div style={s.itemNombre}>{item.nombre}</div>
                    <div style={s.itemDetalle}>
                      {item.cantidad} × ${Number(item.precio_carrito).toLocaleString('es-AR')}
                    </div>
                  </div>

                  {/* Subtotal + quitar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={s.itemSubtotal}>
                      ${Number(item.subtotal).toLocaleString('es-AR')}
                    </span>
                    <button
                      onClick={() => handleQuitar(item.id_itemCarrito)}
                      style={s.btnQuitar}
                      title="Quitar del carrito"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={s.footer}>
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total</span>
              <span style={s.totalValor}>${total.toLocaleString('es-AR')}</span>
            </div>
            <button onClick={handleCheckout} style={s.btnCheckout}>
              Ir al checkout
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  overlay: {
    position:   'fixed',
    inset:      0,
    background: 'rgba(0,0,0,0.4)',
    zIndex:     998,
    transition: 'opacity 0.25s ease',
  },
  sidebar: {
    position:       'fixed',
    top:            0,
    right:          0,
    width:          '100%',
    maxWidth:       400,
    height:         '100vh',
    background:     '#fff',
    zIndex:         999,
    display:        'flex',
    flexDirection:  'column',
    boxShadow:      '-8px 0 32px rgba(0,0,0,0.1)',
    transition:     'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    fontFamily:     "'DM Sans', sans-serif",
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    padding:        '1.5rem 1.5rem 1rem',
    borderBottom:   '0.5px solid #f0f0f0',
    flexShrink:     0,
  },
  titulo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize:   22,
    fontWeight: 400,
    color:      '#111',
    margin:     '0 0 3px',
  },
  subtitulo: { fontSize: 12.5, color: '#aaa', margin: 0 },
  btnX: {
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    fontSize:   16,
    color:      '#bbb',
    padding:    0,
    lineHeight: 1,
    flexShrink: 0,
  },
  body: {
    flex:       1,
    overflowY:  'auto',
    padding:    '1.25rem 1.5rem',
  },
  emptyState: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    paddingBottom:  '4rem',
  },
  item: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    padding:    '10px 0',
    borderBottom: '0.5px solid #f7f7f7',
  },
  itemImg: {
    width:          52,
    height:         52,
    borderRadius:   10,
    background:     '#F7F6F3',
    overflow:       'hidden',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  itemInfo:    { flex: 1, minWidth: 0 },
  itemNombre:  { fontSize: 13.5, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemDetalle: { fontSize: 12, color: '#aaa', marginTop: 3 },
  itemSubtotal:{ fontSize: 13.5, fontWeight: 600, color: '#111' },
  btnQuitar: {
    background: 'none',
    border:     '0.5px solid #e8e8e8',
    borderRadius: 7,
    cursor:     'pointer',
    color:      '#bbb',
    padding:    '4px 6px',
    display:    'flex',
    alignItems: 'center',
    transition: 'color 0.15s, border-color 0.15s',
  },
  footer: {
    padding:      '1.25rem 1.5rem 1.5rem',
    borderTop:    '0.5px solid #f0f0f0',
    flexShrink:   0,
    background:   '#fff',
  },
  totalRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   14,
  },
  totalLabel: { fontSize: 13, color: '#888', fontWeight: 400 },
  totalValor: { fontSize: 20, fontWeight: 600, color: '#111', fontFamily: "'DM Serif Display', serif" },
  btnCheckout: {
    width:          '100%',
    padding:        '0.85rem',
    background:     '#111',
    color:          '#fff',
    border:         'none',
    borderRadius:   12,
    fontSize:       14,
    fontWeight:     500,
    cursor:         'pointer',
    fontFamily:     "'DM Sans', sans-serif",
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
  },
};