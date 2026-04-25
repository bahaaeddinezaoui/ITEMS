import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonListRows } from '../components/SkeletonCard';
import { authService } from '../services/api';
import { UserCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const UserApprovalPage = () => {
    const { t } = useTranslation();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [approving, setApproving] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            setLoading(true);
            const data = await authService.getPendingUsers();
            setPendingUsers(Array.isArray(data) ? data : []);
        } catch {
            setError(t('userApproval.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        setApproving(userId);
        setError('');
        setSuccessMsg('');

        try {
            await authService.approveUser(userId);
            setSuccessMsg(t('userApproval.approveSuccess'));
            setPendingUsers((prev) => prev.filter((u) => u.user_id !== userId));
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                t('userApproval.approveError');
            setError(msg);
        } finally {
            setApproving(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDisplayName = (user) => {
        const fn = user.first_name_en || user.first_name_ar || user.person?.first_name || '';
        const ln = user.last_name_en || user.last_name_ar || user.person?.last_name || '';
        return `${fn} ${ln}`.trim() || user.username;
    };

    if (!authService.isSuperuser()) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <AlertCircle size={48} color="var(--color-danger, #ef4444)" style={{ marginBottom: 'var(--space-4)' }} />
                    <h2>{t('userApproval.unauthorizedTitle')}</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{t('userApproval.unauthorizedMessage')}</p>
                </div>
            </div>
        );
    }

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
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', letterSpacing: '-0.02em', margin: 0, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><UserCheck size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('userApproval.title')}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                        {t('userApproval.subtitle')}
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)'
                }}>
                    <Clock size={16} color="var(--color-warning, #f59e0b)" />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                        {pendingUsers.length} {t('userApproval.pendingCount')}
                    </span>
                </div>
            </div>

            {/* Messages */}
            {error && <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
            {successMsg && (
                <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--color-success-light, #dcfce7)',
                    color: 'var(--color-success, #16a34a)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <CheckCircle size={16} />
                    {successMsg}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div style={{ padding: 'var(--space-8)' }}>
                    <SkeletonListRows count={5} />
                </div>
            ) : (
                <>
                    {!loading && pendingUsers.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--space-8)',
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <CheckCircle size={48} color="var(--color-success, #22c55e)" style={{ marginBottom: 'var(--space-4)' }} />
                            <h3 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{t('userApproval.noPendingTitle')}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{t('userApproval.noPendingMessage')}</p>
                        </div>
                    )}

                    {/* User Cards */}
                    {!loading && pendingUsers.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {pendingUsers.map((user) => (
                                <div
                                    key={user.user_id}
                                    style={{
                                        background: 'var(--color-surface)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        padding: 'var(--space-5)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 'var(--space-4)'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'var(--gradient-primary)',
                                                borderRadius: 'var(--radius-full)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '14px'
                                            }}>
                                                {getDisplayName(user).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: 'var(--font-size-base)' }}>
                                                    {getDisplayName(user)}
                                                </div>
                                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            {user.person?.sex && (
                                                <span>{t('signup.sex')}: {t(`signup.${user.person.sex.toLowerCase()}`)}</span>
                                            )}
                                            {user.role_label && (
                                                <span>{t('signup.role')}: {user.role_label}</span>
                                            )}
                                            {user.position_label && (
                                                <span>{t('signup.position')}: {user.position_label}</span>
                                            )}
                                            {user.created_at_datetime && (
                                                <span>{t('userApproval.registeredOn')}: {formatDate(user.created_at_datetime)}</span>
                                            )}
                                        </div>

                                        {/* Arabic name if available */}
                                        {(user.first_name_ar || user.last_name_ar) && (
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', direction: 'rtl' }}>
                                                {user.first_name_ar} {user.last_name_ar}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleApprove(user.user_id)}
                                        disabled={approving === user.user_id}
                                        style={{ minWidth: '120px' }}
                                    >
                                        {approving === user.user_id ? (
                                            <>
                                                <span className="loading-spinner" />
                                                {t('common.loading')}
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck size={16} />
                                                {t('userApproval.approve')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserApprovalPage;
