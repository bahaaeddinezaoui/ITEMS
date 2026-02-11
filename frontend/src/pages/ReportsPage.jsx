import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { problemReportService } from '../services/api';

const ReportsPage = () => {
    const { user, isSuperuser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reports, setReports] = useState([]);

    const canView = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief') || false;
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
                                    <th>Person ID</th>
                                    <th>Date</th>
                                    <th>Observation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((r) => (
                                    <tr key={`${r.item_type}-${r.report_id}`}>
                                        <td>{r.report_id}</td>
                                        <td>{r.item_type}</td>
                                        <td>{r.item_id}</td>
                                        <td>{r.person_id}</td>
                                        <td>{r.report_datetime ? new Date(r.report_datetime).toLocaleString() : '-'}</td>
                                        <td>{r.owner_observation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReportsPage;
