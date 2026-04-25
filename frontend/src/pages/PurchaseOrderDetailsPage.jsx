import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { SkeletonCardList } from '../components/SkeletonCard';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { purchaseOrderService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderDetailsPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { t } = useTranslation();

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    const summary = useMemo(() => {
        if (!order) return null;

        const stockLines = Array.isArray(order.stock_item_models) ? order.stock_item_models : [];
        const consumableLines = Array.isArray(order.consumable_models) ? order.consumable_models : [];
        const allLines = [...stockLines, ...consumableLines];

        let totalOrdered = 0;
        let totalReceived = 0;
        let remainingLineCount = 0;
        for (const l of allLines) {
            const ordered = Number(l?.quantity_ordered ?? 0);
            const received = Number(l?.quantity_received ?? 0);
            totalOrdered += Number.isFinite(ordered) ? ordered : 0;
            totalReceived += Number.isFinite(received) ? received : 0;
            if (ordered > received) remainingLineCount += 1;
        }

        return {
            stockLines,
            consumableLines,
            totalLines: allLines.length,
            totalOrdered,
            totalReceived,
            remainingLineCount,
            hasRemaining: remainingLineCount > 0,
        };
    }, [order]);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);
        } catch (e) {
            setOrder(null);
            setError(e?.response?.data?.error || t('purchaseOrderDetails.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        load();
    }, [isStockConsumableResponsible, orderId]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="dashboard-hero" style={{ marginBottom: 0 }}>
                <div className="dashboard-hero-main">
                    <h1 className="page-title" style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><FileText size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('purchaseOrderDetails.title')}</h1>
                    <p className="page-subtitle">{t('purchaseOrderDetails.subtitle')}</p>
                    {!!order && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
                            <span className="badge badge-info">{t('purchaseOrderDetails.order')} #{order.purchase_order_id}</span>
                            {!!order.purchase_order_code && <span className="badge badge-info">{order.purchase_order_code}</span>}
                            <span className={`badge ${order.is_signed_by_finance ? 'badge-success' : 'badge-warning'}`}>
                                {t('purchaseOrderDetails.signedByFinance')}: {order.is_signed_by_finance ? t('common.yes') : t('common.no')}
                            </span>
                            {!!summary && (
                                <span className={`badge ${summary.hasRemaining ? 'badge-warning' : 'badge-success'}`}>
                                    {t('purchaseOrderDetails.received')}: {summary.totalReceived}/{summary.totalOrdered}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="org-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        <ArrowLeft size={18} />
                        {t('common.back')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
                        <RefreshCw size={18} />
                        {t('common.refresh')}
                    </button>
                    {!!order && !!summary?.hasRemaining && (
                        <button type="button" className="btn btn-primary" onClick={() => navigate(`/dashboard/purchase-orders/${order.purchase_order_id}/receive`)}>
                            {t('purchaseOrderDetails.receiveItems')}
                        </button>
                    )}
                    {!!order && (
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${order.purchase_order_id}/backorder-reports`)}>
                            {t('purchaseOrderDetails.backorderReports')}
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div style={{ padding: 'var(--space-12)' }}>
                    <SkeletonCardList count={1} cardLines={3} />
                </div>
            ) : !order ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.notFound')}</div>
            ) : (
                <>
                    {!!summary && (
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-value">{summary.totalLines}</div>
                                <div className="stat-label">{t('purchaseOrderDetails.header')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{summary.totalOrdered}</div>
                                <div className="stat-label">{t('purchaseOrderDetails.ordered')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{summary.totalReceived}</div>
                                <div className="stat-label">{t('purchaseOrderDetails.received')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{summary.remainingLineCount}</div>
                                <div className="stat-label">{t('purchaseOrderDetails.backorderReports')}</div>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-6)' }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, letterSpacing: '-0.01em' }}>#{order.purchase_order_id}{order.purchase_order_code ? ` · ${order.purchase_order_code}` : ''}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                    {order.supplier_name || (order.supplier_id ? `${t('purchaseOrderDetails.supplier')} #${order.supplier_id}` : '—')}
                                </div>
                            </div>
                            <span className={`badge ${order.is_signed_by_finance ? 'badge-success' : 'badge-warning'}`}>
                                {order.is_signed_by_finance ? t('common.yes') : t('common.no')} · {t('purchaseOrderDetails.signedByFinance')}
                            </span>
                            {!!summary && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {summary.totalReceived}/{summary.totalOrdered}
                                    <span style={{
                                        display: 'inline-block',
                                        width: 60,
                                        height: 6,
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-border)',
                                        overflow: 'hidden',
                                    }}>
                                        <span style={{
                                            display: 'block',
                                            width: `${summary.totalOrdered > 0 ? Math.min(100, Math.round((summary.totalReceived / summary.totalOrdered) * 100)) : 0}%`,
                                            height: '100%',
                                            borderRadius: 'var(--radius-full)',
                                            background: summary.hasRemaining ? 'var(--color-warning)' : 'var(--color-success)',
                                            transition: 'width var(--transition-base)',
                                        }} />
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderDetails.stockItemModelLines')}</h2>
                            {(summary?.stockLines || []).length > 0 && (
                                <span className="badge badge-info">{summary.stockLines.length}</span>
                            )}
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {(summary?.stockLines || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)', textAlign: 'center' }}>{t('common.none')}</div>
                            ) : (
                                (summary?.stockLines || []).map((r) => {
                                    const ordered = Number(r?.quantity_ordered ?? 0);
                                    const received = Number(r?.quantity_received ?? 0);
                                    const pct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
                                    const done = received >= ordered;
                                    return (
                                        <div key={`s-${r.stock_item_model_id}`} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-4)',
                                            padding: 'var(--space-4) var(--space-5)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-card)',
                                            borderLeft: `3px solid ${done ? 'var(--color-success)' : 'var(--color-warning)'}`,
                                            transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.brand_name ? `${r.brand_name} ` : ''}{r.model_name || `#${r.stock_item_model_id}`}{r.type_label ? ` (${r.type_label})` : ''}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: done ? 'var(--color-success)' : 'var(--color-warning)', fontVariantNumeric: 'tabular-nums' }}>
                                                        {received}/{ordered}
                                                    </span>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        flex: 1,
                                                        maxWidth: 120,
                                                        height: 5,
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'var(--color-border)',
                                                        overflow: 'hidden',
                                                    }}>
                                                        <span style={{
                                                            display: 'block',
                                                            width: `${pct}%`,
                                                            height: '100%',
                                                            borderRadius: 'var(--radius-full)',
                                                            background: done ? 'var(--color-success)' : 'var(--color-warning)',
                                                            transition: 'width var(--transition-base)',
                                                        }} />
                                                    </span>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{pct}%</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.unit_price ?? '—'}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('purchaseOrderDetails.unitPrice')}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderDetails.consumableModelLines')}</h2>
                            {(summary?.consumableLines || []).length > 0 && (
                                <span className="badge badge-info">{summary.consumableLines.length}</span>
                            )}
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {(summary?.consumableLines || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)', textAlign: 'center' }}>{t('common.none')}</div>
                            ) : (
                                (summary?.consumableLines || []).map((r) => {
                                    const ordered = Number(r?.quantity_ordered ?? 0);
                                    const received = Number(r?.quantity_received ?? 0);
                                    const pct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
                                    const done = received >= ordered;
                                    return (
                                        <div key={`c-${r.consumable_model_id}`} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-4)',
                                            padding: 'var(--space-4) var(--space-5)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-card)',
                                            borderLeft: `3px solid ${done ? 'var(--color-success)' : 'var(--color-warning)'}`,
                                            transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.brand_name ? `${r.brand_name} ` : ''}{r.model_name || `#${r.consumable_model_id}`}{r.type_label ? ` (${r.type_label})` : ''}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: done ? 'var(--color-success)' : 'var(--color-warning)', fontVariantNumeric: 'tabular-nums' }}>
                                                        {received}/{ordered}
                                                    </span>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        flex: 1,
                                                        maxWidth: 120,
                                                        height: 5,
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'var(--color-border)',
                                                        overflow: 'hidden',
                                                    }}>
                                                        <span style={{
                                                            display: 'block',
                                                            width: `${pct}%`,
                                                            height: '100%',
                                                            borderRadius: 'var(--radius-full)',
                                                            background: done ? 'var(--color-success)' : 'var(--color-warning)',
                                                            transition: 'width var(--transition-base)',
                                                        }} />
                                                    </span>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{pct}%</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.unit_price ?? '—'}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('purchaseOrderDetails.unitPrice')}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrderDetailsPage;
