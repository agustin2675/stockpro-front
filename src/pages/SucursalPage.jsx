import { useEffect, useMemo, useState } from "react";

// UI
import TipoStockListSucursal from "../features/sucursal/TipoStockListSucursal.jsx";
import SucursalOptions from "../features/sucursal/SucursalOptions.jsx";
import HistorialStockView from "../features/sucursal/HistorialStockView.jsx";
import HistorialPedidosView from "../features/sucursal/HistorialPedidosView.jsx";

// Services
import { getTipoStock } from "../services/tipoStockService";
import { getDisponibilidad } from "../services/disponibilidadStockSucursalService";
import { getRubro } from "../services/rubroService";
import { getInsumos } from "../services/insumoService";
import { getSucursalInsumo } from "../services/sucursalInsumoService";
import { getUnidadesMedida } from "../services/unidadMedidaService";

export default function SucursalPage() {
  // Sucursal fija mientras no hay auth
  const sucursalId = 1;

  const [tab, setTab] = useState("stocks");
  const hoy = new Date().getDay();

  const [tiposStock, setTiposStock] = useState([]);
  const [disp, setDisp] = useState([]);

  // Nuevos datasets reales
  const [rubros, setRubros] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [sucursalInsumo, setSucursalInsumo] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // Tipos de stock
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

  // Disponibilidad por sucursal
  useEffect(() => {
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

  // Rubros, Insumos, SucursalInsumo
  useEffect(() => {
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
        setRubros([]);
        setInsumos([]);
        setSucursalInsumo([]);
        setUnidades([])
      }
    })();
  }, [sucursalId]);

  // Tipos habilitados HOY
  const tiposHabilitadosHoy = useMemo(() => {
    const ids = (disp || [])
      .filter((row) => Number(row.sucursalId) === sucursalId && Number(row.diaSemana) === hoy)
      .map((row) => Number(row.tipoStockId));
    return Array.from(new Set(ids));
  }, [disp, sucursalId, hoy]);

const getTiposIdsByDate = async (date) => {
  try {
    const diaSemana = date.getDay(); // 0..6
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

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <header>
        <h1 className="font-display text-2xl">Sucursal</h1>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Mostrando datos de la sucursal #{sucursalId}
        </p>
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
            // datasets para agrupar por rubro e hidratar tablas
            rubros={rubros}
            insumos={insumos}
            sucursalInsumo={sucursalInsumo}
            unidades={unidades}
            getTiposIdsByDate={getTiposIdsByDate}
          />
        </section>
      )}

      {tab === "histStock" && <HistorialStockView sucursalId={sucursalId} />}
      {tab === "histPedidos" && <HistorialPedidosView sucursalId={sucursalId} />}
    </div>
  );
}


