import { useState } from 'react';
import { authService } from '../services/api';

const OptionsPage = () => {
    const [activeSection, setActiveSection] = useState('security');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                            </div>
                        )}

                        {activeSection === 'general' && (
                            <div className="empty-state">
                                <p className="empty-state-text">General settings will appear here.</p>
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
