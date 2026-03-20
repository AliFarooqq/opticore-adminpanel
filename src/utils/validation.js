import {
  DESIGNS, MATERIALS, LENS_TYPES, GEOMETRIES,
  WEARING_TIMES, PACK_TYPES, LENS_COLORS, VISION_TYPES,
  LENS_SHAPES, CYL_FORMATS, IVL_DIAMETER_OPTIONS,
  REFRACTIVE_INDICES,
} from '../constants/lensOptions';

const VALID_DIAMETERS = IVL_DIAMETER_OPTIONS.filter(d => d !== 'all');

// ── Shared helpers ────────────────────────────────────────────────────────────

function result(cellErrors) {
  const valid = Object.keys(cellErrors).length === 0;
  return { valid, cellErrors, error: valid ? null : Object.values(cellErrors)[0] };
}

function checkSupplier(row, suppliers, expectedType, cellErrors) {
  if (!row.supplier?.trim()) {
    cellErrors.supplier = 'Supplier is required';
    return null;
  }
  const match = suppliers.find(
    s => s.name.toLowerCase() === row.supplier.trim().toLowerCase() && s.type === expectedType
  );
  if (!match) {
    const wrongType = suppliers.find(
      s => s.name.toLowerCase() === row.supplier.trim().toLowerCase()
    );
    cellErrors.supplier = wrongType
      ? `"${row.supplier}" is a ${wrongType.type === 'ivl' ? 'IVL' : 'Contact'} Supplier — wrong type for this import`
      : `Supplier "${row.supplier}" not found`;
    return null;
  }
  return match;
}

function checkBrand(row, supplierObj, brands, cellErrors) {
  if (!row.brand?.trim()) {
    cellErrors.brand = 'Brand is required';
    return;
  }
  if (!supplierObj) return; // supplier error already caught above
  const match = brands.find(
    b => b.name.toLowerCase() === row.brand.trim().toLowerCase() && b.supplierId === supplierObj.id
  );
  if (!match) {
    const elsewhere = brands.find(b => b.name.toLowerCase() === row.brand.trim().toLowerCase());
    cellErrors.brand = elsewhere
      ? `"${row.brand}" exists but belongs to a different supplier`
      : `Brand "${row.brand}" not found under "${row.supplier}"`;
  }
}

function checkIvlMasterFields(row, suppliers, brands, cellErrors) {
  const supplierObj = checkSupplier(row, suppliers, 'ivl', cellErrors);
  checkBrand(row, supplierObj, brands, cellErrors);
  if (!row.productname?.trim()) cellErrors.productname = 'Product name is required';
  if (!DESIGNS.includes(row.design)) cellErrors.design = `Must be one of: ${DESIGNS.join(', ')}`;
  if (!MATERIALS.includes(row.material)) cellErrors.material = `Must be one of: ${MATERIALS.join(', ')}`;
  if (row.lenstypes) {
    const types = row.lenstypes.split(',').map(t => t.trim()).filter(Boolean);
    const invalid = types.find(t => !LENS_TYPES.includes(t));
    if (invalid) cellErrors.lenstypes = `Unknown lens type "${invalid}". Valid: ${LENS_TYPES.join(', ')}`;
  }
  const idx = parseFloat(row.refractiveindex);
  if (isNaN(idx) || !REFRACTIVE_INDICES.includes(idx)) {
    cellErrors.refractiveindex = `Must be one of: ${REFRACTIVE_INDICES.join(', ')}`;
  }
  if (!GEOMETRIES.includes(row.geometry)) cellErrors.geometry = `Must be one of: ${GEOMETRIES.join(', ')}`;
}

// ── IVL Stock ─────────────────────────────────────────────────────────────────

export function validateIvlStockRow(row, suppliers = [], brands = []) {
  const cellErrors = {};
  checkIvlMasterFields(row, suppliers, brands, cellErrors);
  if (!CYL_FORMATS.includes(row.cylformat)) cellErrors.cylformat = 'Must be "plus" or "minus"';
  if (row.wholesaleprice !== '' && row.wholesaleprice != null) {
    const v = parseFloat(row.wholesaleprice);
    if (isNaN(v) || v < 0) cellErrors.wholesaleprice = 'Must be a non-negative number';
  }
  if (row.retailprice !== '' && row.retailprice != null) {
    const v = parseFloat(row.retailprice);
    if (isNaN(v) || v < 0) cellErrors.retailprice = 'Must be a non-negative number';
  }
  return result(cellErrors);
}

// ── IVL RX ────────────────────────────────────────────────────────────────────

export function validateIvlRxRow(row, suppliers = [], brands = []) {
  const cellErrors = {};
  checkIvlMasterFields(row, suppliers, brands, cellErrors);

  const mode = row.diametermode;
  if (!['single', 'range'].includes(mode)) {
    cellErrors.diametermode = 'Must be "single" or "range"';
  } else if (mode === 'single') {
    if (!VALID_DIAMETERS.includes(row.diametervalue)) {
      cellErrors.diametervalue = `Must be one of: ${VALID_DIAMETERS.join(', ')}`;
    }
  } else {
    if (!VALID_DIAMETERS.includes(row.diameterfrom)) cellErrors.diameterfrom = `Must be one of: ${VALID_DIAMETERS.join(', ')}`;
    if (!VALID_DIAMETERS.includes(row.diameterto)) cellErrors.diameterto = `Must be one of: ${VALID_DIAMETERS.join(', ')}`;
    if (!cellErrors.diameterfrom && !cellErrors.diameterto &&
        parseFloat(row.diameterfrom) >= parseFloat(row.diameterto)) {
      cellErrors.diameterfrom = 'diameterFrom must be less than diameterTo';
    }
  }

  if (row.sphmin === '' || row.sphmin == null) cellErrors.sphmin = 'sphMin is required';
  else if (isNaN(parseFloat(row.sphmin))) cellErrors.sphmin = 'Must be a number';

  if (row.sphmax === '' || row.sphmax == null) cellErrors.sphmax = 'sphMax is required';
  else if (isNaN(parseFloat(row.sphmax))) cellErrors.sphmax = 'Must be a number';

  if (row.cylmin === '' || row.cylmin == null) cellErrors.cylmin = 'cylMin is required';
  else if (isNaN(parseFloat(row.cylmin))) cellErrors.cylmin = 'Must be a number';

  if (row.cylmax === '' || row.cylmax == null) cellErrors.cylmax = 'cylMax is required';
  else if (isNaN(parseFloat(row.cylmax))) cellErrors.cylmax = 'Must be a number';

  if (!CYL_FORMATS.includes(row.cylformat)) cellErrors.cylformat = 'Must be "plus" or "minus"';

  if (row.wholesaleprice !== '' && row.wholesaleprice != null) {
    const v = parseFloat(row.wholesaleprice);
    if (isNaN(v) || v < 0) cellErrors.wholesaleprice = 'Must be a non-negative number';
  }
  if (row.retailprice !== '' && row.retailprice != null) {
    const v = parseFloat(row.retailprice);
    if (isNaN(v) || v < 0) cellErrors.retailprice = 'Must be a non-negative number';
  }
  return result(cellErrors);
}

// ── Contact Lenses ────────────────────────────────────────────────────────────

export function validateContactRow(row, suppliers = [], brands = []) {
  const cellErrors = {};

  const supplierObj = checkSupplier(row, suppliers, 'contact', cellErrors);
  checkBrand(row, supplierObj, brands, cellErrors);

  if (!row.productname?.trim()) cellErrors.productname = 'Product name is required';
  if (!LENS_COLORS.includes(row.lenscolor)) cellErrors.lenscolor = 'Must be "clear" or "color"';
  if (!VISION_TYPES.includes(row.visiontype)) cellErrors.visiontype = `Must be one of: ${VISION_TYPES.join(', ')}`;
  if (!LENS_SHAPES.includes(row.lensshape)) cellErrors.lensshape = 'Must be "spherical" or "toric"';
  if (!WEARING_TIMES.includes(row.wearingtime)) cellErrors.wearingtime = `Must be one of: ${WEARING_TIMES.join(', ')}`;
  if (!PACK_TYPES.includes(row.packtype)) cellErrors.packtype = `Must be one of: ${PACK_TYPES.join(', ')}`;

  if (!_validRange(row.sphmin, row.sphmax, row.sphstep)) cellErrors.sphmin = 'sphMin/sphMax/sphStep must be valid numbers';

  if (row.lensshape === 'toric') {
    if (!_validRange(row.cylmin, row.cylmax, row.cylstep)) cellErrors.cylmin = 'cylMin/cylMax/cylStep required for toric';
    if (!_validRange(row.axismin, row.axismax, row.axisstep)) cellErrors.axismin = 'axisMin/axisMax/axisStep required for toric';
  }
  if (row.visiontype === 'multifocal') {
    if (!_validRange(row.addmin, row.addmax, row.addstep)) cellErrors.addmin = 'addMin/addMax/addStep required for multifocal';
  }

  const price = parseFloat(row.price);
  if (isNaN(price) || price < 0) cellErrors.price = 'Must be a non-negative number';

  return result(cellErrors);
}

function _validRange(min, max, step) {
  return !isNaN(parseFloat(min)) && !isNaN(parseFloat(max)) && !isNaN(parseFloat(step)) && parseFloat(step) > 0;
}

// ── Legacy (keep for backward compat) ────────────────────────────────────────

export function validateIvlRow(row, suppliers = [], brands = []) {
  return validateIvlStockRow({ ...row, supplier: row.supplier, brand: row.brand }, suppliers, brands);
}
