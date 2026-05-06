import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2, X, XCircle, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
import { consumableBrandService, authService } from '../services/api';
import BrandModal from '../components/BrandModal';
import { SkeletonListRows } from '../components/SkeletonCard';
import useModalFeedback from '../components/useModalFeedback';
import BackButton from '../components/BackButton';

const getBilingualBrandName = (item, currentLang) => {
    const nameAr = item.brand_name_ar;
    const nameEn = item.brand_name_en;
    if (currentLang === 'ar') {
        return nameAr || nameEn || item.brand_name;
    }
    return nameEn || nameAr || item.brand_name;
};

const ConsumablesBrandsPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandForm, setBrandForm] = useState({
        brand_name: '',
        brand_code: '',
        is_active: true,
        brand_photo: null
    });
    const [brandPhotoPreview, setBrandPhotoPreview] = useState(null);
    const [formTranslations, setFormTranslations] = useState({});

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('brand_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('');

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await consumableBrandService.getAll();
            setBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('consumableBrands.fetchError', 'Failed to fetch brands') + ': ' + err.message);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    const toBrandCode = (name) => {
        const code = String(name || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_\-]/g, '');
        return code.slice(0, 16);
    };

    const handleFormBrandNameChange = (name, value) => {
        setBrandForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { brand_name: value } }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!authService.isSuperuser()) return;
        const brandName = brandForm.brand_name?.trim();
        if (!brandName) {
            setError(t('consumableBrands.enterBrandName', 'Please enter a brand name'));
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (editingBrand) {
                const payload = {
                    brand_name: brandName,
                    brand_code: brandForm.brand_code || toBrandCode(brandName),
                    is_active: brandForm.is_active,
                };
                const hasTranslations = Object.keys(formTranslations).length > 0;
                if (brandForm.brand_photo && typeof brandForm.brand_photo !== 'string') {
                    const formData = new FormData();
                    Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
                    formData.append('brand_photo', brandForm.brand_photo);
                    if (hasTranslations) formData.append('translations', JSON.stringify(formTranslations));
                    await consumableBrandService.update(editingBrand.consumable_brand_id, formData);
                } else {
                    if (hasTranslations) payload.translations = formTranslations;
                    await consumableBrandService.update(editingBrand.consumable_brand_id, payload);
                }
            } else {
                const formData = new FormData();
                formData.append('brand_name', brandName);
                formData.append('brand_code', toBrandCode(brandName));
                formData.append('is_active', String(brandForm.is_active));
                if (brandForm.brand_photo) {
                    formData.append('brand_photo', brandForm.brand_photo);
                }
                if (Object.keys(formTranslations).length > 0) {
                    formData.append('translations', JSON.stringify(formTranslations));
                }
                await consumableBrandService.create(formData);
            }
            showSuccess(editingBrand ? t('consumableBrands.updateSuccess', 'Brand updated successfully') : t('consumableBrands.createSuccess', 'Brand created successfully'));
            await fetchBrands();
        } catch (err) {
            showError(t('consumableBrands.saveError', 'Failed to save brand') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setBrandForm({
            brand_name: brand.brand_name || '',
            brand_code: brand.brand_code || '',
            is_active: brand.is_active !== false,
            brand_photo: brand.brand_photo || null
        });
        setBrandPhotoPreview(brand.brand_photo || null);
        const trans = {};
        if (brand.brand_name_ar) trans['ar'] = { brand_name: brand.brand_name_ar };
        if (brand.brand_name_en) trans['en'] = { brand_name: brand.brand_name_en };
        setFormTranslations(trans);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('consumableBrands.confirmDelete', 'Delete this brand?'))) return;
        try {
            await consumableBrandService.delete(id);
            await fetchBrands();
        } catch (err) {
            setError(t('consumableBrands.deleteError', 'Failed to delete brand') + ': ' + err.message);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingBrand(null);
        setBrandForm({ brand_name: '', brand_code: '', is_active: true, brand_photo: null });
        setBrandPhotoPreview(null);
        setFormTranslations({});
    };

    const filteredBrands = useMemo(() => {
        let result = [...brands];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b =>
                getBilingualBrandName(b, i18n.language)?.toLowerCase().includes(term) ||
                b.brand_code?.toLowerCase().includes(term)
            );
        }
        if (statusFilter === 'active') {
            result = result.filter(b => b.is_active !== false);
        } else if (statusFilter === 'inactive') {
            result = result.filter(b => b.is_active === false);
        }
        result.sort((a, b) => {
            let aVal, bVal;
            switch (sortField) {
                case 'brand_code':
                    aVal = a.brand_code || '';
                    bVal = b.brand_code || '';
                    break;
                default:
                    aVal = getBilingualBrandName(a, i18n.language) || '';
                    bVal = getBilingualBrandName(b, i18n.language) || '';
            }
            const cmp = aVal.localeCompare(bVal);
            return sortDirection === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [brands, searchTerm, statusFilter, sortField, sortDirection]);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <BackButton onClick={() => navigate(-1)} />
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Tag size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('consumableBrands.title', 'Consumable Brands')}</h1>
                        <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('consumableBrands.subtitle', 'Manage consumable brands')}
                        </p>
                    </div>
                </div>
                {authService.isSuperuser() && (
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: 'var(--space-3) var(--space-6)', width: 'fit-content' }}>
                        <Plus size={18} />
                        <span>{t('consumableBrands.addBrand', 'Add Brand')}</span>
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Add/Edit Brand Modal */}
            <BrandModal
                isOpen={showForm}
                onClose={resetForm}
                onSave={handleSubmit}
                editingBrand={editingBrand}
                brandForm={brandForm}
                brandPhotoPreview={brandPhotoPreview}
                formTranslations={formTranslations}
                onFormChange={setBrandForm}
                onBrandNameChange={handleFormBrandNameChange}
                onTranslationChange={handleFormTranslationChange}
                onPhotoChange={(file, preview) => {
                    setBrandForm((prev) => ({ ...prev, brand_photo: file }));
                    setBrandPhotoPreview(preview);
                }}
                saving={saving}
                i18nKeyPrefix="consumableBrands"
                feedbackType={feedbackType}
                feedbackMessage={feedbackMessage}
                onClearFeedback={clearFeedback}
            />

            {/* Brands List Card */}
            <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {/* Card Header */}
                <div className="card-header" style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    background: 'var(--color-bg-secondary)'
                }}>
                    <Tag size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                        {t('consumableBrands.title', 'Consumable Brands')}
                    </h2>
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-bg-card)',
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        {filteredBrands.length} {t('common.total', 'total')}
                    </span>
                </div>

                {/* Count badge */}
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: '600' }}>{filteredBrands.length} {t('common.total', 'total')}</span>
                </div>

                {/* Brand List */}
                <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-12)' }}>
                            <SkeletonListRows count={8} />
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                            <Tag size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                {searchTerm || statusFilter ? t('consumableBrands.noMatchingBrands', 'No matching brands') : t('consumableBrands.noBrands', 'No brands yet')}
                            </p>
                        </div>
                    ) : (
                        filteredBrands.map(brand => (
                            <div
                                key={brand.consumable_brand_id}
                                style={{
                                    padding: 'var(--space-4) var(--space-5)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--color-border)',
                                    transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-accent-glow)', border: '1px solid var(--color-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0
                                    }}>
                                        {brand.brand_photo ? (
                                            <img src={brand.brand_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-accent-tertiary)' }}>
                                                {(getBilingualBrandName(brand, i18n.language) || '?')[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getBilingualBrandName(brand, i18n.language)}
                                            </span>
                                            {brand.brand_code && (
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace', background: 'var(--color-bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-sm)' }}>
                                                    {brand.brand_code}
                                                </span>
                                            )}
                                            {brand.is_active === false && (
                                                <span style={{ fontSize: 'var(--font-size-xs)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1px 6px', borderRadius: 'var(--radius-sm)' }}>
                                                    {t('consumableBrands.inactive', 'Inactive')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {authService.isSuperuser() && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
                                        <button onClick={() => handleEdit(brand)} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('common.edit')}>
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(brand.consumable_brand_id)} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('common.delete')}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <FilterSortFAB hasActiveFilters={!!searchTerm || !!statusFilter || sortField !== 'brand_name' || sortDirection !== 'asc'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input type="text" placeholder={t('consumableBrands.searchPlaceholder', 'Search brands...')} className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 'var(--space-10)', height: '40px', background: 'var(--color-bg-card)', width: '100%' }} />
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('consumableBrands.allStatuses', 'All Statuses')}</label>
                        <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('consumableBrands.allStatuses', 'All Statuses')}</option>
                            <option value="active">{t('consumableBrands.active', 'Active')}</option>
                            <option value="inactive">{t('consumableBrands.inactive', 'Inactive')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('common.sortBy', 'Sort by')}</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <select className="form-input" value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ height: '40px', flex: 1 }}>
                                <option value="brand_name">{t('consumableBrands.sortByName', 'Name')}</option>
                                <option value="brand_code">{t('consumableBrands.sortByCode', 'Code')}</option>
                            </select>
                            <button className="btn btn-secondary" onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} style={{ padding: 'var(--space-2)', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={sortDirection === 'asc' ? t('common.ascending', 'Ascending') : t('common.descending', 'Descending')}>
                                {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </FilterSortFAB>
        </div>
    );
};

export default ConsumablesBrandsPage;
