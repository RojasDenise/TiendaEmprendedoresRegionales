import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardEmprendedor from './pages/DashboardEmprendedor'
import ListadoProductos from './pages/productos/ListadoProductos'
import AgregarProducto from './pages/productos/AgregarProducto'
import EditarProducto from './pages/productos/EditarProducto'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardEmprendedor />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<ListadoProductos />} />
          <Route path="productos/agregar" element={<AgregarProducto />} />
          <Route path="productos/editar/:id" element={<EditarProducto />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard/productos" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)