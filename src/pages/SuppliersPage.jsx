import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ChevronRight, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SupplierForm from '../components/suppliers/SupplierForm';
import { getIvlSuppliers, deleteIvlSupplier } from '../services/ivlSuppliersService';
import { getContactSuppliers, deleteContactSupplier } from '../services/contactSuppliersService';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';

export default function SuppliersPage({ supplierType }) {
  const toast = useToast();
  const navigate = useNavigate();

  const isIvl = supplierType === 'ivl';
  const basePath = isIvl ? '/ivl-suppliers' : '/contact-suppliers';
  const pageTitle = isIvl ? 'IVL Suppliers' : 'Contact Suppliers';
  const getFn = isIvl ? getIvlSuppliers : getContactSuppliers;
  const deleteFn = isIvl ? deleteIvlSupplier : deleteContactSupplier;

  const { data: suppliers, loading, reload } = useFirestoreCollection(getFn, [supplierType]);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(supplier) {
    setEditTarget(supplier);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFn(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete supplier');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      render: s =>
        s.logoUrl ? (
          <img
            src={s.logoUrl}
            alt={s.name}
            style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'contain', border: '1px solid #e2e8f0', background: '#f8fafc' }}
          />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12, fontWeight: 700 }}>
            {s.name?.[0]?.toUpperCase() || '?'}
          </div>
        ),
    },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'actions',
      label: 'Actions',
      render: s => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => navigate(`${basePath}/${s.id}/brands`)}>
            View Brands <ChevronRight size={14} />
          </Button>
          <button
            onClick={() => openEdit(s)}
            style={{ padding: 7, borderRadius: 7, border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
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
      <Header title={pageTitle} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
        <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 40px' }}>
          <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} total</p>
            </div>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Supplier
            </Button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto', overflowY: 'hidden' }}>
            <Table
              columns={columns}
              data={suppliers}
              loading={loading}
              emptyMessage="No suppliers yet. Click Add Supplier to get started."
            />
          </div>
        </div>
      </div>

      <SupplierForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        supplier={editTarget}
        onSaved={reload}
        supplierType={supplierType}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all brands and lenses under this supplier.`}
      />
    </>
  );
}
