import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, prefix, suffix, className = '', style: extraStyle = {}, ...rest },
  ref
) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', letterSpacing: '0.01em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 14, color: '#64748b', fontSize: 14,
            pointerEvents: 'none', userSelect: 'none', zIndex: 1,
          }}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={className}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 48,
            paddingLeft: prefix ? 38 : 16,
            paddingRight: suffix ? 38 : 16,
            fontSize: 14,
            color: '#0f172a',
            background: error ? '#fef2f2' : '#f8fafc',
            border: `1.5px solid ${error ? '#f87171' : '#e2e8f0'}`,
            borderRadius: 10,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
            ...extraStyle,
          }}
          onFocus={e => {
            e.target.style.borderColor = '#1a3a5c';
            e.target.style.background = '#fff';
            e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.1)';
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#f87171' : '#e2e8f0';
            e.target.style.background = error ? '#fef2f2' : '#f8fafc';
            e.target.style.boxShadow = 'none';
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 14, color: '#64748b', fontSize: 14,
            pointerEvents: 'none', userSelect: 'none',
          }}>
            {suffix}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</p>}
    </div>
  );
});

export default Input;
