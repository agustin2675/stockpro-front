export default function SelectorSucursal({ sucursales = [], value, onChange }) {
  return (
    <section className="card p-4">
      <div className="row-resp">
        <div>
          <h2 className="text-lg font-semibold">Seleccionar sucursal</h2>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Elegí una sucursal para ver y administrar el stock habilitado.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm" style={{ color: "var(--graphite)" }}>Sucursal</label>
          <select
            className="input w-full sm:w-[240px]"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}


