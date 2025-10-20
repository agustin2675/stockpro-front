// src/pages/AdminHome.jsx
import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../services/usersService";
import { getInsumos } from "../services/insumoService";
import { getPedido } from "../services/pedidoService";
import { getSucursales } from "../services/sucursalService";

function n(n){ return new Intl.NumberFormat("es-AR").format(n ?? 0); }

// Intenta leer una fecha válida desde distintos campos comunes
function parseDate(p) {
  const raw =
    p?.fecha ??
    p?.createdAt ??
    p?.created_at ??
    p?.fecha_creacion ??
    p?.date ??
    null;
  const d = raw ? new Date(raw) : null;
  return Number.isFinite(d?.getTime?.()) ? d : null;
}

export default function AdminHome(){
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [counts, setCounts] = useState({
    sucursales: 0,
    usuarios: 0,
    insumos: 0,
    pedidos: 0,
    pedidosHoy: 0,
  });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setErr("");
        setLoading(true);

        // Pedimos todo en paralelo
        const [sucursales, usuarios, insumos, pedidos] = await Promise.all([
          getSucursales().catch(() => []),
          getUsers().catch(() => []),
          getInsumos().catch(() => []),
          getPedido().catch(() => []),
        ]);

        const hoy = new Date();
        const y = hoy.getFullYear(), m = hoy.getMonth(), d = hoy.getDate();

        const pedidosHoy = (Array.isArray(pedidos) ? pedidos : []).filter((p) => {
          const dt = parseDate(p);
          return dt && dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
        }).length;

        if (!alive) return;
        setCounts({
          sucursales: (sucursales?.length) ?? 0,
          usuarios: (usuarios?.length) ?? 0,
          insumos: (insumos?.length) ?? 0,
          pedidos: (pedidos?.length) ?? 0,
          pedidosHoy,
        });
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErr("No se pudieron cargar los datos del panel.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, []);

  const cards = useMemo(() => ([
    { label: "Sucursales", value: n(counts.sucursales) },
    { label: "Usuarios", value: n(counts.usuarios) },
    { label: "Insumos", value: n(counts.insumos) },
    { label: "Pedidos hoy", value: n(counts.pedidosHoy) },
  ]), [counts]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl">Panel del Administrador</h1>
        <p className="text-sm" style={{ color:"var(--graphite)" }}>
          Accesos rápidos a funcionalidades.
        </p>
      </header>

      {err && (
        <div className="card p-3 text-red-600 text-sm">
          {err}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(loading ? [
          { label: "Sucursales", value: "…" },
          { label: "Usuarios", value: "…" },
          { label: "Insumos", value: "…" },
          { label: "Pedidos hoy", value: "…" },
        ] : cards).map(c => (
          <div key={c.label} className="card p-4">
            <div className="text-sm" style={{ color:"var(--graphite)" }}>{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </section>

      {/* Opcional: mini resumen secundario */}
      {!loading && (
        <section className="card p-4">
          <p className="text-sm" style={{ color:"var(--graphite)" }}>
            Total de pedidos registrados: <strong>{n(counts.pedidos)}</strong>
          </p>
        </section>
      )}
    </div>
  );
}
