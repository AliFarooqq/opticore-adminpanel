import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, X, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { getBrands, updateBrandMeta } from '../services/brandsService';
import { getIvlSupplier } from '../services/ivlSuppliersService';
import { getContactSupplier } from '../services/contactSuppliersService';
import { useFirestoreCollection, useFirestoreDoc } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';

// ── Reusable list section ─────────────────────────────────────────────────────

function MetaSection({ title, items, onAdd, onRemove }) {
  const [input, setInput] = useState('');

  function handleAdd() {
    const val = input.trim();
    if (!val) return;
    onAdd(val);
    setInput('');
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
    }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {title}
      </h3>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 48 }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>No {title.toLowerCase()} added yet.</p>
        ) : (
          items.map(item => (
            <div
              key={item}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 9,
                background: '#f8fafc', border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{item}</span>
              <button
                onClick={() => onRemove(item)}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: '#94a3b8', display: 'flex', alignItems: 'center',
                  padding: 4, borderRadius: 5, transition: 'color 0.15s, background 0.15s',
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

      {/* Add row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`New ${title.toLowerCase().replace(/s$/, '')}…`}
          style={{
            flex: 1, height: 40, padding: '0 12px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a',
            background: '#f8fafc', outline: 'none', transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#1a3a5c'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          style={{
            height: 40, padding: '0 14px', borderRadius: 8,
            border: 'none', background: '#1e3a5f', color: '#fff',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
            opacity: input.trim() ? 1 : 0.45,
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BrandMetaPage({ supplierType }) {
  const { supplierId, brandId } = useParams();
  const toast = useToast();

  const isIvl = supplierType === 'ivl';
  const basePath = isIvl ? '/ivl-suppliers' : '/contact-suppliers';
  const suppliersLabel = isIvl ? 'IVL Suppliers' : 'Contact Suppliers';
  const getSupplierFn = isIvl ? getIvlSupplier : getContactSupplier;

  const { data: supplier } = useFirestoreDoc(() => getSupplierFn(supplierId), [supplierId]);
  const { data: brands } = useFirestoreCollection(() => getBrands(supplierId), [supplierId]);
  const brand = brands.find(b => b.id === brandId);

  const [coatings, setCoatings] = useState([]);
  const [colors, setColors] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (brand) {
      setCoatings(brand.coatings || []);
      setColors(brand.colors || []);
      setDirty(false);
    }
  }, [brand?.id]);

  function addCoating(val) {
    if (coatings.includes(val)) return;
    setCoatings(prev => [...prev, val]);
    setDirty(true);
  }

  function removeCoating(val) {
    setCoatings(prev => prev.filter(c => c !== val));
    setDirty(true);
  }

  function addColor(val) {
    if (colors.includes(val)) return;
    setColors(prev => [...prev, val]);
    setDirty(true);
  }

  function removeColor(val) {
    setColors(prev => prev.filter(c => c !== val));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateBrandMeta(brandId, { coatings, colors });
      toast.success('Brand metadata saved');
      setDirty(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title={brand ? `${brand.name} — Metadata` : 'Brand Metadata'} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
        <div className="page-content" style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 40px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to={basePath} style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              {suppliersLabel}
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <Link to={`${basePath}/${supplierId}/brands`} style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              {supplier?.name || '…'}
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{brand?.name || '…'}</span>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Metadata</span>
          </nav>

          {/* Description */}
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, margin: '0 0 24px 0' }}>
            Manage the coatings and colors available for <strong>{brand?.name}</strong>.
            These will appear as dropdown options when creating or editing lenses for this brand.
          </p>

          {/* Two sections side by side */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <MetaSection
              title="Coatings"
              items={coatings}
              onAdd={addCoating}
              onRemove={removeCoating}
            />
            <MetaSection
              title="Colors"
              items={colors}
              onAdd={addColor}
              onRemove={removeColor}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, gap: 12 }}>
            {dirty && (
              <span style={{ fontSize: 13, color: '#f59e0b', alignSelf: 'center', fontWeight: 500 }}>
                Unsaved changes
              </span>
            )}
            <Button onClick={handleSave} loading={saving} disabled={!dirty || saving}>
              Save Changes
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
