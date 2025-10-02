export default function Tabs({ tab, setTab }) {
  const items = [
    { key: "tipo", label: "Tipo de Stock" },
    { key: "rubro", label: "Rubros" },
    { key: "insumo", label: "Insumos" },
    { key: "unidad", label: "Unidades de Medida" },
  ];
  return (
    <nav className="flex items-center gap-2 flex-wrap">
      {items.map(t => (
        <button
          key={t.key}
          className={`px-3 py-2 rounded-lg text-sm ${tab === t.key ? "bg-[color:var(--beige)] text-[color:var(--ink)]" : "border"}`}
          style={tab === t.key ? {} : { borderColor: "var(--frame)", color: "var(--graphite)" }}
          onClick={() => setTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
