import { useCallback, useRef, memo } from 'react';
import { generateSphValues, generateCylValues, makeCellKey } from '../../utils/gridSerializer';
import GridCell from './GridCell';

const SPH_LABEL_WIDTH = 68;
const CYL_LABEL_HEIGHT = 40;
const CELL_SIZE = 24;

const GridEditor = memo(function GridEditor({
  cells,
  cylFormat,
  selectedCells,
  isDragging,
  onStartDrag,
  onContinueDrag,
  onEndDrag,
}) {
  const sphValues = generateSphValues();
  const cylValues = generateCylValues(cylFormat);
  const containerRef = useRef(null);

  const getCell = useCallback((target) => {
    const el = target.closest('[data-sph]');
    if (!el) return null;
    return {
      sph: parseFloat(el.dataset.sph),
      cyl: parseFloat(el.dataset.cyl),
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const cell = getCell(e.target);
    if (!cell) return;
    e.preventDefault();
    onStartDrag(cell.sph, cell.cyl);
  }, [getCell, onStartDrag]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const cell = getCell(e.target);
    if (!cell) return;
    onContinueDrag(cell.sph, cell.cyl);
  }, [isDragging, getCell, onContinueDrag]);

  const handleMouseUp = useCallback(() => {
    onEndDrag();
  }, [onEndDrag]);

  return (
    <div
      style={{ overflow: 'auto', flex: 1, userSelect: 'none', background: '#f1f5f9', padding: 20 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Axis header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ width: SPH_LABEL_WIDTH, flexShrink: 0, fontSize: 10, fontWeight: 700, color: '#64748b', textAlign: 'right', paddingRight: 8, letterSpacing: '0.05em' }}>
          SPH ↓
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', paddingLeft: 4 }}>
          CYL →
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          display: 'inline-block',
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* Top-left corner spacer + CYL labels row */}
        <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 3, background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
          <div style={{ width: SPH_LABEL_WIDTH, height: CYL_LABEL_HEIGHT, flexShrink: 0, borderRight: '1.5px solid #e2e8f0', background: '#f8fafc' }} />

          {/* CYL labels */}
          {cylValues.map(cyl => (
            <div
              key={cyl}
              style={{
                width: CELL_SIZE,
                height: CYL_LABEL_HEIGHT,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: cyl === 0 ? 800 : 500,
                color: cyl === 0 ? '#1e3a5f' : '#94a3b8',
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
                overflow: 'hidden',
                background: cyl === 0 ? '#eff6ff' : 'transparent',
                borderLeft: cyl === 0 ? '1px solid #bfdbfe' : 'none',
                borderRight: cyl === 0 ? '1px solid #bfdbfe' : 'none',
              }}
            >
              {cyl.toFixed(2)}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {sphValues.map(sph => (
          <div key={sph} style={{ display: 'flex', alignItems: 'center', background: sph === 0 ? '#eff6ff' : 'transparent' }}>
            {/* SPH label */}
            <div
              style={{
                width: SPH_LABEL_WIDTH,
                height: CELL_SIZE,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 8,
                fontSize: 9,
                fontWeight: sph === 0 ? 800 : 500,
                color: sph === 0 ? '#1e3a5f' : '#94a3b8',
                position: 'sticky',
                left: 0,
                background: sph === 0 ? '#eff6ff' : '#f8fafc',
                borderRight: '1.5px solid #e2e8f0',
                zIndex: 2,
                letterSpacing: '0.02em',
              }}
            >
              {sph >= 0 ? `+${sph.toFixed(2)}` : sph.toFixed(2)}
            </div>

            {/* Cells */}
            {cylValues.map(cyl => {
              const key = makeCellKey(sph, cyl);
              const cellData = cells[key] || null;
              const isSelected = selectedCells.has(key);

              return (
                <GridCell
                  key={key}
                  sph={sph}
                  cyl={cyl}
                  cellData={cellData}
                  isSelected={isSelected}
                  isZeroSph={sph === 0}
                  isZeroCyl={cyl === 0}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default GridEditor;
