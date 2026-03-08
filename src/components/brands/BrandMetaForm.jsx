import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { updateBrandMeta } from '../../services/brandsService';
import { useToast } from '../../hooks/useToast';

function MetaList({ title, items, onAdd, onRemove, saving }) {
  const [input, setInput] = useState('');

  function handleAdd() {
    const val = input.trim();
    if (!val) return;
    onAdd(val);
    setInput('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
        {title}
      </h4>

      {/* Items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 40 }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>No {title.toLowerCase()} added yet.</p>
        ) : (
          items.map(item => (
            <div
              key={item}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8,
                background: '#f8fafc', border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item}</span>
              <button
                onClick={() => onRemove(item)}
                disabled={saving}
                style={{
                  border: 'none', background: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 5,
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`Add ${title.toLowerCase().replace(/s$/, '')}…`}
          disabled={saving}
          style={{
            flex: 1, height: 40, padding: '0 12px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a',
            background: '#f8fafc', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#1a3a5c'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !input.trim()}
          style={{
            height: 40, padding: '0 14px', borderRadius: 8,
            border: 'none', background: '#1e3a5f', color: '#fff',
            cursor: saving || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, opacity: !input.trim() ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

export default function BrandMetaForm({ isOpen, onClose, brand, onSaved }) {
  const toast = useToast();
  const [coatings, setCoatings] = useState([]);
  const [colors, setColors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && brand) {
      setCoatings(brand.coatings || []);
      setColors(brand.colors || []);
    }
  }, [isOpen, brand]);

  async function persist(updatedCoatings, updatedColors) {
    setSaving(true);
    try {
      await updateBrandMeta(brand.id, { coatings: updatedCoatings, colors: updatedColors });
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function addCoating(val) {
    if (coatings.includes(val)) return;
    const updated = [...coatings, val];
    setCoatings(updated);
    persist(updated, colors);
  }

  function removeCoating(val) {
    const updated = coatings.filter(c => c !== val);
    setCoatings(updated);
    persist(updated, colors);
  }

  function addColor(val) {
    if (colors.includes(val)) return;
    const updated = [...colors, val];
    setColors(updated);
    persist(coatings, updated);
  }

  function removeColor(val) {
    const updated = colors.filter(c => c !== val);
    setColors(updated);
    persist(coatings, updated);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={brand ? `Coatings & Colors — ${brand.name}` : 'Coatings & Colors'}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <MetaList
          title="Coatings"
          items={coatings}
          onAdd={addCoating}
          onRemove={removeCoating}
          saving={saving}
        />

        <div style={{ height: 1, background: '#e2e8f0' }} />

        <MetaList
          title="Colors"
          items={colors}
          onAdd={addColor}
          onRemove={removeColor}
          saving={saving}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
