import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { companyAssetRequestService, attributionOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const REQUEST_SIGNATURE_FIELDS = [
    { key: 'is_signed_by_company', label: 'Company', fullLabel: 'Signed by company', short: 'C' },
    { key: 'is_signed_by_company_leader', label: 'Leader', fullLabel: 'Signed by company leader', short: 'L' },
    { key: 'is_signed_by_regional_provider', label: 'Regional', fullLabel: 'Signed by regional provider', short: 'R' },
    { key: 'is_signed_by_company_representative', label: 'Representative', fullLabel: 'Signed by company representative', short: 'Rep' },
];

const CompanyAssetRequestsPage = () => {
    const { user } = useAuth();

    const isAssetResponsible = user?.roles?.some(role => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief');

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
            const fullySigned = REQUEST_SIGNATURE_FIELDS.every((field) => !!r?.[field.key]);
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
                setSuccess('Signatures updated successfully');
                closeEditModal();
            }
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to update signatures');
        } finally {
            setSubmitting(false);
        }
    };

    const signatureFieldLabel = (field) => REQUEST_SIGNATURE_FIELDS.find((f) => f.key === field)?.fullLabel || field;

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
                setError('Failed to fetch company asset requests');
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
                setError('Attribution order is required');
                return;
            }
            if (attributionOrdersWithRequest.has(selectedOrderId)) {
                setError('This attribution order already has a company asset request');
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

            setSuccess('Company asset request created successfully');
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
            setError(err.response?.data?.error || 'Failed to create company asset request');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="company-asset-requests-page">
            <div className="card company-asset-requests-hero">
                <div className="company-asset-requests-header">
                    <div>
                        <h1 className="page-title">Company Asset Requests</h1>
                        <p className="page-subtitle">Consult requests, verify signatures, and update approval status</p>
                    </div>
                    <button className="btn btn-primary company-asset-requests-create-btn" onClick={() => setShowCreateForm(true)}>
                        + New Request
                    </button>
                </div>
                <div className="company-asset-requests-hero-foot">
                    <span className="badge badge-info">Click any request card to edit signatures</span>
                    <span className="badge badge-warning">Signature set to Yes cannot be reverted</span>
                </div>
            </div>

            <div className="stat-grid company-asset-requests-stat-grid">
                <div className="stat-card">
                    <div className="stat-value">{requestStats.total}</div>
                    <div className="stat-label">Total requests</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{requestStats.fullySignedCount}</div>
                    <div className="stat-label">Fully signed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{requestStats.pendingSignaturesCount}</div>
                    <div className="stat-label">Pending signatures</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{requestStats.withDigitalCopyCount}</div>
                    <div className="stat-label">With digital copy</div>
                </div>
            </div>

            {error && <div className="error-message company-asset-requests-alert">{error}</div>}
            {success && <div className="success-message company-asset-requests-alert">{success}</div>}

            <div className="card company-asset-requests-list-card">
                <div className="card-header">
                    <h2 className="card-title">All Requests</h2>
                    <div className="company-asset-requests-subtle-text">{requests.length} records</div>
                </div>
                <div className="card-body">
                    {requests.length === 0 ? (
                        <div className="company-asset-requests-empty-state">No company asset requests found.</div>
                    ) : (
                        <div className="company-asset-requests-list">
                            {requests.map((r) => {
                                const orderId = r.attribution_order;
                                const order = ordersById[orderId];
                                const fullySigned = REQUEST_SIGNATURE_FIELDS.every((field) => !!r?.[field.key]);
                                return (
                                    <button
                                        key={r.company_asset_request_id}
                                        type="button"
                                        className="company-asset-requests-item"
                                        onClick={() => openEditModal(r)}
                                        title="Click to edit signatures"
                                    >
                                        <div className="company-asset-requests-item-head">
                                            <div>
                                                <div className="company-asset-requests-item-title">Request #{r.company_asset_request_id}</div>
                                                <div className="company-asset-requests-item-subtitle">
                                                    {order?.attribution_order_full_code || `#${orderId}`}
                                                </div>
                                            </div>
                                            <div className="company-asset-requests-badges">
                                                <span className={`badge ${fullySigned ? 'badge-success' : 'badge-warning'}`}>
                                                    {fullySigned ? 'Fully signed' : 'Pending signatures'}
                                                </span>
                                                <span className={`badge ${r.digital_copy ? 'badge-info' : 'badge-warning'}`}>
                                                    {r.digital_copy ? 'Copy attached' : 'No copy'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="company-asset-requests-item-grid">
                                            <div>
                                                <div className="company-asset-requests-field-label">Administrative #</div>
                                                <div className="company-asset-requests-field-value">{r.administrative_serial_number || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">Title</div>
                                                <div className="company-asset-requests-field-value">{r.title_of_demand || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">Body</div>
                                                <div className="company-asset-requests-field-value">{r.organization_body_designation || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">Reg (Corpse)</div>
                                                <div className="company-asset-requests-field-value">{r.register_number_or_book_journal_of_corpse || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="company-asset-requests-field-label">Reg (Est.)</div>
                                                <div className="company-asset-requests-field-value">{r.register_number_or_book_journal_of_establishment || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="company-asset-requests-footer">
                                            <div className="company-asset-requests-signature-pill-list">
                                                {REQUEST_SIGNATURE_FIELDS.map((field) => (
                                                    <span
                                                        key={`${r.company_asset_request_id}-${field.key}`}
                                                        className={`badge ${r?.[field.key] ? 'badge-success' : 'badge-error'}`}
                                                    >
                                                        {field.short}: {r?.[field.key] ? 'Yes' : 'No'}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="company-asset-requests-subtle-text">Edit signatures</span>
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
                                <div className="modal-title">New Company Asset Request</div>
                                <div className="company-asset-requests-subtle-text">Complete request metadata and signatures</div>
                            </div>
                            <button type="button" className="modal-close" disabled={submitting} onClick={() => setShowCreateForm(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <form onSubmit={handleCreate}>
                                {Object.keys(ordersById).length > 0 && attributionOrdersWithRequest.size >= Object.keys(ordersById).length && (
                                    <div className="company-asset-requests-modal-warning">
                                        All attribution orders already have a company asset request.
                                    </div>
                                )}

                                <div className="company-asset-requests-form-grid">
                                    <div className="form-group">
                                        <select
                                            className="form-input"
                                            value={createForm.attribution_order}
                                            onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
                                            required
                                            aria-label="Attribution order"
                                        >
                                            <option value="">Attribution order</option>
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
                                            placeholder="Administrative serial number"
                                            aria-label="Administrative serial number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.title_of_demand}
                                            onChange={(e) => setCreateForm({ ...createForm, title_of_demand: e.target.value })}
                                            placeholder="Title of demand"
                                            aria-label="Title of demand"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.organization_body_designation}
                                            onChange={(e) => setCreateForm({ ...createForm, organization_body_designation: e.target.value })}
                                            placeholder="Organization body designation"
                                            aria-label="Organization body designation"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.register_number_or_book_journal_of_corpse}
                                            onChange={(e) => setCreateForm({ ...createForm, register_number_or_book_journal_of_corpse: e.target.value })}
                                            placeholder="Register / journal (corpse)"
                                            aria-label="Register number or book journal of corpse"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.register_number_or_book_journal_of_establishment}
                                            onChange={(e) => setCreateForm({ ...createForm, register_number_or_book_journal_of_establishment: e.target.value })}
                                            placeholder="Register / journal (establishment)"
                                            aria-label="Register number or book journal of establishment"
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <input
                                            type="file"
                                            className="form-input"
                                            onChange={(e) => setCreateForm({ ...createForm, digital_copy: e.target.files[0] })}
                                            accept="image/*,application/pdf"
                                            aria-label="Digital copy attachment"
                                        />
                                    </div>
                                </div>

                                <div className="company-asset-requests-modal-signatures">
                                    {REQUEST_SIGNATURE_FIELDS.map((field) => (
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
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary company-asset-requests-submit-btn" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Request'}
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
                                <div className="modal-title">Edit Signatures</div>
                                <div className="company-asset-requests-subtle-text">Request #{editingRequest?.company_asset_request_id}</div>
                            </div>
                            <button type="button" className="modal-close" onClick={closeEditModal}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <form onSubmit={handleSaveSignatures}>
                                <div className="company-asset-requests-modal-signatures">
                                    {REQUEST_SIGNATURE_FIELDS.map((field) => (
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
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary company-asset-requests-submit-btn" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save'}
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
                            <div className="modal-title">Confirm Save</div>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <div className="company-asset-requests-subtle-text">
                                You are about to set the following signature(s) to Yes. This is irreversible.
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
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary company-asset-requests-submit-btn" onClick={confirmSaveSignatures} disabled={submitting}>
                                    Confirm
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
                            <div className="modal-title">All signatures are established</div>
                        </div>
                        <div className="modal-body company-asset-requests-modal-body">
                            <div className="company-asset-requests-subtle-text">
                                All required signatures have been set to Yes.
                            </div>
                            <div className="company-asset-requests-modal-footer">
                                <button type="button" className="btn btn-primary company-asset-requests-submit-btn" onClick={closeAllSignaturesModal} disabled={submitting}>
                                    OK
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
