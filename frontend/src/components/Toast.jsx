import { useEffect } from "react";

export function Toast({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    // toast-card kept in CSS — has @keyframes toastSlideIn + fixed positioning + box-shadow
    <div className="toast-card">
      <div className="text-[1.1rem] text-[#a78bfa] flex-shrink-0 mt-0.5">✦</div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.82rem] font-semibold text-[#e2e8f0] mb-0.5">Atlas</div>
        <div className="text-[0.88rem] text-[#94a3b8] leading-[1.4] break-words">{message}</div>
        <div className="text-[0.75rem] text-[#4a5568] mt-1">knowledge-hub</div>
      </div>
      <button
        className="bg-transparent border-0 text-[#4a5568] text-[1.1rem] cursor-pointer leading-none p-0 flex-shrink-0 transition-colors hover:text-[#94a3b8]"
        onClick={onClose}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}