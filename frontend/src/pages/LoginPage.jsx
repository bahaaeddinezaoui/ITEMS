import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            ),
            title: t('landing.assetTrackingTitle'),
            description: t('landing.assetTrackingDesc'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
            ),
            title: t('landing.maintenanceSchedulingTitle'),
            description: t('landing.maintenanceSchedulingDesc'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            title: t('landing.teamCollaborationTitle'),
            description: t('landing.teamCollaborationDesc'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                    <path d="M22 12A10 10 0 0 0 12 2"/>
                    <path d="M22 12h-4.12"/>
                    <path d="M22 12l-3-3"/>
                    <path d="M22 12l3-3"/>
                </svg>
            ),
            title: t('landing.realTimeUpdatesTitle'),
            description: t('landing.realTimeUpdatesDesc'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
            ),
            title: t('landing.detailedReportsTitle'),
            description: t('landing.detailedReportsDesc'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            ),
            title: t('landing.secureAccessTitle'),
            description: t('landing.secureAccessDesc'),
        },
    ];

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shouldShake, setShouldShake] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Auto-scroll feature ticker
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const getLoginErrorMessage = (err) => {
        const status = err?.response?.status;

        if (status === 401 || status === 400) {
            return t('auth.invalidCredentials');
        }

        const apiError = err?.response?.data?.error;
        if (typeof apiError === 'string' && apiError.trim()) {
            return apiError;
        }

        return t('messages.operationFailed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShouldShake(false);
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = getLoginErrorMessage(err);
            setError(errorMessage);
            if (errorMessage === t('auth.invalidCredentials')) {
                setShouldShake(true);
                setTimeout(() => setShouldShake(false), 500);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Side - Login Form */}
            <div className="login-left">
                <div className="login-container">
                    <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h1 className="login-title">{t('app.title')}</h1>
                        <p className="login-subtitle">{t('auth.login')}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className={`error-message ${shouldShake ? 'shake' : ''}`}>{error}</div>}

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                {t('auth.username')}
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="form-input"
                                placeholder={t('auth.username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                {t('auth.password')}
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="form-input"
                                    placeholder={t('auth.password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" />
                                    {t('common.loading')}
                                </>
                            ) : (
                                t('auth.login')
                            )}
                        </button>
                    </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Feature Carousel */}
            <div className="login-right">
                <div className="feature-carousel">
                    <div className="feature-header">
                        <h2>{t('landing.whyChoose')}</h2>
                        <p>{t('landing.discoverFeatures')}</p>
                    </div>
                    <div className="feature-ticker">
                        <div
                            className="feature-ticker-track"
                            style={{ transform: `translateY(-${currentIndex * 136}px)` }}
                        >
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`feature-item ${index === currentIndex ? 'active' : ''}`}
                                >
                                    <div className="feature-icon">{feature.icon}</div>
                                    <div className="feature-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="feature-indicators">
                        {features.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to feature ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
