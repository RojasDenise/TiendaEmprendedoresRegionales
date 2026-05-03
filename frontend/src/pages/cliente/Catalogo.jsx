import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/productoService';

/**
 * @fileoverview Catálogo de productos del cliente.
 * Grid de productos con filtros por categoría y buscador.
 * Muestra el nombre del emprendimiento en cada card.
 *
 * @module Catalogo
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

const IMG_URL = 'http://localhost:5000/uploads/';

/** Genera iniciales a partir del nombre del emprendimiento. */
const getInitials = (nombre = '') =>
  nombre.trim().slice(0, 2).toUpperCase() || '??';

export default function Catalogo() {
  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [catActiva,   setCatActiva]   = useState('todos');
  const [busqueda,    setBusqueda]    = useState('');
  const [cargando,    setCargando]    = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria =
      catActiva === 'todos' || p.id_categoria === parseInt(catActiva);
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.nombreEmprendimiento || '').toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.titulo}>Catálogo</h1>
          <p style={s.subtitulo}>{productos.length} productos disponibles</p>
        </div>
        <div style={s.buscadorWrap}>
          <svg style={s.buscadorIcon} width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={s.buscador}
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros de categoría */}
      <div style={s.filtros}>
        <button
          style={{ ...s.filtroBtn, ...(catActiva === 'todos' ? s.filtroBtnActivo : {}) }}
          onClick={() => setCatActiva('todos')}>
          Todos
        </button>
        {categorias.map(c => (
          <button
            key={c.id_categoria}
            style={{ ...s.filtroBtn, ...(catActiva === c.id_categoria ? s.filtroBtnActivo : {}) }}
            onClick={() => setCatActiva(c.id_categoria)}>
            {c.descripcion}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      {cargando ? (
        <div style={s.empty}>Cargando productos...</div>
      ) : productosFiltrados.length === 0 ? (
        <div style={s.empty}>No se encontraron productos.</div>
      ) : (
        <div style={s.grid}>
          {productosFiltrados.map(p => (
            <div key={p.id_producto} style={s.card}
              onClick={() => navigate(`/catalogo/producto/${p.id_producto}`)}>

              {/* Imagen */}
              <div style={s.imgWrap}>
                {p.imagen ? (
                  <img
                    src={`${IMG_URL}${p.imagen}`}
                    alt={p.nombre}
                    style={s.img}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={s.sinImagen}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#ccc" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={s.cardBody}>
                <div style={s.categoriaBadge}>{p.categoria_nombre}</div>
                <div style={s.nombre}>{p.nombre}</div>

                {/* Emprendedor */}
                <div style={s.emprendedor}>
                  <div style={s.avatarEmp}>
                    {getInitials(p.nombreEmprendimiento || p.nombre_usuario)}
                  </div>
                  <span style={s.emprendedorNombre}>
                    {p.nombreEmprendimiento || p.nombre_usuario || '—'}
                  </span>
                </div>

                <div style={s.footer}>
                  <span style={s.precio}>
                    ${Number(p.precio).toLocaleString('es-AR')}
                  </span>
                  <button style={s.btnAgregar}>Agregar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  topbar:           { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: 16 },
  titulo:           { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#111', margin: 0 },
  subtitulo:        { fontSize: 12.5, color: '#aaa', margin: '4px 0 0' },
  buscadorWrap:     { position: 'relative', display: 'flex', alignItems: 'center' },
  buscadorIcon:     { position: 'absolute', left: 10, pointerEvents: 'none' },
  buscador:         { paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13.5, color: '#111', outline: 'none', width: 200, background: '#fff', fontFamily: "'DM Sans', sans-serif" },
  filtros:          { display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' },
  filtroBtn:        { padding: '5px 14px', borderRadius: 20, border: '0.5px solid #ddd', background: '#fff', fontSize: 13, color: '#666', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  filtroBtnActivo:  { background: '#111', color: '#fff', border: '0.5px solid #111' },
  grid:             { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  card:             { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' },
  imgWrap:          { height: 160, background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img:              { width: '100%', height: '100%', objectFit: 'cover' },
  sinImagen:        { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  cardBody:         { padding: '0.9rem 1rem' },
  categoriaBadge:   { fontSize: 10, fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 },
  nombre:           { fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 8 },
  emprendedor:      { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 },
  avatarEmp:        { width: 20, height: 20, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 9, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emprendedorNombre:{ fontSize: 12, color: '#777' },
  footer:           { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  precio:           { fontSize: 15, fontWeight: 500, color: '#111' },
  btnAgregar:       { padding: '5px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  empty:            { textAlign: 'center', color: '#aaa', padding: '3rem', fontSize: 14 },
};