// src/components/ConfirmDialog.jsx
import React from "react";

export default function ConfirmDialog({
  open,
  title = "Confirmar",
  message = "¿Estás seguro de realizar esta acción?",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onCancel}
      />
      {/* Card */}
      <div className="relative z-[101] w-[92%] max-w-md rounded-2xl bg-white shadow-xl">
        <header className="p-4 border-b" style={{ borderColor: "var(--frame)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--graphite)" }}>
            {title}
          </h3>
        </header>
        <div className="p-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--graphite)" }}>
            {message}
          </p>
        </div>
        <footer className="p-4 border-t flex gap-2 justify-end flex-wrap"
                style={{ borderColor: "var(--frame)" }}>
          <button
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
            title="Cancelar"
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn-outline btn-danger"
            onClick={onConfirm}
            disabled={loading}
            title={confirmLabel}
          >
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
