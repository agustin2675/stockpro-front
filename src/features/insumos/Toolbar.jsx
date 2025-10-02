export default function Toolbar({
  tab,
  rubros = [],
  filtroTexto, setFiltroTexto,
  filtroRubro, setFiltroRubro,
  onCrear // callback según pestaña
}) {
  return (
    <section className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={onCrear}>
            {tab === "tipo" ? "Crear tipo" : tab === "rubro" ? "Crear rubro" : "Crear insumo"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tab === "insumo" && (
            <select
              className="input w-[180px]"
              value={filtroRubro}
              onChange={(e) => setFiltroRubro(e.target.value)}
            >
              <option value="">Rubro (todos)</option>
              {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          )}

          <input
            className="input w-[220px]"
            placeholder="Buscar por nombre…"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
