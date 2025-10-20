// src/components/users/UsersToolbar.jsx
export default function UsersToolbar({ onAgregar, loading = false }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-medium" style={{ color: "var(--ink)" }}>
          Listado de usuarios
        </h2>
      </div>

      <div className="flex gap-2">
        <button
          className="btn btn-primary"
          onClick={onAgregar}
          disabled={loading}
          title="Agregar usuario"
        >
          Agregar usuario
        </button>
      </div>
    </div>
  );
}
