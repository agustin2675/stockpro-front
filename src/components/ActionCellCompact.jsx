import { useEffect, useRef, useState } from "react";

/** Acciones: Visualizar / Modificar / Imprimir / Eliminar. */
export default function ActionCellCompact({
  onVisualizar = () => {},
  onModificar = () => {},  
  onImprimir = () => {},
  onEliminar = () => {},
}) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (open && sheetRef.current && !sheetRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleEliminar = () => {
    const ok = window.confirm(
      "¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer."
    );
    if (ok) onEliminar();
  };

  return (
    <div className="w-full">
      {/* Desktop / tablet */}
      <div className="hidden sm:flex flex-wrap gap-2">
        <button className="btn btn-outline btn-sm" onClick={onVisualizar}>
          Visualizar
        </button>
        <button className="btn btn-outline btn-sm" onClick={onModificar}>
          Modificar
        </button>
        <button className="btn btn-outline btn-sm" onClick={onImprimir}>
          Imprimir
        </button>
        <button className="btn btn-outline btn-sm btn-danger" onClick={handleEliminar}>
          Eliminar
        </button>
      </div>

      {/* Mobile: action sheet */}
      <div className="sm:hidden">
        <button
          className="btn btn-outline btn-sm w-full"
          onClick={() => setOpen(true)}
          aria-haspopup="menu"
        >
          Acciones ⋮
        </button>

        {open && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div
              ref={sheetRef}
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white border-t"
              style={{ borderColor: "var(--frame)" }}
            >
              <div className="p-3 border-b" style={{ borderColor: "var(--frame)" }}>
                <div
                  className="h-1 w-10 mx-auto rounded-full"
                  style={{ background: "var(--frame)" }}
                />
              </div>
              <div className="p-2">
                <button
                  className="menu-item"
                  onClick={() => {
                    setOpen(false);
                    onVisualizar();
                  }}
                >
                  Visualizar
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    setOpen(false);
                    onModificar();
                  }}
                >
                  Modificar
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    setOpen(false);
                    onImprimir();
                  }}
                >
                  Imprimir
                </button>
                <button
                  className="menu-item text-red-600"
                  onClick={() => {
                    setOpen(false);
                    handleEliminar();
                  }}
                >
                  Eliminar
                </button>
              </div>
              <div className="p-3">
                <button className="btn w-full" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
