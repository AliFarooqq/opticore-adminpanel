import { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';

function StepHeader({ number, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: '#0f2540', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>
        {number}
      </div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
    </div>
  );
}
import { downloadIvlStockTemplate, downloadIvlRxTemplate, downloadContactTemplate } from '../utils/csvTemplates';
import { parseFile, validateRows, importValidRows } from '../services/importParser';
import { useToast } from '../hooks/useToast';

function DropZone({ onFile, file, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  if (file) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderRadius: 12,
        border: '1.5px solid #c7d7ed', background: '#f0f5fb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={18} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{file.name}</p>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          title="Remove file"
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? '#3b82f6' : '#cbd5e1'}`,
        borderRadius: 12,
        padding: '40px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        cursor: 'pointer',
        background: dragging ? '#eff6ff' : '#f8fafc',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: dragging ? '#dbeafe' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
        <Upload size={22} style={{ color: dragging ? '#3b82f6' : '#94a3b8' }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>
        {dragging ? 'Drop file here' : 'Drop CSV or Excel file here'}
      </p>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>or click to browse — .csv, .xlsx, .xls</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }}
      />
    </div>
  );
}

const TH = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  whiteSpace: 'nowrap', background: '#f8fafc',
  borderBottom: '1.5px solid #e2e8f0',
  position: 'sticky', top: 0, zIndex: 1,
};
const TD = { padding: '10px 14px', fontSize: 12, color: '#374151', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' };

function ValidationTable({ rows }) {
  const valid = rows.filter(r => r.valid).length;
  const errors = rows.length - valid;
  const dataColumns = rows[0]?.raw ? Object.keys(rows[0].raw) : [];

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{valid} valid</span>
        {errors > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>{errors} error{errors !== 1 ? 's' : ''}</span>}
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{rows.length} total rows</span>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e2e8f0', maxHeight: 420 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...TH, width: 48 }}>#</th>
              {dataColumns.map(col => (
                <th key={col} style={TH}>{col}</th>
              ))}
              <th style={{ ...TH, width: 80 }}>Status</th>
              <th style={TH}>Error</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.rowNumber} style={{ background: row.valid ? 'transparent' : '#fff5f5' }}>
                <td style={{ ...TD, color: '#94a3b8' }}>{row.rowNumber}</td>
                {dataColumns.map(col => (
                  <td key={col} style={TD}>{row.raw[col] || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                ))}
                <td style={TD}>
                  {row.valid ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircle size={13} /> Valid
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontWeight: 600 }}>
                      <XCircle size={13} /> Error
                    </span>
                  )}
                </td>
                <td style={{ ...TD, color: '#dc2626', maxWidth: 260, whiteSpace: 'normal' }}>{row.error || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TEMPLATE_DOWNLOAD = {
  'ivl-stock': downloadIvlStockTemplate,
  'ivl-rx': downloadIvlRxTemplate,
  'contact': downloadContactTemplate,
};

const TEMPLATE_LABEL = {
  'ivl-stock': 'IVL Stock Template',
  'ivl-rx': 'IVL RX Template',
  'contact': 'Contact Lens Template',
};

const LENS_LABEL = {
  'ivl-stock': 'IVL Stock',
  'ivl-rx': 'IVL RX',
  'contact': 'Contact',
};

function ImportTab({ type }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [validatedRows, setValidatedRows] = useState(null);

  const isRx = type === 'ivl-rx';

  async function handleValidate() {
    if (!file) return;
    setValidating(true);
    setValidatedRows(null);
    try {
      const rows = await parseFile(file);
      const results = await validateRows(rows, type);
      setValidatedRows(results);
    } catch (err) {
      toast.error(err.message || 'Failed to parse file');
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!validatedRows) return;
    setImporting(true);
    const validCount = validatedRows.filter(r => r.valid).length;
    setImportProgress({ current: 0, total: validCount });
    try {
      const count = await importValidRows(validatedRows, type);
      toast.success(`Successfully imported ${count} ${LENS_LABEL[type]} lens${count !== 1 ? 'es' : ''}`);
      setFile(null);
      setValidatedRows(null);
      setImportProgress(null);
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  const validCount = validatedRows?.filter(r => r.valid).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Step 1 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={1} title="Download Template" />
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16, marginTop: 0 }}>
          {isRx
            ? 'Each row represents one variant. Master fields (supplier → color) repeat for each variant of the same lens. Rows sharing the same supplier, brand, and productName are grouped into one lens on import.'
            : 'Download the CSV template with all required columns and an example row.'}
        </p>
        <Button variant="secondary" onClick={TEMPLATE_DOWNLOAD[type]}>
          <Download size={16} />
          Download {TEMPLATE_LABEL[type]}
        </Button>
      </section>

      {/* Step 2 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={2} title="Upload Your File" />
        <DropZone
          file={file}
          onFile={f => { setFile(f); setValidatedRows(null); }}
          onRemove={() => { setFile(null); setValidatedRows(null); }}
        />
      </section>

      {/* Step 3 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={3} title="Validate & Preview" />
        <Button
          variant="secondary"
          disabled={!file || validating}
          loading={validating}
          onClick={handleValidate}
        >
          Validate File
        </Button>
        {validatedRows && (
          <div style={{ marginTop: 20 }}>
            <ValidationTable rows={validatedRows} />
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={4} title="Import Valid Rows" />
        {isRx && validCount > 0 && (
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, marginTop: 0 }}>
            {validCount} valid variant row{validCount !== 1 ? 's' : ''} will be grouped by product name and imported as lenses.
          </p>
        )}
        <Button
          disabled={validCount === 0 || importing}
          loading={importing}
          onClick={handleImport}
        >
          Import {validCount > 0 ? `${validCount} Valid` : ''} {isRx ? 'Variant ' : ''}Rows
        </Button>
        {importProgress && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
              Importing {importProgress.current} / {importProgress.total}…
            </p>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', background: '#0f2540', borderRadius: 99,
                  transition: 'width 0.3s ease',
                  width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const TAB_STYLE = (active) => ({
  padding: '12px 24px', fontSize: 14, fontWeight: 600,
  border: 'none', background: 'none', cursor: 'pointer',
  borderBottom: active ? '2px solid #0f2540' : '2px solid transparent',
  color: active ? '#0f2540' : '#64748b',
  marginBottom: -1,
  transition: 'color 0.15s, border-color 0.15s',
});

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('ivl');
  const [ivlSubTab, setIvlSubTab] = useState('ivl-stock');

  const activeType = activeTab === 'ivl' ? ivlSubTab : 'contact';

  return (
    <>
      <Header title="Bulk Import" />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
        <div className="page-content" style={{ maxWidth: 1300, margin: '0 auto', padding: '36px 40px' }}>
          {/* Top tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
            {[
              { id: 'ivl', label: 'IVL Lenses' },
              { id: 'contact', label: 'Contact Lenses' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={TAB_STYLE(activeTab === tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* IVL sub-tabs */}
          {activeTab === 'ivl' && (
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 32, background: '#f8fafc' }}>
              {[
                { id: 'ivl-stock', label: 'Stock' },
                { id: 'ivl-rx', label: 'RX' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setIvlSubTab(sub.id)}
                  style={{
                    ...TAB_STYLE(ivlSubTab === sub.id),
                    padding: '9px 20px',
                    fontSize: 13,
                    borderBottom: ivlSubTab === sub.id ? '2px solid #1e3a5f' : '2px solid transparent',
                    color: ivlSubTab === sub.id ? '#1e3a5f' : '#94a3b8',
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'contact' && <div style={{ marginBottom: 32 }} />}

          <ImportTab key={activeType} type={activeType} />
        </div>
      </div>
    </>
  );
}
