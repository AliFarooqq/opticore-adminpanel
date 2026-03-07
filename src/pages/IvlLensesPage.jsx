import { useState, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight, ChevronDown /* Grid3X3 */ } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import IvlLensForm from '../components/ivlLenses/IvlLensForm';
import { getIvlLenses, deleteIvlLens } from '../services/ivlLensesService';
import { getIvlSupplier } from '../services/ivlSuppliersService';
import { getBrands } from '../services/brandsService';
import { useFirestoreCollection, useFirestoreDoc } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { DESIGN_LABELS, MATERIAL_LABELS, LENS_TYPE_LABELS, GEOMETRY_LABELS, CYL_FORMAT_LABELS } from '../constants/lensOptions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDiameter(d) {
  if (!d) return '—';
  if (d.mode === 'single') return d.value ? `${d.value} mm` : '—';
  if (d.mode === 'range') return d.from && d.to ? `${d.from}–${d.to} mm` : '—';
  return '—';
}

function fmtVal(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(v);
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

function formatRange(min, max) {
  const a = fmtVal(min), b = fmtVal(max);
  if (a === null && b === null) return '—';
  return `${a ?? '?'} / ${b ?? '?'}`;
}

// ── Shared cell styles ────────────────────────────────────────────────────────

const TH = {
  textAlign: 'left', padding: '12px 14px',
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  whiteSpace: 'nowrap', background: '#f8fafc',
  borderBottom: '1.5px solid #e2e8f0',
};

const TD = {
  padding: '13px 14px', color: '#374151', fontSize: 13,
  verticalAlign: 'middle', whiteSpace: 'nowrap',
  borderBottom: '1px solid #f1f5f9',
};

// ── Chip component for variant row ────────────────────────────────────────────

function Chip({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', background: '#e2e8f0', borderRadius: 5, padding: '2px 7px' }}>{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IvlLensesPage() {
  const { supplierId, brandId } = useParams();
  // const navigate = useNavigate(); // used by Stock Grid — hidden from client until ready
  const toast = useToast();

  const { data: supplier } = useFirestoreDoc(() => getIvlSupplier(supplierId), [supplierId]);
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
  const [expandedIds, setExpandedIds] = useState(new Set());

  const filteredLenses = lenses.filter(l => {
    if (filter === 'stock') return l.availability === 'stock';
    if (filter === 'rx') return l.availability === 'rx';
    return true;
  });

  function openAdd() { setEditTarget(null); setFormOpen(true); }
  function openEdit(lens) { setEditTarget(lens); setFormOpen(true); }

  function toggleExpand(id) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  return (
    <>
      <Header title={brand ? `${brand.name} — IVL Lenses` : 'IVL Lenses'} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
        <div className="page-content" style={{ maxWidth: 1600, margin: '0 auto', padding: '36px 40px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to="/ivl-suppliers" style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              IVL Suppliers
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <Link to={`/ivl-suppliers/${supplierId}/brands`} style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              {supplier?.name || '…'}
            </Link>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{brand?.name || '…'}</span>
            <ChevronRight size={13} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>IVL Lenses</span>
          </nav>

          {/* Toolbar */}
          <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            {loading ? (
              <Spinner />
            ) : filteredLenses.length === 0 ? (
              <EmptyState title="No IVL lenses yet. Click Add IVL Lens to get started." />
            ) : (
              <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: 36, padding: '12px 8px 12px 16px' }} />
                    <th style={TH}>Product Name</th>
                    <th style={TH}>Design</th>
                    <th style={TH}>Material</th>
                    <th style={TH}>Lens Type</th>
                    <th style={TH}>Index</th>
                    <th style={TH}>Geometry</th>
                    <th style={TH}>Coating</th>
                    <th style={TH}>Color</th>
                    <th style={TH}>Availability</th>
                    <th style={TH}>Wholesale</th>
                    <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLenses.map(l => {
                    const isRx = l.availability === 'rx';
                    const expanded = expandedIds.has(l.id);

                    return (
                      <Fragment key={l.id}>
                        {/* Master row */}
                        <tr
                          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          style={{ transition: 'background 0.1s' }}
                        >
                          {/* Expand toggle */}
                          <td style={{ ...TD, padding: '13px 8px 13px 16px', width: 36 }}>
                            {isRx && (
                              <button
                                onClick={() => toggleExpand(l.id)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#1e3a5f'}
                                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                              >
                                <ChevronDown size={15} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                              </button>
                            )}
                          </td>

                          {/* Product Name + Master badge */}
                          <td style={TD}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{l.productName}</span>
                              {isRx && (
                                <span style={{
                                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                                  padding: '2px 7px', borderRadius: 5,
                                  border: '1.5px solid #1e3a5f', color: '#1e3a5f',
                                  textTransform: 'uppercase',
                                }}>Master</span>
                              )}
                            </div>
                          </td>

                          <td style={TD}>{DESIGN_LABELS[l.design] || l.design || '—'}</td>
                          <td style={TD}>{MATERIAL_LABELS[l.material] || l.material || '—'}</td>
                          <td style={TD}>{LENS_TYPE_LABELS[l.lensTypes?.[0]] || l.lensTypes?.[0] || '—'}</td>
                          <td style={TD}>{l.refractiveIndex?.toFixed(2) ?? '—'}</td>
                          <td style={TD}>{GEOMETRY_LABELS[l.geometry] || l.geometry || '—'}</td>
                          <td style={TD}>{l.coating || '—'}</td>
                          <td style={TD}>{l.color || '—'}</td>
                          <td style={TD}>
                            <Badge variant={isRx ? 'blue' : 'green'}>{isRx ? 'RX' : 'Stock'}</Badge>
                          </td>
                          <td style={TD}>
                            {isRx ? '—' : l.wholesalePrice != null ? `€${l.wholesalePrice.toFixed(2)}` : '—'}
                          </td>

                          {/* Actions */}
                          <td style={{ ...TD, textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                              {/* Stock Grid — hidden until ready
                              {!isRx && (
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/ivl-suppliers/${supplierId}/brands/${brandId}/ivl/${l.id}/grid`)}>
                                  <Grid3X3 size={14} /> Stock Grid
                                </Button>
                              )} */}
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
                          </td>
                        </tr>

                        {/* Variant rows — RX expanded */}
                        {isRx && expanded && (l.variants || []).map((v, vi) => (
                          <tr
                            key={v.id || vi}
                            style={{ background: '#f8fafc', transition: 'background 0.1s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                          >
                            {/* Indent */}
                            <td style={{ ...TD, padding: '10px 8px 10px 20px', borderLeft: '3px solid #dde3ee' }} />

                            {/* Variant data — colSpan 10 */}
                            <td colSpan={10} style={{ ...TD, padding: '10px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 60 }}>
                                  Variant {vi + 1}
                                </span>
                                <Chip label="Ø" value={formatDiameter(v.diameter)} />
                                <Chip label="SPH" value={formatRange(v.sphMin, v.sphMax)} />
                                <Chip label="CYL" value={formatRange(v.cylMin, v.cylMax)} />
                                <Chip label="Fmt" value={CYL_FORMAT_LABELS[v.cylFormat] || v.cylFormat || '—'} />
                                <Chip label="Wholesale" value={v.wholesalePrice != null ? `€${parseFloat(v.wholesalePrice).toFixed(2)}` : '—'} />
                                {v.retailPrice != null && (
                                  <Chip label="Retail" value={`€${parseFloat(v.retailPrice).toFixed(2)}`} />
                                )}
                              </div>
                            </td>

                            {/* Empty actions */}
                            <td style={TD} />
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
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
        activeTab={filter}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete IVL Lens"
        message={`Are you sure you want to delete "${deleteTarget?.productName}"?`}
      />
    </>
  );
}
