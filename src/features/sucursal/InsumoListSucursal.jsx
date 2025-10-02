// src/features/sucursal/InsumoListSucursal.jsx
import { useEffect, useMemo, useState } from "react";
import { usePedido } from "../../context/PedidoContext";

export default function InsumoListSucursal({
  insumos = [],
  sucursalId,
  sucursalInsumo = [],
  unidades = [],
  disabled = false,
  currentTipoStockId,
  initialByInsumo = null, // 👈 NEW (mapa: insumoId -> { real, ideal })
}) {
  const { setCantidad } = usePedido();

  const unidadLabelPorId = useMemo(() => {
    const m = new Map();
    for (const u of unidades || []) {
      const id = Number(u?.id);
      if (!Number.isFinite(id)) continue;
      const label = u?.nombre ?? u?.abreviatura ?? u?.simbolo ?? `#${id}`;
      m.set(id, label);
    }
    return m;
  }, [unidades]);

  const idealPorInsumoId = useMemo(() => {
    const m = new Map();
    for (const row of sucursalInsumo || []) {
      if (Number(row?.sucursal_id) !== Number(sucursalId)) continue;
      const insumoId = Number(row?.insumo_id);
      if (!Number.isFinite(insumoId)) continue;
      const ideal = Number(row?.cantidadIdeal);
      if (Number.isFinite(ideal)) m.set(insumoId, ideal);
    }
    return m;
  }, [sucursalInsumo, sucursalId]);

  const [valores, setValores] = useState({});
  useEffect(() => {
    const init = {};
    for (const i of insumos || []) {
      const id = Number(i?.id);
      if (!Number.isFinite(id)) continue;

      // 👇 toma valores del pedido si vienen; si no, usa defaults/ideales actuales
      const realInit =
        initialByInsumo?.[id]?.real ?? 0;
      const idealInit =
        initialByInsumo?.[id]?.ideal ??
        (idealPorInsumoId.has(id) ? idealPorInsumoId.get(id) : 0);

      init[id] = { real: String(realInit), ideal: String(idealInit) };

      // Inicializa en el Context para que buildPayload/estado quede coherente
      setCantidad(id, currentTipoStockId, "cantidadReal", Number(realInit));
      setCantidad(id, currentTipoStockId, "cantidadIdeal", Number(idealInit));
    }
    setValores(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insumos, idealPorInsumoId, currentTipoStockId, initialByInsumo]);

  const normalizeInt = (v) => {
    const onlyDigits = String(v ?? "").replace(/[^\d]/g, "");
    return onlyDigits === "" ? "0" : onlyDigits;
  };

  const handleChange = (insumoId, campo, value) => {
    if (disabled) return;
    const normalized = normalizeInt(value);
    setValores((prev) => ({
      ...prev,
      [insumoId]: {
        ...prev[insumoId],
        [campo]: normalized,
      },
    }));
    setCantidad(
      insumoId,
      currentTipoStockId,
      campo === "real" ? "cantidadReal" : "cantidadIdeal",
      normalized
    );
  };

  const getUnidadId = (i) =>
    Number(
      i?.unidadDeMedida_id ??
      i?.unidadMedida_id ??
      i?.unidad_id ??
      i?.unidadId ??
      i?.unidad?.id ??
      NaN
    );

  const filas = (insumos || []).slice().sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));

  const baseInput = "input w-24 text-right";
  const disabledCommon = { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB", color: "#9CA3AF", cursor: "not-allowed" };
  const idealEnabled = { backgroundColor: "var(--accent-weak, #EFE8DC)", borderColor: "var(--accent, #D9C4A6)" };
  const idealDisabled = { backgroundColor: "#F5EFE5", borderColor: "#E3D6C4", color: "#9CA3AF", cursor: "not-allowed" };
  const sepSuave = "1px solid rgba(229,231,235,0.4)";

  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--frame)", backgroundColor: "#FFFFFF" }}>
      {/* Desktop */}
      <div className="hidden md:block overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium w-1/2">Nombre</th>
              <th className="px-3 py-2 text-left font-medium w-1/6">Unidad</th>
              <th className="px-3 py-2 text-right font-medium w-1/6">Real</th>
              <th className="px-3 py-2 text-right font-medium w-1/6">Ideal</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((i, idx) => {
              const unidadId = getUnidadId(i);
              const unidadLabel =
                Number.isFinite(unidadId) && unidadLabelPorId.has(unidadId)
                  ? unidadLabelPorId.get(unidadId)
                  : (i?.unidad?.nombre ?? "—");

              return (
                <tr key={i.id} className="align-middle" style={{ borderBottom: idx === filas.length - 1 ? "none" : sepSuave }}>
                  <td className="px-3 py-2">{i?.nombre ?? `Insumo #${i?.id}`}</td>
                  <td className="px-3 py-2">{unidadLabel}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className={baseInput}
                      style={disabled ? disabledCommon : undefined}
                      value={valores[i.id]?.real ?? "0"}
                      onChange={(e) => handleChange(i.id, "real", e.target.value)}
                      onBlur={(e) => handleChange(i.id, "real", e.target.value)}
                      placeholder="0"
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className={baseInput}
                      style={disabled ? idealDisabled : idealEnabled}
                      value={valores[i.id]?.ideal ?? "0"}
                      onChange={(e) => handleChange(i.id, "ideal", e.target.value)}
                      onBlur={(e) => handleChange(i.id, "ideal", e.target.value)}
                      placeholder="0"
                      disabled={disabled}
                    />
                  </td>
                </tr>
              );
            })}
            {filas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm" style={{ color: "var(--graphite)" }}>
                  No hay insumos en este rubro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-200/40">
        {filas.length === 0 && (
          <div className="px-3 py-6 text-center text-sm" style={{ color: "var(--graphite)" }}>
            No hay insumos en este rubro.
          </div>
        )}

        {filas.map((i) => {
          const unidadId = getUnidadId(i);
          const unidadLabel =
            Number.isFinite(unidadId) && unidadLabelPorId.has(unidadId)
              ? unidadLabelPorId.get(unidadId)
              : (i?.unidad?.nombre ?? "—");

          return (
            <div key={i.id} className="p-3 space-y-2">
              <div className="font-medium">{i?.nombre ?? `Insumo #${i?.id}`}</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Unidad</div>
                  <div>{unidadLabel}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Real</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input w-full text-right"
                    style={disabled ? disabledCommon : undefined}
                    value={valores[i.id]?.real ?? "0"}
                    onChange={(e) => handleChange(i.id, "real", e.target.value)}
                    onBlur={(e) => handleChange(i.id, "real", e.target.value)}
                    placeholder="0"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Ideal</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input w-full text-right"
                    style={disabled ? idealDisabled : idealEnabled}
                    value={valores[i.id]?.ideal ?? "0"}
                    onChange={(e) => handleChange(i.id, "ideal", e.target.value)}
                    onBlur={(e) => handleChange(i.id, "ideal", e.target.value)}
                    placeholder="0"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
