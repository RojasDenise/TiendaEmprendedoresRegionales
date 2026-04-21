import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ListadoProductos from './pages/productos/ListadoProductos';
import AgregarProducto from './pages/productos/AgregarProducto';
import EditarProducto from './pages/productos/EditarProducto';
import DashboardAdmin from './pages/DashboardAdmin';
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
 * - `/` → Redirige a `/login`.
 * - `/login` → Pantalla de inicio de sesión.
 * - `/register` → Pantalla de registro de nuevos usuarios.
 * - `/dashboard` → Layout del emprendedor con rutas anidadas:
 *   - index → Panel de control del emprendedor.
 *   - `productos` → Listado de productos.
 *   - `productos/agregar` → Formulario de alta de producto.
 *   - `productos/editar/:id` → Formulario de edición de producto.
 * - `/admin` → Layout del administrador con rutas anidadas:
 *   - index → Panel de administración general.
 * - `*` → Cualquier ruta no definida redirige a `/login`.
 *
 * @component
 * @returns {JSX.Element} Árbol de rutas de la aplicación envuelto en BrowserRouter.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="productos" element={<ListadoProductos />} />
          <Route path="productos/agregar" element={<AgregarProducto />} />
          <Route path="productos/editar/:id" element={<EditarProducto />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout rol="admin" />}>
          <Route index element={<DashboardAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}