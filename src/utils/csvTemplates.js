/**
 * Returns the column headers for the IVL Stock lens import template.
 */
export function getIvlStockTemplateHeaders() {
  return [
    'supplier',
    'brand',
    'productName',
    'design',
    'material',
    'lensTypes',
    'refractiveIndex',
    'geometry',
    'coating',
    'color',
    'cylFormat',
    'wholesalePrice',
    'retailPrice',
  ];
}

/**
 * Returns the column headers for the IVL RX lens import template.
 * Each row represents one variant. Master fields (supplier → color) repeat per variant.
 */
export function getIvlRxTemplateHeaders() {
  return [
    'supplier',
    'brand',
    'productName',
    'design',
    'material',
    'lensTypes',
    'refractiveIndex',
    'geometry',
    'coating',
    'color',
    'diameterMode',
    'diameterValue',
    'diameterFrom',
    'diameterTo',
    'sphMin',
    'sphMax',
    'cylMin',
    'cylMax',
    'cylFormat',
    'wholesalePrice',
    'retailPrice',
  ];
}

/**
 * Returns the column headers for the Contact Lens import template.
 */
export function getContactTemplateHeaders() {
  return [
    'supplier',
    'brand',
    'productName',
    'lensColor',
    'visionType',
    'lensShape',
    'wearingTime',
    'packType',
    'sphMin',
    'sphMax',
    'sphStep',
    'cylMin',
    'cylMax',
    'cylStep',
    'axisMin',
    'axisMax',
    'axisStep',
    'addMin',
    'addMax',
    'addStep',
    'baseCurves',
    'diameters',
    'price',
  ];
}

/**
 * Returns an example row for the IVL Stock template.
 */
function getIvlStockExampleRow() {
  return [
    'Acme Optics',
    'ClearVision',
    'UltraClear 1.60',
    'Single Vision',
    'Plastic',
    'Clear',
    '1.60',
    'AS',
    'AR + HC',
    '',
    '-CYL',
    '12.50',
    '25.00',
  ];
}

/**
 * Returns example rows for the IVL RX template (1 lens with 2 variants).
 */
function getIvlRxExampleRows() {
  const master = ['Acme Optics', 'ClearVision', 'UltraClear RX 1.60', 'Single Vision', 'Plastic', 'Clear', '1.60', 'AS', 'AR + HC', ''];
  return [
    [...master, 'single', '65', '', '', '-6.00', '+4.00', '-2.00', '0.00', '-CYL', '14.00', '28.00'],
    [...master, 'range',  '',  '65', '75', '-8.00', '+6.00', '-4.00', '0.00', '-CYL', '16.00', '32.00'],
  ];
}

/**
 * Returns an example row for the Contact Lens template.
 */
function getContactExampleRow() {
  return [
    'Acme Optics',
    'AquaLens',
    'AquaSoft Monthly',
    'Clear',
    'Single Vision',
    'Spherical',
    'Monthly',
    '6 Pack',
    '-6.00',
    '+6.00',
    '0.25',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '8.6,8.8',
    '14.2',
    '18.50',
  ];
}

/**
 * Generates and triggers a CSV file download.
 * @param {string} filename
 * @param {string[]} headers
 * @param {string[]} exampleRow
 */
export function downloadTemplate(filename, headers, exampleRow = []) {
  const rows = [headers, exampleRow].filter(r => r.length > 0);
  const csvContent = rows.map(row => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadIvlStockTemplate() {
  downloadTemplate('ivl_stock_template.csv', getIvlStockTemplateHeaders(), getIvlStockExampleRow());
}

export function downloadIvlRxTemplate() {
  const headers = getIvlRxTemplateHeaders();
  const exampleRows = getIvlRxExampleRows();
  const rows = [headers, ...exampleRows];
  const csvContent = rows.map(row => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'ivl_rx_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadContactTemplate() {
  downloadTemplate('contact_lenses_template.csv', getContactTemplateHeaders(), getContactExampleRow());
}

function escapeCell(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
