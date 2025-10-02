import { useMemo, useState } from "react";
import RubroAccordion from "./RubroAccordion.jsx";
import Modal from "../../components/Modal.jsx";
import ModalAgregarInsumo from "./ModalAgregarInsumo.jsx";

const DIAS = [
  { v: 1, t: "Lunes" },
  { v: 2, t: "Martes" },
  { v: 3, t: "Miércoles" },
  { v: 4, t: "Jueves" },
  { v: 5, t: "Viernes" },
  { v: 6, t: "Sábado" },
  { v: 0, t: "Domingo" },
];

export default function TipoStockAccordion({
  sucursalId,
  tiposStock = [],
  rubros = [],
  insumos = [],
  sucursalInsumo = [],
  tiposHabilitados = [],
  tiposNoHabilitados = [],
  onAgregarTipo,
  onQuitarTipo,
  getDiasTipo,
  setDiasTipo,
  onQuitarInsumo,
  onAddedSucursalInsumo,
  onEditedSucursalInsumo,
}) {
  const [openTipos, setOpenTipos] = useState(new Set());
  const toggleTipo = (tipoId) => {
    setOpenTipos((prev) => {
      const next = new Set(prev);
      next.has(tipoId) ? next.delete(tipoId) : next.add(tipoId);
      return next;
    });
  };

  /* ===== Modal DÍAS ===== */
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoEnModal, setTipoEnModal] = useState(null);
  const [tempDias, setTempDias] = useState(new Set());

  const abrirModalDias = (tipoId) => {
    setTipoEnModal(tipoId);
    const pre = new Set(getDiasTipo?.(sucursalId, tipoId) ?? []);
    setTempDias(pre);
    setModalOpen(true);
  };
  const cerrarModalDias = () => {
    setModalOpen(false);
    setTipoEnModal(null);
    setTempDias(new Set());
  };
  const toggleDia = (v) =>
    setTempDias((p) => {
      const n = new Set(p);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });
  const seleccionarTodos = () => setTempDias(new Set(DIAS.map((d) => d.v)));
  const guardarDias = () => {
    if (tipoEnModal != null) setDiasTipo?.(sucursalId, tipoEnModal, tempDias);
    cerrarModalDias();
  };

  /* ===== Modal AGREGAR INSUMO ===== */
  const [addOpen, setAddOpen] = useState(false);
  const [tipoAdd, setTipoAdd] = useState(null);
  const abrirModalAgregar = (tipoId) => {
    setTipoAdd(tipoId);
    setAddOpen(true);
  };
  const cerrarModalAgregar = () => {
    setTipoAdd(null);
    setAddOpen(false);
  };

  // Rubros por tipo para render
  const rubrosPorTipo = useMemo(() => {
    const map = new Map();
    for (const t of tiposStock) {
      const delTipo = rubros.filter((r) => Number(r.tipoStock_id ?? r.tipoStockId) === Number(t.id));
      map.set(Number(t.id), delTipo);
    }
    return map;
  }, [rubros, tiposStock]);

  return (
    <>
      <section className="card p-4">
        <div className="row-resp">
          <h3 className="text-lg font-semibold">Tipos de stock habilitados</h3>
          <div className="actions w-full sm:w-auto">
            <select className="input w-full sm:w-[240px]" id="agregar-tipo">
              <option value="">Agregar tipo no habilitado…</option>
              {tiposNoHabilitados.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.nombre}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-sm btn-fluid btn-wide"
              onClick={() => {
                const sel = document.getElementById("agregar-tipo");
                const id = Number(sel?.value || 0);
                if (id) onAgregarTipo?.(id);
                if (sel) sel.value = "";
              }}
            >
              Agregar
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {tiposHabilitados.length === 0 && (
            <div
              className="rounded-lg border p-3 text-sm"
              style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}
            >
              No hay tipos de stock habilitados para esta sucursal.
            </div>
          )}

          {tiposHabilitados.map((tipoId) => {
            const tipo = tiposStock.find((t) => Number(t.id) === Number(tipoId));
            const isOpen = openTipos.has(tipoId);
            const rubrosDelTipo = rubrosPorTipo.get(Number(tipoId)) ?? [];

            return (
              <div key={tipoId} className="rounded-lg border bg-white" style={{ borderColor: "var(--frame)" }}>
                <div className="p-3">
                  <div className="row-resp">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md border w-7 h-7 inline-flex items-center justify-center text-sm"
                        style={{ borderColor: "var(--frame)" }}
                        onClick={() => toggleTipo(tipoId)}
                        title={isOpen ? "Colapsar" : "Expandir"}
                      >
                        {isOpen ? "−" : "+"}
                      </button>
                      <span className="font-medium">{tipo?.nombre ?? `Tipo #${tipoId}`}</span>
                    </div>
                    <div className="actions w-full sm:w-auto">
                      <button className="btn btn-outline btn-sm btn-fluid" onClick={() => abrirModalDias(tipoId)}>
                        Día semana
                      </button>
                      <button className="btn btn-primary btn-sm btn-fluid" onClick={() => abrirModalAgregar(tipoId)}>
                        Agregar insumo
                      </button>
                      <button className="btn btn-outline btn-sm btn-fluid" onClick={() => onQuitarTipo?.(tipoId)}>
                        Quitar tipo
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t p-3 space-y-3" style={{ borderColor: "var(--frame)" }}>
                    <RubroAccordion
                      sucursalId={sucursalId}
                      tipoStockId={tipoId}
                      rubros={rubrosDelTipo}
                      sucursalInsumo={sucursalInsumo}
                      insumosAll={insumos}
                      onQuitarInsumo={(insumoId) => onQuitarInsumo?.(tipoId, insumoId)}
                      onEditedSucursalInsumo={onEditedSucursalInsumo}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ModalAgregarInsumo
        open={addOpen}
        onClose={cerrarModalAgregar}
        sucursalId={sucursalId}
        tipoStockId={tipoAdd}
        insumos={insumos}
        existentes={sucursalInsumo}
        onSaved={onAddedSucursalInsumo}
      />

      <Modal
        open={modalOpen}
        title="Días de la semana"
        onClose={cerrarModalDias}
        footer={
          <div className="actions justify-end">
            <button className="btn btn-outline btn-sm btn-fluid" onClick={cerrarModalDias}>
              Cancelar
            </button>
            <button className="btn btn-outline btn-sm btn-fluid" onClick={seleccionarTodos}>
              Seleccionar todos
            </button>
            <button className="btn btn-primary btn-sm btn-fluid" onClick={guardarDias}>
              Guardar
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {DIAS.map((d) => {
            const checked = tempDias.has(d.v);
            return (
              <label
                key={d.v}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--frame)" }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleDia(d.v)} />
                <span>{d.t}</span>
              </label>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
