// src/pages/EncargadoPage.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// ⛽️ Servicios
import { getSucursales } from "../services/sucursalService";

// 🔁 Contexto requerido por HistorialStockView (para modo edición del modal)
import { PedidoProvider } from "../context/PedidoContext";
import { AuthContext } from "../context/AuthContext";

// ✅ Componentes
import HistorialStockView from "../features/sucursal/HistorialStockView";
import PanelPedidos13a13 from "../features/sucursal/PanelPedidos13a13"; // 👈 nuevo import

export default function EncargadoPage() {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { handleProfileMode } = useContext(AuthContext);

  // 🔐 Cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    handleProfileMode(null);
    navigate("/login", { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const sucs = await getSucursales();
        const list = Array.isArray(sucs) ? sucs : [];
        setSucursales(list);
        if (list.length && !sucursalId) setSucursalId(Number(list[0].id));
      } catch (e) {
        console.error("EncargadoPage: error cargando sucursales", e);
        setErr("No se pudieron cargar las sucursales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Encabezado */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-2xl">Página de Encargado de Pedidos</h1>

        <button
          onClick={handleLogout}
          className="btn btn-outline text-sm px-4 py-1 rounded-lg self-start sm:self-auto"
          style={{ borderColor: "var(--frame)" }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* 👇 Nuevo panel 13:00 de ayer → 13:00 de hoy */}
      <PedidoProvider>
        <PanelPedidos13a13 />
      </PedidoProvider>

      {/* Filtro de sucursal */}
      <section className="card p-6">
        {loading ? (
          <div
            className="rounded-lg border p-4 text-sm"
            style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}
          >
            Cargando sucursales…
          </div>
        ) : err ? (
          <div
            className="rounded-lg border p-4 text-sm"
            style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}
          >
            {err}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label
              className="text-sm"
              style={{ color: "var(--graphite)" }}
            >
              Sucursal
            </label>
            <select
              className="input w-full sm:w-[280px]"
              value={sucursalId ?? ""}
              onChange={(e) => setSucursalId(Number(e.target.value))}
              disabled={sucursales.length === 0}
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre ?? `Sucursal #${s.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Historial (reutilizado del componente principal) */}
      {sucursalId && (
        <PedidoProvider sucursalId={sucursalId}>
          <HistorialStockView sucursalId={sucursalId} />
        </PedidoProvider>
      )}
    </div>
  );
}
