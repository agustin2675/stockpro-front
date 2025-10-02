import { useEffect, useState } from "react";
import { getUnidadesMedida } from "../../services/unidadMedidaService";
import { getRubro } from "../../services/rubroService";

export default function ModalEditInsumo({ open, insumo, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [nombre, setNombre] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [rubroId, setRubroId] = useState("");

  const [unidades, setUnidades] = useState([]);
  const [rubros, setRubros] = useState([]);

  // Carga listas (unidades/rubros) y pre-carga valores del insumo seleccionado
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      setLoading(true);
      setErr("");

      try {
        const [uds, rbs] = await Promise.all([getUnidadesMedida(), getRubro()]);
        if (!mounted) return;
        setUnidades(uds ?? []);
        setRubros(rbs ?? []);

        // Pre-fill desde props.insumo
        setNombre(insumo?.nombre ?? "");
        const unidad = insumo?.unidadDeMedida_id ?? insumo?.unidadDeMedidaId ?? insumo?.unidadDeMedida?.id ?? "";
        const rubro  = insumo?.rubro_id ?? insumo?.rubroId ?? insumo?.rubro?.id ?? "";
        setUnidadId(String(unidad));
        setRubroId(String(rubro));
      } catch (e) {
        if (!mounted) return;
        setErr("No se pudieron cargar listas. Intentá nuevamente.");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [open, insumo]);

  const valido = nombre.trim() && unidadId && rubroId;

  const handleSave = () => {
    if (!valido) return;
    onSave({
      id: insumo.id,
      nombre: nombre.trim(),
      unidadDeMedida_id: Number(unidadId),
      rubro_id: Number(rubroId),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[520px] rounded-xl bg-white border shadow-lg"
        style={{ borderColor: "var(--frame)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--frame)" }}>
          <h3 className="text-lg font-semibold">Modificar insumo</h3>
        </div>

        <div className="p-4 space-y-3">
          {err && (
            <div
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}
            >
              {err}
            </div>
          )}

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>
              Nombre
            </label>
            <input
              className="input w-full"
              placeholder="Ej: Harina 000"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>
              Unidad de medida
            </label>
            <select
              className="input w-full"
              value={unidadId}
              onChange={(e) => setUnidadId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? "Cargando..." : "Seleccionar unidad…"}</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>
              Rubro
            </label>
            <select
              className="input w-full"
              value={rubroId}
              onChange={(e) => setRubroId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? "Cargando..." : "Seleccionar rubro…"}</option>
              {rubros.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="p-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end"
          style={{ borderColor: "var(--frame)" }}
        >
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className={`btn btn-primary ${!valido ? "opacity-60 pointer-events-none" : ""}`}
            onClick={handleSave}
            disabled={!valido || loading}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
