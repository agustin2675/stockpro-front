export default function Topbar({ onOpenMenu }) {
  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 border"
          style={{ borderColor: "var(--frame)" }}
          aria-label="Abrir menú"
          onClick={onOpenMenu}
        >
          ☰
        </button>
        <div className="brand">
          <span className="brand-dot" />
          <span className="text-sm" style={{ color: "var(--graphite)" }}>Administrador</span>
          <span className="font-medium">Estrella Stock</span>
        </div>
      </div>
      <div className="text-sm" style={{ color: "var(--graphite)" }}>
        Panel
      </div>
    </header>
  );
}
