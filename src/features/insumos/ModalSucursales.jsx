import Modal from "../../components/Modal.jsx";

export default function ModalSucursales({
  open, onClose,
  insumo,         // objeto insumo seleccionado
  sucursales = [],
  selectedIds = new Set(),  // Set de sucursal_id donde está disponible
  onToggle        // (sucursalId) => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Disponible en sucursal — ${insumo?.nombre ?? ""}`}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Guardar</button>
        </div>
      }
    >
      <div className="grid sm:grid-cols-2 gap-2">
        {sucursales.map(s => {
          const checked = selectedIds.has(s.id);
          return (
            <label key={s.id} className="flex items-center gap-2 rounded-lg border px-3 py-2"
                   style={{ borderColor: "var(--frame)" }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(s.id)}
              />
              <span>{s.nombre}</span>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}
