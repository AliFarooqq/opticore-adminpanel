import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContactLensForm from '../components/contactLenses/ContactLensForm';
import { getContactLenses, deleteContactLens } from '../services/contactLensesService';
import { getSupplier } from '../services/suppliersService';
import { getBrands } from '../services/brandsService';
import { useFirestoreCollection, useFirestoreDoc } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { LENS_SHAPE_LABELS, VISION_TYPE_LABELS, WEARING_TIME_LABELS, PACK_TYPE_LABELS } from '../constants/lensOptions';

export default function ContactLensesPage() {
  const { supplierId, brandId } = useParams();
  const toast = useToast();

  const { data: supplier } = useFirestoreDoc(() => getSupplier(supplierId), [supplierId]);
  const { data: brands } = useFirestoreCollection(() => getBrands(supplierId), [supplierId]);
  const brand = brands.find(b => b.id === brandId);

  const { data: lenses, loading, reload } = useFirestoreCollection(
    () => getContactLenses(supplierId, brandId),
    [supplierId, brandId]
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      await deleteContactLens(supplierId, brandId, deleteTarget.id);
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
    { key: 'lensShape', label: 'Shape', render: l => LENS_SHAPE_LABELS[l.lensShape] || l.lensShape },
    { key: 'visionType', label: 'Vision Type', render: l => VISION_TYPE_LABELS[l.visionType] || l.visionType },
    { key: 'wearingTime', label: 'Wearing Time', render: l => WEARING_TIME_LABELS[l.wearingTime] || l.wearingTime },
    { key: 'packType', label: 'Pack', render: l => PACK_TYPE_LABELS[l.packType] || l.packType },
    { key: 'price', label: 'Price', render: l => l.price != null ? `€${l.price.toFixed(2)}` : '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: l => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      <Header title={brand ? `${brand.name} — Contact Lenses` : 'Contact Lenses'} />
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
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Contact Lenses</span>
          </nav>

          <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{lenses.length} lens{lenses.length !== 1 ? 'es' : ''} total</p>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Contact Lens
            </Button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto', overflowY: 'hidden' }}>
            <Table
              columns={columns}
              data={lenses}
              loading={loading}
              emptyMessage="No contact lenses yet."
            />
          </div>
        </div>
      </div>

      <ContactLensForm
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
        title="Delete Contact Lens"
        message={`Are you sure you want to delete "${deleteTarget?.productName}"?`}
      />
    </>
  );
}
