// src/features/stockSucursal/ModalEditarInsumo.jsx
import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import { putSucursalInsumo } from "../../services/sucursalInsumoService";

/** Normaliza lectura de números desde posible snake_case/camelCase/null */
function readNumber(row, keys, fallback = 0) {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null && v !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return Number(fallback) || 0;
}

export default function ModalEditarInsumo({ open, onClose, row, onSaved }) {
  // Usamos string para inputs controlados; casteamos al guardar
  const [cantidadReal, setCantidadReal] = useState("0");
  const [cantidadIdeal, setCantidadIdeal] = useState("0");
  const [cantidadMinima, setCantidadMinima] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar valores actuales de la row al abrir/cambiar `row`
  useEffect(() => {
    if (!open || !row) return;
    const cr = readNumber(row, ["cantidadReal", "cantidad_real", "real"], 0);
    const ci = readNumber(row, ["cantidadIdeal", "cantidad_ideal", "ideal"], 0);
    const cm = readNumber(row, ["cantidadMinima", "cantidad_minima", "minima"], 0);
    setCantidadReal(String(cr));
    setCantidadIdeal(String(ci));
    setCantidadMinima(String(cm));
  }, [open, row]);

  const handleGuardar = async () => {
    try {
      setError("");
      setSaving(true);

      const payload = {
        cantidadReal: Number(cantidadReal ?? 0),
        cantidadIdeal: Number(cantidadIdeal ?? 0),
        cantidadMinima: Number(cantidadMinima ?? 0),
      };

      // Validación rápida
      for (const [k, v] of Object.entries(payload)) {
        if (!Number.isFinite(v) || v < 0) {
          setError(`"${k}" debe ser un número ≥ 0.`);
          setSaving(false);
          return;
        }
      }

      // PUT por id de la fila SucursalInsumo
      const updated = await putSucursalInsumo(row.id, payload);

      // Mezclamos por si el backend devuelve los campos con otra naming
      const enriched = {
        ...row,
        ...payload,
        ...updated,
      };

      onSaved?.(enriched);
      onClose?.();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message ?? "No se pudo modificar el insumo.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !row) return null;

  const nombreInsumo = row?.insumo?.nombre ?? `#${row?.insumo_id ?? ""}`;

  return (
    <Modal
      open={open}
      title={`Editar insumo: ${nombreInsumo}`}
      onClose={onClose}
      footer={
        <div className="actions justify-end">
          <button className="btn btn-outline btn-sm btn-fluid" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary btn-sm btn-fluid"
            onClick={handleGuardar}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/*<div>
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
