// src/pages/AdminHistorialPage.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// ⛽️ Servicios
import { getSucursales } from "../services/sucursalService";

// 🔁 Contextos
import { PedidoProvider } from "../context/PedidoContext";
import { AuthContext } from "../context/AuthContext";

// 🧩 Componentes
import HistorialStockView from "../features/sucursal/HistorialStockView";
import PanelPedidos13a13 from "../features/sucursal/PanelPedidos13a13";

export default function AdminHistorialPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext) ?? {};

  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Lee sucursal desde localStorage y redirige si falta
  useEffect(() => {
    const stored = localStorage.getItem("sucursalId");
    if (!stored) {
      navigate("/login");
      return;
    }
    setSucursalId(Number(stored));
  }, [navigate]);

  // Carga de sucursales
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getSucursales();
        setSucursales(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudieron cargar las sucursales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      // limpiamos datos locales mínimos
      localStorage.removeItem("sucursalId");
      navigate("/login");
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Encabezado */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-2xl">Página de Pedidos</h1>
      </header>

      {/* ⚠️ Errores */}
      {err && (
        <div
          className="rounded-md px-3 py-2 text-sm"
          style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}
        >
          {err}
        </div>
      )}

      {/* 👇 Nuevo panel 13:00 de ayer → 13:00 de hoy (todas las sucursales) */}
      <PedidoProvider>
        <PanelPedidos13a13 />
      </PedidoProvider>

      {/* Filtro por sucursal */}
      <section className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <label className="block text-sm mb-1" htmlFor="sucursal">
              Sucursal
            </label>
            <select
              id="sucursal"
              className="input w-full"
              value={sucursalId ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSucursalId(id);
                localStorage.setItem("sucursalId", String(id));
              }}
              disabled={loading}
            >
              <option value="" disabled>
                {loading ? "Cargando sucursales..." : "Selecciona una sucursal"}
              </option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre ?? `Sucursal #${s.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
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
