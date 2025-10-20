// src/router/AppRoutes.jsx
import React, { useContext } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
// 🧩 Contexto de autenticación y roles
import { role } from "./ROLE";

// 🧭 Páginas y layouts
import Login from './pages/Login'
import NotFound from "./pages/NotFound";

// 🏛️ ADMIN
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/AdminHome";
import StockSucursalPage from "./pages/AdminStockSucursal";
import AdminHistorialPage from "./pages/AdminHistorialPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import InsumosPage from "./pages/AdminInsumos"
import AdminSucursales from "./pages/AdminSucursales"

// 🧍 ENCARGADO
import EncargadoPage from "./pages/EncargadoPage";

// 🏬 SUCURSAL
import SucursalPage from "./pages/SucursalPage";

/* =====================================================
   🔒 Sets de rutas según el rol del usuario
   ===================================================== */

// Invitado (sin login)
const guestRoutes = (
  <Route>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<Login />} />
  </Route>
);

// Encargado
const encargadoRoutes = (
  <Route>
    <Route path="/" element={<Navigate to="/encargado" replace />} />
    <Route path="/encargado" element={<EncargadoPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<NotFound />} />
  </Route>
);

// Sucursal
const sucursalRoutes = (
  <Route>
    <Route path="/" element={<Navigate to="/sucursal" replace />} />
    <Route path="/sucursal" element={<SucursalPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<NotFound />} />
  </Route>
);

// Admin
const adminRoutes = (
  <Route>
    <Route path="/" element={<Navigate to="/admin" replace />} />
    <Route
      path="/admin"
      element={
        <AdminLayout>
          <AdminHome />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/sucursales"
      element={
        <AdminLayout>
          <AdminSucursales />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/insumos"
      element={
        <AdminLayout>
          <InsumosPage />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/stock-sucursal"
      element={
        <AdminLayout>
          <StockSucursalPage />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/historial"
      element={
        <AdminLayout>
          <AdminHistorialPage />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/usuarios"
      element={
        <AdminLayout>
          <AdminUsersPage />
        </AdminLayout>
      }
    />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<Login />} />
  </Route>
);

/* =====================================================
   🧠 RootRoutes: Selecciona las rutas según el rol
   ===================================================== */
const RootRoutes = () => {
  const { auth } = useContext(AuthContext);
  console.log(auth)
  if (auth?.profileMode === role.admin) {
    return <Routes>{adminRoutes}</Routes>;
  }

  if (auth?.profileMode === role.encargado) {
    return <Routes>{encargadoRoutes}</Routes>;
  }

  if (auth?.profileMode === role.sucursal) {
    return <Routes>{sucursalRoutes}</Routes>;
  }

  return <Routes>{guestRoutes}</Routes>;
};

/* =====================================================
   🌐 Browser Router
   ===================================================== */
const router = createBrowserRouter(
  createRoutesFromElements(<Route path="/*" element={<RootRoutes />} />)
);

export default router;
