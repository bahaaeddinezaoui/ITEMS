import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { consumableAttributeDefinitionService, consumableBrandService, consumableModelAttributeService, consumableModelService, consumableTypeService } from '../services/api';

const ConsumablesModelsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeId = searchParams.get('typeId');

    const [consumableType, setConsumableType] = useState(null);
    const [consumableModels, setConsumableModels] = useState([]);
    const [selectedConsumableModel, setSelectedConsumableModel] = useState(null);
    const [consumableBrands, setConsumableBrands] = useState([]);
    const [consumableAttributeDefinitions, setConsumableAttributeDefinitions] = useState([]);
    const [consumableModelAttributes, setConsumableModelAttributes] = useState([]);
    const [showModelForm, setShowModelForm] = useState(false);
    const [modelSaving, setModelSaving] = useState(false);
    const [modelForm, setModelForm] = useState({
        consumable_brand: '',
        model_name: '',
        model_code: ''
    });
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [modelAttributeForm, setModelAttributeForm] = useState({
        consumable_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!typeId) return;
        fetchTypeAndModels(typeId);
    }, [typeId]);

    useEffect(() => {
        fetchConsumableAttributeDefinitions();
        fetchConsumableBrands();
    }, []);

    useEffect(() => {
        if (!selectedConsumableModel) {
            setConsumableModelAttributes([]);
            setShowModelAttributeForm(false);
            setModelAttributeForm({
                consumable_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            return;
        }
        fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
    }, [selectedConsumableModel]);

    const fetchTypeAndModels = async (consumableTypeId) => {
        setLoading(true);
        setError(null);
        try {
            const [types, models] = await Promise.all([
                consumableTypeService.getAll(),
                consumableModelService.getByConsumableType(consumableTypeId),
            ]);
            const typesArr = Array.isArray(types) ? types : [];
            const foundType = typesArr.find((t) => String(t.consumable_type_id) === String(consumableTypeId)) || null;
            setConsumableType(foundType);
            setConsumableModels(Array.isArray(models) ? models : []);
            setSelectedConsumableModel(null);
        } catch (err) {
            setError('Failed to fetch consumable models: ' + err.message);
            setConsumableType(null);
            setConsumableModels([]);
            setSelectedConsumableModel(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchConsumableAttributeDefinitions = async () => {
        try {
            const data = await consumableAttributeDefinitionService.getAll();
            setConsumableAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setConsumableAttributeDefinitions([]);
        }
    };

    const fetchConsumableBrands = async () => {
        try {
            const data = await consumableBrandService.getAll();
            setConsumableBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            setConsumableBrands([]);
        }
    };

    const fetchConsumableModelAttributes = async (consumableModelId) => {
        try {
            const data = await consumableModelAttributeService.getByConsumableModel(consumableModelId);
            setConsumableModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch consumable model attributes: ' + err.message);
            setConsumableModelAttributes([]);
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
        if (!modelForm.consumable_brand) {
            setError('Please select a brand');
            return;
        }

        setModelSaving(true);
        setError(null);
        try {
            const payload = {
                consumable_type: Number(typeId),
                consumable_brand: Number(modelForm.consumable_brand),
                model_name: modelForm.model_name || null,
                model_code: modelForm.model_code || null,
            };
            await consumableModelService.create(payload);
            setModelForm({ consumable_brand: '', model_name: '', model_code: '' });
            setShowModelForm(false);
            await fetchTypeAndModels(typeId);
        } catch (err) {
            setError('Failed to create consumable model: ' + (err.response?.data?.error || err.message));
        } finally {
            setModelSaving(false);
        }
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumableModel) {
            setError('Please select a consumable model first');
            return;
        }
        if (!modelAttributeForm.consumable_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                consumable_model: selectedConsumableModel.consumable_model_id,
                consumable_attribute_definition: Number(modelAttributeForm.consumable_attribute_definition),
                value_string: modelAttributeForm.value_string || null,
                value_number: modelAttributeForm.value_number ? Number(modelAttributeForm.value_number) : null,
                value_bool: modelAttributeForm.value_bool,
                value_date: modelAttributeForm.value_date || null
            };
            await consumableModelAttributeService.create(payload);
            setModelAttributeForm({
                consumable_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowModelAttributeForm(false);
            await fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
        } catch (err) {
            setError('Failed to add model attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModelAttribute = async (consumableModelId, definitionId) => {
        if (window.confirm('Remove this attribute value from the consumable model?')) {
            try {
                await consumableModelAttributeService.delete(consumableModelId, definitionId);
                if (selectedConsumableModel) {
                    await fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
                }
            } catch (err) {
                setError('Failed to remove consumable model attribute: ' + err.message);
            }
        }
    };

    const definitionLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(consumableAttributeDefinitions) ? consumableAttributeDefinitions : []).forEach((d) => {
            map.set(d.consumable_attribute_definition_id, d);
        });
        return map;
    }, [consumableAttributeDefinitions]);

    const availableConsumableAttributeDefinitions = useMemo(() => {
        if (!selectedConsumableModel) return consumableAttributeDefinitions;
        const used = new Set((Array.isArray(consumableModelAttributes) ? consumableModelAttributes : []).map((a) => a.consumable_attribute_definition));
        return (Array.isArray(consumableAttributeDefinitions) ? consumableAttributeDefinitions : []).filter((d) => !used.has(d.consumable_attribute_definition_id));
    }, [consumableAttributeDefinitions, consumableModelAttributes, selectedConsumableModel]);

    const goBack = () => {
        navigate('/dashboard/consumables/types');
    };

    const goToInstances = (model) => {
        navigate(`/dashboard/consumables/instances?typeId=${typeId}&modelId=${model.consumable_model_id}`);
    };

    const goToCompatibility = (model) => {
        navigate(`/dashboard/consumables/models/${model.consumable_model_id}/compatibility?typeId=${typeId}`);
    };

    if (!typeId) {
        return (
            <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h1 className="page-title">Consumables</h1>
                    <p className="page-subtitle">Select a type first</p>
                </div>

                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <button
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
                <h1 className="page-title">Consumables</h1>
                <p className="page-subtitle">Select a model{consumableType?.consumable_type_label ? ` for ${consumableType.consumable_type_label}` : ''}</p>
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
                        <button
                            onClick={() => setShowModelForm((v) => !v)}
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
                    </div>

                    {showModelForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <form onSubmit={handleModelSubmit}>
                                <select
                                    name="consumable_brand"
                                    value={modelForm.consumable_brand}
                                    onChange={handleModelInputChange}
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                >
                                    <option value="">Select brand...</option>
                                    {consumableBrands.map((b) => (
                                        <option key={b.consumable_brand_id} value={b.consumable_brand_id}>
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
                                    <button type="submit" disabled={modelSaving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                    <button type="button" onClick={() => setShowModelForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {consumableModels.map((model) => (
                            <div
                                key={model.consumable_model_id}
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--color-border)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{model.model_name}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{model.model_code}</span>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button
                                        onClick={() => setSelectedConsumableModel(model)}
                                        style={{
                                            padding: 'var(--space-1) var(--space-2)',
                                            border: '1px solid var(--color-border)',
                                            background: selectedConsumableModel?.consumable_model_id === model.consumable_model_id ? 'var(--color-bg-secondary)' : 'var(--color-bg-tertiary)',
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

                        {consumableModels.length === 0 && !loading && (
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
                            Model Attributes {selectedConsumableModel ? `• ${selectedConsumableModel.model_name}` : ''}
                        </h2>
                        <button
                            onClick={() => setShowModelAttributeForm((v) => !v)}
                            disabled={!selectedConsumableModel}
                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: selectedConsumableModel ? 'pointer' : 'not-allowed', opacity: selectedConsumableModel ? 1 : 0.6 }}
                        >
                            + Add Value
                        </button>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-4)' }}>
                        {!selectedConsumableModel ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Select a model to view or add values.</div>
                        ) : (
                            <>
                                {showModelAttributeForm && (
                                    <form onSubmit={handleModelAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                        <select
                                            name="consumable_attribute_definition"
                                            value={modelAttributeForm.consumable_attribute_definition}
                                            onChange={handleModelAttributeInputChange}
                                            required
                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                        >
                                            <option value="">Select attribute definition...</option>
                                            {availableConsumableAttributeDefinitions.map((def) => (
                                                <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                    {def.description || `Attribute ${def.consumable_attribute_definition_id}`}
                                                </option>
                                            ))}
                                        </select>
                                        {(() => {
                                            const selectedDef = definitionLookup.get(Number(modelAttributeForm.consumable_attribute_definition));
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

                                {consumableModelAttributes.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>No model attribute values.</div>
                                ) : (
                                    consumableModelAttributes.map((attr) => {
                                        const definition = attr.definition || definitionLookup.get(attr.consumable_attribute_definition);
                                        const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                        return (
                                            <div key={`${attr.consumable_model}-${attr.consumable_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.consumable_attribute_definition}`}</div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteModelAttribute(attr.consumable_model, attr.consumable_attribute_definition)}
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
            </div>
        </div>
    );
};

export default ConsumablesModelsPage;
