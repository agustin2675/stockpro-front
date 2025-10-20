// src/features/sucursal/PanelPedidos13a13.jsx
import { useEffect, useMemo, useState } from "react";
import ActionCellCompact from "../../components/ActionCellCompact.jsx";

// services
import {
  getPedido,
  getPedidoById,
  desactivarPedido,
  updatePedido,
  imprimirPedido,
} from "../../services/pedidoService";
import { getInsumos } from "../../services/insumoService";
import { getRubro } from "../../services/rubroService";
import { getTipoStock } from "../../services/tipoStockService";
import { getUnidadesMedida } from "../../services/unidadMedidaService";
import { getSucursales } from "../../services/sucursalService";

// contexto (para el modo edición dentro del modal)
import { usePedido } from "../../context/PedidoContext";

// 🔁 NUEVO: Rangos unidos (Ayer 00:00–12:59 y Hoy 13:00–23:59)
function rangosUnionAyerHoy(base = new Date()) {
  const baseLocal = new Date(base);

  // Normalizamos "hoy" 00:00
  const hoy00 = new Date(
    baseLocal.getFullYear(),
    baseLocal.getMonth(),
    baseLocal.getDate(),
    0, 0, 0, 0
  );

  const ayer00 = new Date(hoy00);
  ayer00.setDate(hoy00.getDate() - 1);

  // AYER 00:00 -> 12:59:59.999
  const ayerIni = new Date(ayer00);
  const ayer1259 = new Date(ayer00);
  ayer1259.setHours(12, 59, 59, 999);

  // HOY 13:00 -> 23:59:59.999
  const hoy13 = new Date(hoy00);
  hoy13.setHours(13, 0, 0, 0);
  const hoyFin = new Date(hoy00);
  hoyFin.setHours(23, 59, 59, 999);

  return { ayerIni, ayer1259, hoy13, hoyFin };
}

export default function PanelPedidos13a13() {
  const [pedidos, setPedidos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const { setHydrate, detallesMap, setCantidad } = usePedido();

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        const [p, i, r, t, u, s] = await Promise.all([
          getPedido(),
          getInsumos(),
          getRubro(),
          getTipoStock(),
          getUnidadesMedida(),
          getSucursales(),
        ]);
        setPedidos(Array.isArray(p) ? p : []);
        setInsumos(Array.isArray(i) ? i : []);
        setRubros(Array.isArray(r) ? r : []);
        setTipos(Array.isArray(t) ? t : []);
        setUnidades(Array.isArray(u) ? u : []);
        setSucursales(Array.isArray(s) ? s : []);
      } catch (e) {
        console.error("PanelPedidos13a13: error cargando datos:", e);
        setPedidos([]);
        setSucursales([]);
      }
    })();
  }, []);

  const insumoById = useMemo(() => {
    const m = new Map();
    for (const x of insumos) m.set(Number(x.id), x);
    return m;
  }, [insumos]);

  const rubroNombre = (id) =>
    rubros.find((r) => Number(r.id) === Number(id))?.nombre ?? "—";
  const tipoNombre = (id) =>
    tipos.find((t) => Number(t.id) === Number(id))?.nombre ?? `Tipo ${id}`;
  const unidadNombre = (id) =>
    unidades.find((u) => Number(u.id) === Number(id))?.nombre ?? "—";
  const sucursalNombre = (id) =>
    sucursales.find((s) => Number(s.id) === Number(id))?.nombre ??
    `Sucursal #${id}`;

  // ⏱️ Filtro por los dos rangos (ayer mañana + hoy tarde/noche)
  const { ayerIni, ayer1259, hoy13, hoyFin } = useMemo(() => rangosUnionAyerHoy(), []);
  const pedidosVentana = useMemo(() => {
    return (pedidos ?? [])
      .filter((p) => {
        const d = new Date(p.fecha);
        const esAyerManiana = d >= ayerIni && d <= ayer1259;
        const esHoyTardeNoche = d >= hoy13 && d <= hoyFin;
        return esAyerManiana || esHoyTardeNoche;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [pedidos, ayerIni, ayer1259, hoy13, hoyFin]);

  // Sucursales sin pedido en la ventana
  const sucursalesSinPedido = useMemo(() => {
    const setConPedido = new Set(
      pedidosVentana.map((p) => Number(p.sucursal_id))
    );
    return (sucursales ?? []).filter(
      (s) => !setConPedido.has(Number(s.id))
    );
  }, [sucursales, pedidosVentana]);

  // Acciones
  const handleEliminar = async (pedidoId) => {
    await desactivarPedido(pedidoId);
    setPedidos((prev) => prev.filter((p) => Number(p.id) !== Number(pedidoId)));
    setPedidoSeleccionado((sel) =>
      sel && Number(sel.id) === Number(pedidoId) ? null : sel
    );
  };

  const handleVisualizar = async (p) => {
    try {
      setLoadingDetalle(true);
      const full = await getPedidoById(p.id);
      setEditMode(false);
      setPedidoSeleccionado(full ?? p);
    } catch (e) {
      console.error("Error al visualizar:", e);
      setPedidoSeleccionado(p);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleModificar = async (p) => {
    try {
      setLoadingDetalle(true);
      const full = await getPedidoById(p.id);
      setHydrate({ detallePedidos: [] });
      if (full) {
        setHydrate(full);
        setPedidoSeleccionado(full);
      } else {
        setPedidoSeleccionado(p);
      }
      setEditMode(true);
    } catch (e) {
      console.error("Error al modificar:", e);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ====== Datos para el modal (misma estructura que HistorialStockView) ======
  const dataModal = useMemo(() => {
    const p = pedidoSeleccionado;
    if (!p) return [];
    const detalles = Array.isArray(p.detallePedidos) ? p.detallePedidos : [];
    if (!detalles.length) return [];

    const detallesEnriquecidos = detalles.map((d) => {
      const ins = insumoById.get(Number(d.insumo_id));
      const nombreInsumo =
        ins?.nombre ?? d?.insumo?.nombre ?? `Insumo ${d.insumo_id}`;
      const unidad = ins ? unidadNombre(ins.unidadDeMedida_id) : "—";
      const rubroId = ins?.rubro_id;

      const cantidadReal = Number(d.cantidadReal ?? 0);
      const cantidadPedidoEntidad =
        d.cantidadPedido != null ? Number(d.cantidadPedido) : null;

      const cantidadIdeal =
        d.cantidadIdeal != null
          ? Number(d.cantidadIdeal)
          : (cantidadPedidoEntidad != null
              ? cantidadReal + cantidadPedidoEntidad
              : cantidadReal);

      return {
        insumo_id: d.insumo_id,
        tipoStock_id: d.tipoStock_id,
        tipoStockNombre: tipoNombre(d.tipoStock_id),
        rubro_id: rubroId,
        rubroNombre: rubroNombre(rubroId),
        nombre: nombreInsumo,
        unidad,
        cantidadReal,
        cantidadIdeal,
        cantidadPedido: cantidadPedidoEntidad,
      };
    });

    const porTipo = new Map();
    for (const item of detallesEnriquecidos) {
      const k1 = item.tipoStockNombre;
      if (!porTipo.has(k1)) porTipo.set(k1, new Map());
      const byRubro = porTipo.get(k1);
      const k2 = item.rubroNombre;
      if (!byRubro.has(k2)) byRubro.set(k2, []);
      byRubro.get(k2).push(item);
    }

    return Array.from(porTipo.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tipo, byRubro]) => ({
        tipo,
        rubros: Array.from(byRubro.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([rubro, items]) => ({
            rubro,
            items: items.sort((a, b) => a.nombre.localeCompare(b.nombre)),
          })),
      }));
  }, [pedidoSeleccionado, insumoById, rubros, tipos, unidades]);

  const buildFullPayloadFromSeleccionado = (pedidoSel, detallesMap) => {
    const detalles = Array.isArray(pedidoSel?.detallePedidos)
      ? pedidoSel.detallePedidos.map((d) => {
          const row = detallesMap?.[Number(d.insumo_id)];
          const cantidadReal = Number(row?.cantidadReal ?? d.cantidadReal ?? 0);
          const cantidadIdeal = Number(row?.cantidadIdeal ?? d.cantidadIdeal ?? 0);
          const cantidadPedido = Math.max(0, cantidadIdeal - cantidadReal);
          return {
            insumo_id: d.insumo_id,
            tipoStock_id: d.tipoStock_id,
            cantidadReal,
            cantidadIdeal,
            cantidadPedido,
          };
        })
      : [];
    return { detalles };
  };

  const handleGuardarCambios = async () => {
    try {
      if (!pedidoSeleccionado?.id) return;
      const id = pedidoSeleccionado.id;
      const payload = buildFullPayloadFromSeleccionado(
        pedidoSeleccionado,
        detallesMap
      );
      await updatePedido(id, payload);
      const refreshed = await getPedidoById(id);
      setEditMode(false);
      setHydrate({ detallePedidos: [] });
      setPedidoSeleccionado(refreshed);
    } catch (e) {
      console.error("Error al guardar cambios:", e);
    }
  };

  const handleKeyDownReplaceZero =
    (insumoId, tipoStockId, campo) => (e) => {
      const key = e.key;
      if (!/^[0-9]$/.test(key)) return;
      const valActual = detallesMap?.[insumoId]?.[campo];
      const current = String(valActual ?? 0);
      if (current === "0") {
        e.preventDefault();
        setCantidad(insumoId, tipoStockId, campo, Number(key));
      }
    };

  return (
    <section className="card p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Pedidos entre 13:00 (ayer) y 13:00 (hoy)</h2>
        {/* Texto de ventana actualizado para reflejar la nueva regla */}
        <div className="text-sm" style={{ color: "var(--graphite)" }}>
          Ventana: Ayer 00:00–12:59 y Hoy 13:00–23:59
        </div>
      </div>

      {/* Alertas de faltantes por sucursal */}
      {sucursalesSinPedido.length > 0 && (
        <div className="mt-3 space-y-1">
          {sucursalesSinPedido.map((s) => (
            <div
              key={s.id}
              className="rounded-md px-3 py-2 text-sm"
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              }}
            >
              Falta el pedido de la sucursal <strong>{s.nombre ?? `#${s.id}`}</strong>
            </div>
          ))}
        </div>
      )}

      {/* Tabla (desktop) */}
      <div className="hidden sm:block mt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-sm" style={{ color: "var(--graphite)" }}>
                <th className="border px-3 py-2 text-left w-[35%]" style={{ borderColor: "var(--frame)" }}>Fecha</th>
                <th className="border px-3 py-2 text-left w-[25%]" style={{ borderColor: "var(--frame)" }}>Sucursal</th>
                <th className="border px-3 py-2 text-left w-[15%]" style={{ borderColor: "var(--frame)" }}>Hora</th>
                <th className="border px-3 py-2 text-left" style={{ borderColor: "var(--frame)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosVentana.map((p) => {
                const d = new Date(p.fecha);
                return (
                  <tr key={p.id} className="text-sm align-top">
                    <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                      {d.toLocaleDateString()}
                    </td>
                    <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                      {sucursalNombre(p.sucursal_id)}
                    </td>
                    <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                      {d.toLocaleTimeString()}
                    </td>
                    <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                      <ActionCellCompact
                        onVisualizar={() => handleVisualizar(p)}
                        onImprimir={() => imprimirPedido(p.id)}
                        onEliminar={() => handleEliminar(p.id)}
                        onModificar={() => handleModificar(p)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards (mobile) */}
      <div className="sm:hidden space-y-2 mt-4">
        {pedidosVentana.map((p) => {
          const d = new Date(p.fecha);
          return (
            <div key={p.id} className="rounded-lg border bg-white" style={{ borderColor: "var(--frame)" }}>
              <div className="p-3 border-b" style={{ borderColor: "var(--frame)" }}>
                <div className="text-xs" style={{ color: "var(--graphite)" }}>Sucursal</div>
                <div className="font-medium">{sucursalNombre(p.sucursal_id)}</div>
              </div>
              <div className="p-3">
                <div className="text-sm mb-2">
                  <div><span className="text-gray-600">Fecha:</span> {d.toLocaleDateString()}</div>
                  <div><span className="text-gray-600">Hora:</span> {d.toLocaleTimeString()}</div>
                </div>
                <ActionCellCompact
                  onVisualizar={() => handleVisualizar(p)}
                  onImprimir={() => imprimirPedido(p.id)}
                  onEliminar={() => handleEliminar(p.id)}
                  onModificar={() => handleModificar(p)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ver/Editar (idéntico patrón a HistorialStockView) */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setPedidoSeleccionado(null);
              setEditMode(false);
              setHydrate({ detallePedidos: [] });
            }}
          />
          <div
            className="relative z-10 w-full max-w-3xl mx-3 rounded-2xl bg-white shadow-xl border overflow-hidden"
            style={{ borderColor: "var(--frame)" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b bg-white z-10" style={{ borderColor: "var(--frame)" }}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold">
                  {editMode ? `Editar pedido ${pedidoSeleccionado.id}` : `Stock ${pedidoSeleccionado.id}`}
                </h3>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditMode((v) => !v)}
                    title={editMode ? "Volver a lectura" : "Editar este pedido"}
                  >
                    {editMode ? "Modo lectura" : "Editar"}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setPedidoSeleccionado(null);
                      setEditMode(false);
                      setHydrate({ detallePedidos: [] });
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="max-h-[70vh] overflow-y-auto px-4 py-4 space-y-6 overflow-x-hidden">
              {loadingDetalle && (
                <div className="text-sm" style={{ color: "var(--graphite)" }}>
                  Cargando detalle…
                </div>
              )}

              {/* Desktop: acordeones y tabla interna */}
              <div className="hidden sm:block space-y-3">
                {dataModal.map(({ tipo, rubros }) => (
                  <details
                    key={`d-${tipo}`}
                    className="group rounded-xl border overflow-hidden"
                    style={{ borderColor: "var(--frame)" }}
                    open
                  >
                    <summary className="flex items-center gap-3 px-4 py-2 cursor-pointer select-none bg-[#EFE8DC]">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white group-open:hidden">
                        +
                      </span>
                      <span className="hidden group-open:inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white">
                        −
                      </span>
                      <span className="font-semibold">{tipo}</span>
                    </summary>

                    <div className="divide-y" style={{ borderColor: "var(--frame)" }} open>
                      {rubros.map(({ rubro, items }) => (
                        <details key={`d-${tipo}-${rubro}`} className="group/rubro" open>
                          <summary className="flex items-center gap-3 px-4 py-2 cursor-pointer select-none">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white group-open/rubro:hidden">
                              +
                            </span>
                            <span className="hidden group-open/rubro:inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white">
                              −
                            </span>
                            <span className="font-medium">{rubro}</span>
                          </summary>

                          <div className="px-4 pb-3">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="border px-3 py-2 text-left" style={{ borderColor: "var(--frame)" }}>Nombre</th>
                                    <th className="border px-3 py-2 text-left w-24" style={{ borderColor: "var(--frame)" }}>Unidad</th>
                                    <th className="border px-3 py-2 text-right w-24" style={{ borderColor: "var(--frame)" }}>Real</th>
                                    <th className="border px-3 py-2 text-right w-24" style={{ borderColor: "var(--frame)" }}>Ideal</th>
                                    <th className="border px-3 py-2 text-right w-24" style={{ borderColor: "var(--frame)" }}>Pedido</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((it, idx) => {
                                    const insumoId = Number(it.insumo_id ?? it.insumoId);
                                    const tipoStockId = Number(it.tipoStock_id ?? it.tipoStockId);
                                    const ctxRow = detallesMap?.[insumoId];
                                    const real = Number(ctxRow?.cantidadReal ?? it.cantidadReal ?? 0);
                                    const ideal = Number(ctxRow?.cantidadIdeal ?? it.cantidadIdeal ?? 0);
                                    const pedidoMostrar =
                                      it.cantidadPedido != null ? Number(it.cantidadPedido) : Math.max(0, ideal - real);
                                    const editable = editMode && Number.isFinite(insumoId) && Number.isFinite(tipoStockId);

                                    return (
                                      <tr key={`${rubro}-${idx}`} className="text-sm">
                                        <td className="border px-3 py-2 break-words" style={{ borderColor: "var(--frame)" }}>
                                          {it.nombre}
                                        </td>
                                        <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>{it.unidad}</td>
                                        <td className="border px-3 py-2 text-right" style={{ borderColor: "var(--frame)" }}>
                                          {editable ? (
                                            <input
                                              type="number"
                                              inputMode="numeric"
                                              className="input w-24 text-right"
                                              value={real}
                                              onKeyDown={handleKeyDownReplaceZero(insumoId, tipoStockId, "cantidadReal")}
                                              onChange={(e) =>
                                                setCantidad(insumoId, tipoStockId, "cantidadReal", e.target.value)
                                              }
                                            />
                                          ) : (
                                            <span>{real}</span>
                                          )}
                                        </td>
                                        <td className="border px-3 py-2 text-right" style={{ borderColor: "var(--frame)" }}>
                                          {editable ? (
                                            <input
                                              type="number"
                                              inputMode="numeric"
                                              className="input w-24 text-right"
                                              value={ideal}
                                              onKeyDown={handleKeyDownReplaceZero(insumoId, tipoStockId, "cantidadIdeal")}
                                              onChange={(e) =>
                                                setCantidad(insumoId, tipoStockId, "cantidadIdeal", e.target.value)
                                              }
                                            />
                                          ) : (
                                            <span>{ideal}</span>
                                          )}
                                        </td>
                                        <td className="border px-3 py-2 text-right" style={{ borderColor: "var(--frame)" }}>
                                          <span title="si existe en BD: cantidadPedido; si no: ideal - real (no negativo)">
                                            {pedidoMostrar}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              {/* Mobile: tarjetas */}
              <div className="sm:hidden space-y-4">
                {dataModal.map(({ tipo, rubros }) => (
                  <details
                    key={`m-${tipo}`}
                    className="group rounded-xl border bg-white overflow-hidden"
                    style={{ borderColor: "var(--frame)" }}
                    open
                  >
                    <summary className="flex items-center gap-3 px-3 py-2 cursor-pointer select-none bg-[#EFE8DC]">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white group-open:hidden"
                        style={{ borderColor: "var(--frame)" }}
                      >
                        +
                      </span>
                      <span
                        className="hidden group-open:inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white"
                        style={{ borderColor: "var(--frame)" }}
                      >
                        −
                      </span>
                      <span className="font-semibold">{tipo}</span>
                    </summary>

                    <div className="divide-y" style={{ borderColor: "var(--frame)" }}>
                      {rubros.map(({ rubro, items }) => (
                        <details key={`m-${tipo}-${rubro}`} className="group/rubro" open>
                          <summary className="flex items-center gap-3 px-3 py-2 cursor-pointer select-none">
                            <span
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white group-open/rubro:hidden"
                              style={{ borderColor: "var(--frame)" }}
                            >
                              +
                            </span>
                            <span
                              className="hidden group-open/rubro:inline-flex h-7 w-7 items-center justify-center rounded-lg border text-base font-medium bg-white"
                              style={{ borderColor: "var(--frame)" }}
                            >
                              −
                            </span>
                            <span className="font-medium">{rubro}</span>
                          </summary>

                          <div className="space-y-3 px-3 pb-3">
                            {items.map((it) => {
                              const insumoId = Number(it.insumo_id);
                              const tipoStockId = Number(it.tipoStock_id);
                              const ctxRow = detallesMap?.[insumoId];
                              const real = Number(ctxRow?.cantidadReal ?? it.cantidadReal ?? 0);
                              const ideal = Number(ctxRow?.cantidadIdeal ?? it.cantidadIdeal ?? 0);
                              const pedidoMostrar =
                                it.cantidadPedido != null ? Number(it.cantidadPedido) : Math.max(0, ideal - real);
                              const editable = editMode;

                              return (
                                <article
                                  key={`card-${insumoId}`}
                                  className="rounded-lg border p-3 space-y-2"
                                  style={{ borderColor: "var(--frame)" }}
                                >
                                  <div className="font-medium text-[15px] leading-snug break-words">{it.nombre}</div>
                                  <div className="text-xs text-gray-600">Unidad: {it.unidad}</div>

                                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-xs text-gray-600 block mb-1" htmlFor={`real-${insumoId}`}>
                                        Real
                                      </label>
                                      {editable ? (
                                        <input
                                          id={`real-${insumoId}`}
                                          type="number"
                                          inputMode="numeric"
                                          className="input w-full text-right"
                                          value={real}
                                          onKeyDown={handleKeyDownReplaceZero(insumoId, tipoStockId, "cantidadReal")}
                                          onChange={(e) =>
                                            setCantidad(insumoId, tipoStockId, "cantidadReal", e.target.value)
                                          }
                                        />
                                      ) : (
                                        <div className="text-right">{real}</div>
                                      )}
                                    </div>

                                    <div>
                                      <label className="text-xs text-gray-600 block mb-1" htmlFor={`ideal-${insumoId}`}>
                                        Ideal
                                      </label>
                                      {editable ? (
                                        <input
                                          id={`ideal-${insumoId}`}
                                          type="number"
                                          inputMode="numeric"
                                          className="input w-full text-right"
                                          value={ideal}
                                          onKeyDown={handleKeyDownReplaceZero(insumoId, tipoStockId, "cantidadIdeal")}
                                          onChange={(e) =>
                                            setCantidad(insumoId, tipoStockId, "cantidadIdeal", e.target.value)
                                          }
                                        />
                                      ) : (
                                        <div className="text-right">{ideal}</div>
                                      )}
                                    </div>

                                    <div>
                                      <div className="text-xs text-gray-600 mb-1">Pedido</div>
                                      <div className="text-right">{pedidoMostrar}</div>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t bg-white" style={{ borderColor: "var(--frame)" }}>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {editMode ? (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditMode(false)}>
                      Cancelar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleGuardarCambios}>
                      Guardar cambios
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setPedidoSeleccionado(null);
                      setHydrate({ detallePedidos: [] });
                    }}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
