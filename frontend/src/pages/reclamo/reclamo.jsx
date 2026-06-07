import { useEffect, useState, useRef } from 'react';

const BASE_URL = 'http://localhost:5000/api';
const IMG_URL  = 'http://localhost:5000/uploads/';

// ─── ChatEmprendedor ──────────────────────────────────────────────────────────
function ChatEmprendedor({ id_reclamo, estado, id_usuario, onMensajeEnviado, onResolver }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto,    setTexto]    = useState('');
  const [imagen,   setImagen]   = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error,    setError]    = useState('');
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  const cargarMensajes = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/reclamos/${id_reclamo}/mensajes`);
      const data = await res.json();
      setMensajes(Array.isArray(data) ? data : []);
    } catch { setError('Error al cargar mensajes'); }
  };

  useEffect(() => { cargarMensajes(); }, [id_reclamo]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

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

  const handleEnviar = async () => {
    if (!texto.trim() && !imagen) return;
    setEnviando(true); setError('');
    try {
      const formData = new FormData();
      formData.append('id_usuario', id_usuario);
      formData.append('contenido',  texto.trim() || 'Imagen adjunta');
      if (imagen) formData.append('imagen', imagen);

      const res  = await fetch(`${BASE_URL}/reclamos/${id_reclamo}/responder`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTexto('');
      limpiarImagen();
      await cargarMensajes();
      onMensajeEnviado();
    } catch (e) { setError(e.message); }
    finally { setEnviando(false); }
  };

  return (
    <div style={s.seccion}>
      <div style={s.seccionLabel}>Conversación</div>

      <div style={sc.chatBody}>
        {mensajes.map(msg => {
          const esEmprendedor = msg.emisor === 'emprendedor';
          return (
            <div key={msg.id_mensaje} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: esEmprendedor ? 'flex-end' : 'flex-start',
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 10.5, color: '#bbb', marginBottom: 3 }}>
                {esEmprendedor ? 'Vos' : 'Cliente'}
              </div>
              <div style={{
                maxWidth: '78%', padding: '8px 12px',
                borderRadius: esEmprendedor ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: esEmprendedor ? '#111' : '#F3F4F6',
                color: esEmprendedor ? '#fff' : '#111',
                fontSize: 13.5, lineHeight: 1.5,
              }}>
                {msg.contenido}
                {msg.imagen && (
                  <img src={`${IMG_URL}${msg.imagen}`} alt="adjunto"
                    style={{ display: 'block', marginTop: 8, maxWidth: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ fontSize: 10.5, color: '#ccc', marginTop: 3 }}>
                {new Date(msg.fecha).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <div style={s.alertaError}>{error}</div>}

      {estado !== 'Resuelto' && (
        <>
          {preview && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
              <img src={preview} alt="preview"
                style={{ maxHeight: 80, borderRadius: 8, border: '0.5px solid #e0e0e0' }} />
              <button onClick={limpiarImagen} style={sc.btnQuitarImg}>✕</button>
            </div>
          )}
          <div style={sc.inputWrap}>
            <button onClick={() => fileRef.current?.click()} style={sc.btnClip} title="Adjuntar imagen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleImagenChange} />
            <textarea rows={2} style={sc.input}
              placeholder="Escribí tu respuesta..."
              value={texto} onChange={e => setTexto(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
            />
            <button onClick={handleEnviar} disabled={enviando || (!texto.trim() && !imagen)} style={sc.sendBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {estado === 'Respondido' && (
            <button onClick={onResolver} style={s.btnResolver}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Marcar como resuelto
            </button>
          )}
        </>
      )}

      {estado === 'Resuelto' && (
        <div style={s.resueltoBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Este reclamo fue resuelto correctamente
        </div>
      )}
    </div>
  );
}

const sc = {
  chatBody:    { maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px 0', marginBottom: 10, borderBottom: '0.5px solid #f0f0f0' },
  inputWrap:   { display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10 },
  input:       { flex: 1, padding: '0.6rem 0.85rem', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13.5, color: '#111', resize: 'none', fontFamily: "'DM Sans', sans-serif", outline: 'none' },
  sendBtn:     { width: 36, height: 36, background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  btnClip:     { width: 36, height: 36, background: '#F7F6F3', color: '#555', border: '0.5px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  btnQuitarImg:{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#111', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

// ─── Export Default ───────────────────────────────────────────────────────────
export default function Reclamos() {
  const [reclamos,     setReclamos]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [filtro,       setFiltro]       = useState('todos');
  const [seleccionado, setSeleccionado] = useState(null);
  const [detalle,      setDetalle]      = useState(null);
  const [msgExito,     setMsgExito]     = useState('');
  const [msgError,     setMsgError]     = useState('');

  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  const cargarReclamos = () => {
    if (!user?.id_usuario) return;
    setCargando(true);
    fetch(`${BASE_URL}/reclamos?id_usuario=${user.id_usuario}`)
      .then(r => r.json())
      .then(data => { setReclamos(Array.isArray(data) ? data : []); setCargando(false); })
      .catch(() => setCargando(false));
  };

  useEffect(() => { cargarReclamos(); }, []);

  useEffect(() => {
    if (!seleccionado) { setDetalle(null); return; }
    fetch(`${BASE_URL}/reclamos/${seleccionado}`)
      .then(r => r.json())
      .then(setDetalle)
      .catch(() => setDetalle(null));
  }, [seleccionado]);

  const handleResolver = async () => {
    if (!confirm('¿Confirmar que el reclamo fue resuelto?')) return;
    try {
      const res  = await fetch(`${BASE_URL}/reclamos/${seleccionado}/resolver`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsgExito('Reclamo marcado como resuelto');
      cargarReclamos();
      fetch(`${BASE_URL}/reclamos/${seleccionado}`).then(r => r.json()).then(setDetalle);
    } catch (err) {
      setMsgError(err.message);
    } finally {
      setTimeout(() => { setMsgExito(''); setMsgError(''); }, 3000);
    }
  };

  const reclamosFiltrados = filtro === 'todos'
    ? reclamos
    : reclamos.filter(r => r.estado === filtro);

  const pendientes  = reclamos.filter(r => r.estado === 'Pendiente').length;
  const respondidos = reclamos.filter(r => r.estado === 'Respondido').length;
  const resueltos   = reclamos.filter(r => r.estado === 'Resuelto').length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={s.topbar}>
        <div>
          <h1 style={s.titulo}>Reclamos</h1>
          <p style={s.subtitulo}>Gestioná los reclamos recibidos de tus clientes</p>
        </div>
      </div>

      <div style={s.metricas}>
        <div style={{ ...s.card, ...s.cardHero }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardIcon, background: 'rgba(255,255,255,0.12)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          </div>
          <div style={s.cardLabelHero}>Total de reclamos</div>
          <div style={s.cardValorHero}>{reclamos.length}</div>
        </div>
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          label="Pendientes" valor={pendientes} alerta={pendientes > 0}
        />
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
          label="Respondidos" valor={respondidos}
        />
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Resueltos" valor={resueltos}
        />
        <MetricCard
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          label="Sin resolver" valor={pendientes + respondidos} alerta={(pendientes + respondidos) > 0}
        />
      </div>

      <div style={s.layout}>
        <div style={s.panelLista}>
          <div style={s.filtrosWrap}>
            {[
              { key: 'todos',      label: 'Todos' },
              { key: 'Pendiente',  label: `Pendientes${pendientes > 0 ? ` (${pendientes})` : ''}` },
              { key: 'Respondido', label: 'Respondidos' },
              { key: 'Resuelto',   label: 'Resueltos' },
            ].map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                style={{ ...s.filtroBtn, ...(filtro === f.key ? s.filtroBtnActivo : {}) }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={s.lista}>
            {cargando ? (
              <div style={s.empty}>Cargando...</div>
            ) : reclamosFiltrados.length === 0 ? (
              <div style={s.empty}>No hay reclamos {filtro !== 'todos' ? `con estado "${filtro}"` : ''}</div>
            ) : reclamosFiltrados.map(r => (
              <div key={r.id_reclamo}
                onClick={() => { setSeleccionado(r.id_reclamo); setMsgExito(''); setMsgError(''); }}
                style={{ ...s.reclamoItem, ...(seleccionado === r.id_reclamo ? s.reclamoItemActivo : {}) }}>
                <div style={s.reclamoTop}>
                  <span style={s.reclamoCliente}>{r.nombre_cliente}</span>
                  <EstadoBadge estado={r.estado} />
                </div>
                <div style={s.reclamoMotivo}>{r.motivo?.slice(0, 70)}{r.motivo?.length > 70 ? '...' : ''}</div>
                <div style={s.reclamoFecha}>{formatearFecha(r.fecha_reclamo)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.panelDetalle}>
          {!seleccionado ? (
            <div style={s.detalleVacio}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ color: '#bbb', fontSize: 13.5, marginTop: 12 }}>Seleccioná un reclamo para ver el detalle</p>
            </div>
          ) : !detalle ? (
            <div style={s.detalleVacio}><p style={{ color: '#bbb', fontSize: 13.5 }}>Cargando...</p></div>
          ) : (
            <div style={s.detalleContenido}>
              <div style={s.detalleHeader}>
                <div>
                  <div style={s.detalleLabel}>Reclamo #{detalle.id_reclamo}</div>
                  <div style={s.detalleTitulo}>{detalle.nombre_cliente}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{detalle.email_cliente}</div>
                </div>
                <EstadoBadge estado={detalle.estado} size="md" />
              </div>

              <div style={s.infoRow}>
                <span style={s.infoLabel}>Factura</span>
                <span style={s.infoValor}>#{detalle.id_factura}</span>
                <span style={{ ...s.infoLabel, marginLeft: 16 }}>Fecha</span>
                <span style={s.infoValor}>{formatearFecha(detalle.fecha_reclamo)}</span>
              </div>

              <div style={s.seccion}>
                <div style={s.seccionLabel}>Motivo del reclamo</div>
                <div style={s.motivoBox}>{detalle.motivo}</div>
              </div>

              {msgExito && <div style={s.alertaExito}>{msgExito}</div>}
              {msgError && <div style={s.alertaError}>{msgError}</div>}

              <ChatEmprendedor
                id_reclamo={detalle.id_reclamo}
                estado={detalle.estado}
                id_usuario={user?.id_usuario}
                onMensajeEnviado={() => {
                  cargarReclamos();
                  fetch(`${BASE_URL}/reclamos/${seleccionado}`).then(r => r.json()).then(setDetalle);
                }}
                onResolver={handleResolver}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────
function EstadoBadge({ estado, size = 'sm' }) {
  const estilos = {
    Pendiente:  { background: '#FEF9C3', color: '#854D0E' },
    Respondido: { background: '#DBEAFE', color: '#1E40AF' },
    Resuelto:   { background: '#DCFCE7', color: '#166534' },
  };
  const base = {
    fontSize: size === 'md' ? 12 : 11,
    padding: size === 'md' ? '3px 10px' : '2px 8px',
    borderRadius: 20, fontWeight: 500,
    ...(estilos[estado] || { background: '#f5f5f5', color: '#555' }),
  };
  return <span style={base}>{estado}</span>;
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

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  topbar:          { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  titulo:          { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: 0 },
  subtitulo:       { fontSize: 12.5, color: '#aaa', margin: '4px 0 0' },
  metricas:        { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: '1.5rem' },
  card:            { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, padding: '1.1rem 1.25rem' },
  cardHero:        { background: '#111', border: 'none', gridColumn: 'span 2 / span 2' },
  cardHeader:      { marginBottom: '0.75rem' },
  cardIcon:        { width: 32, height: 32, borderRadius: 8, background: '#F5F4F0', border: '0.5px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardLabel:       { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', fontWeight: 500, marginBottom: 6 },
  cardLabelHero:   { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 6 },
  cardValor:       { fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, lineHeight: 1 },
  cardValorHero:   { fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: '#fff', lineHeight: 1 },
  layout:          { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 12, alignItems: 'start' },
  panelLista:      { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, overflow: 'hidden' },
  filtrosWrap:     { display: 'flex', gap: 2, padding: '0.85rem 1rem', borderBottom: '0.5px solid #f0f0f0', flexWrap: 'wrap' },
  filtroBtn:       { background: 'none', border: 'none', padding: '0.3rem 0.7rem', fontSize: 12, color: '#aaa', cursor: 'pointer', borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  filtroBtnActivo: { background: '#F5F4F0', color: '#111', fontWeight: 500 },
  lista:           { maxHeight: 520, overflowY: 'auto' },
  empty:           { textAlign: 'center', color: '#bbb', fontSize: 13, padding: '2.5rem 1rem' },
  reclamoItem:     { padding: '0.9rem 1.1rem', borderBottom: '0.5px solid #f8f8f8', cursor: 'pointer', transition: 'background 0.1s' },
  reclamoItemActivo:{ background: '#F7F6F3', borderLeft: '2.5px solid #111' },
  reclamoTop:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  reclamoCliente:  { fontSize: 13, fontWeight: 500, color: '#111' },
  reclamoMotivo:   { fontSize: 12.5, color: '#777', lineHeight: 1.4, marginBottom: 5 },
  reclamoFecha:    { fontSize: 11, color: '#bbb' },
  panelDetalle:    { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, minHeight: 420 },
  detalleVacio:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 420 },
  detalleContenido:{ padding: '1.5rem' },
  detalleHeader:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '0.5px solid #f0f0f0' },
  detalleLabel:    { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', fontWeight: 500, marginBottom: 4 },
  detalleTitulo:   { fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 400, color: '#111' },
  infoRow:         { display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem', fontSize: 12.5 },
  infoLabel:       { color: '#aaa', fontWeight: 500, textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '0.06em' },
  infoValor:       { color: '#555', fontWeight: 500 },
  seccion:         { marginBottom: '1.25rem' },
  seccionLabel:    { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', fontWeight: 500, marginBottom: 8 },
  motivoBox:       { background: '#F7F6F3', borderRadius: 8, padding: '0.85rem 1rem', fontSize: 13.5, color: '#444', lineHeight: 1.6, border: '0.5px solid #ebebeb' },
  btnResolver:     { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#166534', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '0.55rem 1.1rem', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  resueltoBanner:  { display: 'flex', alignItems: 'center', gap: 7, background: '#DCFCE7', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '0.7rem 1rem', fontSize: 13, color: '#166534', fontWeight: 500 },
  alertaExito:     { background: '#DCFCE7', color: '#166534', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '0.55rem 0.85rem', fontSize: 13, marginBottom: '1rem' },
  alertaError:     { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.55rem 0.85rem', fontSize: 13, marginBottom: '1rem' },
};