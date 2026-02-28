import { useState } from 'react';
import { MousePointer2, Square, Triangle, Zap, Eraser, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const MODES = [
  { id: 'select', label: 'Select Cell', icon: MousePointer2 },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'triangle', label: 'Triangle Fill', icon: Triangle },
  { id: 'quickfill', label: 'Quick Fill', icon: Zap },
  { id: 'erase', label: 'Erase', icon: Eraser },
];

const inputStyle = {
  border: '1.5px solid #cbd5e1',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#0f172a',
  background: '#fff',
};

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: 0,
  marginBottom: 8,
};

export default function GridToolbar({
  activeMode,
  onModeChange,
  cylFormat,
  onToggleCylFormat,
  onQuickFill,
  onFillTriangle,
  onEraseAll,
  selectedDiameters,
}) {
  const [triangleMax, setTriangleMax] = useState(4.0);
  const [qfSphMin, setQfSphMin] = useState(-6);
  const [qfSphMax, setQfSphMax] = useState(6);
  const [qfCylMin, setQfCylMin] = useState(0);
  const [qfCylMax, setQfCylMax] = useState(-4);

  return (
    <div style={{
      width: 210,
      background: '#f1f5f9',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      flexShrink: 0,
      padding: 12,
      gap: 8,
    }}>

      {/* Tools section */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={sectionLabel}>Drawing Tools</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 8px' }}>
          {MODES.map(({ id, label, icon: Icon }) => (
            <div key={id}>
              <button
                onClick={() => onModeChange(id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  border: activeMode === id ? '1.5px solid #1e3a5f' : '1.5px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                  background: activeMode === id ? '#1e3a5f' : 'transparent',
                  color: activeMode === id ? '#fff' : '#475569',
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { if (activeMode !== id) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                onMouseLeave={e => { if (activeMode !== id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
              >
                <Icon size={15} />
                {label}
              </button>

              {/* Triangle options */}
              {id === 'triangle' && activeMode === 'triangle' && (
                <div style={{ margin: '4px 4px 4px 8px', padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Max Sum (SPH + CYL ≤)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={triangleMax}
                    onChange={e => setTriangleMax(parseFloat(e.target.value))}
                    style={inputStyle}
                  />
                  <Button size="sm" onClick={() => onFillTriangle(triangleMax, selectedDiameters)}>
                    Fill Triangle
                  </Button>
                </div>
              )}

              {/* Quick Fill options */}
              {id === 'quickfill' && activeMode === 'quickfill' && (
                <div style={{ margin: '4px 4px 4px 8px', padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'SPH Min', val: qfSphMin, set: setQfSphMin },
                      { label: 'SPH Max', val: qfSphMax, set: setQfSphMax },
                      { label: 'CYL Min', val: qfCylMin, set: setQfCylMin },
                      { label: 'CYL Max', val: qfCylMax, set: setQfCylMax },
                    ].map(({ label, val, set }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{label}</label>
                        <input
                          type="number"
                          step="0.25"
                          value={val}
                          onChange={e => set(parseFloat(e.target.value))}
                          style={{ ...inputStyle, fontSize: 12 }}
                        />
                      </div>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => onQuickFill(qfSphMin, qfSphMax, qfCylMin, qfCylMax, selectedDiameters)}>
                    Fill Rectangle
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CYL Format section */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px' }}>
        <p style={sectionLabel}>CYL Format</p>
        <div style={{ display: 'flex', borderRadius: 8, border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
          {['plus', 'minus'].map(f => (
            <button
              key={f}
              onClick={onToggleCylFormat}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: cylFormat === f ? '#1e3a5f' : '#fff',
                color: cylFormat === f ? '#fff' : '#64748b',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {f === 'plus' ? '+CYL' : '−CYL'}
            </button>
          ))}
        </div>
      </div>

      {/* Danger section */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '8px' }}>
        <button
          onClick={onEraseAll}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '9px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: '1.5px solid transparent',
            cursor: 'pointer',
            background: 'transparent',
            color: '#ef4444',
            transition: 'background 0.15s, border-color 0.15s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <Trash2 size={15} />
          Erase All
        </button>
      </div>
    </div>
  );
}

