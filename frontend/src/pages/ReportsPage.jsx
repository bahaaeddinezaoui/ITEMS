import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService, personService, problemReportService, locationService } from '../services/api';

const ReportsPage = () => {
    const { user, isSuperuser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reports, setReports] = useState([]);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [technicians, setTechnicians] = useState([]);
    const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
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
        if (mins < 1) return 'just now';
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
        padding: '0.15rem 0.5rem',
        borderRadius: '999px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
    };

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await problemReportService.getAll();
            setReports(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load reports');
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
            setError('Failed to load asset details');
        } finally {
            setLoadingAsset(false);
        }
    };

    const submitCreateMaintenance = async (e) => {
        e.preventDefault();
        if (!selectedReport) return;
        if (!selectedTechnician) {
            setError('Please select a technician');
            return;
        }
        if (!maintenanceDescription.trim()) {
            setError('Please enter a maintenance description');
            return;
        }

        if (selectedReport?.item_type === 'asset') {
            if (destinationMode === 'asset_current') {
                // No destination required
            } else if (!selectedMaintenanceLocationId) {
                setError('Please select the maintenance location to send the asset to');
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
            setSelectedReport(null);
            setSelectedTechnician('');
            setMaintenanceDescription('');
            setSelectedMaintenanceLocationId('');
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to create maintenance';
            setError(typeof msg === 'string' ? msg : 'Failed to create maintenance');
        } finally {
            setSubmitting(false);
        }
    };

    if (!canView) {
        return (
            <>
                <div className="page-header">
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">Problem reports</p>
                </div>

                <div className="card">
                    <div style={{ padding: 'var(--space-4)' }}>Forbidden</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">View reported problems on owned items</p>
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
                        <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>All reports</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {filteredReports.length} shown
                            {typeFilter ? ` • ${typeFilter.replace('_', ' ')}` : ''}
                            {query.trim() ? ' • search applied' : ''}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="form-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search reports…"
                            style={{ width: 320, maxWidth: '100%' }}
                        />
                        <select
                            className="form-input"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ width: 180 }}
                            aria-label="Filter by type"
                        >
                            <option value="">All types</option>
                            <option value="asset">Asset</option>
                            <option value="stock_item">Stock item</option>
                            <option value="consumable">Consumable</option>
                        </select>
                        <button className="btn btn-secondary" onClick={loadReports} disabled={loading}>
                            Refresh
                        </button>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4)' }}>
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No results</h3>
                            <p className="empty-state-text">Try adjusting filters or search.</p>
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

                                return (
                                    <div
                                        key={`${r.item_type}-${r.report_id}`}
                                        className="card"
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: 'var(--color-bg-card)',
                                            border: '1px solid var(--color-border)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span style={{ ...chipStyle, borderColor: 'rgba(99, 102, 241, 0.35)', color: 'var(--color-text-primary)' }}>
                                                    {typeLabel || 'item'}
                                                </span>
                                                <span style={chipStyle}>#{r?.report_id}</span>
                                                <span style={chipStyle}>
                                                    {r?.item_type === 'asset' ? 'asset' : typeLabel} #{r?.item_id}
                                                </span>
                                            </div>

                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }} title={abs}>
                                                {rel || abs}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '0.75rem', color: 'var(--color-text-primary)', fontWeight: 600, lineHeight: 1.35 }}>
                                            {observation.length > 120 ? `${observation.slice(0, 120)}…` : observation}
                                        </div>

                                        <div style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
                                            <span style={{ color: 'var(--color-text-muted)' }}>by</span> {who}
                                        </div>

                                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {r?.item_type === 'asset' && (
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => openAssetDetails(r)}
                                                    disabled={loadingAsset}
                                                    style={{ padding: '0.5rem 0.75rem' }}
                                                >
                                                    View asset
                                                </button>
                                            )}

                                            {canCreateMaintenance && (
                                                <button className="btn btn-primary" onClick={() => openCreateMaintenance(r)} style={{ padding: '0.5rem 0.75rem' }}>
                                                    Create maintenance
                                                </button>
                                            )}

                                            <div style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '0.85rem' }} title={abs}>
                                                {abs}
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
                <div className="modal-overlay" onClick={() => !submitting && setShowCreateMaintenanceModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create Maintenance</h3>
                            <button className="modal-close" onClick={() => !submitting && setShowCreateMaintenanceModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitCreateMaintenance}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Report</label>
                                    <div className="form-input">
                                        #{selectedReport?.report_id} ({selectedReport?.item_type} #{selectedReport?.item_id})
                                    </div>
                                </div>

                                {selectedReport?.item_type === 'asset' && (
                                    <div className="form-group">
                                        <label htmlFor="maintenance-location" className="form-label">Destination maintenance location</label>
                                        <select
                                            id="maintenance-location"
                                            className="form-input"
                                            value={selectedMaintenanceLocationId}
                                            onChange={(e) => setSelectedMaintenanceLocationId(e.target.value)}
                                            disabled={(destinationMode === 'maintenance_room' || destinationMode === 'asset_current') ? loadingMaintenanceLocations : loadingAllLocations}
                                        >
                                            <option value="">
                                                {(destinationMode === 'maintenance_room' || destinationMode === 'asset_current')
                                                    ? (loadingMaintenanceLocations ? '-- Loading Maintenance Locations --' : '-- Select Maintenance Location --')
                                                    : (loadingAllLocations ? '-- Loading Locations --' : '-- Select Location --')}
                                            </option>
                                            {destinationMode === 'asset_current' && (
                                                <option value="asset_current">
                                                    Asset current location {assetCurrentLocation ? `(${assetCurrentLocation.location_name})` : ''}
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
                                    <label htmlFor="technician" className="form-label">Technician</label>
                                    <select
                                        id="technician"
                                        className="form-input"
                                        value={selectedTechnician}
                                        onChange={(e) => setSelectedTechnician(e.target.value)}
                                    >
                                        <option value="">-- Select Technician --</option>
                                        {technicians.map((tech) => (
                                            <option key={tech.person_id} value={tech.person_id}>
                                                {tech.first_name} {tech.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Owner observation</label>
                                    <div className="form-input" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedReport?.owner_observation || '-'}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">Maintenance description</label>
                                    <textarea
                                        id="description"
                                        className="form-input"
                                        rows={4}
                                        value={maintenanceDescription}
                                        onChange={(e) => setMaintenanceDescription(e.target.value)}
                                        placeholder="Describe the maintenance action plan / diagnosis..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => !submitting && setShowCreateMaintenanceModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAssetModal && selectedAsset && (
                <div className="modal-overlay" onClick={() => setShowAssetModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <h3 className="modal-title" style={{ margin: 0 }}>
                                    {selectedAsset.asset_name || 'Asset'}
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
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Type</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_type_label || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Model</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_model_name || selectedAsset.asset_model || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Brand</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.brand_name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Service tag</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_service_tag || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Serial</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_serial_number || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Inventory</div>
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                        {selectedAsset.asset_inventory_number || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAssetModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportsPage;
