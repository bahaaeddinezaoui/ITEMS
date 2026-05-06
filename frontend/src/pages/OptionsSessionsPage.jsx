import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Monitor, Smartphone, XCircle, Clock } from 'lucide-react';
import { userSessionService } from '../services/api';
import ModalPortal from '../components/ModalPortal';
import BackButton from '../components/BackButton';

const OptionsSessionsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [terminateSessionId, setTerminateSessionId] = useState(null);
    const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
    const [showTerminateAllConfirm, setShowTerminateAllConfirm] = useState(false);
    const [terminateAllLoading, setTerminateAllLoading] = useState(false);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await userSessionService.getAll();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleTerminate = (sessionId) => {
        setTerminateSessionId(sessionId);
        setShowTerminateConfirm(true);
    };

    const handleConfirmTerminate = async () => {
        try {
            await userSessionService.terminate(terminateSessionId);
            setMessage({ type: 'success', text: t('options.sessionTerminated') });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            fetchSessions();
        } catch (error) {
            console.error('Error terminating session:', error);
            setMessage({ type: 'error', text: t('options.terminateError') });
        } finally {
            setShowTerminateConfirm(false);
            setTerminateSessionId(null);
        }
    };

    const handleConfirmTerminateAll = async () => {
        try {
            setTerminateAllLoading(true);
            const result = await userSessionService.terminateAll();
            setMessage({ type: 'success', text: t('options.allSessionsTerminated', { count: result.count || 0 }) });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            fetchSessions();
        } catch (error) {
            console.error('Error terminating all sessions:', error);
            setMessage({ type: 'error', text: t('options.terminateAllError') });
        } finally {
            setTerminateAllLoading(false);
            setShowTerminateAllConfirm(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Monitor size={22} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('options.activeSessions')}
                    </h1>
                    <p className="page-subtitle">{t('options.security')}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {sessions.length > 1 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowTerminateAllConfirm(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                            {t('options.logOutAllSessions')}
                        </button>
                    )}
                    <BackButton onClick={() => navigate('/dashboard/options')} />
                </div>
            </header>

            {message.text && (
                <div className={message.type === 'error' ? 'error-message' : 'success-message'} style={{ marginBottom: 'var(--space-4)' }}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden'
                    }}>
                        {loading ? (
                            <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                {t('options.loadingSessions')}
                            </div>
                        ) : sessions.map((session, idx) => (
                            <div
                                key={session.session_id}
                                style={{
                                    padding: 'var(--space-4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: idx === sessions.length - 1 ? 'none' : '1px solid var(--color-border)',
                                    transition: 'background var(--transition-fast)'
                                }}
                                className="hover-bg"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    <div style={{
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-bg-primary)',
                                        color: 'var(--color-text-muted)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        {session.user_agent?.toLowerCase().includes('mobile') ? <Smartphone size={20} /> : <Monitor size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                {session.ip_address}
                                            </span>
                                            {session.is_current && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '800',
                                                    padding: '2px 6px',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    color: '#10b981',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                                }}>
                                                    {t('options.current')}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: '4px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }} title={session.user_agent}>
                                                {session.user_agent}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} />
                                                {new Date(session.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {!session.is_current && (
                                    <button
                                        onClick={() => handleTerminate(session.session_id)}
                                        title={t('options.terminateSession')}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 'var(--space-2)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--color-text-muted)',
                                            transition: 'all var(--transition-fast)'
                                        }}
                                    >
                                        <XCircle size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {!loading && sessions.length === 0 && (
                            <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                {t('options.noOtherSessions')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showTerminateConfirm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowTerminateConfirm(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('options.terminateSession')}</h3>
                                <button className="modal-close" onClick={() => setShowTerminateConfirm(false)}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{t('options.confirmTerminateSession')}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowTerminateConfirm(false)}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleConfirmTerminate}
                                    style={{ background: 'var(--color-danger)' }}
                                >
                                    {t('options.terminateSession')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {showTerminateAllConfirm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => !terminateAllLoading && setShowTerminateAllConfirm(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('options.logOutAllSessions')}</h3>
                                <button className="modal-close" onClick={() => !terminateAllLoading && setShowTerminateAllConfirm(false)}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{t('options.confirmTerminateAllSessions')}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowTerminateAllConfirm(false)}
                                    disabled={terminateAllLoading}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleConfirmTerminateAll}
                                    disabled={terminateAllLoading}
                                    style={{ background: 'var(--color-danger)' }}
                                >
                                    {terminateAllLoading ? t('options.updating') : t('options.logOutAllSessions')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default OptionsSessionsPage;
