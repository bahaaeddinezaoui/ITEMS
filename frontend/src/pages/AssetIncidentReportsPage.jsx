import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { assetIncidentReportService, assetService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const REASONS = [
    { value: 'stolen', label: 'Stolen' },
    { value: 'lost', label: 'Lost' },
    { value: 'irrecoverably_damaged', label: 'Irrecoverably Damaged' },
];
const INCIDENT_COMPOSITION_STRATEGY_STORAGE_KEY = 'incidentReportCompositionStatusStrategy';

const REVIEW_ROLE_CONFIG = {
    it_bureau_chief: {
        label: 'IT Bureau Chief',
        noteField: 'it_bureau_chief_note',
        signField: 'is_signed_by_it_bureau_chief',
    },
    exploitation_chief: {
        label: 'Exploitation Chief',
        noteField: 'exploitation_chief_note',
        signField: 'is_signed_by_exploitation_chief',
    },
    protection_and_security_bureau_chief: {
        label: 'Protection & Security Bureau Chief',
        noteField: 'protection_and_security_bureau_chief_note',
        signField: 'is_signed_by_protection_and_security_bureau_chief',
    },
    school_headquarter: {
        label: 'School Headquarter',
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

const AssetIncidentReportsPage = () => {
    const { user, isSuperuser } = useAuth();

    const roleCodes = useMemo(
        () => (Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : []),
        [user]
    );
    const canView = isSuperuser || REVIEW_ROLE_ORDER.some((roleCode) => roleCodes.includes(roleCode));
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
    const [reports, setReports] = useState([]);
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
    const [showItemStatusModal, setShowItemStatusModal] = useState(false);
    const [itemStatusDraft, setItemStatusDraft] = useState({
        stock_item_statuses: {},
        consumable_statuses: {},
    });

    const [form, setForm] = useState({
        asset: '',
        reason: 'stolen',
        owner_note: '',
        is_signed_by_exploitation_chief: true,
        exploitation_chief_note: '',
        apply_status_to_all_composing_items: true,
        stock_item_ids: [],
        consumable_ids: [],
        digital_copy: null,
    });

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
        const [reportResult, assetResult] = await Promise.allSettled([
            assetIncidentReportService.getAll(),
            assetService.getAll(),
        ]);

        if (reportResult.status === 'fulfilled') {
            const reportData = reportResult.value;
            const reportList = reportData?.results || reportData || [];
            setReports(Array.isArray(reportList) ? reportList : []);
        } else {
            setReports([]);
            setError(reportResult.reason?.response?.data?.error || 'Failed to load incident reports');
        }

        if (assetResult.status === 'fulfilled') {
            const assetData = assetResult.value;
            const assetList = assetData?.results || assetData || [];
            setAssets(Array.isArray(assetList) ? assetList : []);
        } else {
            setAssets([]);
            if (reportResult.status === 'fulfilled') {
                setError('Incident reports loaded, but asset search is unavailable');
            }
        }

        if (reportResult.status === 'fulfilled' && assetResult.status === 'fulfilled') {
            setError('');
        }
        setLoading(false);
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
            owner_note: '',
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
            payload.append('owner_note', form.owner_note || '');
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
            setSuccess('Incident report created successfully');
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to create incident report');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAssets = useMemo(() => {
        const query = serialSearch.trim().toLowerCase();
        if (!query) return assets.slice(0, 20);
        return assets
            .filter((a) => ((a?.asset_serial_number || '').toString().toLowerCase().includes(query)))
            .slice(0, 30);
    }, [assets, serialSearch]);

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
            setError('Select an asset first');
            return;
        }
        if (!form.reason) {
            setError('Reason is required');
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
            setSuccess(`${roleConfig.label} review saved`);
            closeReviewModal();
        } catch (e2) {
            setError(e2?.response?.data?.error || 'Failed to save review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Incident Reports</h1>
                    <p className="page-subtitle">Consult incident reports and sign them with role-specific notes</p>
                </div>
                {canCreate && (
                    <button
                        className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                        onClick={() => setShowCreateForm((prev) => !prev)}
                    >
                        {showCreateForm ? 'Cancel' : '+ New Incident Report'}
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div className="badge badge-success" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    {success}
                </div>
            )}

            {canCreate && showCreateForm && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Create Incident Report</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Search asset by serial number</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={serialSearch}
                                    onChange={(e) => setSerialSearch(e.target.value)}
                                    placeholder="Type full or partial serial number"
                                />
                            </div>

                            <div className="table-container" style={{ marginBottom: 'var(--space-4)' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Asset ID</th>
                                            <th>Serial Number</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Select</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssets.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No assets found for this serial search.</td>
                                            </tr>
                                        ) : (
                                            filteredAssets.map((asset) => (
                                                <tr key={asset.asset_id}>
                                                    <td>{asset.asset_id}</td>
                                                    <td>{asset.asset_serial_number || '-'}</td>
                                                    <td>{asset.asset_name || '-'}</td>
                                                    <td>{asset.asset_status || '-'}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-${Number(form.asset) === Number(asset.asset_id) ? 'secondary' : 'primary'}`}
                                                            onClick={() => setForm((prev) => ({ ...prev, asset: asset.asset_id }))}
                                                        >
                                                            {Number(form.asset) === Number(asset.asset_id) ? 'Selected' : 'Select'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {selectedAsset && (
                                <div className="badge badge-info" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
                                    Selected Asset: #{selectedAsset.asset_id} - {selectedAsset.asset_name || 'Unnamed'} ({selectedAsset.asset_serial_number || 'No serial'})
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <select
                                        className="form-select"
                                        value={form.reason}
                                        onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                                    >
                                        {REASONS.map((reason) => (
                                            <option key={reason.value} value={reason.value}>{reason.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Digital Copy (PDF)</label>
                                    <input
                                        className="form-input"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setForm((prev) => ({ ...prev, digital_copy: e.target.files?.[0] || null }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Owner Note</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={form.owner_note}
                                    onChange={(e) => setForm((prev) => ({ ...prev, owner_note: e.target.value }))}
                                    placeholder="Describe what happened according to the owner"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!form.is_signed_by_exploitation_chief}
                                        onChange={(e) => setForm((prev) => ({ ...prev, is_signed_by_exploitation_chief: e.target.checked }))}
                                    />
                                    <span>Signed by exploitation chief</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Exploitation Chief Note</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={form.exploitation_chief_note}
                                    onChange={(e) => setForm((prev) => ({ ...prev, exploitation_chief_note: e.target.value }))}
                                    placeholder="Optional note from exploitation chief"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Incident Report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Incident Reports</h2>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Asset</th>
                                <th>Serial</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>IT Chief</th>
                                <th>Exploitation Chief</th>
                                <th>Protection Chief</th>
                                <th>School HQ</th>
                                {availableReviewRoles.length > 0 && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={availableReviewRoles.length > 0 ? 10 : 9} style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                        No incident reports found.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.asset_incident_report_id}>
                                        <td>{report.asset_incident_report_id}</td>
                                        <td>{report.asset_name || `Asset #${report.asset}`}</td>
                                        <td>{report.asset_serial_number || '-'}</td>
                                        <td>{report.reason || '-'}</td>
                                        <td>{report.status || '-'}</td>
                                        <td>{report.is_signed_by_it_bureau_chief ? 'Signed' : 'Pending'}</td>
                                        <td>{report.is_signed_by_exploitation_chief ? 'Signed' : 'Pending'}</td>
                                        <td>{report.is_signed_by_protection_and_security_bureau_chief ? 'Signed' : 'Pending'}</td>
                                        <td>{report.is_signed_by_school_headquarter ? 'Signed' : 'Pending'}</td>
                                        {availableReviewRoles.length > 0 && (
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => openReviewModal(report)}
                                                >
                                                    Review / Sign
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {reviewingReport && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Review Incident Report #{reviewingReport.asset_incident_report_id}</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeReviewModal}
                                disabled={reviewSubmitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={submitRoleReview} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Signing as</label>
                                <select
                                    className="form-select"
                                    value={reviewRole}
                                    onChange={(e) => setReviewRole(e.target.value)}
                                    disabled={reviewSubmitting}
                                >
                                    {availableReviewRoles.map((roleCode) => (
                                        <option key={roleCode} value={roleCode}>
                                            {REVIEW_ROLE_CONFIG[roleCode]?.label || roleCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Your note</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={reviewDraft.note}
                                    onChange={(e) => setReviewDraft((prev) => ({ ...prev, note: e.target.value }))}
                                    placeholder="Add your note"
                                    disabled={reviewSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!reviewDraft.signed}
                                        onChange={(e) => setReviewDraft((prev) => ({ ...prev, signed: e.target.checked }))}
                                        disabled={reviewSubmitting}
                                    />
                                    <span>Sign this report as {REVIEW_ROLE_CONFIG[reviewRole]?.label || reviewRole}</span>
                                </label>
                            </div>

                            {reviewRole === 'exploitation_chief' && (
                                <>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
                                            <span>Apply asset status to all composing items</span>
                                        </label>
                                    </div>

                                    {!reviewDraft.apply_status_to_all_composing_items && (
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Stock Items</label>
                                                <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                                    {reviewingAssetStockItems.length === 0 ? (
                                                        <div style={{ color: 'var(--color-text-secondary)' }}>No composing stock items.</div>
                                                    ) : (
                                                        reviewingAssetStockItems.map((item) => {
                                                            const itemId = Number(item?.stock_item_id);
                                                            const checked = Array.isArray(reviewDraft.stock_item_ids) && reviewDraft.stock_item_ids.includes(itemId);
                                                            return (
                                                                <label key={itemId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
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
                                                                    <span>#{itemId} - {item?.stock_item_name || 'Unnamed'}</span>
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Consumables</label>
                                                <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                                    {reviewingAssetConsumables.length === 0 ? (
                                                        <div style={{ color: 'var(--color-text-secondary)' }}>No composing consumables.</div>
                                                    ) : (
                                                        reviewingAssetConsumables.map((item) => {
                                                            const itemId = Number(item?.consumable_id);
                                                            const checked = Array.isArray(reviewDraft.consumable_ids) && reviewDraft.consumable_ids.includes(itemId);
                                                            return (
                                                                <label key={itemId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
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
                                                                    <span>#{itemId} - {item?.consumable_name || 'Unnamed'}</span>
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                                <button type="button" className="btn btn-secondary" onClick={closeReviewModal} disabled={reviewSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting || !reviewRole}>
                                    {reviewSubmitting ? 'Saving...' : 'Save Review'}
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
                            <h3 className="modal-title">Set status for each composing item</h3>
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
                                <label className="form-label">Stock Items</label>
                                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                    {selectedAssetStockItems.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No composing stock items.</div>
                                    ) : (
                                        selectedAssetStockItems.map((item) => {
                                            const itemId = Number(item?.stock_item_id);
                                            return (
                                                <div key={itemId} style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                                    <span>#{itemId} - {item?.stock_item_name || 'Unnamed'}</span>
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
                                <label className="form-label">Consumables</label>
                                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                    {selectedAssetConsumables.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No composing consumables.</div>
                                    ) : (
                                        selectedAssetConsumables.map((item) => {
                                            const itemId = Number(item?.consumable_id);
                                            return (
                                                <div key={itemId} style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                                    <span>#{itemId} - {item?.consumable_name || 'Unnamed'}</span>
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
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Incident Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssetIncidentReportsPage;
