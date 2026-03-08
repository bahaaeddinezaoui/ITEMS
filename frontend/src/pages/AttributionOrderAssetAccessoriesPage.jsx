import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    assetService,
    stockItemService,
    consumableService,
    attributionOrderAssetStockItemAccessoryService,
    attributionOrderAssetConsumableAccessoryService,
} from '../services/api';

const AttributionOrderAssetAccessoriesPage = () => {
    const navigate = useNavigate();
    const { orderId, assetId } = useParams();

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
            setError('Invalid orderId or assetId');
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
            setError('Failed to load accessories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setError(err?.response?.data?.error || 'Failed to add stock item accessory');
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
            setError(err?.response?.data?.error || 'Failed to add consumable accessory');
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
            setError('Failed to remove stock item accessory');
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
            setError('Failed to remove consumable accessory');
        } finally {
            setSaving(false);
        }
    };

    const isAssetCreated = useMemo(() => {
        return asset?.attribution_order != null;
    }, [asset]);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header Card */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Accessories</h1>
                    <p className="page-subtitle">
                        Order #{orderIdNum} • {asset?.asset_name ? asset.asset_name : `Asset #${assetIdNum}`}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/dashboard/attribution-orders?orderId=${orderIdNum}`)}
                    title="Back"
                    aria-label="Back"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>

            {isAssetCreated && (
                <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '4px solid var(--color-info)', backgroundColor: 'var(--color-bg-alt)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ color: 'var(--color-info)' }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>Asset Created</div>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                This asset is already created. Accessories cannot be modified.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {/* Stock Items Card */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ color: 'var(--color-primary)' }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                        </div>
                        <h2 className="card-title" style={{ margin: 0 }}>Stock Item Accessories</h2>
                        <span className="badge" style={{ marginLeft: 'auto' }}>{stockAccessories.length}</span>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                    {!isAssetCreated && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
                                <label className="form-label">Add stock item</label>
                                <select
                                    className="form-input"
                                    value={selectedStockItemId}
                                    onChange={(e) => setSelectedStockItemId(e.target.value)}
                                >
                                    <option value="">Select stock item...</option>
                                    {stockItems.map((s) => (
                                        <option key={s.stock_item_id} value={s.stock_item_id}>
                                            {(s.stock_item_name || `Stock Item #${s.stock_item_id}`)}
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
                                Add
                            </button>
                        </div>
                    )}

                    {stockAccessories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-light)' }}>
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: 'var(--space-4)' }}>
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                            <p>No stock item accessories linked.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {stockAccessories.map((a) => {
                                const s = stockItemLookup.get(Number(a.stock_item));
                                const label = s?.stock_item_name || `Stock Item #${a.stock_item}`;
                                return (
                                    <div 
                                        key={a.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--space-4) var(--space-6)',
                                            backgroundColor: 'var(--color-bg-alt)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontWeight: 500 }}>
                                            <div style={{ color: 'var(--color-primary)' }}>
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                                </svg>
                                            </div>
                                            {label}
                                        </div>
                                        {!isAssetCreated && (
                                            <button
                                                type="button"
                                                className="logout-btn"
                                                style={{ padding: '6px 12px', width: 'auto', fontSize: 'var(--font-size-sm)' }}
                                                disabled={saving}
                                                onClick={() => removeStockAccessory(a.id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Consumables Card */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ color: 'var(--color-warning)' }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v6m0 0v14m0-14c-2 0-6 1-6 5s4 5 6 5 6-1 6-5-4-5-6-5z"/>
                                <path d="M6 12c0 4 2.5 8 6 10 3.5-2 6-6 6-10" fill="none"/>
                            </svg>
                        </div>
                        <h2 className="card-title" style={{ margin: 0 }}>Consumable Accessories</h2>
                        <span className="badge" style={{ marginLeft: 'auto' }}>{consumableAccessories.length}</span>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                    {!isAssetCreated && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
                                <label className="form-label">Add consumable</label>
                                <select
                                    className="form-input"
                                    value={selectedConsumableId}
                                    onChange={(e) => setSelectedConsumableId(e.target.value)}
                                >
                                    <option value="">Select consumable...</option>
                                    {consumables.map((c) => (
                                        <option key={c.consumable_id} value={c.consumable_id}>
                                            {(c.consumable_name || `Consumable #${c.consumable_id}`)}
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
                                Add
                            </button>
                        </div>
                    )}

                    {consumableAccessories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-light)' }}>
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: 'var(--space-4)' }}>
                                <path d="M12 2v6m0 0v14m0-14c-2 0-6 1-6 5s4 5 6 5 6-1 6-5-4-5-6-5z"/>
                                <path d="M6 12c0 4 2.5 8 6 10 3.5-2 6-6 6-10" fill="none"/>
                            </svg>
                            <p>No consumable accessories linked.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {consumableAccessories.map((a) => {
                                const c = consumableLookup.get(Number(a.consumable));
                                const label = c?.consumable_name || `Consumable #${a.consumable}`;
                                return (
                                    <div 
                                        key={a.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--space-4) var(--space-6)',
                                            backgroundColor: 'var(--color-bg-alt)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontWeight: 500 }}>
                                            <div style={{ color: 'var(--color-warning)' }}>
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2v6m0 0v14m0-14c-2 0-6 1-6 5s4 5 6 5 6-1 6-5-4-5-6-5z"/>
                                                </svg>
                                            </div>
                                            {label}
                                        </div>
                                        {!isAssetCreated && (
                                            <button
                                                type="button"
                                                className="logout-btn"
                                                style={{ padding: '6px 12px', width: 'auto', fontSize: 'var(--font-size-sm)' }}
                                                disabled={saving}
                                                onClick={() => removeConsumableAccessory(a.id)}
                                            >
                                                Remove
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
