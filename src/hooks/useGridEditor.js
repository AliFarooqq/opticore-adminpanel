import { useState, useCallback, useMemo } from 'react';
import { makeCellKey, parseCellKey, generateSphValues, generateCylValues, fillRectangle, fillTriangle } from '../utils/gridSerializer';
import { plusToMinus } from '../utils/cylinderTransposition';
import { getIvlLens, updateStockGrid } from '../services/ivlLensesService';

export function useGridEditor() {
  const [cells, setCells] = useState({});
  const [cylFormat, setCylFormat] = useState('minus');
  const [activeMode, setActiveMode] = useState('select');
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [saving, setSaving] = useState(false);

  // Compute rectangle preview during drag
  const dragPreview = useMemo(() => {
    if (!isDragging || !dragStart || !dragCurrent) return new Set();
    if (activeMode !== 'rectangle' && activeMode !== 'erase') return new Set();

    const sphMin = Math.min(dragStart.sph, dragCurrent.sph);
    const sphMax = Math.max(dragStart.sph, dragCurrent.sph);
    const cylMin = Math.min(dragStart.cyl, dragCurrent.cyl);
    const cylMax = Math.max(dragStart.cyl, dragCurrent.cyl);

    const sphVals = generateSphValues().filter(s => s >= sphMin - 0.001 && s <= sphMax + 0.001);
    const cylVals = generateCylValues(cylFormat).filter(c => c >= cylMin - 0.001 && c <= cylMax + 0.001);

    const result = new Set();
    for (const s of sphVals) {
      for (const c of cylVals) {
        result.add(makeCellKey(s, c));
      }
    }
    return result;
  }, [isDragging, activeMode, dragStart, dragCurrent, cylFormat]);

  // Effective selection (committed + drag preview for rectangle)
  const effectiveSelection = useMemo(() => {
    if (activeMode === 'rectangle' && isDragging) {
      return dragPreview;
    }
    return selectedCells;
  }, [activeMode, isDragging, dragPreview, selectedCells]);

  const startDrag = useCallback((sph, cyl) => {
    setIsDragging(true);
    setDragStart({ sph, cyl });
    setDragCurrent({ sph, cyl });

    if (activeMode === 'select') {
      const key = makeCellKey(sph, cyl);
      setSelectedCells(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    } else if (activeMode === 'erase') {
      const key = makeCellKey(sph, cyl);
      setCells(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, [activeMode]);

  const continueDrag = useCallback((sph, cyl) => {
    if (!isDragging) return;
    setDragCurrent({ sph, cyl });

    if (activeMode === 'erase') {
      const key = makeCellKey(sph, cyl);
      setCells(prev => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, [isDragging, activeMode]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;

    if (activeMode === 'rectangle' && dragPreview.size > 0) {
      setSelectedCells(dragPreview);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }, [isDragging, activeMode, dragPreview]);

  const toggleCell = useCallback((sph, cyl) => {
    const key = makeCellKey(sph, cyl);
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const applyDiameters = useCallback((diameters) => {
    if (selectedCells.size === 0) return;
    setCells(prev => {
      const next = { ...prev };
      for (const key of selectedCells) {
        next[key] = { active: true, diameters: [...diameters] };
      }
      return next;
    });
    setSelectedCells(new Set());
  }, [selectedCells]);

  const quickFill = useCallback((sphMin, sphMax, cylMin, cylMax, diameters) => {
    setCells(prev => fillRectangle(prev, sphMin, sphMax, cylMin, cylMax, diameters));
  }, []);

  const fillTriangleRegion = useCallback((maxSum, diameters) => {
    const sphVals = generateSphValues();
    const cylVals = generateCylValues(cylFormat);
    setCells(prev => fillTriangle(prev, sphVals, cylVals, maxSum, diameters));
  }, [cylFormat]);

  const eraseSelected = useCallback(() => {
    if (selectedCells.size === 0) return;
    setCells(prev => {
      const next = { ...prev };
      for (const key of selectedCells) delete next[key];
      return next;
    });
    setSelectedCells(new Set());
  }, [selectedCells]);

  const eraseAll = useCallback(() => {
    setCells({});
    setSelectedCells(new Set());
  }, []);

  const toggleCylFormat = useCallback(() => {
    setCells(prev => {
      const transposed = {};
      for (const [key, value] of Object.entries(prev)) {
        const { sph, cyl } = parseCellKey(key);
        const { sph: newSph, cyl: newCyl } = plusToMinus({ sph, cyl });
        const newKey = makeCellKey(newSph, newCyl);
        transposed[newKey] = value;
      }
      return transposed;
    });
    setCylFormat(prev => (prev === 'minus' ? 'plus' : 'minus'));
  }, []);

  const loadFromFirestore = useCallback(async (supplierId, brandId, lensId) => {
    const lens = await getIvlLens(supplierId, brandId, lensId);
    setCylFormat(lens.cylFormat || 'minus');
    setCells(lens.stockGrid?.cells || {});
  }, []);

  const saveToFirestore = useCallback(async (supplierId, brandId, lensId) => {
    setSaving(true);
    try {
      await updateStockGrid(supplierId, brandId, lensId, cells);
    } finally {
      setSaving(false);
    }
  }, [cells]);

  // Grid stats
  const stats = useMemo(() => {
    const byDiameter = {};
    let total = 0;
    for (const cell of Object.values(cells)) {
      if (!cell.active && cell.diameters?.length === 0) continue;
      total++;
      for (const d of (cell.diameters || [])) {
        byDiameter[d] = (byDiameter[d] || 0) + 1;
      }
    }
    return { total: Object.keys(cells).length, byDiameter };
  }, [cells]);

  return {
    cells,
    cylFormat,
    activeMode,
    setActiveMode,
    selectedCells: effectiveSelection,
    isDragging,
    startDrag,
    continueDrag,
    endDrag,
    toggleCell,
    applyDiameters,
    quickFill,
    fillTriangleRegion,
    eraseSelected,
    eraseAll,
    toggleCylFormat,
    loadFromFirestore,
    saveToFirestore,
    saving,
    stats,
  };
}
