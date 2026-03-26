import { useState, Fragment, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight, ChevronDown /* Grid3X3 */ } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import IvlLensForm from '../components/ivlLenses/IvlLensForm';
import SearchInput from '../components/ui/SearchInput';
import FilterSelect from '../components/ui/FilterSelect';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIvlLenses, deleteIvlLens } from '../services/ivlLensesService';
import { getIvlSupplier } from '../services/ivlSuppliersService';
import { getBrands } from '../services/brandsService';
import { queryKeys } from '../lib/queryKeys';
import { useToast } from '../hooks/useToast';
import {
  DESIGNS, DESIGN_LABELS,
  MATERIALS, MATERIAL_LABELS,
  LENS_TYPES, LENS_TYPE_LABELS,
  REFRACTIVE_INDICES,
  REFRACTIVE_INDICES_BY_MATERIAL,
  GEOMETRIES, GEOMETRY_LABELS,
  CYL_FORMAT_LABELS,
} from '../constants/lensOptions';

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

// ── Variant sub-table styles ──────────────────────────────────────────────────

const VTH = {
  textAlign: 'left', padding: '7px 14px',
  fontSize: 10, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  whiteSpace: 'nowrap', background: '#eef2f7',
  borderBottom: '1px solid #dde3ee',
};

const VTD = {
  padding: '8px 14px', color: '#374151', fontSize: 12,
  verticalAlign: 'middle', whiteSpace: 'nowrap',
  borderBottom: '1px solid #e8ecf2',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IvlLensesPage() {
  const { supplierId, brandId } = useParams();
  // const navigate = useNavigate(); // used by Stock Grid — hidden from client until ready
  const toast = useToast();
  const queryClient = useQueryClient();

  const lensesKey = queryKeys.ivlLenses(supplierId, brandId);

  const { data: supplier } = useQuery({ queryKey: queryKeys.ivlSupplier(supplierId), queryFn: () => getIvlSupplier(supplierId) });
  const { data: brands = [] } = useQuery({ queryKey: queryKeys.brands(supplierId), queryFn: () => getBrands(supplierId) });
  const brand = brands.find(b => b.id === brandId);

  const { data: lenses = [], isLoading: loading } = useQuery({ queryKey: lensesKey, queryFn: () => getIvlLenses(supplierId, brandId) });

  const [filter, setFilter] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ design: '', material: '', lensType: '', index: '', geometry: '', coating: '', color: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  function clearFilters() {
    setFilters({ design: '', material: '', lensType: '', index: '', geometry: '', coating: '', color: '' });
    setSearchQuery('');
  }

  // Material ↔ Index mutual constraint
  // If material is selected → only show indices allowed for that material
  const availableIndexOptions = useMemo(() => {
    const base = filters.material
      ? (REFRACTIVE_INDICES_BY_MATERIAL[filters.material] || [])
      : REFRACTIVE_INDICES;
    return base.map(v => ({ value: String(v), label: v.toFixed(2) }));
  }, [filters.material]);

  // If index is selected → only show materials that support that index
  const availableMaterialOptions = useMemo(() => {
    const base = filters.index
      ? MATERIALS.filter(m =>
          (REFRACTIVE_INDICES_BY_MATERIAL[m] || []).map(String).includes(filters.index)
        )
      : MATERIALS;
    return base.map(v => ({ value: v, label: MATERIAL_LABELS[v] }));
  }, [filters.index]);

  function handleMaterialChange(v) {
    const allowed = (REFRACTIVE_INDICES_BY_MATERIAL[v] || []).map(String);
    setFilters(p => ({
      ...p,
      material: v,
      // clear index if it's no longer valid for the new material
      index: v && p.index && !allowed.includes(p.index) ? '' : p.index,
    }));
  }

  function handleIndexChange(v) {
    const supporting = MATERIALS.filter(m =>
      (REFRACTIVE_INDICES_BY_MATERIAL[m] || []).map(String).includes(v)
    );
    setFilters(p => ({
      ...p,
      index: v,
      // clear material if it doesn't offer the new index
      material: v && p.material && !supporting.includes(p.material) ? '' : p.material,
    }));
  }

  // Derive coating/color options from actual data (brand-specific)
  const coatingOptions = useMemo(() =>
    [...new Set(lenses.map(l => l.coating).filter(Boolean))].map(v => ({ value: v, label: v })),
    [lenses]
  );
  const colorOptions = useMemo(() =>
    [...new Set(lenses.map(l => l.color).filter(Boolean))].map(v => ({ value: v, label: v })),
    [lenses]
  );

  // Step 1: Stock/RX toggle filter
  const availabilityFiltered = lenses.filter(l => {
    if (filter === 'stock') return l.availability === 'stock';
    if (filter === 'rx') return l.availability === 'rx';
    return true;
  });

  // Step 2: Search + attribute filters
  const filteredLenses = availabilityFiltered.filter(l => {
    if (searchQuery && !l.productName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.design && l.design !== filters.design) return false;
    if (filters.material && l.material !== filters.material) return false;
    if (filters.lensType && !l.lensTypes?.includes(filters.lensType)) return false;
    if (filters.index && String(l.refractiveIndex) !== filters.index) return false;
    if (filters.geometry && l.geometry !== filters.geometry) return false;
    if (filters.coating && l.coating !== filters.coating) return false;
    if (filters.color && l.color !== filters.color) return false;
    return true;
  });

  const hasActiveSearch = searchQuery || activeFilterCount > 0;

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
      queryClient.invalidateQueries({ queryKey: lensesKey });
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
          <div style={{ marginBottom: 16 }}>
            {/* Row 1: toggle + search + add */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {['stock', 'rx'].map(f => (
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
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search lenses…"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus size={16} /> Add IVL Lens
              </Button>
            </div>

            {/* Row 2: attribute filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <FilterSelect
                value={filters.design}
                onChange={v => setFilters(p => ({ ...p, design: v }))}
                placeholder="Design"
                options={DESIGNS.map(v => ({ value: v, label: DESIGN_LABELS[v] }))}
              />
              <FilterSelect
                value={filters.material}
                onChange={handleMaterialChange}
                placeholder="Material"
                options={availableMaterialOptions}
              />
              <FilterSelect
                value={filters.lensType}
                onChange={v => setFilters(p => ({ ...p, lensType: v }))}
                placeholder="Lens Type"
                options={LENS_TYPES.map(v => ({ value: v, label: LENS_TYPE_LABELS[v] }))}
              />
              <FilterSelect
                value={filters.index}
                onChange={handleIndexChange}
                placeholder="Index"
                options={availableIndexOptions}
              />
              <FilterSelect
                value={filters.geometry}
                onChange={v => setFilters(p => ({ ...p, geometry: v }))}
                placeholder="Geometry"
                options={GEOMETRIES.map(v => ({ value: v, label: GEOMETRY_LABELS[v] }))}
              />
              {coatingOptions.length > 0 && (
                <FilterSelect
                  value={filters.coating}
                  onChange={v => setFilters(p => ({ ...p, coating: v }))}
                  placeholder="Coating"
                  options={coatingOptions}
                />
              )}
              {colorOptions.length > 0 && (
                <FilterSelect
                  value={filters.color}
                  onChange={v => setFilters(p => ({ ...p, color: v }))}
                  placeholder="Color"
                  options={colorOptions}
                />
              )}
              {hasActiveSearch && (
                <button
                  onClick={clearFilters}
                  style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}
                >
                  Clear all
                </button>
              )}
              {hasActiveSearch && (
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 2 }}>
                  {filteredLenses.length} of {availabilityFiltered.length} result{filteredLenses.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            {loading ? (
              <Spinner />
            ) : filteredLenses.length === 0 ? (
              <EmptyState title={
                hasActiveSearch  ? 'No lenses match your search or filters.' :
                filter === 'stock' ? 'No Stock lenses yet. Click Add IVL Lens to get started.' :
                                     'No RX lenses yet. Click Add IVL Lens to get started.'
              } />
            ) : (
              <table style={{ width: '100%', minWidth: 1380, borderCollapse: 'collapse', fontSize: 13 }}>
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
                    {filter === 'stock' && <th style={TH}>Wholesale</th>}
                    {filter === 'stock' && <th style={TH}>Retail</th>}
                    <th style={TH}>Availability</th>
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
                          <td style={TD}>
                            {l.coating ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                {l.coating}
                                {(brand?.coatings || []).find(c => c.name === l.coating)?.hasBlueProtection && (
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 7px',
                                    borderRadius: 20, background: '#dbeafe', color: '#1d4ed8',
                                    whiteSpace: 'nowrap',
                                  }}>Blue Block</span>
                                )}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={TD}>{l.color || '—'}</td>
                          {filter === 'stock' && (
                            <td style={TD}>{l.wholesalePrice != null ? `€${parseFloat(l.wholesalePrice).toFixed(2)}` : '—'}</td>
                          )}
                          {filter === 'stock' && (
                            <td style={TD}>{l.retailPrice != null ? `€${parseFloat(l.retailPrice).toFixed(2)}` : '—'}</td>
                          )}
                          <td style={TD}>
                            <Badge variant={isRx ? 'blue' : 'green'}>{isRx ? 'RX' : 'Stock'}</Badge>
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

                        {/* Variant sub-table — RX expanded */}
                        {isRx && expanded && (
                          <tr key={`${l.id}-variants`}>
                            {/* Indent */}
                            <td style={{ borderLeft: '3px solid #dde3ee', borderBottom: '1px solid #f1f5f9' }} />
                            {/* Sub-table spanning remaining columns */}
                            <td colSpan={filter === 'stock' ? 12 : 10} style={{ padding: '0 0 12px 0', borderBottom: '1px solid #f1f5f9' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr>
                                    <th style={VTH}>Variant</th>
                                    <th style={VTH}>Diameter</th>
                                    <th style={VTH}>SPH</th>
                                    <th style={VTH}>CYL</th>
                                    <th style={VTH}>CYL Format</th>
                                    <th style={VTH}>Wholesale</th>
                                    <th style={VTH}>Retail</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(l.variants || []).map((v, vi) => (
                                    <tr key={v.id || vi}>
                                      <td style={VTD}>{vi + 1}</td>
                                      <td style={VTD}>{formatDiameter(v.diameter)}</td>
                                      <td style={VTD}>{formatRange(v.sphMin, v.sphMax)}</td>
                                      <td style={VTD}>{formatRange(v.cylMin, v.cylMax)}</td>
                                      <td style={VTD}>{CYL_FORMAT_LABELS[v.cylFormat] || v.cylFormat || '—'}</td>
                                      <td style={VTD}>{v.wholesalePrice != null ? `€${parseFloat(v.wholesalePrice).toFixed(2)}` : '—'}</td>
                                      <td style={VTD}>{v.retailPrice != null ? `€${parseFloat(v.retailPrice).toFixed(2)}` : '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
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
        onSaved={() => queryClient.invalidateQueries({ queryKey: lensesKey })}
        activeTab={filter}
        brandCoatings={(brand?.coatings || []).map(c => typeof c === 'string' ? { name: c, hasBlueProtection: false } : c)}
        brandTintTypes={brand?.tintTypes || []}
        brandTintColors={brand?.tintColors || {}}
        brandMirror={brand?.mirror || []}
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
