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

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setSortKey(key);
        setSortDirection('asc');
    };

    const getSortIndicator = (key) => {
        if (sortKey !== key) return '';
        return sortDirection === 'asc' ? ' ▲' : ' ▼';
    };

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

                <div className="table-container">
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
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('maintenance_id')}>
                                        ID{getSortIndicator('maintenance_id')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('asset')}>
                                        Asset{getSortIndicator('asset')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('description')}>
                                        Description{getSortIndicator('description')}
                                    </th>
                                    {isChief && (
                                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('maintenance_status')}>
                                            Status{getSortIndicator('maintenance_status')}
                                        </th>
                                    )}
                                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('start_datetime')}>
                                        Start Date{getSortIndicator('start_datetime')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('end_datetime')}>
                                        End Date{getSortIndicator('end_datetime')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('performed_by_person_name')}>
                                        Technician{getSortIndicator('performed_by_person_name')}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMaintenances.map((maintenance) => (
                                        <tr
                                            key={maintenance.maintenance_id}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/dashboard/maintenances/${maintenance.maintenance_id}/steps`)}
                                        >
                                            <td>{maintenance.maintenance_id}</td>
                                            <td>
                                                {getAssetLabel(maintenance)}
                                            </td>
                                            <td>{maintenance.description}</td>
                                            {isChief && (
                                                <td>
                                                    {maintenance.maintenance_status ? (
                                                        <span className="badge badge-info">{maintenance.maintenance_status}</span>
                                                    ) : (
                                                        <span className="badge badge-warning">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td>{formatDate(maintenance.start_datetime)}</td>
                                            <td>{formatDate(maintenance.end_datetime)}</td>
                                            <td>
                                                {maintenance.performed_by_person_name ? (
                                                    <span className="badge badge-info">{maintenance.performed_by_person_name}</span>
                                                ) : (
                                                    <span className="badge badge-warning">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {!maintenance.performed_by_person && isChief && (
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAssignClick(maintenance);
                                                            }}
                                                        >
                                                            Assign
                                                        </button>
                                                    )}
                                                    {(!maintenance.has_steps && !maintenance.has_external_maintenances) && (isSuperuser || isChief || maintenance.performed_by_person === user?.person?.person_id) && (
                                                        <button
                                                            className="btn btn-sm btn-danger ml-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelMaintenance(maintenance.maintenance_id);
                                                            }}
                                                            style={{ marginLeft: '0.5rem' }}
                                                        >
                                                            Cancel maintenance
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                ))}
                            </tbody>
                        </table>
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
