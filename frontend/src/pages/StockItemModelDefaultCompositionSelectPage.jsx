import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
    stockItemModelService,
    stockItemTypeService,
    authService,
    consumableModelService,
    consumableTypeService,
} from '../services/api';
import { useTranslation } from 'react-i18next';
import { Layers, Package, Plus, Trash2 } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import SearchableSelect from '../components/SearchableSelect';
import BackButton from '../components/BackButton';

const StockItemModelDefaultCompositionSelectPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const typeId = searchParams.get('typeId') || '';

    const [stockItemModel, setStockItemModel] = useState(null);
    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);

    const [consumableTypes, setConsumableTypes] = useState([]);
    const [consumableModels, setConsumableModels] = useState([]);
    const [allConsumableModels, setAllConsumableModels] = useState([]);

    // Full default consumable items data (for display)
    const [defaultConsumables, setDefaultConsumables] = useState([]);

    const [existingDefaultConsumableModelIds, setExistingDefaultConsumableModelIds] = useState(new Set());

    const [selectedTypeId, setSelectedTypeId] = useState(typeId);
    const [selectedModelIds, setSelectedModelIds] = useState(modelId ? [Number(modelId)] : []);

    useEffect(() => {
        if (modelId) {
            const numericId = Number(modelId);
            setSelectedModelIds([numericId]);
        }
    }, [modelId]);

    const [selectedConsumableTypeId, setSelectedConsumableTypeId] = useState('');
    const [selectedConsumableModelId, setSelectedConsumableModelId] = useState('');
    const [consumableQuantity, setConsumableQuantity] = useState(1);

    const [showAddConsumableModal, setShowAddConsumableModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isSuperuser, setIsSuperuser] = useState(authService.isSuperuser());

    useEffect(() => {
        setIsSuperuser(authService.isSuperuser());
    }, []);

    const fetchDefaults = useCallback(async (id) => {
        if (!id) return;
        try {
            const defCons = await stockItemModelService.getDefaultConsumables(id);
            const consItems = (defCons?.results || defCons || []);
            setDefaultConsumables(Array.isArray(consItems) ? consItems : []);
            setExistingDefaultConsumableModelIds(new Set(consItems.map(item => item.consumable_model)));
        } catch (err) {
            console.error('Failed to fetch defaults:', err);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [stockTypesData, consumableTypesData, allConsModelsData] = await Promise.all([
                    stockItemTypeService.getAll(),
                    consumableTypeService.getAll(),
                    consumableModelService.getAll(),
                ]);
                setStockItemTypes(stockTypesData?.results || stockTypesData || []);
                setConsumableTypes(consumableTypesData?.results || consumableTypesData || []);
                setAllConsumableModels(allConsModelsData?.results || allConsModelsData || []);

                if (modelId) {
                    const modelData = await stockItemModelService.getById(modelId);
                    setStockItemModel(modelData);
                    await fetchDefaults(modelId);
                }
            } catch (err) {
                setError(t('stockItemDefaultComposition.fetchInitialError'));
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [modelId]);

    useEffect(() => {
        const fetchConsumableModels = async () => {
            if (!selectedConsumableTypeId) {
                setConsumableModels([]);
                setSelectedConsumableModelId('');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const modelsData = await consumableModelService.getByConsumableType(selectedConsumableTypeId);
                const models = modelsData?.results || modelsData || [];
                setConsumableModels(Array.isArray(models) ? models : []);
                setSelectedConsumableModelId('');
            } catch (err) {
                setError(t('stockItemDefaultComposition.fetchConsumableModelsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchConsumableModels();
    }, [selectedConsumableTypeId]);

    useEffect(() => {
        const fetchModels = async () => {
            if (!selectedTypeId) {
                setStockItemModels([]);
                setSelectedModelIds([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const modelsData = await stockItemModelService.getByStockItemType(selectedTypeId);
                const models = modelsData?.results || modelsData || [];
                setStockItemModels(Array.isArray(models) ? models : []);
                setSelectedModelIds([]);
            } catch (err) {
                setError(t('stockItemDefaultComposition.fetchStockItemModelsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, [selectedTypeId]);

    const toggleModel = (id) => {
        setSelectedModelIds((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            return [...prev, id];
        });
    };

    const selectedModels = useMemo(() => {
        const setIds = new Set(selectedModelIds);
        return stockItemModels.filter((m) => setIds.has(m.stock_item_model_id));
    }, [stockItemModels, selectedModelIds]);

    const addDefaultConsumableToSelectedModels = async () => {
        const targetIds = modelId ? [Number(modelId)] : selectedModelIds;
        if (!selectedConsumableModelId || targetIds.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            for (const siModelId of targetIds) {
                await stockItemModelService.addDefaultConsumable(siModelId, Number(selectedConsumableModelId), consumableQuantity);
            }
            setSelectedConsumableTypeId('');
            setSelectedConsumableModelId('');
            setConsumableQuantity(1);
            setShowAddConsumableModal(false);
            if (modelId) {
                await fetchDefaults(modelId);
            }
        } catch (err) {
            setError(t('stockItemDefaultComposition.insertConsumableError'));
        } finally {
            setLoading(false);
        }
    };

    const removeDefaultConsumable = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await stockItemModelService.removeDefaultConsumable(id);
            if (modelId) {
                await fetchDefaults(modelId);
            }
        } catch (err) {
            setError(t('stockItemDefaultComposition.removeConsumableError'));
        } finally {
            setLoading(false);
        }
    };

    const visibleConsumableTypes = useMemo(() => {
        if (!modelId) return consumableTypes;
        return consumableTypes.filter(type => {
            const modelsForType = allConsumableModels.filter(m => m.consumable_type === type.consumable_type_id);
            if (modelsForType.length === 0) return false;
            return modelsForType.some(m => !existingDefaultConsumableModelIds.has(m.consumable_model_id));
        });
    }, [consumableTypes, allConsumableModels, existingDefaultConsumableModelIds, modelId]);

    const goBack = () => {
        const tid = typeId || selectedTypeId;
        if (tid) {
            navigate(`/dashboard/stock-items/models?typeId=${tid}`);
            return;
        }
        navigate('/dashboard/stock-items/models');
    };

    const addItemBtnStyle = {
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        border: '1px solid var(--color-accent-primary)',
        background: 'transparent',
        color: 'var(--color-accent-primary)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-sm)',
        fontWeight: '500',
    };
    const removeBtnStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, border: '1px solid var(--color-border)',
        background: 'transparent', color: 'var(--color-text-secondary)',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    };
    const listItemStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)',
    };
    const emptyStateStyle = {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--space-2)', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
    };
    const totalDefaultConsumables = defaultConsumables.reduce((s, i) => s + (i.quantity || 1), 0);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('stockItemDefaultComposition.defaultComposition')}
                    </h1>
                    <p className="page-subtitle">{stockItemModel ? stockItemModel.model_name : t('stockItemDefaultComposition.selectTypeModelDesc')}</p>
                </div>
                <BackButton onClick={goBack} label={t('common.back')} />
            </div>


            {error && (
                <div style={{
                    backgroundColor: 'var(--color-bg-error)', color: 'var(--color-text-error)',
                    padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)', border: '1px solid var(--color-border-error)',
                }}>
                    {error}
                </div>
            )}

            {/* Summary stats for modelId mode */}
            {modelId && (
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div style={{
                        flex: 1, background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4) var(--space-5)', border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                            background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Package size={18} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('stockItemDefaultComposition.defaultConsumables')}</div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>{totalDefaultConsumables}</div>
                        </div>
                    </div>
                </div>
            )}

            {!modelId && (
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '260px' }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                {t('stockItemDefaultComposition.stockItemType')}
                            </label>
                            <select
                                className="form-input"
                                value={selectedTypeId}
                                onChange={(e) => setSelectedTypeId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">{t('stockItemDefaultComposition.selectType')}</option>
                                {stockItemTypes.map((type) => (
                                    <option key={type.stock_item_type_id} value={type.stock_item_type_id}>
                                        {type.stock_item_type_label || `Type ${type.stock_item_type_id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {(selectedTypeId || modelId) && (
                <div style={{ display: 'grid', gridTemplateColumns: modelId ? '1fr' : '1fr 1fr', gap: 'var(--space-6)' }}>
                    {!modelId && (
                        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header" style={{
                                padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: 'var(--color-bg-secondary)',
                            }}>
                                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('stockItemDefaultComposition.targetStockItemModels')}</h2>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                    {selectedModelIds.length} {t('stockItemDefaultComposition.selected')}
                                </span>
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '500px' }}>
                                {stockItemModels.map((m) => (
                                    <label key={m.stock_item_model_id} style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border)', cursor: 'pointer',
                                    }}>
                                        <input type="checkbox" checked={selectedModelIds.includes(m.stock_item_model_id)} onChange={() => toggleModel(m.stock_item_model_id)} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '500' }}>{m.model_name || `Model ${m.stock_item_model_id}`}</span>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code || ''}</span>
                                        </div>
                                    </label>
                                ))}
                                {stockItemModels.length === 0 && !loading && (
                                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                        {t('stockItemDefaultComposition.noModelsForType')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Default Consumables Card */}
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{
                            padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            backgroundColor: 'var(--color-bg-secondary)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Package size={16} style={{ color: '#f59e0b' }} />
                                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('stockItemDefaultComposition.defaultConsumables')}</h2>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{defaultConsumables.length}</span>
                            </div>
                            {isSuperuser && (
                                <button onClick={() => setShowAddConsumableModal(true)} style={addItemBtnStyle}>
                                    <Plus size={14} /> {t('stockItemDefaultComposition.addDefaultConsumableModels')}
                                </button>
                            )}
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, maxHeight: '200px' }}>
                            {defaultConsumables.map((item) => (
                                <div key={item.id} style={listItemStyle}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontWeight: '500' }}>{item.consumable_model_name}</span>
                                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{t('stockItemDefaultComposition.qty')}: {item.quantity}</span>
                                    </div>
                                    {isSuperuser && (
                                        <button onClick={() => removeDefaultConsumable(item.id)} style={removeBtnStyle} title={t('common.remove')} aria-label={t('common.remove')}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {defaultConsumables.length === 0 && (
                                <div style={emptyStateStyle}>
                                    <Package size={32} style={{ opacity: 0.3 }} />
                                    <span>{t('stockItemDefaultComposition.noDefaultConsumables')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Default Consumable Modal */}
            {showAddConsumableModal && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAddConsumableModal(false); setSelectedConsumableTypeId(''); setSelectedConsumableModelId(''); setConsumableQuantity(1); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', minHeight: '380px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Plus size={16} /> {t('stockItemDefaultComposition.addDefaultConsumableModels')}
                                </h3>
                                <button className="modal-close" onClick={() => { setShowAddConsumableModal(false); setSelectedConsumableTypeId(''); setSelectedConsumableModelId(''); setConsumableQuantity(1); }}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('stockItemDefaultComposition.consumableType')}
                                    </label>
                                    <select className="form-input" value={selectedConsumableTypeId} onChange={(e) => setSelectedConsumableTypeId(e.target.value)} disabled={loading} style={{ height: '44px' }}>
                                        <option value="">{t('stockItemDefaultComposition.consumableType')}</option>
                                        {visibleConsumableTypes.map((type) => (
                                            <option key={type.consumable_type_id} value={type.consumable_type_id}>
                                                {type.consumable_type_label || `${t('stockItemDefaultComposition.type')} ${type.consumable_type_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('stockItemDefaultComposition.consumableModel')}
                                    </label>
                                    <SearchableSelect
                                        value={selectedConsumableModelId}
                                        onChange={(e) => setSelectedConsumableModelId(e.target.value)}
                                        placeholder={t('stockItemDefaultComposition.consumableModel')}
                                        disabled={loading || !selectedConsumableTypeId}
                                        options={consumableModels.filter(m => !existingDefaultConsumableModelIds.has(m.consumable_model_id)).map((m) => ({
                                            value: m.consumable_model_id,
                                            label: `${m.brand_name || ''} ${m.model_name || `Model ${m.consumable_model_id}`}`.trim(),
                                        }))}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('stockItemDefaultComposition.qty')}
                                    </label>
                                    <input
                                        type="number" min="1"
                                        value={consumableQuantity}
                                        onChange={(e) => setConsumableQuantity(Number(e.target.value))}
                                        className="form-input"
                                        style={{ height: '44px', width: '120px' }}
                                        placeholder={t('stockItemDefaultComposition.qty')}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => { setShowAddConsumableModal(false); setSelectedConsumableTypeId(''); setSelectedConsumableModelId(''); setConsumableQuantity(1); }} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                                    {t('common.cancel')}
                                </button>
                                <button type="button" onClick={addDefaultConsumableToSelectedModels} disabled={!selectedConsumableModelId || (modelId ? false : selectedModelIds.length === 0) || loading} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                                    {t('stockItemDefaultComposition.addToSelected')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default StockItemModelDefaultCompositionSelectPage;
