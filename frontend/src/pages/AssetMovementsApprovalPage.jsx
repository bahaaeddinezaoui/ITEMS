import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    RefreshCw,
    ArrowRightLeft,
    Package,
    MapPin,
    Calendar,
    Check,
    X,
    FileText,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    SlidersHorizontal,
    Filter,
} from 'lucide-react';
import { movementApprovalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SkeletonCardList } from '../components/SkeletonCard';

const REASON_ICONS = {
    maintenance_create: '🔧',
    maintenance_step_return_to_owner: '🔄',
    maintenance_step_remove: '📤',
    maintenance_step_fulfill_request: '✅',
    return_to_owner: '↩️',
    problem_report_include: '📎',
    attribution: '📋',
    transfer: '➡️',
    destruction: '🗑️',
    destruction_item_recovered: '♻️',
    manual_split: '✂️',
    manual_move: '🚚',
    sent_to_external_maintenance: '📤',
    received_from_external_maintenance: '📥',
};

const ALL_REASON_KEYS = Object.keys(REASON_ICONS);

const getReasonLabel = (reason, t) => {
    const key = `assetMovementsApproval.reasons.${reason}`;
    const translated = t(key);
    return translated !== key ? translated : reason;
};

const formatDatetime = (dt, t) => {
    if (!dt) return '—';
    try {
        const d = new Date(dt);
        const month = t(`assetMovementsApproval.months.${d.getMonth() + 1}`);
        const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return `${d.getDate()} ${month} ${d.getFullYear()} · ${time}`;
    } catch {
        return String(dt);
    }
};

const AssetMovementsApprovalPage = () => {
    const { user, isSuperuser } = useAuth();
    const { t, i18n } = useTranslation();
    const isAssetResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief');

    const [loading, setLoading] = useState(true);
    const [submittingKey, setSubmittingKey] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [pendingMoves, setPendingMoves] = useState([]);
    const [autoAcceptProcessed, setAutoAcceptProcessed] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [reasonFilter, setReasonFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [sortField, setSortField] = useState('movement_datetime');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const loadPending = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const rows = await movementApprovalService.getPendingAssetMovements(i18n.language, statusFilter);
            setPendingMoves(Array.isArray(rows) ? rows : []);
        } catch (e) {
            setError(t('assetMovementsApproval.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAssetResponsible) return;
        loadPending();
    }, [isAssetResponsible, statusFilter]);

    useEffect(() => {
        if (!isAssetResponsible || !i18n.language) return;
        loadPending();
    }, [i18n.language, statusFilter]);

    useEffect(() => {
        const auto = (typeof window !== 'undefined' && localStorage.getItem('autoAcceptAssetMovements') === 'enabled');
        if (!auto) return;
        if (!isAssetResponsible) return;
        if (!Array.isArray(pendingMoves) || pendingMoves.length === 0) return;
        if (autoAcceptProcessed) return;
        const eligible = pendingMoves;
        if (eligible.length === 0) return;
        (async () => {
            try {
                setSubmittingKey('auto');
                setError('');
                setSuccess('');
                const tasks = eligible.map(m => movementApprovalService.decideAssetMovement(m.asset_movement_id, 'accepted'));
                await Promise.allSettled(tasks);
                await loadPending();
                setSuccess(t('assetMovementsApproval.autoAccepted'));
                setAutoAcceptProcessed(true);
            } catch (e) {
                setError(e?.response?.data?.error || t('assetMovementsApproval.autoAcceptError'));
            } finally {
                setSubmittingKey(null);
            }
        })();
    }, [pendingMoves, isAssetResponsible]);

    const handleDecision = async ({ id, decision }) => {
        const key = `${id}:${decision}`;
        setSubmittingKey(key);
        setError('');
        setSuccess('');
        try {
            await movementApprovalService.decideAssetMovement(id, decision);
            setSuccess(t('assetMovementsApproval.movementDecision', { id, decision }));
            await loadPending();
        } catch (e) {
            setError(e?.response?.data?.error || t('assetMovementsApproval.updateError'));
        } finally {
            setSubmittingKey(null);
        }
    };

    const totalPending = useMemo(() => pendingMoves?.length || 0, [pendingMoves]);

    const filteredMoves = useMemo(() => {
        let result = [...(pendingMoves || [])];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(m =>
                (m.asset_name || '').toLowerCase().includes(term) ||
                (m.asset_inventory_number || '').toLowerCase().includes(term) ||
                (m.source_location_name || '').toLowerCase().includes(term) ||
                (m.destination_location_name || '').toLowerCase().includes(term) ||
                (m.movement_reason_translated || getReasonLabel(m.movement_reason, t) || '').toLowerCase().includes(term) ||
                (m.movement_reason || '').toLowerCase().includes(term)
            );
        }

        if (reasonFilter) {
            result = result.filter(m => {
                const r = String(m.movement_reason || '');
                return r === reasonFilter;
            });
        }

        result.sort((a, b) => {
            let aVal, bVal;
            switch (sortField) {
                case 'movement_datetime':
                    aVal = a.movement_datetime ? new Date(a.movement_datetime).getTime() : 0;
                    bVal = b.movement_datetime ? new Date(b.movement_datetime).getTime() : 0;
                    break;
                case 'asset_name':
                    aVal = (a.asset_name || '').toLowerCase();
                    bVal = (b.asset_name || '').toLowerCase();
                    break;
                case 'reason':
                    aVal = (a.movement_reason || '').toLowerCase();
                    bVal = (b.movement_reason || '').toLowerCase();
                    break;
                default:
                    aVal = 0;
                    bVal = 0;
            }
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [pendingMoves, searchTerm, reasonFilter, statusFilter, sortField, sortDirection, t]);

    const displayCount = filteredMoves.length;

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    const renderMovementCard = (m) => {
        const id = m.asset_movement_id;
        const pendingKeyAccept = `${id}:accepted`;
        const pendingKeyReject = `${id}:rejected`;
        const isSubmitting = submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject;
        const reasonKey = String(m.movement_reason || '');
        const reasonIcon = REASON_ICONS[reasonKey] || '📦';
        const reasonLabel = m.movement_reason_translated || getReasonLabel(m.movement_reason, t);
        const assetDisplay = m.asset_name || `#${m.asset_id}`;
        const invDisplay = m.asset_inventory_number || '';
        const srcName = m.source_location_name || `#${m.source_location_id}`;
        const dstName = m.destination_location_name || `#${m.destination_location_id}`;

        return (
            <div key={id} className="card" style={{ transition: 'all 0.2s ease' }}>
                <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                    {/* Header row: icon + asset info + action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                flexShrink: 0,
                            }}>
                                {reasonIcon}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {assetDisplay}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                                    {invDisplay && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <FileText size={10} />
                                            {t('assetMovementsApproval.assetInventory')} {invDisplay}
                                        </span>
                                    )}
                                    <span>{t('assetMovementsApproval.movementId')} #{id}</span>
                                </div>
                            </div>
                        </div>
                        {m.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                            <button
                                className="btn btn-primary"
                                style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '36px', height: '36px' }}
                                onClick={() => handleDecision({ id, decision: 'accepted' })}
                                disabled={isSubmitting}
                                title={t('assetMovementsApproval.acceptMovement')}
                            >
                                <Check size={18} />
                            </button>
                            <button
                                className="btn btn-danger"
                                style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '36px', height: '36px' }}
                                onClick={() => handleDecision({ id, decision: 'rejected' })}
                                disabled={isSubmitting}
                                title={t('assetMovementsApproval.rejectMovement')}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        )}
                    </div>

                    {/* Reason badge */}
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <span className="badge badge-secondary" style={{ fontSize: 'var(--font-size-xs)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <Package size={12} />
                            {reasonLabel}
                        </span>
                    </div>

                    {/* Location flow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
                                {t('assetMovementsApproval.fromLocation')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text)', overflow: 'hidden' }}>
                                <MapPin size={14} style={{ color: 'var(--color-accent-primary)', flexShrink: 0 }} />
                                <span style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{srcName}</span>
                            </div>
                        </div>
                        <ArrowRightLeft size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 'var(--font-size-xs)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
                                {t('assetMovementsApproval.toLocation')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text)', overflow: 'hidden' }}>
                                <MapPin size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                <span style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dstName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer: date + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            <Calendar size={14} />
                            <span>{formatDatetime(m.movement_datetime, t)}</span>
                        </div>
                        <span className="badge badge-warning">{t(`assetMovementsApproval.status.${m.status}`, m.status)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><ArrowRightLeft size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assetMovementsApproval.title')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('assetMovementsApproval.subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {totalPending > 0 && (
                        <span className="badge badge-warning" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {t('assetMovementsApproval.pendingCount', { count: totalPending })}
                        </span>
                    )}
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={loadPending}
                        disabled={loading}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>{t('common.refresh')}</span>
                    </button>
                </div>
            </div>

            {/* Success alert */}
            {success && (
                <div className="success-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <CheckCircle2 size={20} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Error alert */}
            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Search / Filter / Sort Toolbar */}
            {!loading && totalPending > 0 && (
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'center',
                    marginBottom: 'var(--space-5)',
                    flexWrap: 'wrap'
                }}>
                    {/* Search */}
                    <div style={{
                        flex: 1,
                        minWidth: '240px',
                        position: 'relative'
                    }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('assetMovementsApproval.searchPlaceholder')}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                paddingRight: searchTerm ? 'var(--space-10)' : 'var(--space-4)'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--space-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter by Status */}
                    <div style={{ position: 'relative', minWidth: '160px' }}>
                        <SlidersHorizontal size={16} style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none',
                            zIndex: 1
                        }} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">{t('assetMovementsApproval.allStatuses')}</option>
                            <option value="pending">{t('assetMovementsApproval.status.pending')}</option>
                            <option value="accepted">{t('assetMovementsApproval.status.accepted')}</option>
                            <option value="rejected">{t('assetMovementsApproval.status.rejected')}</option>
                        </select>
                    </div>

                    {/* Filter by Reason */}
                    <div style={{ position: 'relative', minWidth: '180px' }}>
                        <Filter size={16} style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none',
                            zIndex: 1
                        }} />
                        <select
                            value={reasonFilter}
                            onChange={(e) => setReasonFilter(e.target.value)}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">{t('assetMovementsApproval.allReasons')}</option>
                            {ALL_REASON_KEYS.map(r => (
                                <option key={r} value={r}>{getReasonLabel(r, t)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSortMenu(!showSortMenu);
                            }}
                            className="btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) var(--space-4)',
                                height: '42px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-card)',
                                color: 'var(--color-text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: 'var(--font-size-sm)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <ArrowUpDown size={16} />
                            <span>{sortField === 'movement_datetime' ? t('assetMovementsApproval.sortByDate') : sortField === 'asset_name' ? t('assetMovementsApproval.sortByAsset') : t('assetMovementsApproval.sortByReason')}</span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                {sortDirection === 'asc' ? t('common.ascending') : t('common.descending')}
                            </span>
                            <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        {showSortMenu && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    right: 0,
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-lg)',
                                    padding: 'var(--space-2)',
                                    zIndex: 100,
                                    minWidth: '200px'
                                }}
                            >
                                <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('common.sortBy')}
                                </div>
                                {[
                                    { field: 'movement_datetime', dir: 'desc', label: `${t('assetMovementsApproval.sortByDate')} — ${t('common.descending')}` },
                                    { field: 'movement_datetime', dir: 'asc', label: `${t('assetMovementsApproval.sortByDate')} — ${t('common.ascending')}` },
                                    { field: 'asset_name', dir: 'asc', label: `${t('assetMovementsApproval.sortByAsset')} — ${t('common.ascending')}` },
                                    { field: 'asset_name', dir: 'desc', label: `${t('assetMovementsApproval.sortByAsset')} — ${t('common.descending')}` },
                                    { field: 'reason', dir: 'asc', label: `${t('assetMovementsApproval.sortByReason')} — ${t('common.ascending')}` },
                                    { field: 'reason', dir: 'desc', label: `${t('assetMovementsApproval.sortByReason')} — ${t('common.descending')}` },
                                ].map(opt => (
                                    <button
                                        key={`${opt.field}-${opt.dir}`}
                                        onClick={() => {
                                            setSortField(opt.field);
                                            setSortDirection(opt.dir);
                                            setShowSortMenu(false);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: 'var(--space-2) var(--space-3)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: sortField === opt.field && sortDirection === opt.dir ? '600' : '400',
                                            color: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)',
                                            background: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-glow)' : 'transparent',
                                            transition: 'all var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!(sortField === opt.field && sortDirection === opt.dir)) {
                                                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!(sortField === opt.field && sortDirection === opt.dir)) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || reasonFilter || statusFilter !== 'pending') && (
                        <button
                            onClick={() => { setSearchTerm(''); setReasonFilter(''); setStatusFilter('pending'); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) var(--space-3)',
                                height: '42px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: 'var(--color-error)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '500',
                                whiteSpace: 'nowrap',
                                transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                            }}
                        >
                            <X size={14} />
                            {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            )}

            {/* Results Count */}
            {!loading && totalPending > 0 && (
                <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    {t('assetMovementsApproval.resultCount', { count: displayCount })}
                </div>
            )}

            {/* Content states */}
            {loading ? (
                <div style={{ padding: 'var(--space-16)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-6)' }}>
                        <SkeletonCardList count={6} cardLines={2} gap="var(--space-6)" style={{ display: 'contents' }} />
                    </div>
                </div>
            ) : totalPending === 0 ? (
                <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                    <div className="empty-state-icon">
                        <CheckCircle2 size={64} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <h3 className="empty-state-title">{t('assetMovementsApproval.allCaughtUp')}</h3>
                    <p className="empty-state-text">{t('assetMovementsApproval.noPendingDescription')}</p>
                </div>
            ) : displayCount === 0 ? (
                <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)' }}>
                    <Search size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                    <h3 className="empty-state-title">{t('assetMovementsApproval.noMatchingMovements')}</h3>
                    <p className="empty-state-text">{t('assetMovementsApproval.tryDifferentFilters')}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-6)' }}>
                    {filteredMoves.map(renderMovementCard)}
                </div>
            )}
        </div>
    );
};

export default AssetMovementsApprovalPage;
