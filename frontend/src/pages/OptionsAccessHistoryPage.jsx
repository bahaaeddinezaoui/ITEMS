import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { authenticationLogService } from '../services/api';
import BackButton from '../components/BackButton';

const OptionsAccessHistoryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await authenticationLogService.getAll();
                setLogs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Globe size={22} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('options.accessHistory')}
                    </h1>
                    <p className="page-subtitle">{t('options.security')}</p>
                </div>

                <BackButton onClick={() => navigate('/dashboard/options')} />
            </header>

            <div className="card">
                <div className="card-body">
                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
                                    <tr>
                                        <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'left' }}>{t('options.event')}</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'left' }}>IP</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'right' }}>{t('options.timestamp')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : logs.map((log, idx) => (
                                        <tr
                                            key={log.log_id || `${log.event_timestamp}-${idx}`}
                                            style={{ borderBottom: idx === logs.length - 1 ? 'none' : '1px solid var(--color-border)' }}
                                            className="hover-bg"
                                        >
                                            <td style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                                    {String(log.event_type || '').replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                    {log.ip_address}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'right', verticalAlign: 'top' }}>
                                                <div style={{ color: 'var(--color-text-secondary)' }}>
                                                    {log.event_timestamp ? new Date(log.event_timestamp).toLocaleDateString() : ''}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                                    {log.event_timestamp ? new Date(log.event_timestamp).toLocaleTimeString() : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && logs.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                                {t('options.noActivityLogs')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionsAccessHistoryPage;
