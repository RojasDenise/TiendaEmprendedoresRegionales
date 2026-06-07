import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCarrito, confirmarCompra } from '../../services/carritoService';

/**
 * @fileoverview Página de checkout.
 * Muestra el resumen del carrito, formulario de dirección
 * y selección de forma de pago para confirmar la compra.
 *
 * @module Checkout
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

// Mapa de id UI → texto que espera la BD (Pago.formaPago VARCHAR)
const FORMA_PAGO_LABEL = {
  1: 'Tarjeta',
  2: 'Efectivo/Transferencia',
};

const FORMAS_PAGO = [
  {
    id: 1,
    label: 'Tarjeta de crédito / débito',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    campos: true,
  },
  {
    id: 2,
    label: 'Efectivo / Transferencia',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M6 12h.01M18 12h.01"/>
      </svg>
    ),
    campos: false,
  },
];

const IMG_URL = 'http://localhost:5000/uploads/';

export default function Checkout() {
  const navigate   = useNavigate();
  const user       = JSON.parse(sessionStorage.getItem('user') || 'null');
  const id_cliente = user?.id_usuario;

  const [items,      setItems]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [enviando,   setEnviando]   = useState(false);
  const [error,      setError]      = useState('');

  // Formulario
  const [direccion,   setDireccion]   = useState('');
  const [formaPago,   setFormaPago]   = useState(null);
  const [nroTarjeta,  setNroTarjeta]  = useState('');
  const [titular,     setTitular]     = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv,         setCvv]         = useState('');

  const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);

  useEffect(() => {
    if (!id_cliente) { navigate('/login'); return; }
    cargarItems();
  }, []);

  const cargarItems = async () => {
    setCargando(true);
    try {
      const data = await obtenerCarrito(id_cliente);
      if (data.length === 0) { navigate('/catalogo'); return; }
      setItems(data);
    } catch { setError('Error al cargar el carrito'); }
    finally  { setCargando(false); }
  };

  const formatearTarjeta = (val) => {
    const limpio = val.replace(/\D/g, '').slice(0, 16);
    return limpio.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatearVencimiento = (val) => {
    const limpio = val.replace(/\D/g, '').slice(0, 4);
    if (limpio.length >= 3) return `${limpio.slice(0, 2)}/${limpio.slice(2)}`;
    return limpio;
  };

  const validar = () => {
    if (!direccion.trim()) return 'Ingresá la dirección de entrega';
    if (!formaPago)        return 'Seleccioná una forma de pago';
    if (formaPago === 1) {
      if (nroTarjeta.replace(/\s/g, '').length < 16) return 'Ingresá un número de tarjeta válido';
      if (!titular.trim())                            return 'Ingresá el nombre del titular';
      if (vencimiento.length < 5)                    return 'Ingresá el vencimiento (MM/AA)';
      if (cvv.length < 3)                            return 'Ingresá el CVV';
    }
    return null;
  };

  const handleConfirmar = async () => {
    const errValidacion = validar();
    if (errValidacion) { setError(errValidacion); return; }

    setEnviando(true); setError('');
    try {
      // formaPago es el id numérico: 1 = Tarjeta, 2 = Efectivo/Transferencia
      await confirmarCompra(id_cliente, formaPago);
      navigate('/catalogo/mis-compras', { state: { compraExitosa: true } });
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
        <p style={{ color: '#bbb', fontSize: 14, marginTop: 12 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={s.topbar}>
        <button onClick={() => navigate(-1)} style={s.btnVolver}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver
        </button>
        <h1 style={s.titulo}>Checkout</h1>
      </div>

      <div style={s.grid}>
        {/* ── Columna izquierda: formulario ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Dirección */}
          <div style={s.card}>
            <h3 style={s.cardTitulo}>
              <span style={s.step}>1</span> Dirección de entrega
            </h3>
            <textarea
              rows={3}
              style={s.textarea}
              placeholder="Ej: Av. Corrientes 1234, Piso 2, Buenos Aires"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
            />
          </div>

          {/* Forma de pago */}
          <div style={s.card}>
            <h3 style={s.cardTitulo}>
              <span style={s.step}>2</span> Forma de pago
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: formaPago === 1 ? 20 : 0 }}>
              {FORMAS_PAGO.map(fp => (
                <label
                  key={fp.id}
                  style={{ ...s.pagoOption, ...(formaPago === fp.id ? s.pagoSelected : {}) }}
                  onClick={() => setFormaPago(fp.id)}
                >
                  <span style={{ color: formaPago === fp.id ? '#111' : '#bbb', display: 'flex' }}>
                    {fp.icon}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, color: '#333' }}>{fp.label}</span>
                  <span style={s.radioCircle}>
                    {formaPago === fp.id && <span style={s.radioInner} />}
                  </span>
                </label>
              ))}
            </div>

            {/* Campos tarjeta */}
            {formaPago === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <div>
                  <div style={s.label}>Número de tarjeta</div>
                  <input
                    style={s.input}
                    placeholder="0000 0000 0000 0000"
                    value={nroTarjeta}
                    onChange={e => setNroTarjeta(formatearTarjeta(e.target.value))}
                    maxLength={19}
                  />
                </div>
                <div>
                  <div style={s.label}>Nombre del titular</div>
                  <input
                    style={s.input}
                    placeholder="Como aparece en la tarjeta"
                    value={titular}
                    onChange={e => setTitular(e.target.value.toUpperCase())}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.label}>Vencimiento</div>
                    <input
                      style={s.input}
                      placeholder="MM/AA"
                      value={vencimiento}
                      onChange={e => setVencimiento(formatearVencimiento(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.label}>CVV</div>
                    <input
                      style={s.input}
                      placeholder="123"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Info transferencia */}
            {formaPago === 2 && (
              <div style={s.infoTransferencia}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Al confirmar recibirás los datos bancarios para realizar el pago. Tu pedido se procesará una vez acreditado.
              </div>
            )}
          </div>

          {error && <div style={s.err}>{error}</div>}
        </div>

        {/* ── Columna derecha: resumen ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={s.card}>
            <h3 style={s.cardTitulo}>Resumen del pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.id_itemCarrito} style={s.resumenItem}>
                  <div style={s.resumenImg}>
                    {item.imagen ? (
                      <img
                        src={`${IMG_URL}${item.imagen}`}
                        alt={item.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nombre}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                      {item.cantidad} × ${Number(item.precio_carrito).toLocaleString('es-AR')}
                    </div>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111', flexShrink: 0 }}>
                    ${Number(item.subtotal).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div style={s.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 13, color: '#888' }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: '#111', fontFamily: "'DM Serif Display', serif" }}>
                ${total.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmar}
            disabled={enviando}
            style={{ ...s.btnConfirmar, opacity: enviando ? 0.7 : 1 }}
          >
            {enviando ? 'Procesando...' : 'Confirmar compra'}
          </button>

          <p style={{ fontSize: 11.5, color: '#bbb', textAlign: 'center', margin: 0 }}>
            Al confirmar aceptás los términos y condiciones de la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  loadingWrap:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' },
  spinner:           { width: 28, height: 28, border: '2.5px solid #f0f0f0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  topbar:            { display: 'flex', alignItems: 'center', gap: 14, marginBottom: '2rem' },
  titulo:            { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: 0 },
  btnVolver:         { display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '0.5px solid #e0e0e0', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  grid:              { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' },
  card:              { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 14, padding: '1.5rem' },
  cardTitulo:        { fontFamily: "'DM Serif Display', serif", fontSize: 17, fontWeight: 400, color: '#111', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 10 },
  step:              { width: 24, height: 24, background: '#111', color: '#fff', borderRadius: '50%', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textarea:          { width: '100%', padding: '0.7rem 0.9rem', border: '0.5px solid #e0e0e0', borderRadius: 9, fontSize: 13.5, color: '#111', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' },
  pagoOption:        { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '0.5px solid #e8e8e8', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s', userSelect: 'none' },
  pagoSelected:      { border: '0.5px solid #111', background: '#FAFAFA' },
  radioCircle:       { width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioInner:        { width: 8, height: 8, borderRadius: '50%', background: '#111' },
  label:             { fontSize: 12.5, fontWeight: 500, color: '#555', marginBottom: 5 },
  input:             { width: '100%', padding: '0.65rem 0.9rem', border: '0.5px solid #e0e0e0', borderRadius: 9, fontSize: 13.5, color: '#111', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  infoTransferencia: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 9, fontSize: 12.5, color: '#1E40AF', marginTop: 12, lineHeight: 1.5 },
  err:               { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.65rem 1rem', fontSize: 13 },
  resumenItem:       { display: 'flex', alignItems: 'center', gap: 10 },
  resumenImg:        { width: 40, height: 40, borderRadius: 8, background: '#F7F6F3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  divider:           { height: '0.5px', background: '#f0f0f0' },
  btnConfirmar:      { width: '100%', padding: '0.9rem', background: '#111', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};