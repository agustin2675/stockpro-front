// src/components/users/ModalAgregarUsuario.jsx
import { useMemo, useState, useEffect } from "react";
import { postUser } from "../../services/usersService";

const ROLES = ["ADMIN", "SUCURSAL", "ENCARGADO"];

export default function ModalAgregarUsuario({ open, onClose, onSuccess, sucursales = [] }) {
  const [form, setForm] = useState({
    username: "",
    telefono: "",
    rol: "SUCURSAL",
    sucursal_id: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function SelectModern({ label, value, onChange, options = [], name, error, placeholder = "Selecciona…" }) {
  return (
    <div>
      <label className="block text-sm mb-1" style={{ color: "var(--graphite)" }}>
        {label} *
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border px-3 py-2.5 pr-10 text-sm transition
                     bg-white outline-none
                     hover:border-[var(--ink)]/30
                     focus:ring-2 focus:ring-[var(--ink)]/15 focus:border-[var(--ink)]/50"
          style={{ borderColor: "var(--frame)" }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>


      </div>

      {error && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}

  // Cierre con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && safeClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting]);

  const sucursalesSorted = useMemo(
    () => [...(sucursales || [])].sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || "")),
    [sucursales]
  );

  const setVal = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.username?.trim()) e.username = "Requerido";
    if (!form.telefono?.trim()) e.telefono = "Requerido";
    if (!form.rol) e.rol = "Requerido";
    if (!form.sucursal_id) e.sucursal_id = "Selecciona una sucursal";
    if (!form.password) e.password = "Requerido";
    if (form.password && form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (!form.password2) e.password2 = "Confirma tu contraseña";
    if (form.password && form.password2 && form.password !== form.password2) {
      e.password2 = "Las contraseñas no coinciden";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        telefono: form.telefono.trim(),
        rol: form.rol,
        sucursal_id: Number(form.sucursal_id),
      };
      await postUser(payload);
      onSuccess?.(); // refrescar listado
      onClose?.();   // cerrar modal
    } catch (err) {
      console.error("Error creando usuario:", err);
      setErrors((prev) => ({ ...prev, _general: "No se pudo crear el usuario." }));
    } finally {
      setSubmitting(false);
    }
  };

  const safeClose = () => {
    if (submitting) return;
    onClose?.();
  };

  if (!open) return null;

  // helper de clases para inputs con error
  const inputClass = (hasError) =>
    `input w-full ${hasError ? "ring-1" : ""}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" aria-modal="true" role="dialog">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={safeClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-lg">
        <div className="card p-0 overflow-hidden">
          <header className="px-4 py-3 border-b" style={{ borderColor: "var(--frame)" }}>
            <h3 className="text-base md:text-lg font-semibold" style={{ color: "var(--ink)" }}>
              Agregar usuario
            </h3>
          </header>

          <div className="p-4">
            {errors._general && (
              <div className="p-2 rounded text-sm mb-3" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)" }}>
                {errors._general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Usuario */}
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--graphite)" }}>
                  Usuario *
                </label>
                <input
                  type="text"
                  className={inputClass(!!errors.username)}
                  placeholder="Nombre de usuario"
                  value={form.username}
                  onChange={(e) => setVal("username", e.target.value)}
                />
                {errors.username && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.username}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--graphite)" }}>
                  Teléfono *
                </label>
                <input
                  type="text"
                  className={inputClass(!!errors.telefono)}
                  placeholder="Ej: 381..."
                  value={form.telefono}
                  onChange={(e) => setVal("telefono", e.target.value)}
                />
                {errors.telefono && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.telefono}</p>}
              </div>

              <SelectModern
  label="Rol"
  name="rol"
  value={form.rol}
  onChange={(e) => setVal("rol", e.target.value)}
  options={[
    { value: "ADMIN", label: "ADMIN" },
    { value: "SUCURSAL", label: "SUCURSAL" },
    { value: "ENCARGADO", label: "ENCARGADO" },
  ]}
  error={errors.rol}
/>

{/* Sucursal (moderno) */}
<SelectModern
  label="Sucursal"
  name="sucursal_id"
  value={form.sucursal_id}
  onChange={(e) => setVal("sucursal_id", e.target.value)}
  options={sucursalesSorted.map((s) => ({ value: s.id, label: s.nombre }))}
  error={errors.sucursal_id}
/>

              {/* Contraseña */}
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--graphite)" }}>
                  Contraseña *
                </label>
                <div className="flex gap-2">
                  <input
                    type={showPass ? "text" : "password"}
                    className={inputClass(!!errors.password)}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => setVal("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline whitespace-nowrap"
                    onClick={() => setShowPass((v) => !v)}
                    title={showPass ? "Ocultar" : "Mostrar"}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--graphite)" }}>
                  Confirmar contraseña *
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className={inputClass(!!errors.password2)}
                  placeholder="Repite la contraseña"
                  value={form.password2}
                  onChange={(e) => setVal("password2", e.target.value)}
                />
                {errors.password2 && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.password2}</p>}
              </div>

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
                  {submitting ? "Guardando…" : "Guardar usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
