/**
 * Generates a cell key from SPH and CYL values.
 * e.g. sph=-2.00, cyl=+1.00 → "-2.00_+1.00"
 */
export function makeCellKey(sph, cyl) {
  const sphStr = formatDiopter(sph);
  const cylStr = formatDiopter(cyl);
  return `${sphStr}_${cylStr}`;
}

/**
 * Parses a cell key back into { sph, cyl }.
 */
export function parseCellKey(key) {
  const [sphStr, cylStr] = key.split('_');
  return {
    sph: parseFloat(sphStr),
    cyl: parseFloat(cylStr),
  };
}

/**
 * Generates all SPH values from -20.00 to +20.00 in 0.25 steps.
 */
export function generateSphValues() {
  const values = [];
  for (let i = -2000; i <= 2000; i += 25) {
    values.push(i / 100);
  }
  return values;
}

/**
 * Generates CYL values:
 * - plus format: 0 to +6.00 in 0.25 steps
 * - minus format: 0 to -6.00 in 0.25 steps
 */
export function generateCylValues(cylFormat) {
  const values = [];
  if (cylFormat === 'minus') {
    for (let i = 0; i >= -600; i -= 25) {
      values.push(i / 100);
    }
  } else {
    for (let i = 0; i <= 600; i += 25) {
      values.push(i / 100);
    }
  }
  return values;
}

/**
 * Fills a rectangular region in the grid.
 * Returns updated cells object.
 */
export function fillRectangle(cells, sphMin, sphMax, cylMin, cylMax, diameters) {
  const newCells = { ...cells };
  const sphValues = generateSphValues().filter(s => s >= sphMin && s <= sphMax);
  const cylValues = [cylMin, cylMax].includes(undefined)
    ? []
    : generateAllCylInRange(cylMin, cylMax);

  for (const sph of sphValues) {
    for (const cyl of cylValues) {
      const key = makeCellKey(sph, cyl);
      newCells[key] = { active: true, diameters: [...diameters] };
    }
  }
  return newCells;
}

/**
 * Fills a triangular region where SPH + CYL <= maxSum.
 * Returns updated cells object.
 */
export function fillTriangle(cells, sphValues, cylValues, maxSum, diameters) {
  const newCells = { ...cells };
  for (const sph of sphValues) {
    for (const cyl of cylValues) {
      if (sph + Math.abs(cyl) <= maxSum) {
        const key = makeCellKey(sph, cyl);
        newCells[key] = { active: true, diameters: [...diameters] };
      }
    }
  }
  return newCells;
}

/**
 * Removes all cells in a rectangular region.
 */
export function eraseRectangle(cells, sphMin, sphMax, cylMin, cylMax) {
  const newCells = { ...cells };
  const sphValues = generateSphValues().filter(s => s >= sphMin && s <= sphMax);
  const cylValues = generateAllCylInRange(cylMin, cylMax);

  for (const sph of sphValues) {
    for (const cyl of cylValues) {
      const key = makeCellKey(sph, cyl);
      delete newCells[key];
    }
  }
  return newCells;
}

// --- Helpers ---

function formatDiopter(value) {
  const abs = Math.abs(value).toFixed(2);
  if (value >= 0) return `+${abs}`;
  return `-${abs}`;
}

function generateAllCylInRange(cylMin, cylMax) {
  const values = [];
  const min = Math.min(cylMin, cylMax);
  const max = Math.max(cylMin, cylMax);
  for (let i = Math.round(min * 100); i <= Math.round(max * 100); i += 25) {
    values.push(i / 100);
  }
  return values;
}
