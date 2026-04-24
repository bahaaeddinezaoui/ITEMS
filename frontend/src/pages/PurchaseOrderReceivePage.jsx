import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, RefreshCw, Send } from 'lucide-react';
import { purchaseOrderService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderReceivePage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { t } = useTranslation();

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [order, setOrder] = useState(null);
    const [receiveStock, setReceiveStock] = useState([]);
    const [receiveConsumable, setReceiveConsumable] = useState([]);

    const allLinesCount = useMemo(() => (receiveStock.length + receiveConsumable.length), [receiveStock.length, receiveConsumable.length]);

    const load = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);

            setReceiveStock(
                (data?.stock_item_models || []).map((l) => ({
                    stock_item_model_id: l.stock_item_model_id,
                    model_name: l.model_name,
                    quantity_ordered: l.quantity_ordered,
                    quantity_received: l.quantity_received ?? 0,
                    newly_received: '',
                }))
            );
            setReceiveConsumable(
                (data?.consumable_models || []).map((l) => ({
                    consumable_model_id: l.consumable_model_id,
                    model_name: l.model_name,
                    quantity_ordered: l.quantity_ordered,
                    quantity_received: l.quantity_received ?? 0,
                    newly_received: '',
                }))
            );
        } catch (e) {
            setOrder(null);
            setError(e?.response?.data?.error || t('purchaseOrderReceive.loadError'));
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

    const submit = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const willHaveRemaining = [...receiveStock, ...receiveConsumable].some((l) => {
                const ordered = Number(l.quantity_ordered ?? 0);
                const alreadyReceived = Number(l.quantity_received ?? 0);
                const newly = Number(l.newly_received === '' ? 0 : l.newly_received);
                return (alreadyReceived + newly) < ordered;
            });

            if (willHaveRemaining) {
                const ok = window.confirm(
                    t('purchaseOrderReceive.confirmPartial')
                );
                if (!ok) {
                    setSubmitting(false);
                    return;
                }
            }

            const payload = {
                stock_item_models: receiveStock.map((l) => ({
                    stock_item_model_id: Number(l.stock_item_model_id),
                    quantity_received: l.newly_received === '' ? 0 : Number(l.newly_received),
                })),
                consumable_models: receiveConsumable.map((l) => ({
                    consumable_model_id: Number(l.consumable_model_id),
                    quantity_received: l.newly_received === '' ? 0 : Number(l.newly_received),
                })),
            };

            const res = await purchaseOrderService.receive(orderId, payload);
            const createdBr = res?.backorder_report_id;

            if (createdBr) {
                setSuccess(t('purchaseOrderReceive.savedWithBackorder', { id: createdBr }));
            } else {
                setSuccess(t('purchaseOrderReceive.saved'));
            }

            navigate(`/dashboard/purchase-orders/${orderId}/backorder-reports`);
        } catch (e) {
            setError(e?.response?.data?.error || t('purchaseOrderReceive.submitError'));
        } finally {
            setSubmitting(false);
        }
    };

    const summary = useMemo(() => {
        if (!order) return null;
        const stockLines = Array.isArray(receiveStock) ? receiveStock : [];
        const consumableLines = Array.isArray(receiveConsumable) ? receiveConsumable : [];
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
    }, [order, receiveStock, receiveConsumable]);

    return (
        <div className="page-container">
            <div className="dashboard-hero" style={{ marginBottom: 0 }}>
                <div className="dashboard-hero-main">
                    <h1 className="page-title" style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Package size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('purchaseOrderReceive.title')}</h1>
                    <p className="page-subtitle">{t('purchaseOrderReceive.subtitle')}</p>
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
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${orderId}`)} disabled={submitting}>
                        <ArrowLeft size={18} />
                        {t('common.back')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={load} disabled={loading || submitting}>
                        <RefreshCw size={18} />
                        {t('common.refresh')}
                    </button>
                    {!!order && (
                        <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                            <Send size={18} />
                            {submitting ? t('purchaseOrderReceive.submitting') : t('purchaseOrderReceive.submit')}
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                    <span className="loading-spinner" aria-hidden="true" />
                    <span>{t('common.loading')}</span>
                </div>
            ) : !order ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.notFound')}</div>
            ) : (
                <>
                    {!!summary && (
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-value">{summary.totalLines}</div>
                                <div className="stat-label">{t('purchaseOrderReceive.lines')}</div>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderReceive.stockItemModels')}</h2>
                            {(receiveStock || []).length > 0 && (
                                <span className="badge badge-info">{receiveStock.length}</span>
                            )}
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {(receiveStock || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)', textAlign: 'center' }}>{t('common.none')}</div>
                            ) : (
                                receiveStock.map((l, idx) => {
                                    const ordered = Number(l?.quantity_ordered ?? 0);
                                    const received = Number(l?.quantity_received ?? 0);
                                    const pct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
                                    const done = received >= ordered;
                                    return (
                                        <div key={`rs-${l.stock_item_model_id}`} style={{
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
                                                <div style={{ fontWeight: 600, marginBottom: 2 }}>{l.brand_name ? `${l.brand_name} ` : ''}{l.model_name || `#${l.stock_item_model_id}`}{l.type_label ? ` (${l.type_label})` : ''}</div>
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
                                            <div style={{ flexShrink: 0, width: 140 }}>
                                                <input
                                                    className="form-input"
                                                    type="number"
                                                    min="0"
                                                    max={ordered - received}
                                                    placeholder={`0 – ${ordered - received}`}
                                                    value={l.newly_received}
                                                    onChange={(e) => {
                                                        let v = e.target.value;
                                                        if (v !== '') {
                                                            const num = Number(v);
                                                            const remaining = ordered - received;
                                                            if (num > remaining) v = String(remaining);
                                                            if (num < 0) v = '0';
                                                        }
                                                        setReceiveStock((prev) => prev.map((x, i) => (i === idx ? { ...x, newly_received: v } : x)));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderReceive.consumableModels')}</h2>
                            {(receiveConsumable || []).length > 0 && (
                                <span className="badge badge-info">{receiveConsumable.length}</span>
                            )}
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {(receiveConsumable || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)', textAlign: 'center' }}>{t('common.none')}</div>
                            ) : (
                                receiveConsumable.map((l, idx) => {
                                    const ordered = Number(l?.quantity_ordered ?? 0);
                                    const received = Number(l?.quantity_received ?? 0);
                                    const pct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
                                    const done = received >= ordered;
                                    return (
                                        <div key={`rc-${l.consumable_model_id}`} style={{
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
                                                <div style={{ fontWeight: 600, marginBottom: 2 }}>{l.brand_name ? `${l.brand_name} ` : ''}{l.model_name || `#${l.consumable_model_id}`}{l.type_label ? ` (${l.type_label})` : ''}</div>
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
                                            <div style={{ flexShrink: 0, width: 140 }}>
                                                <input
                                                    className="form-input"
                                                    type="number"
                                                    min="0"
                                                    max={ordered - received}
                                                    placeholder={`0 – ${ordered - received}`}
                                                    value={l.newly_received}
                                                    onChange={(e) => {
                                                        let v = e.target.value;
                                                        if (v !== '') {
                                                            const num = Number(v);
                                                            const remaining = ordered - received;
                                                            if (num > remaining) v = String(remaining);
                                                            if (num < 0) v = '0';
                                                        }
                                                        setReceiveConsumable((prev) => prev.map((x, i) => (i === idx ? { ...x, newly_received: v } : x)));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{allLinesCount} {t('purchaseOrderReceive.lines')}</span>
                        <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting} style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                            <Send size={16} />
                            {submitting ? t('purchaseOrderReceive.submitting') : t('purchaseOrderReceive.submit')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrderReceivePage;
