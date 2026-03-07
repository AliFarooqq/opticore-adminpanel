import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  DESIGNS, DESIGN_LABELS,
  MATERIALS, MATERIAL_LABELS,
  LENS_TYPES, LENS_TYPE_LABELS,
  GEOMETRIES, GEOMETRY_LABELS,
  REFRACTIVE_INDICES,
  CYL_FORMAT_LABELS,
  IVL_DIAMETER_OPTIONS,
} from '../../constants/lensOptions';
import { createIvlLens, updateIvlLens } from '../../services/ivlLensesService';
import { useToast } from '../../hooks/useToast';

const NUMERIC_DIAMETERS = IVL_DIAMETER_OPTIONS.filter(d => d !== 'all');

function genId() { return Math.random().toString(36).slice(2, 9); }

// ── Bottom sheet primitives ──────────────────────────────────────────────────

function BottomSheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1200,
        }}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderRadius: '18px 18px 0 0',
        zIndex: 1201,
        maxHeight: '65vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -6px 32px rgba(0,0,0,0.14)',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '12px 0 6px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#cbd5e1' }} />
        </div>
        {/* Title */}
        {title && (
          <div style={{ padding: '6px 20px 14px', fontWeight: 700, fontSize: 15, color: '#0f172a', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            {title}
          </div>
        )}
        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}

// Single-select bottom sheet selector
function BottomSheetSelector({ label, options, labels, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 44, padding: '0 14px',
          borderRadius: 10, border: '1.5px solid #e2e8f0',
          background: '#f8fafc', cursor: 'pointer',
          fontSize: 14, color: '#0f172a', fontWeight: 500,
          textAlign: 'left', width: '100%',
        }}
      >
        <span>{labels?.[value] || value || '—'}</span>
        <span style={{ color: '#94a3b8', fontSize: 11 }}>▾</span>
      </button>
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title={label}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => { onChange(opt); setOpen(false); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, textAlign: 'left',
              color: value === opt ? '#1e3a5f' : '#374151',
              fontWeight: value === opt ? 700 : 400,
              borderBottom: '1px solid #f8fafc',
            }}
          >
            <span>{labels?.[opt] || opt}</span>
            {value === opt && (
              <span style={{ color: '#1e3a5f', fontWeight: 700, fontSize: 16 }}>✓</span>
            )}
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}

// Diameter input: Single or Range mode
const DIAMETER_LABELS = Object.fromEntries(NUMERIC_DIAMETERS.map(d => [d, `${d} mm`]));

function DiameterInput({ value, onChange }) {
  const mode = value?.mode || 'single';

  function setMode(m) {
    if (m === 'single') onChange({ mode: 'single', value: '' });
    else onChange({ mode: 'range', from: '', to: '' });
  }

  const toOptions = mode === 'range' && value?.from
    ? NUMERIC_DIAMETERS.filter(d => parseFloat(d) > parseFloat(value.from))
    : NUMERIC_DIAMETERS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <ToggleGroup
        options={['single', 'range']}
        labels={{ single: 'Single', range: 'Range' }}
        value={mode}
        onChange={setMode}
      />
      {mode === 'single' ? (
        <BottomSheetSelector
          label="Diameter"
          options={NUMERIC_DIAMETERS}
          labels={DIAMETER_LABELS}
          value={value?.value || ''}
          onChange={v => onChange({ mode: 'single', value: v })}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <BottomSheetSelector
            label="From"
            options={NUMERIC_DIAMETERS}
            labels={DIAMETER_LABELS}
            value={value?.from || ''}
            onChange={v => {
              const newTo = value?.to && parseFloat(value.to) > parseFloat(v) ? value.to : '';
              onChange({ mode: 'range', from: v, to: newTo });
            }}
          />
          <BottomSheetSelector
            label="To"
            options={toOptions}
            labels={DIAMETER_LABELS}
            value={value?.to || ''}
            onChange={v => onChange({ mode: 'range', from: value?.from || '', to: v })}
          />
        </div>
      )}
    </div>
  );
}

// ── Remaining inline selectors ────────────────────────────────────────────────

function RadioGroup({ label, options, labels, value, onChange, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: value === opt ? '1.5px solid #1e3a5f' : '1.5px solid #cbd5e1',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: value === opt ? '#1e3a5f' : '#fff',
              color: value === opt ? '#fff' : '#475569',
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {labels?.[opt] || opt}
          </button>
        ))}
      </div>
      {error && <p style={{ fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

function ToggleGroup({ options, labels, value, onChange }) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #cbd5e1', overflow: 'hidden', width: 'fit-content' }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '8px 18px',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            borderRight: '1px solid #cbd5e1',
            cursor: 'pointer',
            background: value === opt ? '#1e3a5f' : '#fff',
            color: value === opt ? '#fff' : '#475569',
            transition: 'background 0.15s, color 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {labels?.[opt] || opt}
        </button>
      ))}
    </div>
  );
}

// ── Form ─────────────────────────────────────────────────────────────────────

const defaultValues = {
  availability: 'stock',
  productName: '',
  design: 'single_vision',
  material: 'plastic',
  lensTypes: 'clear',
  refractiveIndex: '1.60',
  geometry: 'sph',
  coating: '',
  color: '',
  cylFormat: 'minus',
  wholesalePrice: '',
  retailPrice: '',
};

export default function IvlLensForm({ isOpen, onClose, supplierId, brandId, lens, onSaved, activeTab = 'all' }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([{ id: genId(), diameter: { mode: 'single', value: '' } }]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!isOpen) return;
    if (lens) {
      reset({
        productName: lens.productName || '',
        design: lens.design || 'single_vision',
        material: lens.material || 'plastic',
        lensTypes: lens.lensTypes?.[0] || 'clear',
        refractiveIndex: String(lens.refractiveIndex),
        geometry: lens.geometry || 'sph',
        coating: lens.coating || '',
        color: lens.color || '',
        availability: lens.availability || 'stock',
        cylFormat: lens.cylFormat || 'minus',
        wholesalePrice: lens.wholesalePrice != null ? String(lens.wholesalePrice) : '',
        retailPrice: lens.retailPrice != null ? String(lens.retailPrice) : '',
      });
      setVariants(lens.variants?.length ? lens.variants : [{ id: genId(), diameter: { mode: 'single', value: '' } }]);
    } else {
      reset({
        ...defaultValues,
        availability: activeTab !== 'all' ? activeTab : defaultValues.availability,
      });
      setVariants([{ id: genId(), diameter: { mode: 'single', value: '' } }]);
    }
  }, [isOpen, lens, reset, activeTab]);

  function addVariant() {
    setVariants(prev => [...prev, { id: genId(), diameter: { mode: 'single', value: '' } }]);
  }

  function removeVariant(id) {
    setVariants(prev => prev.filter(v => v.id !== id));
  }

  function updateVariantDiameter(id, diameter) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, diameter } : v));
  }

  async function onSubmit(data) {
    if (data.availability === 'rx') {
      for (const v of variants) {
        const d = v.diameter;
        if (!d) { toast.error('Each variant must have a diameter set'); return; }
        if (d.mode === 'single' && !d.value) { toast.error('Each variant must have a diameter selected'); return; }
        if (d.mode === 'range' && (!d.from || !d.to)) { toast.error('Each variant must have a complete diameter range'); return; }
      }
    }

    setLoading(true);
    try {
      const refractiveIndex = parseFloat(data.refractiveIndex);

      const payload = {
        productName: data.productName,
        design: data.design,
        material: data.material,
        lensTypes: data.lensTypes ? [data.lensTypes] : [],
        refractiveIndex,
        geometry: data.geometry,
        coating: data.coating || '',
        color: data.color || null,
        availability: data.availability,
        cylFormat: data.cylFormat,
        wholesalePrice: parseFloat(data.wholesalePrice),
        retailPrice: data.retailPrice ? parseFloat(data.retailPrice) : null,
        ...(data.availability === 'rx' ? { variants } : {}),
      };

      if (lens) {
        await updateIvlLens(supplierId, brandId, lens.id, payload);
        toast.success('Lens updated');
      } else {
        await createIvlLens(supplierId, brandId, payload);
        toast.success('Lens created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save lens');
    } finally {
      setLoading(false);
    }
  }

  const availability = watch('availability');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lens ? 'Edit IVL Lens' : 'Add IVL Lens'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Product Type */}
        <div>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>Product Type</label>
          {lens ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '8px 18px', borderRadius: 8,
              background: '#1e3a5f', color: '#fff',
              fontSize: 14, fontWeight: 600,
            }}>
              {lens.availability === 'stock' ? 'Stock' : 'RX'}
            </div>
          ) : activeTab !== 'all' ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '8px 18px', borderRadius: 8,
              background: '#1e3a5f', color: '#fff',
              fontSize: 14, fontWeight: 600,
            }}>
              {activeTab === 'stock' ? 'Stock' : 'RX'}
            </div>
          ) : (
            <Controller
              name="availability"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  options={['stock', 'rx']}
                  labels={{ stock: 'Stock', rx: 'RX' }}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          )}
        </div>

        {/* Basic Info */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Basic Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Product Name *"
              error={errors.productName?.message}
              {...register('productName', { required: 'Product name is required' })}
            />

            <Controller
              name="design"
              control={control}
              render={({ field }) => (
                <BottomSheetSelector
                  label="Design"
                  options={DESIGNS}
                  labels={DESIGN_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="material"
              control={control}
              render={({ field }) => (
                <BottomSheetSelector
                  label="Material"
                  options={MATERIALS}
                  labels={MATERIAL_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </section>

        {/* Lens Characteristics */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Lens Characteristics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Controller
              name="lensTypes"
              control={control}
              render={({ field }) => (
                <BottomSheetSelector
                  label="Lens Type"
                  options={LENS_TYPES}
                  labels={LENS_TYPE_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Refractive Index */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Refractive Index</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {REFRACTIVE_INDICES.map(idx => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setValue('refractiveIndex', String(idx))}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: watch('refractiveIndex') === String(idx) ? '1.5px solid #1e3a5f' : '1.5px solid #cbd5e1',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: watch('refractiveIndex') === String(idx) ? '#1e3a5f' : '#fff',
                      color: watch('refractiveIndex') === String(idx) ? '#fff' : '#475569',
                      transition: 'background 0.15s, color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {idx.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            <Controller
              name="geometry"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  label="Geometry"
                  options={GEOMETRIES}
                  labels={GEOMETRY_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Input label="Coating" {...register('coating')} />
            <Input label="Color (optional)" {...register('color')} />
          </div>
        </section>

        {/* Variants — RX only */}
        {availability === 'rx' && (
          <section>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Variants</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {variants.map((v, i) => (
                <div
                  key={v.id}
                  style={{
                    border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 16px',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Variant {i + 1}</span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(v.id)}
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer',
                          color: '#94a3b8', fontSize: 18, lineHeight: 1, padding: '2px 6px',
                          borderRadius: 6,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <DiameterInput
                    value={v.diameter}
                    onChange={(diameter) => updateVariantDiameter(v.id, diameter)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0', borderRadius: 10,
                  border: '1.5px dashed #cbd5e1', background: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#64748b',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.color = '#1e3a5f'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
              >
                + Add Variant
              </button>
            </div>
          </section>
        )}

        {/* Format */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Format</h3>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>CYL Format</label>
            <Controller
              name="cylFormat"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  options={['plus', 'minus']}
                  labels={CYL_FORMAT_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Pricing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Wholesale Price *"
              type="number"
              step="10"
              prefix="€"
              error={errors.wholesalePrice?.message}
              {...register('wholesalePrice', { required: 'Wholesale price is required' })}
            />
            <Input
              label="Retail Price (optional)"
              type="number"
              step="10"
              prefix="€"
              {...register('retailPrice')}
            />
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {lens ? 'Save Changes' : 'Add Lens'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
