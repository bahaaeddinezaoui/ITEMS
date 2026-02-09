import { useEffect, useState } from 'react';
import { stockItemTypeService, stockItemModelService, stockItemBrandService } from '../services/api';

const StockItemsPage = () => {
    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemBrands, setStockItemBrands] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [selectedStockItemType, setSelectedStockItemType] = useState(null);
    const [formData, setFormData] = useState({
        stock_item_type_label: '',
        stock_item_type_code: '',
    });
    const [modelFormData, setModelFormData] = useState({
        model_name: '',
        model_code: '',
        stock_item_brand: '',
        stock_item_type: '',
        release_year: '',
        discontinued_year: '',
        is_active: true,
        notes: '',
        warranty_expiry_in_months: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStockItemTypes();
        fetchStockItemBrands();
    }, []);

    useEffect(() => {
        if (selectedStockItemType) {
            fetchStockItemModels(selectedStockItemType.stock_item_type_id);
        }
    }, [selectedStockItemType]);

    const fetchStockItemTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await stockItemTypeService.getAll();
            setStockItemTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item types: ' + err.message);
            setStockItemTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStockItemBrands = async () => {
        try {
            const data = await stockItemBrandService.getAll();
            setStockItemBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch stock item brands:', err);
            setStockItemBrands([]);
        }
    };

    const fetchStockItemModels = async (stockItemTypeId) => {
        try {
            const data = await stockItemModelService.getByStockItemType(stockItemTypeId);
            setStockItemModels(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item models: ' + err.message);
            setStockItemModels([]);
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
            await stockItemTypeService.create(formData);
            setFormData({ stock_item_type_label: '', stock_item_type_code: '' });
            setShowForm(false);
            await fetchStockItemTypes();
        } catch (err) {
            setError('Failed to create stock item type: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItemType) {
            setError('Please select a stock item type first');
            return;
        }
        
        if (!modelFormData.stock_item_brand) {
            setError('Please select a brand');
            return;
        }
        
        setSaving(true);
        setError(null);

        try {
            const dataToSubmit = {
                model_name: modelFormData.model_name,
                model_code: modelFormData.model_code,
                stock_item_brand: parseInt(modelFormData.stock_item_brand),
                stock_item_type: selectedStockItemType.stock_item_type_id,
                is_active: modelFormData.is_active,
                notes: modelFormData.notes || '',
                release_year: modelFormData.release_year ? parseInt(modelFormData.release_year) : null,
                discontinued_year: modelFormData.discontinued_year ? parseInt(modelFormData.discontinued_year) : null,
                warranty_expiry_in_months: modelFormData.warranty_expiry_in_months ? parseInt(modelFormData.warranty_expiry_in_months) : null,
            };
            
            await stockItemModelService.create(dataToSubmit);
            setModelFormData({
                model_name: '',
                model_code: '',
                stock_item_brand: '',
                stock_item_type: '',
                release_year: '',
                discontinued_year: '',
                is_active: true,
                notes: '',
                warranty_expiry_in_months: '',
            });
            setShowModelForm(false);
            await fetchStockItemModels(selectedStockItemType.stock_item_type_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError('Failed to create stock item model: ' + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock item type?')) {
            try {
                await stockItemTypeService.delete(id);
                if (selectedStockItemType?.stock_item_type_id === id) {
                    setSelectedStockItemType(null);
                }
                await fetchStockItemTypes();
            } catch (err) {
                setError('Failed to delete stock item type: ' + err.message);
            }
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock item model?')) {
            try {
                await stockItemModelService.delete(id);
                if (selectedStockItemType) {
                    await fetchStockItemModels(selectedStockItemType.stock_item_type_id);
                }
            } catch (err) {
                setError('Failed to delete stock item model: ' + err.message);
            }
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Stock Items</h1>
                <p className="page-subtitle">Manage stock items and models</p>
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
                {/* Stock Item Types List */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="card-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                            Stock Item Types
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
                                        name="stock_item_type_label"
                                        value={formData.stock_item_type_label}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Cables"
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
                                        name="stock_item_type_code"
                                        value={formData.stock_item_type_code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., CBL"
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
                        ) : stockItemTypes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                No stock item types
                            </div>
                        ) : (
                            <div>
                                {stockItemTypes.map((stockItemType, index) => (
                                    <div
                                        key={stockItemType.stock_item_type_id}
                                        onClick={() => setSelectedStockItemType(stockItemType)}
                                        style={{
                                            padding: 'var(--space-4)',
                                            borderBottom: index < stockItemTypes.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            cursor: 'pointer',
                                            backgroundColor: selectedStockItemType?.stock_item_type_id === stockItemType.stock_item_type_id ? 'var(--color-bg-secondary)' : 'transparent',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedStockItemType?.stock_item_type_id !== stockItemType.stock_item_type_id) {
                                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedStockItemType?.stock_item_type_id !== stockItemType.stock_item_type_id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                                                {stockItemType.stock_item_type_label}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                {stockItemType.stock_item_type_code}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(stockItemType.stock_item_type_id);
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

                {/* Stock Item Models Detail */}
                <div className="card">
                    {selectedStockItemType ? (
                        <>
                            <div className="card-header" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: 'var(--space-4)',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                    Models for {selectedStockItemType.stock_item_type_label}
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
                                    {stockItemBrands.length === 0 ? (
                                        <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid #fcc' }}>
                                            No stock item brands found. Please create a brand first before creating a model.
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
                                                    name="stock_item_brand"
                                                    value={modelFormData.stock_item_brand}
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
                                                    {stockItemBrands.map(brand => (
                                                        <option key={brand.stock_item_brand_id} value={brand.stock_item_brand_id}>
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
                                                    placeholder="e.g., CAT6 Ethernet"
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
                                                    placeholder="e.g., CAT6-10M"
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
                                {stockItemModels.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                                        No models for this stock item type. Add one to get started!
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                        {stockItemModels.map(model => (
                                            <div
                                                key={model.stock_item_model_id}
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
                                                    onClick={() => handleDeleteModel(model.stock_item_model_id)}
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
                            Select a stock item type to view models
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StockItemsPage;
