import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetMaintenanceTimelineService } from '../services/api';
import MaintenanceTimeline from '../components/MaintenanceTimeline';

const AssetMaintenanceTimelinePage = () => {
    const { assetId } = useParams();
    const navigate = useNavigate();
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
                const data = await assetMaintenanceTimelineService.getByAssetId(assetId);
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
                const msg = err?.response?.data?.error || err?.message || 'Failed to load maintenance timeline';
                setError(typeof msg === 'string' ? msg : 'Failed to load maintenance timeline');
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
                        <h1 className="page-title">Maintenance Timeline</h1>
                        <p className="page-subtitle">
                            Asset #{assetId}
                            {assetInfo?.asset_name ? ` - ${assetInfo.asset_name}` : ''}
                        </p>
                    </div>
                    <div className="d-flex" style={{ gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard/my-items')}
                            title="Back to My Items"
                            aria-label="Back to My Items"
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
                    <h2 className="card-title">Maintenance History</h2>
                    <p className="card-subtitle">View all maintenance operations and their steps for this asset</p>
                </div>

                <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading maintenance timeline...</p>
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
