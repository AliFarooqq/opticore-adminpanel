import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Download, FileText, CheckCircle, XCircle, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import SupplierForm from '../components/suppliers/SupplierForm';
import BrandForm from '../components/brands/BrandForm';
import ImportRowEditForm from '../components/import/ImportRowEditForm';
import { downloadIvlStockTemplate, downloadIvlRxTemplate, downloadContactTemplate } from '../utils/csvTemplates';
import { parseFile, fetchRefData, validateRows, revalidateSingleRow, importValidRows, detectFileType } from '../services/importParser';
import { updateBrandMeta } from '../services/brandsService';
import { useToast } from '../hooks/useToast';

// ── Shared style constants ────────────────────────────────────────────────────

const TH = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  whiteSpace: 'nowrap', background: '#f8fafc',
  borderBottom: '1.5px solid #e2e8f0',
  position: 'sticky', top: 0, zIndex: 1,
};
const TD = {
  padding: '9px 12px', fontSize: 12, color: '#374151',
  whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
};

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

// ── StepHeader ────────────────────────────────────────────────────────────────

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

// ── DropZone ──────────────────────────────────────────────────────────────────

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
        padding: '14px 18px', borderRadius: 12, minHeight: 100,
        border: '1.5px solid #c7d7ed', background: '#f0f5fb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={18} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{file.name}</p>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          title="Remove file"
          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
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
        border: `2px dashed ${dragging ? '#3b82f6' : '#cbd5e1'}`, borderRadius: 12,
        padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        cursor: 'pointer', background: dragging ? '#eff6ff' : '#f8fafc',
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
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
    </div>
  );
}

// ── Popover button ────────────────────────────────────────────────────────────

function PopoverButton({ onClick, children, primary }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: '7px 10px', borderRadius: 6, fontSize: 12,
        border: primary ? 'none' : '1px solid #475569',
        background: hover ? (primary ? '#3b82f6' : '#334155') : (primary ? '#2563eb' : 'transparent'),
        color: '#f1f5f9', cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.1s', fontWeight: primary ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

// ── Cell Popover (portal) ─────────────────────────────────────────────────────

function CellPopover({ popover, rows, refData, type, onClose, onSkipRow, onCreateSupplier, onOpenCreateBrand, onUseDifferentBrand, onOpenEditRow, onAddCoatingToBrand, onAddColorToBrand }) {
  const popoverRef = useRef(null);
  const [blueBlock, setBlueBlock] = useState(false);

  useEffect(() => {
    if (!popover) return;
    function onMouseDown(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [popover, onClose]);

  // Reset blue block toggle whenever a different cell is opened
  useEffect(() => { setBlueBlock(false); }, [popover?.rowIdx, popover?.field]);

  if (!popover) return null;

  const { rowIdx, field, rect } = popover;
  const row = rows[rowIdx];
  if (!row) return null;

  const error = row.cellErrors?.[field];
  if (!error) return null;

  const isSupplierField = field === 'supplier';
  const isBrandField    = field === 'brand';
  const isCoatingField  = field === 'coating';
  const isColorField    = field === 'color';
  const isWrongType     = isSupplierField && error.includes('wrong type');
  const supplierTypeLabel = type === 'contact' ? 'Contact' : 'IVL';

  // Brand lookup for brand-field actions
  let supplierObj = null;
  let availableBrands = [];
  if (isBrandField && refData) {
    const sName = row.raw.supplier?.toLowerCase();
    supplierObj = refData.suppliers.find(s => s.name.toLowerCase() === sName);
    if (supplierObj) availableBrands = refData.brands.filter(b => b.supplierId === supplierObj.id);
  }

  // Brand object lookup for coating/color actions
  let brandForRow = null;
  if ((isCoatingField || isColorField) && refData) {
    const sName = row.raw.supplier?.toLowerCase();
    const sObj  = refData.suppliers.find(s => s.name.toLowerCase() === sName);
    if (sObj) {
      const bName = row.raw.brand?.toLowerCase();
      brandForRow = refData.brands.find(b => b.name.toLowerCase() === bName && b.supplierId === sObj.id);
    }
  }

  // Position below-left of the cell, keep inside viewport
  let top  = rect.bottom + 8;
  let left = rect.left;
  if (left + 300 > window.innerWidth - 8) left = window.innerWidth - 308;
  if (top  + 280 > window.innerHeight - 8) top  = rect.top - 280 - 8;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'fixed', top, left, zIndex: 9999,
        background: '#1e293b', color: '#f1f5f9', borderRadius: 10,
        padding: '12px 14px', minWidth: 270, maxWidth: 340,
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)', fontSize: 13,
      }}
    >
      <p style={{ margin: '0 0 10px', lineHeight: 1.45, color: '#fca5a5', fontWeight: 500, fontSize: 12 }}>
        ⚠ {error}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Supplier actions */}
        {isSupplierField && !isWrongType && (
          <PopoverButton primary onClick={() => { onCreateSupplier(row.raw.supplier); onClose(); }}>
            + Create "{row.raw.supplier}" as {supplierTypeLabel} Supplier
          </PopoverButton>
        )}

        {/* Brand actions */}
        {isBrandField && supplierObj && (
          <PopoverButton primary onClick={() => { onOpenCreateBrand(supplierObj.id, row.raw.brand); onClose(); }}>
            + Create "{row.raw.brand}" under {row.raw.supplier}
          </PopoverButton>
        )}
        {isBrandField && availableBrands.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Use a different brand:
            </p>
            <select
              defaultValue=""
              onChange={e => { if (e.target.value) { onUseDifferentBrand(rowIdx, e.target.value); onClose(); } }}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 6, fontSize: 12, background: '#334155', border: '1px solid #475569', color: '#f1f5f9', cursor: 'pointer' }}
            >
              <option value="">— select brand —</option>
              {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        )}

        {/* Coating actions */}
        {isCoatingField && brandForRow && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 2px' }}>
              <button
                onClick={() => setBlueBlock(v => !v)}
                style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: blueBlock ? '#dbeafe' : '#334155',
                  color: blueBlock ? '#1d4ed8' : '#94a3b8',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                Blue Block {blueBlock ? '✓' : '○'}
              </button>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>blue light protection</span>
            </div>
            <PopoverButton primary onClick={() => { onAddCoatingToBrand(rowIdx, blueBlock); onClose(); }}>
              + Add "{row.raw.coating}" to {brandForRow.name}
            </PopoverButton>
          </>
        )}

        {/* Color actions */}
        {isColorField && brandForRow && (
          <PopoverButton primary onClick={() => { onAddColorToBrand(rowIdx); onClose(); }}>
            + Add "{row.raw.color}" to {brandForRow.name}
          </PopoverButton>
        )}

        {/* Edit Row — secondary for coating/color, primary for other format fields */}
        {!isSupplierField && !isBrandField && (
          <PopoverButton
            primary={!isCoatingField && !isColorField}
            onClick={() => { onOpenEditRow(rowIdx); onClose(); }}
          >
            ✏ Edit Row
          </PopoverButton>
        )}

        {!row.skipped ? (
          <PopoverButton onClick={() => { onSkipRow(rowIdx); onClose(); }}>Skip this row</PopoverButton>
        ) : (
          <PopoverButton onClick={() => { onSkipRow(rowIdx); onClose(); }}>Undo skip</PopoverButton>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── ValidationTable ───────────────────────────────────────────────────────────

function ValidationTable({ rows, onCellClick, onToggleSkip, onEditRow, onScroll: onScrollProp }) {
  const validCount = rows.filter(r => r.valid && !r.skipped).length;
  const skippedCount = rows.filter(r => r.skipped).length;
  const errorCount = rows.filter(r => !r.valid && !r.skipped).length;
  const dataColumns = rows[0]?.raw ? Object.keys(rows[0].raw) : [];

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{validCount} valid</span>
        {errorCount > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
        {skippedCount > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{skippedCount} skipped</span>}
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{rows.length} total</span>
        {errorCount > 0 && (
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
            Click a highlighted cell for fix options
          </span>
        )}
      </div>

      <div
        style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e2e8f0', maxHeight: 480, overflowY: 'auto' }}
        onScroll={onScrollProp}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...TH, width: 44 }}>#</th>
              {dataColumns.map(col => <th key={col} style={TH}>{col}</th>)}
              <th style={{ ...TH, width: 80 }}>Status</th>
              <th style={{ ...TH, width: 96 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const hasOnlyFormatErrors = !row.valid && !row.skipped
                && !row.cellErrors?.supplier && !row.cellErrors?.brand;

              return (
                <tr
                  key={row.rowNumber}
                  style={{
                    background: row.skipped ? '#f8fafc' : row.valid ? 'transparent' : '#fff5f5',
                    opacity: row.skipped ? 0.55 : 1,
                  }}
                >
                  <td style={{ ...TD, color: '#94a3b8' }}>{row.rowNumber}</td>

                  {dataColumns.map(col => {
                    const cellError = row.cellErrors?.[col];
                    const clickable = !!cellError && !row.skipped;
                    return (
                      <td
                        key={col}
                        onClick={clickable ? (e) => onCellClick(rowIdx, col, e) : undefined}
                        title={cellError || undefined}
                        style={{
                          ...TD,
                          background: clickable ? '#fee2e2' : undefined,
                          cursor: clickable ? 'pointer' : undefined,
                          position: 'relative',
                          maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {clickable
                          ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{row.raw[col] || '(empty)'}</span>
                          : row.raw[col] || <span style={{ color: '#cbd5e1' }}>—</span>
                        }
                        {clickable && (
                          <span style={{
                            position: 'absolute', top: 4, right: 4, width: 5, height: 5,
                            borderRadius: '50%', background: '#ef4444', display: 'block',
                          }} />
                        )}
                      </td>
                    );
                  })}

                  <td style={TD}>
                    {row.skipped ? (
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>SKIPPED</span>
                    ) : row.valid ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 600 }}>
                        <CheckCircle size={13} /> Valid
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontWeight: 600 }}>
                        <XCircle size={13} /> Error
                      </span>
                    )}
                  </td>

                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                    {row.skipped ? (
                      <ActionBtn onClick={() => onToggleSkip(rowIdx)}>Undo</ActionBtn>
                    ) : hasOnlyFormatErrors ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ActionBtn primary onClick={() => onEditRow(rowIdx)}>Edit</ActionBtn>
                        <ActionBtn onClick={() => onToggleSkip(rowIdx)}>Skip</ActionBtn>
                      </div>
                    ) : !row.valid ? (
                      <ActionBtn onClick={() => onToggleSkip(rowIdx)}>Skip</ActionBtn>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, children, primary }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: 11, padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
        background: hover
          ? (primary ? '#dbeafe' : '#f1f5f9')
          : (primary ? '#eff6ff' : 'transparent'),
        border: primary ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
        color: primary ? '#1d4ed8' : '#64748b',
        transition: 'background 0.1s',
      }}
    >
      {children}
    </button>
  );
}

// ── Import Tab ────────────────────────────────────────────────────────────────

function ImportTab({ type }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validatePhase, setValidatePhase] = useState(null); // 'fetching' | 'validating'
  const [importing, setImporting] = useState(false);
  const [refData, setRefData] = useState(null);
  const [validatedRows, setValidatedRows] = useState(null);

  // Popover
  const [fileTypeError, setFileTypeError] = useState(null);

  // Popover
  const [activePopover, setActivePopover] = useState(null); // { rowIdx, field, rect }
  const closePopover = useCallback(() => setActivePopover(null), []);

  // Modals
  const [supplierModal, setSupplierModal] = useState(null); // { initialName } | null
  const [brandModal, setBrandModal] = useState(null); // { supplierId, initialName }
  const [editRowModal, setEditRowModal] = useState(null); // rowIdx

  const isRx = type === 'ivl-rx';
  const supplierTypeForForm = type === 'contact' ? 'contact' : 'ivl';

  async function handleValidate() {
    if (!file) return;
    setValidating(true);
    setValidatedRows(null);
    closePopover();
    try {
      setValidatePhase('fetching');
      const [ref, parsedRows] = await Promise.all([fetchRefData(), parseFile(file)]);
      setRefData(ref);
      setValidatePhase('validating');
      const results = validateRows(parsedRows, type, ref.suppliers, ref.brands);
      setValidatedRows(results);
    } catch (err) {
      toast.error(err.message || 'Failed to validate file');
    } finally {
      setValidating(false);
      setValidatePhase(null);
    }
  }

  async function handleImport() {
    if (!validatedRows) return;
    setImporting(true);
    try {
      const count = await importValidRows(validatedRows, type);
      toast.success(`Successfully imported ${count} ${LENS_LABEL[type]} lens${count !== 1 ? 'es' : ''}`);
      setFile(null);
      setValidatedRows(null);
      setRefData(null);
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  // Re-fetch ref data and re-validate all rows (called after creating supplier/brand)
  async function handleRefetchAndRevalidate() {
    try {
      const ref = await fetchRefData();
      setRefData(ref);
      setValidatedRows(prev => prev.map(row => ({
        ...row,
        ...revalidateSingleRow(row.raw, type, ref.suppliers, ref.brands),
      })));
    } catch (err) {
      toast.error('Failed to refresh data: ' + err.message);
    }
  }

  function handleCellClick(rowIdx, field, e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopover(prev =>
      prev?.rowIdx === rowIdx && prev?.field === field ? null : { rowIdx, field, rect }
    );
  }

  function handleToggleSkip(rowIdx) {
    setValidatedRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, skipped: !r.skipped } : r));
    closePopover();
  }

  function handleSkipRowFromPopover(rowIdx) {
    setValidatedRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, skipped: !r.skipped } : r));
  }

  function handleUseDifferentBrand(rowIdx, brandName) {
    setValidatedRows(prev => prev.map((row, i) => {
      if (i !== rowIdx) return row;
      const newRaw = { ...row.raw, brand: brandName };
      return {
        ...row,
        raw: newRaw,
        brand: brandName,
        ...revalidateSingleRow(newRaw, type, refData.suppliers, refData.brands),
      };
    }));
  }

  function handleEditRowSave(newRaw) {
    if (editRowModal === null) return;
    setValidatedRows(prev => prev.map((row, i) => {
      if (i !== editRowModal) return row;
      return {
        ...row,
        raw: newRaw,
        productName: newRaw.productname || newRaw.productName || '',
        ...revalidateSingleRow(newRaw, type, refData.suppliers, refData.brands),
      };
    }));
    setEditRowModal(null);
  }

  // ── helpers for finding brand object from a row ──────────────────────────
  function getBrandObjForRow(row) {
    if (!refData) return null;
    const sName = row.raw.supplier?.toLowerCase();
    const sObj  = refData.suppliers.find(s => s.name.toLowerCase() === sName);
    if (!sObj) return null;
    const bName = row.raw.brand?.toLowerCase();
    return refData.brands.find(b => b.name.toLowerCase() === bName && b.supplierId === sObj.id) || null;
  }

  async function handleAddCoatingToBrand(rowIdx, hasBlueProtection) {
    const row = validatedRows?.[rowIdx];
    if (!row) return;
    const brandObj = getBrandObjForRow(row);
    if (!brandObj) return;
    const coatingName = row.raw.coating?.trim();
    if (!coatingName) return;

    const currentCoatings = brandObj.coatings || [];
    if (currentCoatings.some(c => c.name.toLowerCase() === coatingName.toLowerCase())) return;

    const newCoatings = [...currentCoatings, { name: coatingName, hasBlueProtection }];
    try {
      await updateBrandMeta(brandObj.id, { coatings: newCoatings, colors: brandObj.colors || [] });

      // Update refData in memory immediately — no round-trip needed
      const updatedBrands = refData.brands.map(b =>
        b.id === brandObj.id ? { ...b, coatings: newCoatings } : b
      );
      const updatedRef = { ...refData, brands: updatedBrands };
      setRefData(updatedRef);
      setValidatedRows(prev => prev.map(r => ({
        ...r,
        ...revalidateSingleRow(r.raw, type, updatedRef.suppliers, updatedRef.brands),
      })));
    } catch (err) {
      toast.error('Failed to add coating: ' + err.message);
    }
  }

  async function handleAddColorToBrand(rowIdx) {
    const row = validatedRows?.[rowIdx];
    if (!row) return;
    const brandObj = getBrandObjForRow(row);
    if (!brandObj) return;
    const colorName = row.raw.color?.trim();
    if (!colorName) return;

    const currentColors = brandObj.colors || [];
    if (currentColors.some(c => c.toLowerCase() === colorName.toLowerCase())) return;

    const newColors = [...currentColors, colorName];
    try {
      await updateBrandMeta(brandObj.id, { coatings: brandObj.coatings || [], colors: newColors });

      // Update refData in memory immediately — no round-trip needed
      const updatedBrands = refData.brands.map(b =>
        b.id === brandObj.id ? { ...b, colors: newColors } : b
      );
      const updatedRef = { ...refData, brands: updatedBrands };
      setRefData(updatedRef);
      setValidatedRows(prev => prev.map(r => ({
        ...r,
        ...revalidateSingleRow(r.raw, type, updatedRef.suppliers, updatedRef.brands),
      })));
    } catch (err) {
      toast.error('Failed to add color: ' + err.message);
    }
  }

  const importableCount = validatedRows?.filter(r => r.valid && !r.skipped).length || 0;
  const progressPct = validatePhase === 'fetching' ? 35 : 85;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Step 1 — Template */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={1} title="Download Template" />
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16, marginTop: 0 }}>
          {isRx
            ? 'Each row represents one variant. Master fields (supplier → color) repeat per variant. Rows with the same supplier, brand, and product name are grouped into one lens on import.'
            : 'Download the CSV template with all required columns and an example row.'}
        </p>
        <Button variant="secondary" onClick={TEMPLATE_DOWNLOAD[type]}>
          <Download size={16} />
          Download {TEMPLATE_LABEL[type]}
        </Button>
      </section>

      {/* Step 2 — Upload */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={2} title="Upload Your File" />
        <DropZone
          file={file}
          onFile={f => { setFile(f); setValidatedRows(null); setFileTypeError(null); closePopover(); }}
          onRemove={() => { setFile(null); setValidatedRows(null); setFileTypeError(null); closePopover(); }}
        />
      </section>

      {/* Step 3 — Validate */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={3} title="Validate & Preview" />

        {!validating && (
          <Button variant="secondary" disabled={!file} onClick={handleValidate}>
            Validate File
          </Button>
        )}

        {validating && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 10, margin: '0 0 10px' }}>
              {validatePhase === 'fetching' ? 'Fetching suppliers & brands from database…' : 'Validating rows…'}
            </p>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', maxWidth: 360 }}>
              <div style={{
                height: '100%', background: '#0f2540', borderRadius: 99,
                transition: 'width 0.5s ease',
                width: `${progressPct}%`,
              }} />
            </div>
          </div>
        )}

        {validatedRows && (
          <div style={{ marginTop: 20 }}>
            <ValidationTable
              rows={validatedRows}
              onCellClick={handleCellClick}
              onToggleSkip={handleToggleSkip}
              onEditRow={(rowIdx) => setEditRowModal(rowIdx)}
              onScroll={closePopover}
            />
          </div>
        )}
      </section>

      {/* Step 4 — Import */}
      <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
        <StepHeader number={4} title="Import Valid Rows" />
        {isRx && importableCount > 0 && (
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, marginTop: 0 }}>
            {importableCount} valid variant row{importableCount !== 1 ? 's' : ''} will be grouped by product name and imported as lenses.
          </p>
        )}
        <Button disabled={importableCount === 0 || importing} loading={importing} onClick={handleImport}>
          Import {importableCount > 0 ? `${importableCount} Valid` : ''} {isRx ? 'Variant ' : ''}Row{importableCount !== 1 ? 's' : ''}
        </Button>
      </section>

      {/* Cell Popover (portal) */}
      <CellPopover
        popover={activePopover}
        rows={validatedRows || []}
        refData={refData}
        type={type}
        onClose={closePopover}
        onSkipRow={handleSkipRowFromPopover}
        onCreateSupplier={(name) => setSupplierModal({ initialName: name || '' })}
        onOpenCreateBrand={(supplierId, name) => setBrandModal({ supplierId, initialName: name || '' })}
        onUseDifferentBrand={handleUseDifferentBrand}
        onOpenEditRow={(rowIdx) => setEditRowModal(rowIdx)}
        onAddCoatingToBrand={handleAddCoatingToBrand}
        onAddColorToBrand={handleAddColorToBrand}
      />

      {/* Create Supplier Modal */}
      <SupplierForm
        isOpen={!!supplierModal}
        onClose={() => setSupplierModal(null)}
        supplier={null}
        supplierType={supplierTypeForForm}
        initialName={supplierModal?.initialName || ''}
        onSaved={handleRefetchAndRevalidate}
      />

      {/* Create Brand Modal */}
      {brandModal && (
        <BrandForm
          isOpen={true}
          onClose={() => setBrandModal(null)}
          supplierId={brandModal.supplierId}
          brand={null}
          initialName={brandModal.initialName || ''}
          onSaved={handleRefetchAndRevalidate}
        />
      )}

      {/* Edit Row Modal */}
      {editRowModal !== null && validatedRows?.[editRowModal] && (
        <ImportRowEditForm
          isOpen={true}
          onClose={() => setEditRowModal(null)}
          row={validatedRows[editRowModal]}
          type={type}
          onSave={handleEditRowSave}
        />
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TAB_STYLE = (active) => ({
  padding: '12px 24px', fontSize: 14, fontWeight: 600,
  border: 'none', background: 'none', cursor: 'pointer',
  borderBottom: active ? '2px solid #0f2540' : '2px solid transparent',
  color: active ? '#0f2540' : '#64748b',
  marginBottom: -1, transition: 'color 0.15s, border-color 0.15s',
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
            {[{ id: 'ivl', label: 'IVL Lenses' }, { id: 'contact', label: 'Contact Lenses' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={TAB_STYLE(activeTab === tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* IVL sub-tabs */}
          {activeTab === 'ivl' && (
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 32, background: '#f8fafc' }}>
              {[{ id: 'ivl-stock', label: 'Stock' }, { id: 'ivl-rx', label: 'RX' }].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setIvlSubTab(sub.id)}
                  style={{
                    ...TAB_STYLE(ivlSubTab === sub.id),
                    padding: '9px 20px', fontSize: 13,
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
