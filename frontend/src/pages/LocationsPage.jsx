import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { locationService, locationTypeService, locationRelationService } from '../services/api';
import { Search, SlidersHorizontal, ArrowUpDown, MapPin, Plus, X, Pencil, Trash2, Network, ChevronDown, XCircle } from 'lucide-react';
import TranslatableInput from '../components/TranslatableInput';

const getBilingualName = (item, currentLang) => {
    const nameAr = item.location_name_ar;
    const nameEn = item.location_name_en;
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || item.location_name;
    } else {
        if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
        return nameEn || nameAr || item.location_name;
    }
};

const getBilingualRelationName = (nameAr, nameEn, fallbackName, currentLang) => {
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || fallbackName;
    } else {
        if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
        return nameEn || nameAr || fallbackName;
    }
};

const getBilingualTypeLabel = (item, currentLang) => {
    const labelAr = item.location_type_label_ar;
    const labelEn = item.location_type_label_en || item.location_type_label;
    if (currentLang === 'ar') {
        return labelAr || labelEn || '';
    } else {
        return labelEn || labelAr || '';
    }
};

// Modal Component for Location Hierarchy Configuration
const LocationHierarchyModal = ({
    isOpen,
    onClose,
    selectedLocation,
    locations,
    relations,
    relationFormData,
    handleRelationFormChange,
    handleSubmitRelation,
    editingRelation,
    handleCancelRelation,
    handleEditRelation,
    handleDeleteRelation
}) => {
    const { t, i18n } = useTranslation();

    if (!isOpen || !selectedLocation) return null;

    const hasRelation = relations.length > 0;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal" style={{
                maxWidth: '520px',
                width: '90%',
                borderRadius: '16px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    padding: '24px 28px',
                    color: 'white',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                                    {t('locations.hierarchy')}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
                                    {getBilingualName(selectedLocation, i18n.language)}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                borderRadius: '10px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '28px', background: '#0f172a' }}>
                    {/* Current Parent Card */}
                    {hasRelation ? (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '14px',
                            padding: '20px 22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ 
                                        fontSize: '11px', 
                                        color: '#86efac', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '1px',
                                        fontWeight: '600',
                                        marginBottom: '4px'
                                    }}>
                                        {t('locations.currentlyLocatedIn')}
                                    </div>
                                    <div style={{ 
                                        fontWeight: '700', 
                                        color: '#f0fdf4',
                                        fontSize: '17px',
                                        letterSpacing: '-0.3px'
                                    }}>
                                        {getBilingualRelationName(relations[0].parent_location_name_ar, relations[0].parent_location_name_en, relations[0].parent_location_name, i18n.language)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleEditRelation(relations[0])}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '10px',
                                        padding: '10px 16px',
                                        color: '#f0fdf4',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.2)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                    {t('common.change')}
                                </button>
                                <button
                                    onClick={() => handleDeleteRelation(
                                        relations[0].child_location,
                                        relations[0].parent_location
                                    )}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        color: '#fca5a5',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Form Section */}
                    {(editingRelation || !hasRelation) && (
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(71, 85, 105, 0.4)',
                            borderRadius: '14px',
                            padding: '24px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {editingRelation?.parent_location ? (
                                            <>
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </>
                                        ) : (
                                            <>
                                                <path d="M12 5v14"/><path d="M5 12h14"/>
                                            </>
                                        )}
                                    </svg>
                                </div>
                                <span style={{ 
                                    fontWeight: '700', 
                                    color: '#f8fafc',
                                    fontSize: '16px'
                                }}>
                                    {editingRelation?.parent_location ? t('locations.changeParentLocation') : t('locations.assignParentLocation')}
                                </span>
                            </div>
                            
                            <form onSubmit={handleSubmitRelation}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {t('locations.selectParentLocation')}
                                    </label>
                                    <select
                                        name="parent_location"
                                        value={relationFormData.parent_location}
                                        onChange={handleRelationFormChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(71, 85, 105, 0.5)',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: '#f1f5f9',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            appearance: 'none',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 16px center',
                                            paddingRight: '44px'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="" style={{ background: '#0f172a' }}>{t('locations.chooseParentLocation')}</option>
                                        {locations
                                            .filter(l => l.location_id !== selectedLocation.location_id)
                                            .sort((a, b) => a.location_name.localeCompare(b.location_name))
                                            .map(location => (
                                                <option 
                                                    key={location.location_id} 
                                                    value={location.location_id}
                                                    style={{ background: '#0f172a' }}
                                                >
                                                    {getBilingualName(location, i18n.language)} — {getBilingualTypeLabel(location, i18n.language) || t('locations.noType')}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        type="submit" 
                                        style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '14px 24px',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)';
                                        }}
                                    >
                                        {editingRelation?.parent_location ? t('locations.updateConnection') : t('locations.createConnection')}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancelRelation}
                                        style={{
                                            padding: '14px 24px',
                                            background: 'rgba(71, 85, 105, 0.3)',
                                            border: '1px solid rgba(71, 85, 105, 0.5)',
                                            borderRadius: '10px',
                                            color: '#cbd5e1',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(71, 85, 105, 0.5)';
                                            e.target.style.borderColor = 'rgba(71, 85, 105, 0.7)';
                                            e.target.style.color = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(71, 85, 105, 0.3)';
                                            e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                                            e.target.style.color = '#cbd5e1';
                                        }}
                                    >
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

const LocationTreeNode = ({ location, childrenLocations, allLocations, allRelations, onHierarchy, onEdit, onDelete, t, i18n, depth = 0 }) => {
    const hasChildren = childrenLocations && childrenLocations.length > 0;
    const typeLabel = getBilingualTypeLabel(location, i18n.language) || location.location_type_label;
    const iconSize = depth === 0 ? 18 : 16;
    const iconBoxSize = depth === 0 ? '36px' : '30px';
    const btnSize = depth === 0 ? '32px' : '28px';
    const actionIconSize = depth === 0 ? 14 : 12;

    return (
        <details style={{ marginLeft: 0, marginBottom: '2px' }}>
            <summary style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: depth === 0 ? 'var(--space-3) var(--space-4)' : 'var(--space-2) var(--space-3)',
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                listStyle: 'none',
                transition: 'all var(--transition-fast)',
                minHeight: depth === 0 ? '52px' : '44px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
            >
                <ChevronDown size={14} style={{
                    color: 'var(--color-text-muted)',
                    flexShrink: 0,
                    transition: 'transform 0.2s'
                }}
                className="details-chevron"
                />
                <div style={{
                    width: iconBoxSize,
                    height: iconBoxSize,
                    background: 'var(--color-accent-glow)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent-primary)',
                    flexShrink: 0
                }}>
                    <MapPin size={iconSize} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getBilingualName(location, i18n.language)}
                    </div>
                    {typeLabel && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            background: 'var(--color-bg-card)',
                            padding: '1px var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                            marginTop: '2px'
                        }}>
                            {typeLabel}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => onHierarchy(location)}
                        title={t('locations.hierarchy')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: btnSize,
                            height: btnSize,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                            e.currentTarget.style.background = 'var(--color-accent-glow)';
                            e.currentTarget.style.color = 'var(--color-accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.background = 'var(--color-bg-card)';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        <Network size={actionIconSize} />
                    </button>
                    <button
                        onClick={() => onEdit(location)}
                        title={t('common.edit')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: btnSize,
                            height: btnSize,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                            e.currentTarget.style.background = 'var(--color-accent-glow)';
                            e.currentTarget.style.color = 'var(--color-accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.background = 'var(--color-bg-card)';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        <Pencil size={actionIconSize} />
                    </button>
                    <button
                        onClick={() => onDelete(location.location_id)}
                        title={t('common.delete')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: btnSize,
                            height: btnSize,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = 'var(--color-error)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.background = 'var(--color-bg-card)';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        <Trash2 size={actionIconSize} />
                    </button>
                </div>
            </summary>
            {hasChildren && (
                <div style={{
                    marginTop: 'var(--space-1)',
                    ...(i18n.language === 'ar' ? {
                        marginRight: 'var(--space-8)',
                        borderRight: '2px solid var(--color-accent-primary)',
                        paddingRight: 'var(--space-4)',
                        background: 'linear-gradient(270deg, rgba(99, 102, 241, 0.04) 0%, transparent 100%)',
                        borderRadius: 'var(--radius-md) 0 0 var(--radius-md)'
                    } : {
                        marginLeft: 'var(--space-8)',
                        borderLeft: '2px solid var(--color-accent-primary)',
                        paddingLeft: 'var(--space-4)',
                        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.04) 0%, transparent 100%)',
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0'
                    })
                }}>
                    {childrenLocations.map(child => {
                        const grandChildren = getChildren(child.location_id, allRelations, allLocations);
                        return (
                            <LocationTreeNode
                                key={child.location_id}
                                location={child}
                                childrenLocations={grandChildren}
                                allLocations={allLocations}
                                allRelations={allRelations}
                                onHierarchy={onHierarchy}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                t={t}
                                i18n={i18n}
                                depth={depth + 1}
                            />
                        );
                    })}
                </div>
            )}
        </details>
    );
};

const getChildren = (parentId, relations, locations) => {
    const childIds = relations
        .filter(r => Number(r.parent_location) === Number(parentId))
        .map(r => r.child_location);
    return locations.filter(l => childIds.includes(l.location_id));
};

const LocationsPage = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('locations');

    // Locations state
    const [locations, setLocations] = useState([]);
    const [locationTypes, setLocationTypes] = useState([]);
    const [formData, setFormData] = useState({
        location_name: '',
        location_type: '',
    });
    const [formTranslations, setFormTranslations] = useState({});
    const [editingId, setEditingId] = useState(null);

    // Relations state
    const [relations, setRelations] = useState([]);
    const [allRelations, setAllRelations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [relationFormData, setRelationFormData] = useState({
        child_location: '',
        parent_location: '',
    });
    const [editingRelation, setEditingRelation] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search, filter, sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        fetchLocations();
        fetchLocationTypes();
        fetchAllRelations();
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

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLocation(null);
        setRelations([]);
        setEditingRelation(null);
    }, []);

    // Modal management
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
    }, [isModalOpen, handleCloseModal]);

    const fetchLocationTypes = async () => {
        try {
            const data = await locationTypeService.getAll();
            setLocationTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setLocationTypes([]);
        }
    };

    const fetchAllRelations = async () => {
        try {
            const data = await locationRelationService.getAll();
            setAllRelations(Array.isArray(data) ? data : []);
        } catch (err) {
            setAllRelations([]);
        }
    };

    const fetchLocations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await locationService.getAll();
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('locations.fetchError') + ': ' + err.message);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { location_name: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const payload = { ...formData };
            if (Object.keys(formTranslations).length > 0) {
                payload.translations = formTranslations;
            }
            if (editingId) {
                await locationService.update(editingId, payload);
                setSuccessMessage(t('messages.updateSuccess'));
            } else {
                await locationService.create(payload);
                setSuccessMessage(t('messages.createSuccess'));
            }
            setFormData({ location_name: '', location_type: '' });
            setFormTranslations({});
            setShowForm(false);
            setEditingId(null);
            setActiveTab('locations');
            await fetchLocations();
            await fetchAllRelations();
        } catch (err) {
            setError(t('locations.saveError') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (location) => {
        setFormData({
            location_name: location.location_name,
            location_type: location.location_type || '',
        });
        setEditingId(location.location_id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('locations.confirmDelete'))) {
            try {
                await locationService.delete(id);
                setSuccessMessage(t('messages.deleteSuccess'));
                await fetchLocations();
                await fetchAllRelations();
            } catch (err) {
                setError(t('locations.deleteError') + ': ' + err.message);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ location_name: '', location_type: '' });
        setFormTranslations({});
        setShowForm(false);
        setEditingId(null);
    };

    // ============ RELATIONS HANDLERS ============
    const handleSelectLocationForRelations = useCallback(async (location) => {
        setSelectedLocation(location);
        setRelationFormData({
            child_location: location.location_id,
            parent_location: '',
        });
        setEditingRelation(null);
        try {
            const data = await locationRelationService.getByChildId(location.location_id);
            setRelations(Array.isArray(data) ? data : []);
        } catch (err) {
            setRelations([]);
        }
        setIsModalOpen(true);
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

        if (!relationFormData.parent_location) {
            setError(t('locations.selectParentError'));
            return;
        }

        try {
            if (editingRelation?.parent_location) {
                await locationRelationService.update(
                    editingRelation.child_location,
                    editingRelation.parent_location,
                    relationFormData
                );
                setSuccessMessage(t('locations.relationUpdateSuccess'));
            } else {
                await locationRelationService.create(relationFormData);
                setSuccessMessage(t('locations.relationCreateSuccess'));
            }

            setRelationFormData({
                child_location: selectedLocation.location_id,
                parent_location: '',
            });
            setEditingRelation(null);
            const data = await locationRelationService.getByChildId(selectedLocation.location_id);
            setRelations(Array.isArray(data) ? data : []);
            await fetchAllRelations();
        } catch (err) {
            setError(t('locations.relationSaveError') + ': ' + (err.response?.data?.error || err.message));
        }
    }, [editingRelation, relationFormData, selectedLocation]);

    const handleEditRelation = useCallback((relation) => {
        setRelationFormData({
            child_location: relation.child_location,
            parent_location: relation.parent_location,
        });
        setEditingRelation(relation);
    }, []);

    const handleDeleteRelation = useCallback(async (childId, parentId) => {
        if (window.confirm(t('locations.confirmDeleteRelation'))) {
            try {
                await locationRelationService.delete(childId, parentId);
                setSuccessMessage(t('locations.relationDeleteSuccess'));
                const data = await locationRelationService.getByChildId(selectedLocation.location_id);
                setRelations(Array.isArray(data) ? data : []);
                await fetchAllRelations();
            } catch (err) {
                setError(t('locations.relationDeleteError') + ': ' + err.message);
            }
        }
    }, [selectedLocation, t]);

    const handleCancelRelation = useCallback(() => {
        setRelationFormData({
            child_location: selectedLocation.location_id,
            parent_location: '',
        });
        setEditingRelation(null);
    }, [selectedLocation]);

    const filteredLocations = useMemo(() => {
        let result = [...locations];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(loc => {
                const name = getBilingualName(loc, i18n.language).toLowerCase();
                return name.includes(q);
            });
        }

        // Filter by type
        if (filterType) {
            result = result.filter(loc => String(loc.location_type) === String(filterType));
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                const nameA = getBilingualName(a, i18n.language).toLowerCase();
                const nameB = getBilingualName(b, i18n.language).toLowerCase();
                cmp = nameA.localeCompare(nameB, i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'type') {
                const typeA = (getBilingualTypeLabel(a, i18n.language) || '').toLowerCase();
                const typeB = (getBilingualTypeLabel(b, i18n.language) || '').toLowerCase();
                cmp = typeA.localeCompare(typeB);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [locations, searchQuery, filterType, sortField, sortDirection, i18n.language]);

    const rootLocations = useMemo(() => {
        const childIds = new Set(allRelations.map(r => Number(r.child_location)));
        return filteredLocations.filter(loc => !childIds.has(Number(loc.location_id)));
    }, [filteredLocations, allRelations]);

    const hasActiveFilters = searchQuery.trim() || filterType;

    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterType('');
        setSortField('name');
        setSortDirection('asc');
    };

    // Close sort menu on outside click
    useEffect(() => {
        if (!showSortMenu) return;
        const handler = (e) => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><MapPin size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.locations')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('locations.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            handleCancel();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="btn btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-5)',
                        whiteSpace: 'nowrap',
                        width: 'auto'
                    }}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    <span>{showForm ? t('common.cancel') : t('locations.addLocation')}</span>
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

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: 'var(--space-6)',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{
                        padding: 'var(--space-5) var(--space-6)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent)'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--color-accent-glow)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-accent-primary)'
                        }}>
                            {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                        </div>
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                {editingId ? t('locations.editLocation') : t('locations.addLocation')}
                            </h3>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                                {editingId ? t('locations.locationDetails') : t('locations.locationNamePlaceholder')}
                            </p>
                        </div>
                    </div>
                    <div style={{ padding: 'var(--space-6)' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('locations.locationName')} <span style={{ color: 'var(--color-error)' }}>*</span>
                                    </label>
                                    <TranslatableInput
                                        baseFieldName="location_name"
                                        value={formData.location_name}
                                        onChange={handleInputChange}
                                        translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.location_name]))}
                                        onTranslationChange={handleFormTranslationChange}
                                        placeholder={t('locations.locationNamePlaceholder')}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('locations.locationType')} <span style={{ color: 'var(--color-error)' }}>*</span>
                                    </label>
                                    <select
                                        name="location_type"
                                        value={formData.location_type}
                                        onChange={(e) => handleInputChange('location_type', e.target.value)}
                                        required
                                        className="form-input"
                                        style={{ width: '100%', height: '44px' }}
                                    >
                                        <option value="">{t('locations.selectLocationType')}</option>
                                        {locationTypes.map((rt) => (
                                            <option key={rt.location_type_id} value={rt.location_type_id}>
                                                {getBilingualTypeLabel(rt, i18n.language)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn"
                                    style={{
                                        padding: 'var(--space-3) var(--space-5)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--space-3) var(--space-6)', width: 'auto' }}
                                >
                                    {saving ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
                                            {t('common.saving')}
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                                            {editingId ? t('common.update') : t('common.create')}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search / Filter / Sort Toolbar */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center',
                marginBottom: 'var(--space-5)',
                flexWrap: 'wrap'
            }}>
                {/* Search */}
                <div style={{
                    flex: 1,
                    minWidth: '240px',
                    position: 'relative'
                }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        pointerEvents: 'none'
                    }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('locations.searchPlaceholder')}
                        className="form-input"
                        style={{
                            width: '100%',
                            height: '42px',
                            paddingLeft: 'var(--space-10)',
                            paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: 'var(--space-3)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filter by Type */}
                <div style={{ position: 'relative', minWidth: '180px' }}>
                    <SlidersHorizontal size={16} style={{
                        position: 'absolute',
                        left: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="form-input"
                        style={{
                            width: '100%',
                            height: '42px',
                            paddingLeft: 'var(--space-10)',
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">{t('locations.allTypes')}</option>
                        {locationTypes.map((rt) => (
                            <option key={rt.location_type_id} value={rt.location_type_id}>
                                {getBilingualTypeLabel(rt, i18n.language) || rt.location_type_label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSortMenu(!showSortMenu);
                        }}
                        className="btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-4)',
                            height: '42px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-secondary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: 'var(--font-size-sm)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <ArrowUpDown size={16} />
                        <span>{sortField === 'name' ? t('locations.sortByName') : t('locations.sortByType')}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {sortDirection === 'asc' ? t('locations.ascending') : t('locations.descending')}
                        </span>
                        <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showSortMenu && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                right: 0,
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                padding: 'var(--space-2)',
                                zIndex: 100,
                                minWidth: '180px'
                            }}
                        >
                            <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t('common.sortBy')}
                            </div>
                            {[
                                { field: 'name', dir: 'asc', label: `${t('locations.sortByName')} — ${t('locations.ascending')}` },
                                { field: 'name', dir: 'desc', label: `${t('locations.sortByName')} — ${t('locations.descending')}` },
                                { field: 'type', dir: 'asc', label: `${t('locations.sortByType')} — ${t('locations.ascending')}` },
                                { field: 'type', dir: 'desc', label: `${t('locations.sortByType')} — ${t('locations.descending')}` },
                            ].map(opt => (
                                <button
                                    key={`${opt.field}-${opt.dir}`}
                                    onClick={() => {
                                        setSortField(opt.field);
                                        setSortDirection(opt.dir);
                                        setShowSortMenu(false);
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: 'var(--space-2) var(--space-3)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
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
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-3)',
                            height: '42px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                        }}
                    >
                        <X size={14} />
                        {t('locations.clearFilters')}
                    </button>
                )}
            </div>

            {/* Results Count */}
            {!loading && locations.length > 0 && (
                <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <span>{t('locations.resultCount', { count: filteredLocations.length })}</span>
                </div>
            )}

            {/* Locations List Card */}
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                boxShadow: 'var(--shadow-md)'
            }}>
                {/* Card Header */}
                <div style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    background: 'var(--color-bg-secondary)'
                }}>
                    <MapPin size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                        {t('locations.allLocations')}
                    </h2>
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-bg-card)',
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        {filteredLocations.length} {t('common.total')}
                    </span>
                </div>

                {/* Card Body */}
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="loading-state" style={{ padding: 'var(--space-12)' }}>
                            <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                            <span>{t('common.loading')}</span>
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div style={{
                            padding: 'var(--space-12)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)'
                        }}>
                            <MapPin size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                                {hasActiveFilters ? t('locations.noResultsFound') : t('locations.noLocationsFound')}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-accent-primary)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {t('locations.clearFilters')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-2)' }}>
                            {rootLocations.map(location => {
                                const children = getChildren(location.location_id, allRelations, filteredLocations);
                                return (
                                    <LocationTreeNode
                                        key={location.location_id}
                                        location={location}
                                        childrenLocations={children}
                                        allLocations={filteredLocations}
                                        allRelations={allRelations}
                                        onHierarchy={handleSelectLocationForRelations}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        t={t}
                                        i18n={i18n}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Location Hierarchy Modal */}
            <LocationHierarchyModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedLocation={selectedLocation}
                locations={locations}
                relations={relations}
                relationFormData={relationFormData}
                handleRelationFormChange={handleRelationFormChange}
                handleSubmitRelation={handleSubmitRelation}
                editingRelation={editingRelation}
                handleCancelRelation={handleCancelRelation}
                handleEditRelation={handleEditRelation}
                handleDeleteRelation={handleDeleteRelation}
            />
        </div>
    );
};

export default LocationsPage;
