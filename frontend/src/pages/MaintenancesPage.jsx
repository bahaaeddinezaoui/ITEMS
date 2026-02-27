import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService, maintenanceService, personService, roomService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MaintenancesPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const [maintenances, setMaintenances] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [assets, setAssets] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [createDescription, setCreateDescription] = useState('');

    const [assetCurrentRoom, setAssetCurrentRoom] = useState(null);
    const [maintenanceRooms, setMaintenanceRooms] = useState([]);
    const [selectedMaintenanceRoom, setSelectedMaintenanceRoom] = useState('');
    const [loadingAssetRoom, setLoadingAssetRoom] = useState(false);

    const [sortKey, setSortKey] = useState('start_datetime');
    const [sortDirection, setSortDirection] = useState('desc');



    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief') || false;
    }, [isSuperuser, user]);

    const isTechnician = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'maintenance_technician') || false;
    }, [user]);

    useEffect(() => {
        loadMaintenances();
        if (isChief) {
            loadTechnicians();
            loadAssets();
        }
    }, [isChief]);

    const loadMaintenances = async () => {
        try {
            setLoading(true);
            const data = await maintenanceService.getAll();
            setMaintenances(data);
        } catch (err) {
            setError('Failed to load maintenances');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const loadTechnicians = async () => {
        try {
            // Filter by role code 'maintenance_technician'
            const data = await personService.getAll({ role: 'maintenance_technician' });
            setTechnicians(data);
        } catch (err) {
            console.error('Failed to load technicians', err);
        }
    };

    const loadAssets = async () => {
        try {
            const data = await assetService.getAll();
            setAssets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load assets', err);
            setAssets([]);
        }
    };

    const openCreateMaintenance = () => {
        setError('');
        setSelectedAsset('');
        setSelectedTechnician('');
        setCreateDescription('');
        setAssetCurrentRoom(null);
        setMaintenanceRooms([]);
        setSelectedMaintenanceRoom('');
        setShowCreateModal(true);
    };

    const isMaintenanceRoom = (room) => {
        const code = (room?.room_type_code || '').toUpperCase();
        const label = (room?.room_type_label || '').toLowerCase();
        if (code && ['MR', 'MAINTENANCE', 'MAINT'].includes(code)) return true;
        return label.includes('maintenance');
    };

    const loadMaintenanceRooms = async () => {
        try {
            const rooms = await roomService.getAll();
            const filtered = (Array.isArray(rooms) ? rooms : []).filter(isMaintenanceRoom);
            setMaintenanceRooms(filtered);
        } catch (err) {
            console.error(err);
            setMaintenanceRooms([]);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAsset) {
            setError('Please select an asset');
            return;
        }
        if (!selectedTechnician) {
            setError('Please select a technician');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                asset_id: selectedAsset,
                technician_person_id: selectedTechnician,
                description: createDescription,
            };
            if (assetCurrentRoom && !isMaintenanceRoom(assetCurrentRoom)) {
                if (!selectedMaintenanceRoom) {
                    setError('Please select the maintenance room to move the asset to');
                    setSubmitting(false);
                    return;
                }
                payload.destination_room_id = Number(selectedMaintenanceRoom);
            }
            await maintenanceService.createDirect(payload);
            setShowCreateModal(false);
            loadMaintenances();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to create maintenance';
            setError(typeof msg === 'string' ? msg : 'Failed to create maintenance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignClick = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setSelectedTechnician(maintenance.performed_by_person || '');
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMaintenance) return;

        setSubmitting(true);
        try {
            await maintenanceService.update(selectedMaintenance.maintenance_id, {
                ...selectedMaintenance,
                performed_by_person: selectedTechnician || null
            });
            setShowAssignModal(false);
            loadMaintenances();
        } catch (err) {
            setError('Failed to assign technician');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelMaintenance = async (maintenanceId) => {
        if (!window.confirm('Are you sure you want to cancel this maintenance? This will delete it from the database.')) {
            return;
        }

        try {
            setLoading(true);
            await maintenanceService.delete(maintenanceId);
            loadMaintenances();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to cancel maintenance';
            setError(typeof msg === 'string' ? msg : 'Failed to cancel maintenance');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        if (!status) return 'var(--color-text-secondary)';
        const s = status.toLowerCase();
        if (s.includes('done') || s === 'completed') return 'var(--color-success)';
        if (s.includes('fail') || s.includes('cancel')) return 'var(--color-error)';
        if (s.includes('progress') || s.includes('start')) return 'var(--color-info)';
        if (s.includes('pending') || s.includes('wait')) return 'var(--color-warning)';
        return 'var(--color-text-secondary)';
    };

    const getAssetLabel = (maintenance) => {
        return (
            maintenance?.asset_name ||
            maintenance?.stock_item_name ||
            maintenance?.consumable_name ||
            (maintenance?.asset
                ? `Asset ${maintenance.asset}`
                : maintenance?.stock_item
                    ? `Stock Item ${maintenance.stock_item}`
                    : maintenance?.consumable
                        ? `Consumable ${maintenance.consumable}`
                        : 'Unknown')
        );
    };

    const getSortValue = (maintenance, key) => {
        switch (key) {
            case 'maintenance_id':
                return Number(maintenance?.maintenance_id ?? 0);
            case 'asset':
                return (getAssetLabel(maintenance) || '').toString().toLowerCase();
            case 'description':
                return (maintenance?.description || '').toString().toLowerCase();
            case 'maintenance_status':
                return (maintenance?.maintenance_status || '').toString().toLowerCase();
            case 'start_datetime': {
                const dt = maintenance?.start_datetime ? new Date(maintenance.start_datetime).getTime() : null;
                return Number.isFinite(dt) ? dt : null;
            }
            case 'end_datetime': {
                const dt = maintenance?.end_datetime ? new Date(maintenance.end_datetime).getTime() : null;
                return Number.isFinite(dt) ? dt : null;
            }
            case 'performed_by_person_name':
                return (maintenance?.performed_by_person_name || '').toString().toLowerCase();
            default:
                return '';
        }
    };

    const sortedMaintenances = useMemo(() => {
        const list = Array.isArray(maintenances) ? maintenances : [];
        const dir = sortDirection === 'asc' ? 1 : -1;

        return [...list].sort((a, b) => {
            const av = getSortValue(a, sortKey);
            const bv = getSortValue(b, sortKey);

            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;

            if (typeof av === 'number' && typeof bv === 'number') {
                if (av === bv) return 0;
                return av > bv ? dir : -dir;
            }

            const as = String(av);
            const bs = String(bv);
            const cmp = as.localeCompare(bs);
            return cmp === 0 ? 0 : cmp * dir;
        });
    }, [maintenances, sortDirection, sortKey]);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Maintenance</h1>
                <p className="page-subtitle">Manage maintenance tasks and assignments</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'nowrap',
                            gap: '0.75rem',
                        }}
                    >
                        <h2 className="card-title" style={{ margin: 0, flex: '1 1 auto', minWidth: 0 }}>
                            {isChief ? 'All Maintenances' : 'My Maintenances'}
                        </h2>
                        {isChief && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={openCreateMaintenance}
                                style={{ width: 'auto', whiteSpace: 'nowrap', flex: '0 0 auto' }}
                            >
                                Create Maintenance
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-body">
                    {/* Sort Controls */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Sort by:</span>
                        <select
                            className="form-input"
                            style={{ width: 'auto', minWidth: '140px', padding: '0.35rem 0.75rem', fontSize: 'var(--font-size-sm)' }}
                            value={sortKey}
                            onChange={(e) => { setSortKey(e.target.value); setSortDirection('desc'); }}
                        >
                            <option value="start_datetime">Start Date</option>
                            <option value="end_datetime">End Date</option>
                            <option value="maintenance_id">ID</option>
                            <option value="asset">Asset</option>
                            <option value="description">Description</option>
                            <option value="maintenance_status">Status</option>
                            <option value="performed_by_person_name">Technician</option>
                        </select>
                        <button
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.35rem 0.55rem' }}
                            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                            title={sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}
                        >
                            {sortDirection === 'asc' ? '▲ Ascending' : '▼ Descending'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading maintenances...</p>
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <p className="empty-state-title" style={{ color: 'var(--color-error)' }}>{error}</p>
                        </div>
                    ) : maintenances.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No maintenances found</h3>
                        </div>
                    ) : (
                        <div className="maintenances-timeline">
                            <style>{`
                                .maintenances-timeline {
                                    position: relative;
                                    padding-left: 2rem;
                                }
                                .maintenances-timeline::before {
                                    content: '';
                                    position: absolute;
                                    left: 0.75rem;
                                    top: 0;
                                    bottom: 0;
                                    width: 2px;
                                    background: var(--color-border);
                                }
                                .maintenance-timeline-entry {
                                    position: relative;
                                    padding-bottom: 1.5rem;
                                }
                                .maintenance-timeline-entry:last-child {
                                    padding-bottom: 0;
                                }
                                .maintenance-timeline-marker {
                                    position: absolute;
                                    left: -1.5rem;
                                    top: 0.25rem;
                                    width: 1.5rem;
                                    height: 1.5rem;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 0.75rem;
                                    font-weight: 600;
                                    background: var(--color-primary);
                                    border-color: var(--color-primary);
                                    color: white;
                                    z-index: 1;
                                }
                                .maintenance-timeline-content {
                                    background: var(--color-bg-secondary);
                                    border: 1px solid var(--color-border);
                                    border-radius: var(--radius-md);
                                    padding: 1rem;
                                    margin-left: 0.5rem;
                                    cursor: pointer;
                                    transition: box-shadow 0.15s ease, border-color 0.15s ease;
                                    border-left: 3px solid var(--color-primary);
                                }
                                .maintenance-timeline-content:hover {
                                    border-color: var(--color-primary);
                                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                                }
                                .maintenance-timeline-header {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: flex-start;
                                    margin-bottom: 0.5rem;
                                    flex-wrap: wrap;
                                    gap: 0.5rem;
                                }
                                .maintenance-timeline-title {
                                    font-weight: 600;
                                    font-size: var(--font-size-md);
                                    color: var(--color-text-primary);
                                    margin: 0;
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                }
                                .maintenance-timeline-badge {
                                    display: inline-flex;
                                    align-items: center;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: var(--radius-sm);
                                    font-size: var(--font-size-xs);
                                    font-weight: 500;
                                    color: white;
                                }
                                .maintenance-timeline-meta {
                                    display: flex;
                                    flex-wrap: wrap;
                                    gap: 1rem;
                                    font-size: var(--font-size-sm);
                                    color: var(--color-text-secondary);
                                    margin-top: 0.5rem;
                                }
                                .maintenance-timeline-meta-item {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 0.125rem;
                                }
                                .maintenance-timeline-meta-label {
                                    font-size: var(--font-size-xs);
                                    text-transform: uppercase;
                                    letter-spacing: 0.05em;
                                    opacity: 0.7;
                                }
                                .maintenance-timeline-meta-value {
                                    font-weight: 500;
                                    color: var(--color-text-primary);
                                }
                                .maintenance-timeline-actions {
                                    display: flex;
                                    gap: 0.35rem;
                                    flex-wrap: wrap;
                                    margin-top: 0.75rem;
                                    padding-top: 0.75rem;
                                    border-top: 1px solid var(--color-border);
                                }
                            `}</style>

                            {sortedMaintenances.map((maintenance) => {
                                const statusColor = getStatusColor(maintenance.maintenance_status);
                                return (
                                    <div key={maintenance.maintenance_id} className="maintenance-timeline-entry">
                                        <div className="maintenance-timeline-marker">
                                            M
                                        </div>
                                        <div
                                            className="maintenance-timeline-content"
                                            onClick={() => navigate(`/dashboard/maintenances/${maintenance.maintenance_id}/steps`)}
                                        >
                                            <div className="maintenance-timeline-header">
                                                <h4 className="maintenance-timeline-title">
                                                    <span style={{ opacity: 0.7 }}>#{maintenance.maintenance_id}</span>
                                                    {maintenance.description && ` - ${maintenance.description}`}
                                                </h4>
                                                {maintenance.maintenance_status && (
                                                    <span
                                                        className="maintenance-timeline-badge"
                                                        style={{ backgroundColor: statusColor }}
                                                    >
                                                        {maintenance.maintenance_status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="maintenance-timeline-meta">
                                                <div className="maintenance-timeline-meta-item">
                                                    <span className="maintenance-timeline-meta-label">Asset</span>
                                                    <span className="maintenance-timeline-meta-value">{getAssetLabel(maintenance)}</span>
                                                </div>
                                                <div className="maintenance-timeline-meta-item">
                                                    <span className="maintenance-timeline-meta-label">Started</span>
                                                    <span className="maintenance-timeline-meta-value">{formatDate(maintenance.start_datetime)}</span>
                                                </div>
                                                <div className="maintenance-timeline-meta-item">
                                                    <span className="maintenance-timeline-meta-label">Ended</span>
                                                    <span className="maintenance-timeline-meta-value">{formatDate(maintenance.end_datetime)}</span>
                                                </div>
                                                <div className="maintenance-timeline-meta-item">
                                                    <span className="maintenance-timeline-meta-label">Technician</span>
                                                    <span className="maintenance-timeline-meta-value">
                                                        {maintenance.performed_by_person_name || (
                                                            <span style={{ color: 'var(--color-warning)' }}>Unassigned</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="maintenance-timeline-actions">
                                                <button
                                                    className="btn btn-xs btn-secondary"
                                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/maintenances/${maintenance.maintenance_id}/steps`);
                                                    }}
                                                    title="View steps"
                                                >
                                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <path d="M14 2v6h6" />
                                                        <path d="M12 11v6" />
                                                        <path d="M9 14h6" />
                                                    </svg>
                                                </button>
                                                {!maintenance.performed_by_person && isChief && (
                                                    <button
                                                        className="btn btn-xs btn-secondary"
                                                        style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAssignClick(maintenance);
                                                        }}
                                                        title="Assign technician"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                            <circle cx="8.5" cy="7" r="4" />
                                                            <line x1="20" y1="8" x2="20" y2="14" />
                                                            <line x1="23" y1="11" x2="17" y2="11" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {(!maintenance.has_steps && !maintenance.has_external_maintenances) && (isSuperuser || isChief || maintenance.performed_by_person === user?.person?.person_id) && (
                                                    <button
                                                        className="btn btn-xs btn-danger"
                                                        style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCancelMaintenance(maintenance.maintenance_id);
                                                        }}
                                                        title="Cancel maintenance"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6" />
                                                            <path d="M14 11v6" />
                                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Technician Modal */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Assign Technician</h3>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAssignSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Maintenance Task</label>
                                    <div className="form-input" style={{ backgroundColor: '#f5f5f5' }}>
                                        {selectedMaintenance?.description || 'No description'}
                                        ({selectedMaintenance?.asset_name})
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="technician" className="form-label">Technician</label>
                                    <select
                                        id="technician"
                                        className="form-input"
                                        value={selectedTechnician}
                                        onChange={(e) => setSelectedTechnician(e.target.value)}
                                    >
                                        <option value="">-- Select Technician --</option>
                                        {technicians.map(tech => (
                                            <option key={tech.person_id} value={tech.person_id}>
                                                {tech.first_name} {tech.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Maintenance Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowCreateModal(false)}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxHeight: '80vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">Create Maintenance</h3>
                            <button className="modal-close" onClick={() => !submitting && setShowCreateModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                <div className="form-group">
                                    <label htmlFor="asset" className="form-label">Asset</label>
                                    <select
                                        id="asset"
                                        className="form-input"
                                        value={selectedAsset}
                                        onChange={async (e) => {
                                            const value = e.target.value;
                                            setSelectedAsset(value);
                                            setAssetCurrentRoom(null);
                                            setSelectedMaintenanceRoom('');
                                            if (!value) return;
                                            try {
                                                setLoadingAssetRoom(true);
                                                const data = await assetService.getCurrentRoom(value);
                                                const room = data?.room || null;
                                                setAssetCurrentRoom(room);
                                                if (room && !isMaintenanceRoom(room)) {
                                                    await loadMaintenanceRooms();
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                setAssetCurrentRoom(null);
                                            } finally {
                                                setLoadingAssetRoom(false);
                                            }
                                        }}
                                    >
                                        <option value="">-- Select Asset --</option>
                                        {assets.map((a) => (
                                            <option key={a.asset_id} value={a.asset_id}>
                                                {a.asset_name ? `${a.asset_name} (#${a.asset_id})` : `Asset #${a.asset_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Asset Current Room</label>
                                    <div
                                        className="form-input"
                                        style={{
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        {loadingAssetRoom
                                            ? 'Loading...'
                                            : assetCurrentRoom
                                                ? `${assetCurrentRoom.room_name}${assetCurrentRoom.room_type_label ? ` (${assetCurrentRoom.room_type_label})` : ''}`
                                                : '-'}
                                    </div>
                                </div>

                                {assetCurrentRoom && !isMaintenanceRoom(assetCurrentRoom) && (
                                    <div className="form-group">
                                        <label className="form-label">Move asset to maintenance room</label>
                                        <select
                                            className="form-input"
                                            value={selectedMaintenanceRoom}
                                            onChange={(e) => setSelectedMaintenanceRoom(e.target.value)}
                                        >
                                            <option value="">-- Select Maintenance Room --</option>
                                            {maintenanceRooms.map((r) => (
                                                <option key={r.room_id} value={r.room_id}>
                                                    {r.room_name}{r.room_type_label ? ` (${r.room_type_label})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="technician_create" className="form-label">Technician</label>
                                    <select
                                        id="technician_create"
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
                                    <label htmlFor="description_create" className="form-label">Description</label>
                                    <textarea
                                        id="description_create"
                                        className="form-input"
                                        rows={4}
                                        value={createDescription}
                                        onChange={(e) => setCreateDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => !submitting && setShowCreateModal(false)}
                                >
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

        </>
    );
};

export default MaintenancesPage;
