const variants = {
  green:  { background: '#dcfce7', color: '#15803d' },
  blue:   { background: '#dbeafe', color: '#1d4ed8' },
  red:    { background: '#fee2e2', color: '#b91c1c' },
  gray:   { background: '#f1f5f9', color: '#475569' },
  amber:  { background: '#fef3c7', color: '#b45309' },
  purple: { background: '#f3e8ff', color: '#7e22ce' },
};

export default function Badge({ variant = 'gray', children, className = '' }) {
  const colors = variants[variant] || variants.gray;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...colors,
      }}
    >
      {children}
    </span>
  );
}
