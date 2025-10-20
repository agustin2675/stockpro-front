import { useState, useEffect } from "react";

export default function ModalCrearTipo({ open, onClose, onSave }) {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (open) setNombre(""); // limpiar al abrir
  }, [open]);

  if (!open) return null;

  const valido = nombre.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Contenedor */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md mx-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Crear Tipo de Stock</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">Nombre</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Diario, Producción..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            className="w-full sm:w-auto border border-gray-400 rounded-lg py-2 sm:py-2.5 px-4 sm:px-6 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            disabled={!valido}
            className={`w-full sm:w-auto rounded-lg py-2 sm:py-2.5 px-4 sm:px-6 text-sm font-medium transition ${
              valido ? "text-gray-700 bg-[#EFE3D3] hover:opacity-90" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            onClick={() => {
              if (!valido) return;
              onSave(nombre.trim());
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
