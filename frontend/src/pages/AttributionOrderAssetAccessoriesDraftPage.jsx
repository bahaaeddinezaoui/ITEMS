import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { stockItemModelService, consumableModelService } from '../services/api';

const DRAFT_ACCESSORIES_KEY = 'attribution_order_create_draft_accessories';

const AttributionOrderAssetAccessoriesDraftPage = () => {
    const navigate = useNavigate();
    const { rowId } = useParams();
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');

    const [stockItems, setStockItems] = useState([]);
    const [consumables, setConsumables] = useState([]);

    const [draftStockItems, setDraftStockItems] = useState([]);
    const [draftConsumables, setDraftConsumables] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDraft = () => {
        try {
            const draft = JSON.parse(sessionStorage.getItem(DRAFT_ACCESSORIES_KEY) || '{}');
            const rowDraft = draft?.[String(rowId)] || draft?.[rowId] || {};
            const stock = Array.isArray(rowDraft.stock_items) ? rowDraft.stock_items : [];
            const cons = Array.isArray(rowDraft.consumables) ? rowDraft.consumables : [];
            setDraftStockItems(stock);
            setDraftConsumables(cons);
        } catch {
            setDraftStockItems([]);
            setDraftConsumables([]);
        }
    };

    const saveDraft = (nextStockItems, nextConsumables) => {
        let draft = {};
        try {
            draft = JSON.parse(sessionStorage.getItem(DRAFT_ACCESSORIES_KEY) || '{}');
        } catch {
            draft = {};
        }
        draft[String(rowId)] = {
            stock_items: nextStockItems,
            consumables: nextConsumables,
        };
        sessionStorage.setItem(DRAFT_ACCESSORIES_KEY, JSON.stringify(draft));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                loadDraft();
                const [sData, cData] = await Promise.all([
                    stockItemModelService.getAll(),
                    consumableModelService.getAll(),
                ]);
                setStockItems(Array.isArray(sData) ? sData : (sData?.results || []));
                setConsumables(Array.isArray(cData) ? cData : (cData?.results || []));
            } catch (e) {
                setError('Failed to load items');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowId]);

    const stockModelLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(stockItems) ? stockItems : []).forEach((m) => {
            map.set(Number(m.stock_item_model_id), m);
        });
        return map;
    }, [stockItems]);

    const consumableModelLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(consumables) ? consumables : []).forEach((m) => {
            map.set(Number(m.consumable_model_id), m);
        });
        return map;
    }, [consumables]);

    const addDraftStockItem = () => {
        const next = [
            ...draftStockItems,
            {
                stock_item_model: '',
                stock_item_name: '',
                stock_item_inventory_number: '',
                stock_item_status: 'in_stock',
            },
        ];
        setDraftStockItems(next);
        saveDraft(next, draftConsumables);
    };

    const addDraftConsumable = () => {
        const next = [
            ...draftConsumables,
            {
                consumable_model: '',
                consumable_name: '',
                consumable_serial_number: '',
                consumable_inventory_number: '',
                consumable_status: 'in_stock',
            },
        ];
        setDraftConsumables(next);
        saveDraft(draftStockItems, next);
    };

    const updateDraftStockItem = (index, field, value) => {
        const next = draftStockItems.map((row, idx) => (idx === index ? { ...row, [field]: value } : row));
        setDraftStockItems(next);
        saveDraft(next, draftConsumables);
    };

    const updateDraftConsumable = (index, field, value) => {
        const next = draftConsumables.map((row, idx) => (idx === index ? { ...row, [field]: value } : row));
        setDraftConsumables(next);
        saveDraft(draftStockItems, next);
    };

    const removeDraftStockItem = (index) => {
        const next = draftStockItems.filter((_, idx) => idx !== index);
        setDraftStockItems(next);
        saveDraft(next, draftConsumables);
    };

    const removeDraftConsumable = (index) => {
        const next = draftConsumables.filter((_, idx) => idx !== index);
        setDraftConsumables(next);
        saveDraft(draftStockItems, next);
    };

    const goBack = () => {
        if (context === 'create') {
            navigate('/dashboard/attribution-orders?mode=create');
        } else if (context) {
            navigate(`/dashboard/attribution-orders?orderId=${context}`);
        } else {
            navigate('/dashboard/attribution-orders');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Accessories</h1>
                    <p className="page-subtitle">Draft asset row #{rowId}</p>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={goBack}
                    title="Back"
                    aria-label="Back"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Stock Items</h2>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-primary" style={{ width: 'auto' }} onClick={addDraftStockItem}>
                                + Add Stock Item
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Name</th>
                                        <th>Inventory #</th>
                                        <th style={{ width: '90px' }}> </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {draftStockItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                                No stock item accessories.
                                            </td>
                                        </tr>
                                    ) : (
                                        draftStockItems.map((row, idx) => {
                                            const model = stockModelLookup.get(Number(row.stock_item_model));
                                            return (
                                                <tr key={`draft-stock-${idx}`}>
                                                    <td>
                                                        <select
                                                            className="form-input"
                                                            value={row.stock_item_model}
                                                            onChange={(e) => updateDraftStockItem(idx, 'stock_item_model', e.target.value)}
                                                        >
                                                            <option value="">Select Model</option>
                                                            {stockItems.map((m) => (
                                                                <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                                                    {[m.brand_name, m.model_name].filter(Boolean).join(' ') || `Model #${m.stock_item_model_id}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="form-input"
                                                            value={row.stock_item_name}
                                                            onChange={(e) => updateDraftStockItem(idx, 'stock_item_name', e.target.value)}
                                                            placeholder="Name"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="form-input"
                                                            value={row.stock_item_inventory_number}
                                                            onChange={(e) => updateDraftStockItem(idx, 'stock_item_inventory_number', e.target.value)}
                                                            placeholder="Inv #"
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ width: 'auto' }}
                                                            onClick={() => removeDraftStockItem(idx)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Consumables</h2>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-primary" style={{ width: 'auto' }} onClick={addDraftConsumable}>
                                + Add Consumable
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Name</th>
                                        <th>Serial #</th>
                                        <th>Inventory #</th>
                                        <th style={{ width: '90px' }}> </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {draftConsumables.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                                No consumable accessories.
                                            </td>
                                        </tr>
                                    ) : (
                                        draftConsumables.map((row, idx) => {
                                            const model = consumableModelLookup.get(Number(row.consumable_model));
                                            return (
                                                <tr key={`draft-cons-${idx}`}>
                                                    <td>
                                                        <select
                                                            className="form-input"
                                                            value={row.consumable_model}
                                                            onChange={(e) => updateDraftConsumable(idx, 'consumable_model', e.target.value)}
                                                        >
                                                            <option value="">Select Model</option>
                                                            {consumables.map((m) => (
                                                                <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                                                    {[m.brand_name, m.model_name].filter(Boolean).join(' ') || `Model #${m.consumable_model_id}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="form-input"
                                                            value={row.consumable_name}
                                                            onChange={(e) => updateDraftConsumable(idx, 'consumable_name', e.target.value)}
                                                            placeholder="Name"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="form-input"
                                                            value={row.consumable_serial_number}
                                                            onChange={(e) => updateDraftConsumable(idx, 'consumable_serial_number', e.target.value)}
                                                            placeholder="Serial #"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="form-input"
                                                            value={row.consumable_inventory_number}
                                                            onChange={(e) => updateDraftConsumable(idx, 'consumable_inventory_number', e.target.value)}
                                                            placeholder="Inv #"
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ width: 'auto' }}
                                                            onClick={() => removeDraftConsumable(idx)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttributionOrderAssetAccessoriesDraftPage;
