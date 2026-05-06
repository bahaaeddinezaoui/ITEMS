import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetModelService, authService, consumableModelService, stockItemModelService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Link2, Wrench, Package } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import SearchableSelect from '../components/SearchableSelect';
import BackButton from '../components/BackButton';
import { SkeletonListRows } from '../components/SkeletonCard';

const AssetModelCompatibilityPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const typeId = searchParams.get('typeId');

    const [assetModel, setAssetModel] = useState(null);

    const [compatibleStockItemModels, setCompatibleStockItemModels] = useState([]);
    const [compatibleConsumableModels, setCompatibleConsumableModels] = useState([]);

    const [allStockItemModels, setAllStockItemModels] = useState([]);
    const [allConsumableModels, setAllConsumableModels] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedStockItemModelId, setSelectedStockItemModelId] = useState('');
    const [selectedConsumableModelId, setSelectedConsumableModelId] = useState('');
    const [showAddStockForm, setShowAddStockForm] = useState(false);
    const [showAddConsumableForm, setShowAddConsumableForm] = useState(false);

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
            const [am, stockCompat, consCompat, allStock, allCons] = await Promise.all([
                assetModelService.getById(modelId),
                assetModelService.getCompatibleStockItemModels(modelId),
                assetModelService.getCompatibleConsumableModels(modelId),
                stockItemModelService.getAll(),
                consumableModelService.getAll(),
            ]);

            setAssetModel(am || null);
            setCompatibleStockItemModels(Array.isArray(stockCompat) ? stockCompat : []);
            setCompatibleConsumableModels(Array.isArray(consCompat) ? consCompat : []);
            setAllStockItemModels(Array.isArray(allStock) ? allStock : []);
            setAllConsumableModels(Array.isArray(allCons) ? allCons : []);
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

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <SkeletonListRows count={8} />
            </div>
        );
    }

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
        border: 'none', background: 'transparent',
        color: 'var(--color-danger, #c33)', cursor: 'pointer',
        padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    const listItemStyle = {
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.1s',
    };

    const emptyStateStyle = {
        padding: 'var(--space-8) var(--space-4)',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)',
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Link2 size={22} style={{ color: 'var(--color-accent-primary)' }} />
                    {t('assetModelCompatibility.compatibility')}
                </h1>
                <p className="page-subtitle">
                    {assetModel?.model_name ? `${assetModel.model_name}` : ''} {assetModel?.brand_name ? `• ${assetModel.brand_name}` : ''}
                </p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee', color: '#c33',
                    padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-4)', border: '1px solid #fcc'
                }}>
                    {error}
                </div>
            )}

            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <BackButton onClick={goBack} />

                    <div style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {compatibleStockItemModels.length + compatibleConsumableModels.length} {t('assetModelCompatibility.models')}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header" style={{
                                padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: 'var(--color-bg-secondary)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Wrench size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assetModelCompatibility.compatibleStockItemModels')}</h2>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{compatibleStockItemModels.length}</span>
                                </div>
                                {isSuperuser && (
                                    <button onClick={() => setShowAddStockForm(true)} style={addItemBtnStyle}>
                                        <Plus size={14} /> {t('assetModelCompatibility.addCompatibleModel')}
                                    </button>
                                )}
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {(Array.isArray(compatibleStockItemModels) ? compatibleStockItemModels : []).map((m) => (
                                    <div key={m.stock_item_model_id} style={listItemStyle}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '500' }}>{m.model_name}</span>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code || '—'}</span>
                                        </div>
                                        {isSuperuser && (
                                            <button onClick={() => removeStockCompatibility(m.stock_item_model_id)} style={removeBtnStyle} title={t('common.remove')} aria-label={t('common.remove')}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {compatibleStockItemModels.length === 0 && (
                                    <div style={emptyStateStyle}>
                                        <Wrench size={32} style={{ opacity: 0.3 }} />
                                        <span>{t('assetModelCompatibility.noCompatibleStockItemModels')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header" style={{
                                padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: 'var(--color-bg-secondary)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Package size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assetModelCompatibility.compatibleConsumableModels')}</h2>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{compatibleConsumableModels.length}</span>
                                </div>
                                {isSuperuser && (
                                    <button onClick={() => setShowAddConsumableForm(true)} style={addItemBtnStyle}>
                                        <Plus size={14} /> {t('assetModelCompatibility.addCompatibleModel')}
                                    </button>
                                )}
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {(Array.isArray(compatibleConsumableModels) ? compatibleConsumableModels : []).map((m) => (
                                    <div key={m.consumable_model_id} style={listItemStyle}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '500' }}>{m.model_name}</span>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code || '—'}</span>
                                        </div>
                                        {isSuperuser && (
                                            <button onClick={() => removeConsumableCompatibility(m.consumable_model_id)} style={removeBtnStyle} title={t('common.remove')} aria-label={t('common.remove')}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {compatibleConsumableModels.length === 0 && (
                                    <div style={emptyStateStyle}>
                                        <Package size={32} style={{ opacity: 0.3 }} />
                                        <span>{t('assetModelCompatibility.noCompatibleConsumableModels')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            {/* Add Compatible Stock Item Model Modal */}
            {showAddStockForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAddStockForm(false); setSelectedStockItemModelId(''); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Plus size={16} /> {t('assetModelCompatibility.addCompatibleModel')}
                                </h3>
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
                                <button type="button" onClick={() => { setShowAddStockForm(false); setSelectedStockItemModelId(''); }} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                                    {t('common.cancel')}
                                </button>
                                <button type="button" onClick={addStockCompatibility} disabled={!selectedStockItemModelId || loading} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
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
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Plus size={16} /> {t('assetModelCompatibility.addCompatibleModel')}
                                </h3>
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
                                <button type="button" onClick={() => { setShowAddConsumableForm(false); setSelectedConsumableModelId(''); }} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                                    {t('common.cancel')}
                                </button>
                                <button type="button" onClick={addConsumableCompatibility} disabled={!selectedConsumableModelId || loading} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
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
