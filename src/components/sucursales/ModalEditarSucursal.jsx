// src/components/sucursales/ModalEditarSucursal.jsx
import { useEffect, useState } from "react";

export default function ModalEditarSucursal({ open, sucursal, onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (open) {
      setNombre(sucursal?.nombre ?? "");
      setDireccion(sucursal?.direccion ?? "");
      setTelefono(sucursal?.telefono ?? "");
      setActivo(Boolean(sucursal?.activo ?? true));
    }
  }, [open, sucursal]);

  if (!open) return null;

  const valido = nombre.trim().length > 0;

  const handleSave = () => {
    if (!valido) return;
    onSave({
      id: sucursal.id,
      nombre: nombre.trim(),
      direccion: direccion.trim() || null,
      telefono: telefono.trim() || null,
      activo,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[520px] rounded-xl bg-white border shadow-lg" style={{ borderColor: "var(--frame)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--frame)" }}>
          <h3 className="text-lg font-semibold">Editar sucursal</h3>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>Nombre *</label>
            <input className="input w-full" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>Dirección</label>
            <input className="input w-full" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <label className="text-sm" style={{ color: "var(--graphite)" }}>Teléfono</label>
            <input className="input w-full" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
        </div>

        <div className="p-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end" style={{ borderColor: "var(--frame)" }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className={`btn btn-primary ${!valido ? "opacity-60 pointer-events-none" : ""}`} onClick={handleSave}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}
