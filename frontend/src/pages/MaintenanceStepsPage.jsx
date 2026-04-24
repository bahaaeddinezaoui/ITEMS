import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetService, maintenanceService, maintenanceStepService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import MaintenanceSteps from '../components/MaintenanceSteps';
import DestructionSelectionModal from '../components/DestructionSelectionModal';
import {
    ChevronLeft,
    ChevronRight,
    Wrench,
    Flame,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

const MaintenanceStepsPage = () => {
    const navigate = useNavigate();
    const { maintenanceId } = useParams();
    const { user, isSuperuser } = useAuth();
    const { t, i18n } = useTranslation();

    const [maintenance, setMaintenance] = useState(null);
    const [maintenanceSteps, setMaintenanceSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [asset, setAsset] = useState(null);
    const [suggesting, setSuggesting] = useState(false);
    const [destructionModalOpen, setDestructionModalOpen] = useState(false);

    const [ending, setEnding] = useState(false);

    const [endModalOpen, setEndModalOpen] = useState(false);

    const [triggerReturnModalAfterEnd, setTriggerReturnModalAfterEnd] = useState(false);

    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief' || r.role_code === 'it_bureau_chief') || false;
    }, [isSuperuser, user]);

    const isMaintenanceChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief') || false;
    }, [isSuperuser, user]);

    const isTechnician = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'it_maintenance_technician' || r.role_code === 'network_maintenance_technician') || false;
    }, [user]);

    const isNetworkTechnician = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'network_maintenance_technician') || false;
    }, [user]);

    const canEndMaintenance = useMemo(() => {
        if (isChief) return true;
        const userPersonId = user?.person?.person_id;
        const performedBy = maintenance?.performed_by_person;
        if (!userPersonId) return false;
        if (performedBy && Number(userPersonId) === Number(performedBy)) return true;
        // Also allow technicians who have at least one step assigned on this maintenance
        const steps = Array.isArray(maintenanceSteps) ? maintenanceSteps : [];
        return steps.some(step => step.person?.person_id === userPersonId);
    }, [isChief, user, maintenance, maintenanceSteps]);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                setLoading(true);
                setError('');
                setAsset(null);
                const id = Number(maintenanceId);
                if (!id || Number.isNaN(id)) {
                    setError(t('maintenanceSteps.invalidId'));
                    return;
                }
                const [data, steps] = await Promise.all([
                    maintenanceService.getById(id),
                    maintenanceStepService.getAll({ maintenance: id }),
                ]);
                setMaintenance(data);
                setMaintenanceSteps(Array.isArray(steps) ? steps : []);

                const assetId = data?.asset;
                if (assetId) {
                    try {
                        const assetData = await assetService.getById(assetId);
                        setAsset(assetData);
                    } catch (e) {
                        setAsset(null);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(t('maintenanceSteps.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenance();
    }, [maintenanceId]);

    const canSuggestForDestruction = useMemo(() => {
        if (!isMaintenanceChief) return false;
        const status = (asset?.asset_status || '').toString().trim().toLowerCase();
        return status === 'failed';
    }, [asset, isMaintenanceChief]);

    const submitSuggestForDestruction = async (selectionData = {}) => {
        if (!asset?.asset_id) return;
        try {
            setSuggesting(true);
            setError('');
            const updated = await assetService.suggestForDestruction(asset.asset_id, selectionData);
            setAsset(updated);
            setDestructionModalOpen(false);
        } catch (err) {
            setError(err?.response?.data?.error || t('maintenanceSteps.suggestDestructionError'));
        } finally {
            setSuggesting(false);
        }
    };

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
            setTriggerReturnModalAfterEnd(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('maintenanceSteps.endError'));
        } finally {
            setEnding(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard/maintenances')}
                            title={t('common.back')}
                            aria-label={t('common.back')}
                            style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {i18n.language === 'ar' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div>
                                <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Wrench size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('maintenanceSteps.title')}</h1>
                                <p className="page-subtitle" style={{ margin: 0 }}>
                                    #{maintenanceId}
                                    {maintenance?.asset_name ? ` — ${maintenance.asset_name}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {canSuggestForDestruction && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDestructionModalOpen(true)}
                                disabled={loading || suggesting}
                                title={t('maintenanceSteps.suggestDestruction')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'auto', whiteSpace: 'nowrap' }}
                            >
                                <Flame size={14} />
                                {suggesting ? t('common.saving') : t('maintenanceSteps.suggestDestruction')}
                            </button>
                        )}
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
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>{t('maintenanceSteps.loadingSteps')}</p>
                </div>
            ) : (
                <MaintenanceSteps
                    maintenanceId={Number(maintenanceId)}
                    maintenancePerformedBy={maintenance?.performed_by_person}
                    maintenanceEnded={!!maintenance?.end_datetime}
                    isChief={isChief}
                    maintenanceDomain={maintenance?.maintenance_domain}
                    onStepsChange={(steps) => setMaintenanceSteps(Array.isArray(steps) ? steps : [])}
                    canShowEndMaintenanceButton={canShowEndMaintenanceButton}
                    canEndMaintenance={canEndMaintenance}
                    endMaintenanceDisabled={loading || ending || !!maintenance?.end_datetime || !canEndMaintenance}
                    onEndMaintenance={() => setEndModalOpen(true)}
                    triggerReturnModalAfterEnd={triggerReturnModalAfterEnd}
                    onTriggerReturnModalAfterEndHandled={() => setTriggerReturnModalAfterEnd(false)}
                />
            )}

            {endModalOpen && (
                <div className="modal-overlay" onClick={() => (ending ? null : setEndModalOpen(false))}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: 520,
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 18px 60px rgba(0,0,0,0.18)',
                        }}
                    >
                        <div
                            className="modal-header"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                padding: '1rem 1.15rem',
                                background: 'linear-gradient(180deg, var(--color-bg-secondary), var(--color-bg-primary))',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--color-bg-primary)',
                                        border: '1px solid var(--color-border)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Wrench size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 className="modal-title" style={{ margin: 0, lineHeight: 1.25 }}>
                                        {t('maintenanceSteps.endMaintenance')}
                                    </h3>
                                    <div style={{ marginTop: 2, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                        #{maintenanceId}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="modal-close"
                                onClick={() => (ending ? null : setEndModalOpen(false))}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-primary)',
                                }}
                                aria-label={t('common.close', 'Close')}
                                title={t('common.close', 'Close')}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                {t('maintenanceSteps.wasSuccessful')}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                {t('maintenanceSteps.endMaintenanceHelp', 'This will close the maintenance and set its final status.')}
                            </div>
                        </div>

                        <div
                            className="modal-footer"
                            style={{
                                padding: '1.15rem',
                                borderTop: '1px solid var(--color-border)',
                                background: 'var(--color-bg-primary)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                            }}
                        >
                            <button
                                className="btn btn-primary"
                                onClick={() => submitEndMaintenance(true)}
                                disabled={ending}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <CheckCircle2 size={16} />
                                {t('common.yes')}
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => submitEndMaintenance(false)}
                                disabled={ending}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <XCircle size={16} />
                                {t('common.no')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <DestructionSelectionModal 
                isOpen={destructionModalOpen}
                onClose={() => setDestructionModalOpen(false)}
                onConfirm={submitSuggestForDestruction}
                asset={asset}
                submitting={suggesting}
            />
        </>
    );
};

export default MaintenanceStepsPage;
