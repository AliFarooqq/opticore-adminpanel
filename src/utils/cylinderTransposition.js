/**
 * Converts a prescription from plus-cylinder to minus-cylinder format (or vice versa).
 * The math is identical in both directions.
 * Input: { sph, cyl, axis }
 * Output: { sph: newSph, cyl: newCyl, axis: newAxis }
 */
export function plusToMinus({ sph, cyl, axis }) {
  return {
    sph: round2(sph + cyl),
    cyl: round2(-cyl),
    axis: axis !== undefined ? (axis + 90) % 180 : undefined,
  };
}

/**
 * Converts minus-cylinder to plus-cylinder format.
 * Mathematically identical to plusToMinus.
 */
export function minusToPlus({ sph, cyl, axis }) {
  return plusToMinus({ sph, cyl, axis });
}

/**
 * Given a prescription and a lens's cylFormat, returns the prescription
 * converted to match the lens format for availability checking.
 *
 * @param {number} sph
 * @param {number} cyl
 * @param {number|undefined} axis
 * @param {'plus'|'minus'} cylFormat - the lens's native cylinder format
 * @returns {{ sph: number, cyl: number, axis: number|undefined }}
 */
export function normalizePrescription(sph, cyl, axis, cylFormat) {
  const cylIsPositive = cyl > 0;
  const cylIsNegative = cyl < 0;

  if (cylFormat === 'plus' && cylIsNegative) {
    return plusToMinus({ sph, cyl, axis });
  }

  if (cylFormat === 'minus' && cylIsPositive) {
    return plusToMinus({ sph, cyl, axis });
  }

  return { sph, cyl, axis };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
