import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetModelService, authService, consumableModelService, stockItemModelService } from '../services/api';

const AssetModelCompatibilityPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const typeId = searchParams.get('typeId');

    const [assetModel, setAssetModel] = useState(null);

    const [compatibleStockItemModels, setCompatibleStockItemModels] = useState([]);
    const [compatibleConsumableModels, setCompatibleConsumableModels] = useState([]);

    // Default composition state
    const [defaultStockItems, setDefaultStockItems] = useState([]);
    const [defaultConsumables, setDefaultConsumables] = useState([]);

    const [allStockItemModels, setAllStockItemModels] = useState([]);
    const [allConsumableModels, setAllConsumableModels] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedStockItemModelId, setSelectedStockItemModelId] = useState('');
    const [selectedConsumableModelId, setSelectedConsumableModelId] = useState('');
    const [showAddStockForm, setShowAddStockForm] = useState(false);
    const [showAddConsumableForm, setShowAddConsumableForm] = useState(false);

    // Default composition form state
    const [showAddDefaultStockForm, setShowAddDefaultStockForm] = useState(false);
    const [showAddDefaultConsumableForm, setShowAddDefaultConsumableForm] = useState(false);
    const [selectedDefaultStockModelId, setSelectedDefaultStockModelId] = useState('');
    const [selectedDefaultConsumableModelId, setSelectedDefaultConsumableModelId] = useState('');
    const [defaultStockQuantity, setDefaultStockQuantity] = useState(1);
    const [defaultConsumableQuantity, setDefaultConsumableQuantity] = useState(1);

    const defaultCompositionRef = useRef(null);

    const isSuperuser = authService.isSuperuser();

    const goBack = () => {
        if (typeId) {
            navigate(`/dashboard/assets/models?typeId=${typeId}`);
            return;
        }
        navigate(-1);
    };

    const fetchAll = useCallback(async () => {
        if (!modelId) return;
        setLoading(true);
        setError(null);
        try {
            const [am, stockCompat, consCompat, allStock, allCons, defStock, defCons] = await Promise.all([
                assetModelService.getById(modelId),
                assetModelService.getCompatibleStockItemModels(modelId),
                assetModelService.getCompatibleConsumableModels(modelId),
                stockItemModelService.getAll(),
                consumableModelService.getAll(),
                assetModelService.getDefaultStockItems(modelId),
                assetModelService.getDefaultConsumables(modelId),
            ]);

            setAssetModel(am || null);
            setCompatibleStockItemModels(Array.isArray(stockCompat) ? stockCompat : []);
            setCompatibleConsumableModels(Array.isArray(consCompat) ? consCompat : []);
            setAllStockItemModels(Array.isArray(allStock) ? allStock : []);
            setAllConsumableModels(Array.isArray(allCons) ? allCons : []);
            setDefaultStockItems(Array.isArray(defStock) ? defStock : []);
            setDefaultConsumables(Array.isArray(defCons) ? defCons : []);
        } catch (err) {
            setError('Failed to fetch compatibility: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [modelId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const compatibleStockIds = useMemo(() => {
        return new Set((Array.isArray(compatibleStockItemModels) ? compatibleStockItemModels : []).map((m) => m.stock_item_model_id));
    }, [compatibleStockItemModels]);

    const compatibleConsumableIds = useMemo(() => {
        return new Set((Array.isArray(compatibleConsumableModels) ? compatibleConsumableModels : []).map((m) => m.consumable_model_id));
    }, [compatibleConsumableModels]);

    const availableStockItemModels = useMemo(() => {
        return (Array.isArray(allStockItemModels) ? allStockItemModels : []).filter((m) => !compatibleStockIds.has(m.stock_item_model_id));
    }, [allStockItemModels, compatibleStockIds]);

    const availableConsumableModels = useMemo(() => {
        return (Array.isArray(allConsumableModels) ? allConsumableModels : []).filter((m) => !compatibleConsumableIds.has(m.consumable_model_id));
    }, [allConsumableModels, compatibleConsumableIds]);

    const addStockCompatibility = async () => {
        if (!selectedStockItemModelId) return;
        setError(null);
        try {
            await assetModelService.addCompatibleStockItemModel(modelId, Number(selectedStockItemModelId));
            setSelectedStockItemModelId('');
            setShowAddStockForm(false);
            await fetchAll();
        } catch (err) {
            setError('Failed to add compatible stock item model: ' + err.message);
        }
    };

    const removeStockCompatibility = async (stockItemModelId) => {
        setError(null);
        try {
            await assetModelService.removeCompatibleStockItemModel(modelId, stockItemModelId);
            await fetchAll();
        } catch (err) {
            setError('Failed to remove compatible stock item model: ' + err.message);
        }
    };

    const addConsumableCompatibility = async () => {
        if (!selectedConsumableModelId) return;
        setError(null);
        try {
            await assetModelService.addCompatibleConsumableModel(modelId, Number(selectedConsumableModelId));
            setSelectedConsumableModelId('');
            setShowAddConsumableForm(false);
            await fetchAll();
        } catch (err) {
            setError('Failed to add compatible consumable model: ' + err.message);
        }
    };

    const removeConsumableCompatibility = async (consumableModelId) => {
        setError(null);
        try {
            await assetModelService.removeCompatibleConsumableModel(modelId, consumableModelId);
            await fetchAll();
        } catch (err) {
            setError('Failed to remove compatible consumable model: ' + err.message);
        }
    };

    // Default composition functions
    const defaultStockIds = useMemo(() => {
        return new Set(defaultStockItems.map((item) => item.stock_item_model));
    }, [defaultStockItems]);

    const defaultConsumableIds = useMemo(() => {
        return new Set(defaultConsumables.map((item) => item.consumable_model));
    }, [defaultConsumables]);

    const availableDefaultStockModels = useMemo(() => {
        return (Array.isArray(allStockItemModels) ? allStockItemModels : []).filter((m) => !defaultStockIds.has(m.stock_item_model_id));
    }, [allStockItemModels, defaultStockIds]);

    const availableDefaultConsumableModels = useMemo(() => {
        return (Array.isArray(allConsumableModels) ? allConsumableModels : []).filter((m) => !defaultConsumableIds.has(m.consumable_model_id));
    }, [allConsumableModels, defaultConsumableIds]);

    const addDefaultStockItem = async () => {
        if (!selectedDefaultStockModelId) return;
        setError(null);
        try {
            await assetModelService.addDefaultStockItem(modelId, Number(selectedDefaultStockModelId), defaultStockQuantity);
            setSelectedDefaultStockModelId('');
            setDefaultStockQuantity(1);
            setShowAddDefaultStockForm(false);
            await fetchAll();
        } catch (err) {
            setError('Failed to add default stock item: ' + err.message);
        }
    };

    const removeDefaultStockItem = async (id) => {
        setError(null);
        try {
            await assetModelService.removeDefaultStockItem(id);
            await fetchAll();
        } catch (err) {
            setError('Failed to remove default stock item: ' + err.message);
        }
    };

    const addDefaultConsumable = async () => {
        if (!selectedDefaultConsumableModelId) return;
        setError(null);
        try {
            await assetModelService.addDefaultConsumable(modelId, Number(selectedDefaultConsumableModelId), defaultConsumableQuantity);
            setSelectedDefaultConsumableModelId('');
            setDefaultConsumableQuantity(1);
            setShowAddDefaultConsumableForm(false);
            await fetchAll();
        } catch (err) {
            setError('Failed to add default consumable: ' + err.message);
        }
    };

    const removeDefaultConsumable = async (id) => {
        setError(null);
        try {
            await assetModelService.removeDefaultConsumable(id);
            await fetchAll();
        } catch (err) {
            setError('Failed to remove default consumable: ' + err.message);
        }
    };

    const jumpToDefaultComposition = () => {
        const qs = typeId ? `?typeId=${typeId}` : '';
        navigate(`/dashboard/assets/models/${modelId}/default-composition${qs}`);
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Assets</h1>
                <p className="page-subtitle">Compatibility {assetModel?.model_name ? `• ${assetModel.model_name}` : ''}</p>
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

            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
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

            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-6)',
                flex: 1,
                minHeight: 0
            }}>
                <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Compatible Stock Item Models</h2>
                        {isSuperuser && !showAddStockForm && (
                            <button
                                onClick={() => setShowAddStockForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                Add compatible model
                            </button>
                        )}
                    </div>

                    {isSuperuser && showAddStockForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <select
                                    value={selectedStockItemModelId}
                                    onChange={(e) => setSelectedStockItemModelId(e.target.value)}
                                    style={{ flex: 1, padding: 'var(--space-2)' }}
                                >
                                    <option value="">Select stock item model...</option>
                                    {availableStockItemModels.map((m) => (
                                        <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                            {m.model_name || `Model ${m.stock_item_model_id}`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={addStockCompatibility}
                                    disabled={!selectedStockItemModelId || loading}
                                    style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddStockForm(false);
                                        setSelectedStockItemModelId('');
                                    }}
                                    style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {(Array.isArray(compatibleStockItemModels) ? compatibleStockItemModels : []).map((m) => (
                            <div key={m.stock_item_model_id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{m.model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code}</span>
                                </div>
                                {isSuperuser && (
                                    <button onClick={() => removeStockCompatibility(m.stock_item_model_id)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}>
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}

                        {compatibleStockItemModels.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No compatible stock item models.
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Compatible Consumable Models</h2>
                        {isSuperuser && !showAddConsumableForm && (
                            <button
                                onClick={() => setShowAddConsumableForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                Add compatible model
                            </button>
                        )}
                    </div>

                    {isSuperuser && showAddConsumableForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <select
                                    value={selectedConsumableModelId}
                                    onChange={(e) => setSelectedConsumableModelId(e.target.value)}
                                    style={{ flex: 1, padding: 'var(--space-2)' }}
                                >
                                    <option value="">Select consumable model...</option>
                                    {availableConsumableModels.map((m) => (
                                        <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                            {m.model_name || `Model ${m.consumable_model_id}`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={addConsumableCompatibility}
                                    disabled={!selectedConsumableModelId || loading}
                                    style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddConsumableForm(false);
                                        setSelectedConsumableModelId('');
                                    }}
                                    style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {(Array.isArray(compatibleConsumableModels) ? compatibleConsumableModels : []).map((m) => (
                            <div key={m.consumable_model_id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{m.model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code}</span>
                                </div>
                                {isSuperuser && (
                                    <button onClick={() => removeConsumableCompatibility(m.consumable_model_id)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}>
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}

                        {compatibleConsumableModels.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No compatible consumable models.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Default Composition Section */}
            <div ref={defaultCompositionRef} />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                Default Composition (Included with new assets)
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                These items will be automatically created and linked to new assets of this model when added via an attribution order.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-6)',
                flex: 1,
                minHeight: 0
            }}>
                {/* Default Stock Items */}
                <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Default Stock Items</h2>
                        {isSuperuser && !showAddDefaultStockForm && (
                            <button
                                onClick={() => setShowAddDefaultStockForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                Add default item
                            </button>
                        )}
                    </div>

                    {isSuperuser && showAddDefaultStockForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                <select
                                    value={selectedDefaultStockModelId}
                                    onChange={(e) => setSelectedDefaultStockModelId(e.target.value)}
                                    style={{ flex: 1, padding: 'var(--space-2)' }}
                                >
                                    <option value="">Select stock item model...</option>
                                    {availableDefaultStockModels.map((m) => (
                                        <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                            {m.model_name || `Model ${m.stock_item_model_id}`}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    value={defaultStockQuantity}
                                    onChange={(e) => setDefaultStockQuantity(Number(e.target.value))}
                                    style={{ width: '60px', padding: 'var(--space-2)' }}
                                    placeholder="Qty"
                                />
                                <button
                                    onClick={addDefaultStockItem}
                                    disabled={!selectedDefaultStockModelId || loading}
                                    style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddDefaultStockForm(false);
                                        setSelectedDefaultStockModelId('');
                                        setDefaultStockQuantity(1);
                                    }}
                                    style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {defaultStockItems.map((item) => (
                            <div key={item.id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{item.stock_item_model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Qty: {item.quantity}</span>
                                </div>
                                {isSuperuser && (
                                    <button onClick={() => removeDefaultStockItem(item.id)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}>
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}

                        {defaultStockItems.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No default stock items defined.
                            </div>
                        )}
                    </div>
                </div>

                {/* Default Consumables */}
                <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Default Consumables</h2>
                        {isSuperuser && !showAddDefaultConsumableForm && (
                            <button
                                onClick={() => setShowAddDefaultConsumableForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                Add default item
                            </button>
                        )}
                    </div>

                    {isSuperuser && showAddDefaultConsumableForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                <select
                                    value={selectedDefaultConsumableModelId}
                                    onChange={(e) => setSelectedDefaultConsumableModelId(e.target.value)}
                                    style={{ flex: 1, padding: 'var(--space-2)' }}
                                >
                                    <option value="">Select consumable model...</option>
                                    {availableDefaultConsumableModels.map((m) => (
                                        <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                            {m.model_name || `Model ${m.consumable_model_id}`}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    value={defaultConsumableQuantity}
                                    onChange={(e) => setDefaultConsumableQuantity(Number(e.target.value))}
                                    style={{ width: '60px', padding: 'var(--space-2)' }}
                                    placeholder="Qty"
                                />
                                <button
                                    onClick={addDefaultConsumable}
                                    disabled={!selectedDefaultConsumableModelId || loading}
                                    style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddDefaultConsumableForm(false);
                                        setSelectedDefaultConsumableModelId('');
                                        setDefaultConsumableQuantity(1);
                                    }}
                                    style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {defaultConsumables.map((item) => (
                            <div key={item.id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{item.consumable_model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Qty: {item.quantity}</span>
                                </div>
                                {isSuperuser && (
                                    <button onClick={() => removeDefaultConsumable(item.id)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}>
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}

                        {defaultConsumables.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No default consumables defined.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetModelCompatibilityPage;
