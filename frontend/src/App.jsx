import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
// Los nombres de archivo respetan mayúsculas/minúsculas: en Windows funciona igual,
// pero en Linux (donde se hace el deploy) 'DashboardLayout' no encuentra 'Dashboardlayout.jsx'.
import DashboardLayout from './pages/Dashboardlayout';
import DashboardHome from './pages/Dashboardhome';
import ListadoProductos from './pages/productos/ListadoProductos';
import AgregarProducto from './pages/productos/AgregarProducto';
import EditarProducto from './pages/productos/EditarProducto';
import DashboardAdmin from './pages/DashboardAdmin';
import ClienteLayout from './pages/cliente/ClienteLayout';
import Catalogo from './pages/cliente/Catalogo';
import DetalleProducto from './pages/cliente/DetalleProducto';
import MisCompras from './pages/cliente/MisCompras';
import Checkout from './pages/cliente/Checkout';
import Perfil from './pages/cliente/Perfil';
import Reclamos from './pages/reclamo/reclamo';
import PoliticaPrivacidad from './pages/legal/PoliticaPrivacidad';
import TerminosCondiciones from './pages/legal/TerminosCondiciones';
import Arrepentimiento from './pages/legal/Arrepentimiento';
import './index.css';

/**
 * @fileoverview Componente raíz de la aplicación.
 * Define la estructura de enrutamiento principal usando React Router.
 * Organiza las rutas públicas (login, registro) y las rutas protegidas
 * por layout según el rol del usuario (emprendedor y admin).
 *
 * @module App
 * @author Rojas Karen Denise; Sandoval María Victoria
 */

/**
 * Componente App.
 * Punto de entrada de la aplicación. Configura el enrutador y define
 * la jerarquía de rutas anidadas según el tipo de usuario.
 *
 * Estructura de rutas:
 * - `/` → Landing page pública (presenta la tienda y lleva al catálogo, que se puede ver sin iniciar sesión).
 * - `/login` → Pantalla de inicio de sesión.
 * - `/register` → Pantalla de registro de nuevos usuarios.
 * - `/privacidad`, `/terminos`, `/arrepentimiento` → Páginas legales públicas.
 * - `/dashboard` → Layout del emprendedor con rutas anidadas:
 *   - index → Panel de control del emprendedor.
 *   - `productos` → Listado de productos.
 *   - `productos/agregar` → Formulario de alta de producto.
 *   - `productos/editar/:id` → Formulario de edición de producto.
 *   - `reclamo` → Módulo de gestión de reclamos del emprendedor.
 * - `/admin` → Layout del administrador con rutas anidadas:
 *   - index → Panel de administración general.
 * - `/catalogo` → Layout del cliente con rutas anidadas:
 *   - index → Catálogo de productos.
 *   - `producto/:id` → Detalle de un producto.
 *   - `mis-compras` → Historial de compras del cliente.
 *   - `checkout` → Página de confirmación de compra.
 * - `*` → Cualquier ruta no definida redirige a `/catalogo`.
 *
 * @component
 * @returns {JSX.Element} Árbol de rutas de la aplicación envuelto en BrowserRouter.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Páginas legales: públicas, se leen sin iniciar sesión */}
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/arrepentimiento" element={<Arrepentimiento />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="productos" element={<ListadoProductos />} />
          <Route path="productos/agregar" element={<AgregarProducto />} />
          <Route path="productos/editar/:id" element={<EditarProducto />} />
          <Route path="reclamo" element={<Reclamos />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout rol="admin" />}>
          <Route index element={<DashboardAdmin />} />
        </Route>

        <Route path="/catalogo" element={<ClienteLayout />}>
          <Route index element={<Catalogo />} />
          <Route path="producto/:id" element={<DetalleProducto />} />
          <Route path="mis-compras" element={<MisCompras />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="perfil"   element={<Perfil />} />
        </Route>

        <Route path="*" element={<Navigate to="/catalogo" replace />} />
      </Routes>
    </BrowserRouter>
  );
}