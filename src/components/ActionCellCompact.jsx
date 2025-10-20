// src/components/ActionCellCompact.jsx
import { useEffect, useRef, useState } from "react";

/** Acciones: Visualizar / Modificar / Imprimir / Eliminar (con confirm modal). */
export default function ActionCellCompact({
  onVisualizar = () => {},
  onModificar = () => {},
  onImprimir = () => {},
  onEliminar = () => {},
  // Textos personalizables del modal de confirmación
  confirmTitle = "Confirmar eliminación",
  confirmMessage = "¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.",
  confirmOkLabel = "Eliminar",
  confirmCancelLabel = "Cancelar",
}) {
  const [openActionsMobile, setOpenActionsMobile] = useState(false); // modal de acciones (solo mobile)
  const [openConfirm, setOpenConfirm] = useState(false);             // modal de confirmación
  const [deleting, setDeleting] = useState(false);

  const actionsModalRef = useRef(null);
  const firstBtnRef = useRef(null);

  const confirmModalRef = useRef(null);
  const confirmOkRef = useRef(null);

  // ------- Cerrar modal de acciones al click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openActionsMobile) return;
      if (actionsModalRef.current && !actionsModalRef.current.contains(e.target)) {
        setOpenActionsMobile(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openActionsMobile]);

  // ------- Cerrar modal de confirmación al click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openConfirm) return;
      if (confirmModalRef.current && !confirmModalRef.current.contains(e.target)) {
        setOpenConfirm(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openConfirm]);

  // ------- Escape para ambos modales
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (openConfirm) setOpenConfirm(false);
        else if (openActionsMobile) setOpenActionsMobile(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openActionsMobile, openConfirm]);

  // ------- Enfoque inicial dentro del modal de acciones (mobile)
  useEffect(() => {
    if (openActionsMobile && firstBtnRef.current) firstBtnRef.current.focus();
  }, [openActionsMobile]);

  // ------- Enfoque inicial en botón principal del modal de confirmación
  useEffect(() => {
    if (openConfirm && confirmOkRef.current) confirmOkRef.current.focus();
  }, [openConfirm]);

  // Abre modal de confirmación. Si estaba abierto el modal de acciones móvil, lo cierra primero.
  const openConfirmModal = () => {
    if (openActionsMobile) setOpenActionsMobile(false);
    setOpenConfirm(true);
  };

  // Confirmar eliminación
  const handleConfirmEliminar = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await Promise.resolve(onEliminar());
      setOpenConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop / tablet: botones inline */}
      <div className="hidden sm:flex flex-wrap gap-2">
        <button className="btn btn-outline btn-sm" onClick={onVisualizar}>Visualizar</button>
        <button className="btn btn-outline btn-sm" onClick={onModificar}>Modificar</button>
        <button className="btn btn-outline btn-sm" onClick={onImprimir}>Imprimir</button>
        <button className="btn btn-outline btn-sm btn-outline" onClick={openConfirmModal}>
          Eliminar
        </button>
      </div>

      {/* Mobile: abre modal centrado con la lista de acciones */}
      <div className="sm:hidden">
        <button
          className="btn btn-outline btn-sm w-full"
          onClick={() => setOpenActionsMobile(true)}
          aria-haspopup="dialog"
          aria-expanded={openActionsMobile}
        >
          Acciones
        </button>

        {openActionsMobile && (
          <div className="fixed inset-0 z-50">
            {/* Overlay clickeable */}
            <div
              className="absolute inset-0 bg-black/40 z-40"
              onClick={() => setOpenActionsMobile(false)}
              aria-hidden="true"
            />

            {/* Contenedor centrado */}
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div
                ref={actionsModalRef}
                className="w-full max-w-sm bg-white rounded-2xl border shadow-xl overflow-hidden"
                style={{ borderColor: "var(--frame)" }}
                role="dialog"
                aria-modal="true"
                aria-label="Acciones"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--frame)" }}>
                  <h3 className="font-semibold text-base">Acciones</h3>
                </div>

                {/* Contenido */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  <button
                    ref={firstBtnRef}
                    className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-50"
                    onClick={() => { setOpenActionsMobile(false); onVisualizar(); }}
                  >
                    Visualizar
                  </button>
                  <button
                    className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-50"
                    onClick={() => { setOpenActionsMobile(false); onModificar(); }}
                  >
                    Modificar
                  </button>
                  <button
                    className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-50"
                    onClick={() => { setOpenActionsMobile(false); onImprimir(); }}
                  >
                    Imprimir
                  </button>
                  <button
                    className="w-full text-left py-3 px-3 rounded-lg hover:bg-red-50 text-red-600"
                    onClick={openConfirmModal}
                  >
                    Eliminar
                  </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t" style={{ borderColor: "var(--frame)" }}>
                  <button className="btn w-full" onClick={() => setOpenActionsMobile(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Modal de Confirmación de Eliminación ---------- */}
      {openConfirm && (
        <div className="fixed inset-0 z-[60]">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 z-50" aria-hidden="true" />

          {/* Contenedor centrado */}
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div
              ref={confirmModalRef}
              className="w-full max-w-md bg-white rounded-2xl border shadow-2xl overflow-hidden"
              style={{ borderColor: "var(--frame)" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-desc"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--frame)" }}>
                <h3 id="confirm-title" className="font-semibold text-lg">
                  {confirmTitle}
                </h3>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <p id="confirm-desc" className="text-sm" style={{ color: "var(--graphite)" }}>
                  {confirmMessage}
                </p>
              </div>

              {/* Footer botones */}
              <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end" style={{ borderColor: "var(--frame)" }}>
                <button
                  className="btn btn-outline w-full sm:w-auto"
                  onClick={() => setOpenConfirm(false)}
                  disabled={deleting}
                >
                  {confirmCancelLabel}
                </button>
                <button
                  ref={confirmOkRef}
                  className="btn btn-outline w-full sm:w-auto"
                  onClick={handleConfirmEliminar}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando..." : confirmOkLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ---------- /Modal de Confirmación ---------- */}
    </div>
  );
}
