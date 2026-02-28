import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Upload } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  LENS_COLOR_LABELS, LENS_COLORS,
  VISION_TYPE_LABELS, VISION_TYPES,
  LENS_SHAPE_LABELS, LENS_SHAPES,
  WEARING_TIMES, WEARING_TIME_LABELS,
  PACK_TYPES, PACK_TYPE_LABELS,
} from '../../constants/lensOptions';
import { createContactLens, updateContactLens, uploadContactLensImage } from '../../services/contactLensesService';
import { useToast } from '../../hooks/useToast';

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

function RangeInputs({ label, prefix, step = 0.25, register, errors, required = false }) {
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input
          label="Min"
          type="number"
          step={step}
          error={errors?.[`${prefix}Min`]?.message}
          {...register(`${prefix}Min`, required ? { required: `${label} Min is required` } : {})}
        />
        <Input
          label="Max"
          type="number"
          step={step}
          error={errors?.[`${prefix}Max`]?.message}
          {...register(`${prefix}Max`, required ? { required: `${label} Max is required` } : {})}
        />
      </div>
    </div>
  );
}

function TagInput({ label, values, onAdd, onRemove, placeholder = 'Type and press Enter' }) {
  const [inputValue, setInputValue] = useState('');

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = parseFloat(inputValue.replace(',', '.'));
      if (!isNaN(val) && !values.includes(val)) {
        onAdd(val);
      }
      setInputValue('');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, borderRadius: 8, border: '1.5px solid #cbd5e1', background: '#fff', minHeight: 44, alignItems: 'center' }}>
        {values.map(v => (
          <span
            key={v}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: '#dbeafe', color: '#1d4ed8', fontSize: 13 }}
          >
            {v}
            <button type="button" onClick={() => onRemove(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="number"
          step="0.01"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : ''}
          style={{ flex: 1, minWidth: 80, outline: 'none', fontSize: 14, color: '#374151', background: 'transparent', border: 'none' }}
        />
      </div>
    </div>
  );
}

const defaultValues = {
  productName: '',
  lensColor: 'clear',
  visionType: 'single_vision',
  lensShape: 'spherical',
  wearingTime: 'monthly',
  packType: '6_pack',
  sphMin: '', sphMax: '',
  cylMin: '', cylMax: '',
  axisMin: '', axisMax: '',
  addMin: '', addMax: '',
  price: '',
};

export default function ContactLensForm({ isOpen, onClose, supplierId, brandId, lens, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [baseCurves, setBaseCurves] = useState([]);
  const [diameters, setDiameters] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const lensShape = watch('lensShape');
  const visionType = watch('visionType');

  useEffect(() => {
    if (!isOpen) return;
    if (lens) {
      reset({
        productName: lens.productName || '',
        lensColor: lens.lensColor || 'clear',
        visionType: lens.visionType || 'single_vision',
        lensShape: lens.lensShape || 'spherical',
        wearingTime: lens.wearingTime || 'monthly',
        packType: lens.packType || '6_pack',
        sphMin: lens.sphRange?.min ?? '', sphMax: lens.sphRange?.max ?? '',
        cylMin: lens.cylRange?.min ?? '', cylMax: lens.cylRange?.max ?? '',
        axisMin: lens.axisRange?.min ?? '', axisMax: lens.axisRange?.max ?? '',
        addMin: lens.addRange?.min ?? '', addMax: lens.addRange?.max ?? '',
        price: lens.price != null ? String(lens.price) : '',
      });
      setBaseCurves(lens.baseCurves || []);
      setDiameters(lens.diameters || []);
      setImagePreview(lens.productImageUrl || '');
    } else {
      reset(defaultValues);
      setBaseCurves([]);
      setDiameters([]);
      setImagePreview('');
    }
    setImageFile(null);
  }, [isOpen, lens, reset]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      const isToric = data.lensShape === 'toric';
      const isMultifocal = data.visionType === 'multifocal';

      const parseRange = (min, max, step) =>
        min !== '' && max !== ''
          ? { min: parseFloat(min), max: parseFloat(max), step }
          : null;

      const payload = {
        productName: data.productName,
        productImageUrl: lens?.productImageUrl || '',
        lensColor: data.lensColor,
        visionType: data.visionType,
        lensShape: data.lensShape,
        wearingTime: data.wearingTime,
        packType: data.packType,
        sphRange: parseRange(data.sphMin, data.sphMax, 0.25),
        cylRange: isToric ? parseRange(data.cylMin, data.cylMax, 0.25) : null,
        axisRange: isToric ? parseRange(data.axisMin, data.axisMax, 1) : null,
        addRange: isMultifocal ? parseRange(data.addMin, data.addMax, 0.25) : null,
        baseCurves,
        diameters,
        price: parseFloat(data.price),
      };

      let savedId;
      if (lens) {
        await updateContactLens(supplierId, brandId, lens.id, payload);
        savedId = lens.id;
        toast.success('Contact lens updated');
      } else {
        savedId = await createContactLens(supplierId, brandId, payload);
        toast.success('Contact lens created');
      }

      if (imageFile) {
        const imageUrl = await uploadContactLensImage(savedId, imageFile);
        await updateContactLens(supplierId, brandId, savedId, { productImageUrl: imageUrl });
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save contact lens');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lens ? 'Edit Contact Lens' : 'Add Contact Lens'}
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

            {/* Image upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Product Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'contain', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <Upload size={18} style={{ color: '#94a3b8' }} />
                  </div>
                )}
                <label style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: 14, color: '#2563eb', fontWeight: 500 }}>
                    {imagePreview ? 'Change image' : 'Upload image'}
                  </span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Classification */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Lens Classification</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { name: 'lensColor', label: 'Lens Color', options: LENS_COLORS, labels: LENS_COLOR_LABELS },
              { name: 'visionType', label: 'Vision Type', options: VISION_TYPES, labels: VISION_TYPE_LABELS },
              { name: 'lensShape', label: 'Lens Shape', options: LENS_SHAPES, labels: LENS_SHAPE_LABELS },
            ].map(({ name, label, options, labels }) => (
              <div key={name}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>{label}</label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <ToggleGroup options={options} labels={labels} value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Wearing Time</label>
              <select
                style={{ width: '100%', borderRadius: 8, border: '1.5px solid #cbd5e1', padding: '10px 14px', fontSize: 14, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                {...register('wearingTime')}
              >
                {WEARING_TIMES.map(t => (
                  <option key={t} value={t}>{WEARING_TIME_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>Pack Type</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {PACK_TYPES.map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                    <input type="radio" value={p} {...register('packType')} style={{ accentColor: '#1e3a5f', width: 16, height: 16 }} />
                    {PACK_TYPE_LABELS[p]}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Power Ranges */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Power Ranges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RangeInputs label="SPH Range" prefix="sph" step={0.25} register={register} errors={errors} required />
            {lensShape === 'toric' && (
              <>
                <RangeInputs label="CYL Range" prefix="cyl" step={0.25} register={register} errors={errors} required />
                <RangeInputs label="Axis Range" prefix="axis" step={1} register={register} errors={errors} required />
              </>
            )}
            {visionType === 'multifocal' && (
              <RangeInputs label="ADD Range" prefix="add" step={0.25} register={register} errors={errors} required />
            )}
          </div>
        </section>

        {/* Parameters */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Parameters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TagInput
              label="Base Curves"
              values={baseCurves}
              onAdd={v => setBaseCurves(prev => [...prev, v])}
              onRemove={v => setBaseCurves(prev => prev.filter(x => x !== v))}
              placeholder="Type a value and press Enter"
            />
            <TagInput
              label="Diameters"
              values={diameters}
              onAdd={v => setDiameters(prev => [...prev, v])}
              onRemove={v => setDiameters(prev => prev.filter(x => x !== v))}
              placeholder="Type a value and press Enter"
            />
            <Input
              label="Price *"
              type="number"
              step="0.01"
              prefix="€"
              error={errors.price?.message}
              {...register('price', { required: 'Price is required' })}
            />
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {lens ? 'Save Changes' : 'Add Contact Lens'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
