import { useEffect, useState } from "react";
import { getUnidadesMedida } from "../../services/unidadMedidaService.js";
import { getRubro } from "../../services/rubroService.js";

export default function CreateInsumoModal({ open, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [nombre, setNombre] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [rubroId, setRubroId] = useState("");

  const [unidades, setUnidades] = useState([]);
  const [rubros, setRubros] = useState([]);

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
        setNombre(""); setUnidadId(""); setRubroId("");
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
  }, [open]);

  const valido = nombre.trim() && unidadId && rubroId;
  const handleSave = () => {
    if (!valido) return;
    onSave({
      nombre: nombre.trim(),
      unidadDeMedida_id: Number(unidadId),
      rubro_id: Number(rubroId),
      activo: true,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[520px] rounded-xl bg-white border shadow-lg" style={{ borderColor: "var(--frame)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--frame)" }}>
          <h3 className="text-lg font-semibold">Crear insumo</h3>
        </div>

        <div className="p-4 space-y-3">
          {err && (
            <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}>
              {err}
            </div>
          )}

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>Nombre</label>
            <input className="input w-full" placeholder="Ej: Harina 000"
                   value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={loading} />
          </div>

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>Unidad de medida</label>
            <select className="input w-full" value={unidadId} onChange={(e) => setUnidadId(e.target.value)} disabled={loading}>
              <option value="">{loading ? "Cargando..." : "Seleccionar unidad…"}</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>Rubro</label>
            <select className="input w-full" value={rubroId} onChange={(e) => setRubroId(e.target.value)} disabled={loading}>
              <option value="">{loading ? "Cargando..." : "Seleccionar rubro…"}</option>
              {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="p-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end" style={{ borderColor: "var(--frame)" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={`btn btn-primary ${!valido ? "opacity-60 pointer-events-none" : ""}`} onClick={handleSave} disabled={!valido || loading}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
