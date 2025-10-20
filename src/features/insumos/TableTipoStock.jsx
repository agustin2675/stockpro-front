export default function TableTipoStock({ rows = [], onEditar, onEliminar }) {
  return (
    <section className="card p-0">
      {/* ===== Desktop / Tablet ===== */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50" style={{ color: "var(--graphite)" }}>
            <tr className="text-left">
              <th className="py-2.5 px-3 whitespace-nowrap">Nombre</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Estado</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              t.nombre=="Extra" ? <></> :
              <tr
                key={t.id}
                className="border-t align-top hover:bg-gray-50/40"
                style={{ borderColor: "var(--frame)" }}
              >
                <td className="py-2.5 px-3 break-words">{t.nombre}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {t.activo ? "Activo" : "Inactivo"}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn btn-outline btn-sm px-4 py-1.5"
                      onClick={() => onEditar(t.id)}
                      aria-label={`Editar ${t.nombre}`}
                    >
                      Modificar
                    </button>
                    <button
                      className="btn btn-outline btn-sm px-4 py-1.5"
                      onClick={() => onEliminar(t.id)}
                      aria-label={`Eliminar ${t.nombre}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="py-6 px-3 text-center"
                  style={{ color: "var(--graphite)" }}
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile (cards, sin scroll horizontal) ===== */}
      <div className="sm:hidden space-y-3 px-2 pt-3 pb-5">
        {rows.length === 0 && (
          <div className="p-5 text-center text-sm" style={{ color: "var(--graphite)" }}>
            Sin resultados
          </div>
        )}

        {rows.map((t) => (
          t.nombre=="Extra" ? <></> :
          <article
            key={t.id}
            className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            style={{ borderColor: "var(--frame)" }}
          >
            <div className="p-4">
              {/* Título */}
              <div className="text-[15px] font-medium leading-snug break-words mb-2">
                {t.nombre}
              </div>

              {/* Pares etiqueta–valor con divisor sutil (solo 'Estado' aquí) */}
              <dl className="divide-y divide-gray-200/80">
                <div className="grid grid-cols-[92px,1fr] gap-3 py-2 first:pt-0 last:pb-0">
                  <dt className="text-xs text-gray-600">Estado</dt>
                  <dd className="text-[15px] leading-snug">
                    {t.activo ? "Activo" : "Inactivo"}
                  </dd>
                </div>
              </dl>

              {/* Acciones */}
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  className="btn btn-outline btn-sm w-full px-4 py-2"
                  onClick={() => onEditar(t.id)}
                  aria-label={`Editar ${t.nombre}`}
                >
                  Modificar
                </button>
                <button
                  className="btn btn-outline btn-sm w-full px-4 py-2"
                  onClick={() => onEliminar(t.id)}
                  aria-label={`Eliminar ${t.nombre}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
