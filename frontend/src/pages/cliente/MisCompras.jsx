import { useEffect, useState } from 'react';
import { getFacturas, addValoracion, addReclamo } from '../../services/clienteService';

/**
 * @fileoverview Mis compras del cliente.
 * Lista todas las facturas con items, estado de envio y acciones:
 * - Valorar producto (si envio = Entregado y aún no valoró)
 * - Realizar reclamo (si envio = Entregado)
 *
 * @module MisCompras
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const IMG_URL = 'http://localhost:5000/uploads/';

function Estrellas({ valor, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n <= (hover || valor) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth="1.5"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// Modal genérico para valorar o reclamar un ítem
function ModalValoracion({ factura, item, onClose, id_cliente, onExito }) {
  const [puntaje,    setPuntaje]    = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando,   setEnviando]   = useState(false);
  const [error,      setError]      = useState('');

  const handleEnviar = async () => {
    if (puntaje === 0) return setError('Seleccioná una puntuación');
    setEnviando(true);
    try {
      await addValoracion({
        id_factura:  factura.id_factura,
        id_producto: item.id_producto,
        id_cliente,
        puntaje,
        comentario,
      });
      onExito('¡Valoración registrada con éxito!');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        <div style={m.header}>
          <h3 style={m.titulo}>Valorar producto</h3>
          <button onClick={onClose} style={m.btnX}>✕</button>
        </div>
        <p style={m.sub}>{item.producto_nombre}</p>

        {error && <div style={m.err}>{error}</div>}

        <div style={{ marginBottom: 12 }}>
          <div style={m.label}>Puntuación</div>
          <Estrellas valor={puntaje} onChange={setPuntaje} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={m.label}>Comentario <span style={{ color: '#aaa', fontWeight: 400 }}>(opcional)</span></div>
          <textarea rows={3} style={m.textarea}
            placeholder="Contá tu experiencia..."
            value={comentario} onChange={e => setComentario(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={m.btnSec}>Cancelar</button>
          <button onClick={handleEnviar} disabled={enviando} style={m.btnPrimary}>
            {enviando ? 'Enviando...' : 'Enviar valoración'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalReclamo({ factura, onClose, id_cliente, onExito }) {
  const [motivo,      setMotivo]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando,    setEnviando]    = useState(false);
  const [error,       setError]       = useState('');

  const handleEnviar = async () => {
    if (!motivo.trim() || !descripcion.trim()) return setError('Complete todos los campos');
    setEnviando(true);
    try {
      await addReclamo({ id_factura: factura.id_factura, id_cliente, motivo, descripcion });
      onExito('¡Reclamo registrado con éxito!');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        <div style={m.header}>
          <h3 style={m.titulo}>Realizar reclamo</h3>
          <button onClick={onClose} style={m.btnX}>✕</button>
        </div>
        <p style={m.sub}>Factura #{factura.id_factura}</p>

        {error && <div style={m.err}>{error}</div>}

        <div style={{ marginBottom: 12 }}>
          <div style={m.label}>Motivo</div>
          <input style={m.input} placeholder="Ej: Producto dañado, no llegó lo pedido..."
            value={motivo} onChange={e => setMotivo(e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={m.label}>Descripción del problema</div>
          <textarea rows={4} style={m.textarea}
            placeholder="Describí con detalle el problema..."
            value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={m.btnSec}>Cancelar</button>
          <button onClick={handleEnviar} disabled={enviando} style={m.btnPrimary}>
            {enviando ? 'Enviando...' : 'Enviar reclamo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MisCompras() {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const [facturas,  setFacturas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [toastMsg,  setToastMsg]  = useState('');

  // Modales
  const [modalValoracion, setModalValoracion] = useState(null); // { factura, item }
  const [modalReclamo,    setModalReclamo]    = useState(null); // { factura }

  const cargar = async () => {
    try {
      const data = await getFacturas(user.id_usuario);
      setFacturas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const estadoBadge = (estado) => {
    const estilos = {
      'Entregado':  { background: '#DCFCE7', color: '#166534' },
      'En proceso': { background: '#FEF9C3', color: '#854D0E' },
      'Sin envio':  { background: '#F1F5F9', color: '#64748B' },
    };
    return estilos[estado] || { background: '#F1F5F9', color: '#64748B' };
  };

  if (cargando) return <div style={s.empty}>Cargando tus compras...</div>;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Toast */}
      {toastMsg && (
        <div style={s.toast}>{toastMsg}</div>
      )}

      <div style={s.topbar}>
        <h1 style={s.titulo}>Mis compras</h1>
        <p style={s.subtitulo}>{facturas.length} {facturas.length === 1 ? 'compra' : 'compras'}</p>
      </div>

      {facturas.length === 0 ? (
        <div style={s.empty}>Todavía no realizaste ninguna compra.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {facturas.map(f => (
            <div key={f.id_factura} style={s.card}>
              {/* Header de la factura */}
              <div style={s.cardHeader}>
                <div>
                  <span style={s.facturaId}>Factura #{f.id_factura}</span>
                  <span style={s.fecha}>{new Date(f.fecha).toLocaleDateString('es-AR')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ ...s.estadoBadge, ...estadoBadge(f.estado_envio) }}>
                    {f.estado_envio}
                  </span>
                  <span style={s.total}>${Number(f.total).toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {f.items.map(item => (
                  <div key={item.id_itemCarrito} style={s.item}>
                    <div style={s.itemImg}>
                      {item.producto_imagen ? (
                        <img src={`${IMG_URL}${item.producto_imagen}`} alt={item.producto_nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                    </div>
                    <div style={s.itemInfo}>
                      <div style={s.itemNombre}>{item.producto_nombre}</div>
                      <div style={s.itemDetalle}>
                        {item.cantidad} × ${Number(item.precio_unitario).toLocaleString('es-AR')}
                      </div>
                    </div>

                    {/* Botón valorar por item (solo si envio entregado) */}
                    {f.id_estado_envio === 2 && (
                      <button
                        style={s.btnValoracion}
                        onClick={() => setModalValoracion({ factura: f, item })}>
                        ★ Valorar
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer con botón reclamar */}
              {f.id_estado_envio === 2 && (
                <div style={s.cardFooter}>
                  <button style={s.btnReclamo}
                    onClick={() => setModalReclamo({ factura: f })}>
                    Realizar reclamo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {modalValoracion && (
        <ModalValoracion
          factura={modalValoracion.factura}
          item={modalValoracion.item}
          id_cliente={user.id_usuario}
          onClose={() => setModalValoracion(null)}
          onExito={mostrarToast}
        />
      )}
      {modalReclamo && (
        <ModalReclamo
          factura={modalReclamo.factura}
          id_cliente={user.id_usuario}
          onClose={() => setModalReclamo(null)}
          onExito={mostrarToast}
        />
      )}
    </div>
  );
}

const s = {
  topbar:       { marginBottom: '1.5rem' },
  titulo:       { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: '0 0 4px' },
  subtitulo:    { fontSize: 12.5, color: '#aaa', margin: 0 },
  empty:        { textAlign: 'center', color: '#aaa', padding: '3rem', fontSize: 14 },
  toast:        { position: 'fixed', bottom: 24, right: 24, background: '#111', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10, fontSize: 13.5, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
  card:         { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14, padding: '1.25rem 1.5rem' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '0.5px solid #f0f0f0' },
  facturaId:    { fontSize: 14, fontWeight: 500, color: '#111', marginRight: 10 },
  fecha:        { fontSize: 12.5, color: '#aaa' },
  estadoBadge:  { fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 20 },
  total:        { fontSize: 15, fontWeight: 500, color: '#111' },
  item:         { display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' },
  itemImg:      { width: 44, height: 44, borderRadius: 8, background: '#F7F6F3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo:     { flex: 1 },
  itemNombre:   { fontSize: 13.5, fontWeight: 500, color: '#111' },
  itemDetalle:  { fontSize: 12, color: '#aaa', marginTop: 2 },
  btnValoracion:{ padding: '4px 10px', background: '#FEF3C7', color: '#92400E', border: '0.5px solid #FDE68A', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  cardFooter:   { borderTop: '0.5px solid #f0f0f0', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' },
  btnReclamo:   { padding: '6px 14px', background: '#fff', color: '#555', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};

const m = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal:     { background: '#fff', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 440, fontFamily: "'DM Sans', sans-serif" },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  titulo:    { fontFamily: "'DM Serif Display', serif", fontSize: 19, fontWeight: 400, color: '#111', margin: 0 },
  btnX:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa', padding: 0 },
  sub:       { fontSize: 13, color: '#888', margin: '0 0 16px' },
  label:     { fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 },
  input:     { width: '100%', padding: '0.6rem 0.8rem', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13.5, color: '#111', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
  textarea:  { width: '100%', padding: '0.6rem 0.8rem', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13.5, color: '#111', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
  btnPrimary:{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnSec:    { background: '#fff', color: '#555', border: '0.5px solid #ddd', borderRadius: 8, padding: '0.6rem 1rem', fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  err:       { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13, marginBottom: 12 },
};