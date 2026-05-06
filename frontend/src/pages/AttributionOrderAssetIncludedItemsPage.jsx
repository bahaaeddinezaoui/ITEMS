import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SkeletonListRows } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import {
    assetModelService,
    stockItemModelService,
    consumableModelService,
} from '../services/api';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import { Package, Plus, Trash2, Info, Hash, Tag, Box, Droplets, AlertCircle, X } from 'lucide-react';

const DRAFT_ASSETS_KEY = 'attribution_order_create_draft_assets';
const DRAFT_INCLUDED_ITEMS_KEY = 'attribution_order_create_draft_included_items';

const inputStyle = { width: '100%', padding: '6px' };
const selectStyle = { width: '100%', padding: '6px', minWidth: 0 };

const AttributionOrderAssetIncludedItemsPage = () => {
    const navigate = useNavigate();
    const { rowId, itemKind } = useParams();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');

    const view = (itemKind === 'stock' || itemKind === 'consumables') ? itemKind : 'all';

    const [allStockItemModels, setAllStockItemModels] = useState([]);
    const [allConsumableModels, setAllConsumableModels] = useState([]);

    const [defaultStockItems, setDefaultStockItems] = useState([]);
    const [defaultConsumables, setDefaultConsumables] = useState([]);

    const [extraStockItems, setExtraStockItems] = useState([]);
    const [extraConsumables, setExtraConsumables] = useState([]);

    const [showDefaultsModal, setShowDefaultsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Map of stock_item_model_id -> array of default consumables for that model
    const [stockItemModelDefaultConsumables, setStockItemModelDefaultConsumables] = useState({});

    const assetRow = useMemo(() => {
        try {
            const assets = JSON.parse(sessionStorage.getItem(DRAFT_ASSETS_KEY) || '[]');
            return assets.find((a) => String(a.id) === String(rowId)) || null;
        } catch {
            return null;
        }
    }, [rowId]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [sModels, cModels] = await Promise.all([
                    stockItemModelService.getAll(),
                    consumableModelService.getAll(),
                ]);
                setAllStockItemModels(Array.isArray(sModels) ? sModels : (sModels?.results || []));
                setAllConsumableModels(Array.isArray(cModels) ? cModels : (cModels?.results || []));
            } catch (err) {
                setError(t('includedItems.fetchModelsError'));
            } finally {
                setLoading(false);
            }
        };

        const loadDraft = () => {
            try {
                const draft = JSON.parse(sessionStorage.getItem(DRAFT_INCLUDED_ITEMS_KEY) || '{}');
                const rowDraft = draft?.[rowId] || {};
                if (rowDraft.extra_stock_items) {
                    setExtraStockItems(rowDraft.extra_stock_items);
                }
                if (rowDraft.extra_consumables) {
                    setExtraConsumables(rowDraft.extra_consumables);
                }
            } catch {
                // ignore
            }
        };

        const fetchDefaults = async () => {
            if (!assetRow?.asset_model) return;
            try {
                const [defStockData, defConsData] = await Promise.all([
                    assetModelService.getDefaultStockItems(assetRow.asset_model),
                    assetModelService.getDefaultConsumables(assetRow.asset_model),
                ]);
                setDefaultStockItems(Array.isArray(defStockData) ? defStockData : (defStockData?.results || []));
                setDefaultConsumables(Array.isArray(defConsData) ? defConsData : (defConsData?.results || []));
            } catch (err) {
                setError(t('includedItems.loadDefaultsError'));
            }
        };

        fetchData();
        loadDraft();
        fetchDefaults();
    }, [rowId, assetRow?.asset_model]);

    // Fetch default consumables for each stock item model (to show awareness messages)
    useEffect(() => {
        const fetchStockItemModelDefaults = async () => {
            // Collect unique stock item model IDs from defaults and extras
            const modelIds = new Set();
            defaultStockItems.forEach(item => { if (item.stock_item_model) modelIds.add(Number(item.stock_item_model)); });
            extraStockItems.forEach(item => { if (item.stock_item_model) modelIds.add(Number(item.stock_item_model)); });

            if (modelIds.size === 0) return;

            const results = {};
            await Promise.all([...modelIds].map(async (modelId) => {
                try {
                    const data = await stockItemModelService.getDefaultConsumables(modelId);
                    const items = Array.isArray(data) ? data : (data?.results || []);
                    if (items.length > 0) results[modelId] = items;
                } catch { /* ignore */ }
            }));
            setStockItemModelDefaultConsumables(results);
        };
        fetchStockItemModelDefaults();
    }, [defaultStockItems, extraStockItems]);

    const stockItemModelLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(allStockItemModels) ? allStockItemModels : []).forEach((m) => {
            map.set(m.stock_item_model_id, m);
        });
        return map;
    }, [allStockItemModels]);

    const consumableModelLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(allConsumableModels) ? allConsumableModels : []).forEach((m) => {
            map.set(m.consumable_model_id, m);
        });
        return map;
    }, [allConsumableModels]);

    const saveDraft = useCallback((stockItems, consItems) => {
        let draft = {};
        try {
            draft = JSON.parse(sessionStorage.getItem(DRAFT_INCLUDED_ITEMS_KEY) || '{}');
        } catch {
            draft = {};
        }
        draft[rowId] = {
            extra_stock_items: stockItems,
            extra_consumables: consItems,
            stock_items: stockItems.map((item) => ({
                stock_item_model: Number(item.stock_item_model) || null,
                quantity: item.quantity,
                instances: item.instances
            })).filter((item) => item.stock_item_model !== null),
            consumables: consItems.map((item) => ({
                consumable_model: Number(item.consumable_model) || null,
                quantity: item.quantity,
                instances: item.instances
            })).filter((item) => item.consumable_model !== null)
        };
        console.log(`[saveDraft] rowId=${rowId}, stockItems count=${stockItems.length}, consItems count=${consItems.length}`);
        console.log(`[saveDraft] draft[${rowId}]:`, draft[rowId]);
        sessionStorage.setItem(DRAFT_INCLUDED_ITEMS_KEY, JSON.stringify(draft));
        // Verify it was saved
        const verification = JSON.parse(sessionStorage.getItem(DRAFT_INCLUDED_ITEMS_KEY) || '{}');
        console.log(`[saveDraft] Verification - keys in draft:`, Object.keys(verification));
    }, [rowId]);

    const addExtraStockItem = () => {
        const next = [...extraStockItems, {
            stock_item_model: '',
            quantity: 1,
            instances: [{ stock_item_name: '', stock_item_inventory_number: '' }]
        }];
        setExtraStockItems(next);
        saveDraft(next, extraConsumables);
    };

    const removeExtraStockItem = (idx) => {
        const next = extraStockItems.filter((_, i) => i !== idx);
        setExtraStockItems(next);
        saveDraft(next, extraConsumables);
    };

    const updateExtraStockItem = (idx, field, value) => {
        const next = extraStockItems.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [field]: value };
            if (field === 'quantity') {
                const qty = Math.max(1, Number(value) || 1);
                updated.quantity = qty;
                const current = item.instances || [];
                if (current.length < qty) {
                    updated.instances = [...current, ...Array.from({ length: qty - current.length }, () => ({
                        stock_item_name: '', stock_item_inventory_number: ''
                    }))];
                } else {
                    updated.instances = current.slice(0, qty);
                }
            }
            if (field === 'stock_item_model') {
                const qty = item.quantity || 1;
                updated.instances = Array.from({ length: qty }, () => ({
                    stock_item_name: '', stock_item_inventory_number: ''
                }));
            }
            return updated;
        });
        setExtraStockItems(next);
        saveDraft(next, extraConsumables);
    };

    const updateExtraStockItemInstance = (itemIdx, instIdx, field, value) => {
        const next = extraStockItems.map((item, i) => {
            if (i !== itemIdx) return item;
            const instances = [...(item.instances || [])];
            instances[instIdx] = { ...instances[instIdx], [field]: value };
            return { ...item, instances };
        });
        setExtraStockItems(next);
        saveDraft(next, extraConsumables);
    };

    const addExtraConsumable = () => {
        const next = [...extraConsumables, {
            consumable_model: '',
            quantity: 1,
            instances: [{ consumable_name: '', consumable_serial_number: '', consumable_inventory_number: '' }]
        }];
        setExtraConsumables(next);
        saveDraft(extraStockItems, next);
    };

    const removeExtraConsumable = (idx) => {
        const next = extraConsumables.filter((_, i) => i !== idx);
        setExtraConsumables(next);
        saveDraft(extraStockItems, next);
    };

    const updateExtraConsumable = (idx, field, value) => {
        const next = extraConsumables.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [field]: value };
            if (field === 'quantity') {
                const qty = Math.max(1, Number(value) || 1);
                updated.quantity = qty;
                const current = item.instances || [];
                if (current.length < qty) {
                    updated.instances = [...current, ...Array.from({ length: qty - current.length }, () => ({
                        consumable_name: '', consumable_serial_number: '', consumable_inventory_number: ''
                    }))];
                } else {
                    updated.instances = current.slice(0, qty);
                }
            }
            if (field === 'consumable_model') {
                const qty = item.quantity || 1;
                updated.instances = Array.from({ length: qty }, () => ({
                    consumable_name: '', consumable_serial_number: '', consumable_inventory_number: ''
                }));
            }
            return updated;
        });
        setExtraConsumables(next);
        saveDraft(extraStockItems, next);
    };

    const updateExtraConsumableInstance = (itemIdx, instIdx, field, value) => {
        const next = extraConsumables.map((item, i) => {
            if (i !== itemIdx) return item;
            const instances = [...(item.instances || [])];
            instances[instIdx] = { ...instances[instIdx], [field]: value };
            return { ...item, instances };
        });
        setExtraConsumables(next);
        saveDraft(extraStockItems, next);
    };

    const goBack = () => {
        if (context === 'create') {
            navigate('/dashboard/attribution-orders?mode=create');
        } else if (context) {
            // Navigate back to the order detail
            navigate(`/dashboard/attribution-orders?orderId=${context}`);
        } else {
            navigate('/dashboard/attribution-orders');
        }
    };

    const defaultStockItemRows = useMemo(() => {
        const rows = [];
        defaultStockItems.forEach((item) => {
            const modelId = item.stock_item_model;
            const qty = Math.max(1, Number(item.quantity) || 1);
            for (let i = 0; i < qty; i++) {
                rows.push({ modelId, instanceIdx: i });
            }
        });
        return rows;
    }, [defaultStockItems]);

    const defaultConsumableRows = useMemo(() => {
        const rows = [];
        defaultConsumables.forEach((item) => {
            const modelId = item.consumable_model;
            const qty = Math.max(1, Number(item.quantity) || 1);
            for (let i = 0; i < qty; i++) {
                rows.push({ modelId, instanceIdx: i });
            }
        });
        return rows;
    }, [defaultConsumables]);

    const totalDefaultStockItems = defaultStockItemRows.length;
    const totalDefaultConsumables = defaultConsumableRows.length;
    const totalExtraStockItems = extraStockItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalExtraConsumables = extraConsumables.reduce((sum, item) => sum + (item.quantity || 1), 0);

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
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <BackButton onClick={goBack} />
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Package size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('includedItems.title')}</h1>
                        <p className="page-subtitle">
                            {t('includedItems.configureItems')} {assetRow?.asset_name ? `• ${assetRow.asset_name}` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                    marginBottom: 'var(--space-4)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)',
                }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}

            <div className="card" style={{ padding: 'var(--space-4) var(--space-6)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        <Package size={14} style={{ color: '#3b82f6' }} />
                        <span>{t('includedItems.stockItems')}: <strong>{totalDefaultStockItems + totalExtraStockItems}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        <Droplets size={14} style={{ color: '#f59e0b' }} />
                        <span>{t('includedItems.consumables')}: <strong>{totalDefaultConsumables + totalExtraConsumables}</strong></span>
                    </div>
                    <button
                        onClick={() => setShowDefaultsModal(true)}
                        className="btn btn-ghost"
                        style={{ marginLeft: 'auto', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)', width: 'auto' }}
                        title={t('includedItems.viewDefaults')}
                    >
                        <Info size={14} /> {t('includedItems.viewDefaults')}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {(view === 'all' || view === 'stock') && (
                    <>
                        {/* Default Stock Items */}
                        <div className="card" style={{ overflow: 'visible' }}>
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
                                            <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('includedItems.defaultStockItems')}</h2>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.autoCreated')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {defaultStockItemRows.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                        <Package size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                        <p>{t('includedItems.noDefaultStockItems')}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        {defaultStockItems.map((item, idx) => {
                                            const model = stockItemModelLookup.get(Number(item.stock_item_model));
                                            const modelName = model?.model_name || `${t('includedItems.model')} #${item.stock_item_model}`;
                                            const modelCode = model?.model_code || '';
                                            const typeName = model?.stock_item_type_label || '-';
                                            const qty = Math.max(1, Number(item.quantity) || 1);
                                            return (
                                                <div key={`def-stock-${item.stock_item_model}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div
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
                                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.type')}</div>
                                                            <div>{typeName}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.model')}</div>
                                                            <div style={{ fontWeight: '500' }}>{modelName}</div>
                                                            {modelCode && <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{modelCode}</div>}
                                                        </div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.quantity')}</div>
                                                            <div style={{ fontWeight: '600' }}>{qty}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {stockItemModelDefaultConsumables[Number(item.stock_item_model)] && (
                                                    <div style={{
                                                        marginTop: 'var(--space-2)', marginLeft: '36px',
                                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
                                                        background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)',
                                                        borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                                                    }}>
                                                        <Droplets size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                                        <span>
                                                            {t('includedItems.stockModelHasDefaultConsumables', {
                                                                count: stockItemModelDefaultConsumables[Number(item.stock_item_model)].length,
                                                                names: stockItemModelDefaultConsumables[Number(item.stock_item_model)]
                                                                    .map(dc => `${consumableModelLookup.get(Number(dc.consumable_model))?.model_name || dc.consumable_model_name || '?'} (×${dc.quantity || 1})`)
                                                                    .join(', ')
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Extra Stock Items */}
                        <div className="card" style={{ overflow: 'visible' }}>
                            <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Plus size={16} style={{ color: 'var(--color-success)' }} />
                                        </div>
                                        <div>
                                            <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('includedItems.extraStockItems')}</h2>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{extraStockItems.length} group(s)</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addExtraStockItem}
                                        className="btn btn-secondary"
                                        style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)', width: 'auto' }}
                                    >
                                        <Plus size={14} /> {t('includedItems.addStockItem')}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {extraStockItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                        <Package size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                        <p>{t('includedItems.noExtraStockItems')}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        {extraStockItems.map((item, itemIdx) => (
                                            <div
                                                key={`extra-stock-group-${itemIdx}`}
                                                style={{
                                                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                                    <div style={{
                                                        width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                                        background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: 'var(--color-success)',
                                                    }}>
                                                        {itemIdx + 1}
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                                            <Tag size={11} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('includedItems.model')}
                                                        </label>
                                                        <select
                                                            className="form-input"
                                                            value={item.stock_item_model || ''}
                                                            onChange={(e) => updateExtraStockItem(itemIdx, 'stock_item_model', e.target.value)}
                                                        >
                                                            <option value="">{t('includedItems.selectModel')}</option>
                                                            {allStockItemModels.map((m) => (
                                                                <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                                                    {m.model_name} {m.model_code ? `(${m.model_code})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0, width: '80px' }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                                            <Hash size={11} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('includedItems.quantity')}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-input"
                                                            value={item.quantity || 1}
                                                            onChange={(e) => updateExtraStockItem(itemIdx, 'quantity', e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExtraStockItem(itemIdx)}
                                                        className="btn btn-danger"
                                                        title={t('includedItems.remove')}
                                                        style={{ padding: 'var(--space-2)', width: 'auto', minHeight: '36px', alignSelf: 'flex-end' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {(item.instances || []).length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: 'var(--space-8)' }}>
                                                        {(item.instances || []).map((inst, instIdx) => (
                                                            <div
                                                                key={`inst-stock-${itemIdx}-${instIdx}`}
                                                                style={{
                                                                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)',
                                                                    padding: 'var(--space-2) var(--space-3)',
                                                                    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
                                                                    border: '1px solid var(--color-border)',
                                                                }}
                                                            >
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('includedItems.name')} #{instIdx + 1}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        value={inst.stock_item_name || ''}
                                                                        onChange={(e) => updateExtraStockItemInstance(itemIdx, instIdx, 'stock_item_name', e.target.value)}
                                                                        placeholder={t('includedItems.enterName')}
                                                                        maxLength={48}
                                                                    />
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('includedItems.inventoryNumber')}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        value={inst.stock_item_inventory_number || ''}
                                                                        onChange={(e) => updateExtraStockItemInstance(itemIdx, instIdx, 'stock_item_inventory_number', e.target.value)}
                                                                        placeholder={t('includedItems.enterInventoryNumber')}
                                                                        maxLength={6}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {stockItemModelDefaultConsumables[Number(item.stock_item_model)] && (
                                                    <div style={{
                                                        marginTop: 'var(--space-2)', marginLeft: '36px',
                                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
                                                        background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)',
                                                        borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                                                    }}>
                                                        <Droplets size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                                        <span>
                                                            {t('includedItems.stockModelHasDefaultConsumables', {
                                                                count: stockItemModelDefaultConsumables[Number(item.stock_item_model)].length,
                                                                names: stockItemModelDefaultConsumables[Number(item.stock_item_model)]
                                                                    .map(dc => `${consumableModelLookup.get(Number(dc.consumable_model))?.model_name || dc.consumable_model_name || '?'} (×${dc.quantity || 1})`)
                                                                    .join(', ')
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {(view === 'all' || view === 'consumables') && (
                    <>
                        {/* Default Consumables */}
                        <div className="card" style={{ overflow: 'visible' }}>
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
                                        <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('includedItems.defaultConsumables')}</h2>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.autoCreated')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {defaultConsumableRows.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                        <Droplets size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                        <p>{t('includedItems.noDefaultConsumables')}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        {defaultConsumables.map((item, idx) => {
                                            const model = consumableModelLookup.get(Number(item.consumable_model));
                                            const modelName = model?.model_name || `${t('includedItems.model')} #${item.consumable_model}`;
                                            const modelCode = model?.model_code || '';
                                            const typeName = model?.consumable_type_label || '-';
                                            const qty = Math.max(1, Number(item.quantity) || 1);
                                            return (
                                                <div
                                                    key={`def-cons-${item.consumable_model}`}
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
                                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.type')}</div>
                                                            <div>{typeName}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.model')}</div>
                                                            <div style={{ fontWeight: '500' }}>{modelName}</div>
                                                            {modelCode && <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{modelCode}</div>}
                                                        </div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('includedItems.quantity')}</div>
                                                            <div style={{ fontWeight: '600' }}>{qty}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Extra Consumables */}
                        <div className="card" style={{ overflow: 'visible' }}>
                            <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Plus size={16} style={{ color: 'var(--color-success)' }} />
                                        </div>
                                        <div>
                                            <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('includedItems.extraConsumables')}</h2>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{extraConsumables.length} group(s)</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addExtraConsumable}
                                        className="btn btn-secondary"
                                        style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)', width: 'auto' }}
                                    >
                                        <Plus size={14} /> {t('includedItems.addConsumable')}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {extraConsumables.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                        <Droplets size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                        <p>{t('includedItems.noExtraConsumables')}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        {extraConsumables.map((item, itemIdx) => (
                                            <div
                                                key={`extra-cons-group-${itemIdx}`}
                                                style={{
                                                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                                    <div style={{
                                                        width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                                        background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: 'var(--color-success)',
                                                    }}>
                                                        {itemIdx + 1}
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                                            <Tag size={11} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('includedItems.model')}
                                                        </label>
                                                        <select
                                                            className="form-input"
                                                            value={item.consumable_model || ''}
                                                            onChange={(e) => updateExtraConsumable(itemIdx, 'consumable_model', e.target.value)}
                                                        >
                                                            <option value="">{t('includedItems.selectModel')}</option>
                                                            {allConsumableModels.map((m) => (
                                                                <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                                                    {m.model_name} {m.model_code ? `(${m.model_code})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0, width: '80px' }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                                            <Hash size={11} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('includedItems.quantity')}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-input"
                                                            value={item.quantity || 1}
                                                            onChange={(e) => updateExtraConsumable(itemIdx, 'quantity', e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExtraConsumable(itemIdx)}
                                                        className="btn btn-danger"
                                                        title={t('includedItems.remove')}
                                                        style={{ padding: 'var(--space-2)', width: 'auto', minHeight: '36px', alignSelf: 'flex-end' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {(item.instances || []).length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: 'var(--space-8)' }}>
                                                        {(item.instances || []).map((inst, instIdx) => (
                                                            <div
                                                                key={`inst-cons-${itemIdx}-${instIdx}`}
                                                                style={{
                                                                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)',
                                                                    padding: 'var(--space-2) var(--space-3)',
                                                                    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
                                                                    border: '1px solid var(--color-border)',
                                                                }}
                                                            >
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('includedItems.name')} #{instIdx + 1}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        value={inst.consumable_name || ''}
                                                                        onChange={(e) => updateExtraConsumableInstance(itemIdx, instIdx, 'consumable_name', e.target.value)}
                                                                        placeholder={t('includedItems.enterName')}
                                                                        maxLength={48}
                                                                    />
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('includedItems.serialNumber')}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        value={inst.consumable_serial_number || ''}
                                                                        onChange={(e) => updateExtraConsumableInstance(itemIdx, instIdx, 'consumable_serial_number', e.target.value)}
                                                                        placeholder={t('includedItems.enterSerialNumber')}
                                                                        maxLength={48}
                                                                    />
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('includedItems.inventoryNumber')}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        value={inst.consumable_inventory_number || ''}
                                                                        onChange={(e) => updateExtraConsumableInstance(itemIdx, instIdx, 'consumable_inventory_number', e.target.value)}
                                                                        placeholder={t('includedItems.enterInventoryNumber')}
                                                                        maxLength={6}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showDefaultsModal && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowDefaultsModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Info size={18} /> {t('includedItems.defaultsModalTitle')}</h3>
                                <button className="modal-close" onClick={() => setShowDefaultsModal(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                                    {t('includedItems.defaultsModalDescription')}
                                </p>

                                <h4 style={{ marginBottom: 'var(--space-2)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Package size={14} style={{ color: '#3b82f6' }} /> {t('includedItems.defaultStockItems')}</h4>
                                {defaultStockItems.length === 0 ? (
                                    <div style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                                        {t('includedItems.noDefaultStockItems')}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                        {defaultStockItems.map((item, idx) => {
                                            const model = stockItemModelLookup.get(Number(item.stock_item_model));
                                            const modelName = model?.model_name || `${t('includedItems.model')} #${item.stock_item_model}`;
                                            const modelCode = model?.model_code || '';
                                            const typeName = model?.stock_item_type_label || '-';
                                            const qty = Math.max(1, Number(item.quantity) || 1);
                                            return (
                                                <div
                                                    key={`modal-stock-${item.stock_item_model}`}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-border)',
                                                    }}
                                                >
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', width: 20 }}>{idx + 1}</span>
                                                    <span style={{ flex: 1 }}>{typeName}</span>
                                                    <span style={{ flex: 1.5, fontWeight: '500' }}>{modelName} {modelCode && <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{modelCode}</span>}</span>
                                                    <span style={{ fontWeight: '600' }}>×{qty}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <h4 style={{ marginBottom: 'var(--space-2)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Droplets size={14} style={{ color: '#f59e0b' }} /> {t('includedItems.defaultConsumables')}</h4>
                                {defaultConsumables.length === 0 ? (
                                    <div style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                        {t('includedItems.noDefaultConsumables')}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {defaultConsumables.map((item, idx) => {
                                            const model = consumableModelLookup.get(Number(item.consumable_model));
                                            const modelName = model?.model_name || `${t('includedItems.model')} #${item.consumable_model}`;
                                            const modelCode = model?.model_code || '';
                                            const typeName = model?.consumable_type_label || '-';
                                            const qty = Math.max(1, Number(item.quantity) || 1);
                                            return (
                                                <div
                                                    key={`modal-cons-${item.consumable_model}`}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-border)',
                                                    }}
                                                >
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', width: 20 }}>{idx + 1}</span>
                                                    <span style={{ flex: 1 }}>{typeName}</span>
                                                    <span style={{ flex: 1.5, fontWeight: '500' }}>{modelName} {modelCode && <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{modelCode}</span>}</span>
                                                    <span style={{ fontWeight: '600' }}>×{qty}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowDefaultsModal(false)}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--space-3) var(--space-6)', width: 'auto' }}
                                >
                                    {t('common.ok')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default AttributionOrderAssetIncludedItemsPage;
