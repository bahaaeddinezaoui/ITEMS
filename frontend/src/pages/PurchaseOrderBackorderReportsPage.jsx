import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { backorderReportService, purchaseOrderService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, RefreshCw, Package, Droplets, Clock, FileText, CheckCircle2, Truck, BarChart3 } from 'lucide-react';
import { SkeletonListRows, SkeletonCardList } from '../components/SkeletonCard';

const ModelCard = ({ item, type }) => {
    const ordered = Number(item.quantity_ordered ?? 0);
    const received = Number(item.quantity_received ?? 0);
    const remaining = Number(item.quantity_remaining ?? 0);
    const pct = ordered > 0 ? Math.min((received / ordered) * 100, 100) : 0;
    const isComplete = remaining === 0;
    const isStock = type === 'stock';

    const barColor = isComplete
        ? 'var(--color-success)'
        : pct >= 50
            ? 'var(--color-warning)'
            : 'var(--color-error)';

    const barGlow = isComplete
        ? 'rgba(16, 185, 129, 0.3)'
        : pct >= 50
            ? 'rgba(245, 158, 11, 0.3)'
            : 'rgba(239, 68, 68, 0.3)';

    return (
        <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            transition: 'all var(--transition-fast)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                background: isStock ? 'var(--color-accent-primary)' : 'var(--color-warning)',
                opacity: 0.8,
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0, flex: 1 }}>
                    {isStock ? (
                        <Package size={14} style={{ flexShrink: 0, color: 'var(--color-accent-secondary)' }} />
                    ) : (
                        <Droplets size={14} style={{ flexShrink: 0, color: 'var(--color-warning)' }} />
                    )}
                    <span style={{
                        fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {item.model_name || `#${isStock ? item.stock_item_model_id : item.consumable_model_id}`}
                    </span>
                </div>
                {isComplete ? (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                        padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)',
                        background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)',
                        fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0,
                    }}>
                        <CheckCircle2 size={10} />
                    </span>
                ) : (
                    <span style={{
                        padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)',
                        background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-error)',
                        fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0,
                    }}>
                        {remaining}
                    </span>
                )}
            </div>

            <div className="progress-container" style={{ height: 6, marginBottom: 'var(--space-2)' }}>
                <div className="progress-bar" style={{
                    width: `${pct}%`,
                    background: barColor,
                    boxShadow: `0 0 10px ${barGlow}`,
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                <span>{received}/{ordered}</span>
                <span>{Math.round(pct)}%</span>
            </div>
        </div>
    );
};

const EmptyState = ({ icon: Icon, message }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--space-3)', padding: 'var(--space-10) var(--space-6)',
        color: 'var(--color-text-muted)', textAlign: 'center',
    }}>
        <Icon size={32} strokeWidth={1.5} />
        <span style={{ fontSize: 'var(--font-size-sm)' }}>{message}</span>
    </div>
);

const PurchaseOrderBackorderReportsPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { t } = useTranslation();

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [order, setOrder] = useState(null);
    const [remaining, setRemaining] = useState(null);
    const [remainingLoading, setRemainingLoading] = useState(false);

    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [selectedReportId, setSelectedReportId] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedLoading, setSelectedLoading] = useState(false);

    const remainingItems = useMemo(() => {
        if (!remaining) return [];
        const stocks = (remaining.stock_item_models || []).map((r) => ({ ...r, _type: 'stock', _key: `rem-s-${r.stock_item_model_id}` }));
        const consumables = (remaining.consumable_models || []).map((r) => ({ ...r, _type: 'consumable', _key: `rem-c-${r.consumable_model_id}` }));
        return [...stocks, ...consumables];
    }, [remaining]);

    const snapshotItems = useMemo(() => {
        if (!selectedReport) return [];
        const stocks = (selectedReport.stock_item_models || []).map((r) => ({ ...r, _type: 'stock', _key: `snap-s-${r.stock_item_model_id}` }));
        const consumables = (selectedReport.consumable_models || []).map((r) => ({ ...r, _type: 'consumable', _key: `snap-c-${r.consumable_model_id}` }));
        return [...stocks, ...consumables];
    }, [selectedReport]);

    const hasRemainingBackorder = remaining && remainingItems.some((l) => Number(l.quantity_remaining ?? 0) > 0);

    const loadHeader = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);
        } catch (e) {
            setOrder(null);
            setError(e?.response?.data?.error || t('backorderReports.loadOrderError'));
        } finally {
            setLoading(false);
        }
    };

    const loadRemaining = async () => {
        setRemainingLoading(true);
        setError('');
        try {
            const data = await backorderReportService.getRemaining(orderId);
            setRemaining(data || null);
        } catch (e) {
            setRemaining(null);
            setError(e?.response?.data?.error || t('backorderReports.loadRemainingError'));
        } finally {
            setRemainingLoading(false);
        }
    };

    const loadReports = async () => {
        setReportsLoading(true);
        setError('');
        try {
            const data = await backorderReportService.getAll({ purchase_order_id: orderId });
            const items = Array.isArray(data) ? data : (data?.results || []);
            setReports(items);
            if (items.length > 0 && !selectedReportId) {
                setSelectedReportId(items[0].backorder_report_id);
            }
        } catch (e) {
            setReports([]);
            setError(e?.response?.data?.error || t('backorderReports.loadReportsError'));
        } finally {
            setReportsLoading(false);
        }
    };

    const loadSelectedReport = async (reportId) => {
        if (!reportId) {
            setSelectedReport(null);
            return;
        }

        setSelectedLoading(true);
        setError('');
        try {
            const data = await backorderReportService.getById(reportId);
            setSelectedReport(data || null);
        } catch (e) {
            setSelectedReport(null);
            setError(e?.response?.data?.error || t('backorderReports.loadReportDetailsError'));
        } finally {
            setSelectedLoading(false);
        }
    };

    const refreshAll = async () => {
        await Promise.all([loadHeader(), loadRemaining(), loadReports()]);
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        refreshAll();
    }, [isStockConsumableResponsible, orderId]);

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        if (!selectedReportId) return;
        loadSelectedReport(selectedReportId);
    }, [isStockConsumableResponsible, selectedReportId]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><BarChart3 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('backorderReports.title')}</h1>
                    <p className="page-subtitle">{t('backorderReports.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        <ArrowLeft size={16} />
                        {t('common.back')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={refreshAll} disabled={loading || remainingLoading || reportsLoading}>
                        <RefreshCw size={16} />
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                    {success}
                </div>
            )}

            {loading ? (
                <div style={{ padding: 'var(--space-12)' }}>
                    <SkeletonCardList count={1} cardLines={3} />
                </div>
            ) : !order ? (
                <EmptyState icon={FileText} message={t('backorderReports.notFound')} />
            ) : (
                <>
                    {/* Order banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-5) var(--space-6)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 'var(--space-4)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-primary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <FileText size={20} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', letterSpacing: '-0.02em' }}>
                                    PO #{order.purchase_order_id}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {order.purchase_order_code || ''}
                                </div>
                            </div>
                        </div>
                        {hasRemainingBackorder && (
                            <button type="button" className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate(`/dashboard/purchase-orders/${orderId}/receive`)}>
                                <Truck size={16} />
                                {t('backorderReports.receiveItems')}
                            </button>
                        )}
                    </div>

                    {/* Remaining to deliver */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Truck size={18} style={{ color: 'var(--color-accent-secondary)' }} />
                                <h2 className="card-title" style={{ margin: 0 }}>{t('backorderReports.remainingToDeliver')}</h2>
                            </div>
                            {!remainingLoading && remainingItems.length > 0 && (
                                <span style={{
                                    padding: '2px var(--space-3)', borderRadius: 'var(--radius-full)',
                                    background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)',
                                    fontSize: 'var(--font-size-xs)', fontWeight: 700,
                                }}>
                                    {remainingItems.filter((l) => Number(l.quantity_remaining ?? 0) > 0).length} {t('backorderReports.remaining').toLowerCase()}
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            {remainingLoading ? (
                                <SkeletonListRows count={5} />
                            ) : remainingItems.length === 0 ? (
                                <EmptyState icon={CheckCircle2} message={t('backorderReports.allItemsReceived')} />
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: 'var(--space-3)',
                                }}>
                                    {remainingItems.map((r) => (
                                        <ModelCard key={r._key} item={r} type={r._type} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reports history */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Clock size={18} style={{ color: 'var(--color-accent-secondary)' }} />
                                <h2 className="card-title" style={{ margin: 0 }}>{t('backorderReports.reportsHistory')}</h2>
                            </div>
                            {!reportsLoading && reports.length > 0 && (
                                <span style={{
                                    padding: '2px var(--space-3)', borderRadius: 'var(--radius-full)',
                                    background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent-tertiary)',
                                    fontSize: 'var(--font-size-xs)', fontWeight: 700,
                                }}>
                                    {reports.length}
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            {reportsLoading ? (
                                <SkeletonListRows count={5} />
                            ) : reports.length === 0 ? (
                                <EmptyState icon={FileText} message={t('backorderReports.noReportsYet')} />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                                    {/* Timeline selector */}
                                    <div style={{
                                        display: 'flex', gap: 'var(--space-2)', overflowX: 'auto',
                                        paddingBottom: 'var(--space-2)',
                                    }}>
                                        {reports.map((r) => {
                                            const isActive = Number(selectedReportId) === Number(r.backorder_report_id);
                                            return (
                                                <button
                                                    key={`br-${r.backorder_report_id}`}
                                                    type="button"
                                                    onClick={() => setSelectedReportId(r.backorder_report_id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                        padding: 'var(--space-2) var(--space-4)',
                                                        borderRadius: 'var(--radius-full)',
                                                        border: `1px solid ${isActive ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                                                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-bg-card)',
                                                        color: isActive ? 'var(--color-accent-tertiary)' : 'var(--color-text-secondary)',
                                                        fontSize: 'var(--font-size-sm)', fontWeight: isActive ? 700 : 500,
                                                        cursor: 'pointer', whiteSpace: 'nowrap',
                                                        transition: 'all var(--transition-fast)',
                                                        fontFamily: 'var(--font-family)',
                                                    }}
                                                >
                                                    <span style={{
                                                        width: 6, height: 6, borderRadius: '50%',
                                                        background: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                                                        flexShrink: 0,
                                                    }} />
                                                    #{r.backorder_report_id}
                                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                                                        {r.backorder_report_date || ''}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Selected report snapshot */}
                                    {selectedLoading ? (
                                        <div style={{ padding: 'var(--space-6)' }}>
                                            <SkeletonCardList count={1} cardLines={3} />
                                        </div>
                                    ) : !selectedReport ? (
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-6)' }}>
                                            {t('backorderReports.selectReport')}
                                        </div>
                                    ) : snapshotItems.length === 0 ? (
                                        <EmptyState icon={FileText} message={t('backorderReports.noSnapshotLines')} />
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                            gap: 'var(--space-3)',
                                        }}>
                                            {snapshotItems.map((r) => (
                                                <ModelCard key={r._key} item={r} type={r._type} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrderBackorderReportsPage;
