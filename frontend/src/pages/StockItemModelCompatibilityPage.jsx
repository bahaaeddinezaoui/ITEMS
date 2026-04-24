import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetModelService, authService, consumableModelService, stockItemModelService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Link2 } from 'lucide-react';

const StockItemModelCompatibilityPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const typeId = searchParams.get('typeId');

    const [stockItemModel, setStockItemModel] = useState(null);
    const [compatibleAssetModels, setCompatibleAssetModels] = useState([]);
    const [allAssetModels, setAllAssetModels] = useState([]);

    const [selectedAssetModelId, setSelectedAssetModelId] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isSuperuser = authService.isSuperuser();

    const goBack = () => {
        if (typeId) {
            navigate(`/dashboard/stock-items/models?typeId=${typeId}`);
            return;
        }
        navigate(-1);
    };

    const fetchAll = useCallback(async () => {
        if (!modelId) return;
        setLoading(true);
        setError(null);
        try {
            const [m, compat, allAssets] = await Promise.all([
                stockItemModelService.getById(modelId),
                stockItemModelService.getCompatibleAssetModels(modelId),
                assetModelService.getAll(),
            ]);
            setStockItemModel(m || null);
            setCompatibleAssetModels(Array.isArray(compat) ? compat : []);
            setAllAssetModels(Array.isArray(allAssets) ? allAssets : []);
        } catch (err) {
            setError(t('stockItemModelCompatibility.fetchError') + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [modelId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const compatibleIds = useMemo(() => {
        return new Set((Array.isArray(compatibleAssetModels) ? compatibleAssetModels : []).map((m) => m.asset_model_id));
    }, [compatibleAssetModels]);

    const availableAssetModels = useMemo(() => {
        return (Array.isArray(allAssetModels) ? allAssetModels : []).filter((m) => !compatibleIds.has(m.asset_model_id));
    }, [allAssetModels, compatibleIds]);

    const addCompatibility = async () => {
        if (!selectedAssetModelId) return;
        setError(null);
        try {
            await stockItemModelService.addCompatibleAssetModel(modelId, Number(selectedAssetModelId));
            setSelectedAssetModelId('');
            setShowAddForm(false);
            await fetchAll();
        } catch (err) {
            setError(t('stockItemModelCompatibility.addError') + ': ' + err.message);
        }
    };

    const removeCompatibility = async (assetModelId) => {
        setError(null);
        try {
            await stockItemModelService.removeCompatibleAssetModel(modelId, assetModelId);
            await fetchAll();
        } catch (err) {
            setError(t('stockItemModelCompatibility.removeError') + ': ' + err.message);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Link2 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockItems.title')}</h1>
                <p className="page-subtitle">{t('stockItemModelCompatibility.compatibility')} {stockItemModel?.model_name ? `• ${stockItemModel.model_name}` : ''}</p>
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

            <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="card-header" style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-secondary)'
                }}>
                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('stockItemModelCompatibility.compatibleAssetModels')}</h2>
                    {isSuperuser && !showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        >
                            {t('stockItemModelCompatibility.addCompatibleModel')}
                        </button>
                    )}
                </div>

                {isSuperuser && showAddForm && (
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <select
                                value={selectedAssetModelId}
                                onChange={(e) => setSelectedAssetModelId(e.target.value)}
                                style={{ flex: 1, padding: 'var(--space-2)' }}
                            >
                                <option value="">{t('stockItemModelCompatibility.selectAssetModel')}</option>
                                {availableAssetModels.map((m) => (
                                    <option key={m.asset_model_id} value={m.asset_model_id}>
                                        {m.model_name || `Model ${m.asset_model_id}`}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={addCompatibility}
                                disabled={!selectedAssetModelId || loading}
                                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {t('common.add')}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setSelectedAssetModelId('');
                                }}
                                style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {(Array.isArray(compatibleAssetModels) ? compatibleAssetModels : []).map((m) => (
                        <div key={m.asset_model_id} style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: '500' }}>{m.model_name}</span>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.model_code}</span>
                            </div>
                            {isSuperuser && (
                                <button onClick={() => removeCompatibility(m.asset_model_id)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}>
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}

                    {compatibleAssetModels.length === 0 && !loading && (
                        <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            {t('stockItemModelCompatibility.noCompatibleAssetModels')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockItemModelCompatibilityPage;
