// PedidoContext.jsx
import { createContext, useContext, useMemo, useState } from "react";

const PedidoContext = createContext(null);

export function PedidoProvider({ sucursalId, initialDateISO, children }) {
  // Mapa: insumo_id -> { tipoStock_id, cantidadReal, cantidadIdeal }
  const [detallesMap, setDetallesMap] = useState({});

  // dateTime fijo para el “pedido” (podés inyectarlo desde arriba si querés uno específico)
  const dateTime = useMemo(
    () => initialDateISO ?? new Date().toISOString(),
    [initialDateISO]
  );

  const setCantidad = (insumo_id, tipoStock_id, campo, valor) => {
    const v = Number(valor) || 0;
    setDetallesMap((prev) => {
      const prevRow =
        prev[insumo_id] ?? { tipoStock_id: Number(tipoStock_id), cantidadReal: 0, cantidadIdeal: 0 };
      const nextRow = {
        ...prevRow,
        tipoStock_id: Number(tipoStock_id),
      };
      if (campo === "cantidadReal") nextRow.cantidadReal = v;
      if (campo === "cantidadIdeal") nextRow.cantidadIdeal = v;
      return { ...prev, [insumo_id]: nextRow };
    });
  };

  const buildPayload = () => {
    const detalles = Object.entries(detallesMap).map(([insumo_id, d]) => ({
      insumo_id: Number(insumo_id),
      tipoStock_id: Number(d.tipoStock_id),
      cantidadPedido: Math.max(0, Number(d.cantidadIdeal || 0) - Number(d.cantidadReal || 0)),
      cantidadReal: Number(d.cantidadReal || 0),
    }));
    return {
      sucursal_id: Number(sucursalId),
      dateTime,
      detalles,
    };
  };

  const value = useMemo(
    () => ({
      sucursalId,
      dateTime,
      detallesMap,
      setCantidad,
      buildPayload,
    }),
    [sucursalId, dateTime, detallesMap]
  );

  return <PedidoContext.Provider value={value}>{children}</PedidoContext.Provider>;
}

export function usePedido() {
  const ctx = useContext(PedidoContext);
  if (!ctx) throw new Error("usePedido debe usarse dentro de <PedidoProvider>");
  return ctx;
}
