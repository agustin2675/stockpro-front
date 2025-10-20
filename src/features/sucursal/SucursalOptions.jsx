export default function SucursalOptions({ value, onChange }) {
  const opts = [
    { key: "stocks", label: "Stocks disponibles" },
    { key: "histStock", label: "Historial" }
  ];

  return (
    <div className="card p-2">
      <div className="flex flex-wrap gap-2">
        {opts.map(o => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                active ? "bg-[var(--beige)]" : "bg-white"
              }`}
              style={{ borderColor: "var(--frame)" }}
              onClick={() => onChange(o.key)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
