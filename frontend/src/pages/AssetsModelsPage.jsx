import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assetAttributeDefinitionService, assetBrandService, assetModelAttributeService, assetModelService, assetTypeService, authService } from '../services/api';

const AssetsModelsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeId = searchParams.get('typeId');

    const formatModelLabel = (model) => {
        return [model?.brand_name, model?.model_name].filter(Boolean).join(' ');
    };

    const [assetType, setAssetType] = useState(null);
    const [assetModels, setAssetModels] = useState([]);
    const [selectedAssetModel, setSelectedAssetModel] = useState(null);
    const [assetBrands, setAssetBrands] = useState([]);
    const [assetAttributeDefinitions, setAssetAttributeDefinitions] = useState([]);
    const [assetModelAttributes, setAssetModelAttributes] = useState([]);
    const [showModelForm, setShowModelForm] = useState(false);
    const [modelSaving, setModelSaving] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [modelForm, setModelForm] = useState({
        asset_brand: '',
        model_name: '',
        model_code: ''
    });
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [modelAttributeForm, setModelAttributeForm] = useState({
        asset_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [showBrandForm, setShowBrandForm] = useState(false);
    const [brandSaving, setBrandSaving] = useState(false);
    const [brandForm, setBrandForm] = useState({
        brand_name: '',
        brand_photo: null
    });
    const [brandPhotoPreview, setBrandPhotoPreview] = useState(null);

    const toBrandCode = (name) => {
        const code = String(name || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_\-]/g, '');
        return code.slice(0, 16);
    };

    useEffect(() => {
        if (!typeId) return;
        fetchTypeAndModels(typeId);
    }, [typeId]);

    useEffect(() => {
        fetchAssetAttributeDefinitions();
        fetchAssetBrands();
    }, []);

    useEffect(() => {
        if (!selectedAssetModel) {
            setAssetModelAttributes([]);
            setShowModelAttributeForm(false);
            setModelAttributeForm({
                asset_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            return;
        }
        fetchAssetModelAttributes(selectedAssetModel.asset_model_id);
    }, [selectedAssetModel]);

    const fetchTypeAndModels = async (assetTypeId) => {
        setLoading(true);
        setError(null);
        try {
            const [type, models] = await Promise.all([
                assetTypeService.getById(assetTypeId),
                assetModelService.getByAssetType(assetTypeId),
            ]);
            setAssetType(type || null);
            setAssetModels(Array.isArray(models) ? models : []);
            setSelectedAssetModel(null);
        } catch (err) {
            setError('Failed to fetch asset models: ' + err.message);
            setAssetType(null);
            setAssetModels([]);
            setSelectedAssetModel(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBrandInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            setBrandForm((prev) => ({ ...prev, [name]: file }));
            setBrandPhotoPreview(URL.createObjectURL(file));
        } else {
            setBrandForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleBrandSubmit = async (e) => {
        e.preventDefault();
        if (!authService.isSuperuser()) return;
        const brandName = brandForm.brand_name?.trim();
        if (!brandName) {
            setError('Please enter a brand name');
            return;
        }

        setBrandSaving(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('brand_name', brandName);
            formData.append('brand_code', toBrandCode(brandName));
            formData.append('is_active', 'true');
            if (brandForm.brand_photo) {
                formData.append('brand_photo', brandForm.brand_photo);
            }
            await assetBrandService.create(formData);
            setBrandForm({ brand_name: '', brand_photo: null });
            setBrandPhotoPreview(null);
            setShowBrandForm(false);
            await fetchAssetBrands();
        } catch (err) {
            setError('Failed to create asset brand: ' + (err.response?.data?.error || err.message));
        } finally {
            setBrandSaving(false);
        }
    };

    const fetchAssetAttributeDefinitions = async () => {
        try {
            const data = await assetAttributeDefinitionService.getAll();
            setAssetAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setAssetAttributeDefinitions([]);
        }
    };

    const fetchAssetBrands = async () => {
        try {
            const data = await assetBrandService.getAll();
            setAssetBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            setAssetBrands([]);
        }
    };

    const fetchAssetModelAttributes = async (assetModelId) => {
        try {
            const data = await assetModelAttributeService.getByAssetModel(assetModelId);
            setAssetModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch asset model attributes: ' + err.message);
            setAssetModelAttributes([]);
        }
    };

    const handleModelAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModelAttributeForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleModelInputChange = (e) => {
        const { name, value } = e.target;
        setModelForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        if (!typeId) return;
        if (!modelForm.asset_brand) {
            setError('Please select a brand');
            return;
        }

        setModelSaving(true);
        setError(null);
        try {
            const payload = {
                asset_type: Number(typeId),
                asset_brand: Number(modelForm.asset_brand),
                model_name: modelForm.model_name || null,
                model_code: modelForm.model_code || null,
            };
            if (editingModel) {
                await assetModelService.update(editingModel.asset_model_id, payload);
            } else {
                await assetModelService.create(payload);
            }
            setModelForm({ asset_brand: '', model_name: '', model_code: '' });
            setShowModelForm(false);
            setEditingModel(null);
            await fetchTypeAndModels(typeId);
        } catch (err) {
            setError(`Failed to ${editingModel ? 'update' : 'create'} asset model: ` + (err.response?.data?.error || err.message));
        } finally {
            setModelSaving(false);
        }
    };

    const handleEditModel = (model) => {
        setEditingModel(model);
        setModelForm({
            asset_brand: model.asset_brand,
            model_name: model.model_name || '',
            model_code: model.model_code || ''
        });
        setShowModelForm(true);
    };

    const handleCancelModelForm = () => {
        setShowModelForm(false);
        setEditingModel(null);
        setModelForm({ asset_brand: '', model_name: '', model_code: '' });
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssetModel) {
            setError('Please select an asset model first');
            return;
        }
        if (!modelAttributeForm.asset_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                asset_model: selectedAssetModel.asset_model_id,
                asset_attribute_definition: Number(modelAttributeForm.asset_attribute_definition),
                value_string: modelAttributeForm.value_string || null,
                value_number: modelAttributeForm.value_number ? Number(modelAttributeForm.value_number) : null,
                value_bool: modelAttributeForm.value_bool,
                value_date: modelAttributeForm.value_date || null
            };
            await assetModelAttributeService.create(payload);
            setModelAttributeForm({
                asset_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowModelAttributeForm(false);
            await fetchAssetModelAttributes(selectedAssetModel.asset_model_id);
        } catch (err) {
            setError('Failed to add model attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModelAttribute = async (assetModelId, definitionId) => {
        if (window.confirm('Remove this attribute value from the asset model?')) {
            try {
                await assetModelAttributeService.delete(assetModelId, definitionId);
                if (selectedAssetModel) {
                    await fetchAssetModelAttributes(selectedAssetModel.asset_model_id);
                }
            } catch (err) {
                setError('Failed to remove asset model attribute: ' + err.message);
            }
        }
    };

    const definitionLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(assetAttributeDefinitions) ? assetAttributeDefinitions : []).forEach((d) => {
            map.set(d.asset_attribute_definition_id, d);
        });
        return map;
    }, [assetAttributeDefinitions]);

    const availableAssetAttributeDefinitions = useMemo(() => {
        if (!selectedAssetModel) return assetAttributeDefinitions;
        const used = new Set((Array.isArray(assetModelAttributes) ? assetModelAttributes : []).map((a) => a.asset_attribute_definition));
        return (Array.isArray(assetAttributeDefinitions) ? assetAttributeDefinitions : []).filter((d) => !used.has(d.asset_attribute_definition_id));
    }, [assetAttributeDefinitions, assetModelAttributes, selectedAssetModel]);

    const goBack = () => {
        navigate('/dashboard/assets/types');
    };

    const goToInstances = (model) => {
        navigate(`/dashboard/assets/instances?typeId=${typeId}&modelId=${model.asset_model_id}`);
    };

    const goToCompatibility = (model) => {
        navigate(`/dashboard/assets/models/${model.asset_model_id}/compatibility?typeId=${typeId}`);
    };

    const goToDefaultConfiguration = (model) => {
        navigate(`/dashboard/assets/models/${model.asset_model_id}/default-composition?typeId=${typeId}`);
    };

    if (!typeId) {
        return (
            <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h1 className="page-title">Assets</h1>
                    <p className="page-subtitle">Select a type first</p>
                </div>

                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <button
                        className="btn"
                        onClick={goBack}
                        style={{
                            padding: 'var(--space-2) var(--space-4)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            width: 'fit-content'
                        }}
                        title="Back to types"
                        aria-label="Back to types"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Assets</h1>
                <p className="page-subtitle">Select a model{assetType?.asset_type_label ? ` for ${assetType.asset_type_label}` : ''}</p>
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
                                title="Back"
                                aria-label="Back"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Models</h2>
                        </div>
                        {authService.isSuperuser() && (
                            <button
                                onClick={() => {
                                    setEditingModel(null);
                                    setModelForm({ asset_brand: '', model_name: '', model_code: '' });
                                    setShowModelForm((v) => !v);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-size-lg)',
                                    color: 'var(--color-primary)',
                                    padding: '0 var(--space-2)'
                                }}
                                title="Add Model"
                            >
                                +
                            </button>
                        )}
                    </div>

                    {showModelForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <h3 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>{editingModel ? 'Edit Model' : 'Add New Model'}</h3>
                            <form onSubmit={handleModelSubmit}>
                                <select
                                    name="asset_brand"
                                    value={modelForm.asset_brand}
                                    onChange={handleModelInputChange}
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                >
                                    <option value="">Select brand...</option>
                                    {assetBrands.map((b) => (
                                        <option key={b.asset_brand_id} value={b.asset_brand_id}>
                                            {b.brand_name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="model_name"
                                    value={modelForm.model_name}
                                    onChange={handleModelInputChange}
                                    placeholder="Model Name"
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <input
                                    type="text"
                                    name="model_code"
                                    value={modelForm.model_code}
                                    onChange={handleModelInputChange}
                                    placeholder="Model Code"
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button type="submit" disabled={modelSaving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>
                                        {editingModel ? 'Update' : 'Save'}
                                    </button>
                                    <button type="button" onClick={handleCancelModelForm} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {assetModels.map((model) => (
                            <div
                                key={model.asset_model_id}
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--color-border)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{formatModelLabel(model) || `Model ${model.asset_model_id}`}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{model.model_code}</span>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    {authService.isSuperuser() && (
                                        <button
                                            onClick={() => handleEditModel(model)}
                                            style={{
                                                padding: 'var(--space-1) var(--space-2)',
                                                border: '1px solid var(--color-border)',
                                                background: 'var(--color-bg-tertiary)',
                                                color: 'var(--color-primary)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer'
                                            }}
                                            title="Edit model"
                                        >
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedAssetModel(model)}
                                        style={{
                                            padding: 'var(--space-1) var(--space-2)',
                                            border: '1px solid var(--color-border)',
                                            background: selectedAssetModel?.asset_model_id === model.asset_model_id ? 'var(--color-bg-secondary)' : 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Attributes
                                    </button>
                                    <button
                                        onClick={() => goToCompatibility(model)}
                                        style={{
                                            padding: 'var(--space-1) var(--space-2)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Compatibility
                                    </button>
                                    <button
                                        onClick={() => goToDefaultConfiguration(model)}
                                        style={{
                                            padding: 'var(--space-1) var(--space-2)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Default configuration
                                    </button>
                                    <button
                                        onClick={() => goToInstances(model)}
                                        style={{
                                            padding: 'var(--space-1) var(--space-2)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Instances
                                    </button>
                                </div>
                            </div>
                        ))}

                        {assetModels.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No models.
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>
                            Model Attributes {selectedAssetModel ? `• ${formatModelLabel(selectedAssetModel) || selectedAssetModel.model_name || ''}` : ''}
                        </h2>
                        <button
                            onClick={() => setShowModelAttributeForm((v) => !v)}
                            disabled={!selectedAssetModel}
                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: selectedAssetModel ? 'pointer' : 'not-allowed', opacity: selectedAssetModel ? 1 : 0.6 }}
                        >
                            + Add Value
                        </button>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-4)' }}>
                        {!selectedAssetModel ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Select a model to view or add values.</div>
                        ) : (
                            <>
                                {showModelAttributeForm && (
                                    <form onSubmit={handleModelAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                        <select
                                            name="asset_attribute_definition"
                                            value={modelAttributeForm.asset_attribute_definition}
                                            onChange={handleModelAttributeInputChange}
                                            required
                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                        >
                                            <option value="">Select attribute definition...</option>
                                            {availableAssetAttributeDefinitions.map((def) => (
                                                <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                    {def.description || `Attribute ${def.asset_attribute_definition_id}`}
                                                </option>
                                            ))}
                                        </select>
                                        {(() => {
                                            const selectedDef = definitionLookup.get(Number(modelAttributeForm.asset_attribute_definition));
                                            const dataType = selectedDef?.data_type?.toLowerCase();
                                            if (dataType === 'number') {
                                                return (
                                                    <input
                                                        type="number"
                                                        name="value_number"
                                                        placeholder="Number value"
                                                        value={modelAttributeForm.value_number}
                                                        onChange={handleModelAttributeInputChange}
                                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                    />
                                                );
                                            }
                                            if (dataType === 'bool' || dataType === 'boolean') {
                                                return (
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                        <input
                                                            type="checkbox"
                                                            name="value_bool"
                                                            checked={modelAttributeForm.value_bool}
                                                            onChange={handleModelAttributeInputChange}
                                                        />
                                                        True
                                                    </label>
                                                );
                                            }
                                            if (dataType === 'date') {
                                                return (
                                                    <input
                                                        type="date"
                                                        name="value_date"
                                                        value={modelAttributeForm.value_date}
                                                        onChange={handleModelAttributeInputChange}
                                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                    />
                                                );
                                            }
                                            return (
                                                <input
                                                    type="text"
                                                    name="value_string"
                                                    placeholder="String value"
                                                    value={modelAttributeForm.value_string}
                                                    onChange={handleModelAttributeInputChange}
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                />
                                            );
                                        })()}
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                            <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                            <button type="button" onClick={() => setShowModelAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                        </div>
                                    </form>
                                )}

                                {assetModelAttributes.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>No model attribute values.</div>
                                ) : (
                                    assetModelAttributes.map((attr) => {
                                        const definition = attr.definition || definitionLookup.get(attr.asset_attribute_definition);
                                        const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                        return (
                                            <div key={`${attr.asset_model}-${attr.asset_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.asset_attribute_definition}`}</div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteModelAttribute(attr.asset_model, attr.asset_attribute_definition)}
                                                    style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </>
                        )}
                    </div>
                </div>

                {authService.isSuperuser() && (
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                        <div className="card-header" style={{
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'var(--color-bg-secondary)'
                        }}>
                            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Brands</h2>
                            <button
                                onClick={() => setShowBrandForm((v) => !v)}
                                style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                title="Add Brand"
                            >
                                + Add Brand
                            </button>
                        </div>

                        <div style={{ padding: 'var(--space-4)' }}>
                            {showBrandForm && (
                                <form onSubmit={handleBrandSubmit}>
                                    <input
                                        type="text"
                                        name="brand_name"
                                        value={brandForm.brand_name}
                                        onChange={handleBrandInputChange}
                                        placeholder="Brand Name"
                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                    />
                                    <input
                                        type="file"
                                        name="brand_photo"
                                        accept="image/*"
                                        onChange={handleBrandInputChange}
                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                    />
                                    {brandPhotoPreview && (
                                        <div style={{ marginBottom: 'var(--space-2)' }}>
                                            <img src={brandPhotoPreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: 'var(--radius-sm)' }} />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button type="submit" disabled={brandSaving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                        <button type="button" onClick={() => setShowBrandForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                    </div>
                                </form>
                            )}

                            {!showBrandForm && (
                                <div style={{ color: 'var(--color-text-secondary)' }}>
                                    Add brands to populate the brand selector when creating models.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetsModelsPage;
