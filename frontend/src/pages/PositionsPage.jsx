import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { positionService, positionRoleMappingService, roleService } from '../services/api';
import { Search, ArrowUpDown, Briefcase, Plus, X, Pencil, Trash2, ChevronDown, XCircle, Shield } from 'lucide-react';
import TranslatableInput from '../components/TranslatableInput';
import { SkeletonListRows } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

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

const getBilingualDescription = (item, currentLang) => {
    const descAr = item.description_ar;
    const descEn = item.description_en;
    if (currentLang === 'ar') {
        return descAr || descEn || item.description || '';
    } else {
        return descEn || descAr || item.description || '';
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

// Modal for Add/Edit Position
const PositionFormModal = ({ isOpen, onClose, editingId, formData, handleFormChange, handleSubmit, saving, formTranslations, handleFormTranslationChange, feedbackType, feedbackMessage, clearFeedback }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <ModalPortal>
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: '520px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '24px 28px', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                                {editingId ? <Pencil size={22} /> : <Plus size={22} />}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>{editingId ? t('positions.editPosition') : t('positions.addPosition')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>{editingId ? t('positions.updateDetails') : t('positions.createNew')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.2s ease', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div style={{ padding: '28px', background: 'var(--color-bg-card)' }}>
                    <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <TranslatableInput
                                    label={`${t('positions.positionLabel')} *`}
                                    baseFieldName="position_label"
                                    value={formData.position_label}
                                    onChange={(name, value) => handleFormChange(name, value)}
                                    translations={Object.fromEntries(Object.entries(formTranslations || {}).map(([k, v]) => [k, v.position_label || '']))}
                                    onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { position_label: value })}
                                    placeholder={t('positions.labelPlaceholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('positions.positionCode')} <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" name="position_code" value={formData.position_code} onChange={(e) => handleFormChange('position_code', e.target.value)} required placeholder={t('positions.codePlaceholder')} maxLength="48" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <TranslatableInput
                                label={t('positions.description')}
                                baseFieldName="description"
                                value={formData.description}
                                onChange={(name, value) => handleFormChange(name, value)}
                                translations={Object.fromEntries(Object.entries(formTranslations || {}).map(([k, v]) => [k, v.description || '']))}
                                onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { description: value })}
                                placeholder={t('positions.descPlaceholder')}
                                inputType="text"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: '10px', padding: '14px 24px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)', opacity: saving ? 0.6 : 1 }} onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'; } }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)'; }}>
                                {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>{t('common.saving')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>{editingId ? <Pencil size={18} /> : <Plus size={18} />}{editingId ? t('common.saveChanges') : t('positions.createPosition')}</span>}
                            </button>
                            <button type="button" onClick={onClose} style={{ padding: '14px 24px', background: 'rgba(71, 85, 105, 0.3)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.5)'; e.currentTarget.style.color = '#f1f5f9'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </ModalPortal>
    );
};

const PositionsPage = () => {
    const { t, i18n } = useTranslation();
    const [positions, setPositions] = useState([]);
    const [roleMappings, setRoleMappings] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();
    const [formData, setFormData] = useState({
        position_label: '',
        position_code: '',
        description: '',
    });
    const [formTranslations, setFormTranslations] = useState({});

    // Search, filter, sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('label');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        fetchPositions();
        fetchRoleMappings();
        fetchRoles();
    }, []);

    // Auto-dismiss notifications
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    // Close sort menu on outside click
    useEffect(() => {
        if (!showSortMenu) return;
        const handler = () => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    const fetchPositions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await positionService.getAll();
            setPositions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('positions.fetchError') + ': ' + err.message);
            setPositions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoleMappings = useCallback(async () => {
        try {
            const data = await positionRoleMappingService.getAll();
            setRoleMappings(Array.isArray(data) ? data : []);
        } catch {
            setRoleMappings([]);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const data = await roleService.getAll();
            setRoles(Array.isArray(data) ? data : []);
        } catch {
            setRoles([]);
        }
    }, []);

    const getRoleNamesForPosition = useCallback((positionId) => {
        const mappingEntries = roleMappings.filter(m => String(m.position) === String(positionId));
        return mappingEntries.map(m => {
            const role = roles.find(r => String(r.role_id) === String(m.role));
            return role ? role.role_name : null;
        }).filter(Boolean);
    }, [roleMappings, roles]);

    const getRoleCountForPosition = useCallback((positionId) => {
        return roleMappings.filter(m => String(m.position) === String(positionId)).length;
    }, [roleMappings]);

    const handleFormChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFormTranslationChange = useCallback((langCode, value) => {
        setFormTranslations(prev => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const payload = { ...formData };
            if (Object.keys(formTranslations).length > 0) {
                payload.translations = formTranslations;
            }
            if (editingId) {
                await positionService.update(editingId, payload);
                setSuccessMessage(t('messages.updateSuccess'));
                showSuccess(t('messages.updateSuccess'));
            } else {
                await positionService.create(payload);
                setSuccessMessage(t('messages.createSuccess'));
                showSuccess(t('messages.createSuccess'));
            }
            setFormData({ position_label: '', position_code: '', description: '' });
            setFormTranslations({});
            setEditingId(null);
            setShowFormModal(false);
            await fetchPositions();
        } catch (err) {
            setError(t('positions.saveError') + ': ' + (err.response?.data?.error || err.message));
            showError(t('positions.saveError') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    }, [editingId, formData, fetchPositions]);

    const handleEdit = useCallback((position) => {
        setFormData({
            position_label: position.position_label,
            position_code: position.position_code,
            description: position.description || '',
        });
        setEditingId(position.position_id);
        setShowFormModal(true);
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm(t('positions.confirmDelete'))) {
            try {
                await positionService.delete(id);
                setSuccessMessage(t('messages.deleteSuccess'));
                await fetchPositions();
                await fetchRoleMappings();
            } catch (err) {
                setError(t('positions.deleteError') + ': ' + err.message);
            }
        }
    }, [fetchPositions, fetchRoleMappings]);

    const handleOpenModal = useCallback(() => {
        setFormData({ position_label: '', position_code: '', description: '' });
        setFormTranslations({});
        setEditingId(null);
        setShowFormModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowFormModal(false);
        setFormData({ position_label: '', position_code: '', description: '' });
        setFormTranslations({});
        setEditingId(null);
    }, []);

    // Filtered & sorted positions
    const filteredPositions = useMemo(() => {
        let result = [...positions];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                getBilingualPositionLabel(p, i18n.language).toLowerCase().includes(q) ||
                p.position_code.toLowerCase().includes(q) ||
                getBilingualDescription(p, i18n.language).toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'label') {
                cmp = getBilingualPositionLabel(a, i18n.language).toLowerCase().localeCompare(getBilingualPositionLabel(b, i18n.language).toLowerCase(), i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'code') {
                cmp = a.position_code.toLowerCase().localeCompare(b.position_code.toLowerCase());
            } else if (sortField === 'roles') {
                cmp = getRoleCountForPosition(a.position_id) - getRoleCountForPosition(b.position_id);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [positions, searchQuery, sortField, sortDirection, getRoleCountForPosition, i18n.language]);

    const hasActiveFilters = searchQuery.trim();
    const clearAllFilters = () => { setSearchQuery(''); setSortField('label'); setSortDirection('asc'); };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Briefcase size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.positions')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('positions.subtitle')}
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-5)', whiteSpace: 'nowrap', width: 'auto' }}
                >
                    <Plus size={18} />
                    <span>{t('positions.addPosition')}</span>
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

            {/* Search / Sort Toolbar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('positions.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '42px', paddingLeft: 'var(--space-10)', paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)' }} />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                    )}
                </div>
                <div style={{ position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', height: '42px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                        <ArrowUpDown size={16} />
                        <span>{sortField === 'label' ? t('positions.sortByLabel') : sortField === 'code' ? t('positions.sortByCode') : t('positions.sortByRoles')}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showSortMenu && (
                        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-2)', zIndex: 100, minWidth: '200px' }}>
                            <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('common.sortBy')}</div>
                            {[
                                { field: 'label', dir: 'asc', label: `${t('positions.sortByLabel')} — ↑` },
                                { field: 'label', dir: 'desc', label: `${t('positions.sortByLabel')} — ↓` },
                                { field: 'code', dir: 'asc', label: `${t('positions.sortByCode')} — ↑` },
                                { field: 'code', dir: 'desc', label: `${t('positions.sortByCode')} — ↓` },
                                { field: 'roles', dir: 'asc', label: `${t('positions.sortByRoles')} — ↑` },
                                { field: 'roles', dir: 'desc', label: `${t('positions.sortByRoles')} — ↓` },
                            ].map(opt => (
                                <button key={`${opt.field}-${opt.dir}`} onClick={() => { setSortField(opt.field); setSortDirection(opt.dir); setShowSortMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: sortField === opt.field && sortDirection === opt.dir ? '600' : '400', color: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)', background: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-glow)' : 'transparent', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { if (!(sortField === opt.field && sortDirection === opt.dir)) e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }} onMouseLeave={(e) => { if (!(sortField === opt.field && sortDirection === opt.dir)) e.currentTarget.style.background = 'transparent'; }}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {hasActiveFilters && (
                    <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '42px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: '500', whiteSpace: 'nowrap', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}>
                        <X size={14} /> {t('positions.clearFilters')}
                    </button>
                )}
            </div>

            {/* Results Count */}
            {!loading && positions.length > 0 && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>{t('positions.resultCount', { count: filteredPositions.length })}</span>
                </div>
            )}

            {/* Positions Card List */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--color-bg-secondary)' }}>
                    <Briefcase size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>{t('positions.allPositions')}</h2>
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)' }}>
                        {filteredPositions.length} {t('common.total')}
                    </span>
                </div>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-12)' }}>
                            <SkeletonListRows count={8} />
                        </div>
                    ) : filteredPositions.length === 0 ? (
                        <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Briefcase size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                                {hasActiveFilters ? t('positions.noPositionsFound') : t('positions.noPositions')}
                            </p>
                            {hasActiveFilters && (
                                <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', textDecoration: 'underline' }}>
                                    {t('positions.clearFilters')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-2)' }}>
                            {filteredPositions.map((position, index) => {
                                const roleNames = getRoleNamesForPosition(position.position_id);
                                const roleCount = roleNames.length;
                                return (
                                    <div key={position.position_id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: 'var(--space-4)', marginBottom: index === filteredPositions.length - 1 ? 0 : 'var(--space-2)',
                                        background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)', transition: 'all var(--transition-fast)'
                                    }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-hover)'; e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-secondary)'; }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                                            <div style={{ width: '42px', height: '42px', background: 'var(--color-accent-glow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-primary)', flexShrink: 0 }}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {getBilingualPositionLabel(position, i18n.language)}
                                                    </span>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 6px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-tertiary)', borderRadius: '4px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                                        {position.position_code}
                                                    </span>
                                                    {roleCount > 0 && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '600', flexShrink: 0, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
                                                            <Shield size={10} />
                                                            {roleCount} {roleCount === 1 ? t('positions.roleSingle') : t('positions.rolePlural')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                    {getBilingualDescription(position, i18n.language) && (
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                                                            {getBilingualDescription(position, i18n.language)}
                                                        </span>
                                                    )}
                                                    {roleNames.length > 0 && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', background: 'var(--color-bg-card)', padding: '2px var(--space-2)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                                                            <Shield size={10} style={{ flexShrink: 0 }} />
                                                            {roleNames.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                                            <button onClick={() => handleEdit(position)} title={t('common.edit')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; e.currentTarget.style.color = 'var(--color-accent-primary)'; e.currentTarget.style.background = 'var(--color-accent-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}>
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(position.position_id)} title={t('common.delete')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Position Modal */}
            <PositionFormModal
                isOpen={showFormModal}
                onClose={handleCloseModal}
                editingId={editingId}
                formData={formData}
                handleFormChange={handleFormChange}
                handleSubmit={handleSubmit}
                saving={saving}
                formTranslations={formTranslations}
                handleFormTranslationChange={handleFormTranslationChange}
                feedbackType={feedbackType}
                feedbackMessage={feedbackMessage}
                clearFeedback={clearFeedback}
            />
        </div>
    );
};

export default PositionsPage;
