import { useEffect, useMemo, useState } from 'react';
import { problemReportService } from '../services/api';
import { SkeletonListRows } from '../components/SkeletonCard';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

const MySubmittedReportsPage = () => {
    const { t } = useTranslation();
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
            const msg = err?.response?.data?.error || err?.message || t('mySubmittedReports.loadError');
            setError(typeof msg === 'string' ? msg : t('mySubmittedReports.loadError'));
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
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><FileText size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('mySubmittedReports.title')}</h1>
                <p className="page-subtitle">{t('mySubmittedReports.subtitle')}</p>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>{error}</div>
                </div>
            )}

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 260 }}>
                    <label className="form-label">{t('mySubmittedReports.type')}</label>
                    <select
                        className="form-input"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">{t('common.all')}</option>
                        <option value="asset">{t('reports.asset')}</option>
                        <option value="stock_item">{t('reports.stockItem')}</option>
                        <option value="consumable">{t('reports.consumable')}</option>
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 480 }}>
                    <label className="form-label">{t('common.search')}</label>
                    <input
                        className="form-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('mySubmittedReports.searchPlaceholder')}
                    />
                </div>

                <div className="filter-item" style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={loadReports} disabled={loading}>
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{t('mySubmittedReports.submittedReports')}</h2>
                </div>

                <div className="card-body">
                    {loading ? (
                        <SkeletonListRows count={6} />
                    ) : filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">{t('mySubmittedReports.noReports')}</h3>
                            <p className="empty-state-text">{t('mySubmittedReports.noReportsDesc')}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('mySubmittedReports.reportId')}</th>
                                    <th>{t('mySubmittedReports.type')}</th>
                                    <th>{t('mySubmittedReports.itemId')}</th>
                                    <th>{t('common.date')}</th>
                                    <th>{t('mySubmittedReports.observation')}</th>
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
