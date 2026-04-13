import { useEffect, useMemo, useState } from 'react';
import { authService, movementApprovalService, userSessionService, authenticationLogService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Monitor, Smartphone, Globe, XCircle, Clock, Shield, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

const INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY = 'incidentReportCompositionStatusStrategy';

const OptionsPage = () => {
    const { user, isSuperuser } = useAuth();
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
    const [showPasswordForm, setShowPasswordForm] = useState(false);
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

    const handleTerminate = async (sessionId) => {
        try {
            if (!window.confirm('Are you sure you want to terminate this session? You will be logged out from that device.')) return;
            await userSessionService.terminate(sessionId);
            setMessage({ type: 'success', text: 'Session terminated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            fetchSessions();
        } catch (error) {
            console.error('Error terminating session:', error);
            setMessage({ type: 'error', text: 'Failed to terminate session' });
        }
    };

    const saveDestMode = (mode) => {
        setDestMode(mode);
        try {
            localStorage.setItem('maintenanceCreateDestinationMode', mode);
            setMessage({ type: 'success', text: 'Preference saved' });
            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
        } catch {
            // no-op
        }
    };

    const saveIncidentCompositionStrategy = (strategy) => {
        setIncidentCompositionStrategy(strategy);
        try {
            localStorage.setItem(INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY, strategy);
            setMessage({ type: 'success', text: 'Preference saved' });
            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
        } catch {
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(formData.oldPassword, formData.newPassword);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to change password. Please check your old password.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        ...(isSuperuser || isMaintenanceTech || isMaintenanceChief ? [{ id: 'maintenance', label: 'Maintenance', icon: '🧰' }] : []),
        ...(isSuperuser || isAssetResponsible ? [{ id: 'asset', label: 'Asset', icon: '📦' }] : []),
        ...(isSuperuser || isItBureauChief ? [{ id: 'incident', label: 'Incident Reports', icon: '📝' }] : []),
    ];

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your account preferences and security.</p>
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
                            {sections.find(s => s.id === activeSection)?.label} Settings
                        </h2>
                    </div>
                    <div className="card-body">
                        {activeSection === 'security' && (
                            <div style={{ width: '100%' }}>
                                {!showPasswordForm ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                            <div>
                                                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600' }}>Password</h3>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Update your password to keep your account secure.</p>
                                            </div>
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setShowPasswordForm(true);
                                                    setMessage({ type: '', text: '' });
                                                }}
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                        {message.text && message.type === 'success' && (
                                            <div className="success-message" style={{ maxWidth: '600px' }}>
                                                {message.text}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ maxWidth: '600px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600' }}>
                                                Change Password
                                            </h3>
                                            <button 
                                                className="btn btn-secondary" 
                                                onClick={() => setShowPasswordForm(false)}
                                                style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        
                                        {message.text && (
                                            <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                                                {message.text}
                                            </div>
                                        )}

                                        <form className="form" onSubmit={handleSubmitPassword}>
                                            <div className="form-group">
                                                <label className="form-label">Old Password</label>
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
                                                <label className="form-label">New Password</label>
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
                                                <label className="form-label">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    className="form-input"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-actions" style={{ marginTop: 'var(--space-6)' }}>
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Sessions & Logs Section */}
                                <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                                    {/* Active Sessions */}
                                    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <Monitor size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                                Active Sessions
                                            </h3>
                                            <span style={{ 
                                                fontSize: 'var(--font-size-xs)', 
                                                fontWeight: '700', 
                                                padding: 'var(--space-1) var(--space-3)', 
                                                background: 'var(--color-accent-glow)', 
                                                color: 'var(--color-accent-tertiary)', 
                                                borderRadius: 'var(--radius-full)' 
                                            }}>
                                                {sessions.length} Devices
                                            </span>
                                        </div>

                                        <div style={{ 
                                            background: 'var(--color-bg-secondary)', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: '1px solid var(--color-border)', 
                                            overflow: 'hidden'
                                        }}>
                                            {sessionsLoading ? (
                                                <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading sessions...</div>
                                            ) : sessions.map((session, idx) => (
                                                <div key={session.session_id} style={{ 
                                                    padding: 'var(--space-4)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    borderBottom: idx === sessions.length - 1 ? 'none' : '1px solid var(--color-border)',
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
                                                                        Current
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
                                                <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No other active sessions found.</div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Access History */}
                                    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <Globe size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                            Access History
                                        </h3>
                                        <div style={{ 
                                            background: 'var(--color-bg-secondary)', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: '1px solid var(--color-border)', 
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
                                                        <tr>
                                                            <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'left' }}>Event</th>
                                                            <th style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'right' }}>Timestamp</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {logs.slice(0, 10).map((log, idx) => (
                                                            <tr key={log.log_id} style={{ 
                                                                borderBottom: idx === Math.min(logs.length, 10) - 1 ? 'none' : '1px solid var(--color-border)'
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
                                                                    No activity logs found.
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
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>Create Maintenance defaults</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        Choose the default destination location when creating a maintenance.
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
                                                <div style={{ fontWeight: 600 }}>Maintenance room</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Move asset to a maintenance room. You will be asked to choose the room if needed.
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
                                                <div style={{ fontWeight: 600 }}>Asset current location</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Do not move the asset; perform maintenance where it currently resides.
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
                                                <div style={{ fontWeight: 600 }}>Other location</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Choose any location (not limited to maintenance rooms).
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>Users' Maintenance Timeline visibility</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        Control whether users can view the full maintenance history of an asset in My Items.
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
                                                        setMessage({ type: 'success', text: 'Visibility preference saved' });
                                                        setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                    } catch {}
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>Owned only</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Users see maintenance history only for assets they have been assigned to.
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
                                                        setMessage({ type: 'success', text: 'Visibility preference saved' });
                                                        setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                    } catch {}
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>Anytime</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Users can view the maintenance history of the selected asset at any time.
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
                                <p className="empty-state-text">General settings will appear here.</p>
                            </div>
                        )}

                        {activeSection === 'asset' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 700 }}>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>Asset Movements Approval</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        Automatically accept pending asset movements (for asset responsible).
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
                                                        setMessage({ type: 'success', text: 'Preference saved' });
                                                        setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                    } catch {}
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>Disabled</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Review and accept/reject movements manually.
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
                                                                || r === 'maintenance_create'
                                                                || r === 'Maintenance'
                                                                || r.startsWith('maintenance_create_');
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
                                                <div style={{ fontWeight: 600 }}>Enabled</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Automatically accept all pending asset movements when loading approvals.
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {message.text && message.type === 'success' && (
                                    <div className="success-message">{message.text}</div>
                                )}
                                
                                {showAutoAcceptConfirm && (
                                    <div className="modal-overlay" onClick={() => !autoAcceptSubmitting && setShowAutoAcceptConfirm(false)}>
                                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3 className="modal-title">Enable Auto-Accept</h3>
                                                <button className="modal-close" onClick={() => !autoAcceptSubmitting && setShowAutoAcceptConfirm(false)}>
                                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                {autoAcceptLoading ? (
                                                    <div style={{ color: 'var(--color-text-secondary)' }}>Loading pending movements...</div>
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
                                                            setMessage({ type: 'success', text: 'Auto-accept enabled' });
                                                            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                        } catch {}
                                                        setShowAutoAcceptConfirm(false);
                                                    }}
                                                    disabled={autoAcceptSubmitting}
                                                >
                                                    Enable Only
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
                                                            setMessage({ type: 'success', text: 'Auto-accept enabled and pending movements accepted' });
                                                            setTimeout(() => setMessage({ type: '', text: '' }), 1500);
                                                        } catch {
                                                            setMessage({ type: 'error', text: 'Failed to accept pending movements' });
                                                        } finally {
                                                            setAutoAcceptSubmitting(false);
                                                            setShowAutoAcceptConfirm(false);
                                                        }
                                                    }}
                                                    disabled={autoAcceptLoading || autoAcceptSubmitting}
                                                >
                                                    Accept All Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'incident' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 700 }}>
                                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>Incident report composition strategy</h3>
                                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                        Choose the default behavior for composing stock items and consumables when creating an incident report.
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
                                                <div style={{ fontWeight: 600 }}>Apply to all composing items</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Stock items and consumables composing the asset are all set to the asset status.
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
                                                <div style={{ fontWeight: 600 }}>Let exploitation chief decide per item</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Exploitation chief chooses which composing items receive the incident status during review.
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
                                <p className="empty-state-text">Notification preferences will appear here.</p>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="empty-state">
                                <p className="empty-state-text">Theme and appearance settings will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionsPage;
