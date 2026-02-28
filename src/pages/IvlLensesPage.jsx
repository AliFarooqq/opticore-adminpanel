import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight, /* Grid3X3, */ Sliders } from 'lucide-react';
import Header from '../components/layout/Header';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import IvlLensForm from '../components/ivlLenses/IvlLensForm';
import RxRangeEditor from '../components/gridEditor/RxRangeEditor';
import { getIvlLenses, deleteIvlLens } from '../services/ivlLensesService';
import { getSupplier } from '../services/suppliersService';
import { getBrands } from '../services/brandsService';
import { useFirestoreCollection, useFirestoreDoc } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { DESIGN_LABELS, MATERIAL_LABELS } from '../constants/lensOptions';

export default function IvlLensesPage() {
  const { supplierId, brandId } = useParams();
  // const navigate = useNavigate(); // used by Stock Grid — hidden from client until ready
  const toast = useToast();

  const { data: supplier } = useFirestoreDoc(() => getSupplier(supplierId), [supplierId]);
  const { data: brands } = useFirestoreCollection(() => getBrands(supplierId), [supplierId]);
  const brand = brands.find(b => b.id === brandId);

  const { data: lenses, loading, reload } = useFirestoreCollection(
    () => getIvlLenses(supplierId, brandId),
    [supplierId, brandId]
  );

  const [filter, setFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [rxTarget, setRxTarget] = useState(null);

  const filteredLenses = lenses.filter(l => {
    if (filter === 'stock') return l.availability === 'stock';
    if (filter === 'rx') return l.availability === 'rx';
    return true;
  });

  function openAdd() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(lens) {
    setEditTarget(lens);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteIvlLens(supplierId, brandId, deleteTarget.id);
      toast.success(`"${deleteTarget.productName}" deleted`);
      reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete lens');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: 'productName', label: 'Product Name' },
    { key: 'design', label: 'Design', render: l => DESIGN_LABELS[l.design] || l.design },
    { key: 'material', label: 'Material', render: l => MATERIAL_LABELS[l.material] || l.material },
    { key: 'refractiveIndex', label: 'Index', render: l => l.refractiveIndex?.toFixed(2) },
    {
      key: 'availability',
      label: 'Availability',
      render: l => (
        <Badge variant={l.availability === 'stock' ? 'green' : 'blue'}>
          {l.availability === 'stock' ? 'Stock' : 'RX'}
        </Badge>
      ),
    },
    {
      key: 'wholesalePrice',
      label: 'Wholesale',
      render: l => l.wholesalePrice != null ? `€${l.wholesalePrice.toFixed(2)}` : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: l => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Stock Grid button — hidden from client until ready
          {l.availability === 'stock' && (
            <Button size="sm" variant="ghost" onClick={() => navigate(`/suppliers/${supplierId}/brands/${brandId}/ivl/${l.id}/grid`)}>
              <Grid3X3 size={14} /> Stock Grid
            </Button>
          )} */}
          {l.availability === 'rx' && (
            <Button size="sm" variant="ghost" onClick={() => setRxTarget(l)}>
              <Sliders size={14} /> RX Range
            </Button>
          )}
          <button
            onClick={() => openEdit(l)}
            style={{ padding: 7, borderRadius: 7, border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(l)}
            style={{ padding: 7, borderRadius: 7, border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title={brand ? `${brand.name} — IVL Lenses` : 'IVL Lenses'} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
        <div className="page-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 40px' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to="/suppliers" style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Suppliers
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <Link to={`/suppliers/${supplierId}/brands`} style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              {supplier?.name || '…'}
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{brand?.name || '…'}</span>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>IVL Lenses</span>
          </nav>

          <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            {/* Filter */}
            <div style={{ display: 'flex', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {['all', 'stock', 'rx'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '8px 18px', fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                    background: filter === f ? '#0f2540' : '#fff',
                    color: filter === f ? '#fff' : '#475569',
                  }}
                >
                  {f === 'all' ? 'All' : f.toUpperCase()}
                </button>
              ))}
            </div>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add IVL Lens
            </Button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto', overflowY: 'hidden' }}>
            <Table
              columns={columns}
              data={filteredLenses}
              loading={loading}
              emptyMessage="No IVL lenses yet. Click Add IVL Lens to get started."
            />
          </div>
        </div>
      </div>

      <IvlLensForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        supplierId={supplierId}
        brandId={brandId}
        lens={editTarget}
        onSaved={reload}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete IVL Lens"
        message={`Are you sure you want to delete "${deleteTarget?.productName}"?`}
      />

      {rxTarget && (
        <RxRangeEditor
          isOpen={!!rxTarget}
          onClose={() => setRxTarget(null)}
          supplierId={supplierId}
          brandId={brandId}
          lens={rxTarget}
          onSaved={reload}
        />
      )}
    </>
  );
}
