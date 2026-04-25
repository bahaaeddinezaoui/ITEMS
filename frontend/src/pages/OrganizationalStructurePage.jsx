import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { organizationalStructureService, organizationalStructureRelationService, organizationalStructureTypeService } from '../services/api';
import TranslatableInput from '../components/TranslatableInput';
import { Search, SlidersHorizontal, ArrowUpDown, Building2, Plus, X, Pencil, Trash2, Network, ChevronDown, XCircle, Check } from 'lucide-react';
import { SkeletonListRows } from '../components/SkeletonCard';

const getBilingualStructureName = (item, currentLang) => {
    const nameAr = item.structure_name_ar;
    const nameEn = item.structure_name_en;
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || item.structure_name;
    } else {
        if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
        return nameEn || nameAr || item.structure_name;
    }
};

const getBilingualStructureTypeLabel = (item, currentLang) => {
    const labelAr = item.structure_type_label_ar || item.organizational_structure_type_ar;
    const labelEn = item.structure_type_label_en || item.organizational_structure_type_en || item.structure_type_label || item.organizational_structure_type;
    if (currentLang === 'ar') {
        return labelAr || labelEn || '';
    } else {
        return labelEn || labelAr || '';
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

// Modal for Add/Edit Structure
const StructureFormModal = ({ isOpen, onClose, editingId, formData, handleFormChange, handleInputChange, handleSubmit, structureTypes, structureTypesLoading, saving, formTranslations, handleFormTranslationChange }) => {
    const { t, i18n } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="modal" style={{ maxWidth: '520px', width: '90%', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '24px 28px', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                                {editingId ? <Pencil size={22} /> : <Plus size={22} />}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>{editingId ? t('organizationalStructure.editStructure') : t('organizationalStructure.newStructure')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>{editingId ? t('organizationalStructure.updateDetails') : t('organizationalStructure.createNew')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.2s ease', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div style={{ padding: '28px', background: '#0f172a' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>{t('organizationalStructure.structureCode')} <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" name="structure_code" value={formData.structure_code} onChange={handleFormChange} required placeholder={t('organizationalStructure.codePlaceholder')} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('organizationalStructure.structureType')} <span style={{ color: '#ef4444' }}>*</span></label>
                                <select name="structure_type_id" value={formData.structure_type_id} onChange={handleFormChange} required disabled={structureTypesLoading} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }} onFocus={focusBorder} onBlur={blurBorder}>
                                    <option value="" style={{ background: '#0f172a' }}>{structureTypesLoading ? t('common.loading') : t('organizationalStructure.selectType')}</option>
                                    {structureTypes.map(type => (
                                        <option key={type.organizational_structure_type_id} value={type.organizational_structure_type_id} style={{ background: '#0f172a' }}>
                                            {getBilingualStructureTypeLabel(type, i18n.language) || type.organizational_structure_type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <TranslatableInput
                                label={t('organizationalStructure.structureName')}
                                baseFieldName="structure_name"
                                value={formData.structure_name}
                                onChange={handleInputChange}
                                translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.structure_name || '']))}
                                onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { structure_name: value })}
                                required
                                placeholder={t('organizationalStructure.namePlaceholder')}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '14px 16px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(71, 85, 105, 0.4)', borderRadius: '12px', marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontWeight: '500', color: '#f1f5f9', fontSize: '14px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                {t('organizationalStructure.activeStructure')}
                            </label>
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>{t('organizationalStructure.inactiveHint')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: '10px', padding: '14px 24px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)'; }}>
                                {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>{t('common.saving')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>{editingId ? <Pencil size={18} /> : <Plus size={18} />}{editingId ? t('common.saveChanges') : t('organizationalStructure.createStructure')}</span>}
                            </button>
                            <button type="button" onClick={onClose} style={{ padding: '14px 24px', background: 'rgba(71, 85, 105, 0.3)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.5)'; e.currentTarget.style.color = '#f1f5f9'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Modal for Hierarchy Configuration
const HierarchyModal = ({
    isOpen, onClose, selectedStructure, structures, relations,
    relationFormData, handleRelationFormChange, handleSubmitRelation,
    editingRelation, handleCancelRelation, handleEditRelation, handleDeleteRelation
}) => {
    const { t, i18n } = useTranslation();
    if (!isOpen || !selectedStructure) return null;

    const hasRelation = relations.length > 0;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="modal" style={{ maxWidth: '520px', width: '90%', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '24px 28px', color: 'white', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                                <Network size={22} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>{t('organizationalStructure.hierarchyConfiguration')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    {getBilingualStructureName(selectedStructure, i18n.language)}
                                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{selectedStructure.structure_code}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.2s ease', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '28px', background: '#0f172a' }}>
                    {hasRelation && !editingRelation ? (
                        <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '14px', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)' }}>
                                <Check size={24} color="white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#86efac', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '4px' }}>{t('organizationalStructure.currentParent')}</div>
                                <div style={{ fontWeight: '700', color: '#f0fdf4', fontSize: '17px', letterSpacing: '-0.3px' }}>
                                    {relations.map((relation) => {
                                        const parentStructure = structures.find(s => s.organizational_structure_id === relation.parent_organizational_structure);
                                        return parentStructure ? getBilingualStructureName(parentStructure, i18n.language) : '';
                                    }).join(', ')}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleEditRelation(relations[0])} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px 16px', color: '#f0fdf4', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
                                <Pencil size={14} /> {t('common.change')}
                            </button>
                            <button onClick={() => handleDeleteRelation(relations[0].child_organizational_structure, relations[0].parent_organizational_structure)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    ) : null}

                    {(editingRelation || !hasRelation) && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(71, 85, 105, 0.4)', borderRadius: '14px', padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {editingRelation?.parent_organizational_structure ? <Pencil size={18} color="white" /> : <Plus size={18} color="white" />}
                                </div>
                                <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '16px' }}>
                                    {editingRelation?.parent_organizational_structure ? t('organizationalStructure.changeParent') : t('organizationalStructure.assignParent')}
                                </span>
                            </div>
                            <form onSubmit={handleSubmitRelation}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>{t('organizationalStructure.selectParentStructure')}</label>
                                    <select name="parent_organizational_structure" value={relationFormData.parent_organizational_structure} onChange={handleRelationFormChange} required style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '44px' }} onFocus={focusBorder} onBlur={blurBorder}>
                                        <option value="" style={{ background: '#0f172a' }}>{t('organizationalStructure.chooseParent')}</option>
                                        {structures.filter(s => s.organizational_structure_id !== selectedStructure.organizational_structure_id).sort((a, b) => a.structure_name.localeCompare(b.structure_name)).map(structure => (
                                            <option key={structure.organizational_structure_id} value={structure.organizational_structure_id} style={{ background: '#0f172a' }}>
                                                {getBilingualStructureName(structure, i18n.language)} — {getBilingualStructureTypeLabel(structure, i18n.language) || t('common.na')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: '10px', padding: '14px 24px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)'; }}>
                                        {editingRelation?.parent_organizational_structure ? t('organizationalStructure.updateConnection') : t('organizationalStructure.saveConnection')}
                                    </button>
                                    <button type="button" onClick={handleCancelRelation} style={{ padding: '14px 24px', background: 'rgba(71, 85, 105, 0.3)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.5)'; e.currentTarget.style.color = '#f1f5f9'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StructuresList = ({
    loading, structures, handleEdit, handleDelete,
    relationFormData, handleRelationFormChange, handleSubmitRelation,
    editingRelation, handleCancelRelation, handleEditRelation, handleDeleteRelation,
    relations, selectedStructure, handleSelectStructureForRelations,
    structureTypes, t
}) => {
    const { i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);

    useEffect(() => {
        if (isHierarchyModalOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') handleCloseHierarchyModal(); };
            document.addEventListener('keydown', handleEsc);
            return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
        }
        return () => { document.body.style.overflow = ''; };
    }, [isHierarchyModalOpen]);

    useEffect(() => {
        if (!showSortMenu) return;
        const handler = (e) => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    const filteredStructures = useMemo(() => {
        let result = [...structures];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                getBilingualStructureName(s, i18n.language).toLowerCase().includes(q) ||
                s.structure_code.toLowerCase().includes(q) ||
                (getBilingualStructureTypeLabel(s, i18n.language) || '').toLowerCase().includes(q)
            );
        }
        if (filterType) {
            result = result.filter(s => String(s.structure_type_id) === String(filterType));
        }
        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                cmp = getBilingualStructureName(a, i18n.language).toLowerCase().localeCompare(getBilingualStructureName(b, i18n.language).toLowerCase(), i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'code') {
                cmp = a.structure_code.toLowerCase().localeCompare(b.structure_code.toLowerCase());
            } else if (sortField === 'type') {
                cmp = (getBilingualStructureTypeLabel(a, i18n.language) || '').toLowerCase().localeCompare((getBilingualStructureTypeLabel(b, i18n.language) || '').toLowerCase());
            } else if (sortField === 'status') {
                cmp = (a.is_active === b.is_active) ? 0 : a.is_active ? -1 : 1;
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [structures, searchQuery, filterType, sortField, sortDirection, i18n.language]);

    const hasActiveFilters = searchQuery.trim() || filterType;
    const clearAllFilters = () => { setSearchQuery(''); setFilterType(''); setSortField('name'); setSortDirection('asc'); };

    const handleSelect = (structure) => {
        handleSelectStructureForRelations(structure);
        setIsHierarchyModalOpen(true);
    };
    const handleCloseHierarchyModal = () => {
        setIsHierarchyModalOpen(false);
        handleSelectStructureForRelations(null);
    };

    return (
        <>
            {/* Search / Filter / Sort Toolbar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('organizationalStructure.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '42px', paddingLeft: 'var(--space-10)', paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)' }} />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                    )}
                </div>
                <div style={{ position: 'relative', minWidth: '180px' }}>
                    <SlidersHorizontal size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="form-input" style={{ width: '100%', height: '42px', paddingLeft: 'var(--space-10)', appearance: 'none', cursor: 'pointer' }}>
                        <option value="">{t('organizationalStructure.allTypes')}</option>
                        {structureTypes.map((rt) => (
                            <option key={rt.organizational_structure_type_id} value={rt.organizational_structure_type_id}>
                                {getBilingualStructureTypeLabel(rt, i18n.language) || rt.organizational_structure_type}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', height: '42px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                        <ArrowUpDown size={16} />
                        <span>{sortField === 'name' ? t('organizationalStructure.sortByName') : sortField === 'code' ? t('organizationalStructure.sortByCode') : sortField === 'type' ? t('organizationalStructure.sortByType') : t('common.status')}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showSortMenu && (
                        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-2)', zIndex: 100, minWidth: '200px' }}>
                            <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('common.sortBy')}</div>
                            {[
                                { field: 'name', dir: 'asc', label: `${t('organizationalStructure.sortByName')} — ↑` },
                                { field: 'name', dir: 'desc', label: `${t('organizationalStructure.sortByName')} — ↓` },
                                { field: 'code', dir: 'asc', label: `${t('organizationalStructure.sortByCode')} — ↑` },
                                { field: 'code', dir: 'desc', label: `${t('organizationalStructure.sortByCode')} — ↓` },
                                { field: 'type', dir: 'asc', label: `${t('organizationalStructure.sortByType')} — ↑` },
                                { field: 'type', dir: 'desc', label: `${t('organizationalStructure.sortByType')} — ↓` },
                                { field: 'status', dir: 'asc', label: `${t('common.status')} — ↑` },
                                { field: 'status', dir: 'desc', label: `${t('common.status')} — ↓` },
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
                        <X size={14} /> {t('organizationalStructure.clearFilters')}
                    </button>
                )}
            </div>

            {/* Results Count */}
            {!loading && structures.length > 0 && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>{t('organizationalStructure.resultCount', { count: filteredStructures.length })}</span>
                </div>
            )}

            {/* Structures Card List */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--color-bg-secondary)' }}>
                    <Building2 size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>{t('organizationalStructure.structuresAndHierarchy')}</h2>
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)' }}>
                        {filteredStructures.length} {t('common.total')}
                    </span>
                </div>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-12)' }}>
                            <SkeletonListRows count={8} />
                        </div>
                    ) : filteredStructures.length === 0 ? (
                        <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Building2 size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                                {hasActiveFilters ? t('organizationalStructure.noStructuresFound') : t('organizationalStructure.noStructures')}
                            </p>
                            {hasActiveFilters && (
                                <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', textDecoration: 'underline' }}>
                                    {t('organizationalStructure.clearFilters')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-2)' }}>
                            {filteredStructures.map((structure, index) => (
                                <div key={structure.organizational_structure_id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 'var(--space-4)', marginBottom: index === filteredStructures.length - 1 ? 0 : 'var(--space-2)',
                                    background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)', transition: 'all var(--transition-fast)'
                                }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-hover)'; e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-secondary)'; }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                                        <div style={{ width: '42px', height: '42px', background: 'var(--color-accent-glow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-primary)', flexShrink: 0 }}>
                                            <Building2 size={20} />
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {getBilingualStructureName(structure, i18n.language)}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 6px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-tertiary)', borderRadius: '4px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                                    {structure.structure_code}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '600', flexShrink: 0, background: structure.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: structure.is_active ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: structure.is_active ? 'var(--color-success)' : 'var(--color-warning)' }}></span>
                                                    {structure.is_active ? t('common.active') : t('common.inactive')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                {(getBilingualStructureTypeLabel(structure, i18n.language) || structure.structure_type_label) && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', background: 'var(--color-bg-card)', padding: '2px var(--space-2)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                                                        {getBilingualStructureTypeLabel(structure, i18n.language) || structure.structure_type_label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                                        <button onClick={() => handleSelect(structure)} title={t('organizationalStructure.hierarchyConfiguration')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)', width: '36px', height: '36px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; e.currentTarget.style.color = 'var(--color-accent-primary)'; e.currentTarget.style.background = 'var(--color-accent-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}>
                                            <Network size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(structure)} title={t('common.edit')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; e.currentTarget.style.color = 'var(--color-accent-primary)'; e.currentTarget.style.background = 'var(--color-accent-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}>
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(structure.organizational_structure_id)} title={t('common.delete')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <HierarchyModal
                isOpen={isHierarchyModalOpen}
                onClose={handleCloseHierarchyModal}
                selectedStructure={selectedStructure}
                structures={structures}
                relations={relations}
                relationFormData={relationFormData}
                handleRelationFormChange={handleRelationFormChange}
                handleSubmitRelation={handleSubmitRelation}
                editingRelation={editingRelation}
                handleCancelRelation={handleCancelRelation}
                handleEditRelation={handleEditRelation}
                handleDeleteRelation={handleDeleteRelation}
            />
        </>
    );
};

const OrganizationalStructurePage = () => {
    const { t, i18n } = useTranslation();

    // Structures state
    const [structures, setStructures] = useState([]);
    const [structureTypes, setStructureTypes] = useState([]);
    const [structureTypesLoading, setStructureTypesLoading] = useState(false);
    const [formData, setFormData] = useState({
        structure_code: '',
        structure_name: '',
        structure_type_id: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [formTranslations, setFormTranslations] = useState({});

    // Relations state
    const [relations, setRelations] = useState([]);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [relationFormData, setRelationFormData] = useState({
        child_organizational_structure: '',
        parent_organizational_structure: '',
    });
    const [editingRelation, setEditingRelation] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStructures();
        fetchStructureTypes();
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

    // ============ STRUCTURES HANDLERS ============
    const fetchStructures = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await organizationalStructureService.getAll();
            setStructures(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('organizationalStructure.fetchError') + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStructureTypes = useCallback(async () => {
        setStructureTypesLoading(true);
        try {
            const data = await organizationalStructureTypeService.getAll();
            setStructureTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('organizationalStructure.fetchTypesError') + ': ' + err.message);
        } finally {
            setStructureTypesLoading(false);
        }
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleInputChange = useCallback((name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleFormTranslationChange = useCallback((langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
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
                await organizationalStructureService.update(editingId, payload);
                setSuccessMessage(t('messages.updateSuccess'));
            } else {
                await organizationalStructureService.create(payload);
                setSuccessMessage(t('messages.createSuccess'));
            }

            setFormData({
                structure_code: '',
                structure_name: '',
                structure_type_id: '',
                is_active: true,
            });
            setFormTranslations({});
            setEditingId(null);
            setShowFormModal(false);
            await fetchStructures();
        } catch (err) {
            setError(t('organizationalStructure.saveError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    }, [editingId, formData, formTranslations, fetchStructures]);

    const handleEdit = useCallback((structure) => {
        setFormData({
            structure_code: structure.structure_code,
            structure_name: structure.structure_name,
            structure_type_id: structure.structure_type_id || '',
            is_active: structure.is_active,
        });
        const translations = {};
        if (structure.structure_name_ar) {
            translations.ar = { structure_name: structure.structure_name_ar };
        }
        if (structure.structure_name_en) {
            translations.en = { structure_name: structure.structure_name_en };
        }
        setFormTranslations(translations);
        setEditingId(structure.organizational_structure_id);
        setShowFormModal(true);
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm(t('organizationalStructure.confirmDelete'))) {
            try {
                await organizationalStructureService.delete(id);
                setSuccessMessage(t('messages.deleteSuccess'));
                await fetchStructures();
            } catch (err) {
                setError(t('organizationalStructure.deleteError') + ': ' + err.message);
            }
        }
    }, [fetchStructures]);

    const handleSelectStructureForRelations = useCallback(async (structure) => {
        setSelectedStructure(structure);
        setRelationFormData({
            child_organizational_structure: structure.organizational_structure_id,
            parent_organizational_structure: '',
        });
        setEditingRelation(null);
        const data = await organizationalStructureRelationService.getByStructureId(structure.organizational_structure_id);
        setRelations(Array.isArray(data) ? data : []);
    }, []);

    const handleRelationFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setRelationFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmitRelation = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!relationFormData.parent_organizational_structure) {
            setError(t('organizationalStructure.selectParentError'));
            return;
        }

        try {
            if (editingRelation?.parent_organizational_structure) {
                await organizationalStructureRelationService.update(
                    editingRelation.child_organizational_structure,
                    editingRelation.parent_organizational_structure,
                    relationFormData
                );
                setSuccessMessage(t('organizationalStructure.relationUpdateSuccess'));
            } else {
                await organizationalStructureRelationService.create(relationFormData);
                setSuccessMessage(t('organizationalStructure.relationCreateSuccess'));
            }

            setRelationFormData({
                child_organizational_structure: selectedStructure.organizational_structure_id,
                parent_organizational_structure: '',
            });
            setEditingRelation(null);
            const data = await organizationalStructureRelationService.getByStructureId(selectedStructure.organizational_structure_id);
            setRelations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('organizationalStructure.relationSaveError') + ': ' + err.message);
        }
    }, [editingRelation, relationFormData, selectedStructure]);

    const handleEditRelation = useCallback((relation) => {
        setRelationFormData({
            child_organizational_structure: relation.child_organizational_structure,
            parent_organizational_structure: relation.parent_organizational_structure,
        });
        setEditingRelation(relation);
    }, []);

    const handleDeleteRelation = useCallback(async (childId, parentId) => {
        if (window.confirm(t('organizationalStructure.confirmDeleteRelation'))) {
            try {
                await organizationalStructureRelationService.delete(childId, parentId);
                setSuccessMessage(t('organizationalStructure.relationDeleteSuccess'));
                const data = await organizationalStructureRelationService.getByStructureId(selectedStructure.organizational_structure_id);
                setRelations(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(t('organizationalStructure.relationDeleteError') + ': ' + err.message);
            }
        }
    }, [selectedStructure]);

    const handleCancelRelation = useCallback(() => {
        setRelationFormData({
            child_organizational_structure: selectedStructure.organizational_structure_id,
            parent_organizational_structure: '',
        });
        setEditingRelation(null);
    }, [selectedStructure]);

    // ============ MAIN RENDER ============
    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Building2 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.organizationalStructure')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('organizationalStructure.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showFormModal) {
                            setFormData({ structure_code: '', structure_name: '', structure_type_id: '', is_active: true });
                            setFormTranslations({});
                            setEditingId(null);
                        }
                        setShowFormModal(!showFormModal);
                    }}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-5)', whiteSpace: 'nowrap', width: 'auto' }}
                >
                    {showFormModal ? <X size={18} /> : <Plus size={18} />}
                    <span>{showFormModal ? t('common.cancel') : t('organizationalStructure.newStructure')}</span>
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

            {/* Structures List */}
            <StructuresList
                loading={loading}
                structures={structures}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                relationFormData={relationFormData}
                handleRelationFormChange={handleRelationFormChange}
                handleSubmitRelation={handleSubmitRelation}
                editingRelation={editingRelation}
                handleCancelRelation={handleCancelRelation}
                handleEditRelation={handleEditRelation}
                handleDeleteRelation={handleDeleteRelation}
                relations={relations}
                selectedStructure={selectedStructure}
                handleSelectStructureForRelations={handleSelectStructureForRelations}
                structureTypes={structureTypes}
                t={t}
            />

            {/* Add/Edit Structure Modal */}
            <StructureFormModal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setFormData({ structure_code: '', structure_name: '', structure_type_id: '', is_active: true });
                    setFormTranslations({});
                    setEditingId(null);
                }}
                editingId={editingId}
                formData={formData}
                handleFormChange={handleFormChange}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                structureTypes={structureTypes}
                structureTypesLoading={structureTypesLoading}
                saving={saving}
                formTranslations={formTranslations}
                handleFormTranslationChange={handleFormTranslationChange}
            />
        </div>
    );
};

export default OrganizationalStructurePage;
