import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetModelService, authService, consumableModelService } from '../services/api';

const ConsumableModelCompatibilityPage = () => {
    const navigate = useNavigate();
    const { modelId } = useParams();
    const [searchParams] = useSearchParams();
    const typeId = searchParams.get('typeId');

    const [consumableModel, setConsumableModel] = useState(null);
    const [compatibleAssetModels, setCompatibleAssetModels] = useState([]);
    const [allAssetModels, setAllAssetModels] = useState([]);

    const [selectedAssetModelId, setSelectedAssetModelId] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isSuperuser = authService.isSuperuser();

    const goBack = () => {
        if (typeId) {
            navigate(`/dashboard/consumables/models?typeId=${typeId}`);
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
                consumableModelService.getById(modelId),
                consumableModelService.getCompatibleAssetModels(modelId),
                assetModelService.getAll(),
            ]);
            setConsumableModel(m || null);
            setCompatibleAssetModels(Array.isArray(compat) ? compat : []);
            setAllAssetModels(Array.isArray(allAssets) ? allAssets : []);
        } catch (err) {
            setError('Failed to fetch compatibility: ' + err.message);
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
            await consumableModelService.addCompatibleAssetModel(modelId, Number(selectedAssetModelId));
            setSelectedAssetModelId('');
            setShowAddForm(false);
            await fetchAll();
        } catch (err) {
            setError('Failed to add compatible asset model: ' + err.message);
        }
    };

    const removeCompatibility = async (assetModelId) => {
        setError(null);
        try {
            await consumableModelService.removeCompatibleAssetModel(modelId, assetModelId);
            await fetchAll();
        } catch (err) {
            setError('Failed to remove compatible asset model: ' + err.message);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Consumables</h1>
                <p className="page-subtitle">Compatibility {consumableModel?.model_name ? `• ${consumableModel.model_name}` : ''}</p>
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
                    title="Back"
                    aria-label="Back"
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
                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Compatible Asset Models</h2>
                    {isSuperuser && !showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        >
                            Add compatible model
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
                                <option value="">Select asset model...</option>
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
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setSelectedAssetModelId('');
                                }}
                                style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                Cancel
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
                            No compatible asset models.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsumableModelCompatibilityPage;
