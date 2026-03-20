import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { validateIvlStockRow, validateIvlRxRow, validateContactRow, validateIvlRow } from '../utils/validation';

const _getSuppliersAndBrands = httpsCallable(functions, 'getSuppliersAndBrands');
const _bulkImportLenses = httpsCallable(functions, 'bulkImportLenses');

// ── File Parsing ───────────────────────────────────────────────────────────────

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') return parseCsv(file);
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file);
  throw new Error('Unsupported file type. Please upload a CSV or Excel file.');
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase(),
      transform: v => v.trim(),
      complete: result => resolve(result.data),
      error: err => reject(new Error(err.message)),
    });
  });
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const normalized = rows.map(row => {
          const out = {};
          for (const key of Object.keys(row)) {
            out[key.trim().toLowerCase()] = String(row[key]).trim();
          }
          return out;
        });
        resolve(normalized);
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Reference Data (suppliers + brands from DB) ────────────────────────────────

export async function fetchRefData() {
  const result = await _getSuppliersAndBrands();
  return result.data; // { suppliers: [{id, name, type}], brands: [{id, name, supplierId}] }
}

// ── Validation (synchronous after ref data is fetched) ────────────────────────

function runValidator(row, type, suppliers, brands) {
  if (type === 'ivl-stock') return validateIvlStockRow(row, suppliers, brands);
  if (type === 'ivl-rx')    return validateIvlRxRow(row, suppliers, brands);
  if (type === 'contact')   return validateContactRow(row, suppliers, brands);
  return validateIvlRow(row, suppliers, brands); // legacy
}

export function validateRows(rows, type, suppliers, brands) {
  return rows.map((row, index) => ({
    rowNumber: index + 2,
    supplier: row.supplier || '',
    brand: row.brand || '',
    productName: row.productname || row.productName || '',
    skipped: false,
    ...runValidator(row, type, suppliers, brands),
    raw: row,
  }));
}

export function revalidateSingleRow(raw, type, suppliers, brands) {
  return runValidator(raw, type, suppliers, brands);
}

// ── Import ─────────────────────────────────────────────────────────────────────

export async function importValidRows(validatedRows, type) {
  const validRows = validatedRows.filter(r => r.valid && !r.skipped);

  let rows;
  if (type === 'ivl-rx') {
    const groups = {};
    for (const row of validRows) {
      const key = `${row.supplier}|${row.brand}|${row.raw.productname}`;
      if (!groups[key]) {
        groups[key] = { supplier: row.supplier, brand: row.brand, raw: row.raw, variants: [] };
      }
      groups[key].variants.push(row.raw);
    }
    rows = Object.values(groups);
  } else {
    rows = validRows.map(r => ({ supplier: r.supplier, brand: r.brand, raw: r.raw }));
  }

  const result = await _bulkImportLenses({ rows, type });
  return result.data.imported;
}
