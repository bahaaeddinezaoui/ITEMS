import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SkeletonListRows } from '../components/SkeletonCard';
import {
    assetService,
    stockItemService,
    consumableService,
    attributionOrderAssetStockItemAccessoryService,
    attributionOrderAssetConsumableAccessoryService,
} from '../services/api';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import { Wrench, Package, Droplets, Info, AlertCircle, Trash2, Plus } from 'lucide-react';

const AttributionOrderAssetAccessoriesPage = () => {
    const navigate = useNavigate();
    const { orderId, assetId } = useParams();
    const { t } = useTranslation();

    const orderIdNum = useMemo(() => Number(orderId), [orderId]);
    const assetIdNum = useMemo(() => Number(assetId), [assetId]);

    const [asset, setAsset] = useState(null);

    const [stockAccessories, setStockAccessories] = useState([]);
    const [consumableAccessories, setConsumableAccessories] = useState([]);

    const [stockItems, setStockItems] = useState([]);
    const [consumables, setConsumables] = useState([]);

    const [selectedStockItemId, setSelectedStockItemId] = useState('');
    const [selectedConsumableId, setSelectedConsumableId] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadAll = async () => {
        if (!Number.isFinite(orderIdNum) || !Number.isFinite(assetIdNum)) {
            setError(t('assetAccessories.invalidIds'));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [assetData, stockAccData, consAccData, stockItemsData, consumablesData] = await Promise.all([
                assetService.getById(assetIdNum),
                attributionOrderAssetStockItemAccessoryService.getAll({ attribution_order: orderIdNum, asset: assetIdNum }),
                attributionOrderAssetConsumableAccessoryService.getAll({ attribution_order: orderIdNum, asset: assetIdNum }),
                stockItemService.getAll(),
                consumableService.getAll(),
            ]);

            setAsset(assetData || null);
            setStockAccessories(Array.isArray(stockAccData) ? stockAccData : (stockAccData?.results || []));
            setConsumableAccessories(Array.isArray(consAccData) ? consAccData : (consAccData?.results || []));
            setStockItems(Array.isArray(stockItemsData) ? stockItemsData : (stockItemsData?.results || []));
            setConsumables(Array.isArray(consumablesData) ? consumablesData : (consumablesData?.results || []));
        } catch (err) {
            setError(t('assetAccessories.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, [orderIdNum, assetIdNum]);

    const stockItemLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(stockItems) ? stockItems : []).forEach((s) => {
            map.set(Number(s.stock_item_id), s);
        });
        return map;
    }, [stockItems]);

    const consumableLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(consumables) ? consumables : []).forEach((c) => {
            map.set(Number(c.consumable_id), c);
        });
        return map;
    }, [consumables]);

    const addStockAccessory = async () => {
        const stockItemIdNum = Number(selectedStockItemId);
        if (!Number.isFinite(orderIdNum) || !Number.isFinite(assetIdNum) || !Number.isFinite(stockItemIdNum)) return;

        setSaving(true);
        setError(null);
        try {
            await attributionOrderAssetStockItemAccessoryService.create({
                attribution_order: orderIdNum,
                asset: assetIdNum,
                stock_item: stockItemIdNum,
            });
            setSelectedStockItemId('');
            await loadAll();
        } catch (err) {
            setError(err?.response?.data?.error || t('assetAccessories.addStockError'));
        } finally {
            setSaving(false);
        }
    };

    const addConsumableAccessory = async () => {
        const consumableIdNum = Number(selectedConsumableId);
        if (!Number.isFinite(orderIdNum) || !Number.isFinite(assetIdNum) || !Number.isFinite(consumableIdNum)) return;

        setSaving(true);
        setError(null);
        try {
            await attributionOrderAssetConsumableAccessoryService.create({
                attribution_order: orderIdNum,
                asset: assetIdNum,
                consumable: consumableIdNum,
            });
            setSelectedConsumableId('');
            await loadAll();
        } catch (err) {
            setError(err?.response?.data?.error || t('assetAccessories.addConsumableError'));
        } finally {
            setSaving(false);
        }
    };

    const removeStockAccessory = async (id) => {
        setSaving(true);
        setError(null);
        try {
            await attributionOrderAssetStockItemAccessoryService.delete(id);
            await loadAll();
        } catch (err) {
            setError(t('assetAccessories.removeStockError'));
        } finally {
            setSaving(false);
        }
    };

    const removeConsumableAccessory = async (id) => {
        setSaving(true);
        setError(null);
        try {
            await attributionOrderAssetConsumableAccessoryService.delete(id);
            await loadAll();
        } catch (err) {
            setError(t('assetAccessories.removeConsumableError'));
        } finally {
            setSaving(false);
        }
    };

    const isAssetCreated = useMemo(() => {
        return asset?.attribution_order != null;
    }, [asset]);

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    <SkeletonListRows count={6} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <BackButton onClick={() => navigate(`/dashboard/attribution-orders?orderId=${orderIdNum}`)} />
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Wrench size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assetAccessories.title')}</h1>
                        <p className="page-subtitle">
                            {t('assetAccessories.order')} #{orderIdNum} • {asset?.asset_name ? asset.asset_name : `${t('assetAccessories.asset')} #${assetIdNum}`}
                        </p>
                    </div>
                </div>
            </div>

            {isAssetCreated && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                    color: 'var(--color-info)', fontSize: 'var(--font-size-sm)',
                }}>
                    <Info size={18} style={{ flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{t('assetAccessories.assetCreated')}</div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('assetAccessories.assetCreatedMessage')}</div>
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                    color: 'var(--color-error)', fontSize: 'var(--font-size-sm)',
                }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}

            {/* Stock Item Accessories Card */}
            <div className="card">
                <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Package size={16} style={{ color: '#3b82f6' }} />
                            </div>
                            <div>
                                <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('assetAccessories.stockItemAccessories')}</h2>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stockAccessories.length} item(s)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    {!isAssetCreated && (
                        <div style={{
                            display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap',
                            marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-5)',
                            borderBottom: '1px solid var(--color-border)',
                        }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 260, marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                    <Plus size={11} style={{ color: 'var(--color-text-muted)' }} />
                                    {t('assetAccessories.addStockItem')}
                                </label>
                                <select
                                    className="form-input"
                                    value={selectedStockItemId}
                                    onChange={(e) => setSelectedStockItemId(e.target.value)}
                                >
                                    <option value="">{t('assetAccessories.selectStockItem')}</option>
                                    {stockItems.map((s) => (
                                        <option key={s.stock_item_id} value={s.stock_item_id}>
                                            {(s.stock_item_name || `${t('assetAccessories.stockItem')} #${s.stock_item_id}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={addStockAccessory}
                                disabled={saving || !selectedStockItemId}
                                style={{ width: 'auto', padding: 'var(--space-3) var(--space-6)' }}
                            >
                                {t('common.add')}
                            </button>
                        </div>
                    )}

                    {stockAccessories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            <Package size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                            <p>{t('assetAccessories.noStockItemAccessoriesLinked')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {stockAccessories.map((a, idx) => {
                                const s = stockItemLookup.get(Number(a.stock_item));
                                const label = s?.stock_item_name || `${t('assetAccessories.stockItem')} #${a.stock_item}`;
                                return (
                                    <div
                                        key={a.id}
                                        style={{
                                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                        }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                            background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: '#3b82f6',
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1, fontWeight: '500' }}>{label}</div>
                                        {!isAssetCreated && (
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                disabled={saving}
                                                onClick={() => removeStockAccessory(a.id)}
                                                style={{ padding: 'var(--space-2) var(--space-3)', width: 'auto', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)' }}
                                            >
                                                <Trash2 size={14} /> {t('common.remove')}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Consumable Accessories Card */}
            <div className="card">
                <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-md)',
                            background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Droplets size={16} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('assetAccessories.consumableAccessories')}</h2>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{consumableAccessories.length} item(s)</span>
                        </div>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    {!isAssetCreated && (
                        <div style={{
                            display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap',
                            marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-5)',
                            borderBottom: '1px solid var(--color-border)',
                        }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 260, marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                    <Plus size={11} style={{ color: 'var(--color-text-muted)' }} />
                                    {t('assetAccessories.addConsumable')}
                                </label>
                                <select
                                    className="form-input"
                                    value={selectedConsumableId}
                                    onChange={(e) => setSelectedConsumableId(e.target.value)}
                                >
                                    <option value="">{t('assetAccessories.selectConsumable')}</option>
                                    {consumables.map((c) => (
                                        <option key={c.consumable_id} value={c.consumable_id}>
                                            {(c.consumable_name || `${t('assetAccessories.consumable')} #${c.consumable_id}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={addConsumableAccessory}
                                disabled={saving || !selectedConsumableId}
                                style={{ width: 'auto', padding: 'var(--space-3) var(--space-6)' }}
                            >
                                {t('common.add')}
                            </button>
                        </div>
                    )}

                    {consumableAccessories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            <Droplets size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                            <p>{t('assetAccessories.noConsumableAccessoriesLinked')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {consumableAccessories.map((a, idx) => {
                                const c = consumableLookup.get(Number(a.consumable));
                                const label = c?.consumable_name || `${t('assetAccessories.consumable')} #${a.consumable}`;
                                return (
                                    <div
                                        key={a.id}
                                        style={{
                                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                        }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                            background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: '#f59e0b',
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1, fontWeight: '500' }}>{label}</div>
                                        {!isAssetCreated && (
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                disabled={saving}
                                                onClick={() => removeConsumableAccessory(a.id)}
                                                style={{ padding: 'var(--space-2) var(--space-3)', width: 'auto', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)' }}
                                            >
                                                <Trash2 size={14} /> {t('common.remove')}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttributionOrderAssetAccessoriesPage;
