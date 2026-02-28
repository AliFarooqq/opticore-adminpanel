import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BrandForm from '../components/brands/BrandForm';
import { getBrands, deleteBrand } from '../services/brandsService';
import { getSupplier } from '../services/suppliersService';
import { useFirestoreCollection, useFirestoreDoc } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';

export default function BrandsPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: supplier } = useFirestoreDoc(() => getSupplier(supplierId), [supplierId]);
  const { data: brands, loading, reload } = useFirestoreCollection(
    () => getBrands(supplierId),
    [supplierId]
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(brand) {
    setEditTarget(brand);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBrand(supplierId, deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete brand');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: 'name', label: 'Brand Name' },
    {
      key: 'actions',
      label: 'Actions',
      render: b => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/suppliers/${supplierId}/brands/${b.id}/ivl`)}>
            IVL Lenses <ChevronRight size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/suppliers/${supplierId}/brands/${b.id}/contact`)}>
            Contact Lenses <ChevronRight size={14} />
          </Button>
          <button
            onClick={() => openEdit(b)}
            style={{ padding: 7, borderRadius: 7, border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(b)}
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
      <Header title={supplier ? `${supplier.name} — Brands` : 'Brands'} />
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
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{supplier?.name || '…'}</span>
          </nav>

          <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{brands.length} brand{brands.length !== 1 ? 's' : ''} total</p>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Brand
            </Button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto', overflowY: 'hidden' }}>
            <Table
              columns={columns}
              data={brands}
              loading={loading}
              emptyMessage="No brands yet. Click Add Brand to get started."
            />
          </div>
        </div>
      </div>

      <BrandForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        supplierId={supplierId}
        brand={editTarget}
        onSaved={reload}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all lenses under this brand.`}
      />
    </>
  );
}
