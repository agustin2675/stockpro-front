import { useState, useEffect } from "react";

export default function ModalEditarRubro({ open, rubro, onClose, onSave }) {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (open) setNombre(rubro?.nombre ?? ""); // pre-fill al abrir
  }, [open, rubro]);

  if (!open) return null;

  const valido = nombre.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Contenedor */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Editar rubro</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Nombre
            </label>
            <input
              type="text"
              className="input w-full"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Masas Finas, Laminados…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button
                className={`btn btn-primary ${!valido ? "opacity-60 pointer-events-none" : ""}`}
                onClick={() => {
                    if (!valido) return;
                    onSave({ id: rubro.id, nombre: nombre.trim() }); // <-- id del objeto correcto
                }}
                >
                Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
