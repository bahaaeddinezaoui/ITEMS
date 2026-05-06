import { useEffect, useMemo, useState } from 'react';
import { SkeletonListRows } from '../components/SkeletonCard';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { stockItemModelService, consumableModelService } from '../services/api';
import BackButton from '../components/BackButton';
import { useTranslation } from 'react-i18next';
import { Wrench, Package, Droplets, Plus, Trash2, AlertCircle, Tag, Hash } from 'lucide-react';

const DRAFT_ACCESSORIES_KEY = 'attribution_order_create_draft_accessories';

const AttributionOrderAssetAccessoriesDraftPage = () => {
    const navigate = useNavigate();
    const { rowId } = useParams();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');

    const [stockItems, setStockItems] = useState([]);
    const [consumables, setConsumables] = useState([]);

    const [draftStockItems, setDraftStockItems] = useState([]);
    const [draftConsumables, setDraftConsumables] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockItemModelDefaultConsumables, setStockItemModelDefaultConsumables] = useState({});

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
                setError(t('accessoriesDraft.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
        // Fetch default consumables for the selected stock item model
        if (field === 'stock_item_model' && value) {
            const modelId = Number(value);
            if (!stockItemModelDefaultConsumables[modelId]) {
                stockItemModelService.getDefaultConsumables(modelId)
                    .then(data => {
                        const items = Array.isArray(data) ? data : (data?.results || []);
                        if (items.length > 0) {
                            setStockItemModelDefaultConsumables(prev => ({ ...prev, [modelId]: items }));
                        }
                    })
                    .catch(() => {});
            }
        }
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <BackButton onClick={goBack} />
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Wrench size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('accessoriesDraft.title')}</h1>
                        <p className="page-subtitle">{t('accessoriesDraft.draftAssetRow')} #{rowId}</p>
                    </div>
                </div>
            </div>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Stock Item Accessories */}
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
                                    <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('accessoriesDraft.stockItems')}</h2>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{draftStockItems.length} item(s)</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addDraftStockItem}
                                style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)', width: 'auto' }}
                            >
                                <Plus size={14} /> {t('accessoriesDraft.addStockItem')}
                            </button>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                        {draftStockItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                <Package size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                <p>{t('accessoriesDraft.noStockItemAccessories')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {draftStockItems.map((row, idx) => (
                                    <div key={`draft-stock-${idx}`} style={{ display: 'flex', flexDirection: 'column' }}>
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
                                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', alignItems: 'end' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                                    <Tag size={11} style={{ color: 'var(--color-text-muted)' }} />
                                                    {t('accessoriesDraft.model')}
                                                </label>
                                                <select
                                                    className="form-input"
                                                    value={row.stock_item_model}
                                                    onChange={(e) => updateDraftStockItem(idx, 'stock_item_model', e.target.value)}
                                                >
                                                    <option value="">{t('accessoriesDraft.selectModel')}</option>
                                                    {stockItems.map((m) => (
                                                        <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                                            {[m.brand_name, m.model_name].filter(Boolean).join(' ') || `${t('accessoriesDraft.model')} #${m.stock_item_model_id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('accessoriesDraft.name')}</label>
                                                <input
                                                    className="form-input"
                                                    value={row.stock_item_name}
                                                    onChange={(e) => updateDraftStockItem(idx, 'stock_item_name', e.target.value)}
                                                    placeholder={t('accessoriesDraft.name')}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('accessoriesDraft.inventoryNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    value={row.stock_item_inventory_number}
                                                    onChange={(e) => updateDraftStockItem(idx, 'stock_item_inventory_number', e.target.value)}
                                                    placeholder={t('accessoriesDraft.invPlaceholder')}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => removeDraftStockItem(idx)}
                                            style={{ padding: 'var(--space-2)', width: 'auto', minHeight: '36px', alignSelf: 'flex-end' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {stockItemModelDefaultConsumables[Number(row.stock_item_model)] && (
                                        <div style={{
                                            marginTop: 'var(--space-2)', marginLeft: '36px',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
                                            background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)',
                                            borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                                        }}>
                                            <Droplets size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                            <span>
                                                {t('accessoriesDraft.stockModelHasDefaultConsumables', {
                                                    count: stockItemModelDefaultConsumables[Number(row.stock_item_model)].length,
                                                    names: stockItemModelDefaultConsumables[Number(row.stock_item_model)]
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

                {/* Consumable Accessories */}
                <div className="card">
                    <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                    background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Droplets size={16} style={{ color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('accessoriesDraft.consumables')}</h2>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{draftConsumables.length} item(s)</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addDraftConsumable}
                                style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)', width: 'auto' }}
                            >
                                <Plus size={14} /> {t('accessoriesDraft.addConsumable')}
                            </button>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                        {draftConsumables.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                <Droplets size={28} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                <p>{t('accessoriesDraft.noConsumableAccessories')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {draftConsumables.map((row, idx) => (
                                    <div
                                        key={`draft-cons-${idx}`}
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
                                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-3)', alignItems: 'end' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                                                    <Tag size={11} style={{ color: 'var(--color-text-muted)' }} />
                                                    {t('accessoriesDraft.model')}
                                                </label>
                                                <select
                                                    className="form-input"
                                                    value={row.consumable_model}
                                                    onChange={(e) => updateDraftConsumable(idx, 'consumable_model', e.target.value)}
                                                >
                                                    <option value="">{t('accessoriesDraft.selectModel')}</option>
                                                    {consumables.map((m) => (
                                                        <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                                            {[m.brand_name, m.model_name].filter(Boolean).join(' ') || `${t('accessoriesDraft.model')} #${m.consumable_model_id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('accessoriesDraft.name')}</label>
                                                <input
                                                    className="form-input"
                                                    value={row.consumable_name}
                                                    onChange={(e) => updateDraftConsumable(idx, 'consumable_name', e.target.value)}
                                                    placeholder={t('accessoriesDraft.name')}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('accessoriesDraft.serialNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    value={row.consumable_serial_number}
                                                    onChange={(e) => updateDraftConsumable(idx, 'consumable_serial_number', e.target.value)}
                                                    placeholder={t('accessoriesDraft.serialPlaceholder')}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('accessoriesDraft.inventoryNumber')}</label>
                                                <input
                                                    className="form-input"
                                                    value={row.consumable_inventory_number}
                                                    onChange={(e) => updateDraftConsumable(idx, 'consumable_inventory_number', e.target.value)}
                                                    placeholder={t('accessoriesDraft.invPlaceholder')}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => removeDraftConsumable(idx)}
                                            style={{ padding: 'var(--space-2)', width: 'auto', minHeight: '36px', alignSelf: 'flex-end' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttributionOrderAssetAccessoriesDraftPage;
