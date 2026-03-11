import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
    Plus, 
    RefreshCw, 
    Eye, 
    Package, 
    History, 
    FileText, 
    Receipt, 
    ClipboardCheck, 
    X,
    Calendar,
    Hash,
    Building2,
    CheckCircle2,
    XCircle,
    Download,
    Upload,
    PenTool,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');
    const isItBureauChief = user?.roles?.some((role) => role.role_code === 'it_bureau_chief');
    const isDirectorAdminSupport = user?.roles?.some((role) => role.role_code === 'director_admin_support');
    const isProtectionSecurityBureauChief = user?.roles?.some((role) => role.role_code === 'protection_and_security_bureau_chief');
    const isSchoolHeadquarter = user?.roles?.some((role) => role.role_code === 'school_headquarter');
    const canConsultPurchaseOrders = isStockConsumableResponsible || isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter || isItBureauChief;
    const canSignAcceptanceReport = isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter || isItBureauChief || isStockConsumableResponsible;

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
            || (isItBureauChief && !acceptanceReportInfo?.is_signed_by_it_bureau_chief)
            || (isStockConsumableResponsible && !acceptanceReportInfo?.is_signed_by_stock_consumable_responsible)
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
            if (isItBureauChief) signAs = 'it_bureau_chief';
            if (isStockConsumableResponsible) signAs = 'stock_consumable_responsible';

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

    const arePurchaseOrderItemsMoved = (purchaseOrderId) => {
        try {
            return localStorage.getItem(`po_items_moved_${purchaseOrderId}`) === '1';
        } catch {
            return false;
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter(o => 
        (o.purchase_order_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (o.supplier_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        `#${o.purchase_order_id}`.includes(searchTerm)
    );

    const getStatusColor = (o) => {
        if (o.has_remaining === false) return 'badge-success';
        if (o.has_remaining === true) return 'badge-warning';
        return 'badge-secondary';
    };

    const getStatusText = (o) => {
        if (o.has_remaining === false) return 'Received';
        if (o.has_remaining === true) return 'Partial';
        return 'Pending';
    };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)' }}>Purchase Orders</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        Manage procurement, track shipments, and oversee supplier deliveries.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={loadOrders} 
                        disabled={loading}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    {isStockConsumableResponsible && (
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={() => navigate('/dashboard/purchase-orders/create')}
                            style={{ padding: 'var(--space-3) var(--space-6)' }}
                        >
                            <Plus size={18} />
                            <span>New Order</span>
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search 
                        size={18} 
                        style={{ 
                            position: 'absolute', 
                            left: 'var(--space-4)', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: 'var(--color-text-muted)' 
                        }} 
                    />
                    <input 
                        type="text" 
                        placeholder="Search by ID, code, or supplier..." 
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: 'var(--space-12)', height: '48px', background: 'var(--color-bg-card)' }}
                    />
                </div>
                <button className="btn btn-secondary" style={{ width: '48px', padding: 0 }}>
                    <Filter size={18} />
                </button>
            </div>

            <div className="card" style={{ border: 'none', background: 'transparent' }}>
                {loading ? (
                    <div className="loading-state" style={{ padding: 'var(--space-16)' }}>
                        <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                        <span style={{ fontSize: 'var(--font-size-lg)' }}>Loading orders...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                        <div className="empty-state-icon">
                            <Package size={64} />
                        </div>
                        <h3 className="empty-state-title">No orders found</h3>
                        <p className="empty-state-text">
                            {searchTerm ? `No results for "${searchTerm}"` : "You haven't created any purchase orders yet."}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-4)', paddingTop: 'var(--space-1)' }}>
                        {filteredOrders.map((o) => (
                            <div 
                                key={`po-${o.purchase_order_id}`} 
                                className="card" 
                                style={{ 
                                    background: 'var(--color-bg-card)', 
                                    border: '1px solid var(--color-border)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                                <span style={{ 
                                                    fontSize: 'var(--font-size-xs)', 
                                                    fontWeight: '700', 
                                                    color: 'var(--color-accent-secondary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    #{o.purchase_order_id}
                                                </span>
                                                <span className={`badge ${getStatusColor(o)}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                    {getStatusText(o)}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                                {o.purchase_order_code || 'Unnamed Order'}
                                            </h3>
                                        </div>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-full)' }}
                                            onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}`)}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
                                        <Building2 size={16} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                            {o.supplier_name || (o.supplier_id ? `Supplier #${o.supplier_id}` : 'No supplier')}
                                        </span>
                                    </div>

                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(3, 1fr)', 
                                        gap: 'var(--space-2)',
                                        paddingTop: 'var(--space-4)',
                                        borderTop: '1px solid var(--color-border)'
                                    }}>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--space-3) 0', fontSize: 'var(--font-size-xs)' }}
                                            onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/receive`)}
                                            disabled={o.has_remaining === false}
                                            title="Receive items"
                                        >
                                            <Package size={18} />
                                            <span>Receive</span>
                                        </button>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--space-3) 0', fontSize: 'var(--font-size-xs)' }}
                                            onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/backorder-reports`)}
                                            title="Backorders"
                                        >
                                            <History size={18} />
                                            <span>History</span>
                                        </button>
                                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--space-3) 0', fontSize: 'var(--font-size-xs)', width: '100%' }}
                                                onClick={() => openAcceptanceReportModal(o)}
                                                disabled={isStockConsumableResponsible ? (o.has_remaining !== false) : false}
                                                title="Acceptance Report"
                                            >
                                                <ClipboardCheck size={18} />
                                                <span>Report</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ flex: 1, gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', padding: 'var(--space-2)' }}
                                            onClick={() => openDeliveryNoteModal(o)}
                                            disabled={o.has_remaining !== false}
                                        >
                                            <FileText size={14} />
                                            <span>Delivery Note</span>
                                        </button>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ flex: 1, gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', padding: 'var(--space-2)' }}
                                            onClick={() => openInvoiceModal(o)}
                                            disabled={o.has_remaining !== false}
                                        >
                                            <Receipt size={14} />
                                            <span>Invoice</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showDeliveryNoteModal && deliveryNotePo && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Delivery Note</h2>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                                    PO #{deliveryNotePo.purchase_order_id} • {deliveryNotePo.purchase_order_code}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => !deliveryNoteSubmitting && closeDeliveryNoteModal()}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {deliveryNoteError && (
                                <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
                                    {deliveryNoteError}
                                </div>
                            )}

                            {deliveryNoteLoading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <span>Fetching details...</span>
                                </div>
                            ) : deliveryNoteInfo?.exists ? (
                                <div className="form">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Note ID</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {deliveryNoteInfo.delivery_note_id}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Issue Date</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {deliveryNoteInfo.delivery_note_date}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Reference Code</label>
                                        <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                            {deliveryNoteInfo.delivery_note_code}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ marginTop: 'var(--space-2)' }}
                                        onClick={consultDeliveryNote}
                                        disabled={!deliveryNoteInfo.has_digital_copy}
                                    >
                                        <Download size={18} />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="form">
                                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                                        Register a new delivery note for this purchase order.
                                    </p>
                                    <div className="form-group">
                                        <label className="form-label">Delivery Note Code</label>
                                        <input 
                                            className="form-input" 
                                            placeholder="Enter reference code..."
                                            value={deliveryNoteCode} 
                                            onChange={(e) => setDeliveryNoteCode(e.target.value)} 
                                            disabled={deliveryNoteSubmitting} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Digital Copy (PDF)</label>
                                        <div 
                                            style={{ 
                                                border: '2px dashed var(--color-border)', 
                                                borderRadius: 'var(--radius-md)', 
                                                padding: 'var(--space-6)',
                                                textAlign: 'center',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                background: deliveryNoteFile ? 'var(--color-bg-card-hover)' : 'transparent'
                                            }}
                                            onClick={() => document.getElementById('dn-file').click()}
                                        >
                                            <Upload size={32} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }} />
                                            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                                                {deliveryNoteFile ? deliveryNoteFile.name : 'Click to upload or drag and drop'}
                                            </p>
                                            <input
                                                id="dn-file"
                                                type="file"
                                                accept="application/pdf"
                                                style={{ display: 'none' }}
                                                onChange={(e) => setDeliveryNoteFile(e.target.files?.[0] || null)}
                                                disabled={deliveryNoteSubmitting}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={submitCreateDeliveryNote} 
                                        disabled={deliveryNoteSubmitting || !deliveryNoteCode || !deliveryNoteFile}
                                        style={{ width: '100%' }}
                                    >
                                        {deliveryNoteSubmitting ? 'Creating...' : 'Register Delivery Note'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showInvoiceModal && invoicePo && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Supplier Invoice</h2>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                                    PO #{invoicePo.purchase_order_id} • {invoicePo.purchase_order_code}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => !invoiceSubmitting && closeInvoiceModal()}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {invoiceError && (
                                <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
                                    {invoiceError}
                                </div>
                            )}

                            {invoiceLoading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <span>Fetching invoice...</span>
                                </div>
                            ) : invoiceInfo?.exists ? (
                                <div className="form">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Invoice ID</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {invoiceInfo.invoice_id}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Related Delivery Note</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {invoiceInfo.delivery_note_id}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ marginTop: 'var(--space-2)' }}
                                        onClick={consultInvoicePdf}
                                        disabled={!invoiceInfo.has_digital_copy}
                                    >
                                        <Download size={18} />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="form">
                                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                                        Upload the final invoice for this purchase order.
                                    </p>
                                    <div className="form-group">
                                        <label className="form-label">Digital Copy (PDF)</label>
                                        <div 
                                            style={{ 
                                                border: '2px dashed var(--color-border)', 
                                                borderRadius: 'var(--radius-md)', 
                                                padding: 'var(--space-6)',
                                                textAlign: 'center',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                background: invoiceFile ? 'var(--color-bg-card-hover)' : 'transparent'
                                            }}
                                            onClick={() => document.getElementById('inv-file').click()}
                                        >
                                            <Upload size={32} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }} />
                                            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                                                {invoiceFile ? invoiceFile.name : 'Click to upload or drag and drop'}
                                            </p>
                                            <input
                                                id="inv-file"
                                                type="file"
                                                accept="application/pdf"
                                                style={{ display: 'none' }}
                                                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                                                disabled={invoiceSubmitting}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={submitCreateInvoice} 
                                        disabled={invoiceSubmitting || !invoiceFile}
                                        style={{ width: '100%' }}
                                    >
                                        {invoiceSubmitting ? 'Uploading...' : 'Upload Invoice'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAcceptanceReportModal && acceptanceReportPo && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Acceptance Report</h2>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                                    PO #{acceptanceReportPo.purchase_order_id} • {acceptanceReportPo.purchase_order_code}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => !acceptanceReportSubmitting && closeAcceptanceReportModal()}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {acceptanceReportError && (
                                <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
                                    {acceptanceReportError}
                                </div>
                            )}

                            {acceptanceReportLoading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <span>Fetching report...</span>
                                </div>
                            ) : acceptanceReportInfo?.exists ? (
                                <div className="form">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Report ID</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {acceptanceReportInfo.acceptance_report_id}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date & Time</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {acceptanceReportInfo.acceptance_report_datetime}
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                                        Signatures Status
                                    </h4>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                                        {[
                                            { label: 'Director of Admin', signed: acceptanceReportInfo.is_signed_by_director_of_administration_and_support },
                                            { label: 'Security Chief', signed: acceptanceReportInfo.is_signed_by_protection_and_security_bureau_chief },
                                            { label: 'IT Bureau Chief', signed: acceptanceReportInfo.is_signed_by_information_technilogy_bureau_chief },
                                            { label: 'Stock Responsible', signed: acceptanceReportInfo.acceptance_report_is_stock_item_and_consumable_responsible },
                                            { label: 'School Headquarter', signed: acceptanceReportInfo.is_signed_by_school_headquarter },
                                        ].map((sig, idx) => (
                                            <div key={idx} style={{ 
                                                padding: 'var(--space-3)', 
                                                background: 'var(--color-bg-card)', 
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)'
                                            }}>
                                                {sig.signed ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} style={{ color: 'var(--color-text-muted)' }} />}
                                                <span style={{ fontSize: '11px', fontWeight: '500' }}>{sig.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                                        {isStockConsumableResponsible && !arePurchaseOrderItemsMoved(acceptanceReportPo.purchase_order_id) && 
                                         acceptanceReportInfo?.is_signed_by_director_of_administration_and_support && 
                                         acceptanceReportInfo?.is_signed_by_protection_and_security_bureau_chief && 
                                         acceptanceReportInfo?.is_signed_by_school_headquarter && 
                                         acceptanceReportInfo?.is_signed_by_information_technilogy_bureau_chief && 
                                         acceptanceReportInfo?.acceptance_report_is_stock_item_and_consumable_responsible && (
                                            <button type="button" className="btn btn-primary" onClick={() => navigate(`/dashboard/purchase-orders/${acceptanceReportPo.purchase_order_id}/move-items`)}>
                                                <Package size={18} />
                                                <span>Move Items to Stock</span>
                                            </button>
                                        )}
                                        {canSignAcceptanceReport && canCurrentUserSignAcceptanceReport && (
                                            <button type="button" className="btn btn-primary" onClick={submitSignAcceptanceReport}>
                                                <PenTool size={18} />
                                                <span>Sign Report</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={consultAcceptanceReportPdf}
                                            disabled={!acceptanceReportInfo.has_digital_copy}
                                        >
                                            <Download size={18} />
                                            <span>Download PDF</span>
                                        </button>
                                    </div>
                                </div>
                            ) : isStockConsumableResponsible ? (
                                <div className="form">
                                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                                        Create a new acceptance report by uploading the digital copy.
                                    </p>
                                    <div className="form-group">
                                        <label className="form-label">Digital Copy (PDF)</label>
                                        <div 
                                            style={{ 
                                                border: '2px dashed var(--color-border)', 
                                                borderRadius: 'var(--radius-md)', 
                                                padding: 'var(--space-8)',
                                                textAlign: 'center',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                background: acceptanceReportFile ? 'var(--color-bg-card-hover)' : 'transparent'
                                            }}
                                            onClick={() => document.getElementById('ar-file').click()}
                                        >
                                            <Upload size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }} />
                                            <p style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: '500' }}>
                                                {acceptanceReportFile ? acceptanceReportFile.name : 'Choose a file or drag here'}
                                            </p>
                                            <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                Only PDF files are supported
                                            </p>
                                            <input
                                                id="ar-file"
                                                type="file"
                                                accept="application/pdf"
                                                style={{ display: 'none' }}
                                                onChange={(e) => setAcceptanceReportFile(e.target.files?.[0] || null)}
                                                disabled={acceptanceReportSubmitting}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={submitCreateAcceptanceReport} 
                                        disabled={acceptanceReportSubmitting || !acceptanceReportFile}
                                        style={{ width: '100%' }}
                                    >
                                        {acceptanceReportSubmitting ? 'Creating...' : 'Create Acceptance Report'}
                                    </button>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
                                    <ClipboardCheck size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }} />
                                    <p style={{ color: 'var(--color-text-secondary)' }}>No acceptance report has been created for this order yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrdersPage;
