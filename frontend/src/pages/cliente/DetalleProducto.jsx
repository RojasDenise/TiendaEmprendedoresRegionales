import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../../services/productoService';
import { getValoraciones, addValoracion, getFacturas } from '../../services/clienteService';

/**
 * @fileoverview Detalle de un producto.
 * Muestra imagen, descripcion, info del emprendedor, promedio de estrellas
 * y lista de valoraciones. Si el cliente tiene una compra entregada de este
 * producto y aún no valoró, muestra el formulario.
 *
 * @module DetalleProducto
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const IMG_URL = 'http://localhost:5000/uploads/';

const getInitials = (nombre = '') =>
  nombre.split(',')[0].trim().slice(0, 2).toUpperCase() || '??';

function Estrellas({ valor, onChange, readonly = false, size = 18 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n <= (hover || valor) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth="1.5"
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange && onChange(n)}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  const [producto,       setProducto]       = useState(null);
  const [valorData,      setValorData]       = useState({ promedio: 0, total: 0, valoraciones: [] });
  const [facturaHabil,   setFacturaHabil]    = useState(null); // factura entregada con este producto
  const [yaValoro,       setYaValoro]        = useState(false);
  const [cargando,       setCargando]        = useState(true);

  // Formulario de valoracion
  const [puntaje,    setPuntaje]    = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando,   setEnviando]   = useState(false);
  const [mensajeOk,  setMensajeOk]  = useState('');
  const [error,      setError]      = useState('');

  const cargarDatos = async () => {
    try {
      // Cargar producto
      const prods = await getProducts();
      const prod = prods.find(p => p.id_producto === parseInt(id));
      setProducto(prod || null);

      // Cargar valoraciones
      const vData = await getValoraciones(id);
      setValorData(vData);

      // Verificar si el cliente (id_rol 3) puede valorar
      if (user?.id_rol === 3) {
        const facturas = await getFacturas(user.id_usuario);
        // Buscar una factura entregada que contenga este producto y no haya sido valorada
        const factura = facturas.find(f =>
          f.id_estado_envio === 2 &&
          f.items.some(i => i.id_producto === parseInt(id))
        );
        setFacturaHabil(factura || null);

        if (factura) {
          const yaVal = vData.valoraciones.some(
            v => v.id_factura === factura.id_factura
          );
          setYaValoro(yaVal);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [id]);

  const handleValoracion = async () => {
    setError('');
    if (puntaje === 0) return setError('Seleccioná una puntuación');
    setEnviando(true);
    try {
      await addValoracion({
        id_factura:  facturaHabil.id_factura,
        id_producto: parseInt(id),
        id_cliente:  user.id_usuario,
        puntaje,
        comentario,
      });
      setMensajeOk('¡Valoración registrada con éxito!');
      setYaValoro(true);
      const vData = await getValoraciones(id);
      setValorData(vData);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div style={s.empty}>Cargando...</div>;
  if (!producto) return <div style={s.empty}>Producto no encontrado.</div>;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 780 }}>
      {/* Botón volver */}
      <button onClick={() => navigate('/catalogo')} style={s.btnVolver}>
        ← Volver al catálogo
      </button>

      {/* Card principal */}
      <div style={s.cardPrincipal}>
        {/* Imagen */}
        <div style={s.imgWrap}>
          {producto.imagen ? (
            <img src={`${IMG_URL}${producto.imagen}`} alt={producto.nombre} style={s.img}
              onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <div style={s.sinImagen}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={s.info}>
          <div style={s.categoriaBadge}>{producto.categoria_nombre}</div>
          <h1 style={s.nombre}>{producto.nombre}</h1>
          <p style={s.descripcion}>{producto.descripcion}</p>

          {/* Precio y stock */}
          <div style={s.precioRow}>
            <span style={s.precio}>${Number(producto.precio).toLocaleString('es-AR')}</span>
            <span style={producto.stock > 0 ? s.badgeStock : s.badgeAgotado}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </span>
          </div>

          {/* Promedio de estrellas */}
          <div style={s.promedioRow}>
            <Estrellas valor={Math.round(valorData.promedio)} readonly size={16} />
            <span style={s.promedioTexto}>
              {valorData.promedio > 0 ? valorData.promedio.toFixed(1) : 'Sin valoraciones'}{' '}
              {valorData.total > 0 && `(${valorData.total})`}
            </span>
          </div>

          {/* Emprendedor */}
          <div style={s.empCard}>
            <div style={s.avatarEmp}>{getInitials(producto.emprendedor_nombre)}</div>
            <div>
              <div style={s.empLabel}>Emprendedor</div>
              <div style={s.empNombre}>
                {producto.emprendedor_nombre?.split(',')[0]?.trim() || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de valoracion */}
      {user?.id_rol === 3 && facturaHabil && !yaValoro && (
        <div style={s.seccion}>
          <h2 style={s.seccionTitulo}>Valorar este producto</h2>
          <p style={s.seccionSub}>Compraste este producto — compartí tu experiencia</p>

          {mensajeOk && <div style={s.alertOk}>{mensajeOk}</div>}
          {error      && <div style={s.alertErr}>{error}</div>}

          <div style={{ marginBottom: 12 }}>
            <div style={s.fieldLabel}>Puntuación</div>
            <Estrellas valor={puntaje} onChange={setPuntaje} size={24} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={s.fieldLabel}>Comentario <span style={{ color: '#aaa', fontWeight: 400 }}>(opcional)</span></div>
            <textarea
              rows={3}
              style={s.textarea}
              placeholder="Contá tu experiencia con el producto..."
              value={comentario}
              onChange={e => setComentario(e.target.value)}
            />
          </div>

          <button onClick={handleValoracion} disabled={enviando} style={s.btnPrimary}>
            {enviando ? 'Enviando...' : 'Enviar valoración'}
          </button>
        </div>
      )}

      {user?.id_rol === 3 && facturaHabil && yaValoro && (
        <div style={s.alertOk}>Ya valoraste este producto. ¡Gracias!</div>
      )}

      {/* Lista de valoraciones */}
      <div style={s.seccion}>
        <h2 style={s.seccionTitulo}>Valoraciones ({valorData.total})</h2>
        {valorData.valoraciones.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 13.5 }}>Todavía no hay valoraciones para este producto.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {valorData.valoraciones.map(v => (
              <div key={v.id_valoracion} style={s.valorCard}>
                <div style={s.valorHeader}>
                  <div style={s.valorAvatar}>
                    {v.cliente_nombre?.split(',')[0]?.trim().slice(0, 2).toUpperCase() || 'CL'}
                  </div>
                  <div>
                    <div style={s.valorNombre}>{v.cliente_nombre?.split(',')[0]?.trim()}</div>
                    <div style={s.valorFecha}>{new Date(v.fecha).toLocaleDateString('es-AR')}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Estrellas valor={v.puntaje} readonly size={14} />
                  </div>
                </div>
                {v.comentario && <p style={s.valorComentario}>{v.comentario}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  empty:           { textAlign: 'center', color: '#aaa', padding: '3rem', fontSize: 14 },
  btnVolver:       { background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: '0 0 1rem', fontFamily: "'DM Sans', sans-serif" },
  cardPrincipal:   { display: 'flex', gap: 24, background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  imgWrap:         { width: 260, minWidth: 260, height: 260, background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img:             { width: '100%', height: '100%', objectFit: 'cover' },
  sinImagen:       { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  info:            { flex: 1, padding: '1.5rem 1.5rem 1.5rem 0' },
  categoriaBadge:  { fontSize: 10, fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  nombre:          { fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: '#111', margin: '0 0 8px' },
  descripcion:     { fontSize: 13.5, color: '#666', lineHeight: 1.6, margin: '0 0 16px' },
  precioRow:       { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  precio:          { fontSize: 22, fontWeight: 500, color: '#111' },
  badgeStock:      { fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  badgeAgotado:    { fontSize: 11, background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  promedioRow:     { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  promedioTexto:   { fontSize: 13, color: '#666' },
  empCard:         { display: 'flex', alignItems: 'center', gap: 10, background: '#F7F6F3', borderRadius: 10, padding: '0.75rem 1rem' },
  avatarEmp:       { width: 36, height: 36, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  empLabel:        { fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' },
  empNombre:       { fontSize: 13.5, fontWeight: 500, color: '#111' },
  seccion:         { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14, padding: '1.5rem', marginBottom: 16 },
  seccionTitulo:   { fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: '#111', margin: '0 0 4px' },
  seccionSub:      { fontSize: 13, color: '#aaa', margin: '0 0 16px' },
  fieldLabel:      { fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 },
  textarea:        { width: '100%', padding: '0.6rem 0.8rem', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13.5, color: '#111', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
  btnPrimary:      { background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  alertOk:         { background: '#DCFCE7', color: '#166534', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13, marginBottom: 12 },
  alertErr:        { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13, marginBottom: 12 },
  valorCard:       { background: '#F7F6F3', borderRadius: 10, padding: '0.9rem 1rem' },
  valorHeader:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  valorAvatar:     { width: 28, height: 28, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  valorNombre:     { fontSize: 13, fontWeight: 500, color: '#111' },
  valorFecha:      { fontSize: 11, color: '#aaa' },
  valorComentario: { fontSize: 13, color: '#555', margin: 0, lineHeight: 1.5 },
};