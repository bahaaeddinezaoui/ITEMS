import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { maintenanceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MaintenanceSteps from '../components/MaintenanceSteps';

const MaintenanceStepsPage = () => {
    const navigate = useNavigate();
    const { maintenanceId } = useParams();
    const { user, isSuperuser } = useAuth();

    const [maintenance, setMaintenance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief') || false;
    }, [isSuperuser, user]);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                setLoading(true);
                setError('');
                const id = Number(maintenanceId);
                if (!id || Number.isNaN(id)) {
                    setError('Invalid maintenance id');
                    return;
                }
                const data = await maintenanceService.getById(id);
                setMaintenance(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load maintenance');
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenance();
    }, [maintenanceId]);

    return (
        <>
            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="page-title">Maintenance Steps</h1>
                        <p className="page-subtitle">
                            Maintenance #{maintenanceId}
                            {maintenance?.asset_name ? ` - ${maintenance.asset_name}` : ''}
                        </p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard/maintenances')}>
                        Back
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading steps...</p>
                </div>
            ) : (
                <MaintenanceSteps
                    maintenanceId={Number(maintenanceId)}
                    maintenancePerformedBy={maintenance?.performed_by_person}
                    isChief={isChief}
                />
            )}
        </>
    );
};

export default MaintenanceStepsPage;
