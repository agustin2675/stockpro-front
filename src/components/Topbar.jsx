// src/components/Topbar.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Topbar({ onOpenMenu }) {
  const navigate = useNavigate();
  const { handleProfileMode } = useContext(AuthContext);

  const handleLogout = () => {
    // 🧹 Limpiar sesión
    localStorage.clear();

    // 🔄 Actualizar contexto
    handleProfileMode(null);

    // 🚪 Redirigir al login
    navigate("/login", { replace: true });

    // ♻️ Recargar para resetear el estado global
    window.location.reload();
  };

  return (
    <header className="topbar flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border-b"
      style={{ borderColor: "var(--frame)", background: "var(--paper)" }}
    >
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        {/* Botón menú móvil */}
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 border"
          style={{ borderColor: "var(--frame)" }}
          aria-label="Abrir menú"
          onClick={onOpenMenu}
        >
          ☰
        </button>

        {/* Marca */}
        <div className="brand flex items-center gap-2">
          <span className="brand-dot w-2 h-2 rounded-full" style={{ background: "var(--beige)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--graphite)" }}>
            Administrador
          </span>
        </div>

        {/* En pantallas pequeñas, el botón aparece acá */}
        <button
          onClick={handleLogout}
          className="sm:hidden btn btn-outline text-xs px-3 py-1 rounded-lg"
          style={{ borderColor: "var(--frame)" }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Lado derecho (desktop) */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
        <div className="text-sm" style={{ color: "var(--graphite)" }}>
          Panel
        </div>
        <button
          onClick={handleLogout}
          className="hidden sm:inline-flex btn btn-outline text-sm px-4 py-1 rounded-lg"
          style={{ borderColor: "var(--frame)" }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
