import { useEffect, useState } from 'react';
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

const defaultValues = {
  productName: '',
  design: 'single_vision',
  material: 'plastic',
  lensTypes: [],
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
        lensTypes: lens.lensTypes || [],
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

  const lensTypesValue = watch('lensTypes');

  function toggleLensType(type) {
    const current = lensTypesValue || [];
    if (current.includes(type)) {
      setValue('lensTypes', current.filter(t => t !== type));
    } else {
      setValue('lensTypes', [...current, type]);
    }
  }

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

            <Controller
              name="design"
              control={control}
              render={({ field }) => (
                <RadioGroup
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
                <RadioGroup
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
            {/* Lens Types */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>Lens Types</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {LENS_TYPES.map(type => {
                  const checked = lensTypesValue?.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleLensType(type)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: checked ? '1.5px solid #3b82f6' : '1.5px solid #cbd5e1',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: checked ? '#3b82f6' : '#fff',
                        color: checked ? '#fff' : '#475569',
                        transition: 'background 0.15s, color 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {LENS_TYPE_LABELS[type]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Refractive Index */}
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
