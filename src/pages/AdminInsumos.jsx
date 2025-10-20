// src/AdminInsumos.jsx
import { useEffect, useMemo, useState } from "react";

import Tabs from "../features/insumos/Tabs.jsx";
import Toolbar from "../features/insumos/Toolbar.jsx";
import TableTipoStock from "../features/insumos/TableTipoStock.jsx";
import TableRubros from "../features/insumos/TableRubros.jsx";
import TableInsumos from "../features/insumos/TableInsumos.jsx";

// services existentes
import { getTipoStock, postTipoStock, desactivarTipoStock, putTipoStock } from "../services/tipoStockService.js";
import { getRubro, postRubro, desactivarRubro, putRubro } from "../services/rubroService.js";
import { getInsumos, postInsumo, desactivarInsumo, putInsumo } from "../services/insumoService.js";

// NUEVOS: unidades de medida
import { getUnidadesMedida, postUnidad, desactivarUnidad, putUnidad } from "../services/unidadMedidaService.js";

// modales existentes
import ModalCrearTipo from "../features/insumos/ModalCrearTipo.jsx";
import ModalCrearRubro from "../features/insumos/ModalCrearRubro.jsx";
import CreateInsumoModal from "../features/insumos/ModalCreateInsumo.jsx";
import ModalEditInsumo from "../features/insumos/ModalEditInsumo";
import ModalEditarRubro from "../features/insumos/ModalEditarRubro.jsx";
import ModalEditarTipo from "../features/insumos/ModalEditarTipo.jsx";

// NUEVOS: unidades de medida
import ModalCrearUnidad from "../features/insumos/ModalCrearUnidad.jsx";
import ModalEditarUnidad from "../features/insumos/ModalEditarUnidad.jsx";
import TableUnidades from "../features/insumos/TableUnidades.jsx";

// 🔴 NUEVO: modal de confirmación
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function InsumosPage() {
  const [tiposStock, setTiposStock] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [insumos, setInsumos] = useState([]);

  // unidades desde API (para CRUD)
  const [unidadesApi, setUnidadesApi] = useState([]);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipoStock, setFiltroTipoStock] = useState("");
  const [filtroRubro, setFiltroRubro] = useState("");
  const [tab, setTab] = useState("tipo"); // "tipo" | "rubro" | "insumo" | "unidad"

  // ===== Edit: Estados independientes
  const [editingRubro, setEditingRubro] = useState(null);
  const [openEditRubro, setOpenEditRubro] = useState(false);

  const [editingInsumo, setEditingInsumo] = useState(null);
  const [openEditInsumo, setOpenEditInsumo] = useState(false);

  const [editingTipo, setEditingTipo] = useState(null);
  const [openEditTipo, setOpenEditTipo] = useState(false);

  const [editingUnidad, setEditingUnidad] = useState(null);
  const [openEditUnidad, setOpenEditUnidad] = useState(false);

  // ===== Crear (modales)
  const [openModalCrearTipo, setOpenModalCrearTipo] = useState(false);
  const [openModalCrearRubro, setOpenModalCrearRubro] = useState(false);
  const [openCreateInsumo, setOpenCreateInsumo] = useState(false);
  const [openModalCrearUnidad, setOpenModalCrearUnidad] = useState(false);

  // 🔴 NUEVO: estado del modal de confirmación
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Eliminar",
    loading: false,
    onConfirm: null,
  });

  const openConfirm = ({ title, message, confirmLabel = "Eliminar", onConfirm }) => {
    setConfirm({ open: true, title, message, confirmLabel, loading: false, onConfirm });
  };
  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false, onConfirm: null }));
  const doConfirm = async () => {
    if (!confirm.onConfirm) return;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await confirm.onConfirm();
    } finally {
      setConfirm({ open: false, title: "", message: "", confirmLabel: "Eliminar", loading: false, onConfirm: null });
    }
  };

  useEffect(() => {
    getStockTabla();
    getRubroTabla();
    getInsumoTabla();
    getUnidadesTabla();
  }, []);

  const getInsumoTabla = async () => {
    const res = await getInsumos();
    setInsumos(res);
  };
  const getStockTabla = async () => {
    const res = await getTipoStock();
    setTiposStock(res);
  };
  const getRubroTabla = async () => {
    const res = await getRubro();
    setRubros(res);
  };
  const getUnidadesTabla = async () => {
    const res = await getUnidadesMedida();
    setUnidadesApi(res ?? []);
  };

  const unidadesById = useMemo(
    () => Object.fromEntries((unidadesApi ?? []).map((u) => [u.id, u.nombre])),
    [unidadesApi]
  );
  const rubrosById = useMemo(
    () => Object.fromEntries((rubros ?? []).map((r) => [r.id, r])),
    [rubros]
  );

  const insumosEnriquecidos = useMemo(() => {
    return (insumos ?? []).map((i) => {
      const rubro_id = i.rubro_id ?? i.rubroId ?? i.rubro?.id ?? null;
      const unidadDeMedida_id = i.unidadDeMedida_id ?? i.unidadDeMedidaId ?? i.unidadDeMedida?.id ?? null;
      const unidadNombre = i.unidadDeMedida?.nombre ?? unidadesById[unidadDeMedida_id] ?? "-";
      return {
        ...i,
        rubro_id,
        unidadDeMedida_id,
        rubro: rubrosById[rubro_id]?.nombre ?? "-",
        unidad: unidadNombre,
      };
    });
  }, [insumos, rubrosById, unidadesById]);

  const insumosFiltrados = useMemo(() => {
    let list = insumosEnriquecidos;
    if (filtroRubro) list = list.filter((i) => String(i.rubro_id) === filtroRubro);
    if (filtroTexto) {
      const q = filtroTexto.toLowerCase();
      list = list.filter(
        (i) =>
          i.nombre.toLowerCase().includes(q) ||
          i.rubro.toLowerCase().includes(q) ||
          i.unidad.toLowerCase().includes(q)
      );
    }
    return list;
  }, [insumosEnriquecidos, filtroRubro, filtroTexto]);

  // ===== Tipo de Stock
  const crearTipo = () => setOpenModalCrearTipo(true);
  const guardarTipo = async (nombre) => {
    await postTipoStock(nombre);
    getStockTabla();
  };
  const abrirEditarTipo = (tipoOrId) => {
    const t = typeof tipoOrId === "object" ? tipoOrId : tiposStock.find((x) => x.id === tipoOrId);
    if (!t) return console.error("No se encontró el tipo de stock para editar:", tipoOrId);
    setEditingTipo(t);
    setOpenEditTipo(true);
  };
  const guardarEdicionTipo = async ({ id, nombre }) => {
    if (id == null) return console.error("guardarEdicionTipo: id faltante");
    await putTipoStock(id, nombre);
    const data = await getTipoStock();
    setTiposStock(data);
    setOpenEditTipo(false);
    setEditingTipo(null);
  };
  // ✅ Reemplazo: pedir confirmación antes de eliminar
  const solicitarEliminarTipo = (id) =>
    openConfirm({
      title: "Eliminar Tipo de Stock",
      message: "¿Seguro que deseas eliminar este tipo de stock? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await desactivarTipoStock(id);
        await getStockTabla();
      },
    });

  // ===== Rubro
  const crearRubro = () => setOpenModalCrearRubro(true);
  const guardarRubro = async (nombre) => {
    await postRubro(nombre);
    getRubroTabla();
  };
  const abrirEditarRubro = (rubroOrId) => {
    const r = typeof rubroOrId === "object" ? rubroOrId : rubros.find((x) => x.id === rubroOrId);
    if (!r) return console.error("No se encontró el rubro para editar:", rubroOrId);
    setEditingRubro(r);
    setOpenEditRubro(true);
  };
  const guardarEdicionRubro = async ({ id, nombre }) => {
    if (id == null) return console.error("guardarEdicionRubro: id faltante");
    await putRubro(id, nombre);
    const refreshed = await getRubro();
    setRubros(refreshed);
    setOpenEditRubro(false);
    setEditingRubro(null);
  };
  // ✅ Reemplazo: pedir confirmación antes de eliminar
  const solicitarEliminarRubro = (id) =>
    openConfirm({
      title: "Eliminar Rubro",
      message: "¿Seguro que deseas eliminar este rubro? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await desactivarRubro(id);
        const data = await getRubro();
        setRubros(data);
      },
    });

  // ===== Insumo
  const crearInsumo = () => setOpenCreateInsumo(true);
  const guardarInsumo = async (payload) => {
    try {
      await postInsumo(payload.nombre, payload.unidadDeMedida_id, payload.rubro_id);
      getInsumoTabla();
      setOpenCreateInsumo(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear el insumo.");
    }
  };
  const abrirEditarInsumo = (id) => {
    const raw = insumos.find((x) => x.id === id);
    if (!raw) return;
    const normalized = {
      ...raw,
      rubro_id: raw.rubro_id ?? raw.rubroId ?? raw.rubro?.id ?? null,
      unidadDeMedida_id: raw.unidadDeMedida_id ?? raw.unidadDeMedidaId ?? raw.unidadDeMedida?.id ?? null,
    };
    setEditingInsumo(normalized);
    setOpenEditInsumo(true);
  };
  const guardarEdicionInsumo = async (payload) => {
    await putInsumo(payload.id, payload);
    const data = await getInsumos();
    setInsumos(data);
    setOpenEditInsumo(false);
    setEditingInsumo(null);
  };
  // ✅ Reemplazo: pedir confirmación antes de eliminar
  const solicitarEliminarInsumo = (id) =>
    openConfirm({
      title: "Eliminar Insumo",
      message: "¿Seguro que deseas eliminar este insumo? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await desactivarInsumo(id);
        const data = await getInsumos();
        setInsumos(data);
      },
    });

  // ===== Unidades de medida (NUEVO)
  const crearUnidad = () => setOpenModalCrearUnidad(true);
  const guardarUnidad = async (nombre) => {
    await postUnidad(nombre);
    await getUnidadesTabla();
    setOpenModalCrearUnidad(false);
  };
  const abrirEditarUnidad = (unidadOrId) => {
    const u = typeof unidadOrId === "object" ? unidadOrId : unidadesApi.find((x) => x.id === unidadOrId);
    if (!u) return console.error("No se encontró la unidad para editar:", unidadOrId);
    setEditingUnidad(u);
    setOpenEditUnidad(true);
  };
  const guardarEdicionUnidad = async ({ id, nombre }) => {
    if (id == null) return console.error("guardarEdicionUnidad: id faltante");
    await putUnidad(id, nombre);
    await getUnidadesTabla();
    setOpenEditUnidad(false);
    setEditingUnidad(null);
  };
  // ✅ Reemplazo: pedir confirmación antes de eliminar
  const solicitarEliminarUnidad = (id) =>
    openConfirm({
      title: "Eliminar Unidad de Medida",
      message: "¿Seguro que deseas eliminar esta unidad? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await desactivarUnidad(id);
        await getUnidadesTabla();
      },
    });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl">Insumos</h1>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Gestioná <strong>Tipos de Stock</strong>, <strong>Rubros</strong>, <strong>Insumos</strong> y <strong>Unidades de medida</strong>.
        </p>
      </header>

      <Tabs tab={tab} setTab={setTab} />

      <Toolbar
        tab={tab}
        rubros={rubros}
        filtroTexto={filtroTexto}
        setFiltroTexto={setFiltroTexto}
        filtroRubro={filtroRubro}
        setFiltroRubro={setFiltroRubro}
        onCrear={
          tab === "tipo" ? crearTipo
          : tab === "rubro" ? crearRubro
          : tab === "insumo" ? crearInsumo
          : crearUnidad
        }
      />

      {tab === "tipo" && (
        <TableTipoStock rows={tiposStock} onEditar={abrirEditarTipo} onEliminar={solicitarEliminarTipo} />
      )}

      {tab === "rubro" && (
        <TableRubros rows={rubros} onEditar={abrirEditarRubro} onEliminar={solicitarEliminarRubro} />
      )}

      {tab === "insumo" && (
        <TableInsumos
          rows={insumosFiltrados}
          onEditar={abrirEditarInsumo}
          onEliminar={solicitarEliminarInsumo}
        />
      )}

      {tab === "unidad" && (
        <TableUnidades rows={unidadesApi} onEditar={abrirEditarUnidad} onEliminar={solicitarEliminarUnidad} />
      )}

      {/* Modales de edición */}
      <ModalEditarTipo
        open={openEditTipo}
        tipo={editingTipo}
        onClose={() => { setOpenEditTipo(false); setEditingTipo(null); }}
        onSave={guardarEdicionTipo}
      />
      <ModalEditarRubro
        open={openEditRubro}
        rubro={editingRubro}
        onClose={() => { setOpenEditRubro(false); setEditingRubro(null); }}
        onSave={guardarEdicionRubro}
      />
      <ModalEditInsumo
        open={openEditInsumo}
        insumo={editingInsumo}
        onClose={() => { setOpenEditInsumo(false); setEditingInsumo(null); }}
        onSave={guardarEdicionInsumo}
      />
      <ModalEditarUnidad
        open={openEditUnidad}
        unidad={editingUnidad}
        onClose={() => { setOpenEditUnidad(false); setEditingUnidad(null); }}
        onSave={guardarEdicionUnidad}
      />

      {/* 🔴 NUEVO: Modal de confirmación */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        loading={confirm.loading}
        onCancel={closeConfirm}
        onConfirm={doConfirm}
      />

      {/* Modales de creación */}
      <ModalCrearTipo open={openModalCrearTipo} onClose={() => setOpenModalCrearTipo(false)} onSave={guardarTipo} />
      <ModalCrearRubro open={openModalCrearRubro} onClose={() => setOpenModalCrearRubro(false)} onSave={guardarRubro} />
      <CreateInsumoModal open={openCreateInsumo} onClose={() => setOpenCreateInsumo(false)} onSave={guardarInsumo} />
      <ModalCrearUnidad open={openModalCrearUnidad} onClose={() => setOpenModalCrearUnidad(false)} onSave={guardarUnidad} />
    </div>
  );
}
