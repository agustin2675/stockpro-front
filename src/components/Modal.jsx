export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--frame)" }}>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="p-5">{children}</div>
          {footer && (
            <div className="px-5 py-3 border-t bg-[#fafafa]" style={{ borderColor: "var(--frame)" }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

