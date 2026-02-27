import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    assetModelService,
    stockItemModelService,
    consumableModelService,
} from '../services/api';

const DRAFT_ASSETS_KEY = 'attribution_order_create_draft_assets';
const DRAFT_INCLUDED_ITEMS_KEY = 'attribution_order_create_draft_included_items';

const AttributionOrderAssetIncludedItemsPage = () => {
    const navigate = useNavigate();
    const { rowId, itemKind } = useParams();
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');

    const view = (itemKind === 'stock' || itemKind === 'consumables') ? itemKind : 'all';

    const [allStockItemModels, setAllStockItemModels] = useState([]);
    const [allConsumableModels, setAllConsumableModels] = useState([]);

    const [defaultStockItems, setDefaultStockItems] = useState([]);
    const [defaultConsumables, setDefaultConsumables] = useState([]);

    const [stockItemInstances, setStockItemInstances] = useState({});
    const [consumableInstances, setConsumableInstances] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                setError('Failed to fetch models');
            } finally {
                setLoading(false);
            }
        };

        const loadDraft = () => {
            try {
                const draft = JSON.parse(sessionStorage.getItem(DRAFT_INCLUDED_ITEMS_KEY) || '{}');
                const rowDraft = draft?.[rowId] || {};
                if (rowDraft.stock_item_instances) {
                    setStockItemInstances(rowDraft.stock_item_instances);
                }
                if (rowDraft.consumable_instances) {
                    setConsumableInstances(rowDraft.consumable_instances);
                }
                return { hasDraft: !!rowDraft.stock_item_instances || !!rowDraft.consumable_instances };
            } catch {
                return { hasDraft: false };
            }
        };

        const prefillFromModelDefaults = async () => {
            if (!assetRow?.asset_model) return;
            setLoading(true);
            setError(null);
            try {
                const [defStockData, defConsData] = await Promise.all([
                    assetModelService.getDefaultStockItems(assetRow.asset_model),
                    assetModelService.getDefaultConsumables(assetRow.asset_model),
                ]);

                const defStock = Array.isArray(defStockData) ? defStockData : (defStockData?.results || []);
                const defCons = Array.isArray(defConsData) ? defConsData : (defConsData?.results || []);

                setDefaultStockItems(defStock);
                setDefaultConsumables(defCons);

                // Initialize instances for each stock item model based on quantity
                const stockInst = {};
                defStock.forEach((item) => {
                    const qty = Math.max(1, Number(item.quantity) || 1);
                    stockInst[item.stock_item_model] = Array.from({ length: qty }, () => ({
                        stock_item_name: '',
                        stock_item_inventory_number: ''
                    }));
                });
                setStockItemInstances(stockInst);

                // Initialize instances for each consumable model based on quantity
                const consInst = {};
                defCons.forEach((item) => {
                    const qty = Math.max(1, Number(item.quantity) || 1);
                    consInst[item.consumable_model] = Array.from({ length: qty }, () => ({
                        consumable_name: '',
                        consumable_serial_number: '',
                        consumable_inventory_number: ''
                    }));
                });
                setConsumableInstances(consInst);

                saveDraft(stockInst, consInst);
            } catch (err) {
                setError('Failed to load default composition');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const { hasDraft } = loadDraft();
        if (!hasDraft) {
            prefillFromModelDefaults();
        } else {
            // Still need to fetch defaults to know what items to show
            if (assetRow?.asset_model) {
                (async () => {
                    try {
                        const [defStockData, defConsData] = await Promise.all([
                            assetModelService.getDefaultStockItems(assetRow.asset_model),
                            assetModelService.getDefaultConsumables(assetRow.asset_model),
                        ]);
                        setDefaultStockItems(Array.isArray(defStockData) ? defStockData : (defStockData?.results || []));
                        setDefaultConsumables(Array.isArray(defConsData) ? defConsData : (defConsData?.results || []));
                    } catch (err) {
                        // ignore
                    }
                })();
            }
        }
    }, [rowId, assetRow?.asset_model]);

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

    const saveDraft = (stockInst, consInst) => {
        let draft = {};
        try {
            draft = JSON.parse(sessionStorage.getItem(DRAFT_INCLUDED_ITEMS_KEY) || '{}');
        } catch {
            draft = {};
        }
        draft[rowId] = {
            stock_item_instances: stockInst,
            consumable_instances: consInst,
            // Also save in the format expected by the backend when creating assets
            stock_items: Object.entries(stockInst).map(([modelId, instances]) => ({
                stock_item_model: Number(modelId),
                quantity: instances.length,
                instances: instances
            })),
            consumables: Object.entries(consInst).map(([modelId, instances]) => ({
                consumable_model: Number(modelId),
                quantity: instances.length,
                instances: instances
            }))
        };
        sessionStorage.setItem(DRAFT_INCLUDED_ITEMS_KEY, JSON.stringify(draft));
    };

    const updateStockItemInstance = (modelId, instanceIdx, field, value) => {
        const next = {
            ...stockItemInstances,
            [modelId]: stockItemInstances[modelId].map((inst, idx) =>
                idx === instanceIdx ? { ...inst, [field]: value } : inst
            )
        };
        setStockItemInstances(next);
        saveDraft(next, consumableInstances);
    };

    const updateConsumableInstance = (modelId, instanceIdx, field, value) => {
        const next = {
            ...consumableInstances,
            [modelId]: consumableInstances[modelId].map((inst, idx) =>
                idx === instanceIdx ? { ...inst, [field]: value } : inst
            )
        };
        setConsumableInstances(next);
        saveDraft(stockItemInstances, next);
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

    // Build flat list of stock item rows (one row per instance)
    const stockItemRows = useMemo(() => {
        const rows = [];
        defaultStockItems.forEach((item) => {
            const modelId = item.stock_item_model;
            const instances = stockItemInstances[modelId] || [];
            const qty = Math.max(1, Number(item.quantity) || 1);
            for (let i = 0; i < qty; i++) {
                rows.push({
                    modelId,
                    instanceIdx: i,
                    instance: instances[i] || { stock_item_name: '', stock_item_inventory_number: '' }
                });
            }
        });
        return rows;
    }, [defaultStockItems, stockItemInstances]);

    // Build flat list of consumable rows (one row per instance)
    const consumableRows = useMemo(() => {
        const rows = [];
        defaultConsumables.forEach((item) => {
            const modelId = item.consumable_model;
            const instances = consumableInstances[modelId] || [];
            const qty = Math.max(1, Number(item.quantity) || 1);
            for (let i = 0; i < qty; i++) {
                rows.push({
                    modelId,
                    instanceIdx: i,
                    instance: instances[i] || { consumable_name: '', consumable_serial_number: '', consumable_inventory_number: '' }
                });
            }
        });
        return rows;
    }, [defaultConsumables, consumableInstances]);

    const totalStockItems = stockItemRows.length;
    const totalConsumables = consumableRows.length;

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Attribution Orders</h1>
                <p className="page-subtitle">
                    Configure included items {assetRow?.asset_name ? `• ${assetRow.asset_name}` : ''}
                </p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-4)',
                    border: '1px solid #fcc'
                }}>
                    {error}
                </div>
            )}

            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={goBack}
                        style={{
                            padding: 'var(--space-2) var(--space-3)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                        }}
                        title="Back"
                        aria-label="Back"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                        Stock items: {totalStockItems} • Consumables: {totalConsumables}
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: view === 'all' ? '1fr 1fr' : '1fr',
                    gap: 'var(--space-6)',
                    flex: 1,
                    minHeight: 0
                }}
            >
                {(view === 'all' || view === 'stock') && (
                    <div className="card" style={{ padding: 'var(--space-4)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ marginBottom: 'var(--space-3)' }}>
                            <h2 className="card-title">Default Stock Items</h2>
                        </div>
                        {stockItemRows.length === 0 ? (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                                No default stock items for this asset model.
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px' }}>#</th>
                                            <th>Type</th>
                                            <th>Model</th>
                                            <th>Name</th>
                                            <th>Inventory #</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockItemRows.map((row, idx) => {
                                            const model = stockItemModelLookup.get(Number(row.modelId));
                                            const modelName = model?.model_name || `Model #${row.modelId}`;
                                            const modelCode = model?.model_code || '';
                                            const typeName = model?.stock_item_type_label || '-';
                                            return (
                                                <tr key={`stock-${row.modelId}-${row.instanceIdx}`}>
                                                    <td style={{ color: 'var(--color-text-secondary)' }}>{idx + 1}</td>
                                                    <td>{typeName}</td>
                                                    <td>
                                                        <div style={{ fontWeight: '500' }}>{modelName}</div>
                                                        {modelCode && (
                                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                                                {modelCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.instance.stock_item_name || ''}
                                                            onChange={(e) => updateStockItemInstance(row.modelId, row.instanceIdx, 'stock_item_name', e.target.value)}
                                                            style={{ width: '100%', padding: '6px' }}
                                                            placeholder="Enter name..."
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.instance.stock_item_inventory_number || ''}
                                                            onChange={(e) => updateStockItemInstance(row.modelId, row.instanceIdx, 'stock_item_inventory_number', e.target.value)}
                                                            style={{ width: '100%', padding: '6px' }}
                                                            placeholder="Enter inventory #..."
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {(view === 'all' || view === 'consumables') && (
                    <div className="card" style={{ padding: 'var(--space-4)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ marginBottom: 'var(--space-3)' }}>
                            <h2 className="card-title">Default Consumables</h2>
                        </div>
                        {consumableRows.length === 0 ? (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                                No default consumables for this asset model.
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px' }}>#</th>
                                            <th>Type</th>
                                            <th>Model</th>
                                            <th>Name</th>
                                            <th>Serial #</th>
                                            <th>Inventory #</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consumableRows.map((row, idx) => {
                                            const model = consumableModelLookup.get(Number(row.modelId));
                                            const modelName = model?.model_name || `Model #${row.modelId}`;
                                            const modelCode = model?.model_code || '';
                                            const typeName = model?.consumable_type_label || '-';
                                            return (
                                                <tr key={`cons-${row.modelId}-${row.instanceIdx}`}>
                                                    <td style={{ color: 'var(--color-text-secondary)' }}>{idx + 1}</td>
                                                    <td>{typeName}</td>
                                                    <td>
                                                        <div style={{ fontWeight: '500' }}>{modelName}</div>
                                                        {modelCode && (
                                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                                                {modelCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.instance.consumable_name || ''}
                                                            onChange={(e) => updateConsumableInstance(row.modelId, row.instanceIdx, 'consumable_name', e.target.value)}
                                                            style={{ width: '100%', padding: '6px' }}
                                                            placeholder="Enter name..."
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.instance.consumable_serial_number || ''}
                                                            onChange={(e) => updateConsumableInstance(row.modelId, row.instanceIdx, 'consumable_serial_number', e.target.value)}
                                                            style={{ width: '100%', padding: '6px' }}
                                                            placeholder="Enter serial #..."
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.instance.consumable_inventory_number || ''}
                                                            onChange={(e) => updateConsumableInstance(row.modelId, row.instanceIdx, 'consumable_inventory_number', e.target.value)}
                                                            style={{ width: '100%', padding: '6px' }}
                                                            placeholder="Enter inventory #..."
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttributionOrderAssetIncludedItemsPage;
