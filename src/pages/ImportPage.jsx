import { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

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
import { downloadIvlTemplate, downloadContactTemplate } from '../utils/csvTemplates';
// Bulk import wired up but hidden from client until ready
// import { parseFile, validateRows, importValidRows } from '../services/importParser';
import { useToast } from '../hooks/useToast';

function DropZone({ onFile, file }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
        ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
    >
      <Upload size={28} className={dragging ? 'text-blue-500' : 'text-slate-400'} />
      {file ? (
        <div className="flex items-center gap-2 text-slate-700">
          <FileText size={16} />
          <span className="text-sm font-medium">{file.name}</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 font-medium">Drop CSV or Excel file here</p>
          <p className="text-xs text-slate-400">or click to browse (.csv, .xlsx, .xls)</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }}
      />
    </div>
  );
}

function ValidationTable({ rows }) {
  const valid = rows.filter(r => r.valid).length;
  const errors = rows.length - valid;

  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">
        <span className="text-green-600 font-semibold">{valid} valid rows</span>
        {errors > 0 && (
          <>, <span className="text-red-600 font-semibold">{errors} errors</span></>
        )}
      </p>
      <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-96">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Row</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Supplier</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Brand</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Product Name</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Status</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(row => (
              <tr key={row.rowNumber} className={row.valid ? '' : 'bg-red-50'}>
                <td className="px-3 py-2 text-slate-500">{row.rowNumber}</td>
                <td className="px-3 py-2 text-slate-700">{row.supplier}</td>
                <td className="px-3 py-2 text-slate-700">{row.brand}</td>
                <td className="px-3 py-2 text-slate-700">{row.productName}</td>
                <td className="px-3 py-2">
                  {row.valid ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} /> Valid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle size={14} /> Error
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-red-600">{row.error || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImportTab({ type }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [validatedRows, setValidatedRows] = useState(null);

  const isIvl = type === 'ivl';

  async function handleValidate() {
    // Bulk import wired up but hidden from client until ready
    // if (!file) return;
    // setValidating(true);
    // setValidatedRows(null);
    // try {
    //   const rows = await parseFile(file);
    //   const results = await validateRows(rows, type);
    //   setValidatedRows(results);
    // } catch (err) {
    //   toast.error(err.message || 'Failed to parse file');
    // } finally {
    //   setValidating(false);
    // }
  }

  async function handleImport() {
    // Bulk import wired up but hidden from client until ready
    // if (!validatedRows) return;
    // setImporting(true);
    // setImportProgress({ current: 0, total: validatedRows.filter(r => r.valid).length });
    // try {
    //   const count = await importValidRows(validatedRows, type);
    //   toast.success(`Successfully imported ${count} ${isIvl ? 'IVL' : 'contact'} lens${count !== 1 ? 'es' : ''}`);
    //   setFile(null);
    //   setValidatedRows(null);
    //   setImportProgress(null);
    // } catch (err) {
    //   toast.error(err.message || 'Import failed');
    // } finally {
    //   setImporting(false);
    // }
  }

  const validCount = validatedRows?.filter(r => r.valid).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Step 1 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={1} title="Download Template" />
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16, marginTop: 0 }}>
          Download the CSV template with all required columns and an example row.
        </p>
        <Button
          variant="secondary"
          onClick={isIvl ? downloadIvlTemplate : downloadContactTemplate}
        >
          <Download size={16} />
          Download {isIvl ? 'IVL' : 'Contact'} Template
        </Button>
      </section>

      {/* Step 2 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={2} title="Upload Your File" />
        <DropZone file={file} onFile={f => { setFile(f); setValidatedRows(null); }} />
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
        {validating && <Spinner size="sm" />}
        {validatedRows && (
          <div style={{ marginTop: 20 }}>
            <ValidationTable rows={validatedRows} />
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={4} title="Import Valid Rows" />
        <Button
          disabled={validCount === 0 || importing}
          loading={importing}
          onClick={handleImport}
        >
          Import {validCount > 0 ? `${validCount} Valid` : ''} Rows
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

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('ivl');

  return (
    <>
      <Header title="Bulk Import" />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 40px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 32 }}>
            {[
              { id: 'ivl', label: 'IVL Lenses' },
              { id: 'contact', label: 'Contact Lenses' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px', fontSize: 14, fontWeight: 600,
                  border: 'none', background: 'none', cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #0f2540' : '2px solid transparent',
                  color: activeTab === tab.id ? '#0f2540' : '#64748b',
                  marginBottom: -1,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <ImportTab key={activeTab} type={activeTab} />
        </div>
      </div>
    </>
  );
}
