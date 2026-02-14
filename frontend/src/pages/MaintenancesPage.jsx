import { useState, useEffect, useMemo, Fragment } from 'react';
import { maintenanceService, personService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MaintenanceSteps from '../components/MaintenanceSteps';

const MaintenancesPage = () => {
    const { user, isSuperuser } = useAuth();
    const [maintenances, setMaintenances] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Steps Modal State
    // Steps Expansion State
    const [expandedMaintenanceId, setExpandedMaintenanceId] = useState(null);

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

    const handleAssignClick = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setSelectedTechnician(maintenance.performed_by_person || '');
        setShowAssignModal(true);
    };

    const toggleSteps = (maintenanceId) => {
        setExpandedMaintenanceId(current => current === maintenanceId ? null : maintenanceId);
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

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Maintenance</h1>
                <p className="page-subtitle">Manage maintenance tasks and assignments</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        {isChief ? 'All Maintenances' : 'My Maintenances'}
                    </h2>
                    {/* Add Create Maintenance Button if needed later */}
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
                                    <th>ID</th>
                                    <th>Asset</th>
                                    <th>Description</th>
                                    <th>Start Date</th>
                                    <th>Technician</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenances.map((maintenance) => (
                                    <Fragment key={maintenance.maintenance_id}>
                                        <tr>
                                            <td>{maintenance.maintenance_id}</td>
                                            <td>
                                                {maintenance.asset_name ||
                                                    maintenance.stock_item_name ||
                                                    maintenance.consumable_name ||
                                                    (maintenance.asset ? `Asset ${maintenance.asset}` :
                                                        maintenance.stock_item ? `Stock Item ${maintenance.stock_item}` :
                                                            maintenance.consumable ? `Consumable ${maintenance.consumable}` :
                                                                'Unknown')}
                                            </td>
                                            <td>{maintenance.description}</td>
                                            <td>{formatDate(maintenance.start_datetime)}</td>
                                            <td>
                                                {maintenance.performed_by_person_name ? (
                                                    <span className="badge badge-info">{maintenance.performed_by_person_name}</span>
                                                ) : (
                                                    <span className="badge badge-warning">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {maintenance.performed_by_person && isChief && (
                                                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginRight: '0.5rem' }}>
                                                            Assigned
                                                        </span>
                                                    )}
                                                    {!maintenance.performed_by_person && isChief && (
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleAssignClick(maintenance)}
                                                        >
                                                            Assign
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-info ml-2"
                                                        onClick={() => toggleSteps(maintenance.maintenance_id)}
                                                        style={{ marginLeft: '0.5rem' }}
                                                    >
                                                        {expandedMaintenanceId === maintenance.maintenance_id ? 'Hide Steps' : 'Steps'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedMaintenanceId === maintenance.maintenance_id && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: 0 }}>
                                                    <MaintenanceSteps
                                                        maintenanceId={maintenance.maintenance_id}
                                                        maintenancePerformedBy={maintenance.performed_by_person}
                                                        isChief={isChief}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
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

        </>
    );
};

export default MaintenancesPage;
