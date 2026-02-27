import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService, personService, problemReportService } from '../services/api';

const ReportsPage = () => {
    const { user, isSuperuser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reports, setReports] = useState([]);

    const [technicians, setTechnicians] = useState([]);
    const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [maintenanceDescription, setMaintenanceDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [showAssetModal, setShowAssetModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loadingAsset, setLoadingAsset] = useState(false);

    const canView = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief') || false;
    }, [isSuperuser, user]);

    const canCreateMaintenance = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief') || false;
    }, [isSuperuser, user]);

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
                const data = await personService.getAll({ role: 'maintenance_technician' });
                setTechnicians(Array.isArray(data) ? data : []);
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
        setMaintenanceDescription(report?.owner_observation || '');
        setShowCreateMaintenanceModal(true);
    };

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

        try {
            setSubmitting(true);
            setError('');
            await problemReportService.createMaintenance({
                item_type: selectedReport.item_type,
                report_id: selectedReport.report_id,
                technician_person_id: selectedTechnician,
                description: maintenanceDescription,
            });
            setShowCreateMaintenanceModal(false);
            setSelectedReport(null);
            setSelectedTechnician('');
            setMaintenanceDescription('');
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
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>All Reports</h2>
                    <button className="btn btn-secondary" onClick={loadReports} disabled={loading}>
                        Refresh
                    </button>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No reports</h3>
                            <p className="empty-state-text">No problem reports have been submitted yet.</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Type</th>
                                    <th>Item ID</th>
                                    <th>Person</th>
                                    <th>Date</th>
                                    <th>Observation</th>
                                    {canCreateMaintenance && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((r) => (
                                    <tr key={`${r.item_type}-${r.report_id}`}>
                                        <td>{r.report_id}</td>
                                        <td>{r.item_type}</td>
                                        <td>
                                            {r.item_type === 'asset' ? (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                            onClick={() => openAssetDetails(r)}
                                            disabled={loadingAsset}
                                                >
                                                    {r.item_id}
                                                </button>
                                            ) : (
                                                r.item_id
                                            )}
                                        </td>
                                        <td>{r.person_name || r.person_id}</td>
                                        <td>{r.report_datetime ? new Date(r.report_datetime).toLocaleString() : '-'}</td>
                                        <td>{r.owner_observation}</td>
                                        {canCreateMaintenance && (
                                            <td>
                                                <button className="btn btn-secondary" onClick={() => openCreateMaintenance(r)}>
                                                    Create maintenance
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                    <div className="form-input" style={{ backgroundColor: '#f5f5f5' }}>
                                        #{selectedReport?.report_id} ({selectedReport?.item_type} #{selectedReport?.item_id})
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
                                        {technicians.map((tech) => (
                                            <option key={tech.person_id} value={tech.person_id}>
                                                {tech.first_name} {tech.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        id="description"
                                        className="form-input"
                                        rows={4}
                                        value={maintenanceDescription}
                                        onChange={(e) => setMaintenanceDescription(e.target.value)}
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
                            <h3 className="modal-title">Asset Details</h3>
                            <button className="modal-close" onClick={() => setShowAssetModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                <div>
                                    <strong>Asset ID:</strong> {selectedAsset.asset_id}
                                </div>
                                <div>
                                    <strong>Name:</strong> {selectedAsset.asset_name || '-'}
                                </div>
                                <div>
                                    <strong>Serial Number:</strong> {selectedAsset.asset_serial_number || '-'}
                                </div>
                                <div>
                                    <strong>Inventory Number:</strong> {selectedAsset.asset_inventory_number || '-'}
                                </div>
                                <div>
                                    <strong>Service Tag:</strong> {selectedAsset.asset_service_tag || '-'}
                                </div>
                                <div>
                                    <strong>Status:</strong> {selectedAsset.asset_status || '-'}
                                </div>
                                <div>
                                    <strong>Model:</strong> {selectedAsset.asset_model_name || selectedAsset.asset_model || '-'}
                                </div>
                                <div>
                                    <strong>Brand:</strong> {selectedAsset.brand_name || '-'}
                                </div>
                                <div>
                                    <strong>Type:</strong> {selectedAsset.asset_type_label || '-'}
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
