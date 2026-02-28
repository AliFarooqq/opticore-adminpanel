import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { COMMON_DIAMETERS, DIAMETER_COLORS } from '../../constants/lensOptions';

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 10px 0',
};

const card = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  padding: '12px 14px',
};

export default function DiameterPanel({
  selectedCells,
  cells,
  onApply,
  stats,
}) {
  const [checked, setChecked] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [customDiams, setCustomDiams] = useState([]);

  const allDiams = [...checked, ...customDiams];

  function toggleCommon(d) {
    setChecked(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function addCustom(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = parseFloat(customInput);
      if (!isNaN(val) && !customDiams.includes(val) && !COMMON_DIAMETERS.includes(val)) {
        setCustomDiams(prev => [...prev, val]);
      }
      setCustomInput('');
    }
  }

  function removeCustom(d) {
    setCustomDiams(prev => prev.filter(x => x !== d));
  }

  return (
    <div style={{ width: 248, background: '#f1f5f9', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0, padding: 12, gap: 8 }}>

      {/* Assign Diameters card */}
      <div style={card}>
        <p style={sectionLabel}>Assign Diameters</p>
        <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedCells.size}</span> cells selected
        </p>

        {/* Common diameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {COMMON_DIAMETERS.map(d => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
              <input
                type="checkbox"
                checked={checked.includes(d)}
                onChange={() => toggleCommon(d)}
                style={{ accentColor: '#1e3a5f', width: 15, height: 15, flexShrink: 0 }}
              />
              <span style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, backgroundColor: DIAMETER_COLORS[d] || '#6b7280' }} />
              {d}
            </label>
          ))}
        </div>

        {/* Custom input */}
        <input
          type="number"
          step="0.5"
          placeholder="Custom diameter + Enter"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={addCustom}
          style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
        />

        {/* Custom chips */}
        {customDiams.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {customDiams.map(d => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 6, background: '#f1f5f9', color: '#374151', fontSize: 12 }}>
                {d}
                <button type="button" onClick={() => removeCustom(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, display: 'flex' }}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <Button
          disabled={selectedCells.size === 0 || allDiams.length === 0}
          onClick={() => {
            onApply(allDiams);
            setChecked([]);
            setCustomDiams([]);
          }}
        >
          Apply to Selection
        </Button>
      </div>

      {/* Grid Statistics card */}
      <div style={card}>
        <p style={sectionLabel}>Grid Statistics</p>
        <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
          Total active: <span style={{ fontWeight: 700 }}>{stats.total}</span>
        </p>
        {Object.entries(stats.byDiameter).map(([d, count]) => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', marginBottom: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, backgroundColor: DIAMETER_COLORS[d] || '#6b7280' }} />
            Diameter {d}: <span style={{ fontWeight: 600 }}>{count} cells</span>
          </div>
        ))}
        {Object.keys(stats.byDiameter).length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: 12 }}>No cells with diameters yet</p>
        )}
      </div>

      {/* Color Legend card */}
      <div style={card}>
        <p style={sectionLabel}>Color Legend</p>
        {[...COMMON_DIAMETERS, ...Object.keys(stats.byDiameter).map(Number).filter(d => !COMMON_DIAMETERS.includes(d))].map(d => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', marginBottom: 8 }}>
            <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, backgroundColor: DIAMETER_COLORS[d] || '#6b7280' }} />
            {d}
          </div>
        ))}
      </div>

    </div>
  );
}
