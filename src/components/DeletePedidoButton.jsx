// src/components/DeletePedidoButton.jsx
import { useState } from "react";

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
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await Promise.resolve(onDelete?.(pedidoId));
      afterDelete?.();
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón principal */}
      <button
        className={className}
        onClick={() => setShowModal(true)}
        disabled={loading || disabled}
        title={label}
      >
        {loading ? "Eliminando..." : label}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-sm text-center animate-fadeIn">
            <h2 className="text-lg font-semibold mb-2">Confirmar eliminación</h2>
            <p className="text-sm text-gray-600 mb-6">{confirmMessage}</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#5A738E] text-white font-medium hover:bg-[#4b627a] transition"
              >
                {loading ? "Eliminando..." : "Aceptar"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
