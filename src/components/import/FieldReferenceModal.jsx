import Modal from '../ui/Modal';

const CODE = {
  fontFamily: 'monospace', fontWeight: 700, fontSize: 12,
  background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a',
};

const REQUIRED_BADGE = {
  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
  background: '#fef3c7', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const OPTIONAL_BADGE = {
  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
  background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const TH = {
  textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em',
  borderBottom: '1.5px solid #e2e8f0', background: '#f8fafc',
};

const TD = {
  padding: '8px 12px', fontSize: 12, color: '#374151',
  borderBottom: '1px solid #f1f5f9', verticalAlign: 'top',
};

function Row({ field, accepted, required }) {
  return (
    <tr>
      <td style={TD}><span style={CODE}>{field}</span></td>
      <td style={{ ...TD, color: '#475569', lineHeight: 1.55 }}>{accepted}</td>
      <td style={{ ...TD, whiteSpace: 'nowrap' }}>
        <span style={required ? REQUIRED_BADGE : OPTIONAL_BADGE}>
          {required ? 'Required' : 'Optional'}
        </span>
      </td>
    </tr>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
        {title}
      </p>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...TH, width: 160 }}>Column</th>
              <th style={TH}>Accepted Values</th>
              <th style={{ ...TH, width: 90 }}>Required</th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

const ENUM_NOTE = (
  <span style={{ color: '#94a3b8', fontSize: 11 }}> — display label or DB key accepted (case-insensitive)</span>
);

export default function FieldReferenceModal({ isOpen, type, onClose }) {
  const isIvl     = type === 'ivl-stock' || type === 'ivl-rx';
  const isRx      = type === 'ivl-rx';
  const isContact = type === 'contact';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Field Reference" size="xl">
      <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 24, lineHeight: 1.55 }}>
        Reference for all columns in the{' '}
        <strong>{type === 'ivl-stock' ? 'IVL Stock' : type === 'ivl-rx' ? 'IVL RX' : 'Contact Lens'}</strong>{' '}
        template. Enum fields accept display labels (e.g. "Single Vision") or DB keys (e.g. "single_vision") — case-insensitive.
      </p>

      {/* Common fields */}
      <Section title="Common Fields">
        <Row field="supplier"     accepted="Name of an existing supplier in the database" required />
        <Row field="brand"        accepted="Name of an existing brand under that supplier" required />
        <Row field="productname"  accepted="Free text product name" required />
      </Section>

      {/* IVL fields */}
      {isIvl && (
        <Section title="IVL Fields">
          <Row
            field="design"
            accepted={<>Single Vision, Relax, Office, Progressive, Bifocal, Myopia Control{ENUM_NOTE}</>}
            required
          />
          <Row
            field="material"
            accepted={<>Plastic, Polycarbonate, Trivex, Mineral{ENUM_NOTE}</>}
            required
          />
          <Row
            field="lenstypes"
            accepted={<>Clear, Blue Block, Photochromic, Sun, Drive, Polar, Photopolar, All — comma-separated for multiple (e.g. "Blue Block, Photochromic"){ENUM_NOTE}</>}
            required
          />
          <Row
            field="refractiveindex"
            accepted="1.50 · 1.53 · 1.56 · 1.59 · 1.60 · 1.67 · 1.74"
            required
          />
          <Row
            field="geometry"
            accepted={<>SPH, AS{ENUM_NOTE}</>}
            required
          />
          <Row
            field="cylformat"
            accepted={<>+CYL, −CYL — also accepts: +, -, plus, minus{ENUM_NOTE}</>}
            required
          />
          <Row field="coating"        accepted="Free text coating name (e.g. AR + HC)" required={false} />
          <Row field="color"          accepted="Free text tint/color name" required={false} />
          <Row field="wholesaleprice" accepted="Decimal number (e.g. 12.50)" required={false} />
          <Row field="retailprice"    accepted="Decimal number (e.g. 25.00)" required={false} />
        </Section>
      )}

      {/* IVL RX-only fields */}
      {isRx && (
        <Section title="IVL RX Variant Fields (one row per variant)">
          <Row field="diametermode"  accepted="single — one diameter value · range — from/to diameter range" required />
          <Row field="diametervalue" accepted="Diameter in mm, e.g. 65 (used when diametermode = single)" required={false} />
          <Row field="diameterfrom"  accepted="Start of diameter range in mm (used when diametermode = range)" required={false} />
          <Row field="diameterto"    accepted="End of diameter range in mm (used when diametermode = range)" required={false} />
          <Row field="sphmin"        accepted="Minimum SPH power, e.g. -8.00" required />
          <Row field="sphmax"        accepted="Maximum SPH power, e.g. +6.00" required />
          <Row field="cylmin"        accepted="Minimum CYL power, e.g. -4.00" required={false} />
          <Row field="cylmax"        accepted="Maximum CYL power, e.g. 0.00" required={false} />
        </Section>
      )}

      {/* Contact fields */}
      {isContact && (
        <>
          <Section title="Contact Lens Fields">
            <Row
              field="lenscolor"
              accepted={<>Clear, Color{ENUM_NOTE}</>}
              required
            />
            <Row
              field="visiontype"
              accepted={<>Single Vision, Multifocal{ENUM_NOTE}</>}
              required
            />
            <Row
              field="lensshape"
              accepted={<>Spherical, Toric{ENUM_NOTE}</>}
              required
            />
            <Row
              field="wearingtime"
              accepted={<>Yearly, Semi-Annual, Monthly, Bi-Weekly, Daily{ENUM_NOTE}</>}
              required
            />
            <Row
              field="packtype"
              accepted={<>3 Pack, 6 Pack, Sample{ENUM_NOTE}</>}
              required
            />
            <Row field="price" accepted="Decimal number (e.g. 18.50)" required />
          </Section>

          <Section title="Contact Lens Range Fields">
            <Row field="sphmin"   accepted="Minimum SPH power, e.g. -6.00" required />
            <Row field="sphmax"   accepted="Maximum SPH power, e.g. +6.00" required />
            <Row field="sphstep"  accepted="SPH step increment, e.g. 0.25" required={false} />
            <Row field="cylmin"   accepted="Minimum CYL power" required={false} />
            <Row field="cylmax"   accepted="Maximum CYL power" required={false} />
            <Row field="cylstep"  accepted="CYL step increment" required={false} />
            <Row field="axismin"  accepted="Minimum axis value" required={false} />
            <Row field="axismax"  accepted="Maximum axis value" required={false} />
            <Row field="axisstep" accepted="Axis step increment" required={false} />
            <Row field="addmin"   accepted="Minimum ADD power" required={false} />
            <Row field="addmax"   accepted="Maximum ADD power" required={false} />
            <Row field="addstep"  accepted="ADD step increment" required={false} />
            <Row field="basecurves" accepted="Comma-separated values, e.g. 8.6,8.8" required={false} />
            <Row field="diameters"  accepted="Comma-separated values, e.g. 14.2" required={false} />
          </Section>
        </>
      )}
    </Modal>
  );
}
