import { useEffect, useState, useRef } from 'react';
import {
  obtenerFacturas, agregarValoracion,
  obtenerMensajesReclamo, agregarReclamo, responderReclamo
} from '../../services/clienteService';

const IMG_URL  = 'http://localhost:5000/uploads/';
const BASE_URL = 'http://localhost:5000/api';

const MOTIVOS = [
  'Producto defectuoso o dañado', 'No llegó lo pedido',
  'Producto diferente al anunciado', 'Demora en la entrega',
  'Problema con el pago', 'Otro',
];

// ─── Estrellas ────────────────────────────────────────────────────────────────
function Estrellas({ valor, onChange, size = 22, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n <= (hover || valor) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth="1.5"
          style={{ cursor: readonly ? 'default' : 'pointer', transition: 'fill 0.1s' }}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange && onChange(n)}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ─── Modal Valoración ─────────────────────────────────────────────────────────
function ModalValoracion({ factura, item, onClose, id_cliente, onExito }) {
  const [puntaje,    setPuntaje]    = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando,   setEnviando]   = useState(false);
  const [error,      setError]      = useState('');

  const handleEnviar = async () => {
    if (puntaje === 0) return setError('Seleccioná una puntuación');
    setEnviando(true); setError('');
    try {
      await agregarValoracion({ id_factura: factura.id_factura, id_producto: item.id_producto, id_cliente, puntaje, comentario });
      onExito('¡Valoración registrada con éxito!');
      onClose();
    } catch (e) { setError(e.message); }
    finally { setEnviando(false); }
  };

  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={m.modal}>
        <div style={m.header}>
          <h3 style={m.titulo}>Valorar producto</h3>
          <button onClick={onClose} style={m.btnX}>✕</button>
        </div>
        <div style={m.itemPreview}>
          {item.producto_imagen && (
            <div style={m.itemThumb}>
              <img src={`${IMG_URL}${item.producto_imagen}`} alt={item.producto_nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{item.producto_nombre}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.categoria}</div>
          </div>
        </div>
        {error && <div style={m.err}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <div style={m.label}>Puntuación</div>
          <Estrellas valor={puntaje} onChange={setPuntaje} size={26} />
          {puntaje > 0 && <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>{['','Muy malo','Malo','Regular','Bueno','Excelente'][puntaje]}</div>}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={m.label}>Comentario <span style={{ color: '#bbb', fontWeight: 400 }}>(opcional)</span></div>
          <textarea rows={3} style={m.textarea} placeholder="Contá tu experiencia con el producto..."
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

// ─── Modal Chat Reclamo ───────────────────────────────────────────────────────
function ModalChat({ factura, reclamo, onClose, id_cliente, onReclamoCreado }) {
  const esNuevo  = !reclamo;
  const resuelto = reclamo?.estado_reclamo_desc === 'Resuelto';

  const [motivo,      setMotivo]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensajes,    setMensajes]    = useState([]);
  const [texto,       setTexto]       = useState('');
  const [imagen,      setImagen]      = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [enviando,    setEnviando]    = useState(false);
  const [error,       setError]       = useState('');
  const [enChat,      setEnChat]      = useState(!esNuevo);

  const idReclamoRef = useRef(reclamo?.id_reclamo || null);
  const bottomRef    = useRef(null);
  const fileRef      = useRef(null);

  const cargarMensajes = async () => {
    if (!idReclamoRef.current) return;
    try {
      const data = await obtenerMensajesReclamo(idReclamoRef.current);
      setMensajes(Array.isArray(data) ? data : []);
    } catch { setError('Error al cargar mensajes'); }
  };

  useEffect(() => {
    if (!esNuevo) cargarMensajes();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const limpiarImagen = () => {
    setImagen(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── ÚNICO CAMBIO: se eliminaron await cargarMensajes() y setEnChat(true),
  //    y se agregó onClose() para cerrar el modal al terminar. ──
  const handleCrearReclamo = async () => {
    if (!motivo.trim())      return setError('Seleccioná un motivo');
    if (!descripcion.trim()) return setError('Describí el problema');
    setEnviando(true); setError('');
    try {
      await agregarReclamo({
        id_factura: factura.id_factura,
        id_cliente,
        motivo,
        descripcion,
        imagen,
      });
      limpiarImagen();
      onReclamoCreado();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setEnviando(false); }
  };

  const handleEnviarMensaje = async () => {
    if (!texto.trim() && !imagen) return;
    if (!idReclamoRef.current) return;
    setEnviando(true); setError('');
    try {
      await responderReclamo(idReclamoRef.current, id_cliente, texto.trim(), imagen);
      setTexto('');
      limpiarImagen();
      await cargarMensajes();
    } catch (e) { setError(e.message); }
    finally { setEnviando(false); }
  };

  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        ...m.modal,
        maxWidth: 500,
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        padding: 0,
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={m.chatHeader}>
          <div>
            <h3 style={m.titulo}>
              {!enChat ? 'Realizar reclamo' : 'Conversación del reclamo'}
            </h3>
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
              Factura #{factura.id_factura} · ${Number(factura.total).toLocaleString('es-AR')}
            </p>
          </div>
          <button onClick={onClose} style={m.btnX}>✕</button>
        </div>

        {/* ── FORMULARIO INICIAL ── */}
        {!enChat && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
            {error && <div style={m.err}>{error}</div>}

            <div style={{ marginBottom: 14 }}>
              <div style={m.label}>Motivo del reclamo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MOTIVOS.map(op => (
                  <label key={op} style={{ ...m.radio, ...(motivo === op ? m.radioSelected : {}) }}>
                    <input type="radio" name="motivo" value={op} checked={motivo === op}
                      onChange={() => setMotivo(op)} style={{ display: 'none' }} />
                    <span style={m.radioCircle}>{motivo === op && <span style={m.radioInner} />}</span>
                    {op}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={m.label}>Descripción del problema</div>
              <textarea rows={3} style={m.textarea} placeholder="Describí con detalle qué ocurrió..."
                value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={m.label}>Imagen <span style={{ color: '#bbb', fontWeight: 400 }}>(opcional)</span></div>
              {preview && (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                  <img src={preview} alt="preview"
                    style={{ maxHeight: 120, borderRadius: 8, border: '0.5px solid #e0e0e0' }} />
                  <button onClick={limpiarImagen} style={m.btnQuitarImg}>✕</button>
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} style={m.btnAdjuntar}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                {imagen ? imagen.name : 'Adjuntar imagen'}
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleImagenChange} />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={m.btnSec}>Cancelar</button>
              <button onClick={handleCrearReclamo} disabled={enviando}
                style={{ ...m.btnPrimary, background: '#DC2626' }}>
                {enviando ? 'Enviando...' : 'Enviar reclamo'}
              </button>
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {enChat && (
          <>
            <div style={m.chatBody}>
              {mensajes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#bbb', fontSize: 13, padding: '2rem' }}>
                  Sin mensajes todavía
                </div>
              ) : mensajes.map(msg => {
                const esCliente = msg.emisor === 'cliente';
                return (
                  <div key={msg.id_mensaje} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: esCliente ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 10.5, color: '#bbb', marginBottom: 3 }}>
                      {esCliente ? 'Vos' : 'Emprendedor'}
                    </div>
                    <div style={{
                      maxWidth: '78%', padding: '9px 13px',
                      borderRadius: esCliente ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: esCliente ? '#111' : '#F3F4F6',
                      color: esCliente ? '#fff' : '#111',
                      fontSize: 13.5, lineHeight: 1.5,
                    }}>
                      {msg.contenido}
                      {msg.imagen && (
                        <img src={`${IMG_URL}${msg.imagen}`} alt="adjunto"
                          style={{ display: 'block', marginTop: 8, maxWidth: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#ccc', marginTop: 3 }}>
                      {new Date(msg.fecha).toLocaleString('es-AR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {error && <div style={{ ...m.err, margin: '0 1.5rem 0.5rem' }}>{error}</div>}

            {resuelto ? (
              <div style={m.chatResuelto}>
                ✓ Este reclamo fue resuelto. No se pueden enviar más mensajes.
              </div>
            ) : (
              <div style={m.chatInputArea}>
                {preview && (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                    <img src={preview} alt="preview"
                      style={{ maxHeight: 80, borderRadius: 8, border: '0.5px solid #e0e0e0' }} />
                    <button onClick={limpiarImagen} style={m.btnQuitarImg}>✕</button>
                  </div>
                )}
                <div style={m.chatInputWrap}>
                  <button onClick={() => fileRef.current?.click()} style={m.btnClip} title="Adjuntar imagen">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*"
                    style={{ display: 'none' }} onChange={handleImagenChange} />
                  <textarea rows={2} style={m.chatInput}
                    placeholder="Escribí tu mensaje..."
                    value={texto} onChange={e => setTexto(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarMensaje(); }
                    }}
                  />
                  <button onClick={handleEnviarMensaje}
                    disabled={enviando || (!texto.trim() && !imagen)}
                    style={m.chatSendBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MisCompras() {
  const user       = JSON.parse(sessionStorage.getItem('user') || 'null');
  const id_cliente = user?.id_usuario;

  const [facturas,        setFacturas]        = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [toastMsg,        setToastMsg]        = useState('');
  const [toastOk,         setToastOk]         = useState(true);
  const [modalValoracion, setModalValoracion] = useState(null);
  const [modalChat,       setModalChat]       = useState(null);

  const cargar = async () => {
    if (!id_cliente) return;
    setCargando(true);
    try {
      const data = await obtenerFacturas(id_cliente);
      setFacturas(data);
    } catch { mostrarToast('Error al cargar compras', false); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const mostrarToast = (msg, ok = true) => {
    setToastMsg(msg); setToastOk(ok);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const estadoBadgeStyle = (estado) => ({
    'Entregado':      { background: '#DCFCE7', color: '#166534' },
    'En Camino':      { background: '#DBEAFE', color: '#1E40AF' },
    'En Preparacion': { background: '#FEF9C3', color: '#854D0E' },
    'Cancelado':      { background: '#FEE2E2', color: '#991B1B' },
  }[estado] || { background: '#F1F5F9', color: '#64748B' });

  const abrirChat = async (f) => {
    if (!f.tiene_reclamo) {
      setModalChat({ factura: f, reclamo: null });
      return;
    }
    try {
      const res  = await fetch(`${BASE_URL}/reclamos/cliente/${id_cliente}`);
      const data = await res.json();
      const rec  = data.find(r => r.id_factura === f.id_factura);
      setModalChat({ factura: f, reclamo: rec || null });
    } catch { mostrarToast('Error al abrir la conversación', false); }
  };

  if (cargando) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
        <p style={{ color: '#bbb', fontSize: 14, marginTop: 12 }}>Cargando tus compras...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {toastMsg && (
        <div style={{ ...s.toast, background: toastOk ? '#111' : '#DC2626' }}>
          {toastOk ? '✓' : '✕'} {toastMsg}
        </div>
      )}

      <div style={s.topbar}>
        <h1 style={s.titulo}>Mis compras</h1>
        <p style={s.subtitulo}>
          {facturas.length === 0
            ? 'Sin compras todavía'
            : `${facturas.length} ${facturas.length === 1 ? 'compra' : 'compras'}`}
        </p>
      </div>

      {facturas.length === 0 ? (
        <div style={s.emptyState}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p style={{ color: '#bbb', fontSize: 14, marginTop: 12 }}>Todavía no realizaste ninguna compra.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {facturas.map(f => (
            <div key={f.id_factura} style={s.card}>
              <div style={s.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={s.facturaId}>Factura #{f.id_factura}</span>
                  <span style={s.fecha}>
                    {new Date(f.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ ...s.badge, ...estadoBadgeStyle(f.estado_envio) }}>{f.estado_envio}</span>
                  <span style={s.total}>${Number(f.total).toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {(f.items || []).map(item => (
                  <div key={item.id_detalleFactura} style={s.item}>
                    <div style={s.itemImg}>
                      {item.producto_imagen ? (
                        <img src={`${IMG_URL}${item.producto_imagen}`} alt={item.producto_nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                    </div>
                    <div style={s.itemInfo}>
                      <div style={s.itemNombre}>{item.producto_nombre}</div>
                      <div style={s.itemDetalle}>
                        {item.cantidad} × ${Number(item.precio_unitario).toLocaleString('es-AR')}
                        {item.vendedor && <span style={s.vendedor}> · {item.vendedor}</span>}
                      </div>
                    </div>
                    {f.id_estado_envio === 3 && (
                      item.ya_valorado ? (
                        <span style={s.yaValorado}><Estrellas valor={5} readonly size={13} /> Valorado</span>
                      ) : (
                        <button style={s.btnValoracion} onClick={() => setModalValoracion({ factura: f, item })}>
                          ★ Valorar
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>

              {f.id_estado_envio === 3 && (
                <div style={s.cardFooter}>
                  {f.tiene_reclamo ? (
                    <button style={s.btnVerChat} onClick={() => abrirChat(f)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {f.estado_reclamo_desc === 'Resuelto'
                        ? 'Reclamo resuelto · Ver conversación'
                        : 'Reclamo en proceso · Ver conversación'}
                    </button>
                  ) : (
                    <button style={s.btnReclamo} onClick={() => abrirChat(f)}>
                      Realizar reclamo
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalValoracion && (
        <ModalValoracion
          factura={modalValoracion.factura}
          item={modalValoracion.item}
          id_cliente={id_cliente}
          onClose={() => setModalValoracion(null)}
          onExito={msg => { mostrarToast(msg); cargar(); }}
        />
      )}

      {modalChat && (
        <ModalChat
          factura={modalChat.factura}
          reclamo={modalChat.reclamo}
          id_cliente={id_cliente}
          onClose={() => { setModalChat(null); cargar(); }}
          onReclamoCreado={() => {
            mostrarToast('¡Reclamo registrado! Te contactaremos pronto.');
            cargar();
          }}
        />
      )}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  topbar:        { marginBottom: '1.5rem' },
  titulo:        { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: '0 0 4px' },
  subtitulo:     { fontSize: 12.5, color: '#aaa', margin: 0 },
  loadingWrap:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' },
  spinner:       { width: 28, height: 28, border: '2.5px solid #f0f0f0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  emptyState:    { textAlign: 'center', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  toast:         { position: 'fixed', bottom: 24, right: 24, color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10, fontSize: 13.5, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 8 },
  card:          { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14, padding: '1.25rem 1.5rem' },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '0.5px solid #f0f0f0' },
  facturaId:     { fontSize: 13.5, fontWeight: 500, color: '#111' },
  fecha:         { fontSize: 12, color: '#bbb' },
  badge:         { fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 20 },
  total:         { fontSize: 15, fontWeight: 600, color: '#111' },
  item:          { display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0' },
  itemImg:       { width: 46, height: 46, borderRadius: 9, background: '#F7F6F3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo:      { flex: 1 },
  itemNombre:    { fontSize: 13.5, fontWeight: 500, color: '#111' },
  itemDetalle:   { fontSize: 12, color: '#aaa', marginTop: 2 },
  vendedor:      { color: '#bbb' },
  btnValoracion: { padding: '5px 11px', background: '#FFFBEB', color: '#92400E', border: '0.5px solid #FDE68A', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 },
  yaValorado:    { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#6B7280', flexShrink: 0 },
  cardFooter:    { borderTop: '0.5px solid #f0f0f0', paddingTop: 12, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
  btnReclamo:    { padding: '6px 14px', background: '#fff', color: '#555', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnVerChat:    { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#EFF6FF', color: '#1E40AF', border: '0.5px solid #BFDBFE', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
};

const m = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal:        { background: '#fff', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 460, fontFamily: "'DM Sans', sans-serif", maxHeight: '90vh', overflowY: 'auto' },
  chatHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '0.5px solid #f0f0f0', flexShrink: 0 },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titulo:       { fontFamily: "'DM Serif Display', serif", fontSize: 19, fontWeight: 400, color: '#111', margin: 0 },
  btnX:         { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#bbb', padding: 0, lineHeight: 1, flexShrink: 0 },
  label:        { fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 7 },
  itemPreview:  { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F7F6F3', borderRadius: 10, marginBottom: 18 },
  itemThumb:    { width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#eee', flexShrink: 0 },
  textarea:     { width: '100%', padding: '0.65rem 0.85rem', border: '0.5px solid #e0e0e0', borderRadius: 9, fontSize: 13.5, color: '#111', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' },
  radio:        { display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', border: '0.5px solid #e8e8e8', borderRadius: 9, fontSize: 13.5, cursor: 'pointer', color: '#444', transition: 'border-color 0.15s' },
  radioSelected:{ border: '0.5px solid #111', background: '#FAFAFA', color: '#111', fontWeight: 500 },
  radioCircle:  { width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioInner:   { width: 8, height: 8, borderRadius: '50%', background: '#111' },
  btnPrimary:   { background: '#111', color: '#fff', border: 'none', borderRadius: 9, padding: '0.65rem 1.35rem', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnSec:       { background: '#fff', color: '#555', border: '0.5px solid #ddd', borderRadius: 9, padding: '0.65rem 1rem', fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  err:          { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13, marginBottom: 14 },
  chatBody:     { flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column' },
  chatInputArea:{ padding: '0.75rem 1.5rem 1rem', borderTop: '0.5px solid #f0f0f0', flexShrink: 0 },
  chatInputWrap:{ display: 'flex', gap: 8, alignItems: 'flex-end' },
  chatInput:    { flex: 1, padding: '0.6rem 0.85rem', border: '0.5px solid #e0e0e0', borderRadius: 9, fontSize: 13.5, color: '#111', resize: 'none', fontFamily: "'DM Sans', sans-serif", outline: 'none' },
  chatSendBtn:  { width: 38, height: 38, background: '#111', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chatResuelto: { background: '#DCFCE7', color: '#166534', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13, textAlign: 'center', margin: '0 1.5rem 1rem' },
  btnClip:      { width: 38, height: 38, background: '#F7F6F3', color: '#555', border: '0.5px solid #e0e0e0', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  btnAdjuntar:  { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#F7F6F3', color: '#555', border: '0.5px solid #e0e0e0', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnQuitarImg: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#111', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};