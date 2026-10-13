/** Estilos compartidos por las pantallas de cuenta (mismo diseño que Login y Register). */
export const estilos = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: "'DM Sans', sans-serif", padding: '1rem' },
  card:       { width: '100%', maxWidth: 400, padding: '2.5rem 2rem', border: '0.5px solid #e5e5e5', borderRadius: 16, background: '#fff', boxSizing: 'border-box' },
  brand:      { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', textDecoration: 'none' },
  brandIcon:  { width: 36, height: 36, borderRadius: 10, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandName:  { fontSize: 18, fontWeight: 500, color: '#111', fontFamily: "'DM Serif Display', serif" },
  titulo:     { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: '0 0 6px' },
  subtitulo:  { fontSize: 13.5, lineHeight: 1.5, color: '#888', margin: '0 0 1.75rem' },
  texto:      { fontSize: 14, lineHeight: 1.6, color: '#555', margin: '0 0 1.5rem' },
  alertaError:{ background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: 13, lineHeight: 1.45, marginBottom: '1rem' },
  alertaOk:   { background: '#DCFCE7', color: '#166534', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: 13, lineHeight: 1.45, marginBottom: '1rem' },
  campo:      { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  label:      { fontSize: 13, fontWeight: 500, color: '#444' },
  input:      { padding: '0.6rem 0.8rem', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  ayuda:      { fontSize: 12, color: '#999' },
  btn:        { display: 'block', width: '100%', padding: '0.7rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' },
  link:       { textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#888' },
  linkA:      { color: '#111', fontWeight: 500, textDecoration: 'none' },
};

/** Flecha del desplegable, dibujada para que se vea igual en todos los navegadores. */
const FLECHA = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>')}")`;

/** Estilo de desplegable de la tienda (también lo usa el tipo de cuenta del registro). */
export const estiloSelect = {
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  width: '100%',
  minWidth: 0,
  padding: '0.6rem 2rem 0.6rem 0.8rem',
  border: '0.5px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  color: '#111',
  background: `#fff ${FLECHA} no-repeat right 0.7rem center`,
  cursor: 'pointer',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
};
