import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');
    const isDirectorAdminSupport = user?.roles?.some((role) => role.role_code === 'director_admin_support');
    const isProtectionSecurityBureauChief = user?.roles?.some((role) => role.role_code === 'protection_and_security_bureau_chief');
    const isSchoolHeadquarter = user?.roles?.some((role) => role.role_code === 'school_headquarter');
    const canConsultPurchaseOrders = isStockConsumableResponsible || isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter;
    const canSignAcceptanceReport = isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [orders, setOrders] = useState([]);

    const [showDeliveryNoteModal, setShowDeliveryNoteModal] = useState(false);
    const [deliveryNoteLoading, setDeliveryNoteLoading] = useState(false);
    const [deliveryNoteSubmitting, setDeliveryNoteSubmitting] = useState(false);
    const [deliveryNoteError, setDeliveryNoteError] = useState('');
    const [deliveryNotePo, setDeliveryNotePo] = useState(null);
    const [deliveryNoteInfo, setDeliveryNoteInfo] = useState(null);
    const [deliveryNoteCode, setDeliveryNoteCode] = useState('');
    const [deliveryNoteFile, setDeliveryNoteFile] = useState(null);

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');
    const [invoicePo, setInvoicePo] = useState(null);
    const [invoiceInfo, setInvoiceInfo] = useState(null);
    const [invoiceFile, setInvoiceFile] = useState(null);

    const [showAcceptanceReportModal, setShowAcceptanceReportModal] = useState(false);
    const [acceptanceReportLoading, setAcceptanceReportLoading] = useState(false);
    const [acceptanceReportSubmitting, setAcceptanceReportSubmitting] = useState(false);
    const [acceptanceReportError, setAcceptanceReportError] = useState('');
    const [acceptanceReportPo, setAcceptanceReportPo] = useState(null);
    const [acceptanceReportInfo, setAcceptanceReportInfo] = useState(null);
    const [acceptanceReportFile, setAcceptanceReportFile] = useState(null);

    const canCurrentUserSignAcceptanceReport =
        !!acceptanceReportInfo?.exists
        && (
            (isDirectorAdminSupport && !acceptanceReportInfo?.is_signed_by_director_of_administration_and_support)
            || (isProtectionSecurityBureauChief && !acceptanceReportInfo?.is_signed_by_protection_and_security_bureau_chief)
            || (isSchoolHeadquarter && !acceptanceReportInfo?.is_signed_by_school_headquarter)
        );

    const closeDeliveryNoteModal = () => {
        setShowDeliveryNoteModal(false);
        setDeliveryNoteLoading(false);
        setDeliveryNoteSubmitting(false);
        setDeliveryNoteError('');
        setDeliveryNotePo(null);
        setDeliveryNoteInfo(null);
        setDeliveryNoteCode('');
        setDeliveryNoteFile(null);
    };

    const closeInvoiceModal = () => {
        setShowInvoiceModal(false);
        setInvoiceLoading(false);
        setInvoiceSubmitting(false);
        setInvoiceError('');
        setInvoicePo(null);
        setInvoiceInfo(null);
        setInvoiceFile(null);
    };

    const closeAcceptanceReportModal = () => {
        setShowAcceptanceReportModal(false);
        setAcceptanceReportLoading(false);
        setAcceptanceReportSubmitting(false);
        setAcceptanceReportError('');
        setAcceptanceReportPo(null);
        setAcceptanceReportInfo(null);
        setAcceptanceReportFile(null);
    };

    const openDeliveryNoteModal = async (order) => {
        setDeliveryNoteError('');
        setDeliveryNotePo(order);
        setDeliveryNoteInfo(null);
        setDeliveryNoteCode('');
        setDeliveryNoteFile(null);
        setShowDeliveryNoteModal(true);

        setDeliveryNoteLoading(true);
        try {
            const info = await purchaseOrderService.getDeliveryNote(order.purchase_order_id);
            setDeliveryNoteInfo(info);
            if (info?.exists && info?.delivery_note_code) {
                setDeliveryNoteCode(String(info.delivery_note_code));
            }
        } catch (e) {
            setDeliveryNoteError(e?.response?.data?.error || 'Failed to load delivery note');
        } finally {
            setDeliveryNoteLoading(false);
        }
    };

    const submitSignAcceptanceReport = async () => {
        if (!acceptanceReportPo) return;
        setAcceptanceReportError('');
        setSuccess('');
        setError('');

        try {
            let signAs = null;
            if (isDirectorAdminSupport) signAs = 'director_admin_support';
            if (isProtectionSecurityBureauChief) signAs = 'protection_and_security_bureau_chief';
            if (isSchoolHeadquarter) signAs = 'school_headquarter';

            const payload = signAs ? { sign_as: signAs, is_signed: true } : { is_signed: true };
            await purchaseOrderService.signAcceptanceReport(acceptanceReportPo.purchase_order_id, payload);
            const info = await purchaseOrderService.getAcceptanceReport(acceptanceReportPo.purchase_order_id);
            setAcceptanceReportInfo(info);
            setSuccess('Acceptance report signed');
        } catch (e) {
            setAcceptanceReportError(e?.response?.data?.error || 'Failed to sign acceptance report');
        }
    };

    const openAcceptanceReportModal = async (order) => {
        setAcceptanceReportError('');
        setAcceptanceReportPo(order);
        setAcceptanceReportInfo(null);
        setAcceptanceReportFile(null);
        setShowAcceptanceReportModal(true);

        setAcceptanceReportLoading(true);
        try {
            const info = await purchaseOrderService.getAcceptanceReport(order.purchase_order_id);
            setAcceptanceReportInfo(info);
        } catch (e) {
            setAcceptanceReportError(e?.response?.data?.error || 'Failed to load acceptance report');
        } finally {
            setAcceptanceReportLoading(false);
        }
    };

    const submitCreateAcceptanceReport = async () => {
        if (!acceptanceReportPo) return;
        setAcceptanceReportError('');
        setSuccess('');
        setError('');

        if (!acceptanceReportFile) {
            setAcceptanceReportError('digital_copy file is required');
            return;
        }

        setAcceptanceReportSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('digital_copy', acceptanceReportFile);
            const data = await purchaseOrderService.createAcceptanceReport(acceptanceReportPo.purchase_order_id, fd);
            const arId = data?.acceptance_report_id;
            setSuccess(arId ? `Acceptance report #${arId} created` : 'Acceptance report created');

            const info = await purchaseOrderService.getAcceptanceReport(acceptanceReportPo.purchase_order_id);
            setAcceptanceReportInfo(info);
            await loadOrders();
        } catch (e) {
            setAcceptanceReportError(e?.response?.data?.error || 'Failed to create acceptance report');
        } finally {
            setAcceptanceReportSubmitting(false);
        }
    };

    const consultAcceptanceReportPdf = async () => {
        if (!acceptanceReportPo) return;
        setAcceptanceReportError('');
        try {
            const resp = await purchaseOrderService.downloadAcceptanceReport(acceptanceReportPo.purchase_order_id);
            const blob = resp?.data;
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 60_000);
        } catch (e) {
            setAcceptanceReportError(e?.response?.data?.error || 'Failed to load acceptance report PDF');
        }
    };

    const submitCreateDeliveryNote = async () => {
        if (!deliveryNotePo) return;
        setDeliveryNoteError('');
        setSuccess('');
        setError('');

        if (!deliveryNoteCode) {
            setDeliveryNoteError('delivery_note_code is required');
            return;
        }
        if (!deliveryNoteFile) {
            setDeliveryNoteError('digital_copy file is required');
            return;
        }

        setDeliveryNoteSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('delivery_note_code', deliveryNoteCode);
            fd.append('digital_copy', deliveryNoteFile);
            const data = await purchaseOrderService.createDeliveryNote(deliveryNotePo.purchase_order_id, fd);
            const dnId = data?.delivery_note_id;
            setSuccess(dnId ? `Delivery note #${dnId} created` : 'Delivery note created');

            const info = await purchaseOrderService.getDeliveryNote(deliveryNotePo.purchase_order_id);
            setDeliveryNoteInfo(info);
            await loadOrders();
        } catch (e) {
            setDeliveryNoteError(e?.response?.data?.error || 'Failed to create delivery note');
        } finally {
            setDeliveryNoteSubmitting(false);
        }
    };

    const consultDeliveryNote = () => {
        if (!deliveryNotePo) return;
        closeDeliveryNoteModal();
        navigate(`/dashboard/purchase-orders/${deliveryNotePo.purchase_order_id}/delivery-note`);
    };

    const openInvoiceModal = async (order) => {
        setInvoiceError('');
        setInvoicePo(order);
        setInvoiceInfo(null);
        setInvoiceFile(null);
        setShowInvoiceModal(true);

        setInvoiceLoading(true);
        try {
            const info = await purchaseOrderService.getInvoice(order.purchase_order_id);
            setInvoiceInfo(info);
        } catch (e) {
            setInvoiceError(e?.response?.data?.error || 'Failed to load invoice');
        } finally {
            setInvoiceLoading(false);
        }
    };

    const submitCreateInvoice = async () => {
        if (!invoicePo) return;
        setInvoiceError('');
        setSuccess('');
        setError('');

        if (!invoiceFile) {
            setInvoiceError('digital_copy file is required');
            return;
        }

        setInvoiceSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('digital_copy', invoiceFile);
            const data = await purchaseOrderService.createInvoice(invoicePo.purchase_order_id, fd);
            const invId = data?.invoice_id;
            setSuccess(invId ? `Invoice #${invId} created` : 'Invoice created');

            const info = await purchaseOrderService.getInvoice(invoicePo.purchase_order_id);
            setInvoiceInfo(info);
            await loadOrders();
        } catch (e) {
            setInvoiceError(e?.response?.data?.error || 'Failed to create invoice');
        } finally {
            setInvoiceSubmitting(false);
        }
    };

    const consultInvoicePdf = async () => {
        if (!invoicePo) return;
        setInvoiceError('');
        try {
            const resp = await purchaseOrderService.downloadInvoice(invoicePo.purchase_order_id);
            const blob = resp?.data;
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 60_000);
        } catch (e) {
            setInvoiceError(e?.response?.data?.error || 'Failed to load invoice PDF');
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await purchaseOrderService.getAll();
            setOrders(Array.isArray(data) ? data : (data?.results || []));
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canConsultPurchaseOrders) return;
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canConsultPurchaseOrders]);

    if (!canConsultPurchaseOrders) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Purchase orders</h1>
                    <p className="page-subtitle">Create purchase orders, receive items, and track backorders.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {isStockConsumableResponsible && (
                        <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard/purchase-orders/create')}>
                            New
                        </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={loadOrders} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Orders</h2>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                    ) : (orders || []).length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No purchase orders found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Code</th>
                                        <th>Supplier</th>
                                        <th style={{ width: 1 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={`po-${o.purchase_order_id}`}>
                                            <td>#{o.purchase_order_id}</td>
                                            <td>{o.purchase_order_code || ''}</td>
                                            <td>{o.supplier_name ? o.supplier_name : (o.supplier_id ? `Supplier #${o.supplier_id}` : '')}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    {isStockConsumableResponsible && (
                                                        <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}`)}>
                                                            View
                                                        </button>
                                                    )}
                                                    {isStockConsumableResponsible && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/receive`)}
                                                                disabled={o.has_remaining === false}
                                                                title={o.has_remaining === false ? 'All items have been received' : undefined}
                                                            >
                                                                Receive
                                                            </button>
                                                            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/backorder-reports`)}>
                                                                Backorders
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                onClick={() => openDeliveryNoteModal(o)}
                                                                disabled={o.has_remaining !== false}
                                                                title={o.has_remaining !== false ? 'Receive all items before creating delivery note' : undefined}
                                                            >
                                                                Delivery note
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                onClick={() => openInvoiceModal(o)}
                                                                disabled={o.has_remaining !== false}
                                                                title={o.has_remaining !== false ? 'Receive all items before creating invoice' : undefined}
                                                            >
                                                                Invoice
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => openAcceptanceReportModal(o)}
                                                        disabled={isStockConsumableResponsible ? (o.has_remaining !== false) : false}
                                                        title={isStockConsumableResponsible && o.has_remaining !== false ? 'Receive all items before creating acceptance report' : undefined}
                                                    >
                                                        Acceptance report
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showDeliveryNoteModal && deliveryNotePo && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-4)',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: 'min(820px, 100%)',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            padding: 'var(--space-4)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Delivery note</h2>
                                <div style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>Purchase order #{deliveryNotePo.purchase_order_id}</div>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => !deliveryNoteSubmitting && closeDeliveryNoteModal()}>
                                Close
                            </button>
                        </div>

                        {deliveryNoteError && (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-3)' }}>
                                {deliveryNoteError}
                            </div>
                        )}

                        {deliveryNoteLoading ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                        ) : deliveryNoteInfo?.exists ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Delivery note ID</label>
                                    <input className="form-input" value={deliveryNoteInfo.delivery_note_id || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input className="form-input" value={deliveryNoteInfo.delivery_note_date || ''} disabled />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Code</label>
                                    <input className="form-input" value={deliveryNoteInfo.delivery_note_code || ''} disabled />
                                </div>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={consultDeliveryNote}
                                        disabled={!deliveryNoteInfo.has_digital_copy}
                                        title={!deliveryNoteInfo.has_digital_copy ? 'No file stored' : undefined}
                                    >
                                        Consult PDF
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div style={{ color: 'var(--color-text-secondary)' }}>No delivery note exists for this purchase order. Create it now:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Delivery note code</label>
                                        <input className="form-input" value={deliveryNoteCode} onChange={(e) => setDeliveryNoteCode(e.target.value)} disabled={deliveryNoteSubmitting} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Digital copy</label>
                                        <input
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            className="form-input"
                                            onChange={(e) => setDeliveryNoteFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                            disabled={deliveryNoteSubmitting}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                    <button type="button" className="btn btn-primary" onClick={submitCreateDeliveryNote} disabled={deliveryNoteSubmitting}>
                                        {deliveryNoteSubmitting ? 'Creating...' : 'Create delivery note'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showInvoiceModal && invoicePo && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-4)',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: 'min(820px, 100%)',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            padding: 'var(--space-4)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Invoice</h2>
                                <div style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>Purchase order #{invoicePo.purchase_order_id}</div>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => !invoiceSubmitting && closeInvoiceModal()}>
                                Close
                            </button>
                        </div>

                        {invoiceError && (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-3)' }}>
                                {invoiceError}
                            </div>
                        )}

                        {invoiceLoading ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                        ) : invoiceInfo?.exists ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Invoice ID</label>
                                    <input className="form-input" value={invoiceInfo.invoice_id || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Delivery note ID</label>
                                    <input className="form-input" value={invoiceInfo.delivery_note_id || ''} disabled />
                                </div>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={consultInvoicePdf}
                                        disabled={!invoiceInfo.has_digital_copy}
                                        title={!invoiceInfo.has_digital_copy ? 'No file stored' : undefined}
                                    >
                                        Consult PDF
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div style={{ color: 'var(--color-text-secondary)' }}>No invoice exists for this purchase order. Create it now:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Digital copy (PDF)</label>
                                        <input
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            className="form-input"
                                            onChange={(e) => setInvoiceFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                            disabled={invoiceSubmitting}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                    <button type="button" className="btn btn-primary" onClick={submitCreateInvoice} disabled={invoiceSubmitting}>
                                        {invoiceSubmitting ? 'Creating...' : 'Create invoice'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAcceptanceReportModal && acceptanceReportPo && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-4)',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: 'min(920px, 100%)',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            padding: 'var(--space-4)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Acceptance report</h2>
                                <div style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>Purchase order #{acceptanceReportPo.purchase_order_id}</div>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => !acceptanceReportSubmitting && closeAcceptanceReportModal()}>
                                Close
                            </button>
                        </div>

                        {acceptanceReportError && (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-3)' }}>
                                {acceptanceReportError}
                            </div>
                        )}

                        {acceptanceReportLoading ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                        ) : acceptanceReportInfo?.exists ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Acceptance report ID</label>
                                    <input className="form-input" value={acceptanceReportInfo.acceptance_report_id || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Delivery note ID</label>
                                    <input className="form-input" value={acceptanceReportInfo.delivery_note_id || ''} disabled />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Datetime</label>
                                    <input className="form-input" value={acceptanceReportInfo.acceptance_report_datetime || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Signed by Director of Administration and Support</label>
                                    <input className="form-input" value={acceptanceReportInfo.is_signed_by_director_of_administration_and_support ? 'Yes' : 'No'} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Signed by Protection and Security Bureau Chief</label>
                                    <input className="form-input" value={acceptanceReportInfo.is_signed_by_protection_and_security_bureau_chief ? 'Yes' : 'No'} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Signed by Information Technology Bureau Chief</label>
                                    <input className="form-input" value={acceptanceReportInfo.is_signed_by_information_technilogy_bureau_chief ? 'Yes' : 'No'} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Signed by Stock item & Consumable responsible</label>
                                    <input className="form-input" value={acceptanceReportInfo.acceptance_report_is_stock_item_and_consumable_responsible ? 'Yes' : 'No'} disabled />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Signed by School headquarter</label>
                                    <input className="form-input" value={acceptanceReportInfo.is_signed_by_school_headquarter ? 'Yes' : 'No'} disabled />
                                </div>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                    {canSignAcceptanceReport && canCurrentUserSignAcceptanceReport && (
                                        <button type="button" className="btn btn-primary" onClick={submitSignAcceptanceReport}>
                                            Sign
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={consultAcceptanceReportPdf}
                                        disabled={!acceptanceReportInfo.has_digital_copy}
                                        title={!acceptanceReportInfo.has_digital_copy ? 'No file stored' : undefined}
                                    >
                                        Consult PDF
                                    </button>
                                </div>
                            </div>
                        ) : isStockConsumableResponsible ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div style={{ color: 'var(--color-text-secondary)' }}>No acceptance report exists for this purchase order. Create it now:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Digital copy (PDF)</label>
                                        <input
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            className="form-input"
                                            onChange={(e) => setAcceptanceReportFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                            disabled={acceptanceReportSubmitting}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                    <button type="button" className="btn btn-primary" onClick={submitCreateAcceptanceReport} disabled={acceptanceReportSubmitting}>
                                        {acceptanceReportSubmitting ? 'Creating...' : 'Create acceptance report'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--color-text-secondary)' }}>No acceptance report exists for this purchase order.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrdersPage;
