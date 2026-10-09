import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos, obtenerCategorias } from '../services/productoService';
import { urlImagen } from '../config';

/**
 * @fileoverview Landing page pública de la tienda.
 * Presenta la plataforma, muestra productos reales del catálogo,
 * las categorías, cómo funciona la compra y una sección para emprendedores.
 * Usa los mismos estilos que el resto de la app (design system de la tienda).
 *
 * @module Landing
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/** Cantidad de productos que se muestran en el inicio. */
const PRODUCTOS_DESTACADOS = 4;

/**
 * Datos de contacto y redes.
 * PENDIENTES DE CREAR: son nombres propuestos. Antes de publicar, crear las cuentas
 * (o cambiar estos valores por las reales) y revisar que los links funcionen.
 */
const CONTACTO = {
  email:     'tiendaemprendedoresregionales@gmail.com',
  instagram: 'tiendaemprendedoresregionales',
  facebook:  'tiendaemprendedoresregionales',
};

/** Fundadoras del proyecto. */
const FUNDADORAS = [
  { nombre: 'Denise Rojas',      iniciales: 'DR', rol: 'Cofundadora' },
  { nombre: 'Victoria Sandoval', iniciales: 'VS', rol: 'Cofundadora' },
];

/** Objetivos de la tienda. */
const OBJETIVOS = [
  { titulo: 'Visibilidad',    texto: 'Que los productos hechos en la región lleguen a más gente, más allá de la feria o las redes de cada emprendimiento.' },
  { titulo: 'Digitalización', texto: 'Que cualquier emprendimiento pueda vender online sin armar su propia tienda: publicar, cobrar y atender pedidos desde un solo panel.' },
  { titulo: 'Confianza',      texto: 'Que comprar sea seguro para los dos lados, con seguimiento de cada pedido, valoraciones reales y reclamos que se resuelven.' },
];

/** Preguntas frecuentes (respuestas según cómo funciona hoy la tienda). */
const PREGUNTAS = [
  { p: '¿Necesito una cuenta para comprar?', r: 'Podés recorrer el catálogo sin registrarte. Para agregar productos al carrito y comprar necesitás una cuenta de cliente.' },
  { p: '¿Cómo puedo pagar?',                  r: 'Con tarjeta de crédito o débito, o en efectivo o por transferencia.' },
  { p: '¿Cómo sé en qué está mi pedido?',     r: 'En Mis compras ves el estado de cada pedido: En preparación, En camino o Entregado.' },
  { p: '¿Qué hago si algo llega mal?',        r: 'Desde Mis compras abrís un reclamo y chateás con el emprendedor hasta que quede resuelto.' },
  { p: '¿Cómo vendo mis productos?',          r: 'Creá una cuenta como emprendedor con el nombre de tu emprendimiento y una breve reseña. Desde tu panel cargás tus productos con fotos, precio y stock.' },
];

/** Iniciales para el avatar del emprendimiento. */
const getInitials = (nombre = '') =>
  nombre.trim().slice(0, 2).toUpperCase() || '??';

/** Marca: bolsa de compras blanca dentro del cuadrado negro. */
function Marca({ size = 36, radius = 10 }) {
  return (
    <span style={{ ...s.marca, width: size, height: size, borderRadius: radius }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M8 12h16l-2 12H10L8 12z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
        <path d="M12 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="13" cy="21" r="1" fill="#111" />
        <circle cx="19" cy="21" r="1" fill="#111" />
      </svg>
    </span>
  );
}

/** Badge de estado (mismos colores que Mis compras y Reclamos). */
function Badge({ tipo, children }) {
  return <span style={{ ...s.badge, ...s.badgeTipos[tipo] }}>{children}</span>;
}

/** Estrella de valoración rellena. */
const Estrella = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/** Tilde de las señales de confianza. */
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Íconos de contacto (trazo, estilo Feather como el resto de la app). */
const IconoMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
);
const IconoInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const IconoFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

/**
 * Componente Landing.
 * Si el backend no responde, la página se muestra igual: la sección de
 * productos queda vacía con un acceso al catálogo.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function Landing() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando,   setCargando]   = useState(true);

  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods.filter(p => Number(p.stock) > 0).slice(0, PRODUCTOS_DESTACADOS));
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  return (
    <div style={s.page}>

      {/* Barra superior */}
      <header style={s.header}>
        <div style={{ ...s.contenedor, ...s.headerInner }}>
          <Link to="/" style={s.brand}>
            <Marca />
            <span style={s.brandName}>Tienda de Emprendedores Regionales</span>
          </Link>
          <nav aria-label="Principal" style={s.nav}>
            <a href="#categorias" style={s.navLink}>Categorías</a>
            <a href="#como-funciona" style={s.navLink}>Cómo funciona</a>
            <a href="#emprendedores" style={s.navLink}>Para emprendedores</a>
            <a href="#quienes-somos" style={s.navLink}>Quiénes somos</a>
            <span style={s.navBotones}>
              <Link to="/login" style={s.btnSecundario}>Ingresar</Link>
              <Link to="/register" style={s.btnPrimario}>Crear cuenta</Link>
            </span>
          </nav>
        </div>
      </header>

      {/* Inicio */}
      <section style={{ background: '#F7F6F3' }}>
        <div style={{ ...s.contenedor, ...s.hero }}>
          <div style={s.heroTexto}>
            <span style={s.eyebrow}>Hecho por emprendedores de la región</span>
            <h1 style={s.heroTitulo}>Lo que se hace en la región, en un solo lugar.</h1>
            <p style={s.heroBajada}>
              Una tienda online para que los emprendimientos locales vendan sus productos
              y se hagan conocer. Comprá directo a quien lo hace.
            </p>
            <div style={s.heroBotones}>
              <Link to="/catalogo" style={s.btnPrimarioGrande}>
                Ver el catálogo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#emprendedores" style={s.btnSecundarioGrande}>Quiero vender</a>
            </div>
            <ul style={s.confianza}>
              <li style={s.confianzaItem}><Check />Tarjeta, efectivo o transferencia</li>
              <li style={s.confianzaItem}><Check />Seguimiento de cada pedido</li>
              <li style={s.confianzaItem}><Check />Reclamos con respuesta</li>
            </ul>
          </div>

          <div style={s.heroProductos}>
            {cargando && Array.from({ length: PRODUCTOS_DESTACADOS }).map((_, i) => (
              <div key={i} style={{ ...s.card, height: 280, background: '#fff' }} aria-hidden="true" />
            ))}

            {!cargando && productos.length === 0 && (
              <div style={s.sinProductos}>
                <p style={{ margin: 0 }}>Todavía no pudimos cargar los productos.</p>
                <Link to="/catalogo" style={s.linkFuerte}>Ir al catálogo</Link>
              </div>
            )}

            {!cargando && productos.map(p => {
              const emprendimiento = p.nombreEmprendimiento || p.nombre_usuario || '—';
              return (
                <Link key={p.id_producto} to={`/catalogo/producto/${p.id_producto}`} style={s.card}>
                  <div style={s.imgWrap}>
                    {p.imagen ? (
                      <img
                        src={urlImagen(p.imagen)}
                        alt={p.nombre}
                        style={s.img}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.categoria}>{p.categoria_nombre}</div>
                    <div style={s.nombre}>{p.nombre}</div>
                    <div style={s.emprendedor}>
                      <span style={s.avatarEmp}>{getInitials(emprendimiento)}</span>
                      <span style={s.emprendedorNombre}>{emprendimiento}</span>
                    </div>
                    <div style={s.cardFooter}>
                      <span style={s.precio}>${Number(p.precio).toLocaleString('es-AR')}</span>
                      <span style={s.verMas}>Ver</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section id="categorias" style={s.seccionCategorias}>
        <div style={{ ...s.contenedor, ...s.categoriasInner }}>
          <h2 style={s.tituloSeccionChico}>Explorá por categoría</h2>
          <div style={s.chips}>
            <Link to="/catalogo" style={{ ...s.chip, ...s.chipActivo }}>Todas</Link>
            {categorias.map(c => (
              <Link
                key={c.id_categoria}
                to="/catalogo"
                state={{ categoria: c.id_categoria }}
                style={s.chip}
              >
                {c.descripcion}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" style={{ background: '#fff' }}>
        <div style={{ ...s.contenedor, ...s.seccion }}>
          <div style={s.encabezado}>
            <span style={s.eyebrow}>Cómo funciona</span>
            <h2 style={s.tituloSeccion}>Comprar es simple, y siempre sabés en qué está tu pedido.</h2>
          </div>
          <div style={s.pasos}>
            <div style={s.paso}>
              <span style={s.pasoNumero}>01</span>
              <h3 style={s.pasoTitulo}>Explorá el catálogo</h3>
              <p style={s.texto}>
                Filtrá por categoría o buscá por nombre. Cada producto muestra quién lo hace
                y las valoraciones de otros compradores.
              </p>
            </div>
            <div style={s.paso}>
              <span style={s.pasoNumero}>02</span>
              <h3 style={s.pasoTitulo}>Armá tu carrito y pagá</h3>
              <p style={s.texto}>
                Sumá productos de distintos emprendimientos y elegí cómo pagar:
                efectivo, transferencia o tarjeta.
              </p>
            </div>
            <div style={s.paso}>
              <span style={s.pasoNumero}>03</span>
              <h3 style={s.pasoTitulo}>Seguí tu pedido</h3>
              <p style={s.texto}>
                En Mis compras ves el estado de cada envío y, si algo no salió bien,
                abrís un reclamo y chateás con el emprendedor.
              </p>
              <div style={s.badges}>
                <Badge tipo="pendiente">En preparación</Badge>
                <Badge tipo="info">En camino</Badge>
                <Badge tipo="exito">Entregado</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valoraciones y reclamos */}
      <section style={{ background: '#F7F6F3' }}>
        <div style={{ ...s.contenedor, ...s.seccion, ...s.respaldo }}>
          <div style={s.respaldoTexto}>
            <span style={s.eyebrow}>Compra con respaldo</span>
            <h2 style={s.tituloSeccion}>Opiniones reales y una respuesta cuando la necesitás.</h2>
            <p style={{ ...s.texto, fontSize: 15 }}>
              Cuando recibís tu compra la podés valorar, y si hay un problema
              el reclamo queda abierto hasta que se resuelve.
            </p>
          </div>
          <div style={s.respaldoCards}>
            <div style={s.filaCard}>
              <div style={s.filaCardTexto}>
                <span style={s.eyebrow}>Valoraciones</span>
                <span style={{ display: 'flex', gap: 3 }} role="img" aria-label="5 estrellas">
                  <Estrella /><Estrella /><Estrella /><Estrella /><Estrella />
                </span>
              </div>
              <Link to="/catalogo/mis-compras" style={s.btnValorar}>Valorar compra</Link>
            </div>
            <div style={s.filaCard}>
              <div style={s.filaCardTexto}>
                <span style={s.eyebrow}>Reclamos</span>
                <span style={{ fontSize: 13.5, color: '#111' }}>Chateá con el emprendedor hasta resolverlo.</span>
              </div>
              <div style={s.badges}>
                <Badge tipo="pendiente">Pendiente</Badge>
                <Badge tipo="info">Respondido</Badge>
                <Badge tipo="exito">Resuelto</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="quienes-somos" style={{ background: '#fff' }}>
        <div style={{ ...s.contenedor, ...s.seccion, ...s.nosotros }}>
          <div style={s.nosotrosTexto}>
            <span style={s.eyebrow}>Quiénes somos</span>
            <h2 style={s.tituloSeccion}>Una tienda pensada para los emprendimientos de la región.</h2>
            <p style={{ ...s.texto, fontSize: 15 }}>
              Muchos emprendimientos locales venden solo en ferias o por mensaje, y les cuesta llegar
              a más gente. Creamos esta tienda para que puedan mostrar y vender sus productos online
              sin armar un sitio propio, y para que quien compra encuentre en un solo lugar lo que se hace cerca.
            </p>
            <div style={s.fundadoras}>
              {FUNDADORAS.map(f => (
                <div key={f.nombre} style={s.fundadora}>
                  <span style={s.fundadoraAvatar}>{f.iniciales}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={s.fundadoraNombre}>{f.nombre}</span>
                    <span style={s.fundadoraRol}>{f.rol}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={s.objetivos}>
            {OBJETIVOS.map((o, i) => (
              <div key={o.titulo} style={s.objetivo}>
                <span style={s.objetivoNumero}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h3 style={s.pasoTitulo}>{o.titulo}</h3>
                  <p style={s.texto}>{o.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para emprendedores */}
      <section id="emprendedores" style={{ background: '#fff' }}>
        <div style={{ ...s.contenedor, ...s.seccion }}>
          <div style={s.bloqueOscuro}>
            <div style={s.bloqueOscuroTexto}>
              <span style={{ ...s.eyebrow, color: 'rgba(255,255,255,0.7)' }}>Para emprendedores</span>
              <h2 style={s.bloqueOscuroTitulo}>¿Tenés un emprendimiento? Sumalo a la tienda.</h2>
              <p style={s.bloqueOscuroBajada}>
                Publicá tus productos, controlá el stock con avisos cuando se está por agotar
                y respondé pedidos y reclamos desde tu propio panel.
              </p>
            </div>
            <div style={s.bloqueOscuroBotones}>
              <Link to="/register" style={s.btnBlanco}>Crear cuenta de emprendedor</Link>
              <Link to="/login" style={s.btnContorno}>Ya tengo cuenta</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" style={{ background: '#F7F6F3' }}>
        <div style={{ ...s.contenedor, ...s.seccion, ...s.faq }}>
          <div style={s.faqEncabezado}>
            <span style={s.eyebrow}>Preguntas frecuentes</span>
            <h2 style={s.tituloSeccion}>Lo que más nos preguntan.</h2>
            <p style={{ ...s.texto, fontSize: 15 }}>
              ¿Te quedó alguna duda? Escribinos a{' '}
              <a href={`mailto:${CONTACTO.email}`} style={s.linkFuerte}>{CONTACTO.email}</a>.
            </p>
          </div>
          <div style={s.faqLista}>
            {PREGUNTAS.map(q => (
              <details key={q.p} style={s.faqItem}>
                <summary style={s.faqPregunta}>{q.p}</summary>
                <p style={{ ...s.texto, marginTop: 10 }}>{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section style={{ background: '#fff' }}>
        <div style={{ ...s.contenedor, ...s.cierre }}>
          <h2 style={{ ...s.tituloSeccion, textAlign: 'center' }}>Descubrí lo que se hace cerca tuyo.</h2>
          <div style={{ ...s.heroBotones, justifyContent: 'center', marginTop: 0 }}>
            <Link to="/catalogo" style={s.btnPrimarioGrande}>Ver el catálogo</Link>
            <Link to="/register" style={s.btnSecundarioGrande}>Sumar mi emprendimiento</Link>
          </div>
        </div>
      </section>

      {/* Pie */}
      <footer style={s.footer}>
        <div style={{ ...s.contenedor, ...s.footerColumnas }}>
          <div style={s.footerMarca}>
            <span style={s.brand}>
              <Marca size={28} radius={8} />
              <span style={{ ...s.brandName, fontSize: 15 }}>Tienda de Emprendedores Regionales</span>
            </span>
            <p style={{ ...s.texto, fontSize: 12.5, maxWidth: 300 }}>
              Plataforma de comercio electrónico para los emprendimientos de la región.
            </p>
          </div>
          <nav aria-label="Tienda" style={s.footerColumna}>
            <span style={s.eyebrow}>Tienda</span>
            <Link to="/catalogo" style={s.footerLink}>Catálogo</Link>
            <Link to="/login" style={s.footerLink}>Ingresar</Link>
            <Link to="/register" style={s.footerLink}>Crear cuenta</Link>
            <a href="#preguntas" style={s.footerLink}>Preguntas frecuentes</a>
          </nav>
          <div style={s.footerColumna}>
            <span style={s.eyebrow}>Contacto</span>
            <a href={`mailto:${CONTACTO.email}`} style={s.footerLinkIcono}><IconoMail />Email</a>
            <a href={`https://instagram.com/${CONTACTO.instagram}`} target="_blank" rel="noreferrer" style={s.footerLinkIcono}>
              <IconoInstagram />Instagram
            </a>
            <a href={`https://facebook.com/${CONTACTO.facebook}`} target="_blank" rel="noreferrer" style={s.footerLinkIcono}>
              <IconoFacebook />Facebook
            </a>
          </div>
          {/* Enlaces legales. El botón de arrepentimiento tiene que estar accesible desde la página de inicio. */}
          <nav aria-label="Legal" style={s.footerColumna}>
            <span style={s.eyebrow}>Legal</span>
            <Link to="/privacidad" style={s.footerLink}>Política de privacidad</Link>
            <Link to="/terminos" style={s.footerLink}>Términos y condiciones</Link>
            <Link to="/arrepentimiento" style={s.footerLink}>Botón de arrepentimiento</Link>
          </nav>
        </div>
        <div style={{ ...s.contenedor, ...s.footerLegal }}>
          <span>© {new Date().getFullYear()} Tienda de Emprendedores Regionales</span>
          <span>Fundada por Denise Rojas y Victoria Sandoval</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Estilos (mismos valores que el resto de la app) ───────────────────── */

const serif = "'DM Serif Display', serif";
const sans  = "'DM Sans', sans-serif";

const botonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxSizing: 'border-box',
  borderRadius: 8,
  fontWeight: 500,
  textDecoration: 'none',
  fontFamily: sans,
  whiteSpace: 'nowrap',
};

const s = {
  page:        { background: '#fff', color: '#111', fontFamily: sans, minHeight: '100vh' },
  contenedor:  { maxWidth: 1200, margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem', boxSizing: 'border-box' },

  // Barra superior
  header:      { background: '#fff', borderBottom: '0.5px solid #e8e8e8' },
  headerInner: { paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  brand:       { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#111' },
  marca:       { background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandName:   { fontFamily: serif, fontSize: 18, fontWeight: 400, color: '#111' },
  nav:         { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, fontSize: 13.5 },
  navLink:     { color: '#555', textDecoration: 'none' },
  navBotones:  { display: 'flex', gap: 8 },
  btnPrimario:   { ...botonBase, minHeight: 44, padding: '0 1.1rem', background: '#111', color: '#fff', fontSize: 13 },
  btnSecundario: { ...botonBase, minHeight: 44, padding: '0 1.1rem', background: '#fff', color: '#111', border: '0.5px solid #ddd', fontSize: 13 },

  // Inicio
  hero:        { paddingTop: '5rem', paddingBottom: '4rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 56 },
  heroTexto:   { flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 },
  eyebrow:     { fontSize: 10.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666' },
  heroTitulo:  { margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 1.02, color: '#111' },
  heroBajada:  { margin: 0, fontSize: 16, lineHeight: 1.6, color: '#555', maxWidth: 480 },
  heroBotones: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  btnPrimarioGrande:   { ...botonBase, minHeight: 48, padding: '0 1.5rem', background: '#111', color: '#fff', fontSize: 14 },
  btnSecundarioGrande: { ...botonBase, minHeight: 48, padding: '0 1.5rem', background: '#fff', color: '#111', border: '0.5px solid #ddd', fontSize: 14 },
  heroProductos: { flex: '1 1 460px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 },
  sinProductos:  { gridColumn: '1 / -1', background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#666', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
  linkFuerte:    { color: '#111', fontWeight: 500 },

  // Card de producto (igual que Catalogo)
  card:        { display: 'block', background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: '#111' },
  imgWrap:     { height: 150, background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img:         { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody:    { padding: '0.9rem 1rem' },
  categoria:   { fontSize: 10, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 },
  nombre:      { fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 8, lineHeight: 1.35 },
  emprendedor: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 },
  avatarEmp:   { width: 20, height: 20, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 9, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emprendedorNombre: { fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardFooter:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  precio:      { fontSize: 15, fontWeight: 500, color: '#111' },
  verMas:      { padding: '5px 12px', background: '#111', color: '#fff', borderRadius: 7, fontSize: 12, fontWeight: 500 },

  // Categorías
  seccionCategorias: { background: '#fff', borderBottom: '0.5px solid #f0f0f0' },
  categoriasInner:   { paddingTop: '3rem', paddingBottom: '3rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  tituloSeccionChico: { margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 26 },
  chips:       { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip:        { ...botonBase, minHeight: 44, padding: '0 1.1rem', borderRadius: 20, background: '#fff', color: '#666', border: '0.5px solid #ddd', fontSize: 13, fontWeight: 400 },
  chipActivo:  { background: '#111', color: '#fff', border: '0.5px solid #111' },

  // Secciones
  seccion:     { paddingTop: '5rem', paddingBottom: '5rem' },
  encabezado:  { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560, marginBottom: 40 },
  tituloSeccion: { margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 36, lineHeight: 1.1, color: '#111' },
  texto:       { margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#555' },
  pasos:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  paso:        { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 },
  pasoNumero:  { fontFamily: serif, fontSize: 28, lineHeight: 1, color: '#111' },
  pasoTitulo:  { margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 20, color: '#111' },
  badges:      { display: 'flex', flexWrap: 'wrap', gap: 6 },
  badge:       { fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20 },
  badgeTipos: {
    exito:     { background: '#DCFCE7', color: '#166534' },
    info:      { background: '#DBEAFE', color: '#1E40AF' },
    pendiente: { background: '#FEF9C3', color: '#854D0E' },
  },

  // Respaldo
  respaldo:      { display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' },
  respaldoTexto: { flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  respaldoCards: { flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  filaCard:      { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, padding: '1.1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  filaCardTexto: { display: 'flex', flexDirection: 'column', gap: 6 },
  btnValorar:    { ...botonBase, minHeight: 44, padding: '0 1rem', background: '#FFFBEB', color: '#92400E', border: '0.5px solid #FDE68A', fontSize: 12.5 },

  // Bloque emprendedores
  bloqueOscuro:        { background: '#111', borderRadius: 16, padding: 'clamp(2rem, 5vw, 4rem)', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-end', justifyContent: 'space-between' },
  bloqueOscuroTexto:   { flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 },
  bloqueOscuroTitulo:  { margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.08, color: '#fff' },
  bloqueOscuroBajada:  { margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: 520 },
  bloqueOscuroBotones: { display: 'flex', flexDirection: 'column', gap: 10, flex: '0 1 280px' },
  btnBlanco:   { ...botonBase, minHeight: 48, padding: '0 1.5rem', background: '#fff', color: '#111', fontSize: 14 },
  btnContorno: { ...botonBase, minHeight: 48, padding: '0 1.5rem', background: 'transparent', color: '#fff', border: '0.5px solid rgba(255,255,255,0.3)', fontSize: 14 },

  // Señales de confianza (debajo de los botones del inicio)
  confianza:     { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' },
  confianzaItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#555' },

  // Quiénes somos
  nosotros:        { display: 'flex', flexWrap: 'wrap', gap: 56, alignItems: 'flex-start' },
  nosotrosTexto:   { flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 },
  fundadoras:      { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  fundadora:       { display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', border: '0.5px solid #ebebeb', borderRadius: 12, background: '#fff' },
  fundadoraAvatar: { width: 40, height: 40, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fundadoraNombre: { fontFamily: serif, fontSize: 17, color: '#111' },
  fundadoraRol:    { fontSize: 12, color: '#666' },
  objetivos:       { flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  objetivo:        { display: 'flex', gap: 18, padding: '1.25rem 1.5rem', background: '#F7F6F3', borderRadius: 12 },
  objetivoNumero:  { fontFamily: serif, fontSize: 28, lineHeight: 1, color: '#111', flexShrink: 0 },

  // Preguntas frecuentes
  faq:           { display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start' },
  faqEncabezado: { flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  faqLista:      { flex: '2 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  faqItem:       { background: '#fff', border: '0.5px solid #ebebeb', borderRadius: 12, padding: '1rem 1.25rem' },
  faqPregunta:   { fontSize: 14.5, fontWeight: 500, color: '#111', cursor: 'pointer', minHeight: 28, display: 'flex', alignItems: 'center' },

  // Cierre
  cierre:        { paddingTop: '5rem', paddingBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 },

  // Pie
  footer:          { background: '#fff', borderTop: '0.5px solid #f0f0f0' },
  footerColumnas:  { paddingTop: '3rem', paddingBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 },
  footerMarca:     { display: 'flex', flexDirection: 'column', gap: 12, flex: '1 1 260px' },
  footerColumna:   { display: 'flex', flexDirection: 'column', gap: 10, flex: '0 1 180px' },
  footerLink:      { fontSize: 13, color: '#555', textDecoration: 'none' },
  footerLinkIcono: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', textDecoration: 'none', wordBreak: 'break-all' },
  footerLegal:     { paddingTop: '1.25rem', paddingBottom: '1.5rem', borderTop: '0.5px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, fontSize: 12, color: '#666' },
};
