// src/features/stockSucursal/InsumoList.jsx
import { useState } from "react";
import ModalEditarInsumo from "./ModalEditarInsumo.jsx";

/**
 * props:
 * - insumosHabilitados: array de { id, nombre, ... }
 * - onQuitar(insumoId)
 * - getRowForInsumo(insumoId) -> row SucursalInsumo
 * - onEditedSucursalInsumo(updatedRow)
 */
export default function InsumoList({
  insumosHabilitados = [],
  onQuitar,
  getRowForInsumo,
  onEditedSucursalInsumo,
}) {
  const [editRow, setEditRow] = useState(null);

  return (
    <>
      <ul className="divide-y">
        {insumosHabilitados.map((ins) => {
          const row = getRowForInsumo?.(ins.id);
          const cr = row?.cantidadReal ?? 0;
          const ci = row?.cantidadIdeal ?? 0;
          const cm = row?.cantidadMinima ?? 0;

          return (
            <li key={ins.id} className="py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{ins.nombre}</p>
                  <p className="text-xs opacity-70">
                    Real: <span className="font-mono">{cr}</span> · Ideal:{" "}
                    <span className="font-mono">{ci}</span> · Mínima:{" "}
                    <span className="font-mono">{cm}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => setEditRow(row)}
                    disabled={!row}
                    title={!row ? "Sin fila SucursalInsumo" : "Modificar cantidades"}
                  >
                    Modificar
                  </button>
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() => onQuitar?.(ins.id)}
                  >
                    Quitar
                  </button>
                  
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ModalEditarInsumo
        open={!!editRow}
        row={editRow}
        onClose={() => setEditRow(null)}
        onSaved={(updated) => {
          onEditedSucursalInsumo?.(updated);
          setEditRow(null);
        }}
      />
    </>
  );
}
