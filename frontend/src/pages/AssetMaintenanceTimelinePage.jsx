import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetMaintenanceTimelineService } from '../services/api';
import MaintenanceTimeline from '../components/MaintenanceTimeline';
import { useTranslation } from 'react-i18next';
import { GitBranch } from 'lucide-react';

const AssetMaintenanceTimelinePage = () => {
    const { assetId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assetInfo, setAssetInfo] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoading(true);
                setError('');
                let visibility = 'owned_only';
                try {
                    const saved = localStorage.getItem('maintenanceTimelineVisibilityPolicy');
                    if (saved && ['owned_only', 'anytime'].includes(saved)) {
                        visibility = saved;
                    }
                } catch {}
                const data = await assetMaintenanceTimelineService.getByAssetId(assetId, { visibility });
                setMaintenances(data.maintenances || []);
                setSteps(data.steps || []);
                // Get asset info from first maintenance if available
                if (data.maintenances && data.maintenances.length > 0) {
                    const firstMaintenance = data.maintenances[0];
                    setAssetInfo({
                        asset_id: assetId,
                        asset_name: firstMaintenance.asset_name,
                    });
                } else {
                    setAssetInfo({ asset_id: assetId, asset_name: null });
                }
            } catch (err) {
                console.error(err);
                const msg = err?.response?.data?.error || err?.message || t('assetMaintenanceTimeline.loadError');
                setError(typeof msg === 'string' ? msg : t('assetMaintenanceTimeline.loadError'));
            } finally {
                setLoading(false);
            }
        };

        if (assetId) {
            fetchTimeline();
        }
    }, [assetId]);

    return (
        <>
            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><GitBranch size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assetMaintenanceTimeline.title')}</h1>
                        <p className="page-subtitle">
                            Asset #{assetId}
                            {assetInfo?.asset_name ? ` - ${assetInfo.asset_name}` : ''}
                        </p>
                    </div>
                    <div className="d-flex" style={{ gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard/my-items')}
                            title={t('assetMaintenanceTimeline.backToMyItems')}
                            aria-label={t('assetMaintenanceTimeline.backToMyItems')}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{t('assetMaintenanceTimeline.maintenanceHistory')}</h2>
                    <p className="card-subtitle">{t('assetMaintenanceTimeline.maintenanceHistoryDesc')}</p>
                </div>

                <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>{t('assetMaintenanceTimeline.loadingTimeline')}</p>
                        </div>
                    ) : (
                        <MaintenanceTimeline maintenances={maintenances} steps={steps} />
                    )}
                </div>
            </div>
        </>
    );
};

export default AssetMaintenanceTimelinePage;
