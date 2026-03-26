import { useState } from 'react';
import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react';

export default function TintColorsEditor({ tintTypes, tintColors, onChange, saving }) {
  const [newTypeInput, setNewTypeInput] = useState('');
  const [colorInputs, setColorInputs] = useState({});

  function getColorInput(type) { return colorInputs[type] || ''; }
  function setColorInput(type, val) { setColorInputs(prev => ({ ...prev, [type]: val })); }

  function handleAddType() {
    const val = newTypeInput.trim();
    if (!val || tintTypes.includes(val)) return;
    onChange([...tintTypes, val], { ...tintColors, [val]: [] });
    setNewTypeInput('');
  }

  function handleRemoveType(type) {
    const newColors = { ...tintColors };
    delete newColors[type];
    onChange(tintTypes.filter(t => t !== type), newColors);
  }

  function handleMoveType(index, direction) {
    const next = [...tintTypes];
    const target = direction === 'up' ? index - 1 : index + 1;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next, tintColors);
  }

  function handleAddColor(type) {
    const val = getColorInput(type).trim();
    if (!val) return;
    const existing = tintColors[type] || [];
    if (existing.includes(val)) return;
    onChange(tintTypes, { ...tintColors, [type]: [...existing, val] });
    setColorInput(type, '');
  }

  function handleRemoveColor(type, color) {
    onChange(tintTypes, { ...tintColors, [type]: (tintColors[type] || []).filter(c => c !== color) });
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
    }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Tint Types &amp; Colors
      </h3>

      {/* Tint type rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tintTypes.length === 0 && (
          <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>No tint types added yet.</p>
        )}
        {tintTypes.map((type, index) => {
          const colors = tintColors[type] || [];
          const colorInput = getColorInput(type);
          return (
            <div key={type} style={{ borderRadius: 9, border: '1px solid #e2e8f0', padding: '10px 12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Type header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginRight: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleMoveType(index, 'up')}
                    disabled={saving || index === 0}
                    style={{ border: 'none', background: 'none', padding: 3, borderRadius: 5, color: '#94a3b8', display: 'flex', alignItems: 'center', opacity: index === 0 ? 0.2 : 1, cursor: index === 0 || saving ? 'default' : 'pointer', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { if (index !== 0 && !saving) { e.currentTarget.style.color = '#1e3a5f'; e.currentTarget.style.background = '#e8edf5'; }}}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveType(index, 'down')}
                    disabled={saving || index === tintTypes.length - 1}
                    style={{ border: 'none', background: 'none', padding: 3, borderRadius: 5, color: '#94a3b8', display: 'flex', alignItems: 'center', opacity: index === tintTypes.length - 1 ? 0.2 : 1, cursor: index === tintTypes.length - 1 || saving ? 'default' : 'pointer', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { if (index !== tintTypes.length - 1 && !saving) { e.currentTarget.style.color = '#1e3a5f'; e.currentTarget.style.background = '#e8edf5'; }}}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', flex: 1 }}>{type}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveType(type)}
                  disabled={saving}
                  style={{ border: 'none', background: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { if (!saving) { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Color chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 22 }}>
                {colors.length === 0 ? (
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>No colors yet.</span>
                ) : (
                  colors.map(color => (
                    <span
                      key={color}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: '#e0e7ef', color: '#1e3a5f',
                        fontSize: 12, fontWeight: 500, borderRadius: 20,
                        padding: '2px 8px 2px 10px',
                      }}
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(type, color)}
                        disabled={saving}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: saving ? 'not-allowed' : 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', lineHeight: 1 }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add color row */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={colorInput}
                  onChange={e => setColorInput(type, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddColor(type)}
                  placeholder={`Add color to ${type}…`}
                  disabled={saving}
                  style={{
                    flex: 1, height: 34, padding: '0 10px', borderRadius: 7,
                    border: '1.5px solid #e2e8f0', fontSize: 12, color: '#0f172a',
                    background: '#fff', outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1a3a5c'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                <button
                  type="button"
                  onClick={() => handleAddColor(type)}
                  disabled={saving || !colorInput.trim()}
                  style={{
                    height: 34, padding: '0 12px', borderRadius: 7,
                    border: 'none', background: '#1e3a5f', color: '#fff',
                    cursor: saving || !colorInput.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 600, opacity: !colorInput.trim() ? 0.5 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add tint type row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <input
          value={newTypeInput}
          onChange={e => setNewTypeInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddType()}
          placeholder="New tint type…"
          disabled={saving}
          style={{
            flex: 1, height: 40, padding: '0 12px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a',
            background: '#f8fafc', outline: 'none', transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#1a3a5c'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
        />
        <button
          type="button"
          onClick={handleAddType}
          disabled={saving || !newTypeInput.trim()}
          style={{
            height: 40, padding: '0 14px', borderRadius: 8,
            border: 'none', background: '#1e3a5f', color: '#fff',
            cursor: saving || !newTypeInput.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, opacity: !newTypeInput.trim() ? 0.45 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
