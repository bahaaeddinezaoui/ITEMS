import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { companyAssetRequestService, attributionOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const getRequestSignatureFields = (t) => [
    { key: 'is_signed_by_company', label: t('companyAssetRequests.company'), fullLabel: t('companyAssetRequests.signedByCompany'), short: 'C' },
    { key: 'is_signed_by_company_leader', label: t('companyAssetRequests.leader'), fullLabel: t('companyAssetRequests.signedByLeader'), short: 'L' },
    { key: 'is_signed_by_regional_provider', label: t('companyAssetRequests.regional'), fullLabel: t('companyAssetRequests.signedByRegional'), short: 'R' },
    { key: 'is_signed_by_company_representative', label: t('companyAssetRequests.representative'), fullLabel: t('companyAssetRequests.signedByRepresentative'), short: 'Rep' },
];

const CompanyAssetRequestsPage = () => {
    const { t } = useTranslation();
    const { user, isSuperuser } = useAuth();

    const isAssetResponsible = isSuperuser || user?.roles?.some(role => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState([]);
    const [ordersById, setOrdersById] = useState({});

    const attributionOrdersWithRequest = useMemo(() => {
        const list = Array.isArray(requests) ? requests : [];
        return new Set(
            list
                .map((r) => Number(r?.attribution_order))
                .filter((id) => Number.isFinite(id) && id > 0)
        );
    }, [requests]);

    const requestStats = useMemo(() => {
        const list = Array.isArray(requests) ? requests : [];
        let fullySignedCount = 0;
        let withDigitalCopyCount = 0;

        list.forEach((r) => {
            const fullySigned = getRequestSignatureFields(t).every((field) => !!r?.[field.key]);
            if (fullySigned) fullySignedCount += 1;
            if (r?.digital_copy) withDigitalCopyCount += 1;
        });

        return {
            total: list.length,
            fullySignedCount,
            pendingSignaturesCount: Math.max(list.length - fullySignedCount, 0),
            withDigitalCopyCount,
        };
    }, [requests]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        attribution_order: '',
        administrative_serial_number: '',
        title_of_demand: '',
        organization_body_designation: '',
        register_number_or_book_journal_of_corpse: '',
        register_number_or_book_journal_of_establishment: '',
        is_signed_by_company: false,
        is_signed_by_company_leader: false,
        is_signed_by_regional_provider: false,
        is_signed_by_company_representative: false,
        digital_copy: null,
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [editForm, setEditForm] = useState({
        is_signed_by_company: false,
        is_signed_by_company_leader: false,
        is_signed_by_regional_provider: false,
        is_signed_by_company_representative: false,
    });

    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [pendingSaveFields, setPendingSaveFields] = useState([]);

    const [showAllSignaturesModal, setShowAllSignaturesModal] = useState(false);

    const openEditModal = (req) => {
        if (!req) return;
        setEditingRequest(req);
        setEditForm({
            is_signed_by_company: !!req.is_signed_by_company,
            is_signed_by_company_leader: !!req.is_signed_by_company_leader,
            is_signed_by_regional_provider: !!req.is_signed_by_regional_provider,
            is_signed_by_company_representative: !!req.is_signed_by_company_representative,
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingRequest(null);
        setShowSaveConfirmModal(false);
        setPendingSaveFields([]);
        setShowAllSignaturesModal(false);
        setEditForm({
            is_signed_by_company: false,
            is_signed_by_company_leader: false,
            is_signed_by_regional_provider: false,
            is_signed_by_company_representative: false,
        });
    };

    const closeAllSignaturesModal = () => {
        setShowAllSignaturesModal(false);
        closeEditModal();
    };

    const requestToggleSignature = (field, nextChecked) => {
        if (!field) return;
        const originallyTrue = !!editingRequest?.[field];

        if (originallyTrue && !nextChecked) {
            return;
        }

        setEditForm((prev) => ({
            ...prev,
            [field]: !!nextChecked,
        }));
    };

    const doSaveSignatures = async () => {
        if (!editingRequest?.company_asset_request_id) return;

        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const updated = await companyAssetRequestService.update(editingRequest.company_asset_request_id, {
                is_signed_by_company: !!editForm.is_signed_by_company,
                is_signed_by_company_leader: !!editForm.is_signed_by_company_leader,
                is_signed_by_regional_provider: !!editForm.is_signed_by_regional_provider,
                is_signed_by_company_representative: !!editForm.is_signed_by_company_representative,
            });

            const data = await companyAssetRequestService.getAll();
            const reqList = data?.results || data || [];
            setRequests(reqList);

            const allEstablished = !!updated?.is_signed_by_company
                && !!updated?.is_signed_by_company_leader
                && !!updated?.is_signed_by_regional_provider
                && !!updated?.is_signed_by_company_representative;

            if (allEstablished) {
                setShowAllSignaturesModal(true);
            } else {
                setSuccess(t('companyAssetRequests.signaturesUpdated'));
                closeEditModal();
            }
        } catch (err) {
            setError(err?.response?.data?.error || t('companyAssetRequests.updateSignaturesFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    const signatureFieldLabel = (field) => getRequestSignatureFields(t).find((f) => f.key === field)?.fullLabel || field;

    const handleSaveSignatures = async (e) => {
        e.preventDefault();

        const fields = [
            'is_signed_by_company',
            'is_signed_by_company_leader',
            'is_signed_by_regional_provider',
            'is_signed_by_company_representative',
        ];

        const newlyTrueFields = fields.filter((f) => !editingRequest?.[f] && !!editForm?.[f]);

        if (newlyTrueFields.length > 0) {
            setPendingSaveFields(newlyTrueFields);
            setShowSaveConfirmModal(true);
            return;
        }

        await doSaveSignatures();
    };

    const confirmSaveSignatures = async () => {
        setShowSaveConfirmModal(false);
        setPendingSaveFields([]);
        await doSaveSignatures();
    };

    const cancelSaveSignatures = () => {
        setShowSaveConfirmModal(false);
        setPendingSaveFields([]);
    };

    useEffect(() => {
        if (!isAssetResponsible) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setSuccess(null);
            try {
                const [reqData, ordersData] = await Promise.all([
                    companyAssetRequestService.getAll(),
                    attributionOrderService.getAll(),
                ]);

                const reqList = reqData?.results || reqData || [];
                setRequests(reqList);

                const orders = ordersData?.results || ordersData || [];
                const map = {};
                orders.forEach(o => {
                    map[o.attribution_order_id] = o;
                });
                setOrdersById(map);
            } catch (err) {
                setError(t('companyAssetRequests.fetchError'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAssetResponsible]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const selectedOrderId = Number(createForm.attribution_order);
            if (!Number.isFinite(selectedOrderId) || selectedOrderId <= 0) {
                setError(t('companyAssetRequests.attributionOrderRequired'));
                return;
            }
            if (attributionOrdersWithRequest.has(selectedOrderId)) {
                setError(t('companyAssetRequests.orderAlreadyHasRequest'));
                return;
            }

            const formData = new FormData();
            formData.append('attribution_order', createForm.attribution_order);
            if (createForm.administrative_serial_number) formData.append('administrative_serial_number', createForm.administrative_serial_number);
            if (createForm.title_of_demand) formData.append('title_of_demand', createForm.title_of_demand);
            if (createForm.organization_body_designation) formData.append('organization_body_designation', createForm.organization_body_designation);
            if (createForm.register_number_or_book_journal_of_corpse) {
                formData.append('register_number_or_book_journal_of_corpse', createForm.register_number_or_book_journal_of_corpse);
            }
            if (createForm.register_number_or_book_journal_of_establishment) {
                formData.append('register_number_or_book_journal_of_establishment', createForm.register_number_or_book_journal_of_establishment);
            }
            formData.append('is_signed_by_company', !!createForm.is_signed_by_company);
            formData.append('is_signed_by_company_leader', !!createForm.is_signed_by_company_leader);
            formData.append('is_signed_by_regional_provider', !!createForm.is_signed_by_regional_provider);
            formData.append('is_signed_by_company_representative', !!createForm.is_signed_by_company_representative);
            if (createForm.digital_copy) formData.append('digital_copy', createForm.digital_copy);

            await companyAssetRequestService.create(formData);

            const data = await companyAssetRequestService.getAll();
            const reqList = data?.results || data || [];
            setRequests(reqList);

            setSuccess(t('companyAssetRequests.createSuccess'));
            setShowCreateForm(false);
            setCreateForm({
                attribution_order: '',
                administrative_serial_number: '',
                title_of_demand: '',
                organization_body_designation: '',
                register_number_or_book_journal_of_corpse: '',
                register_number_or_book_journal_of_establishment: '',
                is_signed_by_company: false,
                is_signed_by_company_leader: false,
                is_signed_by_regional_provider: false,
                is_signed_by_company_representative: false,
                digital_copy: null,
            });
        } catch (err) {
            setError(err.response?.data?.error || t('companyAssetRequests.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="company-asset-requests-page">
            <div className="card company-asset-requests-hero">
                <div className="company-asset-requests-header">
                    <div>
                        <h1 className="page-title">{t('companyAssetRequests.title')}</h1>
                        <p className="page-subtitle">{t('companyAssetRequests.subtitle')}</p>
                    </div>
                    <button className="btn btn-primary company-asset-requests-create-btn" onClick={() => setShowCreateForm(true)}>
                        {t('companyAssetRequests.newRequest')}
                    </button>
                </div>
                <div className="company-asset-requests-hero-foot">
                    <span className="badge badge-info">{t('companyAssetRequests.clickToEditSignatures')}</span>
                    <span className="badge badge-warning">{t('companyAssetRequests.signatureCannotBeReverted')}</span>
                </div>
            </div>

            <div className="stat-grid company-asset-requests-stat-grid">
                <div className="stat-card">
                    <div className="stat-value">{requestStats.total}</div>
                    <div className="stat-label">{t('companyAssetRequests.totalRequests')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{requestStats.fullySignedCount}</div>
                    <div className="stat-label">{t('companyAssetRequests.fullySigned')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{requestStats.pendingSignaturesCount}</div>
                    <div className="stat-label">{t('companyAssetRequests.pendingSignatures')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{requestStats.withDigitalCopyCount}</div>
                    <div className="stat-label">{t('companyAssetRequests.withDigitalCopy')}</div>
                </div>
            </div>

            {error && <div className="error-message company-asset-requests-alert">{error}</div>}
            {success && <div className="success-message company-asset-requests-alert">{success}</div>}

            <div className="card company-asset-requests-list-card">
                <div className="card-header">
                    <h2 className="card-title">{t('companyAssetRequests.allRequests')}</h2>
                    <div className="company-asset-requests-subtle-text">{t('companyAssetRequests.recordCount', { count: requests.length })}</div>
                </div>
                <div className="card-body">
                    {requests.length === 0 ? (
                        <div className="company-asset-requests-empty-state">{t('companyAssetRequests.noRequestsFound')}</div>
                    ) : (
                        <div className="company-asset-requests-list">
                            {requests.map((r) => {
                                const orderId = r.attribution_order;
                                const order = ordersById[orderId];
                                const fullySigned = getRequestSignatureFields(t).every((field) => !!r?.[field.key]);
                                return (
                                    <button
                                        key={r.company_asset_request_id}
                                        type="button"
                                        className="company-asset-requests-item"
                                        onClick={() => openEditModal(r)}
                                        title={t('companyAssetRequests.clickToEditSignatures')}
                                    >
                                        <div className="company-asset-requests-item-head">
                                            <div>
                                                <div className="company-asset-requests-item-title">{t('companyAssetRequests.requestId', { id: r.company_asset_request_id })}</div>
                                                <div className="company-asset-requests-item-subtitle">
                                                    {order?.attribution_order_full_code || `#${orderId}`}
                                                </div>
                                            </div>
                                            <div className="company-asset-requests-badges">
                                                <span className={`badge ${fullySigned ? 'badge-success' : 'badge-warning'}`}>
                                                    {fullySigned ? t('companyAssetRequests.fullySigned') : t('companyAssetRequests.pendingSignatures')}
                                                </span>
                                                <span className={`badge ${r.digital_copy ? 'badge-info' : 'badge-warning'}`}>
                                                    {r.digital_copy ? t('companyAssetRequests.copyAttached') : t('companyAssetRequests.noCopy')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="company-asset-requests-item-grid">
                                            <div>
                                                <div className="company-asset-requests-field-label">{t('companyAssetRequests.administrativeNumber')}</div>
                                                <div className="company-asset-requests-field-value">{r.administrative_serial_number || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">{t('companyAssetRequests.titleField')}</div>
                                                <div className="company-asset-requests-field-value">{r.title_of_demand || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">{t('companyAssetRequests.organizationBody')}</div>
                                                <div className="company-asset-requests-field-value">{r.organization_body_designation || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">{t('companyAssetRequests.regCorpse')}</div>
                                                <div className="company-asset-requests-field-value">{r.register_number_or_book_journal_of_corpse || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">{t('companyAssetRequests.regEstablishment')}</div>
                                                <div className="company-asset-requests-field-value">{r.register_number_or_book_journal_of_establishment || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="company-asset-requests-footer">
                                            <div className="company-asset-requests-signature-pill-list">
                                                {getRequestSignatureFields(t).map((field) => (
                                                    <span
                                                        key={`${r.company_asset_request_id}-${field.key}`}
                                                        className={`badge ${r?.[field.key] ? 'badge-success' : 'badge-error'}`}
                                                    >
                                                        {field.short}: {r?.[field.key] ? t('common.yes') : t('common.no')}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="company-asset-requests-subtle-text">{t('companyAssetRequests.editSignatures')}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showCreateForm && (
                <div className="modal-overlay company-asset-requests-modal-overlay" onClick={() => !submitting && setShowCreateForm(false)}>
                    <div className="modal company-asset-requests-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header company-asset-requests-modal-header">
                            <div>
                                <div className="modal-title">{t('companyAssetRequests.newCompanyAssetRequest')}</div>
                                <div className="company-asset-requests-subtle-text">{t('companyAssetRequests.completeRequestMetadata')}</div>
                            </div>
                            <button type="button" className="modal-close" disabled={submitting} onClick={() => setShowCreateForm(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <form onSubmit={handleCreate}>
                                {Object.keys(ordersById).length > 0 && attributionOrdersWithRequest.size >= Object.keys(ordersById).length && (
                                    <div className="company-asset-requests-modal-warning">
                                        {t('companyAssetRequests.allOrdersHaveRequest')}
                                    </div>
                                )}

                                <div className="company-asset-requests-form-grid">
                                    <div className="form-group">
                                        <select
                                            className="form-input"
                                            value={createForm.attribution_order}
                                            onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
                                            required
                                            aria-label={t('companyAssetRequests.attributionOrder')}
                                        >
                                            <option value="">{t('companyAssetRequests.attributionOrder')}</option>
                                            {Object.values(ordersById)
                                                .filter((o) => !attributionOrdersWithRequest.has(Number(o.attribution_order_id)))
                                                .map((o) => (
                                                    <option key={o.attribution_order_id} value={o.attribution_order_id}>
                                                        {o.attribution_order_full_code || `#${o.attribution_order_id}`}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.administrative_serial_number}
                                            onChange={(e) => setCreateForm({ ...createForm, administrative_serial_number: e.target.value })}
                                            placeholder={t('companyAssetRequests.administrativeSerialNumber')}
                                            aria-label={t('companyAssetRequests.administrativeSerialNumber')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.title_of_demand}
                                            onChange={(e) => setCreateForm({ ...createForm, title_of_demand: e.target.value })}
                                            placeholder={t('companyAssetRequests.titleOfDemand')}
                                            aria-label={t('companyAssetRequests.titleOfDemand')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.organization_body_designation}
                                            onChange={(e) => setCreateForm({ ...createForm, organization_body_designation: e.target.value })}
                                            placeholder={t('companyAssetRequests.organizationBodyDesignation')}
                                            aria-label={t('companyAssetRequests.organizationBodyDesignation')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.register_number_or_book_journal_of_corpse}
                                            onChange={(e) => setCreateForm({ ...createForm, register_number_or_book_journal_of_corpse: e.target.value })}
                                            placeholder={t('companyAssetRequests.registerCorpse')}
                                            aria-label={t('companyAssetRequests.registerCorpse')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.register_number_or_book_journal_of_establishment}
                                            onChange={(e) => setCreateForm({ ...createForm, register_number_or_book_journal_of_establishment: e.target.value })}
                                            placeholder={t('companyAssetRequests.registerEstablishment')}
                                            aria-label={t('companyAssetRequests.registerEstablishment')}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <input
                                            type="file"
                                            className="form-input"
                                            onChange={(e) => setCreateForm({ ...createForm, digital_copy: e.target.files[0] })}
                                            accept="image/*,application/pdf"
                                            aria-label={t('companyAssetRequests.digitalCopyAttachment')}
                                        />
                                    </div>
                                </div>

                                <div className="company-asset-requests-modal-signatures">
                                    {getRequestSignatureFields(t).map((field) => (
                                        <label key={field.key} className="company-asset-requests-signature-chip">
                                            <input
                                                type="checkbox"
                                                checked={!!createForm[field.key]}
                                                onChange={(e) =>
                                                    setCreateForm({
                                                        ...createForm,
                                                        [field.key]: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span>{field.fullLabel}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="company-asset-requests-modal-footer">
                                    <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} disabled={submitting} onClick={() => setShowCreateForm(false)}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary company-asset-requests-submit-btn" disabled={submitting}>
                                        {submitting ? t('common.creating') : t('companyAssetRequests.createRequest')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay company-asset-requests-modal-overlay" onClick={closeEditModal}>
                    <div className="modal company-asset-requests-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header company-asset-requests-modal-header">
                            <div>
                                <div className="modal-title">{t('companyAssetRequests.editSignaturesTitle')}</div>
                                <div className="company-asset-requests-subtle-text">{t('companyAssetRequests.requestId', { id: editingRequest?.company_asset_request_id })}</div>
                            </div>
                            <button type="button" className="modal-close" onClick={closeEditModal}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <form onSubmit={handleSaveSignatures}>
                                <div className="company-asset-requests-modal-signatures">
                                    {getRequestSignatureFields(t).map((field) => (
                                        <label key={field.key} className="company-asset-requests-signature-chip">
                                            <input
                                                type="checkbox"
                                                checked={!!editForm[field.key]}
                                                onChange={(e) => requestToggleSignature(field.key, e.target.checked)}
                                                disabled={submitting}
                                            />
                                            <span>{field.fullLabel}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="company-asset-requests-modal-footer">
                                    <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={closeEditModal} disabled={submitting}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary company-asset-requests-submit-btn" disabled={submitting}>
                                        {submitting ? t('companyAssetRequests.saving') : t('common.save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showSaveConfirmModal && (
                <div className="modal-overlay company-asset-requests-modal-overlay" onClick={cancelSaveSignatures}>
                    <div className="modal company-asset-requests-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header company-asset-requests-modal-header">
                            <div className="modal-title">{t('companyAssetRequests.confirmSave')}</div>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <div className="company-asset-requests-subtle-text">
                                {t('companyAssetRequests.irreversibleWarning')}
                            </div>

                            <div className="company-asset-requests-confirm-list">
                                {pendingSaveFields.map((f) => (
                                    <div key={f} className="company-asset-requests-confirm-item">
                                        {signatureFieldLabel(f)}
                                    </div>
                                ))}
                            </div>

                            <div className="company-asset-requests-modal-footer">
                                <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={cancelSaveSignatures} disabled={submitting}>
                                    {t('common.cancel')}
                                </button>
                                <button type="button" className="btn btn-primary company-asset-requests-submit-btn" onClick={confirmSaveSignatures} disabled={submitting}>
                                    {t('common.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAllSignaturesModal && (
                <div className="modal-overlay company-asset-requests-modal-overlay" onClick={closeAllSignaturesModal}>
                    <div className="modal company-asset-requests-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header company-asset-requests-modal-header">
                            <div className="modal-title">{t('companyAssetRequests.allSignaturesEstablished')}</div>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <div className="company-asset-requests-subtle-text">
                                {t('companyAssetRequests.allSignaturesSetToYes')}
                            </div>
                            <div className="company-asset-requests-modal-footer">
                                <button type="button" className="btn btn-primary company-asset-requests-submit-btn" onClick={closeAllSignaturesModal} disabled={submitting}>
                                    {t('common.ok')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyAssetRequestsPage;
