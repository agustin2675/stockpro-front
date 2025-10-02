import { useEffect, useMemo, useState } from "react";
import ActionCellCompact from "../../components/ActionCellCompact.jsx";

// services
import { getPedido, getPedidoById, desactivarPedido  } from "../../services/pedidoService";
import { getInsumos } from "../../services/insumoService";
import { getRubro } from "../../services/rubroService";
import { getTipoStock } from "../../services/tipoStockService";
import { getUnidadesMedida } from "../../services/unidadMedidaService";

export default function HistorialStockView({ sucursalId}) {
  const [pedidos, setPedidos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, i, r, t, u] = await Promise.all([
          getPedido(),          // lista (sin detalle)
          getInsumos(),
          getRubro(),
          getTipoStock(),
          getUnidadesMedida(),
        ]);
        setPedidos(Array.isArray(p) ? p : []);
        setInsumos(Array.isArray(i) ? i : []);
        setRubros(Array.isArray(r) ? r : []);
        setTipos(Array.isArray(t) ? t : []);
        setUnidades(Array.isArray(u) ? u : []);
      } catch (e) {
        console.error("Error cargando historial/auxiliares:", e);
        setPedidos([]);
      }
    })();
  }, []);

  // helpers
  const insumoById = useMemo(() => {
    const m = new Map();
    for (const x of insumos) m.set(Number(x.id), x);
    return m;
  }, [insumos]);

  const rubroNombre = (id) => rubros.find(r => Number(r.id) === Number(id))?.nombre ?? "—";
  const tipoNombre  = (id) => tipos.find(t => Number(t.id) === Number(id))?.nombre ?? `Tipo ${id}`;
  const unidadNombre = (id) => unidades.find(u => Number(u.id) === Number(id))?.nombre ?? "—";

  // filtrar por sucursal y ordenar por fecha desc
  const pedidosSucursal = useMemo(() => {
    return (pedidos ?? [])
      .filter(p => Number(p.sucursal_id) === Number(sucursalId))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [pedidos, sucursalId]);

    // Eliminar un pedido y refrescar UI
  const handleEliminar = async (pedidoId) => {
    await desactivarPedido(pedidoId);
    setPedidos((prev) => prev.filter((p) => Number(p.id) !== Number(pedidoId)));
    // Si justo estaba abierto en el modal, lo cierro
    setPedidoSeleccionado((sel) =>
      sel && Number(sel.id) === Number(pedidoId) ? null : sel
    );
  };

  // agrupar por día (YYYY-MM-DD)
  const gruposPorFecha = useMemo(() => {
    const by = new Map();
    for (const p of pedidosSucursal) {
      const key = new Date(p.fecha).toISOString().slice(0, 10);
      if (!by.has(key)) by.set(key, []);
      by.get(key).push(p);
    }
    return Array.from(by.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, items]) => ({ key, items }));
  }, [pedidosSucursal]);

  // abrir modal -> primero traer el detalle del pedido
  const handleVisualizar = async (pedido) => {
    setLoadingDetalle(true);
    try {
      const pFull = await getPedidoById(pedido.id); // aquí vienen detallePedidos
      setPedidoSeleccionado(pFull);
    } catch (e) {
      console.error("No se pudo cargar el detalle del pedido", e);
      setPedidoSeleccionado({ ...pedido, detallePedidos: [] });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleModificar = (pedido) => {console.log(pedido)}
  // estructura para el modal (Tipo -> Rubro -> Items)
  const dataModal = useMemo(() => {
    const p = pedidoSeleccionado;
    if (!p) return null;

    const detalles = Array.isArray(p.detallePedidos) ? p.detallePedidos : [];
    if (!detalles.length) return [];

    const detallesEnriquecidos = detalles.map(d => {
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
        cantidadReal: d.cantidadReal ?? 0,
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

  if (!pedidosSucursal.length) {
    return (
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Historial de Stock</h2>
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
          No hay registros.
        </div>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold mb-3">Historial de Stock</h2>

      {/* Tabla desktop */}
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
              {gruposPorFecha.flatMap(g => g.items).map((p) => (
                <tr key={p.id} className="text-sm align-top">
                  <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                    {new Date(p.fecha).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>
                    <ActionCellCompact
                      onVisualizar={() => handleVisualizar(p)}
                      onImprimir={() => window.print()}
                      onEliminar={() => handleEliminar(p.id)}
                      onModificar={() => handleModificar(p)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards mobile */}
      <div className="sm:hidden space-y-2">
        {gruposPorFecha.flatMap(g => g.items).map((p) => (
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

      {/* Modal */}
      {(pedidoSeleccionado) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPedidoSeleccionado(null)} />
          <div className="relative z-10 w-[95vw] max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--frame)" }}>
              <div>
                <h3 className="font-semibold">Stock {pedidoSeleccionado.id}</h3>
                {/*<p className="text-sm" style={{ color: "var(--graphite)" }}>
                  {new Date(pedidoSeleccionado.fecha).toLocaleString()} — Estado: {pedidoSeleccionado.estado}
                </p>*/}
              </div>
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
                                <th className="border px-3 py-2 text-left" style={{ borderColor: "var(--frame)" }}>Nombre</th>
                                <th className="border px-3 py-2 text-left w-24" style={{ borderColor: "var(--frame)" }}>Unidad</th>
                                <th className="border px-3 py-2 text-right w-24" style={{ borderColor: "var(--frame)" }}>Real</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((it, idx) => (
                                <tr key={idx} className="text-sm">
                                  <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>{it.nombre}</td>
                                  <td className="border px-3 py-2" style={{ borderColor: "var(--frame)" }}>{it.unidad}</td>
                                  <td className="border px-3 py-2 text-right" style={{ borderColor: "var(--frame)" }}>{it.cantidadReal}</td>
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
                <div className="text-sm" style={{ color: "var(--graphite)" }}>
                  Este pedido no tiene ítems cargados.
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--frame)" }}>
              <button className="rounded-lg border px-3 py-1 text-sm" style={{ borderColor: "var(--frame)" }} onClick={() => setPedidoSeleccionado(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
