
export default function ModalAviso({
  open,
  onClose,
  title = "Aviso",
  message = "",
  type = "info",
  primaryText = "Aceptar",
}) {
  if (!open) return null;

  const palette = {
    error:  { border: "#DC2626", badgeBg: "rgba(220,38,38,0.1)", badgeText: "#B91C1C" },
    warning:{ border: "#D97706", badgeBg: "rgba(217,119,6,0.1)",  badgeText: "#92400E" },
    info:   { border: "#10B981", badgeBg: "rgba(16,185,129,0.1)", badgeText: "#065F46" },
  }[type] ?? { border: "var(--frame)", badgeBg: "rgba(0,0,0,0.06)", badgeText: "#374151" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-lg overflow-hidden border"
        style={{ borderColor: "var(--frame)" }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--frame)" }}>
          <h3 className="font-medium">{title}</h3>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: palette.badgeBg, color: palette.badgeText, border: `1px solid ${palette.border}` }}
          >
            {type.toUpperCase()}
          </span>
        </div>
        <div className="p-4 text-sm" style={{ color: "var(--graphite)" }}>
          {message}
        </div>
        <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: "var(--frame)" }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>{primaryText}</button>
        </div>
      </div>
    </div>
  );
}
