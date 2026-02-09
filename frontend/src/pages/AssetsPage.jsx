import { useEffect, useState } from 'react';
import { assetTypeService, assetModelService, assetBrandService } from '../services/api';

const AssetsPage = () => {
    const [assetTypes, setAssetTypes] = useState([]);
    const [assetBrands, setAssetBrands] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [formData, setFormData] = useState({
        asset_type_label: '',
        asset_type_code: '',
    });
    const [modelFormData, setModelFormData] = useState({
        model_name: '',
        model_code: '',
        asset_brand: '',
        asset_type: '',
        release_year: '',
        discontinued_year: '',
        is_active: true,
        notes: '',
        warranty_expiry_in_months: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAssetTypes();
        fetchAssetBrands();
    }, []);

    useEffect(() => {
        if (selectedAssetType) {
            fetchAssetModels(selectedAssetType.asset_type_id);
        }
    }, [selectedAssetType]);

    const fetchAssetTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await assetTypeService.getAll();
            setAssetTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch asset types: ' + err.message);
            setAssetTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssetBrands = async () => {
        try {
            const data = await assetBrandService.getAll();
            setAssetBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch asset brands:', err);
            setAssetBrands([]);
        }
    };

    const fetchAssetModels = async (assetTypeId) => {
        try {
            const data = await assetModelService.getByAssetType(assetTypeId);
            setAssetModels(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch asset models: ' + err.message);
            setAssetModels([]);
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
            await assetTypeService.create(formData);
            setFormData({ asset_type_label: '', asset_type_code: '' });
            setShowForm(false);
            await fetchAssetTypes();
        } catch (err) {
            setError('Failed to create asset type: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssetType) {
            setError('Please select an asset type first');
            return;
        }
        
        if (!modelFormData.asset_brand) {
            setError('Please select a brand');
            return;
        }
        
        setSaving(true);
        setError(null);

        try {
            // Prepare data, converting empty strings to null for optional fields
            const dataToSubmit = {
                model_name: modelFormData.model_name,
                model_code: modelFormData.model_code,
                asset_brand: parseInt(modelFormData.asset_brand),
                asset_type: selectedAssetType.asset_type_id,
                is_active: modelFormData.is_active,
                notes: modelFormData.notes || '',
                release_year: modelFormData.release_year ? parseInt(modelFormData.release_year) : null,
                discontinued_year: modelFormData.discontinued_year ? parseInt(modelFormData.discontinued_year) : null,
                warranty_expiry_in_months: modelFormData.warranty_expiry_in_months ? parseInt(modelFormData.warranty_expiry_in_months) : null,
            };
            
            await assetModelService.create(dataToSubmit);
            setModelFormData({
                model_name: '',
                model_code: '',
                asset_brand: '',
                asset_type: '',
                release_year: '',
                discontinued_year: '',
                is_active: true,
                notes: '',
                warranty_expiry_in_months: '',
            });
            setShowModelForm(false);
            await fetchAssetModels(selectedAssetType.asset_type_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError('Failed to create asset model: ' + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset type?')) {
            try {
                await assetTypeService.delete(id);
                if (selectedAssetType?.asset_type_id === id) {
                    setSelectedAssetType(null);
                }
                await fetchAssetTypes();
            } catch (err) {
                setError('Failed to delete asset type: ' + err.message);
            }
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset model?')) {
            try {
                await assetModelService.delete(id);
                if (selectedAssetType) {
                    await fetchAssetModels(selectedAssetType.asset_type_id);
                }
            } catch (err) {
                setError('Failed to delete asset model: ' + err.message);
            }
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Assets</h1>
                <p className="page-subtitle">Manage equipment and asset types</p>
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
                {/* Asset Types List */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="card-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                            Asset Types
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
                                        name="asset_type_label"
                                        value={formData.asset_type_label}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Laptop"
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
                                        name="asset_type_code"
                                        value={formData.asset_type_code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., LAP"
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
                        ) : assetTypes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                No asset types
                            </div>
                        ) : (
                            <div>
                                {assetTypes.map((assetType, index) => (
                                    <div
                                        key={assetType.asset_type_id}
                                        onClick={() => setSelectedAssetType(assetType)}
                                        style={{
                                            padding: 'var(--space-4)',
                                            borderBottom: index < assetTypes.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            cursor: 'pointer',
                                            backgroundColor: selectedAssetType?.asset_type_id === assetType.asset_type_id ? 'var(--color-bg-secondary)' : 'transparent',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedAssetType?.asset_type_id !== assetType.asset_type_id) {
                                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedAssetType?.asset_type_id !== assetType.asset_type_id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                                                {assetType.asset_type_label}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                {assetType.asset_type_code}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(assetType.asset_type_id);
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

                {/* Asset Models Detail */}
                <div className="card">
                    {selectedAssetType ? (
                        <>
                            <div className="card-header" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: 'var(--space-4)',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                    Models for {selectedAssetType.asset_type_label}
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
                                    {assetBrands.length === 0 ? (
                                        <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid #fcc' }}>
                                            No asset brands found. Please create a brand first before creating a model.
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
                                                name="asset_brand"
                                                value={modelFormData.asset_brand}
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
                                                {assetBrands.map(brand => (
                                                    <option key={brand.asset_brand_id} value={brand.asset_brand_id}>
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
                                                placeholder="e.g., ThinkPad X1"
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
                                                placeholder="e.g., X1C13"
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
                                {assetModels.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                        No models for this asset type. Add one to get started!
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                        {assetModels.map(model => (
                                            <div
                                                key={model.asset_model_id}
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
                                                    onClick={() => handleDeleteModel(model.asset_model_id)}
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
                            Select an asset type to view models
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AssetsPage;
