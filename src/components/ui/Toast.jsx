import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastState } from '../../hooks/useToast';

const icons = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error: <XCircle size={18} className="text-red-500 shrink-0" />,
  info: <Info size={18} className="text-blue-500 shrink-0" />,
};

const styles = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

function ToastItem({ toast, onRemove }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[280px] max-w-sm ${styles[toast.variant] || styles.info}`}
    >
      {icons[toast.variant] || icons.info}
      <p className="text-sm text-slate-700 flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
