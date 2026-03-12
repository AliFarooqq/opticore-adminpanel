import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search…', width = 220 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Search
        size={14}
        style={{ position: 'absolute', left: 10, color: '#94a3b8', pointerEvents: 'none', flexShrink: 0 }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 38,
          paddingLeft: 32,
          paddingRight: value ? 30 : 12,
          borderRadius: 9,
          border: '1.5px solid #e2e8f0',
          fontSize: 13,
          color: '#0f172a',
          background: '#fff',
          outline: 'none',
          width,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = '#1e3a5f')}
        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', display: 'flex', alignItems: 'center',
            padding: 2, borderRadius: 4,
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
