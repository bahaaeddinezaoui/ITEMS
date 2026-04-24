import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
    assetModelService,
    assetTypeService,
    authService,
    consumableModelService,
    consumableTypeService,
    stockItemModelService,
    stockItemTypeService,
} from '../services/api';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

const AssetModelDefaultCompositionSelectPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const typeId = searchParams.get('typeId') || '';

    const [assetModel, setAssetModel] = useState(null);
    const [assetTypes, setAssetTypes] = useState([]);
    const [assetModels, setAssetModels] = useState([]);

    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [allStockItemModels, setAllStockItemModels] = useState([]);
    const [consumableTypes, setConsumableTypes] = useState([]);
    const [consumableModels, setConsumableModels] = useState([]);
    const [allConsumableModels, setAllConsumableModels] = useState([]);

    const [existingDefaultStockModelIds, setExistingDefaultStockModelIds] = useState(new Set());
    const [existingDefaultConsumableModelIds, setExistingDefaultConsumableModelIds] = useState(new Set());

    const [selectedTypeId, setSelectedTypeId] = useState(typeId);
    const [selectedModelIds, setSelectedModelIds] = useState(modelId ? [Number(modelId)] : []);

    useEffect(() => {
        if (modelId) {
            const numericId = Number(modelId);
            setSelectedModelIds([numericId]);
            console.log('Auto-selecting modelId:', numericId);
        }
    }, [modelId]);

    const [selectedStockItemTypeId, setSelectedStockItemTypeId] = useState('');
    const [selectedStockItemModelId, setSelectedStockItemModelId] = useState('');
    const [stockItemQuantity, setStockItemQuantity] = useState(1);

    const [selectedConsumableTypeId, setSelectedConsumableTypeId] = useState('');
    const [selectedConsumableModelId, setSelectedConsumableModelId] = useState('');
    const [consumableQuantity, setConsumableQuantity] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isSuperuser, setIsSuperuser] = useState(authService.isSuperuser());

    useEffect(() => {
        setIsSuperuser(authService.isSuperuser());
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [typesData, stockTypesData, consumableTypesData, allStockModelsData, allConsModelsData] = await Promise.all([
                    assetTypeService.getAll(),
                    stockItemTypeService.getAll(),
                    consumableTypeService.getAll(),
                    stockItemModelService.getAll(),
                    consumableModelService.getAll(),
                ]);
                setAssetTypes(typesData?.results || typesData || []);
                setStockItemTypes(stockTypesData?.results || stockTypesData || []);
                setConsumableTypes(consumableTypesData?.results || consumableTypesData || []);
                setAllStockItemModels(allStockModelsData?.results || allStockModelsData || []);
                setAllConsumableModels(allConsModelsData?.results || allConsModelsData || []);

                if (modelId) {
                    const [modelData, defStock, defCons] = await Promise.all([
                        assetModelService.getById(modelId),
                        assetModelService.getDefaultStockItems(modelId),
                        assetModelService.getDefaultConsumables(modelId),
                    ]);
                    setAssetModel(modelData);
                    setExistingDefaultStockModelIds(new Set((defStock || []).map(item => item.stock_item_model)));
                    setExistingDefaultConsumableModelIds(new Set((defCons || []).map(item => item.consumable_model)));
                }
            } catch (err) {
                setError(t('defaultCompositionSelect.fetchInitialError'));
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [modelId]);

    useEffect(() => {
        const fetchStockModels = async () => {
            if (!selectedStockItemTypeId) {
                setStockItemModels([]);
                setSelectedStockItemModelId('');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const modelsData = await stockItemModelService.getByStockItemType(selectedStockItemTypeId);
                const models = modelsData?.results || modelsData || [];
                setStockItemModels(Array.isArray(models) ? models : []);
                setSelectedStockItemModelId('');
            } catch (err) {
                setError(t('defaultCompositionSelect.fetchStockModelsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchStockModels();
    }, [selectedStockItemTypeId]);

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
                setError(t('defaultCompositionSelect.fetchConsumableModelsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchConsumableModels();
    }, [selectedConsumableTypeId]);

    useEffect(() => {
        const fetchModels = async () => {
            if (!selectedTypeId) {
                setAssetModels([]);
                setSelectedModelIds([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const modelsData = await assetModelService.getByAssetType(selectedTypeId);
                const models = modelsData?.results || modelsData || [];
                setAssetModels(Array.isArray(models) ? models : []);
                setSelectedModelIds([]);
            } catch (err) {
                setError(t('defaultCompositionSelect.fetchAssetModelsError'));
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
        return assetModels.filter((m) => setIds.has(m.asset_model_id));
    }, [assetModels, selectedModelIds]);

    const addDefaultStockItemToSelectedModels = async () => {
        const targetIds = modelId ? [Number(modelId)] : selectedModelIds;
        if (!selectedStockItemModelId || targetIds.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            for (const assetModelId of targetIds) {
                await assetModelService.addDefaultStockItem(assetModelId, Number(selectedStockItemModelId), stockItemQuantity);
            }
            if (modelId) {
                setExistingDefaultStockModelIds(prev => new Set([...prev, Number(selectedStockItemModelId)]));
            }
            setSelectedStockItemModelId('');
            setStockItemQuantity(1);
        } catch (err) {
            setError(t('defaultCompositionSelect.insertStockError'));
        } finally {
            setLoading(false);
        }
    };

    const addDefaultConsumableToSelectedModels = async () => {
        const targetIds = modelId ? [Number(modelId)] : selectedModelIds;
        if (!selectedConsumableModelId || targetIds.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            for (const assetModelId of targetIds) {
                await assetModelService.addDefaultConsumable(assetModelId, Number(selectedConsumableModelId), consumableQuantity);
            }
            if (modelId) {
                setExistingDefaultConsumableModelIds(prev => new Set([...prev, Number(selectedConsumableModelId)]));
            }
            setSelectedConsumableModelId('');
            setConsumableQuantity(1);
        } catch (err) {
            setError(t('defaultCompositionSelect.insertConsumableError'));
        } finally {
            setLoading(false);
        }
    };

    const visibleStockItemTypes = useMemo(() => {
        if (!modelId) return stockItemTypes;
        return stockItemTypes.filter(type => {
            const modelsForType = allStockItemModels.filter(m => m.stock_item_type === type.stock_item_type_id);
            if (modelsForType.length === 0) return false;
            return modelsForType.some(m => !existingDefaultStockModelIds.has(m.stock_item_model_id));
        });
    }, [stockItemTypes, allStockItemModels, existingDefaultStockModelIds, modelId]);

    const visibleConsumableTypes = useMemo(() => {
        if (!modelId) return consumableTypes;
        return consumableTypes.filter(type => {
            const modelsForType = allConsumableModels.filter(m => m.consumable_type === type.consumable_type_id);
            if (modelsForType.length === 0) return false;
            return modelsForType.some(m => !existingDefaultConsumableModelIds.has(m.consumable_model_id));
        });
    }, [consumableTypes, allConsumableModels, existingDefaultConsumableModelIds, modelId]);

    const goBack = () => {
        if (modelId) {
            navigate(`/dashboard/assets/models/${modelId}/compatibility?typeId=${typeId}`);
            return;
        }
        if (selectedTypeId) {
            navigate(`/dashboard/assets/models?typeId=${selectedTypeId}`);
            return;
        }
        navigate('/dashboard/assets/models');
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assets.title')}</h1>
                <p className="page-subtitle">
                    {t('defaultCompositionSelect.defaultComposition')} {assetModel ? `• ${assetModel.model_name}` : `• ${t('defaultCompositionSelect.selectTypeModelDesc')}`}
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

            {!modelId && (
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
                            title={t('common.back')}
                            aria-label={t('common.back')}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>

                        <div style={{ minWidth: '260px' }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                {t('defaultCompositionSelect.assetType')}
                            </label>
                            <select
                                value={selectedTypeId}
                                onChange={(e) => setSelectedTypeId(e.target.value)}
                                style={{ width: '100%', padding: 'var(--space-2)' }}
                                disabled={loading}
                            >
                                <option value="">{t('defaultCompositionSelect.selectType')}</option>
                                {assetTypes.map((t) => (
                                    <option key={t.asset_type_id} value={t.asset_type_id}>
                                        {t.asset_type_label || `Type ${t.asset_type_id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {modelId && (
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
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
                            title={t('defaultCompositionSelect.backToCompatibility')}
                            aria-label={t('defaultCompositionSelect.backToCompatibility')}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <div style={{ fontWeight: '500' }}>
                            {t('defaultCompositionSelect.addingTo')} <span style={{ color: 'var(--color-primary)' }}>{assetModel?.model_name}</span>
                        </div>
                    </div>
                </div>
            )}

            {(selectedTypeId || modelId) && (
                <div style={{ display: 'grid', gridTemplateColumns: modelId ? '1fr' : '1fr 1fr', gap: 'var(--space-6)', flex: 1, minHeight: 0 }}>
                    {!modelId && (
                        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div className="card-header" style={{
                                padding: 'var(--space-4)',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--color-bg-secondary)'
                            }}>
                                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('defaultCompositionSelect.targetAssetModels')}</h2>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                    {selectedModelIds.length} {t('defaultCompositionSelect.selected')}
                                </span>
                            </div>

                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {assetModels.map((m) => (
                                    <label
                                        key={m.asset_model_id}
                                        style={{
                                            padding: 'var(--space-3) var(--space-4)',
                                            display: 'flex',
                                            gap: 'var(--space-3)',
                                            alignItems: 'center',
                                            borderBottom: '1px solid var(--color-border)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedModelIds.includes(m.asset_model_id)}
                                            onChange={() => toggleModel(m.asset_model_id)}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '500' }}>{m.model_name || `Model ${m.asset_model_id}`}</span>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code || ''}</span>
                                        </div>
                                    </label>
                                ))}

                                {assetModels.length === 0 && !loading && (
                                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                        {t('defaultCompositionSelect.noModelsForType')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', minHeight: 0 }}>
                        <div className="card" style={{ padding: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>{t('defaultCompositionSelect.addDefaultStockModels')}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                        {t('defaultCompositionSelect.stockItemType')}
                                    </label>
                                    <select
                                        value={selectedStockItemTypeId}
                                        onChange={(e) => setSelectedStockItemTypeId(e.target.value)}
                                        style={{ width: '100%', padding: 'var(--space-2)' }}
                                        disabled={loading}
                                    >
                                        <option value="">{t('defaultCompositionSelect.selectType')}</option>
                                        {visibleStockItemTypes.map((t) => (
                                            <option key={t.stock_item_type_id} value={t.stock_item_type_id}>
                                                {t.stock_item_type_label || `${t('defaultCompositionSelect.type')} ${t.stock_item_type_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                        {t('defaultCompositionSelect.stockItemModel')}
                                    </label>
                                    <select
                                        value={selectedStockItemModelId}
                                        onChange={(e) => setSelectedStockItemModelId(e.target.value)}
                                        style={{ width: '100%', padding: 'var(--space-2)' }}
                                        disabled={loading || !selectedStockItemTypeId}
                                    >
                                        <option value="">{t('defaultCompositionSelect.selectModel')}</option>
                                        {stockItemModels
                                            .filter(m => !existingDefaultStockModelIds.has(m.stock_item_model_id))
                                            .map((m) => (
                                                <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                                    {m.model_name || `Model ${m.stock_item_model_id}`}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                        {t('defaultCompositionSelect.qty')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={stockItemQuantity}
                                        onChange={(e) => setStockItemQuantity(Number(e.target.value))}
                                        style={{ width: '100%', padding: 'var(--space-2)' }}
                                    />
                                </div>
                                <button
                                    onClick={addDefaultStockItemToSelectedModels}
                                    disabled={!selectedStockItemModelId || (modelId ? false : selectedModelIds.length === 0) || loading}
                                    style={{
                                        padding: 'var(--space-2) var(--space-3)',
                                        border: 'none',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: (!selectedStockItemModelId || (modelId ? false : selectedModelIds.length === 0) || loading) ? 'not-allowed' : 'pointer',
                                        opacity: (!selectedStockItemModelId || (modelId ? false : selectedModelIds.length === 0) || loading) ? 0.7 : 1,
                                        width: '100%'
                                    }}
                                    title={(!selectedStockItemModelId || (modelId ? false : selectedModelIds.length === 0)) ? t('defaultCompositionSelect.selectStockModel') : undefined}
                                >
                                    {t('defaultCompositionSelect.addToSelected')}
                                </button>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>{t('defaultCompositionSelect.addDefaultConsumableModels')}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                        {t('defaultCompositionSelect.consumableType')}
                                    </label>
                                    <select
                                        value={selectedConsumableTypeId}
                                        onChange={(e) => setSelectedConsumableTypeId(e.target.value)}
                                        style={{ width: '100%', padding: 'var(--space-2)' }}
                                        disabled={loading}
                                    >
                                        <option value="">{t('defaultCompositionSelect.selectType')}</option>
                                        {visibleConsumableTypes.map((t) => (
                                            <option key={t.consumable_type_id} value={t.consumable_type_id}>
                                                {t.consumable_type_label || `${t('defaultCompositionSelect.type')} ${t.consumable_type_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                        {t('defaultCompositionSelect.consumableModel')}
                                    </label>
                                    <select
                                        value={selectedConsumableModelId}
                                        onChange={(e) => setSelectedConsumableModelId(e.target.value)}
                                        style={{ width: '100%', padding: 'var(--space-2)' }}
                                        disabled={loading || !selectedConsumableTypeId}
                                    >
                                        <option value="">{t('defaultCompositionSelect.selectModel')}</option>
                                        {consumableModels
                                            .filter(m => !existingDefaultConsumableModelIds.has(m.consumable_model_id))
                                            .map((m) => (
                                                <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                                    {m.model_name || `Model ${m.consumable_model_id}`}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                        {t('defaultCompositionSelect.qty')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={consumableQuantity}
                                        onChange={(e) => setConsumableQuantity(Number(e.target.value))}
                                        style={{ width: '100%', padding: 'var(--space-2)' }}
                                    />
                                </div>
                                <button
                                    onClick={addDefaultConsumableToSelectedModels}
                                    disabled={!selectedConsumableModelId || (modelId ? false : selectedModelIds.length === 0) || loading}
                                    style={{
                                        padding: 'var(--space-2) var(--space-3)',
                                        border: 'none',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: (!selectedConsumableModelId || (modelId ? false : selectedModelIds.length === 0) || loading) ? 'not-allowed' : 'pointer',
                                        opacity: (!selectedConsumableModelId || (modelId ? false : selectedModelIds.length === 0) || loading) ? 0.7 : 1,
                                        width: '100%'
                                    }}
                                    title={(!selectedConsumableModelId || (modelId ? false : selectedModelIds.length === 0)) ? t('defaultCompositionSelect.selectConsumableModel') : undefined}
                                >
                                    {t('defaultCompositionSelect.addToSelected')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetModelDefaultCompositionSelectPage;
