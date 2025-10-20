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
        prev[insumo_id] ?? { tipoStock_id: Number(tipoStock_id)/*, cantidadReal: 0, cantidadIdeal: 0 */};
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
      cantidadPedido: Number(d.cantidadIdeal) - Number(d.cantidadReal),
      cantidadReal: Number(d.cantidadReal),
      cantidadIdeal: Number(d.cantidadIdeal),
    }));
    return {
      sucursal_id: Number(sucursalId),
      dateTime,
      detalles,
    };
  };

  /* ---------------- NEW: setHydrate ---------------- */
  /**
   * Hidrata el estado interno (detallesMap) a partir de un pedido del backend.
   * Acepta `pedido.detallePedidos` o `pedido.detalles`.
   * Para cantidadIdeal: si no viene, se estima como (cantidadReal + cantidadPedido).
   */
  const setHydrate = (pedido) => {
    if (!pedido) return;

    const fuente = Array.isArray(pedido?.detallePedidos)
      ? pedido.detallePedidos
      : Array.isArray(pedido?.detalles)
      ? pedido.detalles
      : [];

    const next = {};
    for (const d of fuente) {
      const insumo_id =
        d?.insumo_id ?? d?.insumoId ?? d?.insumo ?? d?.insumo?.id;
      const tipoStock_id =
        d?.tipoStock_id ?? d?.tipoStockId ?? d?.tipoStock ?? d?.tipoStock?.id;

      if (insumo_id == null || tipoStock_id == null) continue;

      const cantidadReal = Number(d?.cantidadReal ?? 0);
      const cantidadPedido = Number(d?.cantidadPedido ?? 0);
      const cantidadIdeal =
        d?.cantidadIdeal != null
          ? Number(d.cantidadIdeal)
          : Number(cantidadReal + cantidadPedido);

      next[Number(insumo_id)] = {
        tipoStock_id: Number(tipoStock_id),
        cantidadReal,
        cantidadIdeal,
        cantidadPedido
      };
    }

    setDetallesMap(next);
  };
  /* -------------- END NEW: setHydrate -------------- */

  const value = useMemo(
    () => ({
      sucursalId,
      dateTime,
      detallesMap,
      setCantidad,
      buildPayload,
      setHydrate, // 👈 exportado
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
