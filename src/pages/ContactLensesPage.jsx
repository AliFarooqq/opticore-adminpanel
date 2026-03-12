import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContactLensForm from '../components/contactLenses/ContactLensForm';
import SearchInput from '../components/ui/SearchInput';
import FilterSelect from '../components/ui/FilterSelect';
import { getContactLenses, deleteContactLens } from '../services/contactLensesService';
import { getContactSupplier } from '../services/contactSuppliersService';
import { getBrands } from '../services/brandsService';
import { useFirestoreCollection, useFirestoreDoc } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import {
  LENS_SHAPES, LENS_SHAPE_LABELS,
  VISION_TYPES, VISION_TYPE_LABELS,
  WEARING_TIMES, WEARING_TIME_LABELS,
  PACK_TYPES, PACK_TYPE_LABELS,
} from '../constants/lensOptions';

export default function ContactLensesPage() {
  const { supplierId, brandId } = useParams();
  const toast = useToast();

  const { data: supplier } = useFirestoreDoc(() => getContactSupplier(supplierId), [supplierId]);
  const { data: brands } = useFirestoreCollection(() => getBrands(supplierId), [supplierId]);
  const brand = brands.find(b => b.id === brandId);

  const { data: lenses, loading, reload } = useFirestoreCollection(
    () => getContactLenses(supplierId, brandId),
    [supplierId, brandId]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ visionType: '', lensShape: '', wearingTime: '', packType: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  function clearFilters() {
    setFilters({ visionType: '', lensShape: '', wearingTime: '', packType: '' });
    setSearchQuery('');
  }

  const visibleLenses = lenses.filter(l => {
    if (searchQuery && !l.productName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.visionType && l.visionType !== filters.visionType) return false;
    if (filters.lensShape && l.lensShape !== filters.lensShape) return false;
    if (filters.wearingTime && l.wearingTime !== filters.wearingTime) return false;
    if (filters.packType && l.packType !== filters.packType) return false;
    return true;
  });

  const hasActiveSearch = searchQuery || activeFilterCount > 0;

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
        <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 40px' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to="/contact-suppliers" style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Contact Suppliers
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <Link to={`/contact-suppliers/${supplierId}/brands`} style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              {supplier?.name || '…'}
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{brand?.name || '…'}</span>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Contact Lenses</span>
          </nav>

          <div style={{ marginBottom: 20 }}>
            {/* Row 1: search + count + add */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search lenses…"
                />
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, whiteSpace: 'nowrap' }}>
                  {hasActiveSearch
                    ? `${visibleLenses.length} of ${lenses.length}`
                    : `${lenses.length} lens${lenses.length !== 1 ? 'es' : ''}`}
                </p>
              </div>
              <Button onClick={openAdd}>
                <Plus size={16} /> Add Contact Lens
              </Button>
            </div>

            {/* Row 2: attribute filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <FilterSelect
                value={filters.visionType}
                onChange={v => setFilters(p => ({ ...p, visionType: v }))}
                placeholder="Vision Type"
                options={VISION_TYPES.map(v => ({ value: v, label: VISION_TYPE_LABELS[v] }))}
              />
              <FilterSelect
                value={filters.lensShape}
                onChange={v => setFilters(p => ({ ...p, lensShape: v }))}
                placeholder="Shape"
                options={LENS_SHAPES.map(v => ({ value: v, label: LENS_SHAPE_LABELS[v] }))}
              />
              <FilterSelect
                value={filters.wearingTime}
                onChange={v => setFilters(p => ({ ...p, wearingTime: v }))}
                placeholder="Wearing Time"
                options={WEARING_TIMES.map(v => ({ value: v, label: WEARING_TIME_LABELS[v] }))}
              />
              <FilterSelect
                value={filters.packType}
                onChange={v => setFilters(p => ({ ...p, packType: v }))}
                placeholder="Pack"
                options={PACK_TYPES.map(v => ({ value: v, label: PACK_TYPE_LABELS[v] }))}
              />
              {hasActiveSearch && (
                <button
                  onClick={clearFilters}
                  style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto', overflowY: 'hidden' }}>
            <Table
              columns={columns}
              data={visibleLenses}
              loading={loading}
              emptyMessage={hasActiveSearch ? 'No lenses match your search or filters.' : 'No contact lenses yet.'}
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
