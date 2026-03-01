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
} from '../../constants/lensOptions';
import { createIvlLens, updateIvlLens } from '../../services/ivlLensesService';
import { useToast } from '../../hooks/useToast';

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

// Multi-select bottom sheet selector with Done button
function BottomSheetMultiSelector({ label, options, labels, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);

  function handleOpen() {
    setDraft(value);
    setOpen(true);
  }

  function toggleOption(opt) {
    setDraft(prev =>
      prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
    );
  }

  function handleDone() {
    onChange(draft);
    setOpen(false);
  }

  const displayText = value.length > 0
    ? value.map(v => labels?.[v] || v).join(', ')
    : 'None selected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</label>
      <button
        type="button"
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 44, padding: '0 14px',
          borderRadius: 10, border: '1.5px solid #e2e8f0',
          background: '#f8fafc', cursor: 'pointer',
          fontSize: 14, textAlign: 'left', width: '100%',
          color: value.length > 0 ? '#0f172a' : '#94a3b8',
          fontWeight: value.length > 0 ? 500 : 400,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
          {displayText}
        </span>
        <span style={{ color: '#94a3b8', fontSize: 11, flexShrink: 0 }}>▾</span>
      </button>

      {/* Selected tags displayed below the field */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map(v => (
            <span
              key={v}
              style={{
                padding: '3px 10px', borderRadius: 20,
                background: '#eff6ff', color: '#1e3a5f',
                fontSize: 12, fontWeight: 600,
                border: '1px solid #bfdbfe',
              }}
            >
              {labels?.[v] || v}
            </span>
          ))}
        </div>
      )}

      <BottomSheet isOpen={open} onClose={handleDone} title={label}>
        <div>
          {options.map(opt => {
            const checked = draft.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleOption(opt)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '15px 20px', border: 'none', cursor: 'pointer',
                  fontSize: 14, textAlign: 'left',
                  background: checked ? '#f0f7ff' : '#fff',
                  color: checked ? '#1e3a5f' : '#374151',
                  fontWeight: checked ? 700 : 400,
                  borderBottom: '1px solid #f8fafc',
                }}
              >
                <span>{labels?.[opt] || opt}</span>
                {checked && (
                  <span style={{ color: '#1e3a5f', fontWeight: 700, fontSize: 16 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
        {/* Done button */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleDone}
            style={{
              width: '100%', height: 48, borderRadius: 12, border: 'none',
              background: '#1e3a5f', color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

// ── Remaining inline selectors (Geometry, Availability, CYL Format) ──────────

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
  productName: '',
  design: 'single_vision',
  material: 'plastic',
  lensTypes: ['clear'],
  refractiveIndex: '1.60',
  refractiveIndexCustom: '',
  geometry: 'sph',
  coating: '',
  color: '',
  availability: 'stock',
  cylFormat: 'minus',
  wholesalePrice: '',
  retailPrice: '',
};

export default function IvlLensForm({ isOpen, onClose, supplierId, brandId, lens, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showCustomIndex, setShowCustomIndex] = useState(false);

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
      const isCustomIndex = !REFRACTIVE_INDICES.includes(lens.refractiveIndex);
      setShowCustomIndex(isCustomIndex);
      reset({
        productName: lens.productName || '',
        design: lens.design || 'single_vision',
        material: lens.material || 'plastic',
        lensTypes: lens.lensTypes?.length ? lens.lensTypes : ['clear'],
        refractiveIndex: isCustomIndex ? 'other' : String(lens.refractiveIndex),
        refractiveIndexCustom: isCustomIndex ? String(lens.refractiveIndex) : '',
        geometry: lens.geometry || 'sph',
        coating: lens.coating || '',
        color: lens.color || '',
        availability: lens.availability || 'stock',
        cylFormat: lens.cylFormat || 'minus',
        wholesalePrice: lens.wholesalePrice != null ? String(lens.wholesalePrice) : '',
        retailPrice: lens.retailPrice != null ? String(lens.retailPrice) : '',
      });
    } else {
      setShowCustomIndex(false);
      reset(defaultValues);
    }
  }, [isOpen, lens, reset]);

  async function onSubmit(data) {
    setLoading(true);
    try {
      const refractiveIndex =
        data.refractiveIndex === 'other'
          ? parseFloat(data.refractiveIndexCustom)
          : parseFloat(data.refractiveIndex);

      const payload = {
        productName: data.productName,
        design: data.design,
        material: data.material,
        lensTypes: data.lensTypes || [],
        refractiveIndex,
        geometry: data.geometry,
        coating: data.coating || '',
        color: data.color || null,
        availability: data.availability,
        cylFormat: data.cylFormat,
        wholesalePrice: parseFloat(data.wholesalePrice),
        retailPrice: data.retailPrice ? parseFloat(data.retailPrice) : null,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lens ? 'Edit IVL Lens' : 'Add IVL Lens'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Basic Info */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Basic Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Product Name *"
              error={errors.productName?.message}
              {...register('productName', { required: 'Product name is required' })}
            />

            {/* Design — bottom sheet, single select */}
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

            {/* Material — bottom sheet, single select */}
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
            {/* Lens Types — bottom sheet, multi-select with Done button */}
            <Controller
              name="lensTypes"
              control={control}
              render={({ field }) => (
                <BottomSheetMultiSelector
                  label="Lens Types"
                  options={LENS_TYPES}
                  labels={LENS_TYPE_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Refractive Index — keep as inline buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Refractive Index</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {REFRACTIVE_INDICES.map(idx => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setValue('refractiveIndex', String(idx));
                      setShowCustomIndex(false);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: watch('refractiveIndex') === String(idx) && !showCustomIndex ? '1.5px solid #1e3a5f' : '1.5px solid #cbd5e1',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: watch('refractiveIndex') === String(idx) && !showCustomIndex ? '#1e3a5f' : '#fff',
                      color: watch('refractiveIndex') === String(idx) && !showCustomIndex ? '#fff' : '#475569',
                      transition: 'background 0.15s, color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {idx.toFixed(2)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setValue('refractiveIndex', 'other');
                    setShowCustomIndex(true);
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: showCustomIndex ? '1.5px solid #1e3a5f' : '1.5px solid #cbd5e1',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: showCustomIndex ? '#1e3a5f' : '#fff',
                    color: showCustomIndex ? '#fff' : '#475569',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  Other
                </button>
                {showCustomIndex && (
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.71"
                    {...register('refractiveIndexCustom', {
                      validate: v => !showCustomIndex || (!!v && !isNaN(v)) || 'Enter a valid index',
                    })}
                    error={errors.refractiveIndexCustom?.message}
                  />
                )}
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

        {/* Availability & Format */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Availability &amp; Format</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>Availability</label>
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
            </div>

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
