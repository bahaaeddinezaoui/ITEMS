import { useEffect, useMemo, useState } from 'react';
import { authService, movementApprovalService, userSessionService, authenticationLogService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePowerSave } from '../context/usePowerSave';
import { useTranslation } from 'react-i18next';
import { Monitor, Smartphone, Globe, XCircle, Clock, Shield, AlertCircle, CheckCircle2, Lock, Settings, Zap, ZapOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

const INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY = 'incidentReportCompositionStatusStrategy';

const OptionsPage = () => {
    const { user, isSuperuser } = useAuth();
    const { enabled: powerSaveEnabled, setEnabled: setPowerSaveEnabled } = usePowerSave();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isMaintenanceTech = useMemo(() => {
        return user?.roles?.some(r => ['it_maintenance_technician', 'network_maintenance_technician'].includes(r.role_code)) || false;
    }, [user]);
    const isMaintenanceChief = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'maintenance_chief') || false;
    }, [user]);
    const isAssetResponsible = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'asset_responsible') || false;
    }, [user]);
    const isItBureauChief = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'it_bureau_chief') || false;
    }, [user]);

    const [activeSection, setActiveSection] = useState('security');
    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [terminateSessionId, setTerminateSessionId] = useState(null);
    const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
    const [showTerminateAllConfirm, setShowTerminateAllConfirm] = useState(false);
    const [terminateAllLoading, setTerminateAllLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [destMode, setDestMode] = useState('maintenance_room');
    const [showAutoAcceptConfirm, setShowAutoAcceptConfirm] = useState(false);
    const [autoAcceptLoading, setAutoAcceptLoading] = useState(false);
    const [autoAcceptSubmitting, setAutoAcceptSubmitting] = useState(false);
    const [autoAcceptEligibleCount, setAutoAcceptEligibleCount] = useState(0);
    const [autoAcceptEligibleIds, setAutoAcceptEligibleIds] = useState([]);
    const [incidentCompositionStrategy, setIncidentCompositionStrategy] = useState('all');

    // Security - Sessions & Logs
    const [sessions, setSessions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const saved = localStorage.getItem('maintenanceCreateDestinationMode');
        if (saved && ['maintenance_room', 'asset_current', 'other'].includes(saved)) {
            setDestMode(saved);
        }
        const savedIncidentStrategy = localStorage.getItem(INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY);
        if (savedIncidentStrategy && ['all', 'exploitation_decides'].includes(savedIncidentStrategy)) {
            setIncidentCompositionStrategy(savedIncidentStrategy);
        }
    }, []);

    const fetchSessions = async () => {
        try {
            setSessionsLoading(true);
            const data = await userSessionService.getAll();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setSessionsLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const data = await authenticationLogService.getAll();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    useEffect(() => {
        if (activeSection === 'security') {
            fetchSessions();
            fetchLogs();
        }
    }, [activeSection]);

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

    const saveDestMode = (mode) => {
        setDestMode(mode);
        try {
            localStorage.setItem('maintenanceCreateDestinationMode', mode);
            setMessage({ type: 'success', text: t('options.preferenceSaved') });
            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
        } catch {
            // no-op
        }
    };

    const saveIncidentCompositionStrategy = (strategy) => {
        setIncidentCompositionStrategy(strategy);
        try {
            localStorage.setItem(INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY, strategy);
            setMessage({ type: 'success', text: t('options.preferenceSaved') });
            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
        } catch {
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: t('options.passwordsDoNotMatch') });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: 'error', text: t('options.passwordTooShort') });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(formData.oldPassword, formData.newPassword);
            setMessage({ type: 'success', text: t('options.passwordChangedSuccess') });
            showSuccess(t('options.passwordChangedSuccess'));
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.detail || t('options.passwordChangeError');
            setMessage({ type: 'error', text: errorMsg });
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: 'general', label: t('options.general'), icon: '⚙️' },
        { id: 'security', label: t('options.security'), icon: '🔒' },
        { id: 'notifications', label: t('options.notifications'), icon: '🔔' },
        { id: 'appearance', label: t('options.appearance'), icon: '🎨' },
        ...(isSuperuser || isMaintenanceChief || isItBureauChief ? [{ id: 'maintenance', label: t('options.maintenance'), icon: '🧰' }] : []),
        ...(isSuperuser || isAssetResponsible ? [{ id: 'asset', label: t('options.asset'), icon: '📦' }] : []),
        ...(isSuperuser || isItBureauChief ? [{ id: 'incident', label: t('options.incidentReports'), icon: '📝' }] : []),
    ];

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Settings size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('options.title')}</h1>
                <p className="page-subtitle">{t('options.subtitle')}</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
                {/* Sidebar Navigation */}
                <div className="card" style={{ padding: 'var(--space-2)' }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => {
                                setActiveSection(section.id);
                                setMessage({ type: '', text: '' });
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: activeSection === section.id ? 'var(--color-accent-glow)' : 'transparent',
                                color: activeSection === section.id ? 'var(--color-accent-tertiary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: activeSection === section.id ? '600' : '500',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            <span>{section.icon}</span>
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            {sections.find(s => s.id === activeSection)?.label} {t('options.settingsSuffix')}
                        </h2>
                    </div>
                    <div className="card-body">
                        {activeSection === 'security' && (
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                        <div>
                                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600' }}>{t('options.password')}</h3>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{t('options.passwordDesc')}</p>
                                        </div>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowPasswordForm(true);
                                                setMessage({ type: '', text: '' });
                                            }}
                                        >
                                            {t('options.changePassword')}
                                        </button>
                                    </div>
                                    {message.text && message.type === 'success' && !showPasswordForm && (
                                        <div className="success-message" style={{ maxWidth: '600px' }}>
                                            {message.text}
                                        </div>
                                    )}
                                </div>

                                {showPasswordForm && (
                                    <ModalPortal>
                                        <div className="modal-overlay" onClick={() => !loading && setShowPasswordForm(false)}>
                                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                                <div className="modal-header">
                                                    <h3 className="modal-title">{t('options.changePassword')}</h3>
                                                    <button className="modal-close" onClick={() => !loading && setShowPasswordForm(false)}>
                                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                    <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                                    {message.text && message.type === 'error' && (
                                                        <div className="error-message">
                                                            {message.text}
                                                        </div>
                                                    )}
                                                    <form className="form" onSubmit={handleSubmitPassword}>
                                                        <div className="form-group">
                                                            <label className="form-label">{t('options.oldPassword')}</label>
                                                            <input
                                                                type="password"
                                                                name="oldPassword"
                                                                className="form-input"
                                                                value={formData.oldPassword}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">{t('options.newPassword')}</label>
                                                            <input
                                                                type="password"
                                                                name="newPassword"
                                                                className="form-input"
                                                                value={formData.newPassword}
                                                                onChange={handleChange}
                                                                required
                                                                minLength={8}
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">{t('options.confirmNewPassword')}</label>
                                                            <input
                                                                type="password"
                                                                name="confirmPassword"
                                                                className="form-input"
                                                                value={formData.confirmPassword}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="modal-footer">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => setShowPasswordForm(false)}
                                                        disabled={loading}
                                                    >
                                                        {t('common.cancel')}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        onClick={handleSubmitPassword}
                                                        disabled={loading}
                                                    >
                                                        {loading ? t('options.updating') : t('options.updatePassword')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </ModalPortal>
                                )}

                                {/* Sessions & Logs Section */}
                                <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                                    {/* Active Sessions */}
                                    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <Monitor size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                                {t('options.activeSessions')}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                {sessions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => setShowTerminateAllConfirm(true)}
                                                        style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                                                    >
                                                        {t('options.logOutAllSessions')}
                                                    </button>
                                                )}
                                                <span style={{ 
                                                    fontSize: 'var(--font-size-xs)', 
                                                    fontWeight: '700', 
                                                    padding: 'var(--space-1) var(--space-3)', 
                                                    background: 'var(--color-accent-glow)', 
                                                    color: 'var(--color-accent-tertiary)', 
                                                    borderRadius: 'var(--radius-full)' 
                                                }}>
                                                    {sessions.length} {t('options.devices')}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ 
                                            background: 'var(--color-bg-secondary)', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: '1px solid var(--color-border)', 
                                            overflow: 'hidden'
                                        }}>
                                            {sessionsLoading ? (
                                                <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{t('options.loadingSessions')}</div>
                                            ) : sessions.slice(0, 3).map((session, idx, arr) => (
                                                <div key={session.session_id} style={{ 
                                                    padding: 'var(--space-4)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    borderBottom: idx === arr.length - 1 && sessions.length <= 3 ? 'none' : '1px solid var(--color-border)',
                                                    transition: 'background var(--transition-fast)'
                                                }} className="hover-bg">
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
                                                                    maxWidth: '200px',
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
                                                            title="Terminate session"
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
                                            {sessions.length === 0 && !sessionsLoading && (
                                                <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{t('options.noOtherSessions')}</div>
                                            )}
                                            {sessions.length > 3 && (
                                                <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--color-border)' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => navigate('/dashboard/options/sessions')}
                                                        style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                                                    >
                                                        {t('options.showAllSessions')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Access History */}
                                    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                                                <Globe size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                                {t('options.accessHistory')}
                                            </h3>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => navigate('/dashboard/options/access-history')}
                                                style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                                            >
                                                {t('options.showAllSessions')}
                                            </button>
                                        </div>
                                        <div style={{ 
                                            background: 'var(--color-bg-secondary)', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: '1px solid var(--color-border)', 
                                            overflow: 'hidden'
                                        }}>
                                            <div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
                                                        <tr>
                                                            <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'left' }}>{t('options.event')}</th>
                                                            <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'right' }}>{t('options.timestamp')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {logs.slice(0, 3).map((log, idx, arr) => (
                                                            <tr key={log.log_id} style={{ 
                                                                borderBottom: idx === arr.length - 1 && logs.length <= 3 ? 'none' : '1px solid var(--color-border)'
                                                            }} className="hover-bg">
                                                                <td style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                                                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                                                        {log.event_type.replace('_', ' ')}
                                                                    </div>
                                                                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                                                        IP: {log.ip_address}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'right', verticalAlign: 'top' }}>
                                                                    <div style={{ color: 'var(--color-text-secondary)' }}>
                                                                        {new Date(log.event_timestamp).toLocaleDateString()}
                                                                    </div>
                                                                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                                                        {new Date(log.event_timestamp).toLocaleTimeString()}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {logs.length === 0 && (
                                                            <tr>
                                                                <td colSpan="2" style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                                                    {t('options.noActivityLogs')}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeSection === 'maintenance' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 700 }}>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('options.createMaintenanceDefaults')}</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        {t('options.maintenanceDestDesc')}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="destMode"
                                                value="maintenance_room"
                                                checked={destMode === 'maintenance_room'}
                                                onChange={() => saveDestMode('maintenance_room')}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.maintenanceRoom')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.maintenanceRoomDesc')}
                                                </div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="destMode"
                                                value="asset_current"
                                                checked={destMode === 'asset_current'}
                                                onChange={() => saveDestMode('asset_current')}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.assetCurrentLocation')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.assetCurrentLocationDesc')}
                                                </div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="destMode"
                                                value="other"
                                                checked={destMode === 'other'}
                                                onChange={() => saveDestMode('other')}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.otherLocation')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.otherLocationDesc')}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('options.timelineVisibility')}</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        {t('options.timelineVisibilityDesc')}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="timelineVisibility"
                                                value="owned_only"
                                                defaultChecked={(typeof window !== 'undefined' && localStorage.getItem('maintenanceTimelineVisibilityPolicy') !== 'anytime')}
                                                onChange={() => {
                                                    try {
                                                        localStorage.setItem('maintenanceTimelineVisibilityPolicy', 'owned_only');
                                                        setMessage({ type: 'success', text: t('options.preferenceSaved') });
                                                        setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                    } catch {}
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.ownedOnly')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.ownedOnlyDesc')}
                                                </div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="timelineVisibility"
                                                value="anytime"
                                                defaultChecked={(typeof window !== 'undefined' && localStorage.getItem('maintenanceTimelineVisibilityPolicy') === 'anytime')}
                                                onChange={() => {
                                                    try {
                                                        localStorage.setItem('maintenanceTimelineVisibilityPolicy', 'anytime');
                                                        setMessage({ type: 'success', text: t('options.preferenceSaved') });
                                                        setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                    } catch {}
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.anytime')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.anytimeDesc')}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {message.text && message.type === 'success' && (
                                    <div className="success-message">{message.text}</div>
                                )}
                            </div>
                        )}

                        {activeSection === 'general' && (
                            <div className="empty-state">
                                <p className="empty-state-text">{t('options.general')}...</p>
                            </div>
                        )}

                        {activeSection === 'asset' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 700 }}>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('options.assetMovementsApproval')}</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        {t('options.assetMovementsApprovalDesc')}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="autoAcceptAssetMovements"
                                                value="disabled"
                                                defaultChecked={(typeof window !== 'undefined' && localStorage.getItem('autoAcceptAssetMovements') !== 'enabled')}
                                                onChange={() => {
                                                    try {
                                                        localStorage.setItem('autoAcceptAssetMovements', 'disabled');
                                                        setMessage({ type: 'success', text: t('options.preferenceSaved') });
                                                        setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                    } catch {}
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.disabled')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.disabledDesc')}
                                                </div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="autoAcceptAssetMovements"
                                                value="enabled"
                                                defaultChecked={(typeof window !== 'undefined' && localStorage.getItem('autoAcceptAssetMovements') === 'enabled')}
                                                onChange={async () => {
                                                    // When enabling, ask whether to accept already pending movements
                                                    setShowAutoAcceptConfirm(true);
                                                    setAutoAcceptLoading(true);
                                                    setAutoAcceptEligibleCount(0);
                                                    setAutoAcceptEligibleIds([]);
                                                    try {
                                                        const rows = await movementApprovalService.getPendingAssetMovements();
                                                        const eligible = (Array.isArray(rows) ? rows : []).filter((m) => {
                                                            const r = String(m.movement_reason || '');
                                                            return r === 'return_to_owner'
                                                                || r === 'maintenance_step_return_to_owner'
                                                                || r === 'maintenance_create';
                                                        });
                                                        setAutoAcceptEligibleIds(eligible.map(m => m.asset_movement_id));
                                                        setAutoAcceptEligibleCount(eligible.length);
                                                    } catch {
                                                        setAutoAcceptEligibleIds([]);
                                                        setAutoAcceptEligibleCount(0);
                                                    } finally {
                                                        setAutoAcceptLoading(false);
                                                    }
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.enabled')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.enabledDesc')}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {message.text && message.type === 'success' && (
                                    <div className="success-message">{message.text}</div>
                                )}
                                
                                {showAutoAcceptConfirm && (
                                    <ModalPortal>
                                    <div className="modal-overlay" onClick={() => !autoAcceptSubmitting && setShowAutoAcceptConfirm(false)}>
                                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3 className="modal-title">{t('options.enableAutoAccept')}</h3>
                                                <button className="modal-close" onClick={() => !autoAcceptSubmitting && setShowAutoAcceptConfirm(false)}>
                                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                                {autoAcceptLoading ? (
                                                    <div style={{ color: 'var(--color-text-secondary)' }}>{t('options.loadingPendingMovements')}</div>
                                                ) : (
                                                    <>
                                                        <p style={{ marginBottom: 'var(--space-4)' }}>
                                                            Auto-accept is being enabled. There are {autoAcceptEligibleCount} eligible pending asset movements.
                                                            Do you want to accept them now?
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        if (autoAcceptSubmitting) return;
                                                        try {
                                                            localStorage.setItem('autoAcceptAssetMovements', 'enabled');
                                                            setMessage({ type: 'success', text: t('options.autoAcceptEnabled') });
                                                            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                        } catch {}
                                                        setShowAutoAcceptConfirm(false);
                                                    }}
                                                    disabled={autoAcceptSubmitting}
                                                >
                                                    {t('options.enableOnly')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={async () => {
                                                        if (autoAcceptSubmitting) return;
                                                        setAutoAcceptSubmitting(true);
                                                        try {
                                                            const tasks = (autoAcceptEligibleIds || []).map(id =>
                                                                movementApprovalService.decideAssetMovement(id, 'accepted')
                                                            );
                                                            await Promise.allSettled(tasks);
                                                            localStorage.setItem('autoAcceptAssetMovements', 'enabled');
                                                            setMessage({ type: 'success', text: t('options.autoAcceptEnabledAndAccepted') });
                                                            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                        } catch {
                                                            setMessage({ type: 'error', text: t('options.failedAcceptMovements') });
                                                        } finally {
                                                            setAutoAcceptSubmitting(false);
                                                            setShowAutoAcceptConfirm(false);
                                                        }
                                                    }}
                                                    disabled={autoAcceptLoading || autoAcceptSubmitting}
                                                >
                                                    {t('options.acceptAllNow')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    </ModalPortal>
                                )}
                            </div>
                        )}

                        {activeSection === 'incident' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 700 }}>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('options.incidentCompositionStrategy')}</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        {t('options.incidentCompositionStrategyDesc')}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="incidentCompositionStrategy"
                                                value="all"
                                                checked={incidentCompositionStrategy === 'all'}
                                                onChange={() => saveIncidentCompositionStrategy('all')}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.applyToAllComposing')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.applyToAllComposingDesc')}
                                                </div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="radio"
                                                name="incidentCompositionStrategy"
                                                value="exploitation_decides"
                                                checked={incidentCompositionStrategy === 'exploitation_decides'}
                                                onChange={() => saveIncidentCompositionStrategy('exploitation_decides')}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{t('options.letExploitationDecide')}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {t('options.letExploitationDecideDesc')}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {message.text && message.type === 'success' && (
                                    <div className="success-message">{message.text}</div>
                                )}
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="empty-state">
                                <p className="empty-state-text">{t('options.notifications')}...</p>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 700 }}>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                {powerSaveEnabled ? <ZapOff size={18} style={{ color: 'var(--color-warning)' }} /> : <Zap size={18} style={{ color: 'var(--color-success)' }} />}
                                                {t('options.powerSaveMode')}
                                            </h3>
                                            <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                                {t('options.powerSaveModeDesc')}
                                            </p>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: powerSaveEnabled ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: powerSaveEnabled ? 600 : 400 }}>
                                                {powerSaveEnabled ? t('options.powerSaveOn') : t('options.powerSaveOff')}
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={powerSaveEnabled}
                                                onClick={() => setPowerSaveEnabled(!powerSaveEnabled)}
                                                style={{
                                                    width: 44,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    border: 'none',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    background: powerSaveEnabled ? 'var(--color-accent-primary)' : 'var(--color-border)',
                                                    transition: 'background var(--transition-fast)',
                                                }}
                                            >
                                                <span style={{
                                                    position: 'absolute',
                                                    top: 2,
                                                    left: powerSaveEnabled ? 22 : 2,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    background: 'white',
                                                    transition: 'left var(--transition-fast)',
                                                }} />
                                            </button>
                                        </label>
                                    </div>
                                </div>
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

export default OptionsPage;
