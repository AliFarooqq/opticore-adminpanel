import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { validateIvlRow, validateContactRow } from '../utils/validation';

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

// ── Validation ─────────────────────────────────────────────────────────────────

export async function validateRows(rows, type) {
  const result = await _getSuppliersAndBrands();
  const { suppliers, brands } = result.data;

  return rows.map((row, index) => {
    const validation =
      type === 'ivl'
        ? validateIvlRow(row, suppliers, brands)
        : validateContactRow(row, suppliers, brands);

    return {
      rowNumber: index + 2,
      supplier: row.supplier || '',
      brand: row.brand || '',
      productName: row.productName || '',
      ...validation,
      raw: row,
    };
  });
}

// ── Import ─────────────────────────────────────────────────────────────────────

export async function importValidRows(validatedRows, type) {
  const validRows = validatedRows
    .filter(r => r.valid)
    .map(r => ({ supplier: r.supplier, brand: r.brand, raw: r.raw }));

  const result = await _bulkImportLenses({ rows: validRows, type });
  return result.data.imported;
}
