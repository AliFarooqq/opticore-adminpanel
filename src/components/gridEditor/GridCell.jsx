import { memo } from 'react';
import { DIAMETER_COLORS } from '../../constants/lensOptions';

function getBackground(cellData, isSelected) {
  if (!cellData) {
    return isSelected ? '#dbeafe' : null;
  }

  const { diameters } = cellData;

  if (!diameters || diameters.length === 0) {
    return isSelected ? '#93c5fd' : '#94a3b8';
  }

  if (diameters.length === 1) {
    const base = DIAMETER_COLORS[diameters[0]] || '#6b7280';
    return isSelected ? base + 'cc' : base;
  }

  // Multiple diameters: gradient split
  const stops = diameters.map((d, i) => {
    const color = DIAMETER_COLORS[d] || '#6b7280';
    const pct = (i / diameters.length) * 100;
    const nextPct = ((i + 1) / diameters.length) * 100;
    return `${color} ${pct}%, ${color} ${nextPct}%`;
  });

  return `linear-gradient(to right, ${stops.join(', ')})`;
}

const GridCell = memo(function GridCell({ sph, cyl, cellData, isSelected, isZeroSph, isZeroCyl }) {
  const bg = getBackground(cellData, isSelected);
  const isEmpty = !cellData;
  const isLinear = bg && bg.startsWith('linear-gradient');

  const emptyBg = isSelected
    ? '#dbeafe'
    : (isZeroSph || isZeroCyl)
      ? '#f0f4ff'
      : '#fff';

  return (
    <div
      data-sph={sph}
      data-cyl={cyl}
      style={{
        width: 24,
        height: 24,
        background: isEmpty ? emptyBg : (isLinear ? undefined : bg),
        backgroundImage: isLinear ? bg : undefined,
        border: isSelected
          ? '1.5px solid #3b82f6'
          : (isZeroSph || isZeroCyl)
            ? '1px solid #bfdbfe'
            : '1px solid #e5e7eb',
        boxSizing: 'border-box',
        cursor: 'crosshair',
        flexShrink: 0,
        transition: 'background 0.05s',
      }}
    />
  );
});

export default GridCell;
