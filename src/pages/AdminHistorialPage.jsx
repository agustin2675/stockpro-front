// src/pages/AdminHistorialPage.jsx
import { useEffect, useMemo, useState } from "react";

// Acciones compactas (igual que en Historial*)
import ActionCellCompact from "../components/ActionCellCompact.jsx";

// Services reales (mismo patrón que en las vistas de historial)
import { getSucursales } from "../services/sucursalService";
import { getPedido, getPedidoById, desactivarPedido  } from "../services/pedidoService";
import { getInsumos } from "../services/insumoService";
import { getRubro } from "../services/rubroService";
import { getTipoStock } from "../services/tipoStockService";
import { getUnidadesMedida } from "../services/unidadMedidaService";

export default function AdminHistorialPage() {
  // Data
  const [sucursales, setSucursales] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // UI state
  const [sucursalId, setSucursalId] = useState(null);
  const [modo, setModo] = useState("stock"); // "stock" | "pedido"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // En tu mock: 6 = stock, 5 = pedido
  const tipoFiltroId = useMemo(() => (modo === "stock" ? 6 : 5), [modo]);

  // Carga inicial (sucursales + pedidos + catálogos)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [sucs, peds, i, r, t, u] = await Promise.all([
          getSucursales(),
          getPedido(),          // cabeceras (sin detalle)
          getInsumos(),
          getRubro(),
          getTipoStock(),
          getUnidadesMedida(),
        ]);

        setSucursales(Array.isArray(sucs) ? sucs : []);
        setPedidos(Array.isArray(peds) ? peds : []);
        setInsumos(Array.isArray(i) ? i : []);
        setRubros(Array.isArray(r) ? r : []);
        setTipos(Array.isArray(t) ? t : []);
        setUnidades(Array.isArray(u) ? u : []);

        if (!sucursalId && Array.isArray(sucs) && sucs.length) {
          setSucursalId(Number(sucs[0].id));
        }
      } catch (e) {
        console.error("Error cargando AdminHistorialPage:", e);
        setError("No se pudieron cargar los datos.");
        setSucursales([]);
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers de lookup (idénticos a los historiales)
  const insumoById = useMemo(() => {
    const m = new Map();
    for (const x of insumos) m.set(Number(x.id), x);
    return m;
  }, [insumos]);

  const rubroNombre   = (id) => rubros.find(r => Number(r.id) === Number(id))?.nombre ?? "—";
  const tipoNombre    = (id) => tipos.find(t => Number(t.id) === Number(id))?.nombre ?? `Tipo ${id}`;
  const unidadNombre  = (id) => unidades.find(u => Number(u.id) === Number(id))?.nombre ?? "—";

  // Filtrado por sucursal (+ tipo si el backend lo trae)
  const pedidosFiltrados = useMemo(() => {
    if (!Array.isArray(pedidos) || !sucursalId) return [];
    return pedidos
      .filter((p) => {
        const okSuc = Number(p.sucursal_id) === Number(sucursalId);
        const okTipo = p.tipoStock_id === undefined
          ? true
          : Number(p.tipoStock_id) === Number(tipoFiltroId);
        return okSuc && okTipo;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [pedidos, sucursalId, tipoFiltroId]);

  // Abrir modal -> traer detalle con ítems (igual a Historial*)
  const handleVisualizar = async (pedido) => {
    setLoadingDetalle(true);
    try {
      const pFull = await getPedidoById(pedido.id); // incluye detallePedidos
      setPedidoSeleccionado(pFull);
    } catch (e) {
      console.error("No se pudo cargar el detalle del pedido", e);
      setPedidoSeleccionado({ ...pedido, detallePedidos: [] });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleEliminar = async (pedidoId) => {
    await desactivarPedido(pedidoId);
    setPedidos((prev) => prev.filter((p) => Number(p.id) !== Number(pedidoId)));
    // Si justo estaba abierto en el modal, lo cierro
    setPedidoSeleccionado((sel) =>
      sel && Number(sel.id) === Number(pedidoId) ? null : sel
    );
  };

  // Estructura para el modal (Tipo → Rubro → Items)
  // - En "pedido": usa cantidadPedido y filtra > 0 (como HistorialPedidosView)
  // - En "stock": usa cantidadReal (como HistorialStockView)
  const dataModal = useMemo(() => {
    const p = pedidoSeleccionado;
    if (!p) return null;

    const detalles = Array.isArray(p.detallePedidos) ? p.detallePedidos : [];
    if (!detalles.length) return [];

    const esPedido = modo === "pedido";

    const base = esPedido
      ? detalles.filter(d => (d.cantidadPedido ?? 0) > 0).map(d => {
          const ins = insumoById.get(Number(d.insumo_id));
          const nombreInsumo = ins?.nombre ?? d?.insumo?.nombre ?? `Insumo ${d.insumo_id}`;
          const unidad = ins ? unidadNombre(ins.unidadDeMedida_id) : "—";
          const rubroId = ins?.rubro_id;
          return {
            tipoStock_id: d.tipoStock_id,
            tipoStockNombre: tipoNombre(d.tipoStock_id),
            rubro_id: rubroId,
            rubroNombre: rubroNombre(rubroId),
            nombre: nombreInsumo,
            unidad,
            cantidad: d.cantidadPedido ?? 0, // clave mostrada en UI
            labelCantidad: "Pedido",
          };
        })
      : detalles.map(d => {
          const ins = insumoById.get(Number(d.insumo_id));
          const nombreInsumo = ins?.nombre ?? d?.insumo?.nombre ?? `Insumo ${d.insumo_id}`;
          const unidad = ins ? unidadNombre(ins.unidadDeMedida_id) : "—";
          const rubroId = ins?.rubro_id;
          return {
            tipoStock_id: d.tipoStock_id,
            tipoStockNombre: tipoNombre(d.tipoStock_id),
            rubro_id: rubroId,
            rubroNombre: rubroNombre(rubroId),
            nombre: nombreInsumo,
            unidad,
            cantidad: d.cantidadReal ?? 0, // clave mostrada en UI
            labelCantidad: "Real",
          };
        });

    const porTipo = new Map();
    for (const item of base) {
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
  }, [pedidoSeleccionado, modo, insumoById, rubros, tipos, unidades]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl">Historial (Administrador)</h1>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Consultá el historial por sucursal.
        </p>
      </header>

      {/* Filtro sucursal */}
      <section className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="text-sm" style={{ color: "var(--graphite)" }}>
            Sucursal
          </label>
          <select
            className="input w-full sm:w-[240px]"
            value={sucursalId ?? ""}
            onChange={(e) => setSucursalId(Number(e.target.value))}
            disabled={loading || sucursales.length === 0}
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre ?? `Sucursal #${s.id}`}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Botones modo */}
      <section className="card p-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`btn ${modo === "stock" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setModo("stock")}
          >
            Historial de Stock
          </button>
          <button
            className={`btn ${modo === "pedido" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setModo("pedido")}
          >
            Historial de Pedido
          </button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-3">
          {modo === "stock" ? "Historial de Stock" : "Historial de Pedido"}
        </h2>

        {loading ? (
          <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
            Cargando…
          </div>
        ) : error ? (
          <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
            {error}
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
            No hay registros para esta sucursal.
          </div>
        ) : (
          <>
            {/* Desktop/Tablet */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#fafafa] text-sm" style={{ color: "var(--graphite)" }}>
                      <th className="border px-3 py-2 text-left w-1/2" style={{ borderColor: "var(--frame)" }}>Fecha</th>
                      <th className="border px-3 py-2 text-left w-1/2" style={{ borderColor: "var(--frame)" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((p) => (
                      <tr key={p.id} className="text-sm align-top">
                        <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                          {new Date(p.fecha).toLocaleString()}
                        </td>
                        <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                          <ActionCellCompact
                            onVisualizar={() => handleVisualizar(p)}
                            onImprimir={() => window.print()}
                            onEliminar={() => handleEliminar(p.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden space-y-2">
              {pedidosFiltrados.map((p) => (
                <div key={p.id} className="rounded-lg border bg-white" style={{ borderColor: "var(--frame)" }}>
                  <div className="p-3 border-b" style={{ borderColor: "var(--frame)" }}>
                    <div className="text-xs" style={{ color: "var(--graphite)" }}>Fecha</div>
                    <div className="font-medium">{new Date(p.fecha).toLocaleString()}</div>
                  </div>
                  <div className="p-3">
                    <ActionCellCompact
                      onVisualizar={() => handleVisualizar(p)}
                      onImprimir={() => window.print()}
                      onEliminar={() => handleEliminar(p.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Modal Visualizar (idéntico comportamiento a Historial*) */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPedidoSeleccionado(null)} />
          <div className="relative z-10 w-[95vw] max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--frame)" }}>
              <div>
                <h3 className="font-semibold">
                  {modo === "stock" ? "Stock" : "Pedido"} {pedidoSeleccionado.id}
                </h3>
                {/* <p className="text-sm" style={{ color: "var(--graphite)" }}>
                  {new Date(pedidoSeleccionado.fecha).toLocaleString()}
                </p> */}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Imprimir</button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-6">
              {loadingDetalle && <div className="text-sm" style={{ color: "var(--graphite)" }}>Cargando detalle…</div>}

              {!loadingDetalle && dataModal && dataModal.length > 0 && dataModal.map(({ tipo, rubros }) => (
                <div key={tipo} className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--frame)" }}>
                  <div className="px-4 py-2 text-sm font-semibold" style={{ background: "#F1EBDD", color: "var(--ink)" }}>
                    {tipo}
                  </div>

                  {rubros.map(({ rubro, items }) => (
                    <div key={rubro} className="border-t" style={{ borderColor: "var(--frame)" }}>
                      <div className="px-4 py-2 font-medium">{rubro}</div>

                      <div className="px-4 pb-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="text-xs" style={{ color: "var(--graphite)" }}>
                                <th className="border px-2 py-1 text-left w-1/2" style={{ borderColor: "var(--frame)" }}>Insumo</th>
                                <th className="border px-2 py-1 text-left w-1/4" style={{ borderColor: "var(--frame)" }}>Unidad</th>
                                <th className="border px-2 py-1 text-right w-1/4" style={{ borderColor: "var(--frame)" }}>
                                  {modo === "pedido" ? "Pedido" : "Real"}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((it, idx) => (
                                <tr key={idx} className="text-sm">
                                  <td className="border px-2 py-1" style={{ borderColor: "var(--frame)" }}>{it.nombre}</td>
                                  <td className="border px-2 py-1" style={{ borderColor: "var(--frame)" }}>{it.unidad}</td>
                                  <td className="border px-2 py-1 text-right" style={{ borderColor: "var(--frame)" }}>{it.cantidad}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {!loadingDetalle && dataModal && dataModal.length === 0 && (
                <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
                  No hay ítems para mostrar.
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--frame)" }}>
              <button className="btn btn-outline" onClick={() => setPedidoSeleccionado(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
