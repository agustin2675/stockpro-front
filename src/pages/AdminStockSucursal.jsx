import { useEffect, useMemo, useState } from "react";

// UI
import SelectorSucursal from "../features/stockSucursal/SelectorSucursal.jsx";
import TipoStockAccordion from "../features/stockSucursal/TipoStockAccordion.jsx";

// Services
import { getSucursales } from "../services/sucursalService";
import { getTipoStock } from "../services/tipoStockService";
import { getRubro } from "../services/rubroService";
import { getInsumos } from "../services/insumoService";
import {
  getDisponibilidad,
  addDisponibilidad,
  listDiasForTipoSucursal,
  syncDiasForTipoSucursal,
} from "../services/disponibilidadStockSucursalService";
import { getSucursalInsumo, deleteSucursalInsumo } from "../services/sucursalInsumoService";
import ConfirmDialog from "../components/ConfirmDialog.jsx"; // ⬅️ NUEVO

export default function AdminStockSucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [tiposStock, setTiposStock] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [insumos, setInsumos] = useState([]);

  const [sucursalId, setSucursalId] = useState(null);
  const [disp, setDisp] = useState([]); // disponibilidad por sucursal/tipo
  const [sucursalInsumo, setSucursalInsumo] = useState([]); // filas SucursalInsumo

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSucursal, setLoadingSucursal] = useState(false);
  const [err, setErr] = useState("");

   const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    loading: false,
    onConfirm: null,
  });

  const openConfirm = ({ title, message, confirmLabel = "Confirmar", onConfirm }) =>
    setConfirm({ open: true, title, message, confirmLabel, loading: false, onConfirm });

  const closeConfirm = () =>
    setConfirm((c) => ({ ...c, open: false, onConfirm: null }));

  const doConfirm = async () => {
    if (!confirm.onConfirm) return;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await confirm.onConfirm();
    } finally {
      setConfirm({ open: false, title: "", message: "", confirmLabel: "Confirmar", loading: false, onConfirm: null });
    }
  };

  // Carga inicial
  useEffect(() => {
    const loadAll = async () => {
      try {
        setErr("");
        setLoadingInit(true);
        const [sucRows, tipoRows, rubRows, insRows] = await Promise.all([
          getSucursales(),
          getTipoStock(),
          getRubro(),
          getInsumos(),
        ]);

        setSucursales(Array.isArray(sucRows) ? sucRows : []);
        setTiposStock(Array.isArray(tipoRows) ? tipoRows : []);
        setRubros(Array.isArray(rubRows) ? rubRows : []);
        setInsumos(Array.isArray(insRows) ? insRows : []);

        if (!sucursalId && (sucRows?.length ?? 0) > 0) {
          setSucursalId(sucRows[0].id);
        }
      } catch (e) {
        console.error(e);
        setErr("No se pudieron cargar los datos iniciales.");
      } finally {
        setLoadingInit(false);
      }
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reajusta selección si cambia la lista de sucursales
  useEffect(() => {
    if (!sucursales.length) return;
    const existe = sucursales.some((s) => Number(s.id) === Number(sucursalId));
    if (!existe) setSucursalId(sucursales[0]?.id ?? null);
  }, [sucursales, sucursalId]);

  // Carga dependiente de sucursal: disponibilidad + sucursalInsumo
  useEffect(() => {
    const loadBySucursal = async () => {
      if (!sucursalId) return;
      try {
        setLoadingSucursal(true);
        const [d, siRows] = await Promise.all([
          getDisponibilidad(sucursalId),
          getSucursalInsumo({ sucursal_id: Number(sucursalId) }),
        ]);
        setDisp(Array.isArray(d) ? d : []);
        setSucursalInsumo(Array.isArray(siRows) ? siRows : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar la disponibilidad de la sucursal.");
      } finally {
        setLoadingSucursal(false);
      }
    };
    loadBySucursal();
  }, [sucursalId]);

  // Tipos habilitados según disponibilidad
  const tiposHabilitados = useMemo(() => {
    if (!sucursalId) return [];
    const ids = (disp || [])
      .filter((row) => Number(row.sucursalId) === Number(sucursalId))
      .map((row) => Number(row.tipoStockId));
    return Array.from(new Set(ids));
  }, [disp, sucursalId]);

  const tiposNoHabilitados = useMemo(() => {
    const setHab = new Set(tiposHabilitados);
    return (tiposStock || []).filter((t) => !setHab.has(Number(t.id)));
  }, [tiposStock, tiposHabilitados]);

  // Quitar insumo (por tipo)
   // Quitar insumo (por tipo) — lógica real
  const handleQuitarInsumo = async (tipoStockId, insumoId) => {
    const row = (sucursalInsumo || []).find(
      (r) =>
        Number(r.sucursal_id) === Number(sucursalId) &&
        Number(r.tipoStock_id) === Number(tipoStockId) &&
        Number(r.insumo_id) === Number(insumoId)
    );
    if (!row) return;
    await deleteSucursalInsumo(row.id);
    setSucursalInsumo((prev) => prev.filter((r) => r.id !== row.id));
  };

  // ⬅️ NUEVO: pedir confirmación antes de quitar insumo
  const solicitarQuitarInsumo = (tipoStockId, insumoId) =>
    openConfirm({
      title: "Quitar insumo",
      message: "¿Seguro que deseas quitar este insumo de la sucursal para este tipo?",
      confirmLabel: "Quitar",
      onConfirm: () => handleQuitarInsumo(tipoStockId, insumoId),
    });

  // AGREGAR tipo
  const handleAgregarTipo = async (tipoStockId) => {
    if (!sucursalId || !tipoStockId) return;
    try {
      setErr("");
      const row = await addDisponibilidad({
        sucursalId: Number(sucursalId),
        tipoStockId: Number(tipoStockId),
        diaSemana: 1,
      });
      setDisp((prev) => [...prev, row]);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message ?? "No se pudo agregar la disponibilidad.");
    }
  };

   const handleQuitarTipo = async (tipoStockId) => {
    // 1) Borrar TODOS los insumos de ese tipo para la sucursal
    const toDelete = (sucursalInsumo || []).filter(
      (r) =>
        Number(r.sucursal_id) === Number(sucursalId) &&
        Number(r.tipoStock_id) === Number(tipoStockId)
    );
    if (toDelete.length) {
      await Promise.all(toDelete.map((r) => deleteSucursalInsumo(r.id)));
      setSucursalInsumo((prev) =>
        prev.filter(
          (r) =>
            !(Number(r.sucursal_id) === Number(sucursalId) &&
              Number(r.tipoStock_id) === Number(tipoStockId))
        )
      );
    }

    // 2) Limpiar días (quitar disponibilidad). Conjunto vacío = sin días
    await syncDiasForTipoSucursal(Number(sucursalId), Number(tipoStockId), new Set());

    // 3) Actualizar disp local limpiando las filas de ese tipo
    setDisp((prev) =>
      prev.filter(
        (r) =>
          !(Number(r.sucursalId) === Number(sucursalId) &&
            Number(r.tipoStockId) === Number(tipoStockId))
      )
    );
  };

  // ⬅️ NUEVO: confirmación para quitar tipo
  const solicitarQuitarTipo = (tipoStockId) =>
    openConfirm({
      title: "Quitar tipo de stock",
      message:
        "Esto eliminará todos los insumos de este tipo para la sucursal y también su disponibilidad (días). ¿Deseas continuar?",
      confirmLabel: "Quitar tipo",
      onConfirm: () => handleQuitarTipo(tipoStockId),
    });

  // Obtener/guardar días
  const getDiasTipo = (sucId, tipoId) => {
    const rows = (disp || []).filter(
      (r) => Number(r.sucursalId) === Number(sucId) && Number(r.tipoStockId) === Number(tipoId)
    );
    const s = new Set();
    rows.forEach((r) => {
      if (r.diaSemana !== null && r.diaSemana !== undefined) s.add(Number(r.diaSemana));
    });
    return s;
  };

  const setDiasTipo = async (sucId, tipoId, diasSet) => {
    try {
      setErr("");
      const finalRows = await syncDiasForTipoSucursal(Number(sucId), Number(tipoId), diasSet);
      setDisp((prev) => {
        const others = prev.filter(
          (r) => !(Number(r.sucursalId) === Number(sucId) && Number(r.tipoStockId) === Number(tipoId))
        );
        return [...others, ...finalRows];
      });
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message ?? "No se pudieron guardar los días.");
    }
  };

  // Cuando el modal de “agregar insumo” guarda, actualizamos el estado local
  const handleAddedSucursalInsumo = (row) => {
    setSucursalInsumo((prev) => {
      const idx = prev.findIndex(
        (r) =>
          Number(r.sucursal_id) === Number(row.sucursal_id) &&
          Number(r.tipoStock_id) === Number(row.tipoStock_id) &&
          Number(r.insumo_id) === Number(row.insumo_id)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...row };
        return next;
      }
      return [...prev, row];
    });
  };

  // Cuando el modal de “editar insumo” guarda
  const handleEditedSucursalInsumo = (row) => {
    setSucursalInsumo((prev) => {
      const idx = prev.findIndex((r) => Number(r.id) === Number(row.id));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...row };
        return next;
      }
      // fallback si viniera sin id (no debería)
      const idx2 = prev.findIndex(
        (r) =>
          Number(r.sucursal_id) === Number(row.sucursal_id) &&
          Number(r.tipoStock_id) === Number(row.tipoStock_id) &&
          Number(r.insumo_id) === Number(row.insumo_id)
      );
      if (idx2 >= 0) {
        const next = [...prev];
        next[idx2] = { ...next[idx2], ...row };
        return next;
      }
      return [...prev, row];
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl">Stock de Sucursales</h1>
      </header>
      <SelectorSucursal
        sucursales={sucursales}
        value={sucursalId ?? ""}
        onChange={setSucursalId}
      />

      {loadingInit || loadingSucursal || !sucursalId ? (
        <section className="card p-4">
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            {loadingInit
              ? "Cargando datos..."
              : loadingSucursal
              ? "Cargando disponibilidad…"
              : "Seleccioná una sucursal para continuar."}
          </p>
        </section>
      ) : (
        <TipoStockAccordion
          sucursalId={sucursalId}
          tiposStock={tiposStock}
          tiposHabilitados={tiposHabilitados}
          tiposNoHabilitados={tiposNoHabilitados}
          rubros={rubros}
          insumos={insumos}
          sucursalInsumo={sucursalInsumo}
          onQuitarInsumo={solicitarQuitarInsumo} 
          onAddedSucursalInsumo={handleAddedSucursalInsumo}
          onEditedSucursalInsumo={handleEditedSucursalInsumo}
          onAgregarTipo={handleAgregarTipo}
          onQuitarTipo={solicitarQuitarTipo}  
          getDiasTipo={getDiasTipo}
          setDiasTipo={setDiasTipo}
        />

        
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

        <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        loading={confirm.loading}
        onCancel={closeConfirm}
        onConfirm={doConfirm}
      />
    </div>
  );
}
