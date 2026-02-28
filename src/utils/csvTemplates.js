/**
 * Returns the column headers for the IVL lens import template.
 */
export function getIvlTemplateHeaders() {
  return [
    'supplier',
    'brand',
    'productName',
    'design',
    'material',
    'lensTypes',
    'availability',
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
 * Returns an example row for the IVL template.
 */
function getIvlExampleRow() {
  return [
    'Acme Optics',
    'ClearVision',
    'UltraClear 1.60',
    'single_vision',
    'plastic',
    'clear,photochromic',
    'stock',
    '1.60',
    'as',
    'AR + HC',
    '',
    'minus',
    '12.50',
    '25.00',
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
    'clear',
    'single_vision',
    'spherical',
    'monthly',
    '6_pack',
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

export function downloadIvlTemplate() {
  downloadTemplate('ivl_lenses_template.csv', getIvlTemplateHeaders(), getIvlExampleRow());
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
