// src/components/users/UserRowActions.jsx
export default function UserRowActions({ onEditar, onEliminar }) {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full">
      <button
        type="button"
        className="btn btn-outline rounded-xl py-2 w-full md:w-auto"
        onClick={onEditar}
        title="Modificar usuario"
        aria-label="Modificar usuario"
      >
        Modificar
      </button>

      <button
        type="button"
        className="btn btn-outline rounded-xl py-2 w-full md:w-auto"
        onClick={onEliminar}
        title="Eliminar usuario"
        aria-label="Eliminar usuario"
        style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        Eliminar
      </button>
    </div>
  );
}
