import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

/**
 * Accessible toast notification banner.
 */
export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const styleMap = {
    success: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
    error: 'bg-rose-500/15 border-rose-500/40 text-rose-200',
    info: 'bg-blue-500/15 border-blue-500/40 text-blue-200'
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[100] max-w-sm px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200 ${styleMap[toast.type] || styleMap.info}`}
    >
      {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />}
      {toast.type === 'error' && <AlertCircle size={18} className="text-rose-400 flex-shrink-0" aria-hidden="true" />}
      {toast.type === 'info' && <Sparkles size={18} className="text-blue-400 flex-shrink-0" aria-hidden="true" />}
      <span className="text-xs font-semibold leading-snug">{toast.message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-auto opacity-70 hover:opacity-100 transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
