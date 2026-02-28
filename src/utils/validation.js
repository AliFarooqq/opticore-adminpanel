import { DESIGNS, MATERIALS, LENS_TYPES, GEOMETRIES, WEARING_TIMES, PACK_TYPES, LENS_COLORS, VISION_TYPES, LENS_SHAPES, CYL_FORMATS } from '../constants/lensOptions';

/**
 * Validates a single IVL import row.
 * @param {Object} row - the parsed row object
 * @param {Object[]} suppliers - existing suppliers [{ id, name }]
 * @param {Object[]} brands - existing brands [{ id, name, supplierId }]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateIvlRow(row, suppliers, brands) {
  if (!row.supplier?.trim()) return { valid: false, error: 'supplier is required' };
  if (!row.brand?.trim()) return { valid: false, error: 'brand is required' };
  if (!row.productName?.trim()) return { valid: false, error: 'productName is required' };

  if (!DESIGNS.includes(row.design)) {
    return { valid: false, error: `design must be one of: ${DESIGNS.join(', ')}` };
  }

  if (!MATERIALS.includes(row.material)) {
    return { valid: false, error: `material must be one of: ${MATERIALS.join(', ')}` };
  }

  if (row.lensTypes) {
    const types = row.lensTypes.split(',').map(t => t.trim()).filter(Boolean);
    const invalid = types.find(t => !LENS_TYPES.includes(t));
    if (invalid) {
      return { valid: false, error: `unknown lensType: "${invalid}"` };
    }
  }

  if (!['stock', 'rx'].includes(row.availability)) {
    return { valid: false, error: 'availability must be "stock" or "rx"' };
  }

  const idx = parseFloat(row.refractiveIndex);
  if (isNaN(idx) || idx < 1.0 || idx > 2.0) {
    return { valid: false, error: 'refractiveIndex must be a number between 1.0 and 2.0' };
  }

  if (!GEOMETRIES.includes(row.geometry)) {
    return { valid: false, error: `geometry must be one of: ${GEOMETRIES.join(', ')}` };
  }

  if (!CYL_FORMATS.includes(row.cylFormat)) {
    return { valid: false, error: `cylFormat must be "plus" or "minus"` };
  }

  const wholesale = parseFloat(row.wholesalePrice);
  if (isNaN(wholesale) || wholesale < 0) {
    return { valid: false, error: 'wholesalePrice must be a non-negative number' };
  }

  if (row.retailPrice !== '' && row.retailPrice != null) {
    const retail = parseFloat(row.retailPrice);
    if (isNaN(retail) || retail < 0) {
      return { valid: false, error: 'retailPrice must be a non-negative number' };
    }
  }

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
