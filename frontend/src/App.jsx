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