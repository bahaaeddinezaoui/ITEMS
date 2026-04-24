import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, AlertTriangle, CheckCircle2, Search, FileText, ShieldCheck, Clock, Upload, ChevronRight } from 'lucide-react';
import { assetIncidentReportService, assetService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const getReasons = (t) => [
    { value: 'stolen', label: t('assetIncidentReports.stolen') },
    { value: 'lost', label: t('assetIncidentReports.lost') },
    { value: 'irrecoverably_damaged', label: t('assetIncidentReports.irrecoverablyDamaged') },
];
const INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY = 'incidentReportCompositionStatusStrategy';

const REVIEW_ROLE_CONFIG = {
    it_bureau_chief: {
        labelKey: 'assetIncidentReports.role.itBureauChief',
        noteField: 'it_bureau_chief_note',
        signField: 'is_signed_by_it_bureau_chief',
    },
    exploitation_chief: {
        labelKey: 'assetIncidentReports.role.exploitationChief',
        noteField: 'exploitation_chief_note',
        signField: 'is_signed_by_exploitation_chief',
    },
    protection_and_security_bureau_chief: {
        labelKey: 'assetIncidentReports.role.protectionSecurityBureauChief',
        noteField: 'protection_and_security_bureau_chief_note',
        signField: 'is_signed_by_protection_and_security_bureau_chief',
    },
    school_headquarter: {
        labelKey: 'assetIncidentReports.role.schoolHeadquarter',
        noteField: 'school_headquarter_note',
        signField: 'is_signed_by_school_headquarter',
    },
};

const REVIEW_ROLE_ORDER = [
    'it_bureau_chief',
    'exploitation_chief',
    'protection_and_security_bureau_chief',
    'school_headquarter',
];

const REASON_COLORS = {
    stolen: { bg: 'rgba(239, 68, 68, 0.12)', color: 'rgba(239, 68, 68, 0.95)', border: 'rgba(239, 68, 68, 0.3)', bar: '#ef4444' },
    lost: { bg: 'rgba(245, 158, 11, 0.12)', color: 'rgba(245, 158, 11, 0.95)', border: 'rgba(245, 158, 11, 0.3)', bar: '#f59e0b' },
    irrecoverably_damaged: { bg: 'rgba(249, 115, 22, 0.12)', color: 'rgba(249, 115, 22, 0.95)', border: 'rgba(249, 115, 22, 0.3)', bar: '#f97316' },
};

const STATUS_STYLES = {
    submitted: { bg: 'rgba(99, 102, 241, 0.12)', color: 'rgba(165, 180, 252, 0.95)' },
    under_review: { bg: 'rgba(245, 158, 11, 0.12)', color: 'rgba(245, 158, 11, 0.95)' },
    approved: { bg: 'rgba(16, 185, 129, 0.12)', color: 'rgba(16, 185, 129, 0.95)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.12)', color: 'rgba(239, 68, 68, 0.95)' },
};

const SIGNING_STEPS = [
    { key: 'owner', field: 'is_signed_by_owner', labelKey: 'assetIncidentReports.signOwner' },
    { key: 'it', field: 'is_signed_by_it_bureau_chief', labelKey: 'assetIncidentReports.signIT' },
    { key: 'exploit', field: 'is_signed_by_exploitation_chief', labelKey: 'assetIncidentReports.signExploit' },
    { key: 'protect', field: 'is_signed_by_protection_and_security_bureau_chief', labelKey: 'assetIncidentReports.signProtect' },
    { key: 'hq', field: 'is_signed_by_school_headquarter', labelKey: 'assetIncidentReports.signHQ' },
];

const AssetIncidentReportsPage = () => {
    const { t, i18n } = useTranslation();
    const REASONS = getReasons(t);
    const { user, isSuperuser } = useAuth();

    const roleCodes = useMemo(
        () => (Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : []),
        [user]
    );
    const myPersonId = Number(user?.person?.person_id);
    const canView = !!user;
    const canCreate = isSuperuser || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    const isExploitationChief = isSuperuser || roleCodes.includes('exploitation_chief');
    const availableReviewRoles = useMemo(
        () => (isSuperuser ? REVIEW_ROLE_ORDER : REVIEW_ROLE_ORDER.filter((roleCode) => roleCodes.includes(roleCode))),
        [isSuperuser, roleCodes]
    );

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [assets, setAssets] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [reportQuery, setReportQuery] = useState('');
    const [reasonFilter, setReasonFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [serialSearch, setSerialSearch] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [reviewingReport, setReviewingReport] = useState(null);
    const [reviewRole, setReviewRole] = useState('');
    const [reviewDraft, setReviewDraft] = useState({
        note: '',
        signed: false,
        stock_item_ids: [],
        consumable_ids: [],
        apply_status_to_all_composing_items: true,
    });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [ownerSubmitting, setOwnerSubmitting] = useState(false);
    const [showItemStatusModal, setShowItemStatusModal] = useState(false);
    const [ownerEditingReport, setOwnerEditingReport] = useState(null);
    const [ownerDraft, setOwnerDraft] = useState({
        owner_note: '',
        is_signed_by_owner: false,
    });
    const [itemStatusDraft, setItemStatusDraft] = useState({
        stock_item_statuses: {},
        consumable_statuses: {},
    });

    const [form, setForm] = useState({
        asset: '',
        reason: 'stolen',
        is_signed_by_exploitation_chief: true,
        exploitation_chief_note: '',
        apply_status_to_all_composing_items: true,
        stock_item_ids: [],
        consumable_ids: [],
        digital_copy: null,
    });

    const hasActiveReportFilters = useMemo(() => {
        return !!(reportQuery.trim() || reasonFilter || statusFilter);
    }, [reportQuery, reasonFilter, statusFilter]);

    const clearReportFilters = () => {
        setReportQuery('');
        setReasonFilter('');
        setStatusFilter('');
    };

    const applyStatusToAllByDefault = useMemo(() => {
        try {
            return localStorage.getItem(INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY) !== 'exploitation_decides';
        } catch {
            return true;
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const shouldLoadAssets = canCreate || availableReviewRoles.includes('exploitation_chief');

        // Load reports first (critical path) — show page as soon as they're ready
        try {
            const reportData = await assetIncidentReportService.getAll({ page_size: 200 });
            setReports(Array.isArray(reportData) ? reportData : []);
        } catch (e) {
            setReports([]);
            setError(e?.response?.data?.error || t('assetIncidentReports.failedToLoad'));
        }
        setLoading(false);

        // Load assets in the background (non-blocking)
        if (shouldLoadAssets) {
            setAssetsLoading(true);
            try {
                const assetData = await assetService.getAll({ page_size: 1000 });
                setAssets(Array.isArray(assetData) ? assetData : []);
            } catch {
                setAssets([]);
            }
            setAssetsLoading(false);
        } else {
            setAssets([]);
        }
    };

    useEffect(() => {
        if (!canView) return;
        loadData();
    }, [canView]);

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            apply_status_to_all_composing_items: applyStatusToAllByDefault,
            stock_item_ids: [],
            consumable_ids: [],
        }));
    }, [applyStatusToAllByDefault]);

    const resetCreateForm = () => {
        setShowCreateForm(false);
        setForm({
            asset: '',
            reason: 'stolen',
            is_signed_by_exploitation_chief: true,
            exploitation_chief_note: '',
            apply_status_to_all_composing_items: applyStatusToAllByDefault,
            stock_item_ids: [],
            consumable_ids: [],
            digital_copy: null,
        });
        setSerialSearch('');
    };

    const openItemStatusModal = () => {
        const stockStatuses = {};
        const consumableStatuses = {};
        selectedAssetStockItems.forEach((item) => {
            const itemId = Number(item?.stock_item_id);
            if (!Number.isFinite(itemId) || itemId <= 0) return;
            const currentStatus = String(item?.stock_item_status || '').trim().toLowerCase();
            stockStatuses[itemId] = REASONS.some((r) => r.value === currentStatus) ? currentStatus : form.reason;
        });
        selectedAssetConsumables.forEach((item) => {
            const itemId = Number(item?.consumable_id);
            if (!Number.isFinite(itemId) || itemId <= 0) return;
            const currentStatus = String(item?.consumable_status || '').trim().toLowerCase();
            consumableStatuses[itemId] = REASONS.some((r) => r.value === currentStatus) ? currentStatus : form.reason;
        });
        setItemStatusDraft({
            stock_item_statuses: stockStatuses,
            consumable_statuses: consumableStatuses,
        });
        setShowItemStatusModal(true);
    };

    const submitCreateReport = async (statusOverrides = null) => {
        setSubmitting(true);
        try {
            const selectedStockItemIds = statusOverrides
                ? selectedAssetStockItemIds
                : (form.apply_status_to_all_composing_items
                    ? selectedAssetStockItemIds
                    : (Array.isArray(form.stock_item_ids) ? form.stock_item_ids : []));
            const selectedConsumableIds = statusOverrides
                ? selectedAssetConsumableIds
                : (form.apply_status_to_all_composing_items
                    ? selectedAssetConsumableIds
                    : (Array.isArray(form.consumable_ids) ? form.consumable_ids : []));
            const payload = new FormData();
            payload.append('asset', form.asset);
            payload.append('reason', form.reason);
            payload.append('status', 'submitted');
            payload.append('is_signed_by_exploitation_chief', !!form.is_signed_by_exploitation_chief);
            payload.append('exploitation_chief_note', form.exploitation_chief_note || '');
            payload.append('apply_status_to_all_composing_items', statusOverrides ? false : !!form.apply_status_to_all_composing_items);
            payload.append('stock_item_ids', JSON.stringify(selectedStockItemIds));
            payload.append('consumable_ids', JSON.stringify(selectedConsumableIds));
            if (statusOverrides) {
                payload.append('stock_item_statuses', JSON.stringify(statusOverrides.stock_item_statuses || {}));
                payload.append('consumable_statuses', JSON.stringify(statusOverrides.consumable_statuses || {}));
            }
            if (form.digital_copy) {
                payload.append('digital_copy', form.digital_copy);
            }

            await assetIncidentReportService.create(payload);
            await loadData();
            setShowItemStatusModal(false);
            resetCreateForm();
            setSuccess(t('assetIncidentReports.createdSuccessfully'));
        } catch (e) {
            setError(e?.response?.data?.error || t('assetIncidentReports.failedToCreate'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAssets = useMemo(() => {
        const query = serialSearch.trim().toLowerCase();
        if (!query) return assets.slice(0, 3);
        return assets
            .filter((a) => ((a?.asset_serial_number || '').toString().toLowerCase().includes(query)))
            .slice(0, 3);
    }, [assets, serialSearch]);

    const STATUS_I18N_MAP = {
        submitted: 'assetIncidentReports.statusSubmitted',
        under_review: 'assetIncidentReports.statusUnderReview',
        approved: 'assetIncidentReports.statusApproved',
        rejected: 'assetIncidentReports.statusRejected',
    };
    const statusOptions = useMemo(() => [
        'submitted',
        'under_review',
        'approved',
        'rejected',
    ], []);
    const getStatusLabel = (status) => STATUS_I18N_MAP[status] ? t(STATUS_I18N_MAP[status]) : status;

    const filteredReports = useMemo(() => {
        const q = reportQuery.trim().toLowerCase();
        const list = Array.isArray(reports) ? reports.slice() : [];
        const filtered = list.filter((r) => {
            if (reasonFilter && String(r?.reason || '') !== reasonFilter) return false;
            if (statusFilter && String(r?.status || '') !== statusFilter) return false;
            if (!q) return true;
            const haystack = [
                String(r?.asset_incident_report_id ?? ''),
                String(r?.asset_name ?? ''),
                String(r?.asset ?? ''),
                String(r?.asset_serial_number ?? ''),
                String(r?.reason ?? ''),
                String(r?.status ?? ''),
                String(r?.owner_note ?? ''),
                String(r?.exploitation_chief_note ?? ''),
                String(r?.it_bureau_chief_note ?? ''),
                String(r?.protection_and_security_bureau_chief_note ?? ''),
                String(r?.school_headquarter_note ?? ''),
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
        filtered.sort((a, b) => Number(b?.asset_incident_report_id || 0) - Number(a?.asset_incident_report_id || 0));
        return filtered;
    }, [reports, reportQuery, reasonFilter, statusFilter]);

    const reportStats = useMemo(() => {
        const list = filteredReports;
        const total = list.length;
        const stolen = list.filter(r => r.reason === 'stolen').length;
        const lost = list.filter(r => r.reason === 'lost').length;
        const damaged = list.filter(r => r.reason === 'irrecoverably_damaged').length;
        const pendingSignature = list.filter(r => !SIGNING_STEPS.every(step => !!r?.[step.field])).length;
        const fullySigned = list.filter(r => SIGNING_STEPS.every(step => !!r?.[step.field])).length;
        return { total, stolen, lost, damaged, pendingSignature, fullySigned };
    }, [filteredReports]);

    const renderSigningPipeline = (report) => {
        const steps = SIGNING_STEPS.map(step => ({
            ...step,
            signed: !!report?.[step.field],
            label: t(step.labelKey),
        }));
        const signedCount = steps.filter(s => s.signed).length;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {steps.map(step => (
                    <div
                        key={step.key}
                        title={`${step.label}: ${step.signed ? t('assetIncidentReports.signed') : t('common.pending')}`}
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: step.signed ? 'var(--color-success)' : 'rgba(255, 255, 255, 0.08)',
                            border: step.signed ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                            transition: 'all var(--transition-fast)',
                            cursor: 'default',
                        }}
                    />
                ))}
                <span style={{ marginLeft: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    {signedCount}/{steps.length}
                </span>
            </div>
        );
    };

    const selectedAsset = useMemo(
        () => assets.find((a) => Number(a?.asset_id) === Number(form.asset)),
        [assets, form.asset]
    );

    const selectedAssetStockItems = useMemo(
        () => (Array.isArray(selectedAsset?.stock_item_composition) ? selectedAsset.stock_item_composition : []),
        [selectedAsset]
    );
    const selectedAssetConsumables = useMemo(
        () => (Array.isArray(selectedAsset?.consumable_composition) ? selectedAsset.consumable_composition : []),
        [selectedAsset]
    );
    const selectedAssetStockItemIds = useMemo(
        () => selectedAssetStockItems.map((item) => Number(item?.stock_item_id)).filter((id) => Number.isFinite(id) && id > 0),
        [selectedAssetStockItems]
    );
    const selectedAssetConsumableIds = useMemo(
        () => selectedAssetConsumables.map((item) => Number(item?.consumable_id)).filter((id) => Number.isFinite(id) && id > 0),
        [selectedAssetConsumables]
    );
    const reviewingAsset = useMemo(
        () => assets.find((a) => Number(a?.asset_id) === Number(reviewingReport?.asset)),
        [assets, reviewingReport]
    );
    const reviewingAssetStockItems = useMemo(
        () => (Array.isArray(reviewingAsset?.stock_item_composition) ? reviewingAsset.stock_item_composition : []),
        [reviewingAsset]
    );
    const reviewingAssetConsumables = useMemo(
        () => (Array.isArray(reviewingAsset?.consumable_composition) ? reviewingAsset.consumable_composition : []),
        [reviewingAsset]
    );
    const reviewingAssetStockItemIds = useMemo(
        () => reviewingAssetStockItems.map((item) => Number(item?.stock_item_id)).filter((id) => Number.isFinite(id) && id > 0),
        [reviewingAssetStockItems]
    );
    const reviewingAssetConsumableIds = useMemo(
        () => reviewingAssetConsumables.map((item) => Number(item?.consumable_id)).filter((id) => Number.isFinite(id) && id > 0),
        [reviewingAssetConsumables]
    );

    useEffect(() => {
        if (!reviewingReport || !reviewRole) return;
        const roleConfig = REVIEW_ROLE_CONFIG[reviewRole];
        if (!roleConfig) return;
        const reportStockItemIds = Array.isArray(reviewingReport?.stock_item_ids)
            ? reviewingReport.stock_item_ids.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
            : [];
        const reportConsumableIds = Array.isArray(reviewingReport?.consumable_ids)
            ? reviewingReport.consumable_ids.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
            : [];
        const matchesAllStock = reviewingAssetStockItemIds.every((id) => reportStockItemIds.includes(id));
        const matchesAllConsumables = reviewingAssetConsumableIds.every((id) => reportConsumableIds.includes(id));
        setReviewDraft({
            note: reviewingReport?.[roleConfig.noteField] || '',
            signed: !!reviewingReport?.[roleConfig.signField],
            stock_item_ids: reportStockItemIds,
            consumable_ids: reportConsumableIds,
            apply_status_to_all_composing_items: matchesAllStock && matchesAllConsumables,
        });
    }, [reviewingReport, reviewRole, reviewingAssetStockItemIds, reviewingAssetConsumableIds]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.asset) {
            setError(t('assetIncidentReports.selectAssetFirst'));
            return;
        }
        if (!form.reason) {
            setError(t('assetIncidentReports.reasonRequired'));
            return;
        }

        const shouldOpenItemDecisionModal = (
            isExploitationChief
            && !form.apply_status_to_all_composing_items
            && (selectedAssetStockItemIds.length > 0 || selectedAssetConsumableIds.length > 0)
        );
        if (shouldOpenItemDecisionModal) {
            openItemStatusModal();
            return;
        }
        await submitCreateReport();
    };

    const openReviewModal = (report) => {
        if (!Array.isArray(availableReviewRoles) || availableReviewRoles.length === 0) return;
        setReviewingReport(report);
        setReviewRole(availableReviewRoles[0]);
        setReviewDraft({
            note: '',
            signed: false,
            stock_item_ids: [],
            consumable_ids: [],
            apply_status_to_all_composing_items: true,
        });
        setError('');
        setSuccess('');
    };

    const closeReviewModal = () => {
        setReviewingReport(null);
        setReviewRole('');
        setReviewDraft({ note: '', signed: false, stock_item_ids: [], consumable_ids: [], apply_status_to_all_composing_items: true });
    };

    const submitItemStatusModal = async (e) => {
        e.preventDefault();
        await submitCreateReport(itemStatusDraft);
    };

    const submitRoleReview = async (e) => {
        e.preventDefault();
        if (!reviewingReport || !reviewRole) return;
        const roleConfig = REVIEW_ROLE_CONFIG[reviewRole];
        if (!roleConfig) return;

        setReviewSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                [roleConfig.noteField]: reviewDraft.note || '',
                [roleConfig.signField]: !!reviewDraft.signed,
            };
            if (reviewRole === 'exploitation_chief') {
                payload.apply_status_to_all_composing_items = !!reviewDraft.apply_status_to_all_composing_items;
                payload.stock_item_ids = Array.isArray(reviewDraft.stock_item_ids) ? reviewDraft.stock_item_ids : [];
                payload.consumable_ids = Array.isArray(reviewDraft.consumable_ids) ? reviewDraft.consumable_ids : [];
            }
            await assetIncidentReportService.update(reviewingReport.asset_incident_report_id, payload);
            await loadData();
            setSuccess(t('assetIncidentReports.reviewSaved', { role: t(roleConfig.labelKey) }));
            closeReviewModal();
        } catch (e2) {
            setError(e2?.response?.data?.error || t('assetIncidentReports.failedToSaveReview'));
        } finally {
            setReviewSubmitting(false);
        }
    };

    const isOwnerOfReport = (report) => isSuperuser || Number(report?.owner_person) === myPersonId;

    const openOwnerModal = (report) => {
        if (!isOwnerOfReport(report)) return;
        setOwnerEditingReport(report);
        setOwnerDraft({
            owner_note: report?.owner_note || '',
            is_signed_by_owner: !!report?.is_signed_by_owner,
        });
        setError('');
        setSuccess('');
    };

    const closeOwnerModal = () => {
        setOwnerEditingReport(null);
        setOwnerDraft({
            owner_note: '',
            is_signed_by_owner: false,
        });
    };

    const submitOwnerReview = async (e) => {
        e.preventDefault();
        if (!ownerEditingReport) return;
        setOwnerSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await assetIncidentReportService.update(ownerEditingReport.asset_incident_report_id, {
                owner_note: ownerDraft.owner_note || '',
                is_signed_by_owner: !!ownerDraft.is_signed_by_owner,
            });
            await loadData();
            setSuccess(t('assetIncidentReports.ownerNoteSaved'));
            closeOwnerModal();
        } catch (e2) {
            setError(e2?.response?.data?.error || t('assetIncidentReports.failedToSaveOwnerNote'));
        } finally {
            setOwnerSubmitting(false);
        }
    };

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 240 }}>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)' }}>{t('assetIncidentReports.title')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', margin: 0 }}>{t('assetIncidentReports.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={loadData} disabled={loading || submitting || reviewSubmitting || ownerSubmitting}>
                        {t('common.refresh')}
                    </button>
                    {canCreate && (
                        <button
                            className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                            onClick={() => setShowCreateForm((prev) => !prev)}
                            style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', width: 'auto' }}
                        >
                            {showCreateForm ? <X size={18} /> : <Plus size={18} />}
                            {showCreateForm ? t('common.cancel') : t('assetIncidentReports.newReport')}
                        </button>
                    )}
                </div>
            </div>

            {(error || success) && (
                <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                    {error && <div className="error-message">{error}</div>}
                    {success && (
                        <div className="badge badge-success" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                            {success}
                        </div>
                    )}
                </div>
            )}

            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>{t('assetIncidentReports.overview')}</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {t('assetIncidentReports.overviewSubtitle') || ''}
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                }}>
                    <div className="metric-card color-violet" style={{ padding: 'var(--space-5)' }}>
                        <div className="metric-info">
                            <div className="metric-title">{t('assetIncidentReports.totalReports')}</div>
                            <div className="metric-value">{reportStats.total}</div>
                        </div>
                        <div className="metric-icon-box"><FileText size={22} /></div>
                    </div>
                    <div className="metric-card" style={{ padding: 'var(--space-5)' }}>
                        <div className="metric-info">
                            <div className="metric-title" style={{ color: 'rgba(239, 68, 68, 0.8)' }}>{t('assetIncidentReports.stolen')}</div>
                            <div className="metric-value" style={{ color: REASON_COLORS.stolen.color }}>{reportStats.stolen}</div>
                        </div>
                        <div className="metric-icon-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}><AlertTriangle size={22} style={{ color: '#ef4444' }} /></div>
                    </div>
                    <div className="metric-card" style={{ padding: 'var(--space-5)' }}>
                        <div className="metric-info">
                            <div className="metric-title" style={{ color: 'rgba(245, 158, 11, 0.8)' }}>{t('assetIncidentReports.lost')}</div>
                            <div className="metric-value" style={{ color: REASON_COLORS.lost.color }}>{reportStats.lost}</div>
                        </div>
                        <div className="metric-icon-box" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}><Search size={22} style={{ color: '#f59e0b' }} /></div>
                    </div>
                    <div className="metric-card" style={{ padding: 'var(--space-5)' }}>
                        <div className="metric-info">
                            <div className="metric-title" style={{ color: 'rgba(249, 115, 22, 0.8)' }}>{t('assetIncidentReports.irrecoverablyDamaged')}</div>
                            <div className="metric-value" style={{ color: REASON_COLORS.irrecoverably_damaged.color }}>{reportStats.damaged}</div>
                        </div>
                        <div className="metric-icon-box" style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}><X size={22} style={{ color: '#f97316' }} /></div>
                    </div>
                    <div className="metric-card color-amber" style={{ padding: 'var(--space-5)' }}>
                        <div className="metric-info">
                            <div className="metric-title">{t('assetIncidentReports.pendingSignature')}</div>
                            <div className="metric-value">{reportStats.pendingSignature}</div>
                        </div>
                        <div className="metric-icon-box"><Clock size={22} /></div>
                    </div>
                    <div className="metric-card color-emerald" style={{ padding: 'var(--space-5)' }}>
                        <div className="metric-info">
                            <div className="metric-title">{t('assetIncidentReports.fullySigned')}</div>
                            <div className="metric-value">{reportStats.fullySigned}</div>
                        </div>
                        <div className="metric-icon-box"><ShieldCheck size={22} /></div>
                    </div>
                </div>
            </div>

            {canCreate && showCreateForm && (
                <div className="modal-overlay ir-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetCreateForm(); }}>
                    <div className="modal-content ir-modal-content">
                        <div className="ir-modal-header">
                            <div className="ir-modal-header-left">
                                <div className="ir-modal-header-icon"><AlertTriangle size={14} /></div>
                                <h3 className="ir-modal-title">{t('assetIncidentReports.createReport')}</h3>
                            </div>
                            <button
                                type="button"
                                className="ir-modal-close"
                                onClick={resetCreateForm}
                                disabled={submitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="ir-modal-body">
                            <div className="ir-two-col">
                                {/* Left column: Asset selection */}
                                <div className="ir-col-left">
                                    <div className="ir-section">
                                        <div className="ir-section-header">
                                            <Search size={14} />
                                            <span>{t('assetIncidentReports.searchBySerial')}</span>
                                        </div>
                                        <input
                                            className="form-input"
                                            type="search"
                                            value={serialSearch}
                                            onChange={(e) => setSerialSearch(e.target.value)}
                                            placeholder={t('assetIncidentReports.searchPlaceholder')}
                                        />

                                        <div className="ir-asset-grid">
                                            {filteredAssets.length === 0 ? (
                                                <div className="ir-asset-empty">
                                                    {t('assetIncidentReports.noAssetsFound')}
                                                </div>
                                            ) : (
                                                filteredAssets.map((asset) => {
                                                    const isSelected = Number(form.asset) === Number(asset.asset_id);
                                                    return (
                                                        <div
                                                            key={asset.asset_id}
                                                            className={`ir-asset-card ${isSelected ? 'ir-asset-card-selected' : ''}`}
                                                            onClick={() => setForm((prev) => ({ ...prev, asset: asset.asset_id }))}
                                                        >
                                                            <div className="ir-asset-card-indicator" />
                                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                                <div className="ir-asset-card-name">
                                                                    {asset.asset_name || '-'}
                                                                </div>
                                                                <div className="ir-asset-card-meta">
                                                                    <span>#{asset.asset_id}</span>
                                                                    <span>·</span>
                                                                    <span>{asset.asset_serial_number || '-'}</span>
                                                                </div>
                                                            </div>
                                                            {asset.asset_status && (
                                                                <span className="ir-asset-card-status">
                                                                    {asset.asset_status}
                                                                </span>
                                                            )}
                                                            {isSelected && (
                                                                <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {selectedAsset && (
                                            <div className="ir-selected-asset">
                                                <div className="ir-selected-asset-icon">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="ir-selected-asset-content">
                                                    <div className="ir-selected-asset-label">{t('assetIncidentReports.selectedAsset')}</div>
                                                    <div className="ir-selected-asset-value">
                                                        #{selectedAsset.asset_id} — {selectedAsset.asset_name || t('common.unknown')}
                                                        <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                                                            ({selectedAsset.asset_serial_number || t('assetIncidentReports.noSerial')})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right column: Reason + Details + Signature */}
                                <div className="ir-col-right">
                                    {/* Section: Reason */}
                                    <div className="ir-section">
                                        <div className="ir-section-header">
                                            <AlertTriangle size={14} />
                                            <span>{t('assetIncidentReports.reason')}</span>
                                        </div>
                                        <div className="ir-reason-grid">
                                            {REASONS.map((reason) => {
                                                const isSelected = form.reason === reason.value;
                                                const colors = REASON_COLORS[reason.value] || {};
                                                return (
                                                    <div
                                                        key={reason.value}
                                                        className={`ir-reason-card ${isSelected ? 'ir-reason-card-selected' : ''}`}
                                                        onClick={() => setForm((prev) => ({ ...prev, reason: reason.value }))}
                                                        style={isSelected ? {
                                                            background: colors.bg,
                                                            borderColor: colors.border,
                                                        } : {}}
                                                    >
                                                        <div className="ir-reason-card-dot" style={{ background: colors.bar || 'var(--color-text-muted)' }} />
                                                        <span className="ir-reason-card-label" style={isSelected ? { color: colors.color } : {}}>
                                                            {reason.label}
                                                        </span>
                                                        {isSelected && <CheckCircle2 size={14} style={{ color: colors.color, marginLeft: 'auto', flexShrink: 0 }} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Section: Details */}
                                    <div className="ir-section">
                                        <div className="ir-section-header">
                                            <FileText size={14} />
                                            <span>{t('assetIncidentReports.digitalCopy')}</span>
                                        </div>
                                        <label className="ir-file-upload">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => setForm((prev) => ({ ...prev, digital_copy: e.target.files?.[0] || null }))}
                                                style={{ display: 'none' }}
                                            />
                                            <Upload size={20} style={{ color: 'var(--color-text-muted)' }} />
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                                                {form.digital_copy ? form.digital_copy.name : t('assetIncidentReports.digitalCopyPdf')}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Section: Signature & Note */}
                                    <div className="ir-section">
                                        <div className="ir-section-header">
                                            <ShieldCheck size={14} />
                                            <span>{t('assetIncidentReports.signedByExploitationChief')}</span>
                                        </div>
                                        <label className="ir-toggle">
                                            <input
                                                type="checkbox"
                                                checked={!!form.is_signed_by_exploitation_chief}
                                                onChange={(e) => setForm((prev) => ({ ...prev, is_signed_by_exploitation_chief: e.target.checked }))}
                                            />
                                            <span className="ir-toggle-slider" />
                                            <span className="ir-toggle-label">
                                                {form.is_signed_by_exploitation_chief ? t('assetIncidentReports.signedByExploitationChief') : t('common.pending')}
                                            </span>
                                        </label>

                                        <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                                            <textarea
                                                className="form-textarea"
                                                rows={2}
                                                value={form.exploitation_chief_note}
                                                onChange={(e) => setForm((prev) => ({ ...prev, exploitation_chief_note: e.target.value }))}
                                                placeholder={t('assetIncidentReports.exploitationChiefNotePlaceholder')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="ir-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetCreateForm} disabled={submitting}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting || !form.asset}>
                                    {submitting ? t('assetIncidentReports.creating') : t('assetIncidentReports.createReport')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div
                    className="card-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>{t('assetIncidentReports.allIncidentReports')}</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {filteredReports.length} {t('assetIncidentReports.shown')}
                            {reasonFilter ? ` • ${(REASONS.find((r) => r.value === reasonFilter)?.label || reasonFilter)}` : ''}
                            {statusFilter ? ` • ${getStatusLabel(statusFilter)}` : ''}
                            {reportQuery.trim() ? ` • ${t('assetIncidentReports.searchApplied')}` : ''}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="form-input"
                            type="search"
                            value={reportQuery}
                            onChange={(e) => setReportQuery(e.target.value)}
                            placeholder={t('assetIncidentReports.searchReportsPlaceholder')}
                            style={{ width: 320, maxWidth: '100%' }}
                            aria-label={t('assetIncidentReports.searchReportsPlaceholder')}
                        />
                        <select
                            className="form-input"
                            value={reasonFilter}
                            onChange={(e) => setReasonFilter(e.target.value)}
                            style={{ width: 190 }}
                            aria-label={t('assetIncidentReports.filterByReason')}
                        >
                            <option value="">{t('assetIncidentReports.allReasons')}</option>
                            {REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="form-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: 170 }}
                            aria-label={t('assetIncidentReports.filterByStatus')}
                        >
                            <option value="">{t('assetIncidentReports.allStatus')}</option>
                            {statusOptions.map((s) => {
                                const label = getStatusLabel(s);
                                return (
                                    <option key={s} value={s}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                        {hasActiveReportFilters && (
                            <button type="button" className="btn btn-secondary" onClick={clearReportFilters}>
                                {t('common.clear')}
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4)' }}>
                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">{t('common.noResults')}</h3>
                            <p className="empty-state-text">{t('assetIncidentReports.tryAdjustingFilters')}</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                                gap: 'var(--space-4)',
                            }}
                        >
                            {filteredReports.map((report) => {
                                const assetTitle = report.asset_name || t('assetIncidentReports.assetFallback', { id: report.asset });
                                const serial = report.asset_serial_number || '-';
                                const reasonLabel = (i18n.language === 'ar' ? report.reason_ar : report.reason_en) || REASONS.find((r) => r.value === report.reason)?.label || report.reason || '-';
                                const statusDisplay = (i18n.language === 'ar' ? report.status_ar : report.status_en) || getStatusLabel(report.status) || '-';
                                const reasonColor = REASON_COLORS[report.reason] || {};
                                const statusStyle = STATUS_STYLES[report.status] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' };

                                return (
                                    <div
                                        key={report.asset_incident_report_id}
                                        style={{
                                            position: 'relative',
                                            padding: 'var(--space-4) var(--space-4) var(--space-4) calc(var(--space-4) + 4px)',
                                            background: 'var(--color-bg-card)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: 4,
                                            background: reasonColor.bar || 'var(--color-accent-primary)',
                                        }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {assetTitle}
                                                </div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                                                    {serial} · #{report.asset_incident_report_id}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 6 }}>
                                                    {[
                                                        report.asset_type_label && { title: t('assetIncidentReports.assetType'), value: report.asset_type_label },
                                                        report.asset_brand_name && { title: t('assetIncidentReports.assetBrand'), value: report.asset_brand_name },
                                                        report.asset_model_name && { title: t('assetIncidentReports.assetModel'), value: report.asset_model_name },
                                                        report.asset_inventory_number && { title: t('assetIncidentReports.inventoryNumber'), value: report.asset_inventory_number },
                                                        report.asset_service_tag && { title: t('assetIncidentReports.serviceTag'), value: report.asset_service_tag },
                                                        report.asset_status && { title: t('assetIncidentReports.assetStatus'), value: report.asset_status },
                                                    ].filter(Boolean).map((item) => (
                                                        <span key={item.title} title={`${item.title}: ${item.value}`} style={{
                                                            fontSize: '0.72rem',
                                                            padding: '2px 8px',
                                                            borderRadius: 'var(--radius-full)',
                                                            background: 'rgba(255, 255, 255, 0.06)',
                                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                                            color: 'var(--color-text-secondary)',
                                                            whiteSpace: 'nowrap',
                                                        }}>{item.value}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: reasonColor.bg || 'rgba(255,255,255,0.06)',
                                                    color: reasonColor.color || 'var(--color-text-secondary)',
                                                    border: `1px solid ${reasonColor.border || 'transparent'}`,
                                                }}>
                                                    {reasonLabel}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color,
                                                }}>
                                                    {statusDisplay}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'var(--space-3)' }}>
                                            {renderSigningPipeline(report)}
                                        </div>

                                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {availableReviewRoles.length > 0 && (
                                                <button type="button" className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.82rem' }} onClick={() => openReviewModal(report)}>
                                                    {t('assetIncidentReports.reviewSign')}
                                                </button>
                                            )}
                                            {isOwnerOfReport(report) && (
                                                <button type="button" className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.82rem', whiteSpace: 'nowrap', width: 'auto' }} onClick={() => openOwnerModal(report)}>
                                                    {t('assetIncidentReports.ownerNote')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {reviewingReport && (
                <div className="modal-overlay rv-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReviewModal(); }}>
                    <div className="modal-content rv-modal-content">
                        <div className="rv-modal-header">
                            <div className="rv-modal-header-left">
                                <div className="rv-modal-header-icon"><ShieldCheck size={14} /></div>
                                <h3 className="rv-modal-title">{t('assetIncidentReports.reviewReportTitle', { id: reviewingReport.asset_incident_report_id })}</h3>
                            </div>
                            <button
                                type="button"
                                className="rv-modal-close"
                                onClick={closeReviewModal}
                                disabled={reviewSubmitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={submitRoleReview} className="rv-modal-body">
                            <div className="rv-two-col">
                                {/* Left column: Report info + Role */}
                                <div className="rv-col-left">
                                    {/* Report info */}
                                    <div className="rv-section">
                                        <div className="rv-section-header">
                                            <FileText size={14} />
                                            <span>{t('assetIncidentReports.asset')}</span>
                                        </div>
                                        <div className="rv-info-col">
                                            <div className="rv-info-card">
                                                <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                    <FileText size={14} />
                                                </div>
                                                <div className="rv-info-card-content">
                                                    <div className="rv-info-card-label">{t('assetIncidentReports.asset')}</div>
                                                    <div className="rv-info-card-value">{reviewingReport.asset_name || '#' + reviewingReport.asset}</div>
                                                </div>
                                            </div>
                                            {reviewingReport.asset_type_label && (
                                                <div className="rv-info-card">
                                                    <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="rv-info-card-content">
                                                        <div className="rv-info-card-label">{t('assetIncidentReports.assetType')}</div>
                                                        <div className="rv-info-card-value">{reviewingReport.asset_type_label}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {reviewingReport.asset_brand_name && (
                                                <div className="rv-info-card">
                                                    <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="rv-info-card-content">
                                                        <div className="rv-info-card-label">{t('assetIncidentReports.assetBrand')}</div>
                                                        <div className="rv-info-card-value">{reviewingReport.asset_brand_name}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {reviewingReport.asset_model_name && (
                                                <div className="rv-info-card">
                                                    <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="rv-info-card-content">
                                                        <div className="rv-info-card-label">{t('assetIncidentReports.assetModel')}</div>
                                                        <div className="rv-info-card-value">{reviewingReport.asset_model_name}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {reviewingReport.asset_inventory_number && (
                                                <div className="rv-info-card">
                                                    <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="rv-info-card-content">
                                                        <div className="rv-info-card-label">{t('assetIncidentReports.inventoryNumber')}</div>
                                                        <div className="rv-info-card-value">{reviewingReport.asset_inventory_number}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {reviewingReport.asset_service_tag && (
                                                <div className="rv-info-card">
                                                    <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="rv-info-card-content">
                                                        <div className="rv-info-card-label">{t('assetIncidentReports.serviceTag')}</div>
                                                        <div className="rv-info-card-value">{reviewingReport.asset_service_tag}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {reviewingReport.asset_status && (
                                                <div className="rv-info-card">
                                                    <div className="rv-info-card-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-primary)' }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="rv-info-card-content">
                                                        <div className="rv-info-card-label">{t('assetIncidentReports.assetStatus')}</div>
                                                        <div className="rv-info-card-value">{reviewingReport.asset_status}</div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="rv-info-card">
                                                <div className="rv-info-card-icon" style={{ background: (REASON_COLORS[reviewingReport.reason] || {}).bg || 'rgba(255,255,255,0.06)', color: (REASON_COLORS[reviewingReport.reason] || {}).color || 'var(--color-text-secondary)' }}>
                                                    <AlertTriangle size={14} />
                                                </div>
                                                <div className="rv-info-card-content">
                                                    <div className="rv-info-card-label">{t('assetIncidentReports.reason')}</div>
                                                    <div className="rv-info-card-value">{(i18n.language === 'ar' ? reviewingReport.reason_ar : reviewingReport.reason_en) || REASONS.find((r) => r.value === reviewingReport.reason)?.label || reviewingReport.reason}</div>
                                                </div>
                                            </div>
                                            <div className="rv-info-card">
                                                <div className="rv-info-card-icon" style={{ background: (STATUS_STYLES[reviewingReport.status] || {}).bg || 'rgba(255,255,255,0.06)', color: (STATUS_STYLES[reviewingReport.status] || {}).color || 'var(--color-text-secondary)' }}>
                                                    <Clock size={14} />
                                                </div>
                                                <div className="rv-info-card-content">
                                                    <div className="rv-info-card-label">{t('assetIncidentReports.status')}</div>
                                                    <div className="rv-info-card-value">{(i18n.language === 'ar' ? reviewingReport.status_ar : reviewingReport.status_en) || getStatusLabel(reviewingReport.status)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Role selection */}
                                    <div className="rv-section">
                                        <div className="rv-section-header">
                                            <ShieldCheck size={14} />
                                            <span>{t('assetIncidentReports.signingAs')}</span>
                                        </div>
                                        <div className="rv-role-grid">
                                            {availableReviewRoles.map((roleCode) => {
                                                const isActive = reviewRole === roleCode;
                                                const roleConfig = REVIEW_ROLE_CONFIG[roleCode];
                                                const isAlreadySigned = !!reviewingReport?.[roleConfig?.signField];
                                                return (
                                                    <div
                                                        key={roleCode}
                                                        className={`rv-role-card ${isActive ? 'rv-role-card-active' : ''} ${isAlreadySigned ? 'rv-role-card-signed' : ''}`}
                                                        onClick={() => !reviewSubmitting && setReviewRole(roleCode)}
                                                    >
                                                        <span className="rv-role-card-label">{t(roleConfig?.labelKey) || roleCode}</span>
                                                        {isAlreadySigned && <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Signature + Note + Items */}
                                <div className="rv-col-right">
                                    {/* Section: Signature */}
                                    <div className="rv-section">
                                        <div className="rv-section-header">
                                            <CheckCircle2 size={14} />
                                            <span>{t('assetIncidentReports.signReportAs', { role: t(REVIEW_ROLE_CONFIG[reviewRole]?.labelKey) || reviewRole })}</span>
                                        </div>
                                        <label className="ir-toggle">
                                            <input
                                                type="checkbox"
                                                checked={!!reviewDraft.signed}
                                                onChange={(e) => setReviewDraft((prev) => ({ ...prev, signed: e.target.checked }))}
                                                disabled={reviewSubmitting}
                                            />
                                            <span className="ir-toggle-slider" />
                                            <span className="ir-toggle-label">
                                                {reviewDraft.signed ? t('assetIncidentReports.signed') : t('common.pending')}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Section: Note */}
                                    <div className="rv-section">
                                        <div className="rv-section-header">
                                            <FileText size={14} />
                                            <span>{t('assetIncidentReports.yourNote')}</span>
                                        </div>
                                        <textarea
                                            className="form-textarea"
                                            rows={2}
                                            value={reviewDraft.note}
                                            onChange={(e) => setReviewDraft((prev) => ({ ...prev, note: e.target.value }))}
                                            placeholder={t('assetIncidentReports.addYourNote')}
                                            disabled={reviewSubmitting}
                                        />
                                    </div>

                                    {/* Section: Exploitation chief — item selection */}
                                    {reviewRole === 'exploitation_chief' && (
                                        <div className="rv-section">
                                            <div className="rv-section-header">
                                                <AlertTriangle size={14} />
                                                <span>{t('assetIncidentReports.applyStatusToAll')}</span>
                                            </div>
                                            <label className="ir-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={!!reviewDraft.apply_status_to_all_composing_items}
                                                    onChange={(e) =>
                                                        setReviewDraft((prev) => ({
                                                            ...prev,
                                                            apply_status_to_all_composing_items: e.target.checked,
                                                            stock_item_ids: e.target.checked ? reviewingAssetStockItemIds : prev.stock_item_ids,
                                                            consumable_ids: e.target.checked ? reviewingAssetConsumableIds : prev.consumable_ids,
                                                        }))
                                                    }
                                                    disabled={reviewSubmitting}
                                                />
                                                <span className="ir-toggle-slider" />
                                                <span className="ir-toggle-label">
                                                    {reviewDraft.apply_status_to_all_composing_items ? t('assetIncidentReports.applyStatusToAll') : t('assetIncidentReports.selectItems')}
                                                </span>
                                            </label>

                                            {!reviewDraft.apply_status_to_all_composing_items && (
                                                <div className="rv-items-grid">
                                                    <div className="rv-items-col">
                                                        <div className="rv-items-col-title">{t('assetIncidentReports.stockItems')}</div>
                                                        {reviewingAssetStockItems.length === 0 ? (
                                                            <div className="rv-items-empty">{t('assetIncidentReports.noComposingStockItems')}</div>
                                                        ) : (
                                                            reviewingAssetStockItems.map((item) => {
                                                                const itemId = Number(item?.stock_item_id);
                                                                const checked = Array.isArray(reviewDraft.stock_item_ids) && reviewDraft.stock_item_ids.includes(itemId);
                                                                return (
                                                                    <label key={itemId} className="rv-item-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) =>
                                                                                setReviewDraft((prev) => {
                                                                                    const current = Array.isArray(prev.stock_item_ids) ? prev.stock_item_ids : [];
                                                                                    const next = e.target.checked
                                                                                        ? Array.from(new Set([...current, itemId]))
                                                                                        : current.filter((id) => Number(id) !== itemId);
                                                                                    return { ...prev, stock_item_ids: next };
                                                                                })
                                                                            }
                                                                            disabled={reviewSubmitting}
                                                                        />
                                                                        <span>#{itemId} — {item?.stock_item_name || t('common.unknown')}</span>
                                                                    </label>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    <div className="rv-items-col">
                                                        <div className="rv-items-col-title">{t('assetIncidentReports.consumables')}</div>
                                                        {reviewingAssetConsumables.length === 0 ? (
                                                            <div className="rv-items-empty">{t('assetIncidentReports.noComposingConsumables')}</div>
                                                        ) : (
                                                            reviewingAssetConsumables.map((item) => {
                                                                const itemId = Number(item?.consumable_id);
                                                                const checked = Array.isArray(reviewDraft.consumable_ids) && reviewDraft.consumable_ids.includes(itemId);
                                                                return (
                                                                    <label key={itemId} className="rv-item-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) =>
                                                                                setReviewDraft((prev) => {
                                                                                    const current = Array.isArray(prev.consumable_ids) ? prev.consumable_ids : [];
                                                                                    const next = e.target.checked
                                                                                        ? Array.from(new Set([...current, itemId]))
                                                                                        : current.filter((id) => Number(id) !== itemId);
                                                                                    return { ...prev, consumable_ids: next };
                                                                                })
                                                                            }
                                                                            disabled={reviewSubmitting}
                                                                        />
                                                                        <span>#{itemId} — {item?.consumable_name || t('common.unknown')}</span>
                                                                    </label>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="rv-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeReviewModal} disabled={reviewSubmitting}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting || !reviewRole}>
                                    {reviewSubmitting ? t('common.saving') : t('assetIncidentReports.saveReview')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showItemStatusModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">{t('assetIncidentReports.setStatusForItems')}</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => !submitting && setShowItemStatusModal(false)}
                                disabled={submitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={submitItemStatusModal} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">{t('assetIncidentReports.stockItems')}</label>
                                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                    {selectedAssetStockItems.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('assetIncidentReports.noComposingStockItems')}</div>
                                    ) : (
                                        selectedAssetStockItems.map((item) => {
                                            const itemId = Number(item?.stock_item_id);
                                            return (
                                                <div key={itemId} style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                                    <span>#{itemId} - {item?.stock_item_name || t('common.unknown')}</span>
                                                    <select
                                                        className="form-select"
                                                        value={itemStatusDraft.stock_item_statuses?.[itemId] || form.reason}
                                                        onChange={(e) =>
                                                            setItemStatusDraft((prev) => ({
                                                                ...prev,
                                                                stock_item_statuses: {
                                                                    ...(prev.stock_item_statuses || {}),
                                                                    [itemId]: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                        disabled={submitting}
                                                    >
                                                        {REASONS.map((reason) => (
                                                            <option key={reason.value} value={reason.value}>{reason.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('assetIncidentReports.consumables')}</label>
                                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                    {selectedAssetConsumables.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('assetIncidentReports.noComposingConsumables')}</div>
                                    ) : (
                                        selectedAssetConsumables.map((item) => {
                                            const itemId = Number(item?.consumable_id);
                                            return (
                                                <div key={itemId} style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                                    <span>#{itemId} - {item?.consumable_name || t('common.unknown')}</span>
                                                    <select
                                                        className="form-select"
                                                        value={itemStatusDraft.consumable_statuses?.[itemId] || form.reason}
                                                        onChange={(e) =>
                                                            setItemStatusDraft((prev) => ({
                                                                ...prev,
                                                                consumable_statuses: {
                                                                    ...(prev.consumable_statuses || {}),
                                                                    [itemId]: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                        disabled={submitting}
                                                    >
                                                        {REASONS.map((reason) => (
                                                            <option key={reason.value} value={reason.value}>{reason.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowItemStatusModal(false)} disabled={submitting}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? t('common.submitting') : t('assetIncidentReports.submitIncidentReport')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {ownerEditingReport && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">{t('assetIncidentReports.ownerNoteTitle', { id: ownerEditingReport.asset_incident_report_id })}</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeOwnerModal}
                                disabled={ownerSubmitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={submitOwnerReview} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">{t('assetIncidentReports.ownerNoteLabel')}</label>
                                <textarea
                                    className="form-textarea"
                                    rows={5}
                                    value={ownerDraft.owner_note}
                                    onChange={(e) => setOwnerDraft((prev) => ({ ...prev, owner_note: e.target.value }))}
                                    placeholder={t('assetIncidentReports.ownerNotePlaceholder')}
                                    disabled={ownerSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!ownerDraft.is_signed_by_owner}
                                        onChange={(e) => setOwnerDraft((prev) => ({ ...prev, is_signed_by_owner: e.target.checked }))}
                                        disabled={ownerSubmitting}
                                    />
                                    <span>{t('assetIncidentReports.confirmSignOwnerNote')}</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                                <button type="button" className="btn btn-secondary" onClick={closeOwnerModal} disabled={ownerSubmitting}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={ownerSubmitting}>
                                    {ownerSubmitting ? t('common.saving') : t('assetIncidentReports.saveOwnerNote')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetIncidentReportsPage;
