// src/pages/SucursalPage.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// UI
import TipoStockListSucursal from "../features/sucursal/TipoStockListSucursal.jsx";
import SucursalOptions from "../features/sucursal/SucursalOptions.jsx";
import HistorialStockView from "../features/sucursal/HistorialStockView.jsx";
import { PedidoProvider } from "../context/PedidoContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

// Services
import { getTipoStock } from "../services/tipoStockService";
import { getDisponibilidad } from "../services/disponibilidadStockSucursalService";
import { getRubro } from "../services/rubroService";
import { getInsumos } from "../services/insumoService";
import { getSucursalInsumo } from "../services/sucursalInsumoService";
import { getUnidadesMedida } from "../services/unidadMedidaService";

export default function SucursalPage() {
  const navigate = useNavigate();
  const { handleProfileMode } = useContext(AuthContext);

  // 🏪 Sucursal desde localStorage
  const storedSucursalId = localStorage.getItem("sucursalId");
  const storedSucursalName = localStorage.getItem("sucursalName");
  const sucursalId = storedSucursalId ? Number(storedSucursalId) : null;

  // 🚨 Si no hay sucursal -> redirigir al login
  useEffect(() => {
    if (!sucursalId) {
      navigate("/login", { replace: true });
    }
  }, [sucursalId, navigate]);

  const [tab, setTab] = useState("stocks");
  const hoy = new Date().getDay();

  const [tiposStock, setTiposStock] = useState([]);
  const [disp, setDisp] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [sucursalInsumo, setSucursalInsumo] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    handleProfileMode?.(null);
    navigate("/login", { replace: true });
    window.location.reload();
  };

  // Cargar tipos de stock
  useEffect(() => {
    (async () => {
      try {
        const ts = await getTipoStock();
        setTiposStock(Array.isArray(ts) ? ts : []);
      } catch (e) {
        console.error("Error cargando tipos de stock", e);
      }
    })();
  }, []);

  // Cargar disponibilidad
  useEffect(() => {
    if (!sucursalId) return;
    (async () => {
      try {
        const d = await getDisponibilidad(sucursalId);
        setDisp(Array.isArray(d) ? d : []);
      } catch (e) {
        console.error("Error cargando disponibilidad", e);
        setDisp([]);
      }
    })();
  }, [sucursalId]);

  // Cargar datos base
  useEffect(() => {
    if (!sucursalId) return;
    (async () => {
      try {
        const [r, i, si, um] = await Promise.all([
          getRubro(),
          getInsumos(),
          getSucursalInsumo({ sucursal_id: sucursalId }),
          getUnidadesMedida(),
        ]);
        setRubros(Array.isArray(r) ? r : []);
        setInsumos(Array.isArray(i) ? i : []);
        setSucursalInsumo(Array.isArray(si) ? si : []);
        setUnidades(Array.isArray(um) ? um : []);
      } catch (e) {
        console.error("Error cargando datos de sucursal", e);
      }
    })();
  }, [sucursalId]);

  const tiposHabilitadosHoy = useMemo(() => {
    if (!disp || !sucursalId) return [];
    const ids = disp
      .filter(
        (row) =>
          Number(row.sucursalId) === Number(sucursalId) &&
          Number(row.diaSemana) === hoy
      )
      .map((row) => Number(row.tipoStockId));
    return Array.from(new Set(ids));
  }, [disp, sucursalId, hoy]);

  const getTiposIdsByDate = async (date) => {
    try {
      const diaSemana = date.getDay();
      const ids = (disp || [])
        .filter(
          (row) =>
            Number(row.sucursalId) === Number(sucursalId) &&
            Number(row.diaSemana) === Number(diaSemana)
        )
        .map((row) => Number(row.tipoStockId));
      return Array.from(new Set(ids));
    } catch (e) {
      console.error("getTiposIdsByDate failed:", e);
      return [];
    }
  };

  if (!sucursalId) return null; // evita errores mientras redirige

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Sucursal</h1>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Mostrando datos de la sucursal {storedSucursalName}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline text-sm px-4 py-1 rounded-lg self-start sm:self-auto"
          style={{ borderColor: "var(--frame)" }}
        >
          Cerrar sesión
        </button>
      </header>

      <SucursalOptions value={tab} onChange={setTab} />

      {tab === "stocks" && (
        <section className="card p-4">
          <h2 className="text-lg font-semibold">Stocks disponibles (hoy)</h2>
          <p className="text-sm mb-3" style={{ color: "var(--graphite)" }}>
            Tipos habilitados para el día actual.
          </p>

          <TipoStockListSucursal
            sucursalId={sucursalId}
            tiposStock={tiposStock}
            tiposIds={tiposHabilitadosHoy}
            rubros={rubros}
            insumos={insumos}
            sucursalInsumo={sucursalInsumo}
            unidades={unidades}
            getTiposIdsByDate={getTiposIdsByDate}
          />
        </section>
      )}

      {tab === "histStock" && (
        <PedidoProvider
          sucursalId={sucursalId}
          initialDateISO={new Date().toISOString()}
        >
          <HistorialStockView sucursalId={sucursalId} />
        </PedidoProvider>
      )}
    </div>
  );
}
