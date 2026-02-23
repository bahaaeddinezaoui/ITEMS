import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { companyAssetRequestService, attributionOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CompanyAssetRequestsPage = () => {
    const { user } = useAuth();

    const isAssetResponsible = user?.roles?.some(role => role.role_code === 'asset_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState([]);
    const [ordersById, setOrdersById] = useState({});

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
                                <div className="form-group">
                                    <label className="form-label">Attribution Order</label>
                                    <select
                                        className="form-input"
                                        value={createForm.attribution_order}
                                        onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Attribution Order</option>
                                        {Object.values(ordersById).map((o) => (
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
                                        <tr key={r.company_asset_request_id} className="hover-row">
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
        </>
    );
};

export default CompanyAssetRequestsPage;
