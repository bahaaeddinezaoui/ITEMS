import { useState } from 'react';
import { authService } from '../services/api';

const OptionsPage = () => {
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

    const handleSubmit = async (e) => {
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
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to change password. Please check your old password.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Manage your password and security settings.</p>
            </header>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="card-header">
                    <h2 className="card-title">Change Password</h2>
                </div>
                <div className="card-body">
                    {message.text && (
                        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                            {message.text}
                        </div>
                    )}

                    <form className="form" onSubmit={handleSubmit}>
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
            </div>
        </div>
    );
};

export default OptionsPage;
