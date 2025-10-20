// src/components/users/ModalEliminarUsuario.jsx
import { useEffect, useState } from "react";
import { desactivarUser } from "../../services/usersService";

export default function ModalEliminarUsuario({ open, onClose, onSuccess, user, sucursalNombre }) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && safeClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting]);

  useEffect(() => {
    if (open) {
      setSubmitting(false);
      setErr("");
    }
  }, [open]);

  const safeClose = () => {
    if (submitting) return;
    onClose?.();
  };

  const handleDelete = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    setErr("");
    try {
      await desactivarUser(user.id);
      onSuccess?.();   // refresca listado
      onClose?.();     // cierra modal
    } catch (e) {
      console.error(e);
      // Mensaje genérico + pista por si el back responde 409/500 por FK u otras reglas
      setErr("No se pudo eliminar el usuario. Verifica que no tenga dependencias activas e inténtalo nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={safeClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="card p-0 overflow-hidden">
          <header className="px-4 py-3 border-b" style={{ borderColor: "var(--frame)" }}>
            <h3 className="text-base md:text-lg font-semibold" style={{ color: "var(--ink)" }}>
              Eliminar usuario
            </h3>
          </header>

          <div className="p-4 space-y-3">
            <p className="text-sm" style={{ color: "var(--graphite)" }}>
              ¿Seguro que deseas eliminar al usuario{" "}
              <span className="font-medium" style={{ color: "var(--ink)" }}>
                {user?.nombre ?? "—"}
              </span>
              {sucursalNombre ? ` (Sucursal: ${sucursalNombre})` : ""}?
            </p>

            <div className="text-xs p-2 rounded" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)" }}>
              Esta acción no se puede deshacer.
            </div>

            {err && (
              <div className="text-xs p-2 rounded" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)" }}>
                {err}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button className="btn btn-outline" onClick={safeClose} disabled={submitting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
