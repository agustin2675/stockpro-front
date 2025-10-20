
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card p-6 max-w-md w-full text-center space-y-2">
        <h2 className="text-xl font-semibold">Página no encontrada</h2>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          Verificá la URL o regresá al panel.
        </p>
      </div>
    </div>
  );
}