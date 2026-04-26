import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetModelService, authService, consumableModelService, stockItemModelService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Link2 } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import SearchableSelect from '../components/SearchableSelect';

const AssetModelCompatibilityPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
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
            setError(t('assetModelCompatibility.fetchError') + ': ' + err.message);
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
            setError(t('assetModelCompatibility.addStockError') + ': ' + err.message);
        }
    };

    const removeStockCompatibility = async (stockItemModelId) => {
        setError(null);
        try {
            await assetModelService.removeCompatibleStockItemModel(modelId, stockItemModelId);
            await fetchAll();
        } catch (err) {
            setError(t('assetModelCompatibility.removeStockError') + ': ' + err.message);
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
            setError(t('assetModelCompatibility.addConsumableError') + ': ' + err.message);
        }
    };

    const removeConsumableCompatibility = async (consumableModelId) => {
        setError(null);
        try {
            await assetModelService.removeCompatibleConsumableModel(modelId, consumableModelId);
            await fetchAll();
        } catch (err) {
            setError(t('assetModelCompatibility.removeConsumableError') + ': ' + err.message);
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
            setError(t('assetModelCompatibility.addDefaultStockError') + ': ' + err.message);
        }
    };

    const removeDefaultStockItem = async (id) => {
        setError(null);
        try {
            await assetModelService.removeDefaultStockItem(id);
            await fetchAll();
        } catch (err) {
            setError(t('assetModelCompatibility.removeDefaultStockError') + ': ' + err.message);
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
            setError(t('assetModelCompatibility.addDefaultConsumableError') + ': ' + err.message);
        }
    };

    const removeDefaultConsumable = async (id) => {
        setError(null);
        try {
            await assetModelService.removeDefaultConsumable(id);
            await fetchAll();
        } catch (err) {
            setError(t('assetModelCompatibility.removeDefaultConsumableError') + ': ' + err.message);
        }
    };

    const jumpToDefaultComposition = () => {
        const qs = typeId ? `?typeId=${typeId}` : '';
        navigate(`/dashboard/assets/models/${modelId}/default-composition${qs}`);
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Link2 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assets.title')}</h1>
                <p className="page-subtitle">{t('assetModelCompatibility.compatibility')} {assetModel?.model_name ? `• ${assetModel.model_name}` : ''}</p>
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
                    title={t('common.back')}
                    aria-label={t('common.back')}
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assetModelCompatibility.compatibleStockItemModels')}</h2>
                        {isSuperuser && (
                            <button
                                onClick={() => setShowAddStockForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {t('assetModelCompatibility.addCompatibleModel')}
                            </button>
                        )}
                    </div>


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
                                {t('assetModelCompatibility.noCompatibleStockItemModels')}
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assetModelCompatibility.compatibleConsumableModels')}</h2>
                        {isSuperuser && (
                            <button
                                onClick={() => setShowAddConsumableForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {t('assetModelCompatibility.addCompatibleModel')}
                            </button>
                        )}
                    </div>


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
                                {t('assetModelCompatibility.noCompatibleConsumableModels')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Default Composition Section */}
            <div ref={defaultCompositionRef} />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                {t('assetModelCompatibility.defaultComposition')}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                {t('assetModelCompatibility.defaultCompositionDesc')}
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assetModelCompatibility.defaultStockItems')}</h2>
                        {isSuperuser && (
                            <button
                                onClick={() => setShowAddDefaultStockForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {t('assetModelCompatibility.addDefaultItem')}
                            </button>
                        )}
                    </div>


                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {defaultStockItems.map((item) => (
                            <div key={item.id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{item.stock_item_model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{t('assetModelCompatibility.qty')}: {item.quantity}</span>
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
                                {t('assetModelCompatibility.noDefaultStockItems')}
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assetModelCompatibility.defaultConsumables')}</h2>
                        {isSuperuser && (
                            <button
                                onClick={() => setShowAddDefaultConsumableForm(true)}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {t('assetModelCompatibility.addDefaultItem')}
                            </button>
                        )}
                    </div>


                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {defaultConsumables.map((item) => (
                            <div key={item.id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{item.consumable_model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{t('assetModelCompatibility.qty')}: {item.quantity}</span>
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
                                {t('assetModelCompatibility.noDefaultConsumables')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Compatible Stock Item Model Modal */}
            {showAddStockForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAddStockForm(false); setSelectedStockItemModelId(''); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '90vw', minHeight: '500px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assetModelCompatibility.addCompatibleModel')}</h3>
                                <button className="modal-close" onClick={() => { setShowAddStockForm(false); setSelectedStockItemModelId(''); }}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('assetModelCompatibility.selectStockItemModel')}
                                    </label>
                                    <SearchableSelect
                                        value={selectedStockItemModelId}
                                        onChange={(e) => setSelectedStockItemModelId(e.target.value)}
                                        placeholder={t('assetModelCompatibility.selectStockItemModel')}
                                        options={availableStockItemModels.map((m) => ({
                                            value: m.stock_item_model_id,
                                            label: `${m.brand_name || ''} ${m.model_name || `Model ${m.stock_item_model_id}`}`.trim(),
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddStockForm(false); setSelectedStockItemModelId(''); }}
                                    className="btn btn-secondary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={addStockCompatibility}
                                    disabled={!selectedStockItemModelId || loading}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.add')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Add Compatible Consumable Model Modal */}
            {showAddConsumableForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAddConsumableForm(false); setSelectedConsumableModelId(''); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '90vw', minHeight: '500px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assetModelCompatibility.addCompatibleModel')}</h3>
                                <button className="modal-close" onClick={() => { setShowAddConsumableForm(false); setSelectedConsumableModelId(''); }}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('assetModelCompatibility.selectConsumableModel')}
                                    </label>
                                    <SearchableSelect
                                        value={selectedConsumableModelId}
                                        onChange={(e) => setSelectedConsumableModelId(e.target.value)}
                                        placeholder={t('assetModelCompatibility.selectConsumableModel')}
                                        options={availableConsumableModels.map((m) => ({
                                            value: m.consumable_model_id,
                                            label: `${m.brand_name || ''} ${m.model_name || `Model ${m.consumable_model_id}`}`.trim(),
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddConsumableForm(false); setSelectedConsumableModelId(''); }}
                                    className="btn btn-secondary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={addConsumableCompatibility}
                                    disabled={!selectedConsumableModelId || loading}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.add')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Add Default Stock Item Modal */}
            {showAddDefaultStockForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAddDefaultStockForm(false); setSelectedDefaultStockModelId(''); setDefaultStockQuantity(1); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '90vw', minHeight: '500px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assetModelCompatibility.addDefaultItem')}</h3>
                                <button className="modal-close" onClick={() => { setShowAddDefaultStockForm(false); setSelectedDefaultStockModelId(''); setDefaultStockQuantity(1); }}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('assetModelCompatibility.selectStockItemModel')}
                                    </label>
                                    <SearchableSelect
                                        value={selectedDefaultStockModelId}
                                        onChange={(e) => setSelectedDefaultStockModelId(e.target.value)}
                                        placeholder={t('assetModelCompatibility.selectStockItemModel')}
                                        options={availableDefaultStockModels.map((m) => ({
                                            value: m.stock_item_model_id,
                                            label: `${m.brand_name || ''} ${m.model_name || `Model ${m.stock_item_model_id}`}`.trim(),
                                        }))}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('assetModelCompatibility.qty')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={defaultStockQuantity}
                                        onChange={(e) => setDefaultStockQuantity(Number(e.target.value))}
                                        className="form-input"
                                        style={{ height: '44px', width: '100px' }}
                                        placeholder={t('assetModelCompatibility.qty')}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddDefaultStockForm(false); setSelectedDefaultStockModelId(''); setDefaultStockQuantity(1); }}
                                    className="btn btn-secondary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={addDefaultStockItem}
                                    disabled={!selectedDefaultStockModelId || loading}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.add')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Add Default Consumable Modal */}
            {showAddDefaultConsumableForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAddDefaultConsumableForm(false); setSelectedDefaultConsumableModelId(''); setDefaultConsumableQuantity(1); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '90vw', minHeight: '500px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assetModelCompatibility.addDefaultItem')}</h3>
                                <button className="modal-close" onClick={() => { setShowAddDefaultConsumableForm(false); setSelectedDefaultConsumableModelId(''); setDefaultConsumableQuantity(1); }}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('assetModelCompatibility.selectConsumableModel')}
                                    </label>
                                    <SearchableSelect
                                        value={selectedDefaultConsumableModelId}
                                        onChange={(e) => setSelectedDefaultConsumableModelId(e.target.value)}
                                        placeholder={t('assetModelCompatibility.selectConsumableModel')}
                                        options={availableDefaultConsumableModels.map((m) => ({
                                            value: m.consumable_model_id,
                                            label: `${m.brand_name || ''} ${m.model_name || `Model ${m.consumable_model_id}`}`.trim(),
                                        }))}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        {t('assetModelCompatibility.qty')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={defaultConsumableQuantity}
                                        onChange={(e) => setDefaultConsumableQuantity(Number(e.target.value))}
                                        className="form-input"
                                        style={{ height: '44px', width: '100px' }}
                                        placeholder={t('assetModelCompatibility.qty')}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddDefaultConsumableForm(false); setSelectedDefaultConsumableModelId(''); setDefaultConsumableQuantity(1); }}
                                    className="btn btn-secondary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={addDefaultConsumable}
                                    disabled={!selectedDefaultConsumableModelId || loading}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--space-3) var(--space-6)' }}
                                >
                                    {t('common.add')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default AssetModelCompatibilityPage;
