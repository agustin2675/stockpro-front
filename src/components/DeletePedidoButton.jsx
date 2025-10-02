// src/components/DeletePedidoButton.jsx
import { useState } from "react";

/**
 * Botón genérico para eliminar un pedido con confirmación.
 * Props:
 * - pedidoId: number (requerido)
 * - onDelete: () => Promise<void> | void  (acción que realmente elimina)
 * - afterDelete?: () => void               (callback al terminar OK)
 * - className?: string
 * - label?: string                         (por defecto "Eliminar")
 * - confirmMessage?: string                (por defecto genérico)
 * - disabled?: boolean
 */
export default function DeletePedidoButton({
  pedidoId,
  onDelete,
  afterDelete,
  className = "btn btn-outline btn-danger",
  label = "Eliminar",
  confirmMessage = "¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    const ok = window.confirm(confirmMessage);
    if (!ok) return;

    try {
      setLoading(true);
      await Promise.resolve(onDelete?.(pedidoId));
      afterDelete?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={loading || disabled}
      title={label}
    >
      {loading ? "Eliminando..." : label}
    </button>
  );
}
