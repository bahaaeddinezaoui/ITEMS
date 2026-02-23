import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    administrativeCertificateService,
    attributionOrderService,
    receiptReportService,
    warehouseService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdministrativeCertificatesPage = () => {
    const { user } = useAuth();

    const isAssetResponsible = user?.roles?.some((role) => role.role_code === 'asset_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [certificates, setCertificates] = useState([]);
    const [ordersById, setOrdersById] = useState({});
    const [warehousesById, setWarehousesById] = useState({});
    const [reportsById, setReportsById] = useState({});

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        warehouse: '',
        attribution_order: '',
        receipt_report: '',
        interested_organization: 'ESAM/2RM',
        operation: '',
        format: '21x27',
        is_signed_by_warehouse_storage_magaziner: false,
        is_signed_by_warehouse_storage_accountant: false,
        is_signed_by_warehouse_storage_marketer: false,
        is_signed_by_warehouse_it_chief: false,
        is_signed_by_warehouse_leader: false,
        digital_copy: null,
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const [certData, ordersData, warehousesData] = await Promise.all([
                administrativeCertificateService.getAll(),
                attributionOrderService.getAll(),
                warehouseService.getAll(),
            ]);

            const certList = certData?.results || certData || [];
            setCertificates(certList);

            const orders = ordersData?.results || ordersData || [];
            const ordersMap = {};
            orders.forEach((o) => {
                ordersMap[o.attribution_order_id] = o;
            });
            setOrdersById(ordersMap);

            const warehouses = warehousesData?.results || warehousesData || [];
            const warehousesMap = {};
            warehouses.forEach((w) => {
                warehousesMap[w.warehouse_id] = w;
            });
            setWarehousesById(warehousesMap);

            const uniqueReportIds = Array.from(
                new Set(certList.map((c) => c.receipt_report).filter((id) => !!id))
            );

            if (uniqueReportIds.length === 0) {
                setReportsById({});
            } else {
                const reportPairs = await Promise.all(
                    uniqueReportIds.map(async (id) => {
                        try {
                            const rr = await receiptReportService.getById(id);
                            return [id, rr];
                        } catch {
                            return [id, null];
                        }
                    })
                );

                const reportsMap = {};
                reportPairs.forEach(([id, rr]) => {
                    if (rr) reportsMap[id] = rr;
                });
                setReportsById(reportsMap);
            }
        } catch {
            setError('Failed to fetch administrative certificates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAssetResponsible) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAssetResponsible]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            if (createForm.operation && !['entry', 'exit', 'transfer'].includes(createForm.operation)) {
                setError('Operation must be entry, exit, or transfer');
                return;
            }

            const formData = new FormData();
            if (createForm.warehouse) formData.append('warehouse', createForm.warehouse);
            if (createForm.attribution_order) formData.append('attribution_order', createForm.attribution_order);
            if (createForm.receipt_report) formData.append('receipt_report', createForm.receipt_report);
            if (createForm.interested_organization) formData.append('interested_organization', createForm.interested_organization);
            if (createForm.operation) formData.append('operation', createForm.operation);
            if (createForm.format) formData.append('format', createForm.format);

            formData.append('is_signed_by_warehouse_storage_magaziner', !!createForm.is_signed_by_warehouse_storage_magaziner);
            formData.append('is_signed_by_warehouse_storage_accountant', !!createForm.is_signed_by_warehouse_storage_accountant);
            formData.append('is_signed_by_warehouse_storage_marketer', !!createForm.is_signed_by_warehouse_storage_marketer);
            formData.append('is_signed_by_warehouse_it_chief', !!createForm.is_signed_by_warehouse_it_chief);
            formData.append('is_signed_by_warehouse_leader', !!createForm.is_signed_by_warehouse_leader);

            if (createForm.digital_copy) formData.append('digital_copy', createForm.digital_copy);

            await administrativeCertificateService.create(formData);

            await fetchData();

            setSuccess('Administrative certificate created successfully');
            setShowCreateForm(false);
            setCreateForm({
                warehouse: '',
                attribution_order: '',
                receipt_report: '',
                interested_organization: 'ESAM/2RM',
                operation: '',
                format: '21x27',
                is_signed_by_warehouse_storage_magaziner: false,
                is_signed_by_warehouse_storage_accountant: false,
                is_signed_by_warehouse_storage_marketer: false,
                is_signed_by_warehouse_it_chief: false,
                is_signed_by_warehouse_leader: false,
                digital_copy: null,
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create administrative certificate');
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
                    <h1 className="page-title">Administrative Certificates</h1>
                    <p className="page-subtitle">Consult and create administrative certificates</p>
                </div>
                <div>
                    <button
                        className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? 'Cancel' : '+ New Certificate'}
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div
                    className="badge badge-success"
                    style={{
                        padding: 'var(--space-4)',
                        width: '100%',
                        marginBottom: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    {success}
                </div>
            )}

            {showCreateForm && (
                <div
                    className="card"
                    style={{ marginBottom: 'var(--space-6)', border: '2px solid var(--color-primary)' }}
                >
                    <div className="card-header">
                        <h2 className="card-title">New Administrative Certificate</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: 'var(--space-6)',
                                    marginBottom: 'var(--space-6)',
                                }}
                            >
                                <div className="form-group">
                                    <label className="form-label">Warehouse</label>
                                    <select
                                        className="form-input"
                                        value={createForm.warehouse}
                                        onChange={(e) => setCreateForm({ ...createForm, warehouse: e.target.value })}
                                    >
                                        <option value="">Select Warehouse</option>
                                        {Object.values(warehousesById).map((w) => (
                                            <option key={w.warehouse_id} value={w.warehouse_id}>
                                                {w.warehouse_name || `#${w.warehouse_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Attribution Order</label>
                                    <select
                                        className="form-input"
                                        value={createForm.attribution_order}
                                        onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
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
                                    <label className="form-label">Receipt Report ID</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={createForm.receipt_report}
                                        onChange={(e) => setCreateForm({ ...createForm, receipt_report: e.target.value })}
                                        placeholder="e.g. 1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Interested Organization</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.interested_organization}
                                        onChange={(e) => setCreateForm({ ...createForm, interested_organization: e.target.value })}
                                        placeholder="Organization"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Operation</label>
                                    <select
                                        className="form-input"
                                        value={createForm.operation}
                                        onChange={(e) => setCreateForm({ ...createForm, operation: e.target.value })}
                                    >
                                        <option value="">Select Operation</option>
                                        <option value="entry">entry</option>
                                        <option value="exit">exit</option>
                                        <option value="transfer">transfer</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Format</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.format}
                                        onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                                        placeholder="Format"
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
                                            checked={!!createForm.is_signed_by_warehouse_storage_magaziner}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    is_signed_by_warehouse_storage_magaziner: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Signed by magaziner</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_warehouse_storage_accountant}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    is_signed_by_warehouse_storage_accountant: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Signed by accountant</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_warehouse_storage_marketer}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    is_signed_by_warehouse_storage_marketer: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Signed by marketer</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_warehouse_it_chief}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    is_signed_by_warehouse_it_chief: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Signed by IT chief</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!createForm.is_signed_by_warehouse_leader}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    is_signed_by_warehouse_leader: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Signed by warehouse leader</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Certificate'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Certificates</h2>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Warehouse</th>
                                <th>Attribution Order</th>
                                <th>Receipt Report</th>
                                <th>Interested Org</th>
                                <th>Operation</th>
                                <th>Format</th>
                                <th>Signed (Magaziner)</th>
                                <th>Signed (Accountant)</th>
                                <th>Signed (Marketer)</th>
                                <th>Signed (IT)</th>
                                <th>Signed (Leader)</th>
                                <th>Digital Copy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.length === 0 ? (
                                <tr>
                                    <td colSpan="13" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                        No administrative certificates found.
                                    </td>
                                </tr>
                            ) : (
                                certificates.map((c) => {
                                    const w = warehousesById[c.warehouse];
                                    const o = ordersById[c.attribution_order];
                                    const rr = reportsById[c.receipt_report];

                                    return (
                                        <tr key={c.administrative_certificate_id} className="hover-row">
                                            <td>#{c.administrative_certificate_id}</td>
                                            <td>{w?.warehouse_name || (c.warehouse ? `#${c.warehouse}` : '-')}</td>
                                            <td>{o?.attribution_order_full_code || (c.attribution_order ? `#${c.attribution_order}` : '-')}</td>
                                            <td>{rr?.report_full_code || (c.receipt_report ? `#${c.receipt_report}` : '-')}</td>
                                            <td>{c.interested_organization || '-'}</td>
                                            <td>{c.operation || '-'}</td>
                                            <td>{c.format || '-'}</td>
                                            <td>{c.is_signed_by_warehouse_storage_magaziner ? 'Yes' : 'No'}</td>
                                            <td>{c.is_signed_by_warehouse_storage_accountant ? 'Yes' : 'No'}</td>
                                            <td>{c.is_signed_by_warehouse_storage_marketer ? 'Yes' : 'No'}</td>
                                            <td>{c.is_signed_by_warehouse_it_chief ? 'Yes' : 'No'}</td>
                                            <td>{c.is_signed_by_warehouse_leader ? 'Yes' : 'No'}</td>
                                            <td>{c.digital_copy ? 'Yes' : 'No'}</td>
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

export default AdministrativeCertificatesPage;
