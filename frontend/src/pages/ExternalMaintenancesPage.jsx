import { useEffect, useMemo, useState } from 'react';
import {
    Send, PackageCheck, Truck, Warehouse, XCircle, RefreshCw,
    ChevronRight, Hash, Wrench, X, CheckCircle2, AlertTriangle,
    MapPin, Building2, Search, SlidersHorizontal, ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { externalMaintenanceProviderService, externalMaintenanceService, locationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SkeletonListRows } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

const STATUS_CONFIG = {
    DRAFT: { badge: 'badge-info', icon: Wrench },
    RECEIVED_BY_PROVIDER: { badge: 'badge-warning', icon: PackageCheck },
    SENT_TO_COMPANY: { badge: 'badge-info', icon: Truck },
    RECEIVED_BY_COMPANY: { badge: 'badge-success', icon: Warehouse },
    FAILED: { badge: 'badge-error', icon: XCircle },
};

const getStatusConfig = (s) => STATUS_CONFIG[s] || { badge: 'badge-secondary', icon: Wrench };

const getProgressStep = (item) => {
    if (item.item_received_by_company_datetime) return 4;
    if (item.item_sent_to_company_datetime) return 3;
    if (item.item_received_by_maintenance_provider_datetime) return 2;
    if (item.item_sent_to_external_maintenance_datetime) return 1;
    return 0;
};

const fmtDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
};

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const cfg = getStatusConfig(status);
    const Icon = cfg.icon;
    const label = status ? t(`externalMaintenances.status${status}`, status.replace(/_/g, ' ')) : t('externalMaintenances.statusDRAFT', 'Draft');
    return <span className={`badge ${cfg.badge}`} style={{ gap: 'var(--space-1)' }}><Icon size={12} />{label}</span>;
};

const ProgressBar = ({ step }) => {
    const pct = Math.round((step / 4) * 100);
    const color = step === 4 ? 'var(--color-success)' : step === 0 ? 'var(--color-border)' : 'var(--color-accent-primary)';
    return (
        <div style={{ height: 3, background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
        </div>
    );
};

const MsgAlert = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
            background: message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            color: message.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
            fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)',
        }}>
            {message.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            <span style={{ flex: 1 }}>{message.text}</span>
            {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}><X size={14} /></button>}
        </div>
    );
};

const ExternalMaintenancesPage = () => {
    const { user, isSuperuser } = useAuth();
    const { t, i18n } = useTranslation();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [sendSubmitting, setSendSubmitting] = useState(false);
    const [sendMessage, setSendMessage] = useState(null);
    const [providers, setProviders] = useState([]);
    const [externalCenterRooms, setExternalCenterRooms] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [selectedDestinationLocationId, setSelectedDestinationLocationId] = useState('');

    const [confirmSubmitting, setConfirmSubmitting] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState(null);

    const [sentToCompanySubmitting, setSentToCompanySubmitting] = useState(false);
    const [sentToCompanyMessage, setSentToCompanyMessage] = useState(null);

    const [receiveCompanyModalOpen, setReceiveCompanyModalOpen] = useState(false);
    const [receiveCompanySubmitting, setReceiveCompanySubmitting] = useState(false);
    const [receiveCompanyMessage, setReceiveCompanyMessage] = useState(null);
    const [receiveCompanyLocationId, setReceiveCompanyLocationId] = useState('');

    const [markFailedSubmitting, setMarkFailedSubmitting] = useState(false);
    const [markFailedMessage, setMarkFailedMessage] = useState(null);
    const [includeComposedOnFailed, setIncludeComposedOnFailed] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const sortOptions = [
        { field: 'id', dir: 'desc', label: `${t('externalMaintenances.sortById')} — ${t('common.descending')}` },
        { field: 'id', dir: 'asc', label: `${t('externalMaintenances.sortById')} — ${t('common.ascending')}` },
        { field: 'name', dir: 'asc', label: `${t('externalMaintenances.sortByName')} — ${t('common.ascending')}` },
        { field: 'name', dir: 'desc', label: `${t('externalMaintenances.sortByName')} — ${t('common.descending')}` },
        { field: 'progress', dir: 'desc', label: `${t('externalMaintenances.sortByProgress')} — ${t('common.descending')}` },
        { field: 'progress', dir: 'asc', label: `${t('externalMaintenances.sortByProgress')} — ${t('common.ascending')}` },
    ];

    const hasActiveFilters = searchTerm.trim() || filterStatus;

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilterStatus('');
        setSortField('id');
        setSortDirection('desc');
    };

    const filteredItems = useMemo(() => {
        let result = items.filter((it) => {
            const searchLower = searchTerm.toLowerCase();
            const name = (it.maintenance_asset_name || '').toLowerCase();
            const id = String(it.external_maintenance_id);
            const maintenanceId = String(it.maintenance || '');
            const matchesSearch = !searchLower || name.includes(searchLower) || id.includes(searchLower) || maintenanceId.includes(searchLower);
            const matchesStatus = !filterStatus || it.external_maintenance_status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'id') {
                cmp = a.external_maintenance_id - b.external_maintenance_id;
            } else if (sortField === 'name') {
                cmp = (a.maintenance_asset_name || '').localeCompare(b.maintenance_asset_name || '', i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'progress') {
                cmp = getProgressStep(a) - getProgressStep(b);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [items, searchTerm, filterStatus, sortField, sortDirection, i18n.language]);

    const isAssetResponsible = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((role) => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief') || false;
    }, [isSuperuser, user]);

    const load = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await externalMaintenanceService.getAll();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('externalMaintenances.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const submitConfirmReceivedByCompany = async () => {
        if (!selectedItem) return;
        if (!receiveCompanyLocationId) {
            setReceiveCompanyMessage({ type: 'error', text: t('externalMaintenances.selectDestination') });
            return;
        }

        try {
            setReceiveCompanySubmitting(true);
            setReceiveCompanyMessage(null);
            const updated = await externalMaintenanceService.confirmReceivedByCompany(
                selectedItem.external_maintenance_id,
                Number(receiveCompanyLocationId),
            );
            setReceiveCompanyMessage({ type: 'success', text: t('externalMaintenances.confirmedReceivedByCompany') });
            showSuccess(t('externalMaintenances.confirmedReceivedByCompany'));
            setSelectedItem(updated);
            setReceiveCompanyModalOpen(false);
            await load();
        } catch (err) {
            console.error(err);
            setReceiveCompanyMessage({ type: 'error', text: err.response?.data?.error || t('externalMaintenances.confirmReceivedByCompanyError') });
            showError(err.response?.data?.error || t('externalMaintenances.confirmReceivedByCompanyError'));
        } finally {
            setReceiveCompanySubmitting(false);
        }
    };

    const submitConfirmSentToCompany = async () => {
        if (!selectedItem) return;

        try {
            setSentToCompanySubmitting(true);
            setSentToCompanyMessage(null);
            const updated = await externalMaintenanceService.confirmSentToCompany(selectedItem.external_maintenance_id);
            setSentToCompanyMessage({ type: 'success', text: t('externalMaintenances.confirmedSentToCompany') });
            showSuccess(t('externalMaintenances.confirmedSentToCompany'));
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setSentToCompanyMessage({ type: 'error', text: err.response?.data?.error || t('externalMaintenances.confirmSentToCompanyError') });
            showError(err.response?.data?.error || t('externalMaintenances.confirmSentToCompanyError'));
        } finally {
            setSentToCompanySubmitting(false);
        }
    };

    const submitConfirmReceivedByProvider = async () => {
        if (!selectedItem) return;

        try {
            setConfirmSubmitting(true);
            setConfirmMessage(null);
            const updated = await externalMaintenanceService.confirmReceivedByProvider(selectedItem.external_maintenance_id);
            setConfirmMessage({ type: 'success', text: t('externalMaintenances.confirmedReceivedByProvider') });
            showSuccess(t('externalMaintenances.confirmedReceivedByProvider'));
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setConfirmMessage({ type: 'error', text: err.response?.data?.error || t('externalMaintenances.confirmReceiptError') });
            showError(err.response?.data?.error || t('externalMaintenances.confirmReceiptError'));
        } finally {
            setConfirmSubmitting(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!showSortMenu) return;
        const handler = () => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    const openDetails = (item) => {
        setSelectedItem(item);
        setSendMessage(null);
        setConfirmMessage(null);
        setSentToCompanyMessage(null);
        setSelectedProviderId('');
        setSelectedDestinationLocationId('');
        setReceiveCompanyModalOpen(false);
        setReceiveCompanySubmitting(false);
        setReceiveCompanyMessage(null);
        setReceiveCompanyLocationId('');
        setDetailsOpen(true);
    };

    const closeDetails = () => {
        setSelectedItem(null);
        setDetailsOpen(false);
        setSendSubmitting(false);
        setSendMessage(null);
        setConfirmSubmitting(false);
        setConfirmMessage(null);
        setSentToCompanySubmitting(false);
        setSentToCompanyMessage(null);
        setSelectedProviderId('');
        setSelectedDestinationLocationId('');
        setReceiveCompanyModalOpen(false);
        setReceiveCompanySubmitting(false);
        setReceiveCompanyMessage(null);
        setReceiveCompanyLocationId('');
        setMarkFailedSubmitting(false);
        setMarkFailedMessage(null);
        setIncludeComposedOnFailed(false);
    };

    const submitMarkFailed = async () => {
        if (!selectedItem) return;

        try {
            setMarkFailedSubmitting(true);
            setMarkFailedMessage(null);
            const updated = await externalMaintenanceService.markFailed(selectedItem.external_maintenance_id, {
                target_type: 'asset',
                include_composed: includeComposedOnFailed,
            });
            setMarkFailedMessage({ type: 'success', text: t('externalMaintenances.markedFailed') });
            showSuccess(t('externalMaintenances.markedFailed'));
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setMarkFailedMessage({ type: 'error', text: err.response?.data?.error || t('externalMaintenances.markFailedError') });
            showError(err.response?.data?.error || t('externalMaintenances.markFailedError'));
        } finally {
            setMarkFailedSubmitting(false);
        }
    };

    useEffect(() => {
        const loadSendFormData = async () => {
            try {
                if (!detailsOpen) return;
                const [prov, locations] = await Promise.all([
                    externalMaintenanceProviderService.getAll(),
                    locationService.getAll(),
                ]);
                setProviders(Array.isArray(prov) ? prov : []);
                const all = Array.isArray(locations) ? locations : [];
                setAllRooms(all);
                const filteredRooms = all.filter(
                    (r) => r?.location_type_label === 'External Maintenance Center'
                );
                setExternalCenterRooms(filteredRooms);
            } catch (err) {
                console.error(err);
                setProviders([]);
                setExternalCenterRooms([]);
                setAllRooms([]);
            }
        };

        loadSendFormData();
    }, [detailsOpen]);

    const submitSendToProvider = async () => {
        if (!selectedItem) return;
        if (!selectedProviderId) {
            setSendMessage({ type: 'error', text: t('externalMaintenances.selectProvider') });
            return;
        }
        if (!selectedDestinationLocationId) {
            setSendMessage({ type: 'error', text: t('externalMaintenances.selectDestination') });
            return;
        }

        try {
            setSendSubmitting(true);
            setSendMessage(null);
            const updated = await externalMaintenanceService.sendToProvider(
                selectedItem.external_maintenance_id,
                Number(selectedProviderId),
                Number(selectedDestinationLocationId),
            );
            setSendMessage({ type: 'success', text: t('externalMaintenances.sentToProvider') });
            showSuccess(t('externalMaintenances.sentToProvider'));
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setSendMessage({ type: 'error', text: err.response?.data?.error || t('externalMaintenances.sendToProviderError') });
            showError(err.response?.data?.error || t('externalMaintenances.sendToProviderError'));
        } finally {
            setSendSubmitting(false);
        }
    };

    const timelineSteps = [
        { key: 'sentToExternal', dateField: 'item_sent_to_external_maintenance_datetime', icon: Send, labelKey: 'externalMaintenances.sentToExternal' },
        { key: 'receivedByProvider', dateField: 'item_received_by_maintenance_provider_datetime', icon: PackageCheck, labelKey: 'externalMaintenances.receivedByProvider' },
        { key: 'sentToCompany', dateField: 'item_sent_to_company_datetime', icon: Truck, labelKey: 'externalMaintenances.sentToCompany' },
        { key: 'receivedByCompany', dateField: 'item_received_by_company_datetime', icon: Warehouse, labelKey: 'externalMaintenances.receivedByCompany' },
    ];

    const renderTimeline = (item) => {
        const currentStep = getProgressStep(item);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timelineSteps.map((step, idx) => {
                    const done = idx < currentStep;
                    const active = idx === currentStep;
                    const dateVal = item[step.dateField];
                    const StepIcon = step.icon;
                    const isLast = idx === timelineSteps.length - 1;
                    return (
                        <div key={step.key} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? 'rgba(16,185,129,0.15)' : active ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-secondary)',
                                    border: `2px solid ${done ? 'var(--color-success)' : active ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                                    color: done ? 'var(--color-success)' : active ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                                    transition: 'all 0.3s ease', flexShrink: 0,
                                }}>
                                    <StepIcon size={14} />
                                </div>
                                {!isLast && (
                                    <div style={{
                                        width: 2, flex: 1, minHeight: 20,
                                        background: done ? 'var(--color-success)' : 'var(--color-border)',
                                        transition: 'background 0.3s ease',
                                    }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: isLast ? 0 : 'var(--space-4)', flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: done || active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                                    {t(step.labelKey)}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: dateVal ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', marginTop: 2 }}>
                                    {dateVal ? fmtDate(dateVal) : t('common.pending')}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!isAssetResponsible) {
        return (
            <div className="empty-state">
                <p>{t('common.notAllowed')}</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{t('externalMaintenances.title')}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>{t('externalMaintenances.subtitle')}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => load()} disabled={loading} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>{t('common.refresh')}</span>
                </button>
            </div>

            {/* Error */}
            {error && (
                <MsgAlert message={{ type: 'error', text: error }} onDismiss={() => setError('')} />
            )}

            {/* Search / Filter / Sort Toolbar */}
            {!loading && !error && items.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-backdrop)',
                    WebkitBackdropFilter: 'var(--glass-backdrop)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-2) var(--space-4)',
                    boxShadow: 'var(--glass-shadow)',
                    marginBottom: 'var(--space-5)',
                }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none',
                        }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('externalMaintenances.searchPlaceholder')}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                paddingRight: searchTerm ? 'var(--space-10)' : 'var(--space-4)',
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
                                    padding: 2,
                                    display: 'flex',
                                    alignItems: 'center',
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
                            zIndex: 1,
                        }} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                appearance: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">{t('externalMaintenances.allStatuses')}</option>
                            <option value="DRAFT">{t('externalMaintenances.statusDRAFT')}</option>
                            <option value="RECEIVED_BY_PROVIDER">{t('externalMaintenances.statusRECEIVED_BY_PROVIDER')}</option>
                            <option value="SENT_TO_COMPANY">{t('externalMaintenances.statusSENT_TO_COMPANY')}</option>
                            <option value="RECEIVED_BY_COMPANY">{t('externalMaintenances.statusRECEIVED_BY_COMPANY')}</option>
                            <option value="FAILED">{t('externalMaintenances.statusFAILED')}</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSortMenu(!showSortMenu);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) var(--space-4)',
                                height: '42px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-backdrop)',
                                WebkitBackdropFilter: 'var(--glass-backdrop)',
                                color: 'var(--color-text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: 'var(--font-size-sm)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <ArrowUpDown size={16} />
                            <span>{sortField === 'name' ? t('externalMaintenances.sortByName') : sortField === 'progress' ? t('externalMaintenances.sortByProgress') : t('externalMaintenances.sortById')}</span>
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
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'var(--glass-backdrop)',
                                    WebkitBackdropFilter: 'var(--glass-backdrop)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--glass-shadow)',
                                    padding: 'var(--space-2)',
                                    zIndex: 100,
                                    minWidth: '200px',
                                }}
                            >
                                <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('common.sortBy')}
                                </div>
                                {sortOptions.map((opt) => (
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
                                            textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                            padding: 'var(--space-2) var(--space-3)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: sortField === opt.field && sortDirection === opt.dir ? 600 : 400,
                                            color: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)',
                                            background: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-glow)' : 'transparent',
                                            transition: 'all var(--transition-fast)',
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
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
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
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <X size={14} />
                            {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            )}

            {/* Results count */}
            {!loading && !error && items.length > 0 && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>
                    {t('externalMaintenances.resultCount', { count: filteredItems.length })}
                </div>
            )}

            {/* Loading / Empty */}
            {loading ? (
                <div style={{ padding: 'var(--space-12)' }}>
                    <SkeletonListRows count={6} />
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-16)' }}>
                    <Wrench size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>{t('externalMaintenances.noRecords')}</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-16)' }}>
                    <Wrench size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>{t('externalMaintenances.noResultsFound')}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                    {filteredItems.map((it) => {
                        const step = getProgressStep(it);
                        return (
                            <div key={it.external_maintenance_id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => openDetails(it)}>
                                <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                                    {/* Card header: icon + status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                            background: 'var(--color-bg-secondary)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--color-accent-primary)',
                                        }}>
                                            <Wrench size={20} />
                                        </div>
                                        <StatusBadge status={it.external_maintenance_status} />
                                    </div>

                                    {/* Asset name */}
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                                        {it.maintenance_asset_name || it.maintenance_asset_id || '-'}
                                    </h3>

                                    {/* IDs row */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <Hash size={14} />
                                            <span>EM #{it.external_maintenance_id}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <Building2 size={14} />
                                            <span>M #{it.maintenance}</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <ProgressBar step={step} />

                                    {/* Footer: step label + chevron */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {step === 4 ? t('externalMaintenances.receivedByCompany') :
                                             step === 3 ? t('externalMaintenances.sentToCompany') :
                                             step === 2 ? t('externalMaintenances.receivedByProvider') :
                                             step === 1 ? t('externalMaintenances.sentToExternal') :
                                             t('externalMaintenances.statusDRAFT', 'Draft')}
                                        </span>
                                        <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {detailsOpen && selectedItem && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => closeDetails()}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', maxHeight: 'none', overflow: 'visible' }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-accent-primary)',
                                }}>
                                    <Wrench size={18} />
                                </div>
                                <div>
                                    <h3 className="modal-title" style={{ marginBottom: 0 }}>{selectedItem.maintenance_asset_name || selectedItem.maintenance_asset_id || '-'}</h3>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>EM #{selectedItem.external_maintenance_id}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <StatusBadge status={selectedItem.external_maintenance_status} />
                                <button className="modal-close" onClick={() => closeDetails()}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="modal-body" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            {/* Info row - compact, no labels */}
                            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    <Hash size={14} style={{ color: 'var(--color-text-muted)' }} />
                                    <span>#{selectedItem.external_maintenance_id}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    <Building2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                                    <span>#{selectedItem.maintenance}</span>
                                </div>
                            </div>

                            {/* Visual Timeline */}
                            <div style={{
                                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', boxShadow: 'var(--glass-shadow)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                            }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                                    {t('common.timeline')}
                                </div>
                                {renderTimeline(selectedItem)}
                            </div>

                            {/* Action sections */}
                            {isAssetResponsible && !selectedItem.item_sent_to_external_maintenance_datetime && (
                                <div style={{
                                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', boxShadow: 'var(--glass-shadow)',
                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                        <Send size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{t('externalMaintenances.sendToProviderTitle')}</span>
                                    </div>
                                    <MsgAlert message={sendMessage} onDismiss={() => setSendMessage(null)} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '12px' }}>{t('externalMaintenances.provider')}</label>
                                            <select
                                                className="form-input"
                                                value={selectedProviderId}
                                                onChange={(e) => setSelectedProviderId(e.target.value)}
                                                disabled={sendSubmitting}
                                                style={{ height: 38, fontSize: 'var(--font-size-sm)' }}
                                            >
                                                <option value="">{t('externalMaintenances.selectProvider')}</option>
                                                {providers.map((p) => (
                                                    <option key={p.external_maintenance_provider_id} value={p.external_maintenance_provider_id}>
                                                        {p.external_maintenance_provider_name || `Provider ${p.external_maintenance_provider_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '12px' }}>{t('externalMaintenances.destinationLocation')}</label>
                                            <select
                                                className="form-input"
                                                value={selectedDestinationLocationId}
                                                onChange={(e) => setSelectedDestinationLocationId(e.target.value)}
                                                disabled={sendSubmitting}
                                                style={{ height: 38, fontSize: 'var(--font-size-sm)' }}
                                            >
                                                <option value="">{t('locations.chooseParentLocation')}</option>
                                                {externalCenterRooms.map((r) => (
                                                    <option key={r.location_id} value={r.location_id}>
                                                        {r.location_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => submitSendToProvider()}
                                        disabled={sendSubmitting || !selectedProviderId || !selectedDestinationLocationId}
                                        style={{ marginTop: 'var(--space-3)', width: 'auto' }}
                                    >
                                        <Send size={16} />
                                        {sendSubmitting ? t('externalMaintenances.sending') : t('externalMaintenances.send')}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && selectedItem.item_sent_to_external_maintenance_datetime && !selectedItem.item_received_by_maintenance_provider_datetime && (
                                <div style={{
                                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', boxShadow: 'var(--glass-shadow)',
                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                        <PackageCheck size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{t('externalMaintenances.confirmReceivedByProviderTitle')}</span>
                                    </div>
                                    <MsgAlert message={confirmMessage} onDismiss={() => setConfirmMessage(null)} />
                                    <button className="btn btn-primary" onClick={() => submitConfirmReceivedByProvider()} disabled={confirmSubmitting} style={{ width: 'auto' }}>
                                        <PackageCheck size={16} />
                                        {confirmSubmitting ? t('externalMaintenances.confirming') : t('externalMaintenances.confirmReceived')}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && selectedItem.item_received_by_maintenance_provider_datetime && !selectedItem.item_sent_to_company_datetime && (
                                <div style={{
                                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', boxShadow: 'var(--glass-shadow)',
                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                        <Truck size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{t('externalMaintenances.confirmAssetSentTitle')}</span>
                                    </div>
                                    <MsgAlert message={sentToCompanyMessage} onDismiss={() => setSentToCompanyMessage(null)} />
                                    <button className="btn btn-primary" onClick={() => submitConfirmSentToCompany()} disabled={sentToCompanySubmitting} style={{ width: 'auto' }}>
                                        <Truck size={16} />
                                        {sentToCompanySubmitting ? t('externalMaintenances.confirming') : t('externalMaintenances.confirmAssetSent')}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && selectedItem.item_sent_to_company_datetime && !selectedItem.item_received_by_company_datetime && (
                                <div style={{
                                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', boxShadow: 'var(--glass-shadow)',
                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                        <Warehouse size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{t('externalMaintenances.confirmAssetReceivedTitle')}</span>
                                    </div>
                                    <MsgAlert message={receiveCompanyMessage} onDismiss={() => setReceiveCompanyMessage(null)} />
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setReceiveCompanyMessage(null);
                                            setReceiveCompanyLocationId('');
                                            setReceiveCompanyModalOpen(true);
                                        }}
                                        disabled={receiveCompanySubmitting}
                                        style={{ width: 'auto' }}
                                    >
                                        <Warehouse size={16} />
                                        {t('externalMaintenances.confirmAssetReceived')}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && (selectedItem.external_maintenance_status === 'RECEIVED_BY_PROVIDER' || !!selectedItem.item_received_by_maintenance_provider_datetime) && (
                                <div style={{
                                    background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                        <XCircle size={16} style={{ color: 'var(--color-error)' }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>{t('externalMaintenances.setFailed')}</span>
                                    </div>
                                    <MsgAlert message={markFailedMessage} onDismiss={() => setMarkFailedMessage(null)} />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={includeComposedOnFailed}
                                            onChange={(e) => setIncludeComposedOnFailed(e.target.checked)}
                                            disabled={markFailedSubmitting}
                                        />
                                        {t('externalMaintenances.includeComposedOnFailed')}
                                    </label>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => submitMarkFailed()}
                                        disabled={markFailedSubmitting}
                                        style={{ width: 'auto' }}
                                    >
                                        <XCircle size={16} />
                                        {markFailedSubmitting ? t('common.saving') : t('externalMaintenances.markFailed')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {receiveCompanyModalOpen && (
                            <ModalPortal>
                            <div className="modal-overlay" onClick={() => setReceiveCompanyModalOpen(false)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                                    <div className="modal-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <MapPin size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                            <h3 className="modal-title">{t('externalMaintenances.moveAssetToLocation')}</h3>
                                        </div>
                                        <button className="modal-close" onClick={() => setReceiveCompanyModalOpen(false)}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                        <MsgAlert message={receiveCompanyMessage} onDismiss={() => setReceiveCompanyMessage(null)} />
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '12px' }}>{t('externalMaintenances.destinationLocation')}</label>
                                            <select
                                                className="form-input"
                                                value={receiveCompanyLocationId}
                                                onChange={(e) => setReceiveCompanyLocationId(e.target.value)}
                                                disabled={receiveCompanySubmitting}
                                                style={{ height: 38, fontSize: 'var(--font-size-sm)' }}
                                            >
                                                <option value="">{t('locations.chooseParentLocation')}</option>
                                                {allRooms.map((r) => (
                                                    <option key={r.location_id} value={r.location_id}>
                                                        {r.location_name}{r.location_type_label ? ` - ${r.location_type_label}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setReceiveCompanyModalOpen(false)} disabled={receiveCompanySubmitting}>
                                            {t('common.cancel')}
                                        </button>
                                        <button className="btn btn-primary" onClick={() => submitConfirmReceivedByCompany()} disabled={receiveCompanySubmitting || !receiveCompanyLocationId}>
                                            {receiveCompanySubmitting ? t('externalMaintenances.confirming') : t('externalMaintenances.confirmAndMove')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </ModalPortal>
                        )}

                    </div>
                </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default ExternalMaintenancesPage;
