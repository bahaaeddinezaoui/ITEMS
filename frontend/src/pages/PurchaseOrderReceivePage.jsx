import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Edit3, Package, RefreshCw, Send } from 'lucide-react';
import { purchaseOrderService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { SkeletonCardList } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import BackButton from '../components/BackButton';

const emptyStockInstance = () => ({ stock_item_name: '', stock_item_serial_number: '', stock_item_inventory_number: '' });
const emptyConsumableInstance = () => ({ consumable_name: '', consumable_serial_number: '', consumable_inventory_number: '', consumable_service_tag: '' });
const syncInstances = (instances, count, emptyFn) => {
    const n = Math.max(0, count);
    if (instances.length === n) return instances;
    if (n > instances.length) return [...instances, ...Array.from({ length: n - instances.length }, emptyFn)];
    return instances.slice(0, n);
};

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
    const [createdItems, setCreatedItems] = useState(null);
    const [modalLine, setModalLine] = useState(null); // { type: 'stock'|'consumable', idx: number }

    const allLinesCount = useMemo(() => (receiveStock.length + receiveConsumable.length), [receiveStock.length, receiveConsumable.length]);

    const load = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        setCreatedItems(null);
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);

            setReceiveStock(
                (data?.stock_item_models || []).map((l) => ({
                    stock_item_model_id: l.stock_item_model_id,
                    model_name: l.model_name,
                    brand_name: l.brand_name,
                    type_label: l.type_label,
                    type_id: l.type_id,
                    quantity_ordered: l.quantity_ordered,
                    quantity_received: l.quantity_received ?? 0,
                    newly_received: '',
                    instances: [],
                }))
            );
            setReceiveConsumable(
                (data?.consumable_models || []).map((l) => ({
                    consumable_model_id: l.consumable_model_id,
                    model_name: l.model_name,
                    brand_name: l.brand_name,
                    type_label: l.type_label,
                    type_id: l.type_id,
                    quantity_ordered: l.quantity_ordered,
                    quantity_received: l.quantity_received ?? 0,
                    newly_received: '',
                    instances: [],
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

    const openModal = (type, idx) => {
        setModalLine({ type, idx });
    };
    const closeModal = () => {
        setModalLine(null);
    };
    const modalLineData = modalLine
        ? (modalLine.type === 'stock' ? receiveStock[modalLine.idx] : receiveConsumable[modalLine.idx])
        : null;

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
                stock_item_models: receiveStock.map((l) => {
                    const qty = l.newly_received === '' ? 0 : Number(l.newly_received);
                    const entry = {
                        stock_item_model_id: Number(l.stock_item_model_id),
                        quantity_received: qty,
                    };
                    if (qty > 0 && l.instances.length === qty) {
                        entry.instances = l.instances.map((inst) => ({
                            stock_item_name: inst.stock_item_name || null,
                            stock_item_serial_number: inst.stock_item_serial_number || null,
                            stock_item_inventory_number: inst.stock_item_inventory_number || null,
                        }));
                    }
                    return entry;
                }),
                consumable_models: receiveConsumable.map((l) => {
                    const qty = l.newly_received === '' ? 0 : Number(l.newly_received);
                    const entry = {
                        consumable_model_id: Number(l.consumable_model_id),
                        quantity_received: qty,
                    };
                    if (qty > 0 && l.instances.length === qty) {
                        entry.instances = l.instances.map((inst) => ({
                            consumable_name: inst.consumable_name || null,
                            consumable_serial_number: inst.consumable_serial_number || null,
                            consumable_inventory_number: inst.consumable_inventory_number || null,
                            consumable_service_tag: inst.consumable_service_tag || null,
                        }));
                    }
                    return entry;
                }),
            };

            const res = await purchaseOrderService.receive(orderId, payload);
            const createdBr = res?.backorder_report_id;

            if (createdBr) {
                setSuccess(t('purchaseOrderReceive.savedWithBackorder', { id: createdBr }));
            } else {
                setSuccess(t('purchaseOrderReceive.saved'));
            }

            setCreatedItems({
                stock_item_ids: res?.created_stock_item_ids || [],
                consumable_ids: res?.created_consumable_ids || [],
                stock_items: res?.created_stock_items || [],
                consumables: res?.created_consumables || [],
            });
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
                    <BackButton onClick={() => navigate(`/dashboard/purchase-orders/${orderId}`)} />
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

            {!!createdItems && (createdItems.stock_items.length > 0 || createdItems.consumables.length > 0) && (
                <div className="card" style={{ borderLeft: '3px solid var(--color-success)' }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                            {t('purchaseOrderReceive.createdInstances')}
                        </h2>
                    </div>
                    <div className="card-body">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-4) 0' }}>
                            {t('purchaseOrderReceive.editInstancesHint')}
                        </p>
                        {createdItems.stock_items.length > 0 && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                    {t('purchaseOrderReceive.createdStockItems')} ({createdItems.stock_items.length})
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                    {createdItems.stock_items.map((item) => (
                                        <span key={`si-${item.id}`} className="badge badge-success" style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/stock-items/instances?typeId=${item.type_id}&modelId=${item.model_id}`)}>
                                            <Package size={12} style={{ marginRight: 4 }} />
                                            #{item.id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {createdItems.consumables.length > 0 && (
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                    {t('purchaseOrderReceive.createdConsumables')} ({createdItems.consumables.length})
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                    {createdItems.consumables.map((item) => (
                                        <span key={`c-${item.id}`} className="badge badge-success" style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/consumables/instances?typeId=${item.type_id}&modelId=${item.model_id}`)}>
                                            #{item.id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                    const newlyQty = Number(l.newly_received === '' ? 0 : l.newly_received);
                                    return (
                                        <div key={`rs-${l.stock_item_model_id}`} style={{
                                            padding: 'var(--space-4) var(--space-5)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-card)',
                                            borderLeft: `3px solid ${done ? 'var(--color-success)' : 'var(--color-warning)'}`,
                                            transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
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
                                                            const newQty = v === '' ? 0 : Number(v);
                                                            setReceiveStock((prev) => prev.map((x, i) => (i === idx ? { ...x, newly_received: v, instances: syncInstances(x.instances, newQty, emptyStockInstance) } : x)));
                                                        }}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                            {newlyQty > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => openModal('stock', idx)}
                                                    className="btn btn-secondary"
                                                    style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-1) var(--space-3)' }}
                                                >
                                                    <Edit3 size={14} />
                                                    {t('purchaseOrderReceive.instanceDetails')} ({newlyQty})
                                                </button>
                                            )}
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
                                    const newlyQty = Number(l.newly_received === '' ? 0 : l.newly_received);
                                    return (
                                        <div key={`rc-${l.consumable_model_id}`} style={{
                                            padding: 'var(--space-4) var(--space-5)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-card)',
                                            borderLeft: `3px solid ${done ? 'var(--color-success)' : 'var(--color-warning)'}`,
                                            transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
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
                                                            const newQty = v === '' ? 0 : Number(v);
                                                            setReceiveConsumable((prev) => prev.map((x, i) => (i === idx ? { ...x, newly_received: v, instances: syncInstances(x.instances, newQty, emptyConsumableInstance) } : x)));
                                                        }}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                            {newlyQty > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => openModal('consumable', idx)}
                                                    className="btn btn-secondary"
                                                    style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-1) var(--space-3)' }}
                                                >
                                                    <Edit3 size={14} />
                                                    {t('purchaseOrderReceive.instanceDetails')} ({newlyQty})
                                                </button>
                                            )}
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

            {!!modalLine && modalLineData && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {t('purchaseOrderReceive.instanceDetails')} — {modalLineData.brand_name ? `${modalLineData.brand_name} ` : ''}{modalLineData.model_name || `#${modalLineData[modalLine.type === 'stock' ? 'stock_item_model_id' : 'consumable_model_id']}`}
                                </h3>
                                <button className="modal-close" onClick={closeModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalLine.type === 'stock' && modalLineData.instances.map((inst, instIdx) => (
                                    <div key={`m-si-${instIdx}`} style={{
                                        display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        background: instIdx % 2 === 0 ? 'var(--color-bg-secondary)' : 'transparent',
                                        fontSize: 'var(--font-size-sm)',
                                    }}>
                                        <span style={{ fontWeight: 700, color: 'var(--color-text-muted)', minWidth: 32 }}>#{instIdx + 1}</span>
                                        <div style={{ flex: 1, display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: 120 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.itemName')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.itemName')}
                                                    value={inst.stock_item_name}
                                                    onChange={(e) => {
                                                        setReceiveStock((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], stock_item_name: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ width: 140 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.serialNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.serialNumber')}
                                                    value={inst.stock_item_serial_number}
                                                    onChange={(e) => {
                                                        setReceiveStock((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], stock_item_serial_number: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ width: 120 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.inventoryNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.inventoryNumber')}
                                                    value={inst.stock_item_inventory_number}
                                                    onChange={(e) => {
                                                        setReceiveStock((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], stock_item_inventory_number: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {modalLine.type === 'consumable' && modalLineData.instances.map((inst, instIdx) => (
                                    <div key={`m-ci-${instIdx}`} style={{
                                        display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        background: instIdx % 2 === 0 ? 'var(--color-bg-secondary)' : 'transparent',
                                        fontSize: 'var(--font-size-sm)',
                                    }}>
                                        <span style={{ fontWeight: 700, color: 'var(--color-text-muted)', minWidth: 32, paddingTop: 'var(--space-5)' }}>#{instIdx + 1}</span>
                                        <div style={{ flex: 1, display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: 120 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.itemName')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.itemName')}
                                                    value={inst.consumable_name}
                                                    onChange={(e) => {
                                                        setReceiveConsumable((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], consumable_name: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ width: 120 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.serialNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.serialNumber')}
                                                    value={inst.consumable_serial_number}
                                                    onChange={(e) => {
                                                        setReceiveConsumable((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], consumable_serial_number: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ width: 100 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.inventoryNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.inventoryNumber')}
                                                    value={inst.consumable_inventory_number}
                                                    onChange={(e) => {
                                                        setReceiveConsumable((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], consumable_inventory_number: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ width: 120 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('purchaseOrderReceive.serviceTag')}</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder={t('purchaseOrderReceive.serviceTag')}
                                                    value={inst.consumable_service_tag}
                                                    onChange={(e) => {
                                                        setReceiveConsumable((prev) => prev.map((x, i) => {
                                                            if (i !== modalLine.idx) return x;
                                                            const newInstances = [...x.instances];
                                                            newInstances[instIdx] = { ...newInstances[instIdx], consumable_service_tag: e.target.value };
                                                            return { ...x, instances: newInstances };
                                                        }));
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={closeModal} className="btn btn-primary">
                                    {t('common.done', 'Done')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default PurchaseOrderReceivePage;
