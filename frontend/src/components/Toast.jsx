import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-200',
      bg: 'bg-emerald-50 text-emerald-900',
      iconColor: 'text-emerald-600',
    },
    error: {
      icon: AlertTriangle,
      border: 'border-rose-200',
      bg: 'bg-rose-50 text-rose-900',
      iconColor: 'text-rose-600',
    },
    info: {
      icon: Info,
      border: 'border-blue-200',
      bg: 'bg-blue-50 text-blue-900',
      iconColor: 'text-blue-600',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg max-w-sm ${config.bg} ${config.border}`}>
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 text-xs">
          {toast.title && <h5 className="font-bold mb-0.5">{toast.title}</h5>}
          <p className="font-medium text-slate-700 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
