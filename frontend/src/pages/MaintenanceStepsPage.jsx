import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { maintenanceService, maintenanceStepService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MaintenanceSteps from '../components/MaintenanceSteps';

const MaintenanceStepsPage = () => {
    const navigate = useNavigate();
    const { maintenanceId } = useParams();
    const { user, isSuperuser } = useAuth();

    const [maintenance, setMaintenance] = useState(null);
    const [maintenanceSteps, setMaintenanceSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [ending, setEnding] = useState(false);

    const [endModalOpen, setEndModalOpen] = useState(false);

    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief') || false;
    }, [isSuperuser, user]);

    const canEndMaintenance = useMemo(() => {
        if (isChief) return true;
        const userPersonId = user?.person?.person_id;
        const performedBy = maintenance?.performed_by_person;
        if (!userPersonId || !performedBy) return false;
        return Number(userPersonId) === Number(performedBy);
    }, [isChief, user, maintenance]);

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
                const [data, steps] = await Promise.all([
                    maintenanceService.getById(id),
                    maintenanceStepService.getAll({ maintenance: id }),
                ]);
                setMaintenance(data);
                setMaintenanceSteps(Array.isArray(steps) ? steps : []);
            } catch (err) {
                console.error(err);
                setError('Failed to load maintenance');
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenance();
    }, [maintenanceId]);

    const canShowEndMaintenanceButton = useMemo(() => {
        const steps = Array.isArray(maintenanceSteps) ? maintenanceSteps : [];
        if (steps.length === 0) return true;

        const allowedTerminal = new Set([
            'done',
            'failed (to be sent to a higher level)',
            'cancelled',
        ]);

        return steps.every((s) => allowedTerminal.has(s?.maintenance_step_status));
    }, [maintenanceSteps]);

    const submitEndMaintenance = async (isSuccessfulValue) => {
        try {
            if (!maintenanceId) return;
            setEnding(true);
            setError('');
            const id = Number(maintenanceId);
            const updated = await maintenanceService.end(id, { is_successful: isSuccessfulValue });
            setMaintenance(updated);
            setEndModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to end maintenance');
        } finally {
            setEnding(false);
        }
    };

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
                    <div className="d-flex" style={{ gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard/maintenances')}
                            title="Back"
                            aria-label="Back"
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

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading steps...</p>
                </div>
            ) : (
                <MaintenanceSteps
                    maintenanceId={Number(maintenanceId)}
                    maintenancePerformedBy={maintenance?.performed_by_person}
                    maintenanceEnded={!!maintenance?.end_datetime}
                    isChief={isChief}
                    onStepsChange={(steps) => setMaintenanceSteps(Array.isArray(steps) ? steps : [])}
                    canShowEndMaintenanceButton={canShowEndMaintenanceButton}
                    canEndMaintenance={canEndMaintenance}
                    endMaintenanceDisabled={loading || ending || !!maintenance?.end_datetime || !canEndMaintenance}
                    onEndMaintenance={() => setEndModalOpen(true)}
                />
            )}

            {endModalOpen && (
                <div className="modal-overlay" onClick={() => (ending ? null : setEndModalOpen(false))}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">End maintenance</h3>
                            <button className="modal-close" onClick={() => (ending ? null : setEndModalOpen(false))}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>Was the maintenance successful?</div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => submitEndMaintenance(true)}
                                disabled={ending}
                                style={{ width: '100%', padding: '12px' }}
                            >
                                Yes
                            </button>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => submitEndMaintenance(null)}
                                    disabled={ending}
                                    style={{ flex: 1 }}
                                >
                                    I'll decide later
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => submitEndMaintenance(false)}
                                    disabled={ending}
                                    style={{ flex: 1 }}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MaintenanceStepsPage;
