import data from "../data/mockData.json";

function n(n){ return Intl.NumberFormat("es-AR").format(n ?? 0); }

export default function AdminHome(){
  const sucursales = data.Sucursal ?? [];
  const usuarios = data.Usuario ?? [];
  const insumos = data.Insumo ?? [];
  const pedidos = data.Pedido ?? [];

  const hoy = new Date();
  const pedidosHoy = pedidos.filter(p => {
    const d = new Date(p.fecha);
    return d.getFullYear()===hoy.getFullYear() && d.getMonth()===hoy.getMonth() && d.getDate()===hoy.getDate();
  });

  const cards = [
    { label: "Sucursales", value: n(sucursales.length) },
    { label: "Usuarios", value: n(usuarios.length) },
    { label: "Insumos", value: n(insumos.length) },
    { label: "Pedidos hoy", value: n(pedidosHoy.length) },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl">Panel del Administrador</h1>
        <p className="text-sm" style={{ color:"var(--graphite)" }}>Accesos rápidos a funcionalidades.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="card p-4">
            <div className="text-sm" style={{ color:"var(--graphite)" }}>{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
