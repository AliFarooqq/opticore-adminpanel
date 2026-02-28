import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary:   { background: '#0f2540', color: '#fff', border: 'none' },
  secondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db' },
  danger:    { background: '#ef4444', color: '#fff', border: 'none' },
  ghost:     { background: 'transparent', color: '#374151', border: 'none' },
  accent:    { background: '#3b82f6', color: '#fff', border: 'none' },
};

const sizeStyles = {
  sm: { height: 34, paddingLeft: 12, paddingRight: 12, fontSize: 13 },
  md: { height: 42, paddingLeft: 16, paddingRight: 16, fontSize: 14 },
  lg: { height: 52, paddingLeft: 24, paddingRight: 24, fontSize: 15 },
};

const hoverMap = {
  primary:   '#163150',
  secondary: '#f1f5f9',
  danger:    '#dc2626',
  ghost:     '#f1f5f9',
  accent:    '#2563eb',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
}) {
  const vStyle = variantStyles[variant] || variantStyles.primary;
  const sStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        ...vStyle,
        ...sStyle,
        boxSizing: 'border-box',
        borderRadius: 10,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'background 0.15s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!disabled && !loading && hoverMap[variant]) {
          e.currentTarget.style.background = hoverMap[variant];
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = vStyle.background;
        }
      }}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
