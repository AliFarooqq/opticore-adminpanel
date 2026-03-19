import { DESIGNS, MATERIALS, LENS_TYPES, GEOMETRIES, WEARING_TIMES, PACK_TYPES, LENS_COLORS, VISION_TYPES, LENS_SHAPES, CYL_FORMATS, IVL_DIAMETER_OPTIONS } from '../constants/lensOptions';

const VALID_DIAMETERS = IVL_DIAMETER_OPTIONS.filter(d => d !== 'all');

// ── Shared IVL master field validation ────────────────────────────────────────

function validateIvlMasterFields(row) {
  if (!row.supplier?.trim()) return 'supplier is required';
  if (!row.brand?.trim()) return 'brand is required';
  if (!row.productname?.trim()) return 'productName is required';
  if (!DESIGNS.includes(row.design)) return `design must be one of: ${DESIGNS.join(', ')}`;
  if (!MATERIALS.includes(row.material)) return `material must be one of: ${MATERIALS.join(', ')}`;
  if (row.lenstypes) {
    const types = row.lenstypes.split(',').map(t => t.trim()).filter(Boolean);
    const invalid = types.find(t => !LENS_TYPES.includes(t));
    if (invalid) return `unknown lensType: "${invalid}"`;
  }
  const idx = parseFloat(row.refractiveindex);
  if (isNaN(idx) || idx < 1.0 || idx > 2.0) return 'refractiveIndex must be a number between 1.0 and 2.0';
  if (!GEOMETRIES.includes(row.geometry)) return `geometry must be one of: ${GEOMETRIES.join(', ')}`;
  return null;
}

/**
 * Validates a single IVL Stock import row.
 */
export function validateIvlStockRow(row) {
  const masterError = validateIvlMasterFields(row);
  if (masterError) return { valid: false, error: masterError };

  if (!CYL_FORMATS.includes(row.cylformat)) return { valid: false, error: 'cylFormat must be "plus" or "minus"' };

  if (row.wholesaleprice !== '' && row.wholesaleprice != null) {
    const wholesale = parseFloat(row.wholesaleprice);
    if (isNaN(wholesale) || wholesale < 0) return { valid: false, error: 'wholesalePrice must be a non-negative number' };
  }

  if (row.retailprice !== '' && row.retailprice != null) {
    const retail = parseFloat(row.retailprice);
    if (isNaN(retail) || retail < 0) return { valid: false, error: 'retailPrice must be a non-negative number' };
  }

  return { valid: true };
}

/**
 * Validates a single IVL RX variant row.
 * Each row represents one variant; master fields (supplier → color) repeat per product.
 */
export function validateIvlRxRow(row) {
  const masterError = validateIvlMasterFields(row);
  if (masterError) return { valid: false, error: masterError };

  const mode = row.diametermode;
  if (!['single', 'range'].includes(mode)) return { valid: false, error: 'diameterMode must be "single" or "range"' };

  if (mode === 'single') {
    if (!VALID_DIAMETERS.includes(row.diametervalue)) {
      return { valid: false, error: `diameterValue must be one of: ${VALID_DIAMETERS.join(', ')}` };
    }
  } else {
    if (!VALID_DIAMETERS.includes(row.diameterfrom)) {
      return { valid: false, error: `diameterFrom must be one of: ${VALID_DIAMETERS.join(', ')}` };
    }
    if (!VALID_DIAMETERS.includes(row.diameterto)) {
      return { valid: false, error: `diameterTo must be one of: ${VALID_DIAMETERS.join(', ')}` };
    }
    if (parseFloat(row.diameterfrom) >= parseFloat(row.diameterto)) {
      return { valid: false, error: 'diameterFrom must be less than diameterTo' };
    }
  }

  if (row.sphmin === '' || row.sphmin == null) return { valid: false, error: 'sphMin is required' };
  if (row.sphmax === '' || row.sphmax == null) return { valid: false, error: 'sphMax is required' };
  if (isNaN(parseFloat(row.sphmin))) return { valid: false, error: 'sphMin must be a number' };
  if (isNaN(parseFloat(row.sphmax))) return { valid: false, error: 'sphMax must be a number' };

  if (row.cylmin === '' || row.cylmin == null) return { valid: false, error: 'cylMin is required' };
  if (row.cylmax === '' || row.cylmax == null) return { valid: false, error: 'cylMax is required' };
  if (isNaN(parseFloat(row.cylmin))) return { valid: false, error: 'cylMin must be a number' };
  if (isNaN(parseFloat(row.cylmax))) return { valid: false, error: 'cylMax must be a number' };

  if (!CYL_FORMATS.includes(row.cylformat)) return { valid: false, error: 'cylFormat must be "plus" or "minus"' };

  if (row.wholesaleprice !== '' && row.wholesaleprice != null) {
    const wholesale = parseFloat(row.wholesaleprice);
    if (isNaN(wholesale) || wholesale < 0) return { valid: false, error: 'wholesalePrice must be a non-negative number' };
  }

  if (row.retailprice !== '' && row.retailprice != null) {
    const retail = parseFloat(row.retailprice);
    if (isNaN(retail) || retail < 0) return { valid: false, error: 'retailPrice must be a non-negative number' };
  }

  return { valid: true };
}

/**
 * @deprecated Use validateIvlStockRow or validateIvlRxRow instead.
 */
export function validateIvlRow(row, suppliers, brands) {
  if (!row.supplier?.trim()) return { valid: false, error: 'supplier is required' };
  if (!row.brand?.trim()) return { valid: false, error: 'brand is required' };
  if (!row.productName?.trim()) return { valid: false, error: 'productName is required' };
  if (!DESIGNS.includes(row.design)) return { valid: false, error: `design must be one of: ${DESIGNS.join(', ')}` };
  if (!MATERIALS.includes(row.material)) return { valid: false, error: `material must be one of: ${MATERIALS.join(', ')}` };
  if (!['stock', 'rx'].includes(row.availability)) return { valid: false, error: 'availability must be "stock" or "rx"' };
  const idx = parseFloat(row.refractiveIndex);
  if (isNaN(idx) || idx < 1.0 || idx > 2.0) return { valid: false, error: 'refractiveIndex must be a number between 1.0 and 2.0' };
  if (!GEOMETRIES.includes(row.geometry)) return { valid: false, error: `geometry must be one of: ${GEOMETRIES.join(', ')}` };
  if (!CYL_FORMATS.includes(row.cylFormat)) return { valid: false, error: 'cylFormat must be "plus" or "minus"' };
  return { valid: true };
}

/**
 * Validates a single Contact Lens import row.
 * @param {Object} row - the parsed row object
 * @param {Object[]} suppliers
 * @param {Object[]} brands
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateContactRow(row, suppliers, brands) {
  if (!row.supplier?.trim()) return { valid: false, error: 'supplier is required' };
  if (!row.brand?.trim()) return { valid: false, error: 'brand is required' };
  if (!row.productName?.trim()) return { valid: false, error: 'productName is required' };

  if (!LENS_COLORS.includes(row.lensColor)) {
    return { valid: false, error: `lensColor must be "clear" or "color"` };
  }

  if (!VISION_TYPES.includes(row.visionType)) {
    return { valid: false, error: `visionType must be one of: ${VISION_TYPES.join(', ')}` };
  }

  if (!LENS_SHAPES.includes(row.lensShape)) {
    return { valid: false, error: `lensShape must be "spherical" or "toric"` };
  }

  if (!WEARING_TIMES.includes(row.wearingTime)) {
    return { valid: false, error: `wearingTime must be one of: ${WEARING_TIMES.join(', ')}` };
  }

  if (!PACK_TYPES.includes(row.packType)) {
    return { valid: false, error: `packType must be one of: ${PACK_TYPES.join(', ')}` };
  }

  if (!validateRange(row.sphMin, row.sphMax, row.sphStep)) {
    return { valid: false, error: 'sphMin/sphMax/sphStep must be valid numbers' };
  }

  if (row.lensShape === 'toric') {
    if (!validateRange(row.cylMin, row.cylMax, row.cylStep)) {
      return { valid: false, error: 'cylMin/cylMax/cylStep are required for toric lenses' };
    }
    if (!validateRange(row.axisMin, row.axisMax, row.axisStep)) {
      return { valid: false, error: 'axisMin/axisMax/axisStep are required for toric lenses' };
    }
  }

  if (row.visionType === 'multifocal') {
    if (!validateRange(row.addMin, row.addMax, row.addStep)) {
      return { valid: false, error: 'addMin/addMax/addStep are required for multifocal lenses' };
    }
  }

  const price = parseFloat(row.price);
  if (isNaN(price) || price < 0) {
    return { valid: false, error: 'price must be a non-negative number' };
  }

  return { valid: true };
}

function validateRange(min, max, step) {
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  const stepVal = parseFloat(step);
  return !isNaN(minVal) && !isNaN(maxVal) && !isNaN(stepVal) && stepVal > 0;
}
