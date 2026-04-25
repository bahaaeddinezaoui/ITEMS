import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { SkeletonCardList } from '../components/SkeletonCard';
import {
    Eye, EyeOff, Check, X, UserPlus,
    User, Building2, Shield, ArrowLeft, ArrowRight,
} from 'lucide-react';

const STEPS = [
    { key: 'personal', icon: User },
    { key: 'assignment', icon: Building2 },
    { key: 'credentials', icon: Shield },
];

const SignupPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        first_name_en: '',
        first_name_ar: '',
        last_name_en: '',
        last_name_ar: '',
        sex: 'Male',
        birth_date: '',
        username: '',
        password: '',
        confirmPassword: '',
        role_code: '',
        position_id: '',
        organizational_structure_id: '',
        location_id: '',
        employment_type: '',
    });

    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [orgStructures, setOrgStructures] = useState([]);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadDropdownData();
    }, [i18n.language]);

    const loadDropdownData = async () => {
        try {
            const lang = i18n.language === 'ar' ? 'ar' : 'en';
            const data = await authService.getSignupDropdowns(lang);
            setRoles(Array.isArray(data.roles) ? data.roles : []);
            setPositions(Array.isArray(data.positions) ? data.positions : []);
            setOrgStructures(Array.isArray(data.organizational_structures) ? data.organizational_structures : []);
            setLocations(Array.isArray(data.locations) ? data.locations : []);
        } catch {
            // Dropdown data loading failed, non-critical
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const passwordChecks = [
        { label: t('signup.passwordMinLength'), met: formData.password.length >= 8 },
        { label: t('signup.passwordUppercase'), met: /[A-Z]/.test(formData.password) },
        { label: t('signup.passwordLowercase'), met: /[a-z]/.test(formData.password) },
        { label: t('signup.passwordDigit'), met: /\d/.test(formData.password) },
        { label: t('signup.passwordSpecial'), met: /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>?`~]/.test(formData.password) },
    ];

    const allPasswordChecksMet = passwordChecks.every((c) => c.met);

    const validateStep = (step) => {
        if (step === 0) {
            if (!formData.first_name_en || !formData.last_name_en || !formData.first_name_ar || !formData.last_name_ar || !formData.birth_date) {
                setError(t('signup.fillAllFields'));
                return false;
            }
        }
        if (step === 1) {
            // Assignment fields are optional, no validation needed
        }
        if (step === 2) {
            if (!formData.username || !formData.password || !formData.confirmPassword) {
                setError(t('signup.fillAllFields'));
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError(t('signup.passwordsMismatch'));
                return false;
            }
            if (!allPasswordChecksMet) {
                setError(t('signup.passwordNotStrong'));
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setError('');
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            const payload = {
                first_name: formData.first_name_en,
                last_name: formData.last_name_en,
                first_name_en: formData.first_name_en,
                first_name_ar: formData.first_name_ar,
                last_name_en: formData.last_name_en,
                last_name_ar: formData.last_name_ar,
                sex: formData.sex,
                birth_date: formData.birth_date,
                username: formData.username,
                password: formData.password,
                role_code: formData.role_code || undefined,
                position_id: formData.position_id || undefined,
                organizational_structure_id: formData.organizational_structure_id || undefined,
                location_id: formData.location_id || undefined,
                employment_type: formData.employment_type || undefined,
            };

            await authService.signup(payload);
            setSuccess(true);
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                t('signup.signupFailed');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                    <SkeletonCardList count={4} cardLines={2} />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="signup-page">
                <div className="login-lang-switcher">
                    <LanguageSwitcher />
                </div>
                <div className="signup-left">
                    <div className="signup-container">
                        <div className="signup-card">
                            <div className="signup-success-icon">
                                <Check size={32} strokeWidth={2.5} />
                            </div>
                            <h1 className="signup-title">{t('signup.successTitle')}</h1>
                            <p className="signup-subtitle">{t('signup.successMessage')}</p>
                            <button
                                className="btn btn-primary signup-submit-btn"
                                onClick={() => navigate('/login')}
                            >
                                {t('signup.goToLogin')}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="signup-right">
                    <div className="signup-brand">
                        <h2>{t('app.title')}</h2>
                    </div>
                </div>
            </div>
        );
    }

    const renderStepIndicator = () => (
        <div className="signup-steps">
            {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                    <div key={step.key} className="signup-step-item">
                        <button
                            type="button"
                            className={`signup-step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            onClick={() => { if (isCompleted) { setError(''); setCurrentStep(index); } }}
                            disabled={!isCompleted && !isActive}
                        >
                            {isCompleted ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                        </button>
                        <span className={`signup-step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            {t(`signup.step${step.key.charAt(0).toUpperCase()}${step.key.slice(1)}`)}
                        </span>
                        {index < STEPS.length - 1 && (
                            <div className={`signup-step-line ${isCompleted ? 'completed' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderPersonalStep = () => (
        <div className="signup-step-content">
            <div className="signup-section-header">
                <User size={18} className="signup-section-icon" />
                <div>
                    <h3 className="signup-section-title">{t('signup.stepPersonal')}</h3>
                    <p className="signup-section-desc">{t('signup.personalDesc')}</p>
                </div>
            </div>

            <div className="signup-field-grid">
                <div className="form-group">
                    <label className="form-label">{t('signup.firstNameEn')}</label>
                    <input
                        type="text"
                        name="first_name_en"
                        className="form-input"
                        value={formData.first_name_en}
                        onChange={handleChange}
                        placeholder={t('signup.firstNameEnPlaceholder')}
                        required
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('signup.firstNameAr')}</label>
                    <input
                        type="text"
                        name="first_name_ar"
                        className="form-input"
                        value={formData.first_name_ar}
                        onChange={handleChange}
                        dir="rtl"
                        placeholder={t('signup.firstNameArPlaceholder')}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('signup.lastNameEn')}</label>
                    <input
                        type="text"
                        name="last_name_en"
                        className="form-input"
                        value={formData.last_name_en}
                        onChange={handleChange}
                        placeholder={t('signup.lastNameEnPlaceholder')}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('signup.lastNameAr')}</label>
                    <input
                        type="text"
                        name="last_name_ar"
                        className="form-input"
                        value={formData.last_name_ar}
                        onChange={handleChange}
                        dir="rtl"
                        placeholder={t('signup.lastNameArPlaceholder')}
                        required
                    />
                </div>
            </div>

            <div className="signup-field-grid">
                <div className="form-group">
                    <label className="form-label">{t('signup.sex')}</label>
                    <select
                        name="sex"
                        className="form-input"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                    >
                        <option value="Male">{t('signup.male')}</option>
                        <option value="Female">{t('signup.female')}</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">{t('signup.birthDate')}</label>
                    <input
                        type="date"
                        name="birth_date"
                        className="form-input"
                        value={formData.birth_date}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
    );

    const renderAssignmentStep = () => (
        <div className="signup-step-content">
            <div className="signup-section-header">
                <Building2 size={18} className="signup-section-icon" />
                <div>
                    <h3 className="signup-section-title">{t('signup.stepAssignment')}</h3>
                    <p className="signup-section-desc">{t('signup.assignmentDesc')}</p>
                </div>
            </div>

            <div className="signup-field-grid">
                <div className="form-group">
                    <label className="form-label">{t('signup.position')}</label>
                    <select
                        name="position_id"
                        className="form-input"
                        value={formData.position_id}
                        onChange={handleChange}
                    >
                        <option value="">{t('signup.selectPosition')}</option>
                        {positions.map((p) => (
                            <option key={p.position_id} value={p.position_id}>
                                {p.position_label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">{t('signup.employmentType')}</label>
                    <input
                        type="text"
                        name="employment_type"
                        className="form-input"
                        value={formData.employment_type}
                        onChange={handleChange}
                        placeholder={t('signup.employmentTypePlaceholder')}
                    />
                </div>
            </div>

            <div className="signup-field-grid">
                <div className="form-group">
                    <label className="form-label">{t('signup.role')}</label>
                    <select
                        name="role_code"
                        className="form-input"
                        value={formData.role_code}
                        onChange={handleChange}
                    >
                        <option value="">{t('signup.selectRole')}</option>
                        {roles.map((r) => (
                            <option key={r.role_id} value={r.role_code}>
                                {r.role_label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">{t('signup.orgStructure')}</label>
                    <select
                        name="organizational_structure_id"
                        className="form-input"
                        value={formData.organizational_structure_id}
                        onChange={handleChange}
                    >
                        <option value="">{t('signup.selectOrgStructure')}</option>
                        {orgStructures.map((o) => (
                            <option key={o.organizational_structure_id} value={o.organizational_structure_id}>
                                {o.structure_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">{t('signup.location')}</label>
                <select
                    name="location_id"
                    className="form-input"
                    value={formData.location_id}
                    onChange={handleChange}
                >
                    <option value="">{t('signup.selectLocation')}</option>
                    {locations.map((l) => (
                        <option key={l.location_id} value={l.location_id}>
                            {l.location_name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderCredentialsStep = () => (
        <div className="signup-step-content">
            <div className="signup-section-header">
                <Shield size={18} className="signup-section-icon" />
                <div>
                    <h3 className="signup-section-title">{t('signup.stepCredentials')}</h3>
                    <p className="signup-section-desc">{t('signup.credentialsDesc')}</p>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">{t('auth.username')}</label>
                <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t('auth.username')}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <div className="password-input-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-input"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {formData.password && (
                    <div className="signup-password-checks">
                        {passwordChecks.map((check, i) => (
                            <div key={i} className={`signup-password-check ${check.met ? 'met' : 'unmet'}`}>
                                {check.met ? <Check size={12} /> : <X size={12} />}
                                <span>{check.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">{t('signup.confirmPassword')}</label>
                <div className="password-input-container">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div className="signup-password-mismatch">
                        {t('signup.passwordsMismatch')}
                    </div>
                )}
            </div>
        </div>
    );

    const stepRenderers = [renderPersonalStep, renderAssignmentStep, renderCredentialsStep];
    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <div className="signup-page">
            <div className="login-lang-switcher">
                <LanguageSwitcher />
            </div>

            <div className="signup-left">
                <div className="signup-container">
                    <div className="signup-card">
                        <div className="signup-header">
                            <div className="signup-logo">
                                <UserPlus size={24} color="white" />
                            </div>
                            <div>
                                <h1 className="signup-title">{t('signup.title')}</h1>
                                <p className="signup-subtitle">{t('signup.subtitle')}</p>
                            </div>
                        </div>

                        {renderStepIndicator()}

                        <form onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                            {error && <div className="error-message">{error}</div>}

                            {stepRenderers[currentStep]()}

                            <div className="signup-actions">
                                {currentStep > 0 && (
                                    <button
                                        type="button"
                                        className="signup-back-btn"
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft size={16} />
                                        {t('signup.back')}
                                    </button>
                                )}
                                {isLastStep ? (
                                    <button
                                        type="submit"
                                        className="btn btn-primary signup-submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loading-spinner" />
                                                {t('common.loading')}
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                {t('signup.submit')}
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-primary signup-submit-btn"
                                        onClick={handleNext}
                                    >
                                        {t('signup.next')}
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="signup-footer">
                            <button
                                type="button"
                                className="signup-login-link"
                                onClick={() => navigate('/login')}
                            >
                                {t('signup.alreadyHaveAccount')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="signup-right">
                <div className="signup-brand">
                    <div className="signup-brand-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h2>{t('app.title')}</h2>
                    <p>{t('signup.infoMessage')}</p>
                </div>
                <div className="signup-decoration">
                    <div className="signup-orb signup-orb-1" />
                    <div className="signup-orb signup-orb-2" />
                    <div className="signup-orb signup-orb-3" />
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
