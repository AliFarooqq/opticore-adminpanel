// Styled native <select> for attribute filters.
// active (non-empty) value: highlighted border + tinted background.
export default function FilterSelect({ value, onChange, options, placeholder }) {
  const active = Boolean(value);
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          height: 34,
          paddingLeft: 10,
          paddingRight: 26,
          borderRadius: 8,
          border: active ? '1.5px solid #1e3a5f' : '1.5px solid #e2e8f0',
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          color: active ? '#1e3a5f' : '#64748b',
          background: active ? '#eef2f9' : '#fff',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          transition: 'border-color 0.15s, background 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <span style={{
        position: 'absolute', right: 8, pointerEvents: 'none',
        color: active ? '#1e3a5f' : '#94a3b8', fontSize: 10, lineHeight: 1,
      }}>
        ▾
      </span>
    </div>
  );
}
