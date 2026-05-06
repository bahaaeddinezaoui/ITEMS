import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Search, X } from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';

import { maintenanceStepItemRequestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonCardList } from '../components/SkeletonCard';

const STATUS_KEY_MAP = {
    pending: 'maintenanceItemRequests.statusPending',
    fulfilled: 'maintenanceItemRequests.statusFulfilled',
    rejected: 'maintenanceItemRequests.statusRejected',
};

const REQUEST_TYPE_KEY_MAP = {
    stock_item: 'maintenanceItemRequests.typeStockItem',
    consumable: 'maintenanceItemRequests.typeConsumable',
};

const MAINTENANCE_STATUS_KEY_MAP = {
    pending: 'maintenanceItemRequests.maintenanceStatusPending',
    started: 'maintenanceItemRequests.maintenanceStatusStarted',
    in_progress: 'maintenanceItemRequests.maintenanceStatusInProgress',
    completed: 'maintenanceItemRequests.maintenanceStatusCompleted',
    failed: 'maintenanceItemRequests.maintenanceStatusFailed',
};

const translateEnum = (t, value, keyMap) => {
    const key = keyMap[value];
    return key ? t(key, value) : value;
};

const MaintenanceItemRequestsPage = () => {
    const { user, isSuperuser } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const canView = useMemo(() => {
        if (isSuperuser) return true;
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        return roles.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'it_bureau_chief');
    }, [isSuperuser, user]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState('');
    const [maintenanceStepStatusFilter, setMaintenanceStepStatusFilter] = useState('');
    const [sortKey, setSortKey] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await maintenanceStepItemRequestService.getAll();
            const list = data?.results || data || [];
            setItems(Array.isArray(list) ? list : []);
        } catch (e) {
            setError(t('maintenanceItemRequests.fetchError', 'Failed to load requested items'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canView) return;
        fetchData();
    }, [canView]);

    const filtered = useMemo(() => {
        const base = Array.isArray(items) ? items : [];

        const q = (searchTerm || '').trim().toLowerCase();
        const sf = (statusFilter || '').trim().toLowerCase();
        const tf = (typeFilter || '').trim().toLowerCase();
        const msf = (maintenanceStatusFilter || '').trim().toLowerCase();

        const withFilters = base.filter((x) => {
            if (sf && String(x.status || '').toLowerCase() !== sf) return false;
            if (tf && String(x.request_type || '').toLowerCase() !== tf) return false;
            if (msf && String(x.maintenance_status || '').toLowerCase() !== msf) return false;
            if (maintenanceStepStatusFilter && String(x.maintenance_step_status_code || x.maintenance_step_status || '').toLowerCase() !== maintenanceStepStatusFilter.toLowerCase()) return false;

            if (!q) return true;

            const hay = [
                x.maintenance_step_item_request_id,
                x.maintenance_id,
                x.maintenance_step,
                x.asset_id,
                x.asset_name,
                x.status,
                x.request_type,
                x.note,
                x.maintenance_status,
                x.maintenance_step_status,
            ]
                .map((v) => (v === null || v === undefined ? '' : String(v)))
                .join(' | ')
                .toLowerCase();

            return hay.includes(q);
        });

        const dirMul = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;

        const normalizeText = (v) => (v === null || v === undefined ? '' : String(v)).toLowerCase();
        const getCreatedMs = (x) => {
            const d = x?.created_at ? new Date(x.created_at) : null;
            const ms = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
            return ms;
        };

        const sorted = [...withFilters].sort((a, b) => {
            if (sortKey === 'created_at') {
                return (getCreatedMs(a) - getCreatedMs(b)) * dirMul;
            }
            if (sortKey === 'status') {
                return normalizeText(a?.status).localeCompare(normalizeText(b?.status)) * dirMul;
            }
            if (sortKey === 'type') {
                return normalizeText(a?.request_type).localeCompare(normalizeText(b?.request_type)) * dirMul;
            }
            if (sortKey === 'asset') {
                return normalizeText(a?.asset_name || a?.asset_id).localeCompare(normalizeText(b?.asset_name || b?.asset_id)) * dirMul;
            }
            if (sortKey === 'maintenance') {
                const av = a?.maintenance_id === null || a?.maintenance_id === undefined ? '' : String(a.maintenance_id);
                const bv = b?.maintenance_id === null || b?.maintenance_id === undefined ? '' : String(b.maintenance_id);
                return av.localeCompare(bv) * dirMul;
            }
            return 0;
        });

        return sorted;
    }, [items, searchTerm, statusFilter, typeFilter, maintenanceStatusFilter, maintenanceStepStatusFilter, sortKey, sortDir]);

    const statusOptions = useMemo(() => {
        const s = new Set((items || []).map((x) => String(x.status || '').trim()).filter(Boolean));
        return Array.from(s).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const typeOptions = useMemo(() => {
        const s = new Set((items || []).map((x) => String(x.request_type || '').trim()).filter(Boolean));
        return Array.from(s).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const maintenanceStatusOptions = useMemo(() => {
        const s = new Set((items || []).map((x) => String(x.maintenance_status || '').trim()).filter(Boolean));
        return Array.from(s).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const stepStatusOptions = useMemo(() => {
        const lang = i18n.language || 'en';
        const labelKey = lang === 'ar' ? 'maintenance_step_status_label_ar' : 'maintenance_step_status_label_en';
        const map = new Map();
        (items || []).forEach((x) => {
            const code = x.maintenance_step_status_code || x.maintenance_step_status;
            if (code) {
                const label = x[labelKey] || code;
                if (!map.has(code)) map.set(code, label);
            }
        });
        return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [items, i18n.language]);

    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <ClipboardList size={22} style={{ color: 'var(--color-accent-primary)' }} />
                            {t('maintenanceItemRequests.title', 'Maintenance requested items')}
                        </h1>
                        <p className="page-subtitle">{t('maintenanceItemRequests.subtitle', 'Stock items and consumables requested during maintenance steps')}</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{t('maintenanceItemRequests.requests', 'Requests')}</h2>
                    </div>
                    <div className="card-body">
                        <SkeletonCardList count={4} cardLines={2} gap="var(--space-4)" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <ClipboardList size={22} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('maintenanceItemRequests.title', 'Maintenance requested items')}
                    </h1>
                    <p className="page-subtitle">{t('maintenanceItemRequests.subtitle', 'Stock items and consumables requested during maintenance steps')}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={fetchData}>
                        {t('common.refresh', 'Refresh')}
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {t('maintenanceItemRequests.count', '{{count}} item(s)', { count: filtered.length })}
                </div>
                <button className="btn btn-secondary" onClick={fetchData}>
                    {t('common.refresh', 'Refresh')}
                </button>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="card-title">{t('maintenanceItemRequests.requests', 'Requests')}</h2>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {t('maintenanceItemRequests.count', '{{count}} item(s)', { count: filtered.length })}
                    </div>
                </div>
                <div className="card-body">
                    {filtered.length === 0 ? (
                        <div style={{ opacity: 0.8 }}>{t('maintenanceItemRequests.noResults', 'No requests found')}</div>
                    ) : (
                        <div className="sci-item-grid">
                            {filtered.map((req) => {
                                const requestedModelId =
                                    req.request_type === 'stock_item'
                                        ? req.requested_stock_item_model
                                        : req.requested_consumable_model;

                                const typeBadgeClass = req.request_type === 'stock_item' ? 'badge-info' : 'badge-warning';

                                const statusBadgeClass = req.status === 'fulfilled' ? 'badge-success'
                                    : req.status === 'rejected' ? 'badge-error'
                                    : 'badge-warning';

                                const maintStatusBadgeClass = req.maintenance_status === 'completed' ? 'badge-success'
                                    : req.maintenance_status === 'failed' ? 'badge-error'
                                    : req.maintenance_status === 'pending' ? 'badge-warning'
                                    : 'badge-info';

                                const stepStatusLabel = (i18n.language === 'ar' ? req.maintenance_step_status_label_ar : req.maintenance_step_status_label_en) || req.maintenance_step_status;

                                return (
                                    <div
                                        key={req.maintenance_step_item_request_id}
                                        className="sci-item-card"
                                        style={{ cursor: req.maintenance_id ? 'pointer' : 'default' }}
                                        onClick={() => req.maintenance_id && navigate(`/dashboard/maintenances/${req.maintenance_id}/steps`)}
                                    >
                                        <div className="sci-item-card-head">
                                            <span className={`badge ${typeBadgeClass}`}>{translateEnum(t, req.request_type, REQUEST_TYPE_KEY_MAP)}</span>
                                            <span className={`badge ${statusBadgeClass}`}>{translateEnum(t, req.status, STATUS_KEY_MAP)}</span>
                                            {req.maintenance_status && (
                                                <span className={`badge ${maintStatusBadgeClass}`}>{translateEnum(t, req.maintenance_status, MAINTENANCE_STATUS_KEY_MAP)}</span>
                                            )}
                                            {stepStatusLabel && (
                                                <span className="badge badge-info">{stepStatusLabel}</span>
                                            )}
                                        </div>

                                        <div className="sci-item-card-body">
                                            <div className="sci-item-card-name">
                                                <strong>#{req.maintenance_step_item_request_id} — {req.asset_name || (req.asset_id ? `Asset #${req.asset_id}` : '-')}</strong>
                                                <span className="sci-item-card-serial">
                                                    M#{req.maintenance_id || '—'} • S#{req.maintenance_step || '—'}
                                                </span>
                                            </div>

                                            <div className="sci-item-card-details">
                                                {requestedModelId && (
                                                    <span className="sci-item-card-tag sci-item-card-mono">
                                                        #{requestedModelId}
                                                    </span>
                                                )}
                                                {req.created_at && (
                                                    <span className="sci-item-card-tag">
                                                        {new Date(req.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {req.note && (
                                                    <span className="sci-item-card-tag" style={{ whiteSpace: 'normal', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                                        {req.note}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <FilterSortFAB hasActiveFilters={!!searchTerm || !!statusFilter || !!typeFilter || !!maintenanceStatusFilter || !!maintenanceStepStatusFilter}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('maintenanceItemRequests.searchPlaceholder', 'Search by asset, maintenance, status, note...')} className="form-input" style={{ width: '100%', height: '40px', paddingLeft: 'var(--space-10)', paddingRight: searchTerm ? 'var(--space-10)' : 'var(--space-4)' }} />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        )}
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('common.status', 'Status')}</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all', 'All')}</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>{translateEnum(t, s, STATUS_KEY_MAP)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('maintenanceItemRequests.type', 'Type')}</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all', 'All')}</option>
                            {typeOptions.map((s) => (
                                <option key={s} value={s}>{translateEnum(t, s, REQUEST_TYPE_KEY_MAP)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('maintenanceItemRequests.maintenanceStatus', 'Maintenance status')}</label>
                        <select value={maintenanceStatusFilter} onChange={(e) => setMaintenanceStatusFilter(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all', 'All')}</option>
                            {maintenanceStatusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('maintenanceItemRequests.stepStatus', 'Step status')}</label>
                        <select value={maintenanceStepStatusFilter} onChange={(e) => setMaintenanceStepStatusFilter(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all', 'All')}</option>
                            {stepStatusOptions.map(([code, label]) => (
                                <option key={code} value={code}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('common.sortBy', 'Sort by')}</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <select className="form-input" value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ height: '40px', flex: 1 }}>
                                <option value="created_at">{t('maintenanceItemRequests.sortCreatedAt', 'Created date')}</option>
                                <option value="status">{t('maintenanceItemRequests.sortStatus', 'Status')}</option>
                                <option value="type">{t('maintenanceItemRequests.sortType', 'Type')}</option>
                                <option value="asset">{t('maintenanceItemRequests.sortAsset', 'Asset')}</option>
                                <option value="maintenance">{t('maintenanceItemRequests.sortMaintenance', 'Maintenance')}</option>
                            </select>
                            <select className="form-input" value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ height: '40px', width: '100px' }}>
                                <option value="asc">↑ {t('common.asc', 'Asc')}</option>
                                <option value="desc">↓ {t('common.desc', 'Desc')}</option>
                            </select>
                        </div>
                    </div>
                    {(searchTerm || statusFilter || typeFilter || maintenanceStatusFilter || maintenanceStepStatusFilter) && (
                        <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); setMaintenanceStatusFilter(''); setMaintenanceStepStatusFilter(''); setSortKey('created_at'); setSortDir('desc'); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </>
    );
};

export default MaintenanceItemRequestsPage;
