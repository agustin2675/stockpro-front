// src/features/sucursal/TipoStockListSucursal.jsx
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PedidoProvider } from "../../context/PedidoContext.jsx";
import { usePedido } from "../../context/PedidoContext.jsx";
import RubroListSucursal from "./RubroListSucursal.jsx";
import ModalAviso from "../../components/ModalAviso.jsx";

// Servicios
import {
  getPedido,
  postPedido,
  getPedidoById,   // 👈 NEW
  updatePedido,    // 👈 NEW
} from "../../services/pedidoService.js";

const headerStyle = {
  backgroundColor: "var(--accent-weak, #EFE8DC)",
  color: "var(--ink, #1f2937)",
  borderColor: "var(--frame)",
};
const VERDE_OSCURO = "#10B981";
const TEXTO_SOBRE_VERDE = "#FFFFFF";

/* ---------- util ---------- */
function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ---------- UI genérico ---------- */
function Modal({ open, onClose, children, title = "Seleccionar insumos" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Centrado, auto-alto, con margen lateral en mobile */}
      <div
        className="w-full max-w-[42rem] mx-3 sm:mx-0 bg-white rounded-2xl shadow-xl border overflow-hidden"
        style={{ borderColor: "var(--frame)" }}
      >
        {/* Header sticky */}
        <div className="px-3 sm:px-4 py-3 border-b sticky top-0 bg-white z-10" style={{ borderColor: "var(--frame)" }}>
          <h3 className="font-semibold text-base sm:text-lg truncate">{title}</h3>
        </div>

        {/* Contenido con scroll vertical máximo, sin overflow horizontal */}
        <div className="px-3 sm:px-4 py-3 max-h-[70vh] overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Footer compacto y responsive */}
        <div className="px-3 sm:px-4 py-3 border-t flex flex-col sm:flex-row gap-2 sm:justify-end" style={{ borderColor: "var(--frame)" }}>
          <button className="btn btn-outline btn-sm w-full sm:w-auto" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}


/* ---------- Contenido principal ---------- */
function TipoStockContent({
  sucursalId,
  tiposStock = [],
  tiposIds = [],
  rubros = [],
  insumos = [],
  sucursalInsumo = [],
  unidades = [],
  onPedidoEnviado,
  // 👇 NEW props para edición
  isEditMode = false,
  pedidoLoaded = null,         // objeto pedido cargado (getPedidoById)
}) {
  const { buildPayload, hydrateFromPedido } = usePedido(); // 👈 hydrateFromPedido opcional

  // Cuando estamos en modo edición e ingresan datos del pedido, hidratamos el contexto si el método existe
  useEffect(() => {
    if (isEditMode && pedidoLoaded && typeof hydrateFromPedido === "function") {
      try {
        hydrateFromPedido(pedidoLoaded);
      } catch (e) {
        console.warn("No se pudo hidratar el contexto con el pedido:", e);
      }
    }
  }, [isEditMode, pedidoLoaded, hydrateFromPedido]);

  // Animaciones de envío
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tipoPorId = useMemo(() => {
    const m = new Map();
    for (const t of tiposStock) m.set(Number(t.id), t);
    return m;
  }, [tiposStock]);

  const insumoPorId = useMemo(() => {
    const m = new Map();
    for (const i of insumos) m.set(Number(i.id), i);
    return m;
  }, [insumos]);

  const bloques = useMemo(() => {
    return (tiposIds || []).map((tipoId) => {
      const tipo = tipoPorId.get(Number(tipoId));
      const siDelTipo = (sucursalInsumo || []).filter(
        (si) =>
          Number(si.sucursal_id) === Number(sucursalId) &&
          Number(si.tipoStock_id) === Number(tipoId)
      );

      const mapRubroInsumos = new Map();
      for (const si of siDelTipo) {
        const insumoObj = insumoPorId.get(Number(si.insumo_id));
        if (!insumoObj) continue;
        const rid = Number(insumoObj.rubro_id);
        if (!mapRubroInsumos.has(rid)) mapRubroInsumos.set(rid, []);
        mapRubroInsumos.get(rid).push(insumoObj);
      }

      const rubrosList = rubros
        .filter((r) => mapRubroInsumos.has(Number(r.id)))
        .slice()
        .sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));

      for (const [rid, arr] of mapRubroInsumos) {
        mapRubroInsumos.set(
          rid,
          arr.slice().sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""))
        );
      }

      return {
        tipoId: String(tipoId),
        tipoNombre: tipo?.nombre ?? `Tipo #${tipoId}`,
        rubrosList,
        insumosPorRubro: mapRubroInsumos,
      };
    });
  }, [tiposIds, tipoPorId, sucursalInsumo, sucursalId, rubros, insumoPorId]);

  // ---------- EXTRAS ----------
  const habilitadosSet = useMemo(() => new Set((tiposIds || []).map(Number)), [tiposIds]);

  const insumoIdsEnTiposHabilitados = useMemo(() => {
    const ids = new Set();
    (sucursalInsumo || []).forEach((row) => {
      if (
        Number(row.sucursal_id) === Number(sucursalId) &&
        habilitadosSet.has(Number(row.tipoStock_id))
      ) {
        ids.add(Number(row.insumo_id));
      }
    });
    return ids;
  }, [sucursalInsumo, sucursalId, habilitadosSet]);

  const candidatosExtras = useMemo(() => {
    const rowsNoHab = (sucursalInsumo || []).filter(
      (row) =>
        Number(row.sucursal_id) === Number(sucursalId) &&
        !habilitadosSet.has(Number(row.tipoStock_id))
    );
    const baseIds = Array.from(new Set(rowsNoHab.map((r) => Number(r.insumo_id))));
    const filtrados = baseIds.filter((id) => !insumoIdsEnTiposHabilitados.has(Number(id)));
    return filtrados
      .map((id) => insumoPorId.get(id))
      .filter(Boolean)
      .sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));
  }, [sucursalInsumo, sucursalId, habilitadosSet, insumoPorId, insumoIdsEnTiposHabilitados]);

  const [extrasInsumos, setExtrasInsumos] = useState([]);
  const [extrasModalOpen, setExtrasModalOpen] = useState(false);
  const [extrasSeleccion, setExtrasSeleccion] = useState(() => new Set());

  const toggleSeleccion = (id) => {
    setExtrasSeleccion((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const agregarSeleccionadosAExtras = () => {
    if (extrasSeleccion.size === 0) return;
    const ya = new Set(extrasInsumos.map((i) => Number(i.id)));
    const nuevos = candidatosExtras.filter((i) => extrasSeleccion.has(Number(i.id)) && !ya.has(Number(i.id)));
    if (nuevos.length) setExtrasInsumos((prev) => [...prev, ...nuevos]);
    setExtrasSeleccion(new Set());
    setExtrasModalOpen(false);
  };

  const extrasRubrosList = useMemo(() => {
    const ridSet = new Set(extrasInsumos.map((i) => Number(i.rubro_id)));
    return rubros
      .filter((r) => ridSet.has(Number(r.id)))
      .slice()
      .sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));
  }, [extrasInsumos, rubros]);

  const extrasInsumosPorRubro = useMemo(() => {
    const map = new Map();
    for (const ins of extrasInsumos) {
      const rid = Number(ins.rubro_id);
      if (!map.has(rid)) map.set(rid, []);
      map.get(rid).push(ins);
    }
    for (const [rid, arr] of map) {
      map.set(
        rid,
        arr.slice().sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""))
      );
    }
    return map;
  }, [extrasInsumos]);

  // ---------- BLOQUEO/GUARDADO ----------
  const [lockedByTipo, setLockedByTipo] = useState(() => new Set());
  const isLocked = (key) => lockedByTipo.has(String(key));
  const toggleLock = (key, lock) => {
    setLockedByTipo((prev) => {
      const n = new Set(prev);
      if (lock) n.add(String(key));
      else n.delete(String(key));
      return n;
    });
  };

  const normalesOk = bloques.length > 0 && bloques.every((b) => isLocked(b.tipoId));
  const extrasCuenta = extrasInsumos.length > 0;
  const todosGuardados = normalesOk && (!extrasCuenta || isLocked("extras"));

  const [aviso, setAviso] = useState({ open: false, title: "", message: "", type: "info" });
  const abrirAviso  = (title, message, type = "info") => setAviso({ open: true, title, message, type });
  const cerrarAviso = () => setAviso((a) => ({ ...a, open: false }));
  const EXTRA_ID = import.meta.env.VITE_EXTRA_ID;


  // Envío / Actualización
  const handleEnviar = async () => {
    if (!todosGuardados && !isEditMode) {
      // En edición permitimos guardar aunque no estén “bloqueados” todos, depende de tu flujo.
      abrirAviso("Falta guardar", "Todos los tipos de stock deben estar guardados antes de enviar.", "warning");
      return;
    }
    try {
      setIsSending(true);
      await new Promise(r => setTimeout(r, 200));
      const payload = buildPayload();

      if (isEditMode && pedidoLoaded?.id) {
        await updatePedido(pedidoLoaded.id, payload); // 👈 UPDATE
      } else {
        await postPedido(payload);                    // 👈 CREATE
      }

      setShowSuccess(true);
      await new Promise(r => setTimeout(r, 900));
      setShowSuccess(false);

      abrirAviso("Éxito", isEditMode ? "Pedido actualizado correctamente." : "El pedido se envió correctamente.", "info");
      if (typeof onPedidoEnviado === "function") onPedidoEnviado();
    } catch (err) {
      console.error("Error al enviar/actualizar pedido:", err);
      abrirAviso("Error", isEditMode ? "No se pudo actualizar el pedido." : "No se pudo enviar el pedido.", "error");
    } finally {
      setIsSending(false);
    }
  };

  if (!tiposIds?.length && !extrasCuenta) {
    return (
      <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
        No hay tipos habilitados para esta fecha.
      </div>
    );
  }

  return (
    <div className="grid gap-6 relative">
      {/* Overlay “Enviando…” */}
      <AnimatePresence>
        {isSending && (
          <motion.div
            key="sending"
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.25)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-xl bg-white px-5 py-4 shadow-xl text-sm sm:text-base flex items-center gap-3"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
            >
              <span className="animate-pulse">{isEditMode ? "Guardando cambios…" : "Enviando…"}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="ok"
            className="z-20 fixed top-4 left-1/2 -translate-x-1/2 rounded-lg border bg-white px-4 py-2 text-sm shadow"
            style={{ borderColor: "var(--frame)" }}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
          >
            {isEditMode ? "✅ Cambios guardados" : "✅ Pedido enviado"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tipos NORMALES */}
      <div className="grid gap-6 sm:gap-7">
        {bloques.map(({ tipoId, tipoNombre, rubrosList, insumosPorRubro }) => {
          const locked = isLocked(tipoId);
          return (
            <section
              key={tipoId}
              className="rounded-2xl border shadow-sm overflow-hidden transition-colors"
              style={{ borderColor: "var(--frame)", backgroundColor: "#FFFFFF" }}
            >
              <header
                className="px-3 sm:px-4 py-3 border-b flex flex-wrap gap-2 items-center justify-between transition-colors"
                style={{
                  backgroundColor: locked ? VERDE_OSCURO : headerStyle.backgroundColor,
                  color: locked ? TEXTO_SOBRE_VERDE : headerStyle.color,
                  borderBottomColor: "var(--frame)",
                  borderLeft: locked ? `6px solid ${VERDE_OSCURO}` : "6px solid var(--accent, #D9C4A6)",
                }}
              >
                <h3 className="font-medium text-base sm:text-lg">
                  {tipoNombre} {isEditMode && <span className="opacity-80 text-xs">(edición)</span>}
                </h3>
                <span
                  className="hidden sm:inline-block text-xs px-2 py-1 rounded-full"
                  style={{
                    background: locked ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.04)",
                    color: locked ? TEXTO_SOBRE_VERDE : "inherit",
                  }}
                >
                  Disponible
                </span>
              </header>

              <div className="p-2 sm:p-4 bg-white">
                <RubroListSucursal
                  rubros={rubrosList}
                  insumosHabPorRubro={insumosPorRubro}
                  sucursalId={sucursalId}
                  sucursalInsumo={sucursalInsumo}
                  unidades={unidades}
                  disabled={locked}
                  currentTipoStockId={Number(tipoId)}
                />
              </div>

              <div className="px-3 sm:px-4 py-3 border-t flex flex-col sm:flex-row gap-2 sm:justify-end" style={{ borderColor: "var(--frame)" }}>
                {!locked ? (
                  <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={() => toggleLock(tipoId, true)}>
                    Guardar
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm w-full sm:w-auto" onClick={() => toggleLock(tipoId, false)}>
                    Cancelar
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* ----- EXTRAS ----- */}
      <section
        className="rounded-2xl border shadow-sm overflow-hidden transition-colors"
        style={{ borderColor: "var(--frame)", backgroundColor: "#FFFFFF" }}
      >
        {(() => {
          const locked = isLocked("extras");
          return (
            <header
              className="px-3 sm:px-4 py-3 border-b flex flex-wrap gap-2 items-center justify-between transition-colors"
              style={{
                backgroundColor: locked ? VERDE_OSCURO : headerStyle.backgroundColor,
                color: locked ? TEXTO_SOBRE_VERDE : headerStyle.color,
                borderBottomColor: "var(--frame)",
                borderLeft: locked ? `6px solid ${VERDE_OSCURO}` : "6px solid var(--accent, #D9C4A6)",
              }}
            >
              <h3 className="font-medium text-base sm:text-lg">Extras</h3>
              <div className="flex items-center gap-2">
                {!locked && !isEditMode && (
                  <button className="btn btn-outline btn-sm w-full sm:w-auto" onClick={() => setExtrasModalOpen(true)}>
                    Agregar insumos
                  </button>
                )}
              </div>
            </header>
          );
        })()}

        <div className="p-2 sm:p-4 bg-white">
          {extrasInsumos.length === 0 ? (
            <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
              No hay insumos en Extras. {isEditMode ? " " : "Usá “Agregar insumos”."}
            </div>
          ) : (
            <RubroListSucursal
              rubros={extrasRubrosList}
              insumosHabPorRubro={extrasInsumosPorRubro}
              sucursalId={sucursalId}
              sucursalInsumo={sucursalInsumo}
              unidades={unidades}
              disabled={isLocked("extras")}
              currentTipoStockId={EXTRA_ID /* si “Extras” tiene ID real, actualizá esto */}
            />
          )}
        </div>

        <div className="px-3 sm:px-4 py-3 border-t flex flex-col sm:flex-row gap-2 sm:justify-end" style={{ borderColor: "var(--frame)" }}>
          {!isLocked("extras") ? (
            <>
              {extrasInsumos.length > 0 && !isEditMode && (
                <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={() => toggleLock("extras", true)}>
                  Guardar
                </button>
              )}
            </>
          ) : (
            <button className="btn btn-outline btn-sm w-full sm:w-auto" onClick={() => toggleLock("extras", false)}>
              Cancelar
            </button>
          )}
        </div>
      </section>

      {/* Enviar / Actualizar */}
      <div className="sticky bottom-3 md:static">
        <div className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:bg-transparent rounded-xl md:rounded-none shadow-md md:shadow-none p-2 md:p-0 border md:border-0" style={{ borderColor: "var(--frame)" }}>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              className="btn btn-primary w-full sm:w-auto"
              onClick={handleEnviar}
              title={isEditMode ? "Guardar cambios" : "Enviar"}
              aria-label={isEditMode ? "Guardar cambios" : "Enviar pedido"}
            >
              {isEditMode ? "Guardar cambios" : "Enviar"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL Extras */}
      <Modal
        open={extrasModalOpen}
        onClose={() => {
          setExtrasModalOpen(false);
          setExtrasSeleccion(new Set());
        }}
        title="Agregar insumos a Extras"
      >
        {candidatosExtras.length === 0 ? (
          <div className="text-sm" style={{ color: "var(--graphite)" }}>
            No hay insumos disponibles (todos pertenecen a tipos habilitados hoy).
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs sm:text-sm" style={{ color: "var(--graphite)" }}>
              Mostrando insumos de la sucursal cuyo tipo no está habilitado hoy.
            </div>

            {/* 👇 Contenedor sin scroll horizontal en mobile */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--frame)" }}>
              <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden">
                <table className="min-w-full table-auto text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2 text-left w-8">
                        <span className="sr-only">Sel</span>
                      </th>
                      <th className="px-2 py-2 text-left">Nombre</th>
                      <th className="px-2 py-2 text-left">Rubro</th>
                      <th className="px-2 py-2 text-left">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatosExtras.map((i, idx) => {
                      const rubro = rubros.find((r) => Number(r.id) === Number(i.rubro_id));
                      const unidad =
                        i?.unidad?.nombre ??
                        unidades.find(
                          (u) =>
                            Number(u.id) ===
                            Number(i.unidadDeMedida_id || i.unidadMedida_id || i.unidad_id || i.unidadId)
                        )?.nombre ?? "—";
                      const checked = extrasSeleccion.has(Number(i.id));
                      return (
                        <tr
                          key={i.id}
                          className="align-top hover:bg-gray-50/60"
                          style={{ borderBottom: idx === candidatosExtras.length - 1 ? "none" : "1px solid rgba(229,231,235,0.5)" }}
                        >
                          <td className="px-2 py-2">
                            <input
                              aria-label={`Seleccionar ${i?.nombre}`}
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSeleccion(Number(i.id))}
                              className="h-4 w-4"
                            />
                          </td>

                          {/* 👇 Evitar overflow: permitir corte de palabra y múltiples líneas */}
                          <td className="px-2 py-2 break-words">
                            <div className="max-w-[12rem] sm:max-w-none leading-snug">{i?.nombre}</div>
                          </td>

                          <td className="px-2 py-2 break-words">
                            <div className="max-w-[10rem] sm:max-w-none leading-snug">{rubro?.nombre ?? "—"}</div>
                          </td>

                          <td className="px-2 py-2 break-words">
                            <div className="max-w-[8rem] sm:max-w-none leading-snug">{unidad}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                className="btn btn-primary btn-sm w-full sm:w-auto"
                onClick={agregarSeleccionadosAExtras}
                disabled={extrasSeleccion.size === 0}
                title={extrasSeleccion.size ? "Agregar seleccionados" : "Seleccioná al menos uno"}
              >
                Agregar seleccionados{extrasSeleccion.size ? ` (${extrasSeleccion.size})` : ""}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ModalAviso
        open={aviso.open}
        onClose={cerrarAviso}
        title={aviso.title}
        message={aviso.message}
        type={aviso.type}
      />
    </div>
  );
}

/* ---------- Wrapper con chequeo HOY/AYER + Modo edición ---------- */
export default function TipoStockListSucursal(props) {
  const {
    sucursalId,
    tiposIds: tiposIdsHoyProp = [],
    getTiposIdsByDate,
    pedidoId, // 👈 NEW (opcional). Si viene, activamos modo edición
  } = props;

  const isEditMode = Boolean(pedidoId);

  const [cargando, setCargando] = useState(true);
  const [pedidoHoy, setPedidoHoy] = useState(false);
  const [pedidoAyer, setPedidoAyer] = useState(false);

  const [targetDate, setTargetDate] = useState(() => new Date());
  const [tiposIdsTarget, setTiposIdsTarget] = useState(tiposIdsHoyProp);
  const [pedidoLoaded, setPedidoLoaded] = useState(null); // 👈 NEW

  const checkPedidoEnFecha = async (date) => {
    const arr = await getPedido();
    const list = Array.isArray(arr) ? arr : [];
    return list.some((p) => {
      if (Number(p?.sucursal_id) !== Number(sucursalId)) return false;
      const d = new Date(p?.fecha);
      return Number.isFinite(d.getTime()) && sameLocalDay(d, date);
    });
  };

  const refreshEstadoPedidos = async () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const [existeHoy, existeAyer] = await Promise.all([
      checkPedidoEnFecha(hoy),
      checkPedidoEnFecha(ayer),
    ]);
    setPedidoHoy(!!existeHoy);
    setPedidoAyer(!!existeAyer);
  };

  const cargarHoy = () => {
    if (isEditMode) return; // en edición no cambiamos fecha
    setTargetDate(new Date());
    setTiposIdsTarget(Array.isArray(tiposIdsHoyProp) ? tiposIdsHoyProp : []);
  };

  const cargarAyer = async () => {
    if (isEditMode) return; // en edición no cambiamos fecha
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    if (pedidoAyer) return;
    const ids = typeof getTiposIdsByDate === "function" ? await getTiposIdsByDate(ayer) : [];
    setTargetDate(ayer);
    setTiposIdsTarget(Array.isArray(ids) ? ids : []);
  };

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        setCargando(true);

        if (isEditMode) {
          // 1) Traemos el pedido a editar
          const p = await getPedidoById(pedidoId);
          if (!p) throw new Error("No se encontró el pedido.");
          setPedidoLoaded(p);

          // 2) Fijamos fecha del pedido
          const fecha = new Date(p.fecha);
          setTargetDate(fecha);

          // 3) Tipos habilitados en esa fecha
          if (typeof getTiposIdsByDate === "function") {
            const ids = await getTiposIdsByDate(fecha);
            setTiposIdsTarget(Array.isArray(ids) ? ids : []);
          } else {
            // fallback: dejamos los de hoy si no hay función para esa fecha
            setTiposIdsTarget(Array.isArray(tiposIdsHoyProp) ? tiposIdsHoyProp : []);
          }

          // En edición el aviso de “pedido ya realizado” no aplica, pero igual refrescamos estado para consistencia
          await refreshEstadoPedidos();
        } else {
          // Flujo normal (crear)
          await refreshEstadoPedidos();
          setTargetDate(new Date());
          setTiposIdsTarget(Array.isArray(tiposIdsHoyProp) ? tiposIdsHoyProp : []);
        }
      } finally {
        setCargando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sucursalId, pedidoId]);

  if (cargando) {
    return (
      <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--frame)" }}>
        {isEditMode ? "Cargando pedido para editar…" : "Cargando disponibilidad…"}
      </div>
    );
  }

  const esHoy = sameLocalDay(targetDate, new Date());
  const tiposIdsParaRender = isEditMode ? tiposIdsTarget : (esHoy ? tiposIdsHoyProp : tiposIdsTarget);

  /* 🕒 NUEVO: bloqueo horario para "Hoy"
     - No disponible entre 00:00 y 12:59.
     - Muestra aviso y permite ir a "Día anterior" si corresponde.
  */
  if (!isEditMode && esHoy) {
    const ahora = new Date();
    const hora = ahora.getHours(); // hora local del navegador
    const bloqueoHorario = hora < 13; // 0–12 => bloqueado
    if (bloqueoHorario) {
      return (
        <div className="space-y-3">
          <div
            className="rounded-xl border p-4 text-center text-sm sm:text-base"
            style={{ borderColor: "var(--frame)", background: "#FFF" }}
          >
            <strong>⏰ El stock de Hoy estará disponible a partir de las 13:00.</strong>
            <div className="mt-1 text-xs sm:text-sm" style={{ color: "var(--graphite)" }}>
              Podés volver más tarde o cargar el <b>día anterior</b>.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-center">
            <button
              className="btn btn-primary btn-sm w-full sm:w-auto"
              onClick={cargarAyer}
              disabled={pedidoAyer}
              title={pedidoAyer ? "Ya existe un pedido en la fecha de ayer" : "Cargar tipos del día anterior"}
            >
              Día anterior
            </button>
          </div>
        </div>
      );
    }
  }

  // En edición NO mostramos los avisos de “ya realizado” ni el CTA para ir a ayer
  if (!isEditMode) {
    if (esHoy && pedidoHoy) {
      return (
        <div className="space-y-3">
          <div
            className="rounded-xl border p-4 text-center text-sm sm:text-base"
            style={{ borderColor: "var(--frame)", background: "#FFF" }}
          >
            <strong>El stock del día ya ha sido realizado</strong>
          </div>

          {!pedidoAyer && (
            <div
              className="rounded-xl border p-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between"
              style={{ borderColor: "var(--frame)", background: "#FFF" }}
            >
              <span className="text-sm">
                ¿Querés cargar el <strong>día anterior</strong> (
                {new Date(Date.now() - 86400000).toLocaleDateString()})?
              </span>
              <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={cargarAyer}>
                Cargar día anterior
              </button>
            </div>
          )}
        </div>
      );
    }

    if (!esHoy && pedidoAyer) {
      return (
        <div className="space-y-3">
          <div
            className="rounded-xl border p-4 text-center text-sm sm:text-base"
            style={{ borderColor: "var(--frame)", background: "#FFF" }}
          >
            <strong>El stock de esta fecha ya ha sido realizado</strong>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 sm:items-center">
            <button className="btn btn-outline btn-sm w-full sm:w-auto" onClick={cargarHoy}>
              Volver a hoy
            </button>

            <button className="btn btn-sm w-full sm:w-auto" disabled title="Ya existe un pedido en esta fecha">
              Día anterior
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <PedidoProvider
      key={`${new Date(targetDate).toDateString()}${isEditMode ? `-edit-${pedidoId}` : ""}`}
      sucursalId={sucursalId}
      initialDateISO={targetDate.toISOString()}
    >
      {/* Selector superior */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          className={`btn btn-sm ${esHoy ? "btn-primary" : "btn-outline"}`}
          onClick={cargarHoy}
          type="button"
          disabled={isEditMode}
          title={isEditMode ? "No disponible en modo edición" : "Ir a hoy"}
        >
          Hoy
        </button>

        <button
          className={`btn btn-sm ${!esHoy ? "btn-primary" : "btn-outline"}`}
          onClick={cargarAyer}
          type="button"
          disabled={isEditMode || pedidoAyer}
          title={
            isEditMode
              ? "No disponible en modo edición"
              : (pedidoAyer ? "Ya existe un pedido en la fecha de ayer" : "Cargar tipos del día anterior")
          }
        >
          Día anterior
        </button>

        <span className="text-sm ml-2">
          {isEditMode ? (
            <>Editando pedido <strong>#{pedidoId}</strong> — Fecha: <strong>{targetDate.toLocaleDateString()}</strong></>
          ) : (
            !esHoy && <>Trabajando en: <strong>{targetDate.toLocaleDateString()}</strong></>
          )}
        </span>
      </div>

      <TipoStockContent
        {...props}
        tiposIds={tiposIdsParaRender}
        isEditMode={isEditMode}         // 👈 NEW
        pedidoLoaded={pedidoLoaded}     // 👈 NEW
        onPedidoEnviado={async () => {
          // Actualiza estados después de enviar/actualizar
          await refreshEstadoPedidos();
          if (!isEditMode) {
            const esAunHoy = sameLocalDay(targetDate, new Date());
            if (esAunHoy) setPedidoHoy(true);
            else setPedidoAyer(true);
          }
        }}
      />
    </PedidoProvider>
  );
}
