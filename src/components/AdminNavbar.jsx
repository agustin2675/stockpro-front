import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { key: "home", label: "Inicio", to: "/admin" },
  { key: "sucursales", label: "Sucursales", to: "/admin/sucursales" },
  { key: "usuarios", label: "Usuarios", to: "/admin/usuarios" },
  { key: "insumos", label: "Insumos", to: "/admin/insumos" },
  { key: "stock-sucursal", label: "Stock Sucursal", to: "/admin/stock-sucursal" },
  { key: "stock-produccion", label: "Stock Producción", to: "/admin/stock-produccion" },
  { key: "disponibilidad", label: "Disponibilidad", to: "/admin/disponibilidad" },
  { key: "whatsapp", label: "Config WhatsApp", to: "/admin/whatsapp" }
];

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-dot" />
          <span className="text-sm" style={{ color: "var(--graphite)" }}>Administrador</span>
        </div>

        {/* Desktop */}
        <div className="nav-menu">
          {NAV_ITEMS.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item--active" : ""}`
              }
              end={it.to === "/admin"}
            >
              {it.label}
            </NavLink>
          ))}
        </div>

        {/* Toggle móvil */}
        <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile">
          <div className="nav-mobile-list">
            {NAV_ITEMS.map((it) => (
              <NavLink
                key={it.key}
                to={it.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item--active" : ""}`
                }
                onClick={() => setOpen(false)}
                end={it.to === "/admin"}
              >
                {it.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
