import { useEffect, useState } from 'react';
import { consumableTypeService, consumableModelService, consumableBrandService } from '../services/api';

const ConsumablesPage = () => {
    const [consumableTypes, setConsumableTypes] = useState([]);
    const [consumableBrands, setConsumableBrands] = useState([]);
    const [consumableModels, setConsumableModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [selectedConsumableType, setSelectedConsumableType] = useState(null);
    const [formData, setFormData] = useState({
        consumable_type_label: '',
        consumable_type_code: '',
    });
    const [modelFormData, setModelFormData] = useState({
        model_name: '',
        model_code: '',
        consumable_brand: '',
        consumable_type: '',
        release_year: '',
        discontinued_year: '',
        is_active: true,
        notes: '',
        warranty_expiry_in_months: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConsumableTypes();
        fetchConsumableBrands();
    }, []);

    useEffect(() => {
        if (selectedConsumableType) {
            fetchConsumableModels(selectedConsumableType.consumable_type_id);
        }
    }, [selectedConsumableType]);

    const fetchConsumableTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await consumableTypeService.getAll();
            setConsumableTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch consumable types: ' + err.message);
            setConsumableTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchConsumableBrands = async () => {
        try {
            const data = await consumableBrandService.getAll();
            setConsumableBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch consumable brands:', err);
            setConsumableBrands([]);
        }
    };

    const fetchConsumableModels = async (consumableTypeId) => {
        try {
            const data = await consumableModelService.getByConsumableType(consumableTypeId);
            setConsumableModels(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch consumable models: ' + err.message);
            setConsumableModels([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleModelInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModelFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseInt(value) : '') : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await consumableTypeService.create(formData);
            setFormData({ consumable_type_label: '', consumable_type_code: '' });
            setShowForm(false);
            await fetchConsumableTypes();
        } catch (err) {
            setError('Failed to create consumable type: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumableType) {
            setError('Please select a consumable type first');
            return;
        }
        
        if (!modelFormData.consumable_brand) {
            setError('Please select a brand');
            return;
        }
        
        setSaving(true);
        setError(null);

        try {
            const dataToSubmit = {
                model_name: modelFormData.model_name,
                model_code: modelFormData.model_code,
                consumable_brand: parseInt(modelFormData.consumable_brand),
                consumable_type: selectedConsumableType.consumable_type_id,
                is_active: modelFormData.is_active,
                notes: modelFormData.notes || '',
                release_year: modelFormData.release_year ? parseInt(modelFormData.release_year) : null,
                discontinued_year: modelFormData.discontinued_year ? parseInt(modelFormData.discontinued_year) : null,
                warranty_expiry_in_months: modelFormData.warranty_expiry_in_months ? parseInt(modelFormData.warranty_expiry_in_months) : null,
            };
            
            await consumableModelService.create(dataToSubmit);
            setModelFormData({
                model_name: '',
                model_code: '',
                consumable_brand: '',
                consumable_type: '',
                release_year: '',
                discontinued_year: '',
                is_active: true,
                notes: '',
                warranty_expiry_in_months: '',
            });
            setShowModelForm(false);
            await fetchConsumableModels(selectedConsumableType.consumable_type_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError('Failed to create consumable model: ' + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this consumable type?')) {
            try {
                await consumableTypeService.delete(id);
                if (selectedConsumableType?.consumable_type_id === id) {
                    setSelectedConsumableType(null);
                }
                await fetchConsumableTypes();
            } catch (err) {
                setError('Failed to delete consumable type: ' + err.message);
            }
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm('Are you sure you want to delete this consumable model?')) {
            try {
                await consumableModelService.delete(id);
                if (selectedConsumableType) {
                    await fetchConsumableModels(selectedConsumableType.consumable_type_id);
                }
            } catch (err) {
                setError('Failed to delete consumable model: ' + err.message);
            }
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Consumables</h1>
                <p className="page-subtitle">Manage consumables and models</p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-6)',
                    border: '1px solid #fcc'
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)' }}>
                {/* Consumable Types List */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="card-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                            Consumable Types
                        </h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{
                                backgroundColor: showForm ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                padding: 'var(--space-2) var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {showForm ? 'Cancel' : '+'}
                        </button>
                    </div>

                    {showForm && (
                        <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: 'var(--space-2)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '500'
                                    }}>
                                        Label *
                                    </label>
                                    <input
                                        type="text"
                                        name="consumable_type_label"
                                        value={formData.consumable_type_label}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Ink Cartridges"
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-2) var(--space-3)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-sm)',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: 'var(--space-2)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '500'
                                    }}>
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="consumable_type_code"
                                        value={formData.consumable_type_code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., INK"
                                        maxLength="18"
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-2) var(--space-3)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-sm)',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        width: '100%',
                                        backgroundColor: saving ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: 'var(--space-2) var(--space-4)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: saving ? 'default' : 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '500',
                                        opacity: saving ? 0.6 : 1
                                    }}
                                >
                                    {saving ? 'Creating...' : 'Create'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                Loading...
                            </div>
                        ) : consumableTypes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                No consumable types
                            </div>
                        ) : (
                            <div>
                                {consumableTypes.map((consumableType, index) => (
                                    <div
                                        key={consumableType.consumable_type_id}
                                        onClick={() => setSelectedConsumableType(consumableType)}
                                        style={{
                                            padding: 'var(--space-4)',
                                            borderBottom: index < consumableTypes.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            cursor: 'pointer',
                                            backgroundColor: selectedConsumableType?.consumable_type_id === consumableType.consumable_type_id ? 'var(--color-bg-secondary)' : 'transparent',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedConsumableType?.consumable_type_id !== consumableType.consumable_type_id) {
                                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedConsumableType?.consumable_type_id !== consumableType.consumable_type_id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                                                {consumableType.consumable_type_label}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                {consumableType.consumable_type_code}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(consumableType.consumable_type_id);
                                            }}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#c33',
                                                border: 'none',
                                                padding: 'var(--space-1) var(--space-2)',
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-xs)',
                                                opacity: 0.5,
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.target.style.opacity = 1; }}
                                            onMouseLeave={(e) => { e.target.style.opacity = 0.5; }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Consumable Models Detail */}
                <div className="card">
                    {selectedConsumableType ? (
                        <>
                            <div className="card-header" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: 'var(--space-4)',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                    Models for {selectedConsumableType.consumable_type_label}
                                </h2>
                                <button
                                    onClick={() => setShowModelForm(!showModelForm)}
                                    style={{
                                        backgroundColor: showModelForm ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: 'var(--space-2) var(--space-4)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '500'
                                    }}
                                >
                                    {showModelForm ? 'Cancel' : '+ Add Model'}
                                </button>
                            </div>

                            {showModelForm && (
                                <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                                    {consumableBrands.length === 0 ? (
                                        <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid #fcc' }}>
                                            No consumable brands found. Please create a brand first before creating a model.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleModelSubmit}>
                                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: 'var(--space-2)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: '500'
                                                }}>
                                                    Brand *
                                                </label>
                                                <select
                                                    name="consumable_brand"
                                                    value={modelFormData.consumable_brand}
                                                    onChange={handleModelInputChange}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        boxSizing: 'border-box',
                                                        fontFamily: 'inherit'
                                                    }}
                                                >
                                                    <option value="">Select a brand...</option>
                                                    {consumableBrands.map(brand => (
                                                        <option key={brand.consumable_brand_id} value={brand.consumable_brand_id}>
                                                            {brand.brand_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: 'var(--space-2)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: '500'
                                                }}>
                                                    Model Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="model_name"
                                                    value={modelFormData.model_name}
                                                    onChange={handleModelInputChange}
                                                    required
                                                    placeholder="e.g., Black Ink Cartridge"
                                                    style={{
                                                        width: '100%',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        boxSizing: 'border-box',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: 'var(--space-2)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: '500'
                                                }}>
                                                    Model Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="model_code"
                                                    value={modelFormData.model_code}
                                                    onChange={handleModelInputChange}
                                                    required
                                                    placeholder="e.g., BK-XL"
                                                    maxLength="16"
                                                    style={{
                                                        width: '100%',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        boxSizing: 'border-box',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: 'var(--space-2)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: '500'
                                                    }}>
                                                        Release Year
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="release_year"
                                                        value={modelFormData.release_year}
                                                        onChange={handleModelInputChange}
                                                        min="2000"
                                                        max={new Date().getFullYear()}
                                                        style={{
                                                            width: '100%',
                                                            padding: 'var(--space-2) var(--space-3)',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontSize: 'var(--font-size-sm)',
                                                            boxSizing: 'border-box',
                                                            fontFamily: 'inherit'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: 'var(--space-2)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: '500'
                                                    }}>
                                                        Warranty (Months)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="warranty_expiry_in_months"
                                                        value={modelFormData.warranty_expiry_in_months}
                                                        onChange={handleModelInputChange}
                                                        min="0"
                                                        style={{
                                                            width: '100%',
                                                            padding: 'var(--space-2) var(--space-3)',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontSize: 'var(--font-size-sm)',
                                                            boxSizing: 'border-box',
                                                            fontFamily: 'inherit'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: 'var(--space-2)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: '500'
                                                }}>
                                                    Notes
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    value={modelFormData.notes}
                                                    onChange={handleModelInputChange}
                                                    placeholder="Additional notes..."
                                                    rows="3"
                                                    style={{
                                                        width: '100%',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        boxSizing: 'border-box',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    checked={modelFormData.is_active}
                                                    onChange={handleModelInputChange}
                                                    id="is_active"
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <label htmlFor="is_active" style={{
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: '500',
                                                    cursor: 'pointer'
                                                }}>
                                                    Active
                                                </label>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={saving}
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: saving ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: 'var(--space-2) var(--space-4)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: saving ? 'default' : 'pointer',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: '500',
                                                    opacity: saving ? 0.6 : 1
                                                }}
                                            >
                                                {saving ? 'Creating...' : 'Create Model'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            <div className="card-body">
                                {consumableModels.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                        No models for this consumable type. Add one to get started!
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                        {consumableModels.map(model => (
                                            <div
                                                key={model.consumable_model_id}
                                                style={{
                                                    padding: 'var(--space-4)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    gap: 'var(--space-4)'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                                                        {model.model_name}
                                                    </div>
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'auto 1fr',
                                                        gap: 'var(--space-2) var(--space-4)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: 'var(--color-text-secondary)',
                                                        marginBottom: 'var(--space-3)'
                                                    }}>
                                                        <span><strong>Code:</strong></span>
                                                        <span style={{ fontFamily: 'monospace' }}>{model.model_code}</span>
                                                        <span><strong>Brand:</strong></span>
                                                        <span>{model.brand_name}</span>
                                                        {model.release_year && (
                                                            <>
                                                                <span><strong>Released:</strong></span>
                                                                <span>{model.release_year}</span>
                                                            </>
                                                        )}
                                                        {model.warranty_expiry_in_months && (
                                                            <>
                                                                <span><strong>Warranty:</strong></span>
                                                                <span>{model.warranty_expiry_in_months} months</span>
                                                            </>
                                                        )}
                                                        <span><strong>Status:</strong></span>
                                                        <span style={{ color: model.is_active ? '#10b981' : '#f59e0b' }}>
                                                            {model.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    {model.notes && (
                                                        <div style={{ fontSize: 'var(--font-size-xs)', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                                                            {model.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteModel(model.consumable_model_id)}
                                                    style={{
                                                        backgroundColor: '#fee',
                                                        color: '#c33',
                                                        border: '1px solid #fcc',
                                                        padding: 'var(--space-2) var(--space-3)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        cursor: 'pointer',
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: '500',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#fdd';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#fee';
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="card-body" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            Select a consumable type to view models
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ConsumablesPage;
