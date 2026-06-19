interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type?: "success" | "warning" | "info" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
}

export default function ConfirmModal({
  open, onClose, onConfirm, title, description,
  type = "info", confirmLabel = "Confirm", cancelLabel = "Cancel",
  showCancel = true,
}: ConfirmModalProps) {
  if (!open) return null;

  const colors = {
    info: "from-indigo-500 to-blue-600",
    warning: "from-amber-500 to-orange-600",
    success: "from-emerald-500 to-teal-600",
    danger: "from-red-500 to-pink-600",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#0f172a] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md modal-content shadow-[0_20px_60px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[type]} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <span className="text-white text-xl">
            {type === "success" ? "✓" : type === "warning" ? "⚠" : type === "danger" ? "✕" : "ℹ"}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-white/50 text-center mb-6">{description}</p>
        <div className="flex gap-3">
          {showCancel && (
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/[0.1] transition-colors border border-white/[0.06]">
              {cancelLabel}
            </button>
          )}
          <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r ${colors[type]} text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}