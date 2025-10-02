// src/features/stockSucursal/RubroAccordion.jsx
import { useMemo, useState } from "react";
import InsumoList from "./InsumoList.jsx";

export default function RubroAccordion({
  sucursalId,
  tipoStockId,
  rubros = [],
  sucursalInsumo = [],
  insumosAll = [],
  onQuitarInsumo,
  onEditedSucursalInsumo, // NUEVO
}) {
  const [openRubros, setOpenRubros] = useState(new Set());

  // (1) Filtrar SI por sucursal + tipo
  const siFiltrado = useMemo(() => {
    return (sucursalInsumo ?? []).filter(
      (row) =>
        Number(row?.sucursal_id) === Number(sucursalId) &&
        Number(row?.tipoStock_id) === Number(tipoStockId)
    );
  }, [sucursalInsumo, sucursalId, tipoStockId]);

  // Mapa rápido insumo_id -> row
  const rowByInsumoId = useMemo(() => {
    const map = new Map();
    for (const r of siFiltrado) map.set(Number(r.insumo_id), r);
    return map;
  }, [siFiltrado]);

  // (2) Dedupe de insumos (preferir include del backend)
  const insumosDelPanel = useMemo(() => {
    const seen = new Set();
    const arr = [];

    for (const row of siFiltrado) {
      const ins = row?.insumo ?? null;
      if (ins && !seen.has(ins.id)) {
        arr.push(ins);
        seen.add(ins.id);
      }
    }
    for (const row of siFiltrado) {
      if (!seen.has(row.insumo_id)) {
        arr.push({ id: row.insumo_id, nombre: `Insumo #${row.insumo_id}` });
        seen.add(row.insumo_id);
      }
    }
    return arr;
  }, [siFiltrado]);

  // (3) Resolver rubroId
  const resolverRubroId = (ins) => {
    const raw =
      ins?.rubro_id ?? ins?.rubroId ?? ins?.rubro?.id ??
      (insumosAll.find((i) => i.id === ins.id)?.rubro_id ??
        insumosAll.find((i) => i.id === ins.id)?.rubroId ??
        insumosAll.find((i) => i.id === ins.id)?.rubro?.id);

    const n = Number(raw);
    return Number.isFinite(n) ? n : "SIN_RUBRO";
  };

  // (4) Nombres rubro
  const rubroNamesById = useMemo(() => {
    const map = new Map();

    for (const r of rubros) {
      const id = Number(r.id);
      const nombre = r?.nombre ?? r?.name ?? null;
      if (Number.isFinite(id) && nombre) map.set(id, nombre);
    }

    for (const ins of insumosDelPanel) {
      const rid = resolverRubroId(ins);
      const nRid = Number(rid);
      const rname = ins?.rubro?.nombre ?? ins?.rubroNombre ?? ins?.rubro?.name ?? null;
      if (Number.isFinite(nRid) && rname && !map.has(nRid)) {
        map.set(nRid, rname);
      }
    }

    for (const i of insumosAll) {
      const rid = i?.rubro_id ?? i?.rubroId ?? i?.rubro?.id;
      const nRid = Number(rid);
      const rname = i?.rubro?.nombre ?? i?.rubroNombre ?? i?.rubro?.name ?? null;
      if (Number.isFinite(nRid) && rname && !map.has(nRid)) {
        map.set(nRid, rname);
      }
    }

    return map;
  }, [rubros, insumosDelPanel, insumosAll]);

  // (5) Agrupar
  const { porRubro, sinRubro } = useMemo(() => {
    const map = new Map();
    const sin = [];

    for (const ins of insumosDelPanel) {
      const rid = resolverRubroId(ins);
      if (rid === "SIN_RUBRO") {
        sin.push(ins);
      } else {
        const nRid = Number(rid);
        if (!map.has(nRid)) map.set(nRid, []);
        map.get(nRid).push(ins);
      }
    }

    for (const [rid, list] of map.entries()) {
      list.sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));
      map.set(rid, list);
    }
    sin.sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));

    return { porRubro: map, sinRubro: sin };
  }, [insumosDelPanel]);

  const rubrosIndex = useMemo(() => {
    const idx = new Map();
    for (const r of rubros) idx.set(Number(r.id), r);
    return idx;
  }, [rubros]);

  const rubrosFaltantesIds = useMemo(() => {
    const ids = Array.from(porRubro.keys());
    return ids.filter((id) => !rubrosIndex.has(Number(id)));
  }, [porRubro, rubrosIndex]);

  const rubrosVisibles = useMemo(() => {
    const lista = [];
    for (const r of rubros) {
      const id = Number(r.id);
      const items = porRubro.get(id) ?? [];
      if (items.length === 0) continue;
      const nombre = rubroNamesById.get(id) ?? r?.nombre ?? `Rubro #${id}`;
      lista.push({ id, nombre, items });
    }
    for (const id of rubrosFaltantesIds) {
      const items = porRubro.get(id) ?? [];
      if (items.length === 0) continue;
      const nombre = rubroNamesById.get(Number(id)) ?? `Rubro #${id}`;
      lista.push({ id: Number(id), nombre, items });
    }
    return lista;
  }, [rubros, porRubro, rubrosFaltantesIds, rubroNamesById]);

  const toggleRubro = (rubroId) => {
    setOpenRubros((prev) => {
      const next = new Set(prev);
      if (next.has(rubroId)) next.delete(rubroId);
      else next.add(rubroId);
      return next;
    });
  };

  const hayAlgo =
    rubrosVisibles.some((r) => r.items.length > 0) || sinRubro.length > 0;

  // Getter para obtener la row de SucursalInsumo dado un insumoId
  const getRowForInsumo = (insumoId) => rowByInsumoId.get(Number(insumoId)) ?? null;

  return (
    <div className="space-y-3">
      {rubrosVisibles.map((r) => {
        const isOpen = openRubros.has(r.id);
        return (
          <div key={r.id} className="rounded-xl border p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleRubro(r.id)}
              className="w-full flex items-center justify-between px-4 py-3"
              aria-expanded={isOpen}
            >
              <span className="font-medium">{r.nombre}</span>
              <span className="text-sm opacity-70">
                {r.items.length} {r.items.length === 1 ? "insumo" : "insumos"}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4">
                <InsumoList
                  insumosHabilitados={r.items}
                  onQuitar={(insumoId) => onQuitarInsumo?.(insumoId)}
                  getRowForInsumo={getRowForInsumo}
                  onEditedSucursalInsumo={onEditedSucursalInsumo}
                />
              </div>
            )}
          </div>
        );
      })}

      {sinRubro.length > 0 && (
        <div className="rounded-xl border p-0 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleRubro("SIN_RUBRO")}
            className="w-full flex items-center justify-between px-4 py-3"
            aria-expanded={openRubros.has("SIN_RUBRO")}
          >
            <span className="font-medium">Sin rubro</span>
            <span className="text-sm opacity-70">
              {sinRubro.length} {sinRubro.length === 1 ? "insumo" : "insumos"}
            </span>
          </button>

          {openRubros.has("SIN_RUBRO") && (
            <div className="px-4 pb-4">
              <InsumoList
                insumosHabilitados={sinRubro}
                onQuitar={(insumoId) => onQuitarInsumo?.(insumoId)}
                getRowForInsumo={getRowForInsumo}
                onEditedSucursalInsumo={onEditedSucursalInsumo}
              />
            </div>
          )}
        </div>
      )}

      {!hayAlgo && (
        <p className="text-sm opacity-70 px-4 pb-4">
          No hay insumos habilitados para este tipo de stock.
        </p>
      )}
    </div>
  );
}
