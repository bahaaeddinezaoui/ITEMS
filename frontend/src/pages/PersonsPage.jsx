import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authService, personService, roleService, userAccountService } from '../services/api';

const PersonsPage = () => {
    const { t } = useTranslation();
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [selectedPersonForAccount, setSelectedPersonForAccount] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        sex: 'Male',
        birth_date: '',
        is_approved: false,
    });
    const [accountFormData, setAccountFormData] = useState({
        username: '',
        password: '',
        account_status: 'active',
        role_code: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submittingAccount, setSubmittingAccount] = useState(false);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        loadPersons();
        loadRoles();
    }, []);

    const loadPersons = async () => {
        try {
            setLoading(true);
            const data = await personService.getAll();
            setPersons(data);
        } catch {
            setError(t('persons.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const data = await roleService.getAll();
            setRoles(Array.isArray(data) ? data : []);
        } catch {
            setRoles([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAccountInputChange = (e) => {
        const { name, value } = e.target;
        setAccountFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await personService.create(formData);
            setShowModal(false);
            setFormData({
                first_name: '',
                last_name: '',
                sex: 'Male',
                birth_date: '',
                is_approved: false,
            });
            loadPersons();
        } catch {
            setError(t('persons.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateAccountModal = (person) => {
        setSelectedPersonForAccount(person);
        setAccountFormData({
            username: '',
            password: '',
            account_status: 'active',
            role_code: '',
        });
        setShowAccountModal(true);
        setError('');
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPersonForAccount) return;

        setSubmittingAccount(true);
        setError('');

        try {
            await userAccountService.create({
                person_id: selectedPersonForAccount.person_id,
                username: accountFormData.username,
                password: accountFormData.password,
                account_status: accountFormData.account_status,
                role_code: accountFormData.role_code || undefined,
            });
            setShowAccountModal(false);
            setSelectedPersonForAccount(null);
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                t('persons.createAccountError');
            setError(msg);
        } finally {
            setSubmittingAccount(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(t('common.locale') || 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">{t('nav.persons')}</h1>
                <p className="page-subtitle">{t('persons.subtitle')}</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{t('persons.allPersons')}</h2>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        {t('persons.addPerson')}
                    </button>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>{t('persons.loading')}</p>
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <p className="empty-state-title" style={{ color: 'var(--color-error)' }}>{error}</p>
                        </div>
                    ) : persons.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3 className="empty-state-title">{t('persons.noPersons')}</h3>
                            <p className="empty-state-text">{t('persons.getStarted')}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>{t('persons.name')}</th>
                                    <th>{t('persons.sex')}</th>
                                    <th>{t('persons.birthDate')}</th>
                                    <th>{t('common.status')}</th>
                                    {authService.isSuperuser() && <th>{t('common.actions')}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {persons.map((person) => (
                                    <tr key={person.person_id}>
                                        <td>{person.person_id}</td>
                                        <td>
                                            <strong>{person.first_name} {person.last_name}</strong>
                                        </td>
                                        <td>{person.sex}</td>
                                        <td>{formatDate(person.birth_date)}</td>
                                        <td>
                                            <span className={`badge ${person.is_approved ? 'badge-success' : 'badge-warning'}`}>
                                                {person.is_approved ? t('persons.approved') : t('persons.pending')}
                                            </span>
                                        </td>
                                        {authService.isSuperuser() && (
                                            <td>
                                                <button className="btn btn-secondary" onClick={() => openCreateAccountModal(person)}>
                                                    {t('persons.createAccount')}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Person Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{t('persons.addNewPerson')}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="first_name" className="form-label">{t('persons.firstName')}</label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            className="form-input"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="last_name" className="form-label">{t('persons.lastName')}</label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            className="form-input"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="sex" className="form-label">{t('persons.sex')}</label>
                                        <select
                                            id="sex"
                                            name="sex"
                                            className="form-input"
                                            value={formData.sex}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Male">{t('persons.male')}</option>
                                            <option value="Female">{t('persons.female')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="birth_date" className="form-label">{t('persons.birthDate')}</label>
                                        <input
                                            type="date"
                                            id="birth_date"
                                            name="birth_date"
                                            className="form-input"
                                            value={formData.birth_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            name="is_approved"
                                            checked={formData.is_approved}
                                            onChange={handleInputChange}
                                        />
                                        {t('persons.approved')}
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <span className="loading-spinner" />
                                            {t('common.saving')}
                                        </>
                                    ) : (
                                        t('persons.createPerson')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Account Modal */}
            {showAccountModal && (
                <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{t('persons.createAccount')}</h3>
                            <button className="modal-close" onClick={() => setShowAccountModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAccountSubmit}>
                            <div className="modal-body">
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                                    {t('persons.creatingAccountFor')} <strong>{selectedPersonForAccount?.first_name} {selectedPersonForAccount?.last_name}</strong>
                                </p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="username" className="form-label">{t('auth.username')}</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            className="form-input"
                                            value={accountFormData.username}
                                            onChange={handleAccountInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="account_status" className="form-label">{t('persons.accountStatus')}</label>
                                        <select
                                            id="account_status"
                                            name="account_status"
                                            className="form-input"
                                            value={accountFormData.account_status}
                                            onChange={handleAccountInputChange}
                                        >
                                            <option value="active">{t('common.active')}</option>
                                            <option value="disabled">{t('common.inactive')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">{t('auth.password')}</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-input"
                                            value={accountFormData.password}
                                            onChange={handleAccountInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="role_code" className="form-label">{t('persons.roleOptional')}</label>
                                        <select
                                            id="role_code"
                                            name="role_code"
                                            className="form-input"
                                            value={accountFormData.role_code}
                                            onChange={handleAccountInputChange}
                                        >
                                            <option value="">{t('persons.noRole')}</option>
                                            {roles.map((role) => (
                                                <option key={role.role_id} value={role.role_code}>
                                                    {role.role_label} ({role.role_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAccountModal(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submittingAccount}>
                                    {submittingAccount ? (
                                        <>
                                            <span className="loading-spinner" />
                                            {t('common.saving')}
                                        </>
                                    ) : (
                                        t('persons.createAccount')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonsPage;
