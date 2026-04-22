import { useEffect, useMemo, useState, useCallback } from 'react';
import { positionRoleMappingService, positionService, roleService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown, Plus, X, XCircle, ChevronDown, Link2, Briefcase, Shield, Trash2 } from 'lucide-react';

const getBilingualPositionLabel = (item, currentLang) => {
    const labelAr = item.position_label_ar;
    const labelEn = item.position_label_en;
    if (currentLang === 'ar') {
        if (labelAr && labelEn && labelAr !== labelEn) return `${labelAr} (${labelEn})`;
        return labelAr || labelEn || item.position_label;
    } else {
        if (labelEn && labelAr && labelEn !== labelAr) return `${labelEn} (${labelAr})`;
        return labelEn || labelAr || item.position_label;
    }
};

const getBilingualRoleLabel = (item, currentLang) => {
    const labelAr = item.role_label_ar;
    const labelEn = item.role_label_en;
    if (currentLang === 'ar') {
        if (labelAr && labelEn && labelAr !== labelEn) return `${labelAr} (${labelEn})`;
        return labelAr || labelEn || item.role_label;
    } else {
        if (labelEn && labelAr && labelEn !== labelAr) return `${labelEn} (${labelAr})`;
        return labelEn || labelAr || item.role_label;
    }
};

const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', fontFamily: 'inherit', outline: 'none', transition: 'all 0.2s ease'
};
const labelStyle = {
    display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600',
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px'
};
const focusBorder = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; };
const blurBorder = (e) => { e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)'; e.target.style.boxShadow = 'none'; };

const PositionRoleMappingsPage = () => {
    const { t, i18n } = useTranslation();
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [form, setForm] = useState({ position: '', role: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [sortField, setSortField] = useState('position');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [positionsData, rolesData, mappingsData] = await Promise.all([
                positionService.getAll(),
                roleService.getAll(),
                positionRoleMappingService.getAll(),
            ]);
            setPositions(Array.isArray(positionsData) ? positionsData : []);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setMappings(Array.isArray(mappingsData) ? mappingsData : []);
        } catch (err) {
            setError(err?.response?.data?.error || err.message || t('positionRoleMappings.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    useEffect(() => {
        if (!showSortMenu) return;
        const handler = () => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') handleCloseModal(); };
            document.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleEsc);
            };
        }
        return () => { document.body.style.overflow = ''; };
    }, [isModalOpen]);

    const filteredMappings = useMemo(() => {
        let result = [...mappings];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((m) => {
                const haystack = [
                    String(m.position_label ?? ''),
                    String(m.position_label_ar ?? ''),
                    String(m.position_label_en ?? ''),
                    String(m.position_code ?? ''),
                    String(m.position ?? ''),
                    String(m.role_label ?? ''),
                    String(m.role_label_ar ?? ''),
                    String(m.role_label_en ?? ''),
                    String(m.role_code ?? ''),
                    String(m.role ?? ''),
                ].join(' ').toLowerCase();
                return haystack.includes(q);
            });
        }

        if (filterPosition) {
            result = result.filter((m) => String(m.position) === String(filterPosition));
        }

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'position') {
                const aVal = getBilingualPositionLabel(a, i18n.language).toLowerCase();
                const bVal = getBilingualPositionLabel(b, i18n.language).toLowerCase();
                cmp = aVal.localeCompare(bVal, i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'role') {
                const aVal = getBilingualRoleLabel(a, i18n.language).toLowerCase();
                const bVal = getBilingualRoleLabel(b, i18n.language).toLowerCase();
                cmp = aVal.localeCompare(bVal, i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'roleCode') {
                const aVal = String(a.role_code || '').toLowerCase();
                const bVal = String(b.role_code || '').toLowerCase();
                cmp = aVal.localeCompare(bVal);
            } else if (sortField === 'created') {
                cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [mappings, searchQuery, filterPosition, sortField, sortDirection, i18n.language]);

    const mappedPositionIds = useMemo(() => {
        return new Set((mappings || []).map((m) => Number(m.position)));
    }, [mappings]);

    const availablePositions = useMemo(() => {
        return (positions || []).filter((p) => !mappedPositionIds.has(Number(p.position_id)));
    }, [positions, mappedPositionIds]);

    const positionsWithMappings = useMemo(() => {
        const ids = new Set(mappings.map((m) => String(m.position)));
        return positions.filter((p) => ids.has(String(p.position_id)));
    }, [positions, mappings]);

    const hasActiveFilters = searchQuery.trim() || filterPosition;

    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterPosition('');
        setSortField('position');
        setSortDirection('asc');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.position || !form.role) return;
        setSaving(true);
        setError(null);
        try {
            await positionRoleMappingService.create({
                position: Number(form.position),
                role: Number(form.role),
            });
            setForm({ position: '', role: '' });
            setIsModalOpen(false);
            setSuccessMessage(t('positionRoleMappings.createSuccess'));
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || t('positionRoleMappings.createError'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (positionId, roleId) => {
        if (!window.confirm(t('positionRoleMappings.confirmDelete'))) return;
        setError(null);
        try {
            await positionRoleMappingService.delete(positionId, roleId);
            setSuccessMessage(t('positionRoleMappings.deleteSuccess'));
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || t('positionRoleMappings.deleteError'));
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setForm({ position: '', role: '' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <div style={{
                            width: '44px', height: '44px', background: 'var(--gradient-primary)',
                            borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-glow)'
                        }}>
                            <Link2 size={22} />
                        </div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 0 }}>
                            {t('positionRoleMappings.title')}
                        </h1>
                    </div>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', marginLeft: '57px' }}>
                        {t('positionRoleMappings.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => { setForm({ position: '', role: '' }); setIsModalOpen(true); }}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-5)', whiteSpace: 'nowrap' }}
                >
                    <Plus size={18} />
                    <span>{t('positionRoleMappings.addLink')}</span>
                </button>
            </div>

            {/* Error / Success Messages */}
            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}
            {successMessage && (
                <div className="success-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Search / Filter / Sort Toolbar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                {/* Search */}
                <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('positionRoleMappings.searchPlaceholder')}
                        className="form-input"
                        style={{ width: '100%', height: '42px', paddingLeft: 'var(--space-10)', paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)' }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filter by Position */}
                <div style={{ position: 'relative', minWidth: '140px', flex: '0 1 auto', maxWidth: '220px' }}>
                    <SlidersHorizontal size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                    <select
                        value={filterPosition}
                        onChange={(e) => setFilterPosition(e.target.value)}
                        className="form-input"
                        style={{ width: '100%', height: '42px', paddingLeft: 'var(--space-10)', appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">{t('positionRoleMappings.allPositions')}</option>
                        {positionsWithMappings.map((p) => (
                            <option key={p.position_id} value={p.position_id}>
                                {getBilingualPositionLabel(p, i18n.language)} ({p.position_code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }}
                        className="btn"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-4)', height: '42px',
                            border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                            color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)',
                            cursor: 'pointer', fontWeight: '500', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap'
                        }}
                    >
                        <ArrowUpDown size={16} />
                        <span>{sortField === 'position' ? t('positionRoleMappings.sortByPosition') : sortField === 'role' ? t('positionRoleMappings.sortByRole') : sortField === 'roleCode' ? t('positionRoleMappings.sortByRoleCode') : t('positionRoleMappings.sortByCreated')}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                        <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showSortMenu && (
                        <div onClick={(e) => e.stopPropagation()} style={{
                            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                            padding: 'var(--space-2)', zIndex: 100, minWidth: '220px'
                        }}>
                            <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t('common.sortBy')}
                            </div>
                            {[
                                { field: 'position', dir: 'asc', label: `${t('positionRoleMappings.sortByPosition')} — ${t('positionRoleMappings.ascending')}` },
                                { field: 'position', dir: 'desc', label: `${t('positionRoleMappings.sortByPosition')} — ${t('positionRoleMappings.descending')}` },
                                { field: 'role', dir: 'asc', label: `${t('positionRoleMappings.sortByRole')} — ${t('positionRoleMappings.ascending')}` },
                                { field: 'role', dir: 'desc', label: `${t('positionRoleMappings.sortByRole')} — ${t('positionRoleMappings.descending')}` },
                                { field: 'roleCode', dir: 'asc', label: `${t('positionRoleMappings.sortByRoleCode')} — ${t('positionRoleMappings.ascending')}` },
                                { field: 'roleCode', dir: 'desc', label: `${t('positionRoleMappings.sortByRoleCode')} — ${t('positionRoleMappings.descending')}` },
                                { field: 'created', dir: 'desc', label: `${t('positionRoleMappings.sortByCreated')} — ${t('positionRoleMappings.descending')}` },
                                { field: 'created', dir: 'asc', label: `${t('positionRoleMappings.sortByCreated')} — ${t('positionRoleMappings.ascending')}` },
                            ].map(opt => (
                                <button
                                    key={`${opt.field}-${opt.dir}`}
                                    onClick={() => { setSortField(opt.field); setSortDirection(opt.dir); setShowSortMenu(false); }}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'left',
                                        padding: 'var(--space-2) var(--space-3)', border: 'none',
                                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: sortField === opt.field && sortDirection === opt.dir ? '600' : '400',
                                        color: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)',
                                        background: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-glow)' : 'transparent',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!(sortField === opt.field && sortDirection === opt.dir)) {
                                            e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!(sortField === opt.field && sortDirection === opt.dir)) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="btn"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-4)', height: '42px',
                            border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--color-error)', borderRadius: 'var(--radius-md)',
                            cursor: 'pointer', fontWeight: '500', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap'
                        }}
                    >
                        <X size={14} />
                        {t('common.clearFilters')}
                    </button>
                )}
            </div>

            {/* Results count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {filteredMappings.length} {t('positionRoleMappings.shown')} {hasActiveFilters ? `• ${t('positionRoleMappings.searchApplied')}` : ''}
                </span>
            </div>

            {/* Mappings Table */}
            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>{t('common.loading')}</p>
                </div>
            ) : filteredMappings.length === 0 ? (
                <div className="empty-state">
                    <h3 className="empty-state-title">{t('common.noResults')}</h3>
                    <p className="empty-state-text">{t('positionRoleMappings.adjustSearch')}</p>
                </div>
            ) : (
                <div style={{
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-card)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr auto auto',
                        gap: 'var(--space-4)',
                        padding: 'var(--space-3) var(--space-5)',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        alignItems: 'center'
                    }}>
                        <span>{t('positionRoleMappings.position')}</span>
                        <span>{t('positionRoleMappings.role')}</span>
                        <span>{t('positionRoleMappings.created')}</span>
                        <span style={{ width: '40px' }}></span>
                    </div>

                    {/* Table Rows */}
                    {filteredMappings.map((m) => {
                        const positionTitle = getBilingualPositionLabel(m, i18n.language) || `#${m.position}`;
                        const positionMeta = m.position_code || `#${m.position}`;
                        const roleTitle = getBilingualRoleLabel(m, i18n.language) || `#${m.role}`;
                        const roleMeta = m.role_code || `#${m.role}`;

                        return (
                            <div
                                key={`${m.position}-${m.role}`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr auto auto',
                                    gap: 'var(--space-4)',
                                    padding: 'var(--space-4) var(--space-5)',
                                    borderBottom: '1px solid var(--color-border)',
                                    alignItems: 'center',
                                    transition: 'background var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                {/* Position */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                                    <div style={{
                                        width: '32px', height: '32px', flexShrink: 0,
                                        background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                                        borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--color-accent-tertiary)'
                                    }}>
                                        <Briefcase size={16} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {positionTitle}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {positionMeta}
                                        </div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                                    <div style={{
                                        width: '32px', height: '32px', flexShrink: 0,
                                        background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)',
                                        borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: '#c4b5fd'
                                    }}>
                                        <Shield size={16} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {roleTitle}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {roleMeta}
                                        </div>
                                    </div>
                                </div>

                                {/* Created Date */}
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                    {formatDate(m.created_at)}
                                </div>

                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={() => handleDelete(m.position, m.role)}
                                    style={{
                                        width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', background: 'rgba(239, 68, 68, 0.08)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-error)', cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                                    title={t('common.delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Link Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal} style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '24px 28px', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                                        <Link2 size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                                            {t('positionRoleMappings.createLink')}
                                        </h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
                                            {t('positionRoleMappings.choosePositionDesc')}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.2s ease', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '28px', background: '#0f172a' }}>
                            <form onSubmit={handleCreate}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>{t('positionRoleMappings.position')} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        value={form.position}
                                        onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                                        required
                                        style={{
                                            ...inputStyle,
                                            cursor: 'pointer', appearance: 'none',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '44px'
                                        }}
                                        onFocus={focusBorder} onBlur={blurBorder}
                                    >
                                        <option value="" style={{ background: '#0f172a' }}>{t('positionRoleMappings.positionPlaceholder')}</option>
                                        {availablePositions.map((p) => (
                                            <option key={p.position_id} value={p.position_id} style={{ background: '#0f172a' }}>
                                                {getBilingualPositionLabel(p, i18n.language)} ({p.position_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}>{t('positionRoleMappings.role')} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                                        required
                                        style={{
                                            ...inputStyle,
                                            cursor: 'pointer', appearance: 'none',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '44px'
                                        }}
                                        onFocus={focusBorder} onBlur={blurBorder}
                                    >
                                        <option value="" style={{ background: '#0f172a' }}>{t('positionRoleMappings.rolePlaceholder')}</option>
                                        {roles.map((r) => (
                                            <option key={r.role_id} value={r.role_id} style={{ background: '#0f172a' }}>
                                                {getBilingualRoleLabel(r, i18n.language)} ({r.role_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={{
                                            flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            border: 'none', borderRadius: '10px', padding: '14px 24px',
                                            color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                            transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                                            opacity: saving ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'; } }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)'; }}
                                    >
                                        {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>{t('common.saving')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><Plus size={18} />{t('common.add')}</span>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        style={{
                                            padding: '14px 24px', background: 'rgba(71, 85, 105, 0.3)',
                                            border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px',
                                            color: '#cbd5e1', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.5)'; e.currentTarget.style.color = '#f1f5f9'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)'; e.currentTarget.style.color = '#cbd5e1'; }}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionRoleMappingsPage;
