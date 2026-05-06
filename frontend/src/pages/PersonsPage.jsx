import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { authService, personService, roleService, userAccountService } from '../services/api';
import { Search, SlidersHorizontal, ArrowUpDown, Plus, X, ChevronDown, UserPlus, Users, ShieldCheck, Edit3 } from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
import TranslatableInput from '../components/TranslatableInput';
import { SkeletonListRows } from '../components/SkeletonCard';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

const PersonsPage = () => {
    const { t, i18n } = useTranslation();
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [selectedPersonForAccount, setSelectedPersonForAccount] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalPerson, setApprovalPerson] = useState(null);
    const [approvalUserAccount, setApprovalUserAccount] = useState(null);
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [approvalSubmitting, setApprovalSubmitting] = useState(false);
    const [approvalError, setApprovalError] = useState('');
    const [approvalEditData, setApprovalEditData] = useState({
        first_name: '', last_name: '', sex: 'Male', birth_date: '', is_approved: false,
    });
    const [approvalEditTranslations, setApprovalEditTranslations] = useState({});
    const [approvalAccountEditData, setApprovalAccountEditData] = useState({
        username: '', account_status: 'active', is_approved: false, role_code: '',
    });
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        sex: 'Male',
        birth_date: '',
        is_approved: false,
    });
    const [formTranslations, setFormTranslations] = useState({});
    const [accountFormData, setAccountFormData] = useState({
        username: '',
        password: '',
        account_status: 'active',
        role_code: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();
    const [submittingAccount, setSubmittingAccount] = useState(false);
    const [roles, setRoles] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterSex, setFilterSex] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        loadPersons();
        loadRoles();
    }, []);

    useEffect(() => {
        if (!showSortMenu) return;
        const handler = () => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

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

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
    };

    const handleEventInputChange = (e) => {
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
            const payload = { ...formData };
            if (Object.keys(formTranslations).length > 0) {
                payload.translations = formTranslations;
            }
            await personService.create(payload);
            setShowModal(false);
            showSuccess(t('persons.createSuccess', 'Person created successfully'));
            setFormTranslations({});
            setFormData({
                first_name: '',
                last_name: '',
                sex: 'Male',
                birth_date: '',
                is_approved: false,
            });
            loadPersons();
        } catch {
            showError(t('persons.createError'));
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
            showSuccess(t('persons.createAccountSuccess', 'Account created successfully'));
            setSelectedPersonForAccount(null);
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                t('persons.createAccountError');
            showError(msg);
        } finally {
            setSubmittingAccount(false);
        }
    };

    const getAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const getInitials = (firstName, lastName) => {
        return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(t('persons.locale') || 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRoleLabel = (roleCode) => {
        if (!roleCode) return null;
        const role = roles.find(r => r.role_code === roleCode);
        return role ? role.role_label : roleCode;
    };

    const filteredPersons = useMemo(() => {
        let result = [...persons];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => {
                const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
                const roleLabel = (getRoleLabel(p.role_code) || '').toLowerCase();
                return fullName.includes(q) || roleLabel.includes(q);
            });
        }

        if (filterSex) {
            result = result.filter(p => p.sex === filterSex);
        }

        if (filterStatus) {
            const isApproved = filterStatus === 'approved';
            result = result.filter(p => p.is_approved === isApproved);
        }

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                cmp = nameA.localeCompare(nameB, i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'birthDate') {
                cmp = new Date(a.birth_date) - new Date(b.birth_date);
            } else if (sortField === 'id') {
                cmp = a.person_id - b.person_id;
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [persons, searchQuery, filterSex, filterStatus, sortField, sortDirection, i18n.language, roles]);

    const hasActiveFilters = searchQuery.trim() || filterSex || filterStatus;

    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterSex('');
        setFilterStatus('');
        setSortField('name');
        setSortDirection('asc');
    };

    const sortOptions = [
        { field: 'name', dir: 'asc', label: `${t('persons.name')} — ${t('persons.ascending')}` },
        { field: 'name', dir: 'desc', label: `${t('persons.name')} — ${t('persons.descending')}` },
        { field: 'birthDate', dir: 'asc', label: `${t('persons.birthDate')} — ${t('persons.ascending')}` },
        { field: 'birthDate', dir: 'desc', label: `${t('persons.birthDate')} — ${t('persons.descending')}` },
        { field: 'id', dir: 'asc', label: `ID — ${t('persons.ascending')}` },
        { field: 'id', dir: 'desc', label: `ID — ${t('persons.descending')}` },
    ];

    const isSuperuser = authService.isSuperuser();

    const openApprovalModal = async (person) => {
        setApprovalPerson(person);
        setApprovalError('');
        setApprovalLoading(true);
        setShowApprovalModal(true);

        setApprovalEditData({
            first_name: person.first_name || '',
            last_name: person.last_name || '',
            sex: person.sex || 'Male',
            birth_date: person.birth_date || '',
            is_approved: person.is_approved || false,
        });
        setApprovalEditTranslations({
            en: { first_name: person.first_name_en || '', last_name: person.last_name_en || '' },
            ar: { first_name: person.first_name_ar || '', last_name: person.last_name_ar || '' },
        });

        try {
            const ua = await userAccountService.getByPersonId(person.person_id);
            setApprovalUserAccount(ua);
            setApprovalAccountEditData({
                username: ua.username || '',
                account_status: ua.account_status || 'active',
                is_approved: ua.is_approved || false,
                role_code: ua.role_code || '',
            });
        } catch {
            setApprovalUserAccount(null);
            setApprovalAccountEditData({
                username: '', account_status: 'active', is_approved: false, role_code: '',
            });
        } finally {
            setApprovalLoading(false);
        }
    };

    const handleApprovalEditChange = (name, value) => {
        setApprovalEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleApprovalTranslationChange = (langCode, value) => {
        setApprovalEditTranslations((prev) => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
    };

    const handleApprovalAccountEditChange = (name, value) => {
        setApprovalAccountEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleApprovalSubmit = async (e) => {
        e.preventDefault();
        if (!approvalPerson) return;
        setApprovalSubmitting(true);
        setApprovalError('');

        try {
            // Update person info
            const personPayload = { ...approvalEditData };
            if (Object.keys(approvalEditTranslations).length > 0) {
                personPayload.translations = approvalEditTranslations;
            }
            await personService.update(approvalPerson.person_id, personPayload);

            // Update user account if exists
            if (approvalUserAccount) {
                await userAccountService.update({
                    person_id: approvalPerson.person_id,
                    username: approvalAccountEditData.username,
                    account_status: approvalAccountEditData.account_status,
                    is_approved: approvalAccountEditData.is_approved,
                    role_code: approvalAccountEditData.role_code || '',
                });
            }

            setShowApprovalModal(false);
            showSuccess(t('persons.approvalSuccess', 'Person approved successfully'));
            setApprovalPerson(null);
            setApprovalUserAccount(null);
            loadPersons();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.detail || t('persons.approvalError');
            showError(msg);
        } finally {
            setApprovalSubmitting(false);
        }
    };

    const stats = useMemo(() => {
        const total = persons.length;
        const approved = persons.filter(p => p.is_approved).length;
        const pending = total - approved;
        const male = persons.filter(p => p.sex === 'Male').length;
        const female = persons.filter(p => p.sex === 'Female').length;
        return { total, approved, pending, male, female };
    }, [persons]);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 'var(--space-5)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap'
            }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', letterSpacing: '-0.02em', margin: 0, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Users size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.persons')}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                        {t('persons.subtitle')}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                    style={{ width: 'auto', whiteSpace: 'nowrap' }}
                >
                    <Plus size={18} />
                    {t('persons.addPerson')}
                </button>
            </div>

            {/* Stats Row */}
            {!loading && !error && persons.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-5)'
                }}>
                    {[
                        { label: t('persons.totalPersons', { count: stats.total }), value: stats.total, color: 'var(--color-accent-primary)' },
                        { label: t('persons.approved'), value: stats.approved, color: 'var(--color-success)' },
                        { label: t('persons.pending'), value: stats.pending, color: 'var(--color-warning)' },
                        { label: t('persons.male'), value: stats.male, color: '#3b82f6' },
                        { label: t('persons.female'), value: stats.female, color: '#ec4899' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-4)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '3px',
                                height: '100%',
                                background: s.color,
                                opacity: 0.8
                            }} />
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results count */}
            {!loading && !error && persons.length > 0 && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontWeight: '600' }}>
                    {t('persons.resultCount', { count: filteredPersons.length })}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={{ padding: 'var(--space-12)' }}>
                    <SkeletonListRows count={8} />
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
            ) : filteredPersons.length === 0 ? (
                <div className="empty-state">
                    <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Users size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('persons.title')}</h1>
                    <p className="empty-state-text">{t('persons.tryDifferentFilters')}</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 'var(--space-4)'
                }}>
                    {filteredPersons.map((person) => {
                        const age = getAge(person.birth_date);
                        const roleLabel = getRoleLabel(person.role_code);
                        const initials = getInitials(person.first_name, person.last_name);
                        const isMale = person.sex === 'Male';

                        return (
                            <div
                                key={person.person_id}
                                style={{
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: 'var(--space-5)',
                                    transition: 'all var(--transition-fast)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.background = 'var(--color-bg-card)';
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Status indicator bar */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: person.is_approved
                                        ? 'var(--color-success)'
                                        : 'var(--color-warning)',
                                    opacity: 0.7
                                }} />

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-full)',
                                        background: isMale
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                            : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '800',
                                        color: 'white',
                                        flexShrink: 0,
                                        position: 'relative'
                                    }}>
                                        {initials}
                                        {/* Gender icon overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: 'var(--radius-full)',
                                            background: 'var(--color-bg-secondary)',
                                            border: '2px solid var(--color-bg-card)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {isMale ? (
                                                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#3b82f6" strokeWidth="3">
                                                    <path d="M18 6l-6 6M18 6v4M18 6h-4" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#ec4899" strokeWidth="3">
                                                    <circle cx="12" cy="12" r="4" />
                                                    <path d="M12 8V2M15 5h-6" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                                                {person.first_name} {person.last_name}
                                            </span>
                                            <span className={`badge ${person.is_approved ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                {person.is_approved ? t('persons.approved') : t('persons.pending')}
                                            </span>
                                        </div>

                                        {/* Meta row - compact, no labels */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            marginTop: 'var(--space-2)',
                                            flexWrap: 'wrap'
                                        }}>
                                            {age !== null && (
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                    {age} {t('persons.yearsOld')}
                                                </span>
                                            )}
                                            {person.birth_date && (
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                    {formatDate(person.birth_date)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Role */}
                                        {roleLabel && (
                                            <div style={{ marginTop: 'var(--space-2)' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-1)',
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    color: 'var(--color-accent-tertiary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontWeight: '600'
                                                }}>
                                                    {roleLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* ID + Action */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                                        <span style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            fontWeight: '700',
                                            fontFamily: 'monospace'
                                        }}>
                                            #{person.person_id}
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                            {isSuperuser && (
                                                <button
                                                    onClick={() => openApprovalModal(person)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 10px',
                                                        border: person.is_approved ? '1px solid var(--color-border)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                        background: person.is_approved ? 'var(--color-bg-card)' : 'rgba(239, 68, 68, 0.08)',
                                                        color: person.is_approved ? 'var(--color-text-secondary)' : 'var(--color-error)',
                                                        borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer',
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: '500',
                                                        transition: 'all var(--transition-fast)',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                                                        e.currentTarget.style.color = 'var(--color-accent-tertiary)';
                                                        e.currentTarget.style.background = 'var(--color-accent-glow)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = person.is_approved ? 'var(--color-border)' : 'rgba(239, 68, 68, 0.3)';
                                                        e.currentTarget.style.color = person.is_approved ? 'var(--color-text-secondary)' : 'var(--color-error)';
                                                        e.currentTarget.style.background = person.is_approved ? 'var(--color-bg-card)' : 'rgba(239, 68, 68, 0.08)';
                                                    }}
                                                >
                                                    <ShieldCheck size={12} />
                                                    {person.is_approved ? t('persons.reviewPerson') : t('persons.reviewAndApprove')}
                                                </button>
                                            )}
                                            {isSuperuser && (
                                                <button
                                                    onClick={() => openCreateAccountModal(person)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 10px',
                                                        border: '1px solid var(--color-border)',
                                                        background: 'var(--color-bg-card)',
                                                        color: 'var(--color-text-secondary)',
                                                        borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer',
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: '500',
                                                        transition: 'all var(--transition-fast)',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                                                        e.currentTarget.style.color = 'var(--color-accent-tertiary)';
                                                        e.currentTarget.style.background = 'var(--color-accent-glow)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                        e.currentTarget.style.background = 'var(--color-bg-card)';
                                                    }}
                                                >
                                                    <UserPlus size={12} />
                                                    {t('persons.createAccount')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <div className="form-row">
                                    <div className="form-group">
                                        <TranslatableInput
                                            label={t('persons.firstName')}
                                            baseFieldName="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.first_name || '']))}
                                            onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { first_name: value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <TranslatableInput
                                            label={t('persons.lastName')}
                                            baseFieldName="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.last_name || '']))}
                                            onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { last_name: value })}
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
                                            onChange={handleEventInputChange}
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
                                            onChange={handleEventInputChange}
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
                                            onChange={handleEventInputChange}
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
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
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

            {/* Review & Approve Modal */}
            {showApprovalModal && (
                <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px' }}>
                        {/* Header */}
                        <div className="modal-header" style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: 'var(--shadow-glow)',
                                }}>
                                    <ShieldCheck size={18} color="white" />
                                </div>
                                <div>
                                    <h3 className="modal-title" style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
                                        {t('persons.reviewAndApprove')}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                                        {approvalPerson && `#${approvalPerson.person_id} — ${approvalPerson.first_name} ${approvalPerson.last_name}`}
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowApprovalModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {approvalLoading ? (
                            <div className="modal-body" style={{ padding: 'var(--space-10)' }}>
                                <SkeletonListRows count={4} />
                            </div>
                        ) : (
                            <form onSubmit={handleApprovalSubmit}>
                                <div className="modal-body" style={{ padding: 'var(--space-5)' }}>
                                    <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                    {approvalError && (
                                        <div style={{
                                            padding: 'var(--space-3) var(--space-4)',
                                            background: 'rgba(239, 68, 68, 0.08)',
                                            border: '1px solid rgba(239, 68, 68, 0.25)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--color-error)',
                                            fontSize: 'var(--font-size-sm)',
                                            marginBottom: 'var(--space-4)',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                        }}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            {approvalError}
                                        </div>
                                    )}

                                    {/* Two-column layout */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: approvalUserAccount ? '1fr 1fr' : '1fr',
                                        gap: 'var(--space-5)',
                                    }}>
                                        {/* LEFT COLUMN — Person Information */}
                                        <div style={{
                                            background: 'var(--color-bg-card)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                        }}>
                                            {/* Section header */}
                                            <div style={{
                                                padding: 'var(--space-3) var(--space-4)',
                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
                                                borderBottom: '1px solid var(--color-border)',
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            }}>
                                                <div style={{
                                                    width: '28px', height: '28px',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Edit3 size={14} style={{ color: '#3b82f6' }} />
                                                </div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                    {t('persons.personInfo')}
                                                </span>
                                            </div>

                                            {/* Section body */}
                                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <TranslatableInput
                                                        label={t('persons.firstName')}
                                                        baseFieldName="first_name"
                                                        value={approvalEditData.first_name}
                                                        onChange={handleApprovalEditChange}
                                                        translations={Object.fromEntries(Object.entries(approvalEditTranslations).map(([k, v]) => [k, v.first_name || '']))}
                                                        onTranslationChange={(langCode, value) => handleApprovalTranslationChange(langCode, { first_name: value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <TranslatableInput
                                                        label={t('persons.lastName')}
                                                        baseFieldName="last_name"
                                                        value={approvalEditData.last_name}
                                                        onChange={handleApprovalEditChange}
                                                        translations={Object.fromEntries(Object.entries(approvalEditTranslations).map(([k, v]) => [k, v.last_name || '']))}
                                                        onTranslationChange={(langCode, value) => handleApprovalTranslationChange(langCode, { last_name: value })}
                                                        required
                                                    />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                                    <div className="form-group" style={{ margin: 0 }}>
                                                        <label className="form-label">{t('persons.sex')}</label>
                                                        <select
                                                            className="form-input"
                                                            value={approvalEditData.sex}
                                                            onChange={(e) => handleApprovalEditChange('sex', e.target.value)}
                                                            required
                                                        >
                                                            <option value="Male">{t('persons.male')}</option>
                                                            <option value="Female">{t('persons.female')}</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ margin: 0 }}>
                                                        <label className="form-label">{t('persons.birthDate')}</label>
                                                        <input
                                                            type="date"
                                                            className="form-input"
                                                            value={approvalEditData.birth_date}
                                                            onChange={(e) => handleApprovalEditChange('birth_date', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Approval toggle */}
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    background: approvalEditData.is_approved
                                                        ? 'rgba(34, 197, 94, 0.08)'
                                                        : 'rgba(245, 158, 11, 0.08)',
                                                    border: approvalEditData.is_approved
                                                        ? '1px solid rgba(34, 197, 94, 0.25)'
                                                        : '1px solid rgba(245, 158, 11, 0.25)',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginTop: 'var(--space-1)',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        {approvalEditData.is_approved ? (
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                                            </svg>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                                            </svg>
                                                        )}
                                                        <span style={{
                                                            fontSize: 'var(--font-size-sm)',
                                                            fontWeight: '600',
                                                            color: approvalEditData.is_approved ? '#22c55e' : '#f59e0b',
                                                        }}>
                                                            {approvalEditData.is_approved ? t('persons.approved') : t('persons.pending')}
                                                        </span>
                                                    </div>
                                                    <label style={{
                                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                        cursor: 'pointer', fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--color-text-secondary)', fontWeight: '500',
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={approvalEditData.is_approved}
                                                            onChange={(e) => handleApprovalEditChange('is_approved', e.target.checked)}
                                                            style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent-primary)' }}
                                                        />
                                                        {t('persons.isApproved')}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN — User Account Information */}
                                        {approvalUserAccount ? (
                                            <div style={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-lg)',
                                                overflow: 'hidden',
                                            }}>
                                                {/* Section header */}
                                                <div style={{
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                                    borderBottom: '1px solid var(--color-border)',
                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                }}>
                                                    <div style={{
                                                        width: '28px', height: '28px',
                                                        borderRadius: 'var(--radius-md)',
                                                        background: 'rgba(139, 92, 246, 0.15)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Users size={14} style={{ color: '#8b5cf6' }} />
                                                    </div>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                        {t('persons.accountInfo')}
                                                    </span>
                                                </div>

                                                {/* Section body */}
                                                <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                                    <div className="form-group" style={{ margin: 0 }}>
                                                        <label className="form-label">{t('auth.username')}</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={approvalAccountEditData.username}
                                                            onChange={(e) => handleApprovalAccountEditChange('username', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                                        <div className="form-group" style={{ margin: 0 }}>
                                                            <label className="form-label">{t('persons.accountStatus')}</label>
                                                            <select
                                                                className="form-input"
                                                                value={approvalAccountEditData.account_status}
                                                                onChange={(e) => handleApprovalAccountEditChange('account_status', e.target.value)}
                                                            >
                                                                <option value="active">{t('common.active')}</option>
                                                                <option value="pending_approval">{t('persons.pendingApproval')}</option>
                                                                <option value="disabled">{t('common.inactive')}</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group" style={{ margin: 0 }}>
                                                            <label className="form-label">{t('persons.roleOptional')}</label>
                                                            <select
                                                                className="form-input"
                                                                value={approvalAccountEditData.role_code}
                                                                onChange={(e) => handleApprovalAccountEditChange('role_code', e.target.value)}
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

                                                    {/* Account approval toggle */}
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: 'var(--space-3) var(--space-4)',
                                                        background: approvalAccountEditData.is_approved
                                                            ? 'rgba(34, 197, 94, 0.08)'
                                                            : 'rgba(245, 158, 11, 0.08)',
                                                        border: approvalAccountEditData.is_approved
                                                            ? '1px solid rgba(34, 197, 94, 0.25)'
                                                            : '1px solid rgba(245, 158, 11, 0.25)',
                                                        borderRadius: 'var(--radius-md)',
                                                        marginTop: 'var(--space-1)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            {approvalAccountEditData.is_approved ? (
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                                                </svg>
                                                            ) : (
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                                                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                                                </svg>
                                                            )}
                                                            <span style={{
                                                                fontSize: 'var(--font-size-sm)',
                                                                fontWeight: '600',
                                                                color: approvalAccountEditData.is_approved ? '#22c55e' : '#f59e0b',
                                                            }}>
                                                                {approvalAccountEditData.is_approved ? t('persons.approved') : t('persons.pending')}
                                                            </span>
                                                        </div>
                                                        <label style={{
                                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                            cursor: 'pointer', fontSize: 'var(--font-size-xs)',
                                                            color: 'var(--color-text-secondary)', fontWeight: '500',
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={approvalAccountEditData.is_approved}
                                                                disabled={!approvalEditData.is_approved && !approvalAccountEditData.is_approved}
                                                                onChange={(e) => {
                                                                    if (!approvalEditData.is_approved && e.target.checked) {
                                                                        setApprovalError(t('persons.approvePersonBeforeAccount', 'Approve the person before approving the user account.'));
                                                                        return;
                                                                    }
                                                                    handleApprovalAccountEditChange('is_approved', e.target.checked);
                                                                }}
                                                                style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent-primary)' }}
                                                            />
                                                            {t('persons.accountApproved')}
                                                        </label>
                                                    </div>
                                                    {!approvalEditData.is_approved && (
                                                        <div style={{
                                                            marginTop: '6px',
                                                            fontSize: 'var(--font-size-xs)',
                                                            color: 'var(--color-text-muted)',
                                                        }}>
                                                            {t('persons.approvePersonBeforeAccount', 'Approve the person before approving the user account.')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            /* No account — placeholder card */
                                            <div style={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px dashed var(--color-border)',
                                                borderRadius: 'var(--radius-lg)',
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center',
                                                padding: 'var(--space-8)',
                                                gap: 'var(--space-3)',
                                                minHeight: '200px',
                                            }}>
                                                <div style={{
                                                    width: '48px', height: '48px',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Users size={22} style={{ color: '#f59e0b' }} />
                                                </div>
                                                <p style={{
                                                    fontSize: 'var(--font-size-sm)', fontWeight: '600',
                                                    color: 'var(--color-text-secondary)', textAlign: 'center', margin: 0,
                                                }}>
                                                    {t('persons.noAccountForPerson')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer" style={{
                                    padding: 'var(--space-4) var(--space-5)',
                                }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={approvalSubmitting} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        {approvalSubmitting ? (
                                            <>
                                                <span className="loading-spinner" />
                                                {t('common.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={16} />
                                                {t('persons.saveAndApprove')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            <FilterSortFAB hasActiveFilters={hasActiveFilters}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('persons.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '40px', paddingLeft: 'var(--space-10)', paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)' }} />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        )}
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('persons.allSexes')}</label>
                        <select value={filterSex} onChange={(e) => setFilterSex(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('persons.allSexes')}</option>
                            <option value="Male">{t('persons.male')}</option>
                            <option value="Female">{t('persons.female')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('persons.allStatuses')}</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('persons.allStatuses')}</option>
                            <option value="approved">{t('persons.approved')}</option>
                            <option value="pending">{t('persons.pending')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('common.sortBy')}</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <select className="form-input" value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ height: '40px', flex: 1 }}>
                                <option value="name">{t('persons.name')}</option>
                                <option value="birthDate">{t('persons.birthDate')}</option>
                                <option value="id">ID</option>
                            </select>
                            <select className="form-input" value={sortDirection} onChange={(e) => setSortDirection(e.target.value)} style={{ height: '40px', width: '100px' }}>
                                <option value="asc">↑ {t('persons.ascending')}</option>
                                <option value="desc">↓ {t('persons.descending')}</option>
                            </select>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: '500', whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('persons.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </div>
    );
};

export default PersonsPage;
