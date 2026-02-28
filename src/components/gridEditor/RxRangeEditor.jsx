import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { COMMON_DIAMETERS } from '../../constants/lensOptions';
import { updateRxRange } from '../../services/ivlLensesService';
import { useToast } from '../../hooks/useToast';

export default function RxRangeEditor({ isOpen, onClose, supplierId, brandId, lens, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDiameters, setSelectedDiameters] = useState([]);
  const [customDiam, setCustomDiam] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { sphMin: '', sphMax: '', cylMin: '', cylMax: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    const rx = lens?.rxRange;
    reset({
      sphMin: rx?.sphMin ?? '',
      sphMax: rx?.sphMax ?? '',
      cylMin: rx?.cylMin ?? '',
      cylMax: rx?.cylMax ?? '',
    });
    setSelectedDiameters(rx?.diameters || []);
    setCustomDiam('');
  }, [isOpen, lens, reset]);

  function toggleDiameter(d) {
    setSelectedDiameters(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  }

  function addCustomDiam(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = parseFloat(customDiam);
      if (!isNaN(val) && !selectedDiameters.includes(val)) {
        setSelectedDiameters(prev => [...prev, val]);
      }
      setCustomDiam('');
    }
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      await updateRxRange(supplierId, brandId, lens.id, {
        sphMin: parseFloat(data.sphMin),
        sphMax: parseFloat(data.sphMax),
        cylMin: parseFloat(data.cylMin),
        cylMax: parseFloat(data.cylMax),
        diameters: selectedDiameters,
      });
      toast.success('RX range saved');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save RX range');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure RX Range" size="md">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="SPH Min" type="number" step="0.25" error={errors.sphMin?.message}
            {...register('sphMin', { required: 'Required' })} />
          <Input label="SPH Max" type="number" step="0.25" error={errors.sphMax?.message}
            {...register('sphMax', { required: 'Required' })} />
          <Input label="CYL Min" type="number" step="0.25" error={errors.cylMin?.message}
            {...register('cylMin', { required: 'Required' })} />
          <Input label="CYL Max" type="number" step="0.25" error={errors.cylMax?.message}
            {...register('cylMax', { required: 'Required' })} />
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>Diameters</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {COMMON_DIAMETERS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDiameter(d)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: selectedDiameters.includes(d) ? '1.5px solid #1e3a5f' : '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedDiameters.includes(d) ? '#1e3a5f' : '#fff',
                  color: selectedDiameters.includes(d) ? '#fff' : '#475569',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {selectedDiameters.filter(d => !COMMON_DIAMETERS.includes(d)).map(d => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#dbeafe', color: '#1d4ed8', fontSize: 13 }}>
                {d}
                <button type="button" onClick={() => setSelectedDiameters(prev => prev.filter(x => x !== d))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <Input
              type="number"
              step="0.5"
              placeholder="Custom…"
              value={customDiam}
              onChange={e => setCustomDiam(e.target.value)}
              onKeyDown={addCustomDiam}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>Save RX Range</Button>
        </div>
      </form>
    </Modal>
  );
}
