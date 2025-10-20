// src/components/users/ModalEditarPassword.jsx
import { useEffect, useState } from "react";
import { updateUserPassword } from "../../services/usersService";

export default function ModalEditarPassword({ open, onClose, onSuccess, user }) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
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
    // reset al abrir
    if (open) {
      setPassword("");
      setPassword2("");
      setErr("");
      setShowPass(false);
    }
  }, [open]);

  const safeClose = () => {
    if (submitting) return;
    onClose?.();
  };

  const validate = () => {
    if (!password) return "La contraseña es requerida.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (!password2) return "Debes confirmar la contraseña.";
    if (password !== password2) return "Las contraseñas no coinciden.";
    return "";
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await updateUserPassword({ user_id: user?.id, password });
      onSuccess?.(); // refrescar tabla
      onClose?.();   // cerrar modal
    } catch (e) {
      console.error(e);
      setErr("No se pudo actualizar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  // helpers de estilos
  const label = "block text-sm mb-1";
  const input = "input w-full";
  const danger = { color: "var(--danger)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" aria-modal="true" role="dialog">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={safeClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-lg">
        <div className="card p-0 overflow-hidden">
          <header className="px-4 py-3 border-b" style={{ borderColor: "var(--frame)" }}>
            <h3 className="text-base md:text-lg font-semibold" style={{ color: "var(--ink)" }}>
              Cambiar contraseña
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--graphite)" }}>
              Usuario: <span className="font-medium">{user?.nombre ?? "—"}</span>
            </p>
          </header>

          <div className="p-4">
            {err && (
              <div className="p-2 rounded text-sm mb-3" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)" }}>
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username (solo lectura) */}
              <div>
                <label className={label} style={{ color: "var(--graphite)" }}>
                  Nombre de usuario
                </label>
                <input type="text" className={input} value={user?.nombre ?? ""} disabled />
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className={label} style={{ color: "var(--graphite)" }}>
                  Nueva contraseña *
                </label>
                <div className="flex gap-2">
                  <input
                    type={showPass ? "text" : "password"}
                    className={input}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline whitespace-nowrap"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className={label} style={{ color: "var(--graphite)" }}>
                  Confirmar contraseña *
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className={input}
                  placeholder="Repite la contraseña"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>

              {/* Reglas (sutil) */}
              <p className="text-xs" style={{ color: "var(--graphite)" }}>
                Debe tener al menos 6 caracteres. Evitá contraseñas comunes.
              </p>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={safeClose}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Guardando…" : "Guardar"}
                </button>
              </div>

              {/* Mensaje de no coincidencia en vivo (opcional) */}
              {password && password2 && password !== password2 && (
                <p className="text-xs mt-1" style={danger}>Las contraseñas no coinciden.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
