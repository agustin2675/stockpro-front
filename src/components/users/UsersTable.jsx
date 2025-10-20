// src/components/users/UsersTable.jsx
import UserRowActions from "./UserRowActions";

export default function UsersTable({ rows = [], sucursalMap, onEditar, onEliminar }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const getSucursalNombre = (id) => sucursalMap.get(Number(id)) ?? "—";
  const getUsername = (u) => u.username ?? u.nombre ?? "—";

  return (
    <>
      {/* Mobile: Fichas (cards) */}
      <div className="md:hidden space-y-4">
        {safeRows.length === 0 ? (
          <div className="p-4 text-sm rounded" style={{ color: "var(--graphite)", background: "var(--surface,#F9FAFB)" }}>
            No hay usuarios cargados.
          </div>
        ) : (
          safeRows.map((u) => (
            <UserCardMobile
              key={u.id}
              title={getUsername(u)}
              rol={u.rol}
              sucursal={getSucursalNombre(u.sucursal_id)}
              telefono={u.telefono || "—"}
              actions={<UserRowActions onEditar={() => onEditar(u)} onEliminar={() => onEliminar(u)} />}
            />
          ))
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: "var(--graphite)" }}>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Teléfono</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Sucursal</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {safeRows.length === 0 ? (
              <tr>
                <td className="py-6 px-4 text-sm" style={{ color: "var(--graphite)" }} colSpan={5}>
                  No hay usuarios cargados.
                </td>
              </tr>
            ) : (
              safeRows.map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: "var(--frame)" }}>
                  <td className="py-3 px-4">{getUsername(u)}</td>
                  <td className="py-3 px-4">{u.telefono || "—"}</td>
                  <td className="py-3 px-4">{u.rol}</td>
                  <td className="py-3 px-4">{getSucursalNombre(u.sucursal_id)}</td>
                  <td className="py-3 px-4">
                    <UserRowActions onEditar={() => onEditar(u)} onEliminar={() => onEliminar(u)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ======= Card mobile estilo “ficha” ======= */
function UserCardMobile({ title, rol, sucursal, telefono, actions }) {
  return (
    <div className="card p-3 border rounded-2xl" style={{ borderColor: "var(--frame)" }}>
      {/* Título + chip rol */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: "var(--graphite)", background: "var(--frame)" }}>
          {rol}
        </span>
      </div>

      <LabelSmall text="Sucursal" />
      <div className="text-sm pb-2" style={{ color: "var(--ink)" }}>{sucursal}</div>
      <Divider />

      <LabelSmall text="Teléfono" />
      <div className="text-sm" style={{ color: "var(--ink)" }}>{telefono}</div>

      {/* Acciones (usa UserRowActions) */}
      <div className="mt-3">{actions}</div>
    </div>
  );
}

function LabelSmall({ text }) {
  return (
    <div className="text-xs uppercase tracking-wide mt-2" style={{ color: "var(--graphite)" }}>
      {text}
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t" style={{ borderColor: "var(--frame)" }} />;
}
