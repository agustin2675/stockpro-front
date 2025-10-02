import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { key: "home", label: "Inicio", to: "/admin" },
  { key: "sucursales", label: "Sucursales", to: "/admin/sucursales" },
  { key: "usuarios", label: "Usuarios", to: "/admin/usuarios" },
  { key: "insumos", label: "Insumos", to: "/admin/insumos" },
  { key: "stock-sucursal", label: "Stock Sucursales", to: "/admin/stock-sucursal" },
  { key: "stock-produccion", label: "Stock Producción", to: "/admin/stock-produccion" },
  { key: "historial", label: "Historial Sucursales", to: "/admin/historial" }
];

function MenuList({ onNavigate }) {
  return (
    <div className="side-list">
      {NAV_ITEMS.map((it) => (
        <NavLink
          key={it.key}
          to={it.to}
          end={it.to === "/admin"}   
          className={({ isActive }) =>
            `side-link ${isActive ? "side-link-active" : ""}`
          }
          onClick={onNavigate}
        >
          {it.label}
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, onNavigate }) {
  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar-collapsed collapsed" : "sidebar-wide"}`}
    >
      <div className="side-scroll flex flex-col h-full">
        {/* Botón plegar/expandir */}
        <button
          onClick={onToggle}
          className="mb-3 p-2 rounded bg-white/10 hover:bg-white/20 transition"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? "»" : "«"}
        </button>

        {/* Marca (solo expandido) */}
        {!collapsed && (
          <div className="brand mb-4">
            <span className="brand-dot" />
            <span>Administrador</span>
          </div>
        )}

        {/* Lista de funcionalidades */}
        {!collapsed && <MenuList onNavigate={onNavigate} />}
      </div>
    </aside>
  );
}

/* Drawer móvil */
export function SidebarDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div className="brand mb-4">
          <span className="brand-dot" />
          <span>Administrador</span>
        </div>
        <MenuList onNavigate={onClose} />
      </div>
    </>
  );
}


