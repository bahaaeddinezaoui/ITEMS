import { useEffect, useMemo, useState } from 'react';
import { problemReportService } from '../services/api';

const MySubmittedReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [query, setQuery] = useState('');

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await problemReportService.getMine();
            setReports(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to load your reports';
            setError(typeof msg === 'string' ? msg : 'Failed to load your reports');
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const filteredReports = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return reports.filter((report) => {
            if (typeFilter && report.item_type !== typeFilter) {
                return false;
            }
            if (!normalizedQuery) {
                return true;
            }
            const dateText = report.report_datetime ? new Date(report.report_datetime).toLocaleString() : '';
            const haystack = [
                String(report.report_id || ''),
                String(report.item_id || ''),
                String(report.item_type || ''),
                String(report.owner_observation || ''),
                String(dateText || ''),
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [reports, typeFilter, query]);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">My Submitted Reports</h1>
                <p className="page-subtitle">View all problem reports you have submitted</p>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>{error}</div>
                </div>
            )}

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 260 }}>
                    <label className="form-label">Type</label>
                    <select
                        className="form-input"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="asset">Asset</option>
                        <option value="stock_item">Stock Item</option>
                        <option value="consumable">Consumable</option>
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 480 }}>
                    <label className="form-label">Search</label>
                    <input
                        className="form-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by report ID, item ID, type, observation..."
                    />
                </div>

                <div className="filter-item" style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={loadReports} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Submitted Reports</h2>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No reports found</h3>
                            <p className="empty-state-text">You have not submitted any matching problem reports.</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Type</th>
                                    <th>Item ID</th>
                                    <th>Date</th>
                                    <th>Observation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={`${report.item_type}-${report.report_id}`}>
                                        <td>{report.report_id}</td>
                                        <td>{report.item_type}</td>
                                        <td>{report.item_id}</td>
                                        <td>{report.report_datetime ? new Date(report.report_datetime).toLocaleString() : '-'}</td>
                                        <td>{report.owner_observation || '-'}</td>
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

export default MySubmittedReportsPage;
