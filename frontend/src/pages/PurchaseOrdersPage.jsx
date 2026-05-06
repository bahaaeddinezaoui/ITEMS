import { useEffect, useMemo, useState } from 'react';
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
    Filter,
    Truck,
    FileCheck,
    AlertCircle,
    Paperclip,
    ArrowRight,
    CircleDot,
    Banknote,
    MoreHorizontal,
    Clock,
    FileBadge,
    ShoppingCart
} from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
import { purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SkeletonKanban, SkeletonCardList } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return String(dt);
    return d.toLocaleString();
};

const PurchaseOrdersPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');
    const isItBureauChief = user?.roles?.some((role) => role.role_code === 'it_bureau_chief');
    const isDirectorAdminSupport = user?.roles?.some((role) => role.role_code === 'director_admin_support');
    const isProtectionSecurityBureauChief = user?.roles?.some((role) => role.role_code === 'protection_and_security_bureau_chief');
    const isSchoolHeadquarter = user?.roles?.some((role) => role.role_code === 'school_headquarter');
    const canConsultPurchaseOrders = isSuperuser || isStockConsumableResponsible || isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter || isItBureauChief;
    const canSignAcceptanceReport = isSuperuser || isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter || isItBureauChief || isStockConsumableResponsible;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

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
            isSuperuser
            || (isDirectorAdminSupport && !acceptanceReportInfo?.is_signed_by_director_of_administration_and_support)
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
            setDeliveryNoteError(e?.response?.data?.error || t('poOrders.loadDeliveryNoteError'));
        } finally {
            setDeliveryNoteLoading(false);
        }
    };

    const submitSignAcceptanceReport = async (signAs = null) => {
        if (!acceptanceReportPo) return;
        setAcceptanceReportError('');
        setSuccess('');
        setError('');

        try {
            let role = signAs;
            if (!role) {
                if (isDirectorAdminSupport) role = 'director_admin_support';
                if (isProtectionSecurityBureauChief) role = 'protection_and_security_bureau_chief';
                if (isSchoolHeadquarter) role = 'school_headquarter';
                if (isItBureauChief) role = 'it_bureau_chief';
                if (isStockConsumableResponsible) role = 'stock_consumable_responsible';
            }

            const payload = role ? { sign_as: role, is_signed: true } : { is_signed: true };
            await purchaseOrderService.signAcceptanceReport(acceptanceReportPo.purchase_order_id, payload);
            const info = await purchaseOrderService.getAcceptanceReport(acceptanceReportPo.purchase_order_id);
            setAcceptanceReportInfo(info);
            setSuccess(t('poOrders.acceptanceReportSigned'));
            showSuccess(t('poOrders.acceptanceReportSigned'));
        } catch (e) {
            setAcceptanceReportError(e?.response?.data?.error || t('poOrders.signAcceptanceReportError'));
            showError(e?.response?.data?.error || t('poOrders.signAcceptanceReportError'));
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
            setAcceptanceReportError(e?.response?.data?.error || t('poOrders.loadAcceptanceReportError'));
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
            setAcceptanceReportError(t('poOrders.digitalCopyRequired'));
            return;
        }

        setAcceptanceReportSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('digital_copy', acceptanceReportFile);
            const data = await purchaseOrderService.createAcceptanceReport(acceptanceReportPo.purchase_order_id, fd);
            const arId = data?.acceptance_report_id;
            setSuccess(arId ? t('poOrders.acceptanceReportCreatedWithId', { id: arId }) : t('poOrders.acceptanceReportCreated'));
            showSuccess(arId ? t('poOrders.acceptanceReportCreatedWithId', { id: arId }) : t('poOrders.acceptanceReportCreated'));

            const info = await purchaseOrderService.getAcceptanceReport(acceptanceReportPo.purchase_order_id);
            setAcceptanceReportInfo(info);
            await loadOrders();
        } catch (e) {
            setAcceptanceReportError(e?.response?.data?.error || t('poOrders.createAcceptanceReportError'));
            showError(e?.response?.data?.error || t('poOrders.createAcceptanceReportError'));
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
            setAcceptanceReportError(e?.response?.data?.error || t('poOrders.loadAcceptanceReportPdfError'));
        }
    };

    const submitCreateDeliveryNote = async () => {
        if (!deliveryNotePo) return;
        setDeliveryNoteError('');
        setSuccess('');
        setError('');

        if (!deliveryNoteCode) {
            setDeliveryNoteError(t('poOrders.deliveryNoteCodeRequired'));
            return;
        }
        if (!deliveryNoteFile) {
            setDeliveryNoteError(t('poOrders.digitalCopyRequired'));
            return;
        }

        setDeliveryNoteSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('delivery_note_code', deliveryNoteCode);
            fd.append('digital_copy', deliveryNoteFile);
            const data = await purchaseOrderService.createDeliveryNote(deliveryNotePo.purchase_order_id, fd);
            const dnId = data?.delivery_note_id;
            setSuccess(dnId ? t('poOrders.deliveryNoteCreatedWithId', { id: dnId }) : t('poOrders.deliveryNoteCreated'));
            showSuccess(dnId ? t('poOrders.deliveryNoteCreatedWithId', { id: dnId }) : t('poOrders.deliveryNoteCreated'));

            const info = await purchaseOrderService.getDeliveryNote(deliveryNotePo.purchase_order_id);
            setDeliveryNoteInfo(info);
            await loadOrders();
        } catch (e) {
            setDeliveryNoteError(e?.response?.data?.error || t('poOrders.createDeliveryNoteError'));
            showError(e?.response?.data?.error || t('poOrders.createDeliveryNoteError'));
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
            setInvoiceError(e?.response?.data?.error || t('poOrders.loadInvoiceError'));
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
            setInvoiceError(t('poOrders.digitalCopyRequired'));
            return;
        }

        setInvoiceSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('digital_copy', invoiceFile);
            const data = await purchaseOrderService.createInvoice(invoicePo.purchase_order_id, fd);
            const invId = data?.invoice_id;
            setSuccess(invId ? t('poOrders.invoiceCreatedWithId', { id: invId }) : t('poOrders.invoiceCreated'));
            showSuccess(invId ? t('poOrders.invoiceCreatedWithId', { id: invId }) : t('poOrders.invoiceCreated'));

            const info = await purchaseOrderService.getInvoice(invoicePo.purchase_order_id);
            setInvoiceInfo(info);
            await loadOrders();
        } catch (e) {
            setInvoiceError(e?.response?.data?.error || t('poOrders.createInvoiceError'));
            showError(e?.response?.data?.error || t('poOrders.createInvoiceError'));
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
            setInvoiceError(e?.response?.data?.error || t('poOrders.loadInvoicePdfError'));
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
            setError(e?.response?.data?.error || t('poOrders.loadOrdersError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canConsultPurchaseOrders) return;
        loadOrders();
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

    const getStatusKey = (o) => {
        if (o.has_remaining === false) return 'received';
        if (o.has_remaining === true) return 'partial';
        return 'pending';
    };

    const statusConfig = useMemo(() => ({
        pending: {
            label: t('poOrders.statusPending'),
            color: '#6366f1',
            bg: 'rgba(99, 102, 241, 0.12)',
            border: 'rgba(99, 102, 241, 0.25)',
            glow: 'rgba(99, 102, 241, 0.06)',
            dot: '#6366f1',
        },
        partial: {
            label: t('poOrders.statusPartial'),
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.25)',
            glow: 'rgba(245, 158, 11, 0.06)',
            dot: '#f59e0b',
        },
        received: {
            label: t('poOrders.statusReceived'),
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.25)',
            glow: 'rgba(16, 185, 129, 0.06)',
            dot: '#10b981',
        },
    }), [t]);

    const groupedOrders = useMemo(() => {
        const groups = { pending: [], partial: [], received: [] };
        filteredOrders.forEach(o => {
            groups[getStatusKey(o)].push(o);
        });
        return groups;
    }, [filteredOrders]);

    const stats = useMemo(() => ({
        total: filteredOrders.length,
        pending: groupedOrders.pending.length,
        partial: groupedOrders.partial.length,
        received: groupedOrders.received.length,
    }), [filteredOrders, groupedOrders]);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1440px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><ShoppingCart size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('poOrders.title')}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0, marginTop: 'var(--space-1)' }}>
                        {t('poOrders.subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={loadOrders}
                        disabled={loading}
                        style={{ padding: 'var(--space-2) var(--space-3)', gap: 'var(--space-2)' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {isStockConsumableResponsible && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate('/dashboard/purchase-orders/create')}
                            style={{ padding: 'var(--space-2) var(--space-5)', gap: 'var(--space-2)' }}
                        >
                            <Plus size={16} />
                            <span>{t('poOrders.newOrder')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', alignItems: 'stretch' }}>
                {[
                    { key: 'total', value: stats.total, icon: Package, color: 'var(--color-accent-primary)' },
                    { key: 'pending', value: stats.pending, icon: CircleDot, color: statusConfig.pending.color },
                    { key: 'partial', value: stats.partial, icon: History, color: statusConfig.partial.color },
                    { key: 'received', value: stats.received, icon: CheckCircle2, color: statusConfig.received.color },
                ].map(s => (
                    <div key={s.key} style={{ flex: 1, background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <s.icon size={20} style={{ color: s.color }} />
                        <div>
                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {t(`poOrders.stat${s.key.charAt(0).toUpperCase() + s.key.slice(1)}`)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pipeline Flow Indicator */}
            {!loading && filteredOrders.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    marginBottom: 'var(--space-5)', padding: '0 var(--space-1)',
                }}>
                    {['pending', 'partial', 'received'].map((key, i) => (
                        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{
                                width: '8px', height: '8px', borderRadius: 'var(--radius-full)',
                                background: statusConfig[key].dot,
                                boxShadow: `0 0 8px ${statusConfig[key].dot}40`,
                            }} />
                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: statusConfig[key].color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {statusConfig[key].label}
                            </span>
                            {i < 2 && <ArrowRight size={12} style={{ color: 'var(--color-text-muted)', margin: '0 var(--space-1)' }} />}
                        </span>
                    ))}
                </div>
            )}

            {/* Main Content */}
            {loading ? (
                <div style={{ padding: 'var(--space-16)' }}>
                    <SkeletonKanban columns={3} cardsPerColumn={4} />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{
                    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-border)', padding: 'var(--space-16)',
                    textAlign: 'center',
                }}>
                    <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
                    <h3 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>{t('poOrders.noOrdersFound')}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {searchTerm ? t('poOrders.noResultsFor', { term: searchTerm }) : t('poOrders.noOrdersYet')}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', alignItems: 'start' }}>
                    {['pending', 'partial', 'received'].map(statusKey => {
                        const cfg = statusConfig[statusKey];
                        const columnOrders = groupedOrders[statusKey];
                        return (
                            <div key={statusKey}>
                                {/* Column Header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: cfg.bg,
                                    border: `1px solid ${cfg.border}`,
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: 'var(--space-3)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <span style={{
                                            width: '10px', height: '10px', borderRadius: 'var(--radius-full)',
                                            background: cfg.dot,
                                            boxShadow: `0 0 6px ${cfg.dot}50`,
                                        }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: cfg.color }}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', fontWeight: '800',
                                        color: cfg.color, opacity: 0.8,
                                        background: `${cfg.color}15`, padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                    }}>
                                        {columnOrders.length}
                                    </span>
                                </div>

                                {/* Order Cards */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {columnOrders.map(o => (
                                        <div
                                            key={`po-${o.purchase_order_id}`}
                                            style={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: 'var(--space-4)',
                                                transition: 'all 0.15s ease',
                                                cursor: 'default',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = cfg.border;
                                                e.currentTarget.style.background = cfg.glow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                                e.currentTarget.style.background = 'var(--color-bg-card)';
                                            }}
                                        >
                                            {/* Status accent line */}
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                                width: '3px', background: cfg.dot, borderRadius: '3px 0 0 3px',
                                            }} />

                                            {/* Top row: ID + Code + Finance */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', paddingLeft: 'var(--space-2)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-xs)', fontWeight: '800',
                                                        color: cfg.color, fontFamily: 'monospace',
                                                    }}>
                                                        #{o.purchase_order_id}
                                                    </span>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-sm)', fontWeight: '700',
                                                        color: 'var(--color-text-primary)',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>
                                                        {o.purchase_order_code || t('poOrders.unnamedOrder')}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                                                    {o.is_signed_by_finance && (
                                                        <span title={t('poOrders.financeSigned')} style={{
                                                            width: '18px', height: '18px', borderRadius: 'var(--radius-full)',
                                                            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <Banknote size={10} style={{ color: 'var(--color-success)' }} />
                                                        </span>
                                                    )}
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '4px', borderRadius: 'var(--radius-md)', minWidth: '24px', height: '24px' }}
                                                        onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}`)}
                                                        title={t('poOrders.viewDetails')}
                                                    >
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Supplier */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)',
                                                marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-2)',
                                            }}>
                                                <Building2 size={12} style={{ flexShrink: 0 }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {o.supplier_name || (o.supplier_id ? t('poOrders.supplierWithId', { id: o.supplier_id }) : t('poOrders.noSupplier'))}
                                                </span>
                                            </div>

                                            {/* Document Status Dots */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                                paddingLeft: 'var(--space-2)', marginBottom: 'var(--space-3)',
                                            }}>
                                                {[
                                                    { icon: Truck, label: t('poOrders.deliveryNote'), active: o.has_remaining === false },
                                                    { icon: Receipt, label: t('poOrders.invoice'), active: o.has_remaining === false },
                                                    { icon: ClipboardCheck, label: t('poOrders.acceptanceReport'), active: o.has_remaining === false },
                                                ].map(doc => (
                                                    <span
                                                        key={doc.label}
                                                        title={doc.label}
                                                        style={{
                                                            width: '22px', height: '22px', borderRadius: 'var(--radius-md)',
                                                            background: doc.active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)',
                                                            border: `1px solid ${doc.active ? 'rgba(16, 185, 129, 0.25)' : 'var(--color-border)'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.15s ease',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <doc.icon size={11} style={{ color: doc.active ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Action row - icon only */}
                                            <div style={{
                                                display: 'flex', gap: 'var(--space-1)',
                                                borderTop: '1px solid var(--color-border)',
                                                paddingTop: 'var(--space-2)',
                                                paddingLeft: 'var(--space-2)',
                                            }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 6px', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', minHeight: '26px' }}
                                                    onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/receive`)}
                                                    disabled={o.has_remaining === false}
                                                    title={t('poOrders.receiveItems')}
                                                >
                                                    <Package size={12} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 6px', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', minHeight: '26px' }}
                                                    onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/backorder-reports`)}
                                                    title={t('poOrders.backorders')}
                                                >
                                                    <History size={12} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 6px', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', minHeight: '26px' }}
                                                    onClick={() => openDeliveryNoteModal(o)}
                                                    disabled={o.has_remaining !== false}
                                                    title={t('poOrders.deliveryNote')}
                                                >
                                                    <FileText size={12} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 6px', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', minHeight: '26px' }}
                                                    onClick={() => openAcceptanceReportModal(o)}
                                                    disabled={isStockConsumableResponsible ? (o.has_remaining !== false) : false}
                                                    title={t('poOrders.acceptanceReport')}
                                                >
                                                    <ClipboardCheck size={12} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 6px', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', minHeight: '26px' }}
                                                    onClick={() => openInvoiceModal(o)}
                                                    disabled={o.has_remaining !== false}
                                                    title={t('poOrders.invoice')}
                                                >
                                                    <Receipt size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {columnOrders.length === 0 && (
                                        <div style={{
                                            padding: 'var(--space-8) var(--space-4)',
                                            textAlign: 'center',
                                            color: 'var(--color-text-muted)',
                                            fontSize: 'var(--font-size-xs)',
                                            border: '1px dashed var(--color-border)',
                                            borderRadius: 'var(--radius-lg)',
                                        }}>
                                            —
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showDeliveryNoteModal && deliveryNotePo && (
                <ModalPortal>
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '560px' }}>
                        <div className="modal-header" style={{ padding: 'var(--space-5) var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Truck size={20} style={{ color: 'var(--color-accent-tertiary)' }} />
                                </div>
                                <div>
                                    <h2 className="modal-title" style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', letterSpacing: '-0.01em' }}>{t('poOrders.deliveryNote')}</h2>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                                        PO #{deliveryNotePo.purchase_order_id} • {deliveryNotePo.purchase_order_code}
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => !deliveryNoteSubmitting && closeDeliveryNoteModal()} style={{
                                width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: 'var(--space-6)' }}>
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            {deliveryNoteError && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-5)',
                                    color: 'var(--color-error)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: '500'
                                }}>
                                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                    <span>{deliveryNoteError}</span>
                                </div>
                            )}

                            {deliveryNoteLoading ? (
                                <div style={{ padding: 'var(--space-8) 0' }}>
                                    <SkeletonCardList count={2} cardLines={2} gap="var(--space-4)" />
                                </div>
                            ) : deliveryNoteInfo?.exists ? (
                                <div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 'var(--space-3)',
                                        marginBottom: 'var(--space-4)'
                                    }}>
                                        <div style={{
                                            padding: 'var(--space-4)',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <Hash size={13} style={{ color: 'var(--color-accent-tertiary)' }} />
                                                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('poOrders.noteId')}</span>
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                {deliveryNoteInfo.delivery_note_id}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: 'var(--space-4)',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <Calendar size={13} style={{ color: 'var(--color-accent-tertiary)' }} />
                                                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('poOrders.issueDate')}</span>
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                {deliveryNoteInfo.delivery_note_date}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-4)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 'var(--space-6)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                            <FileText size={13} style={{ color: 'var(--color-accent-tertiary)' }} />
                                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('poOrders.referenceCode')}</span>
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                            {deliveryNoteInfo.delivery_note_code}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: 'var(--space-3)',
                                        paddingTop: 'var(--space-4)',
                                        borderTop: '1px solid var(--color-border)'
                                    }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ flex: 1, justifyContent: 'center' }}
                                            onClick={consultDeliveryNote}
                                            disabled={!deliveryNoteInfo.has_digital_copy}
                                        >
                                            <Download size={16} />
                                            <span>{t('poOrders.downloadPdf')}</span>
                                        </button>
                                        {!deliveryNoteInfo.has_digital_copy && (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                                                padding: '0 var(--space-3)'
                                            }}>
                                                <Paperclip size={14} />
                                                No digital copy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-4)',
                                        background: 'rgba(99, 102, 241, 0.06)',
                                        border: '1px solid rgba(99, 102, 241, 0.15)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 'var(--space-5)'
                                    }}>
                                        <FileCheck size={18} style={{ color: 'var(--color-accent-tertiary)', flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                            {t('poOrders.registerDeliveryNote')}
                                        </p>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                        <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>{t('poOrders.deliveryNoteCode')}</label>
                                        <div style={{ position: 'relative' }}>
                                            <Hash size={16} style={{
                                                position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
                                                color: 'var(--color-text-muted)', pointerEvents: 'none'
                                            }} />
                                            <input 
                                                className="form-input" 
                                                placeholder={t('poOrders.enterReferenceCode')}
                                                value={deliveryNoteCode} 
                                                onChange={(e) => setDeliveryNoteCode(e.target.value)} 
                                                disabled={deliveryNoteSubmitting}
                                                style={{ paddingLeft: 'var(--space-10)', height: '44px', fontSize: 'var(--font-size-sm)' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                                        <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>{t('poOrders.digitalCopyPdf')}</label>
                                        <div 
                                            style={{ 
                                                border: deliveryNoteFile ? '1px solid rgba(99, 102, 241, 0.3)' : '2px dashed rgba(255, 255, 255, 0.12)', 
                                                borderRadius: 'var(--radius-lg)', 
                                                padding: 'var(--space-8) var(--space-6)',
                                                textAlign: 'center',
                                                position: 'relative',
                                                cursor: deliveryNoteSubmitting ? 'not-allowed' : 'pointer',
                                                background: deliveryNoteFile ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onClick={() => !deliveryNoteSubmitting && document.getElementById('dn-file').click()}
                                            onMouseEnter={(e) => {
                                                if (!deliveryNoteSubmitting && !deliveryNoteFile) {
                                                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!deliveryNoteFile) {
                                                    e.currentTarget.style.borderColor = '2px dashed rgba(255, 255, 255, 0.12)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                }
                                            }}
                                        >
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: 'var(--radius-full)',
                                                background: deliveryNoteFile ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                                                border: deliveryNoteFile ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto var(--space-3)'
                                            }}>
                                                {deliveryNoteFile ? <FileCheck size={22} style={{ color: 'var(--color-success)' }} /> : <Upload size={22} style={{ color: 'var(--color-accent-tertiary)' }} />}
                                            </div>
                                            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: '600', color: deliveryNoteFile ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                                                {deliveryNoteFile ? deliveryNoteFile.name : t('poOrders.clickToUpload')}
                                            </p>
                                            <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                PDF only
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
                                        style={{ width: '100%', justifyContent: 'center', height: '44px', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}
                                    >
                                        {deliveryNoteSubmitting ? (
                                            <>
                                                <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                                <span>{t('poOrders.creating')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileCheck size={18} />
                                                <span>{t('poOrders.registerDeliveryNoteBtn')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {showInvoiceModal && invoicePo && (
                <ModalPortal>
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{t('poOrders.supplierInvoice')}</h2>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                                    PO #{invoicePo.purchase_order_id} • {invoicePo.purchase_order_code}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => !invoiceSubmitting && closeInvoiceModal()}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            {invoiceError && (
                                <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
                                    {invoiceError}
                                </div>
                            )}

                            {invoiceLoading ? (
                                <div style={{ padding: 'var(--space-4) 0' }}>
                                    <SkeletonCardList count={2} cardLines={2} gap="var(--space-4)" />
                                </div>
                            ) : invoiceInfo?.exists ? (
                                <div className="form">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">{t('poOrders.invoiceId')}</label>
                                            <div className="form-input" style={{ background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                                                {invoiceInfo.invoice_id}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('poOrders.relatedDeliveryNote')}</label>
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
                                        <span>{t('poOrders.downloadPdf')}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="form">
                                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                                        {t('poOrders.uploadInvoiceDesc')}
                                    </p>
                                    <div className="form-group">
                                        <label className="form-label">{t('poOrders.digitalCopyPdf')}</label>
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
                                                {invoiceFile ? invoiceFile.name : t('poOrders.clickToUpload')}
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
                                        {invoiceSubmitting ? t('poOrders.uploading') : t('poOrders.uploadInvoice')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {showAcceptanceReportModal && acceptanceReportPo && (
                <ModalPortal>
                <div className="modal-overlay ar-modal-overlay">
                    <div className="modal ar-modal">
                        <div className="ar-modal-header">
                            <div className="ar-modal-header-left">
                                <div className="ar-modal-icon">
                                    <FileCheck size={20} />
                                </div>
                                <div>
                                    <h2 className="ar-modal-title">{t('poOrders.acceptanceReport')}</h2>
                                    <p className="ar-modal-subtitle">
                                        PO #{acceptanceReportPo.purchase_order_id} • {acceptanceReportPo.purchase_order_code}
                                    </p>
                                </div>
                            </div>
                            <button className="ar-modal-close" onClick={() => !acceptanceReportSubmitting && closeAcceptanceReportModal()}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="ar-modal-body">
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            {acceptanceReportError && (
                                <div className="ar-modal-error">
                                    <AlertCircle size={16} />
                                    {acceptanceReportError}
                                </div>
                            )}

                            {acceptanceReportLoading ? (
                                <div style={{ padding: 'var(--space-4) 0' }}>
                                    <SkeletonCardList count={2} cardLines={2} gap="var(--space-4)" />
                                </div>
                            ) : acceptanceReportInfo?.exists ? (
                                <>
                                    <div className="ar-info-grid">
                                        <div className="ar-info-card">
                                            <div className="ar-info-card-icon">
                                                <Hash size={16} />
                                            </div>
                                            <div className="ar-info-card-content">
                                                <span className="ar-info-card-label">{t('poOrders.reportId')}</span>
                                                <span className="ar-info-card-value">{acceptanceReportInfo.acceptance_report_id}</span>
                                            </div>
                                        </div>
                                        <div className="ar-info-card">
                                            <div className="ar-info-card-icon">
                                                <Clock size={16} />
                                            </div>
                                            <div className="ar-info-card-content">
                                                <span className="ar-info-card-label">{t('poOrders.dateAndTime')}</span>
                                                <span className="ar-info-card-value">{formatDateTime(acceptanceReportInfo.acceptance_report_datetime)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ar-signatures-section">
                                        <div className="ar-signatures-header">
                                            <PenTool size={14} />
                                            {t('poOrders.signaturesStatus')}
                                        </div>
                                        <div className="ar-signatures-grid">
                                            {[
                                                { label: t('poOrders.sigDirectorOfAdmin'), signed: acceptanceReportInfo.is_signed_by_director_of_administration_and_support, signAs: 'director_admin_support' },
                                                { label: t('poOrders.sigSecurityChief'), signed: acceptanceReportInfo.is_signed_by_protection_and_security_bureau_chief, signAs: 'protection_and_security_bureau_chief' },
                                                { label: t('poOrders.sigItBureauChief'), signed: acceptanceReportInfo.is_signed_by_information_technilogy_bureau_chief, signAs: 'it_bureau_chief' },
                                                { label: t('poOrders.sigStockResponsible'), signed: acceptanceReportInfo.acceptance_report_is_stock_item_and_consumable_responsible, signAs: 'stock_consumable_responsible' },
                                                { label: t('poOrders.sigSchoolHeadquarter'), signed: acceptanceReportInfo.is_signed_by_school_headquarter, signAs: 'school_headquarter' },
                                            ].map((sig, idx) => (
                                                <div key={idx} className={`ar-signature-chip ${sig.signed ? 'signed' : ''}`}>
                                                    <span className="ar-signature-chip-icon">
                                                        {sig.signed ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} style={{ color: 'var(--color-text-muted)' }} />}
                                                    </span>
                                                    <span className="ar-signature-chip-label">{sig.label}</span>
                                                    {isSuperuser && !sig.signed && (
                                                        <button
                                                            type="button"
                                                            className="ar-signature-chip-btn"
                                                            onClick={() => submitSignAcceptanceReport(sig.signAs)}
                                                        >
                                                            <PenTool size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="ar-modal-footer">
                                        {isStockConsumableResponsible && !arePurchaseOrderItemsMoved(acceptanceReportPo.purchase_order_id) && 
                                         acceptanceReportInfo?.is_signed_by_director_of_administration_and_support && 
                                         acceptanceReportInfo?.is_signed_by_protection_and_security_bureau_chief && 
                                         acceptanceReportInfo?.is_signed_by_school_headquarter && 
                                         acceptanceReportInfo?.is_signed_by_information_technilogy_bureau_chief && 
                                         acceptanceReportInfo?.acceptance_report_is_stock_item_and_consumable_responsible && (
                                            <button type="button" className="btn btn-primary" onClick={() => navigate(`/dashboard/purchase-orders/${acceptanceReportPo.purchase_order_id}/move-items`)}>
                                                <Package size={16} />
                                                <span>{t('poOrders.moveItemsToStock')}</span>
                                            </button>
                                        )}
                                        {!isSuperuser && canSignAcceptanceReport && canCurrentUserSignAcceptanceReport && (
                                            <button type="button" className="btn btn-primary" onClick={() => submitSignAcceptanceReport()}>
                                                <PenTool size={16} />
                                                <span>{t('poOrders.signReport')}</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={consultAcceptanceReportPdf}
                                            disabled={!acceptanceReportInfo.has_digital_copy}
                                        >
                                            <Download size={16} />
                                            <span>{t('poOrders.downloadPdf')}</span>
                                        </button>
                                    </div>
                                </>
                            ) : isStockConsumableResponsible ? (
                                <>
                                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                                        {t('poOrders.createAcceptanceReportDesc')}
                                    </p>
                                    <div 
                                        className={`ar-upload-area ${acceptanceReportFile ? 'has-file' : ''}`}
                                        onClick={() => document.getElementById('ar-file').click()}
                                    >
                                        <Upload size={40} className="ar-upload-icon" />
                                        <p className="ar-upload-text">
                                            {acceptanceReportFile ? acceptanceReportFile.name : t('poOrders.chooseFile')}
                                        </p>
                                        <p className="ar-upload-hint">
                                            {t('poOrders.onlyPdfSupported')}
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
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={submitCreateAcceptanceReport} 
                                        disabled={acceptanceReportSubmitting || !acceptanceReportFile}
                                        style={{ width: '100%' }}
                                    >
                                        {acceptanceReportSubmitting ? t('poOrders.creating') : t('poOrders.createAcceptanceReport')}
                                    </button>
                                </>
                            ) : (
                                <div className="ar-empty-state">
                                    <ClipboardCheck size={48} className="ar-empty-state-icon" />
                                    <p className="ar-empty-state-text">{t('poOrders.noAcceptanceReportYet')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
            <FilterSortFAB hasActiveFilters={!!searchTerm}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('poOrders.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '40px', paddingLeft: 'var(--space-10)', paddingRight: searchTerm ? 'var(--space-10)' : 'var(--space-4)' }} />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        )}
                    </div>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </div>
    );
};

export default PurchaseOrdersPage;
