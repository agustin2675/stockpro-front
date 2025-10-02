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

export default function InsumosPage() {
  const [tiposStock, setTiposStock] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [insumos, setInsumos] = useState([]);

  // unidades desde API (para CRUD) y desde mock para enriquecer insumos
  const [unidadesApi, setUnidadesApi] = useState([]);

  /*
  const [sucursales] = useState(data.Sucursal ?? []);
  const [sucInsumo, setSucInsumo] = useState(data.SucursalInsumo ?? []);
*/

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

  // ===== Enriquecimiento y filtros (usa mock para mostrar nombre de unidad en insumos)
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
      const rubro_id =
        i.rubro_id ?? i.rubroId ?? i.rubro?.id ?? null;
      const unidadDeMedida_id =
        i.unidadDeMedida_id ?? i.unidadDeMedidaId ?? i.unidadDeMedida?.id ?? null;
      const unidadNombre =
        i.unidadDeMedida?.nombre // si la API ya lo manda, úsalo
        ?? unidadesById[unidadDeMedida_id]
        ?? "-";
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
    const t = typeof tipoOrId === "object" ? tipoOrId : tiposStock.find(x => x.id === tipoOrId);
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
  const eliminarTipo = async (id) => {
    try {
      await desactivarTipoStock(id);
      const data = await getTipoStock();
      setTiposStock(data);
    } catch (e) {
      console.error("Error al dar de baja el Tipo Stock:", e);
    }
  };

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
  const eliminarRubro = async (id) => {
    try {
      await desactivarRubro(id);
      const data = await getRubro();
      setRubros(data);
    } catch (e) {
      console.error("Error al dar de baja el rubro:", e);
    }
  };

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
      unidadDeMedida_id:
        raw.unidadDeMedida_id ?? raw.unidadDeMedidaId ?? raw.unidadDeMedida?.id ?? null,
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
  const eliminarInsumo = async (id) => {
    try {
      await desactivarInsumo(id);
      const data = await getInsumos();
      setInsumos(data);
    } catch (e) {
      console.error("Error al dar de baja el insumo:", e);
    }
  };

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
  const eliminarUnidad = async (id) => {
    try {
      await desactivarUnidad(id);
      await getUnidadesTabla();
    } catch (e) {
      console.error("Error al dar de baja la unidad:", e);
    }
  };

  {/*
  // ===== Modal: Disponible en sucursal (insumo)
  const [openModal, setOpenModal] = useState(false);
  const [insumoSel, setInsumoSel] = useState(null);
  const openDisponibilidad = (insumoId) => {
    const obj = insumos.find((i) => i.id === insumoId) || null;
    setInsumoSel(obj);
    setOpenModal(true);
  };
  const closeDisponibilidad = () => {
    setOpenModal(false);
    setInsumoSel(null);
  };
  const selectedSucIds = useMemo(() => {
    if (!insumoSel) return new Set();
    return new Set((sucInsumo ?? []).filter((x) => x.insumo_id === insumoSel.id).map((x) => x.sucursal_id));
  }, [insumoSel, sucInsumo]);
  const toggleSucursal = (sucursalId) => {
    if (!insumoSel) return;
    const idInsumo = insumoSel.id;
    const existe = sucInsumo.find((si) => si.insumo_id === idInsumo && si.sucursal_id === sucursalId);
    if (existe) {
      setSucInsumo((prev) => prev.filter((si) => !(si.insumo_id === idInsumo && si.sucursal_id === sucursalId)));
    } else {
      const maxId = sucInsumo.reduce((m, r) => Math.max(m, r.id ?? 0), 0);
      setSucInsumo((prev) =>
        prev.concat({
          id: maxId + 1,
          sucursal_id: sucursalId,
          insumo_id: idInsumo,
          cantidadReal: 0,
          cantidadIdeal: 0,
        })
      );
    }
  };
*/}
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl">Insumos (Administrador)</h1>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Gestioná <strong>Tipos de Stock</strong>, <strong>Rubros</strong>, <strong>Insumos</strong> y <strong>Unidades de medida</strong>.
        </p>
      </header>

      {/* Tabs ahora soporta "unidad" */}
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
          : crearUnidad // "unidad"
        }
      />

      {tab === "tipo" && (
        <TableTipoStock rows={tiposStock} onEditar={abrirEditarTipo} onEliminar={eliminarTipo} />
      )}

      {tab === "rubro" && (
        <TableRubros rows={rubros} onEditar={abrirEditarRubro} onEliminar={eliminarRubro} />
      )}

      {tab === "insumo" && (
        <TableInsumos
          rows={insumosFiltrados}
          onEditar={abrirEditarInsumo}
          onEliminar={eliminarInsumo}
        />
      )}

      {tab === "unidad" && (
        <TableUnidades rows={unidadesApi} onEditar={abrirEditarUnidad} onEliminar={eliminarUnidad} />
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


      {/* Modal de disponibilidad 
      <ModalSucursales
        open={openModal}
        onClose={closeDisponibilidad}
        insumo={insumoSel}
        sucursales={sucursales}
        selectedIds={selectedSucIds}
        onToggle={toggleSucursal}
      />
      */}

      {/* Modales de creación */}
      <ModalCrearTipo open={openModalCrearTipo} onClose={() => setOpenModalCrearTipo(false)} onSave={guardarTipo} />
      <ModalCrearRubro open={openModalCrearRubro} onClose={() => setOpenModalCrearRubro(false)} onSave={guardarRubro} />
      <CreateInsumoModal open={openCreateInsumo} onClose={() => setOpenCreateInsumo(false)} onSave={guardarInsumo} />
      <ModalCrearUnidad open={openModalCrearUnidad} onClose={() => setOpenModalCrearUnidad(false)} onSave={guardarUnidad} />
    </div>
  );
}
