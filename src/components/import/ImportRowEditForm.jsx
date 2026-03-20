import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  DESIGNS, DESIGN_LABELS,
  MATERIALS, MATERIAL_LABELS,
  LENS_TYPES, LENS_TYPE_LABELS,
  GEOMETRIES, GEOMETRY_LABELS,
  CYL_FORMATS, CYL_FORMAT_LABELS,
  IVL_DIAMETER_OPTIONS,
  REFRACTIVE_INDICES,
  LENS_COLORS, LENS_COLOR_LABELS,
  VISION_TYPES, VISION_TYPE_LABELS,
  LENS_SHAPES, LENS_SHAPE_LABELS,
  WEARING_TIMES, WEARING_TIME_LABELS,
  PACK_TYPES, PACK_TYPE_LABELS,
} from '../../constants/lensOptions';

const VALID_DIAMETERS = IVL_DIAMETER_OPTIONS.filter(d => d !== 'all');

// ── Reusable field components ─────────────────────────────────────────────────

function FieldLabel({ label, hasError }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: hasError ? '#dc2626' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
      {label}
    </label>
  );
}

function FieldSelect({ label, value, onChange, options, error }) {
  return (
    <div>
      <FieldLabel label={label} hasError={!!error} />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', height: 38, padding: '0 10px', borderRadius: 8, fontSize: 13,
          border: `1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
          background: error ? '#fff5f5' : '#f8fafc', color: '#0f172a',
          outline: 'none', cursor: 'pointer',
        }}
      >
        <option value="">— select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', error, placeholder }) {
  return (
    <div>
      <FieldLabel label={label} hasError={!!error} />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: 38, padding: '0 10px', borderRadius: 8, fontSize: 13,
          border: `1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
          background: error ? '#fff5f5' : '#f8fafc', color: '#0f172a',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
      {error && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

// ── Grid helper ───────────────────────────────────────────────────────────────

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 10px' }}>
      {children}
    </p>
  );
}

// ── IVL Stock / RX edit form ──────────────────────────────────────────────────

function IvlEditFields({ fields, setField, cellErrors, type }) {
  const isRx = type === 'ivl-rx';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SectionTitle>Catalog Fields</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FieldInput label="Product Name" value={fields.productname} onChange={v => setField('productname', v)} error={cellErrors.productname} />
        <Grid>
          <FieldSelect label="Design" value={fields.design} onChange={v => setField('design', v)} error={cellErrors.design}
            options={DESIGNS.map(v => ({ value: v, label: DESIGN_LABELS[v] }))} />
          <FieldSelect label="Material" value={fields.material} onChange={v => setField('material', v)} error={cellErrors.material}
            options={MATERIALS.map(v => ({ value: v, label: MATERIAL_LABELS[v] }))} />
        </Grid>
        <Grid>
          <FieldSelect label="Lens Type" value={fields.lenstypes} onChange={v => setField('lenstypes', v)} error={cellErrors.lenstypes}
            options={LENS_TYPES.map(v => ({ value: v, label: LENS_TYPE_LABELS[v] }))} />
          <FieldSelect label="Refractive Index" value={fields.refractiveindex} onChange={v => setField('refractiveindex', v)} error={cellErrors.refractiveindex}
            options={REFRACTIVE_INDICES.map(v => ({ value: String(v), label: v.toFixed(2) }))} />
        </Grid>
        <Grid>
          <FieldSelect label="Geometry" value={fields.geometry} onChange={v => setField('geometry', v)} error={cellErrors.geometry}
            options={GEOMETRIES.map(v => ({ value: v, label: GEOMETRY_LABELS[v] }))} />
          <FieldInput label="Coating (optional)" value={fields.coating} onChange={v => setField('coating', v)} />
        </Grid>
        <FieldInput label="Color (optional)" value={fields.color} onChange={v => setField('color', v)} />
      </div>

      {!isRx && (
        <>
          <SectionTitle>Pricing & Format</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FieldSelect label="CYL Format" value={fields.cylformat} onChange={v => setField('cylformat', v)} error={cellErrors.cylformat}
              options={CYL_FORMATS.map(v => ({ value: v, label: CYL_FORMAT_LABELS[v] }))} />
            <Grid>
              <FieldInput label="Wholesale Price" type="number" value={fields.wholesaleprice} onChange={v => setField('wholesaleprice', v)} error={cellErrors.wholesaleprice} placeholder="0.00" />
              <FieldInput label="Retail Price" type="number" value={fields.retailprice} onChange={v => setField('retailprice', v)} error={cellErrors.retailprice} placeholder="0.00" />
            </Grid>
          </div>
        </>
      )}

      {isRx && (
        <>
          <SectionTitle>Variant Fields</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FieldSelect label="Diameter Mode" value={fields.diametermode} onChange={v => setField('diametermode', v)} error={cellErrors.diametermode}
              options={[{ value: 'single', label: 'Single' }, { value: 'range', label: 'Range' }]} />
            {fields.diametermode === 'single' && (
              <FieldSelect label="Diameter Value" value={fields.diametervalue} onChange={v => setField('diametervalue', v)} error={cellErrors.diametervalue}
                options={VALID_DIAMETERS.map(v => ({ value: v, label: `${v} mm` }))} />
            )}
            {fields.diametermode === 'range' && (
              <Grid>
                <FieldSelect label="Diameter From" value={fields.diameterfrom} onChange={v => setField('diameterfrom', v)} error={cellErrors.diameterfrom}
                  options={VALID_DIAMETERS.map(v => ({ value: v, label: `${v} mm` }))} />
                <FieldSelect label="Diameter To" value={fields.diameterto} onChange={v => setField('diameterto', v)} error={cellErrors.diameterto}
                  options={VALID_DIAMETERS.map(v => ({ value: v, label: `${v} mm` }))} />
              </Grid>
            )}
            <Grid>
              <FieldInput label="SPH Min" type="number" value={fields.sphmin} onChange={v => setField('sphmin', v)} error={cellErrors.sphmin} placeholder="-6.00" />
              <FieldInput label="SPH Max" type="number" value={fields.sphmax} onChange={v => setField('sphmax', v)} error={cellErrors.sphmax} placeholder="+4.00" />
            </Grid>
            <Grid>
              <FieldInput label="CYL Min" type="number" value={fields.cylmin} onChange={v => setField('cylmin', v)} error={cellErrors.cylmin} placeholder="-2.00" />
              <FieldInput label="CYL Max" type="number" value={fields.cylmax} onChange={v => setField('cylmax', v)} error={cellErrors.cylmax} placeholder="0.00" />
            </Grid>
            <FieldSelect label="CYL Format" value={fields.cylformat} onChange={v => setField('cylformat', v)} error={cellErrors.cylformat}
              options={CYL_FORMATS.map(v => ({ value: v, label: CYL_FORMAT_LABELS[v] }))} />
            <Grid>
              <FieldInput label="Wholesale Price" type="number" value={fields.wholesaleprice} onChange={v => setField('wholesaleprice', v)} error={cellErrors.wholesaleprice} placeholder="0.00" />
              <FieldInput label="Retail Price" type="number" value={fields.retailprice} onChange={v => setField('retailprice', v)} error={cellErrors.retailprice} placeholder="0.00" />
            </Grid>
          </div>
        </>
      )}
    </div>
  );
}

// ── Contact edit form ─────────────────────────────────────────────────────────

function ContactEditFields({ fields, setField, cellErrors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SectionTitle>Catalog Fields</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FieldInput label="Product Name" value={fields.productname} onChange={v => setField('productname', v)} error={cellErrors.productname} />
        <Grid>
          <FieldSelect label="Lens Color" value={fields.lenscolor} onChange={v => setField('lenscolor', v)} error={cellErrors.lenscolor}
            options={LENS_COLORS.map(v => ({ value: v, label: LENS_COLOR_LABELS[v] }))} />
          <FieldSelect label="Vision Type" value={fields.visiontype} onChange={v => setField('visiontype', v)} error={cellErrors.visiontype}
            options={VISION_TYPES.map(v => ({ value: v, label: VISION_TYPE_LABELS[v] }))} />
        </Grid>
        <Grid>
          <FieldSelect label="Lens Shape" value={fields.lensshape} onChange={v => setField('lensshape', v)} error={cellErrors.lensshape}
            options={LENS_SHAPES.map(v => ({ value: v, label: LENS_SHAPE_LABELS[v] }))} />
          <FieldSelect label="Wearing Time" value={fields.wearingtime} onChange={v => setField('wearingtime', v)} error={cellErrors.wearingtime}
            options={WEARING_TIMES.map(v => ({ value: v, label: WEARING_TIME_LABELS[v] }))} />
        </Grid>
        <Grid>
          <FieldSelect label="Pack Type" value={fields.packtype} onChange={v => setField('packtype', v)} error={cellErrors.packtype}
            options={PACK_TYPES.map(v => ({ value: v, label: PACK_TYPE_LABELS[v] }))} />
          <FieldInput label="Price" type="number" value={fields.price} onChange={v => setField('price', v)} error={cellErrors.price} placeholder="0.00" />
        </Grid>
      </div>
      <SectionTitle>SPH Range</SectionTitle>
      <Grid cols={3}>
        <FieldInput label="Min" type="number" value={fields.sphmin} onChange={v => setField('sphmin', v)} error={cellErrors.sphmin} />
        <FieldInput label="Max" type="number" value={fields.sphmax} onChange={v => setField('sphmax', v)} />
        <FieldInput label="Step" type="number" value={fields.sphstep} onChange={v => setField('sphstep', v)} />
      </Grid>
      {fields.lensshape === 'toric' && (
        <>
          <SectionTitle>CYL Range</SectionTitle>
          <Grid cols={3}>
            <FieldInput label="Min" type="number" value={fields.cylmin} onChange={v => setField('cylmin', v)} error={cellErrors.cylmin} />
            <FieldInput label="Max" type="number" value={fields.cylmax} onChange={v => setField('cylmax', v)} />
            <FieldInput label="Step" type="number" value={fields.cylstep} onChange={v => setField('cylstep', v)} />
          </Grid>
          <SectionTitle>Axis Range</SectionTitle>
          <Grid cols={3}>
            <FieldInput label="Min" type="number" value={fields.axismin} onChange={v => setField('axismin', v)} error={cellErrors.axismin} />
            <FieldInput label="Max" type="number" value={fields.axismax} onChange={v => setField('axismax', v)} />
            <FieldInput label="Step" type="number" value={fields.axisstep} onChange={v => setField('axisstep', v)} />
          </Grid>
        </>
      )}
      {fields.visiontype === 'multifocal' && (
        <>
          <SectionTitle>ADD Range</SectionTitle>
          <Grid cols={3}>
            <FieldInput label="Min" type="number" value={fields.addmin} onChange={v => setField('addmin', v)} error={cellErrors.addmin} />
            <FieldInput label="Max" type="number" value={fields.addmax} onChange={v => setField('addmax', v)} />
            <FieldInput label="Step" type="number" value={fields.addstep} onChange={v => setField('addstep', v)} />
          </Grid>
        </>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ImportRowEditForm({ isOpen, onClose, row, type, onSave }) {
  const [fields, setFields] = useState(() => ({ ...row.raw }));
  const [cellErrors, setCellErrors] = useState(row.cellErrors || {});

  function setField(key, value) {
    setFields(prev => ({ ...prev, [key]: value }));
    setCellErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function handleSave() {
    onSave(fields);
  }

  const isIvl = type === 'ivl-stock' || type === 'ivl-rx';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Row ${row.rowNumber}`} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Supplier + Brand read-only banner */}
        <div style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Supplier</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '2px 0 0' }}>{row.supplier || '—'}</p>
          </div>
          <div style={{ width: 1, background: '#e2e8f0' }} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Brand</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '2px 0 0' }}>{row.brand || '—'}</p>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center', marginLeft: 'auto', margin: '0 0 0 auto' }}>
            Fix supplier/brand errors using the cell popovers in the table.
          </p>
        </div>

        <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
          {isIvl
            ? <IvlEditFields fields={fields} setField={setField} cellErrors={cellErrors} type={type} />
            : <ContactEditFields fields={fields} setField={setField} cellErrors={cellErrors} />
          }
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #e2e8f0', marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save & Re-validate</Button>
        </div>
      </div>
    </Modal>
  );
}
