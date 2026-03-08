import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { companyAssetRequestService, attributionOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CompanyAssetRequestsPage = () => {
    const { user } = useAuth();

    const isAssetResponsible = user?.roles?.some(role => role.role_code === 'asset_responsible' || role.role_code === 'it_bureau_chief');

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

    const signatureFieldLabel = (field) => {
        switch (field) {
            case 'is_signed_by_company':
                return 'Signed by company';
            case 'is_signed_by_company_leader':
                return 'Signed by company leader';
            case 'is_signed_by_regional_provider':
                return 'Signed by regional provider';
            case 'is_signed_by_company_representative':
                return 'Signed by company representative';
            default:
                return field;
        }
    };

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
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Company Asset Requests</h1>
                    <p className="page-subtitle">Consult company asset requests</p>
                </div>
                <div>
                    <button className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`} onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? 'Cancel' : '+ New Request'}
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div className="badge badge-success" style={{ padding: 'var(--space-4)', width: '100%', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    {success}
                </div>
            )}

            {showCreateForm && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', border: '2px solid var(--color-primary)' }}>
                    <div className="card-header">
                        <h2 className="card-title">New Company Asset Request</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                                {Object.keys(ordersById).length > 0 && attributionOrdersWithRequest.size >= Object.keys(ordersById).length && (
                                    <div
                                        className="badge badge-warning"
                                        style={{
                                            gridColumn: '1 / -1',
                                            padding: 'var(--space-4)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        All attribution orders already have a company asset request.
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Attribution Order</label>
                                    <select
                                        className="form-input"
                                        value={createForm.attribution_order}
                                        onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Attribution Order</option>
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
                                    <label className="form-label">Administrative Serial Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.administrative_serial_number}
                                        onChange={(e) => setCreateForm({ ...createForm, administrative_serial_number: e.target.value })}
                                        placeholder="e.g. ADM-2026-001"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Title of Demand</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.title_of_demand}
                                        onChange={(e) => setCreateForm({ ...createForm, title_of_demand: e.target.value })}
                                        placeholder="Title"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Organization Body Designation</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.organization_body_designation}
                                        onChange={(e) => setCreateForm({ ...createForm, organization_body_designation: e.target.value })}
                                        placeholder="Designation"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Register Number / Book Journal of Corpse</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.register_number_or_book_journal_of_corpse}
                                        onChange={(e) => setCreateForm({ ...createForm, register_number_or_book_journal_of_corpse: e.target.value })}
                                        placeholder="Register #"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Register Number / Book Journal of Establishment</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.register_number_or_book_journal_of_establishment}
                                        onChange={(e) => setCreateForm({ ...createForm, register_number_or_book_journal_of_establishment: e.target.value })}
                                        placeholder="Register #"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Digital Copy (Attachment)</label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        onChange={(e) => setCreateForm({ ...createForm, digital_copy: e.target.files[0] })}
                                        accept="image/*,application/pdf"
                                    />
                                </div>

                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <label className="form-label">Signatures</label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_company}
                                            onChange={(e) => setCreateForm({ ...createForm, is_signed_by_company: e.target.checked })}
                                        />
                                        <span>Signed by company</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_company_leader}
                                            onChange={(e) => setCreateForm({ ...createForm, is_signed_by_company_leader: e.target.checked })}
                                        />
                                        <span>Signed by company leader</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_regional_provider}
                                            onChange={(e) => setCreateForm({ ...createForm, is_signed_by_regional_provider: e.target.checked })}
                                        />
                                        <span>Signed by regional provider</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_company_representative}
                                            onChange={(e) => setCreateForm({ ...createForm, is_signed_by_company_representative: e.target.checked })}
                                        />
                                        <span>Signed by company representative</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Requests</h2>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Administrative #</th>
                                <th>Title</th>
                                <th>Attribution Order</th>
                                <th>Body Designation</th>
                                <th>Reg. (Corpse)</th>
                                <th>Reg. (Est.)</th>
                                <th>Signed (Company)</th>
                                <th>Signed (Leader)</th>
                                <th>Signed (Regional)</th>
                                <th>Signed (Representative)</th>
                                <th>Digital Copy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                        No company asset requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((r) => {
                                    const orderId = r.attribution_order;
                                    const order = ordersById[orderId];
                                    return (
                                        <tr
                                            key={r.company_asset_request_id}
                                            className="hover-row"
                                            onClick={() => openEditModal(r)}
                                            style={{ cursor: 'pointer' }}
                                            title="Click to edit signatures"
                                        >
                                            <td>#{r.company_asset_request_id}</td>
                                            <td>{r.administrative_serial_number || '-'}</td>
                                            <td>{r.title_of_demand || '-'}</td>
                                            <td>{order?.attribution_order_full_code || `#${orderId}`}</td>
                                            <td>{r.organization_body_designation || '-'}</td>
                                            <td>{r.register_number_or_book_journal_of_corpse || '-'}</td>
                                            <td>{r.register_number_or_book_journal_of_establishment || '-'}</td>
                                            <td>{r.is_signed_by_company ? 'Yes' : 'No'}</td>
                                            <td>{r.is_signed_by_company_leader ? 'Yes' : 'No'}</td>
                                            <td>{r.is_signed_by_regional_provider ? 'Yes' : 'No'}</td>
                                            <td>{r.is_signed_by_company_representative ? 'Yes' : 'No'}</td>
                                            <td>{r.digital_copy ? 'Yes' : 'No'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showEditModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-6)',
                        zIndex: 50,
                    }}
                    onClick={closeEditModal}
                >
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: 520 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title">Edit Signatures</h2>
                            <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={closeEditModal}>
                                Close
                            </button>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                                Request #{editingRequest?.company_asset_request_id}
                            </div>

                            <form onSubmit={handleSaveSignatures}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.is_signed_by_company}
                                            onChange={(e) => requestToggleSignature('is_signed_by_company', e.target.checked)}
                                            disabled={submitting}
                                        />
                                        <span>Signed by company</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.is_signed_by_company_leader}
                                            onChange={(e) => requestToggleSignature('is_signed_by_company_leader', e.target.checked)}
                                            disabled={submitting}
                                        />
                                        <span>Signed by company leader</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.is_signed_by_regional_provider}
                                            onChange={(e) => requestToggleSignature('is_signed_by_regional_provider', e.target.checked)}
                                            disabled={submitting}
                                        />
                                        <span>Signed by regional provider</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.is_signed_by_company_representative}
                                            onChange={(e) => requestToggleSignature('is_signed_by_company_representative', e.target.checked)}
                                            disabled={submitting}
                                        />
                                        <span>Signed by company representative</span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                                    <button type="button" className="btn btn-secondary" onClick={closeEditModal} disabled={submitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showSaveConfirmModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-6)',
                        zIndex: 65,
                    }}
                    onClick={cancelSaveSignatures}
                >
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: 560 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-header">
                            <h2 className="card-title">Confirm Save</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                                You are about to set the following signature(s) to Yes. This is irreversible.
                            </div>

                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                {pendingSaveFields.map((f) => (
                                    <div key={f} style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                                        {signatureFieldLabel(f)}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                                <button type="button" className="btn btn-secondary" onClick={cancelSaveSignatures} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={confirmSaveSignatures} disabled={submitting}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAllSignaturesModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-6)',
                        zIndex: 70,
                    }}
                    onClick={closeAllSignaturesModal}
                >
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: 520 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-header">
                            <h2 className="card-title">All the signatures are established</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                All required signatures have been set to Yes.
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-primary" onClick={closeAllSignaturesModal} disabled={submitting}>
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompanyAssetRequestsPage;
