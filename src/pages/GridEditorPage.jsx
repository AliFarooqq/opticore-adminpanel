import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, ChevronRight } from 'lucide-react';
import GridEditor from '../components/gridEditor/GridEditor';
import GridToolbar from '../components/gridEditor/GridToolbar';
import DiameterPanel from '../components/gridEditor/DiameterPanel';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/Toast';
import { useGridEditor } from '../hooks/useGridEditor';
import { useToast } from '../hooks/useToast';
import { getSupplier } from '../services/suppliersService';
import { getBrands } from '../services/brandsService';
import { getIvlLens } from '../services/ivlLensesService';

export default function GridEditorPage() {
  const { supplierId, brandId, lensId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [pageLoading, setPageLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [brand, setBrand] = useState(null);
  const [lens, setLens] = useState(null);
  const [eraseAllOpen, setEraseAllOpen] = useState(false);

  const {
    cells,
    cylFormat,
    activeMode,
    setActiveMode,
    selectedCells,
    isDragging,
    startDrag,
    continueDrag,
    endDrag,
    applyDiameters,
    quickFill,
    fillTriangleRegion,
    eraseAll,
    toggleCylFormat,
    loadFromFirestore,
    saveToFirestore,
    saving,
    stats,
  } = useGridEditor();

  useEffect(() => {
    async function init() {
      setPageLoading(true);
      try {
        const [sup, brandsArr, l] = await Promise.all([
          getSupplier(supplierId),
          getBrands(supplierId),
          getIvlLens(supplierId, brandId, lensId),
        ]);
        setSupplier(sup);
        setBrand(brandsArr.find(b => b.id === brandId) || null);
        setLens(l);
        await loadFromFirestore(supplierId, brandId, lensId);
      } catch (err) {
        toast.error(err.message || 'Failed to load grid');
      } finally {
        setPageLoading(false);
      }
    }
    init();
  }, [supplierId, brandId, lensId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    try {
      await saveToFirestore(supplierId, brandId, lensId);
      toast.success('Grid saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save grid');
    }
  }

  if (pageLoading) return <Spinner full />;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Header bar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button — uses navigate(-1) to go BACK in history, not push a new entry */}
          <button
            onClick={() => navigate(-1)}
            style={{ padding: 7, borderRadius: 7, border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Breadcrumb — use replace:true so grid is removed from history stack, not stacked on top */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
            <button
              onClick={() => navigate('/suppliers', { replace: true })}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#64748b', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              Suppliers
            </button>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <button
              onClick={() => navigate(`/suppliers/${supplierId}/brands`, { replace: true })}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#64748b', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              {supplier?.name || '…'}
            </button>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <button
              onClick={() => navigate(`/suppliers/${supplierId}/brands/${brandId}/ivl`, { replace: true })}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#64748b', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              {brand?.name || '…'}
            </button>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>
              {lens?.productName || 'Grid Editor'}
            </span>
          </nav>
        </div>

        <Button onClick={handleSave} loading={saving}>
          <Save size={16} /> Save Grid
        </Button>
      </div>

      {/* Three-panel body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Toolbar */}
        <GridToolbar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          cylFormat={cylFormat}
          onToggleCylFormat={toggleCylFormat}
          onQuickFill={quickFill}
          onFillTriangle={fillTriangleRegion}
          onEraseAll={() => setEraseAllOpen(true)}
          selectedDiameters={[]}
        />

        {/* Center: Grid */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <GridEditor
            cells={cells}
            cylFormat={cylFormat}
            selectedCells={selectedCells}
            isDragging={isDragging}
            onStartDrag={startDrag}
            onContinueDrag={continueDrag}
            onEndDrag={endDrag}
          />
        </div>

        {/* Right: Diameter Panel */}
        <DiameterPanel
          selectedCells={selectedCells}
          cells={cells}
          onApply={applyDiameters}
          stats={stats}
        />
      </div>

      <ConfirmDialog
        isOpen={eraseAllOpen}
        onClose={() => setEraseAllOpen(false)}
        onConfirm={() => {
          eraseAll();
          setEraseAllOpen(false);
        }}
        title="Erase All Cells"
        message="Are you sure you want to clear the entire grid? This action cannot be undone."
        confirmLabel="Erase All"
      />

      <ToastContainer />
    </div>
  );
}
