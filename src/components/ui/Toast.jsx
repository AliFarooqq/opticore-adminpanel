import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastState } from '../../hooks/useToast';

const VARIANT = {
  success: { icon: <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />, bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  error:   { icon: <XCircle   size={18} color="#ef4444" style={{ flexShrink: 0 }} />, bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  info:    { icon: <Info      size={18} color="#3b82f6" style={{ flexShrink: 0 }} />, bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
};

function ToastItem({ toast, onRemove }) {
  const v = VARIANT[toast.variant] || VARIANT.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 16px',
      borderRadius: 10, border: `1px solid ${v.border}`,
      background: v.bg,
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      minWidth: 280, maxWidth: 380,
    }}>
      <div style={{ paddingTop: 1 }}>{v.icon}</div>
      <p style={{ fontSize: 13, color: '#334155', flex: 1, lineHeight: 1.5, margin: 0 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 0', color: '#94a3b8', flexShrink: 0 }}
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
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
