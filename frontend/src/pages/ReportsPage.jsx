import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService, personService, problemReportService, locationService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { SkeletonCardList } from '../components/SkeletonCard';
import { BarChart3 } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

const ReportsPage = () => {
    const { user, isSuperuser } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reports, setReports] = useState([]);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [technicians, setTechnicians] = useState([]);
    const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();
    const [maintenanceDescription, setMaintenanceDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [maintenanceLocations, setMaintenanceLocations] = useState([]);
    const [selectedMaintenanceLocationId, setSelectedMaintenanceLocationId] = useState('');
    const [loadingMaintenanceLocations, setLoadingMaintenanceLocations] = useState(false);
    const [allLocations, setAllLocations] = useState([]);
    const [loadingAllLocations, setLoadingAllLocations] = useState(false);
    const [destinationMode, setDestinationMode] = useState('maintenance_room'); // 'maintenance_room' | 'asset_current' | 'other'
    const [assetCurrentLocation, setAssetCurrentLocation] = useState(null);

    const [showAssetModal, setShowAssetModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loadingAsset, setLoadingAsset] = useState(false);

    const canView = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief' || r.role_code === 'it_bureau_chief') || false;
    }, [isSuperuser, user]);

    const canCreateMaintenance = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'it_bureau_chief') || false;
    }, [isSuperuser, user]);

    const filteredReports = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = Array.isArray(reports) ? reports : [];
        const filtered = list.filter((r) => {
            if (typeFilter && r.item_type !== typeFilter) return false;
            if (!q) return true;
            const dtText = r.report_datetime ? new Date(r.report_datetime).toLocaleString() : '';
            const haystack = [
                String(r.report_id ?? ''),
                String(r.item_type ?? ''),
                String(r.item_id ?? ''),
                String(r.person_name ?? ''),
                String(r.person_id ?? ''),
                String(r.owner_observation ?? ''),
                String(dtText ?? ''),
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
        filtered.sort((a, b) => {
            const ad = a?.report_datetime ? new Date(a.report_datetime).getTime() : 0;
            const bd = b?.report_datetime ? new Date(b.report_datetime).getTime() : 0;
            return bd - ad;
        });
        return filtered;
    }, [reports, query, typeFilter]);

    const formatRelativeTime = (iso) => {
        if (!iso) return '';
        const ts = new Date(iso).getTime();
        if (Number.isNaN(ts)) return '';
        const diff = Date.now() - ts;
        const mins = Math.round(diff / 60000);
        if (mins < 1) return t('common.justNow');
        if (mins < 60) return `${mins}m`;
        const hours = Math.round(mins / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.round(hours / 24);
        if (days < 14) return `${days}d`;
        return new Date(iso).toLocaleDateString();
    };

    const chipStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid var(--glass-border)',
        background: 'rgba(255, 255, 255, 0.06)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
    };

    const typeChipStyle = (type) => {
        const colors = {
            asset: { border: 'rgba(99, 102, 241, 0.4)', bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8' },
            stock_item: { border: 'rgba(14, 165, 233, 0.4)', bg: 'rgba(14, 165, 233, 0.12)', text: '#38bdf8' },
            consumable: { border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.12)', text: '#c084fc' },
        };
        const c = colors[type] || colors.asset;
        return {
            ...chipStyle,
            border: `1px solid ${c.border}`,
            background: c.bg,
            color: c.text,
            fontWeight: 600,
        };
    };

    const getTypeAccentColor = (type) => {
        const colors = {
            asset: '#6366f1',
            stock_item: '#0ea5e9',
            consumable: '#a855f7',
        };
        return colors[type] || '#6366f1';
    };

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await problemReportService.getAll();
            setReports(Array.isArray(data) ? data : []);
        } catch {
            setError(t('reports.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canView) return;
        loadReports();
    }, [canView]);

    useEffect(() => {
        const loadTechnicians = async () => {
            try {
                const [itTechs, networkTechs, legacyTechs] = await Promise.all([
                    personService.getAll({ role: 'it_maintenance_technician' }),
                    personService.getAll({ role: 'network_maintenance_technician' }),
                    personService.getAll({ role: 'maintenance_technician' }),
                ]);
                const merged = [...(Array.isArray(itTechs) ? itTechs : [])];
                [networkTechs, legacyTechs].forEach((group) => {
                    if (!Array.isArray(group)) return;
                    group.forEach((tech) => {
                        if (!merged.some((existing) => existing.person_id === tech.person_id)) {
                            merged.push(tech);
                        }
                    });
                });
                setTechnicians(merged);
            } catch {
                setTechnicians([]);
            }
        };

        if (!canCreateMaintenance) return;
        loadTechnicians();
    }, [canCreateMaintenance]);

    const openCreateMaintenance = (report) => {
        setError('');
        setSelectedReport(report);
        setSelectedTechnician('');
        setMaintenanceDescription('');
        // Load user preference for destination mode
        let mode = 'maintenance_room';
        try {
            const saved = localStorage.getItem('maintenanceCreateDestinationMode');
            if (saved && ['maintenance_room', 'asset_current', 'other'].includes(saved)) {
                mode = saved;
            }
        } catch {}
        setDestinationMode(mode);
        setSelectedMaintenanceLocationId(mode === 'asset_current' ? 'asset_current' : '');
        setShowCreateMaintenanceModal(true);
    };

    useEffect(() => {
        const loadMaintenanceLocations = async () => {
            try {
                setLoadingMaintenanceLocations(true);
                const locations = await locationService.getByLocationType(2);
                setMaintenanceLocations(Array.isArray(locations) ? locations : []);
            } catch {
                setMaintenanceLocations([]);
            } finally {
                setLoadingMaintenanceLocations(false);
            }
        };
        const loadAllLocs = async () => {
            try {
                setLoadingAllLocations(true);
                const locs = await locationService.getAll();
                const filtered = Array.isArray(locs)
                    ? locs.filter((loc) => {
                        const label = (loc?.location_type_label || '').toString().toLowerCase();
                        return label !== 'external maintenance center';
                    })
                    : [];
                setAllLocations(filtered);
            } catch {
                setAllLocations([]);
            } finally {
                setLoadingAllLocations(false);
            }
        };
        const loadAssetLoc = async () => {
            if (!selectedReport?.item_type === 'asset') return;
            try {
                const data = await assetService.getCurrentLocation(selectedReport.item_id);
                setAssetCurrentLocation(data?.location || null);
            } catch {
                setAssetCurrentLocation(null);
            }
        };

        if (!showCreateMaintenanceModal) return;
        if (selectedReport?.item_type !== 'asset') return;

        // Always load asset current location for display if needed
        loadAssetLoc();

        if (destinationMode === 'maintenance_room' || destinationMode === 'asset_current') {
            loadMaintenanceLocations();
        } else if (destinationMode === 'other') {
            loadAllLocs();
        }
    }, [showCreateMaintenanceModal, selectedReport, destinationMode]);

    const openAssetDetails = async (report) => {
        if (report.item_type !== 'asset') return;
        try {
            setLoadingAsset(true);
            setError('');
            const asset = await assetService.getById(report.item_id);
            setSelectedAsset(asset);
            setShowAssetModal(true);
        } catch {
            setError(t('reports.loadAssetError'));
        } finally {
            setLoadingAsset(false);
        }
    };

    const submitCreateMaintenance = async (e) => {
        e.preventDefault();
        if (!selectedReport) return;
        if (!selectedTechnician) {
            setError(t('reports.selectTechnician'));
            return;
        }
        if (!maintenanceDescription.trim()) {
            setError(t('reports.enterDescription'));
            return;
        }

        if (selectedReport?.item_type === 'asset') {
            if (destinationMode === 'asset_current') {
                // No destination required
            } else if (!selectedMaintenanceLocationId) {
                setError(t('reports.selectMaintenanceLocation'));
                return;
            }
        }

        try {
            setSubmitting(true);
            setError('');
            await problemReportService.createMaintenance({
                item_type: selectedReport.item_type,
                report_id: selectedReport.report_id,
                technician_person_id: selectedTechnician,
                description: maintenanceDescription,
                destination_location_id: (destinationMode === 'asset_current')
                    ? null
                    : (selectedMaintenanceLocationId ? Number(selectedMaintenanceLocationId) : null),
            });
            setShowCreateMaintenanceModal(false);
            showSuccess(t('reports.createMaintenanceSuccess', 'Maintenance created successfully'));
            setSelectedReport(null);
            setSelectedTechnician('');
            setMaintenanceDescription('');
            setSelectedMaintenanceLocationId('');
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || t('reports.createError');
            showError(typeof msg === 'string' ? msg : t('reports.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!canView) {
        return (
            <>
                <div className="page-header">
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><BarChart3 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('reports.title')}</h1>
                    <p className="page-subtitle">{t('reports.subtitle')}</p>
                </div>

                <div className="card">
                    <div style={{ padding: 'var(--space-4)' }}>{t('common.forbidden')}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><BarChart3 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('reports.title')}</h1>
                <p className="page-subtitle">{t('reports.subtitle')}</p>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>{error}</div>
                </div>
            )}

            <div className="card">
                <div
                    className="card-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{t('reports.allReports')}</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {t('reports.shown', { count: filteredReports.length })}
                            {typeFilter ? ` • ${typeFilter.replace('_', ' ')}` : ''}
                            {query.trim() ? ` • ${t('reports.searchApplied')}` : ''}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="form-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('reports.searchPlaceholder')}
                            style={{ width: 320, maxWidth: '100%' }}
                        />
                        <select
                            className="form-input"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ width: 180 }}
                            aria-label={t('reports.filterByType')}
                        >
                            <option value="">{t('reports.allTypes')}</option>
                            <option value="asset">{t('reports.asset')}</option>
                            <option value="stock_item">{t('reports.stockItem')}</option>
                            <option value="consumable">{t('reports.consumable')}</option>
                        </select>
                        <button className="btn btn-secondary" onClick={loadReports} disabled={loading}>
                            {t('common.refresh')}
                        </button>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4)' }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                            <SkeletonCardList count={6} cardLines={3} gap="var(--space-4)" bodyPadding="var(--space-6)" style={{ display: 'contents' }} />
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">{t('reports.noResults')}</h3>
                            <p className="empty-state-text">{t('reports.tryAdjusting')}</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: 'var(--space-4)',
                            }}
                        >
                            {filteredReports.map((r) => {
                                const typeLabel = (r?.item_type || '').replace('_', ' ');
                                const rel = formatRelativeTime(r?.report_datetime);
                                const abs = r?.report_datetime ? new Date(r.report_datetime).toLocaleString() : '-';
                                const who = r?.person_name || r?.person_id || '—';
                                const observation = (r?.owner_observation || '').trim() || '—';
                                const accentColor = getTypeAccentColor(r?.item_type);

                                // Item details
                                const itemName = r?.item_name || null;
                                const itemBrand = r?.item_brand_name || null;
                                const itemModel = r?.item_model_name || null;
                                const itemInventory = r?.item_inventory_number || null;
                                const itemSerial = r?.item_serial_number || null;
                                const itemServiceTag = r?.item_service_tag || null;
                                const itemStatus = r?.item_status || null;
                                const itemLocation = r?.item_current_location || null;
                                const itemLocationType = r?.item_current_location_type || null;

                                return (
                                    <div
                                        key={`${r.item_type}-${r.report_id}`}
                                        className="card"
                                        style={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderLeft: `3px solid ${accentColor}`,
                                        }}
                                    >
                                        {/* Subtle gradient overlay for enhanced glassmorphism */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 50%)`,
                                                pointerEvents: 'none',
                                            }}
                                        />
                                        <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                                            {/* Header: Type chips + timestamp */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={typeChipStyle(r?.item_type)}>
                                                        {typeLabel || t('reports.item')}
                                                    </span>
                                                    <span style={chipStyle}>Report #{r?.report_id}</span>
                                                </div>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 500 }} title={abs}>
                                                    {rel || abs}
                                                </div>
                                            </div>

                                            {/* Item Details Section */}
                                            <div style={{ marginTop: 'var(--space-4)' }}>
                                                {/* Item Name */}
                                                {itemName && (
                                                    <div style={{
                                                        fontSize: 'var(--font-size-lg)',
                                                        fontWeight: 700,
                                                        color: 'var(--color-text-primary)',
                                                        lineHeight: 1.3,
                                                        marginBottom: 'var(--space-2)',
                                                    }}>
                                                        {itemName}
                                                    </div>
                                                )}

                                                {/* Brand & Model */}
                                                {(itemBrand || itemModel) && (
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '0.75rem',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        marginBottom: 'var(--space-2)',
                                                    }}>
                                                        {itemBrand && (
                                                            <span style={{
                                                                fontSize: '0.85rem',
                                                                color: 'var(--color-text-secondary)',
                                                                fontWeight: 500,
                                                            }}>
                                                                {itemBrand}
                                                            </span>
                                                        )}
                                                        {itemBrand && itemModel && (
                                                            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                                                        )}
                                                        {itemModel && (
                                                            <span style={{
                                                                fontSize: '0.85rem',
                                                                color: 'var(--color-text-secondary)',
                                                            }}>
                                                                {itemModel}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Item Meta: ID, Inventory, Serial, Service Tag, Status */}
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '0.5rem',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                }}>
                                                    <span style={{ ...chipStyle, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {r?.item_type === 'asset' ? 'Asset' : typeLabel} #{r?.item_id}
                                                    </span>
                                                    {itemInventory && (
                                                        <span style={{ ...chipStyle, fontSize: '0.7rem' }}>
                                                            Inv: {itemInventory}
                                                        </span>
                                                    )}
                                                    {itemSerial && (
                                                        <span style={{ ...chipStyle, fontSize: '0.7rem' }}>
                                                            SN: {itemSerial}
                                                        </span>
                                                    )}
                                                    {itemServiceTag && (
                                                        <span style={{ ...chipStyle, fontSize: '0.7rem' }}>
                                                            Tag: {itemServiceTag}
                                                        </span>
                                                    )}
                                                    {itemStatus && (
                                                        <span style={{
                                                            ...chipStyle,
                                                            fontSize: '0.7rem',
                                                            border: `1px solid ${accentColor}40`,
                                                            color: accentColor,
                                                        }}>
                                                            {itemStatus}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Current Location */}
                                                {itemLocation && (
                                                    <div style={{
                                                        marginTop: 'var(--space-3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                    }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                            {itemLocation}
                                                            {itemLocationType && (
                                                                <span style={{ color: 'var(--color-text-muted)' }}> ({itemLocationType})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Observation content */}
                                            <div style={{
                                                marginTop: 'var(--space-4)',
                                                padding: 'var(--space-3) var(--space-4)',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--glass-border)',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {t('reports.ownerObservation')}
                                                    </div>
                                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                                                        {t('reports.by')} {who}
                                                    </div>
                                                </div>
                                                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.5, fontSize: '0.95rem' }}>
                                                    {observation.length > 120 ? `${observation.slice(0, 120)}…` : observation}
                                                </div>
                                            </div>

                                            {/* Actions footer */}
                                            <div style={{
                                                marginTop: 'var(--space-5)',
                                                paddingTop: 'var(--space-4)',
                                                borderTop: '1px solid var(--glass-border)',
                                                display: 'flex',
                                                gap: 'var(--space-3)',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                            }}>
                                                {r?.item_type === 'asset' && (
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => openAssetDetails(r)}
                                                        disabled={loadingAsset}
                                                        style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.85rem' }}
                                                    >
                                                        {t('reports.viewAsset')}
                                                    </button>
                                                )}

                                                {canCreateMaintenance && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => openCreateMaintenance(r)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            width: 'auto',
                                                            fontSize: '0.85rem',
                                                            boxShadow: `0 4px 14px ${accentColor}40`,
                                                        }}
                                                    >
                                                        {t('reports.createMaintenance')}
                                                    </button>
                                                )}

                                                <div style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '0.8rem' }} title={abs}>
                                                    {abs}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showCreateMaintenanceModal && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => !submitting && setShowCreateMaintenanceModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{t('reports.createMaintenance')}</h3>
                            <button className="modal-close" onClick={() => !submitting && setShowCreateMaintenanceModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitCreateMaintenance}>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <div className="form-group">
                                    <label className="form-label">{t('reports.report')}</label>
                                    <div className="form-input">
                                        #{selectedReport?.report_id} ({selectedReport?.item_type} #{selectedReport?.item_id})
                                    </div>
                                </div>

                                {selectedReport?.item_type === 'asset' && (
                                    <div className="form-group">
                                        <label htmlFor="maintenance-location" className="form-label">{t('reports.destMaintenanceLocation')}</label>
                                        <select
                                            id="maintenance-location"
                                            className="form-input"
                                            value={selectedMaintenanceLocationId}
                                            onChange={(e) => setSelectedMaintenanceLocationId(e.target.value)}
                                            disabled={(destinationMode === 'maintenance_room' || destinationMode === 'asset_current') ? loadingMaintenanceLocations : loadingAllLocations}
                                        >
                                            <option value="">
                                                {(destinationMode === 'maintenance_room' || destinationMode === 'asset_current')
                                                    ? (loadingMaintenanceLocations ? t('reports.loadingMaintenanceLocations') : t('reports.selectMaintenanceLocationOption'))
                                                    : (loadingAllLocations ? t('reports.loadingLocations') : t('reports.selectLocation'))}
                                            </option>
                                            {destinationMode === 'asset_current' && (
                                                <option value="asset_current">
                                                    {t('reports.assetCurrentLocation')} {assetCurrentLocation ? `(${assetCurrentLocation.location_name})` : ''}
                                                </option>
                                            )}
                                            {(destinationMode === 'maintenance_room' || destinationMode === 'asset_current') && maintenanceLocations.map((r) => (
                                                <option key={r.location_id} value={String(r.location_id)}>
                                                    {r.location_name} (#{r.location_id})
                                                </option>
                                            ))}
                                            {destinationMode === 'other' && allLocations.map((r) => (
                                                <option key={r.location_id} value={String(r.location_id)}>
                                                    {r.location_name}{r.location_type_label ? ` (${r.location_type_label})` : ''} (#{r.location_id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="technician" className="form-label">{t('reports.technician')}</label>
                                    <select
                                        id="technician"
                                        className="form-input"
                                        value={selectedTechnician}
                                        onChange={(e) => setSelectedTechnician(e.target.value)}
                                    >
                                        <option value="">{t('reports.selectTechnicianOption')}</option>
                                        {technicians.map((tech) => (
                                            <option key={tech.person_id} value={tech.person_id}>
                                                {tech.first_name} {tech.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('reports.ownerObservation')}</label>
                                    <div className="form-input" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedReport?.owner_observation || '-'}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">{t('reports.maintenanceDescription')}</label>
                                    <textarea
                                        id="description"
                                        className="form-input"
                                        rows={4}
                                        value={maintenanceDescription}
                                        onChange={(e) => setMaintenanceDescription(e.target.value)}
                                        placeholder={t('reports.descriptionPlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => !submitting && setShowCreateMaintenanceModal(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? t('common.creating') : t('common.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </ModalPortal>
            )}

            {showAssetModal && selectedAsset && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setShowAssetModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <h3 className="modal-title" style={{ margin: 0 }}>
                                    {selectedAsset.asset_name || t('reports.asset')}
                                </h3>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '0.15rem 0.55rem',
                                        borderRadius: '999px',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-card)',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    #{selectedAsset.asset_id}
                                </span>
                                {selectedAsset.asset_status && (
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.15rem 0.55rem',
                                            borderRadius: '999px',
                                            border: '1px solid rgba(99, 102, 241, 0.35)',
                                            background: 'rgba(99, 102, 241, 0.12)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {selectedAsset.asset_status}
                                    </span>
                                )}
                            </div>
                            <button className="modal-close" onClick={() => setShowAssetModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                    gap: 'var(--space-4)',
                                }}
                            >
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('assets.assetType')}</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_type_label || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('assets.assetModel')}</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_model_name || selectedAsset.asset_model || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('assets.brand')}</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.brand_name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('assets.serviceTag')}</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_service_tag || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('assets.serialNumber')}</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_serial_number || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('assets.inventoryNumber')}</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_inventory_number || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAssetModal(false)}>
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
        </>
    );
};

export default ReportsPage;
