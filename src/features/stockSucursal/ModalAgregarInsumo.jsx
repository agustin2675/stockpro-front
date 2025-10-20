import { useState, useMemo } from "react";
import Modal from "../../components/Modal.jsx";
import { createOrUpdateSucursalInsumo } from "../../services/sucursalInsumoService";
import { getRubroById } from "../../services/rubroService";

export default function ModalAgregarInsumo({
  open,
  onClose,
  sucursalId,
  tipoStockId,
  insumos = [],
  existentes = [],
  onSaved,
}) {
  const [q, setQ] = useState("");
  const [selectedInsumoId, setSelectedInsumoId] = useState(null);
  const [cantidadReal, setCantidadReal] = useState("0");
  const [cantidadIdeal, setCantidadIdeal] = useState("0");
  const [cantidadMinima, setCantidadMinima] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ya existentes en este tipo
  const yaHabilitados = useMemo(() => {
    const s = new Set();
    (existentes || [])
      .filter(
        (r) =>
          Number(r.sucursal_id) === Number(sucursalId) &&
          Number(r.tipoStock_id) === Number(tipoStockId)
      )
      .forEach((r) => s.add(Number(r.insumo_id)));
    return s;
  }, [existentes, sucursalId, tipoStockId]);

    // lista filtrada (excluye los ya agregados)
  const candidatos = useMemo(() => {
    const list = Array.isArray(insumos) ? insumos : [];
    const qq = q.trim().toLowerCase();

    // Filtramos por búsqueda y quitamos los ya habilitados
    const filtered = list.filter((i) => {
      const nombre = (i?.nombre ?? "").toLowerCase();
      const coincide = !qq || nombre.includes(qq);
      const noAgregado = !yaHabilitados.has(Number(i.id));
      return coincide && noAgregado;
    });

    return filtered
      .slice()
      .sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));
  }, [insumos, q, yaHabilitados]);

  const handleGuardar = async () => {
    try {
      setError("");
      if (!selectedInsumoId) {
        setError("Seleccioná un insumo.");
        return;
      }
      const cr = Number(cantidadReal);
      const ci = Number(cantidadIdeal);
      const cm = Number(cantidadMinima);
      if (![cr, ci, cm].every((v) => Number.isFinite(v) && v >= 0)) {
        setError("Las cantidades deben ser números ≥ 0.");
        return;
      }
      if (yaHabilitados.has(Number(selectedInsumoId))) {
        setError("Ese insumo ya está agregado en este tipo.");
        return;
      }

      setSaving(true);

      const payload = {
        sucursal_id: Number(sucursalId),
        tipoStock_id: Number(tipoStockId),
        insumo_id: Number(selectedInsumoId),
        cantidadReal: cr,
        cantidadIdeal: ci,
        cantidadMinima: cm,
      };

      const row = await createOrUpdateSucursalInsumo(payload);

      const insumoObj =
  (insumos || []).find(i => Number(i.id) === Number(selectedInsumoId)) || null;

// Detectar rubroId desde el insumo (venga como objeto o *_id)
const rubroId =
  Number(
    insumoObj?.rubro?.id ??
    insumoObj?.rubro_id ??
    insumoObj?.rubroId
  );

// Si tenemos rubroId pero no viene el objeto rubro, lo pedimos al backend
let rubroObj = insumoObj?.rubro ?? null;
if (!rubroObj && Number.isFinite(rubroId)) {
  try {
    rubroObj = await getRubroById(rubroId);
  } catch (_) {
    // si falla, seguimos sin romper el guardado
  }
}

const enriched = {
  ...row,
  sucursal_id: row?.sucursal_id ?? payload.sucursal_id,
  tipoStock_id: row?.tipoStock_id ?? payload.tipoStock_id,
  insumo_id: row?.insumo_id ?? payload.insumo_id,
  cantidadReal: row?.cantidadReal ?? 0,
  cantidadIdeal: row?.cantidadIdeal ?? ci,
  cantidadMinima: row?.cantidadMinima ?? cm,
  insumo: insumoObj
    ? {
        ...insumoObj,
        // Normalizamos rubro para que RubroAccordion pueda nombrar bien:
        rubro: rubroObj ? { id: Number(rubroObj.id), nombre: rubroObj.nombre } : undefined,
        rubro_id: Number.isFinite(rubroId) ? rubroId : insumoObj?.rubro_id
      }
    : row?.insumo ?? null,
};

onSaved?.(enriched);
onClose?.();
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ?? "No se pudo guardar el insumo."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title="Agregar insumo"
      onClose={onClose}
      footer={
        <div className="actions justify-end">
          <button className="btn btn-outline btn-sm btn-fluid" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary btn-sm btn-fluid"
            disabled={!selectedInsumoId || saving}
            onClick={handleGuardar}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      }
    >
      {/* búsqueda */}
      <div className="mb-3">
        <label className="block text-sm mb-1">Buscar</label>
        <input
          className="input w-full"
          placeholder="Nombre de insumo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* lista de insumos */}
      <div
        className="max-h-[40vh] overflow-auto rounded-lg border mb-3"
        style={{ borderColor: "var(--frame)" }}
      >
        <ul className="divide-y">
          {candidatos.map((i) => {
            const disabled = yaHabilitados.has(Number(i.id));
            const selected = Number(selectedInsumoId) === Number(i.id);
            return (
              <li key={i.id} className="flex items-center justify-between p-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="insumo"
                    disabled={disabled}
                    checked={selected}
                    onChange={() => setSelectedInsumoId(i.id)}
                  />
                  <div>
                    <p className="font-medium">{i.nombre}</p>
                  </div>
                </label>
                {disabled && (
                  <span className="text-xs opacity-60">Ya agregado</span>
                )}
              </li>
            );
          })}
        </ul>
        {candidatos.length === 0 && (
          <p className="p-3 text-sm opacity-70">No hay insumos.</p>
        )}
      </div>

      {/* cantidades */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* <div>
          <label className="block text-sm mb-1">Cantidad Real</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input w-full"
            value={cantidadReal}
            onChange={(e) => setCantidadReal(e.target.value)}
          />
        </div>*/}
        <div>
          <label className="block text-sm mb-1">Cantidad Ideal</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input w-full"
            value={cantidadIdeal}
            onChange={(e) => setCantidadIdeal(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Cantidad Mínima</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input w-full"
            value={cantidadMinima}
            onChange={(e) => setCantidadMinima(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </Modal>
  );
}
