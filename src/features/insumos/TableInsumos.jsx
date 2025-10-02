export default function TableInsumos({
  rows = [],
  onEditar,
  onEliminar,
}) {
  return (
    <section className="card p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ color: "var(--graphite)" }}>
            <th className="py-2">Nombre</th>
            <th className="py-2">Rubro</th>
            <th className="py-2">U. Medida</th>
            <th className="py-2">Estado</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(i => (
            <tr key={i.id} className="border-t" style={{ borderColor: "var(--frame)" }}>
              <td className="py-2">{i.nombre}</td>
              <td className="py-2">{i.rubro}</td>
              <td className="py-2">{i.unidad}</td>
              <td className="py-2">{i.activo ? "Activo" : "Inactivo"}</td>
              <td className="py-2">
                <div className="flex gap-2 flex-wrap">
                  <button className="btn btn-outline" onClick={() => onEditar(i.id)}>Modificar</button>
                  <button className="btn btn-outline" onClick={() => onEliminar(i.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="5" className="py-6 text-center" style={{ color:"var(--graphite)" }}>
              Sin resultados
            </td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

