import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import Sucursales from "./pages/AdminSucursales.jsx";
import Login from "./pages/Login.jsx";
import InsumosPage from "./pages/AdminInsumos.jsx";
import StockSucursalPage from "./pages/AdminStockSucursal.jsx";
import SucursalPage from "./pages/SucursalPage.jsx";
import AdminHistorialPage from "./pages/AdminHistorialPage.jsx";


function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card p-6 max-w-md w-full text-center space-y-2">
        <h2 className="text-xl font-semibold">Página no encontrada</h2>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Verificá la URL o regresá al panel.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/admin" element={<AdminLayout><AdminHome /></AdminLayout>} />
      <Route path="/admin/sucursales" element={<AdminLayout><Sucursales /></AdminLayout>} />
      <Route path="/admin/insumos" element={<AdminLayout><InsumosPage /></AdminLayout>} />
      <Route path="/admin/stock-sucursal" element={<AdminLayout><StockSucursalPage /></AdminLayout>} />
      <Route path="/admin/historial" element={<AdminLayout><AdminHistorialPage /></AdminLayout>} />
      {/* Más secciones admin... */}
      <Route path="*" element={<NotFound />} />
      {/* Sucursal */}
      <Route path="/sucursal" element={<SucursalPage />} />
    </Routes>
  );
}


