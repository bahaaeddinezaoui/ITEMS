import { useEffect, useState } from 'react';
import { stockItemTypeService, stockItemModelService, stockItemBrandService, stockItemService } from '../services/api';

const StockItemsPage = () => {
    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemBrands, setStockItemBrands] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Form visibility states
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [showStockItemForm, setShowStockItemForm] = useState(false);
    
    // Selection states
    const [selectedStockItemType, setSelectedStockItemType] = useState(null);
    const [selectedStockItemModel, setSelectedStockItemModel] = useState(null);
    
    // Form data states
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
    const [stockItemFormData, setStockItemFormData] = useState({
        stock_item_name: '',
        stock_item_inventory_number: '',
        stock_item_status: 'active',
        stock_item_warranty_expiry_in_months: '',
        stock_item_name_in_administrative_certificate: '',
        destruction_certificate_id: '',
        maintenance_step_id: null
    });
    
    const [editingStockItem, setEditingStockItem] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStockItemTypes();
        fetchStockItemBrands();
    }, []);

    useEffect(() => {
        if (selectedStockItemType) {
            fetchStockItemModels(selectedStockItemType.stock_item_type_id);
            setSelectedStockItemModel(null);
            setStockItems([]);
        } else {
            setStockItemModels([]);
        }
    }, [selectedStockItemType]);

    useEffect(() => {
        if (selectedStockItemModel) {
            fetchStockItems(selectedStockItemModel.stock_item_model_id);
        } else {
            setStockItems([]);
        }
    }, [selectedStockItemModel]);

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

    const fetchStockItems = async (stockItemModelId) => {
        try {
            const data = await stockItemService.getAll({ stock_item_model: stockItemModelId });
            setStockItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock items: ' + err.message);
            setStockItems([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleModelInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModelFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseInt(value) : '') : value)
        }));
    };

    const handleStockItemInputChange = (e) => {
        const { name, value } = e.target;
        setStockItemFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await stockItemTypeService.create(formData);
            setFormData({ stock_item_type_label: '', stock_item_type_code: '' });
            setShowTypeForm(false);
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

    const handleStockItemSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItemModel) {
            setError('Please select a stock item model first');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...stockItemFormData,
                stock_item_model: selectedStockItemModel.stock_item_model_id,
                destruction_certificate_id: stockItemFormData.destruction_certificate_id ? Number(stockItemFormData.destruction_certificate_id) : null,
            };
            if (editingStockItem) {
                await stockItemService.update(editingStockItem, dataToSubmit);
            } else {
                await stockItemService.create(dataToSubmit);
            }
            setStockItemFormData({
                stock_item_name: '',
                stock_item_inventory_number: '',
                stock_item_status: 'active',
                stock_item_warranty_expiry_in_months: '',
                stock_item_name_in_administrative_certificate: '',
                destruction_certificate_id: '',
                maintenance_step_id: null
            });
            setEditingStockItem(null);
            setShowStockItemForm(false);
            await fetchStockItems(selectedStockItemModel.stock_item_model_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError(`Failed to ${editingStockItem ? 'update' : 'create'} stock item: ` + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleEditStockItem = (item) => {
        setEditingStockItem(item.stock_item_id);
        setStockItemFormData({
            stock_item_name: item.stock_item_name || '',
            stock_item_inventory_number: item.stock_item_inventory_number || '',
            stock_item_status: item.stock_item_status || 'active',
            stock_item_warranty_expiry_in_months: item.stock_item_warranty_expiry_in_months || '',
            stock_item_name_in_administrative_certificate: item.stock_item_name_in_administrative_certificate || '',
            destruction_certificate_id: item.destruction_certificate_id ?? '',
            maintenance_step_id: item.maintenance_step_id || null
        });
        setShowStockItemForm(true);
    };

    const handleDeleteType = async (id) => {
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

    const handleDeleteStockItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock item?')) {
            try {
                await stockItemService.delete(id);
                if (selectedStockItemModel) {
                    await fetchStockItems(selectedStockItemModel.stock_item_model_id);
                }
            } catch (err) {
                setError('Failed to delete stock item: ' + err.message);
            }
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Stock Items Explorer</h1>
                <p className="page-subtitle">Manage stock item types, models, and inventory</p>
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
                gridTemplateColumns: '300px 1fr', 
                gap: 'var(--space-6)',
                flex: 1,
                minHeight: 0 // Important for nested scrolling
            }}>
                {/* Left Sidebar: Library (Types & Models) */}
                <div className="card" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden',
                    height: '100%'
                }}>
                    <div className="card-header" style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Library</h2>
                        <button
                            onClick={() => setShowTypeForm(!showTypeForm)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--color-primary)',
                                padding: '0 var(--space-2)'
                            }}
                            title="Add Stock Item Type"
                        >
                            +
                        </button>
                    </div>

                    {showTypeForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <form onSubmit={handleTypeSubmit}>
                                <input
                                    type="text"
                                    name="stock_item_type_label"
                                    value={formData.stock_item_type_label}
                                    onChange={handleInputChange}
                                    placeholder="Type Name"
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <input
                                    type="text"
                                    name="stock_item_type_code"
                                    value={formData.stock_item_type_code}
                                    onChange={handleInputChange}
                                    placeholder="Code (e.g. CBL)"
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                    <button type="button" onClick={() => setShowTypeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {stockItemTypes.map(type => (
                            <div key={type.stock_item_type_id}>
                                <div
                                    onClick={() => setSelectedStockItemType(selectedStockItemType?.stock_item_type_id === type.stock_item_type_id ? null : type)}
                                    style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedStockItemType?.stock_item_type_id === type.stock_item_type_id ? 'var(--color-bg-secondary)' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border)'
                                    }}
                                >
                                    <span style={{ fontWeight: '500' }}>{type.stock_item_type_label}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.stock_item_type_id); }}
                                        style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                {/* Models List (Nested) */}
                                {selectedStockItemType?.stock_item_type_id === type.stock_item_type_id && (
                                    <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                        <div 
                                            onClick={() => setShowModelForm(true)}
                                            style={{
                                                padding: 'var(--space-2) var(--space-4)',
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-primary)',
                                                cursor: 'pointer',
                                                borderBottom: '1px dashed var(--color-border)',
                                                textAlign: 'center'
                                            }}
                                        >
                                            + Add Model
                                        </div>
                                        {stockItemModels.map(model => (
                                            <div
                                                key={model.stock_item_model_id}
                                                onClick={() => setSelectedStockItemModel(model)}
                                                style={{
                                                    padding: 'var(--space-2) var(--space-4)',
                                                    paddingLeft: 'var(--space-8)',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedStockItemModel?.stock_item_model_id === model.stock_item_model_id ? 'var(--color-primary)' : 'transparent',
                                                    color: selectedStockItemModel?.stock_item_model_id === model.stock_item_model_id ? 'white' : 'var(--color-text)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: 'var(--font-size-sm)'
                                                }}
                                            >
                                                <span>{model.model_name}</span>
                                                {selectedStockItemModel?.stock_item_model_id === model.stock_item_model_id && (
                                                     <button
                                                     onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.stock_item_model_id); }}
                                                     style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
                                                 >
                                                     &times;
                                                 </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {stockItemTypes.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No stock item types.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content: Main Area */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {showModelForm ? (
                        <div style={{ padding: 'var(--space-6)', overflowY: 'auto' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h2>Add New Model for {selectedStockItemType?.stock_item_type_label}</h2>
                                <button onClick={() => setShowModelForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                             </div>
                             {stockItemBrands.length === 0 ? (
                                <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                    No stock item brands found. Please create a brand first.
                                </div>
                             ) : (
                                <form onSubmit={handleModelSubmit} style={{ maxWidth: '600px' }}>
                                    {/* Brand */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Brand *</label>
                                        <select name="stock_item_brand" value={modelFormData.stock_item_brand} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                            <option value="">Select a brand...</option>
                                            {stockItemBrands.map(b => <option key={b.stock_item_brand_id} value={b.stock_item_brand_id}>{b.brand_name}</option>)}
                                        </select>
                                    </div>
                                    {/* Model Name & Code */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Model Name *</label>
                                            <input type="text" name="model_name" value={modelFormData.model_name} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Model Code *</label>
                                            <input type="text" name="model_code" value={modelFormData.model_code} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                    </div>
                                    {/* Year & Warranty */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Release Year</label>
                                            <input type="number" name="release_year" value={modelFormData.release_year} onChange={handleModelInputChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Warranty (Months)</label>
                                            <input type="number" name="warranty_expiry_in_months" value={modelFormData.warranty_expiry_in_months} onChange={handleModelInputChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                    </div>
                                    {/* Notes */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Notes</label>
                                        <textarea name="notes" value={modelFormData.notes} onChange={handleModelInputChange} rows="3" style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                    </div>
                                    {/* Active */}
                                    <div style={{ marginBottom: 'var(--space-6)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                            <input type="checkbox" name="is_active" checked={modelFormData.is_active} onChange={handleModelInputChange} />
                                            Active Model
                                        </label>
                                    </div>
                                    <button type="submit" disabled={saving} style={{ padding: 'var(--space-2) var(--space-6)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                                        {saving ? 'Creating...' : 'Create Model'}
                                    </button>
                                </form>
                             )}
                        </div>
                    ) : selectedStockItemModel ? (
                        <>
                            <div className="card-header" style={{
                                padding: 'var(--space-4)',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                        {selectedStockItemModel.model_name} <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', fontWeight: 'normal' }}>({selectedStockItemModel.model_code})</span>
                                    </h2>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                        {selectedStockItemModel.brand_name} • {stockItems.length} Items
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingStockItem(null);
                                        setStockItemFormData({
                                            stock_item_name: '',
                                            stock_item_inventory_number: '',
                                            stock_item_status: 'active',
                                            stock_item_warranty_expiry_in_months: '',
                                            stock_item_name_in_administrative_certificate: '',
                                            destruction_certificate_id: 0,
                                            maintenance_step_id: null
                                        });
                                        setShowStockItemForm(true);
                                    }}
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: 'var(--space-2) var(--space-4)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    + Add Item
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
                                {showStockItemForm && (
                                    <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-4)' }}>{editingStockItem ? 'Edit Stock Item' : 'New Stock Item'}</div>
                                        <form onSubmit={handleStockItemSubmit}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Name</label>
                                                    <input type="text" name="stock_item_name" value={stockItemFormData.stock_item_name} onChange={handleStockItemInputChange} placeholder="Stock Item Name" style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Status</label>
                                                    <select name="stock_item_status" value={stockItemFormData.stock_item_status} onChange={handleStockItemInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="maintenance">Maintenance</option>
                                                        <option value="retired">Retired</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Inventory Number</label>
                                                    <input type="text" name="stock_item_inventory_number" value={stockItemFormData.stock_item_inventory_number} onChange={handleStockItemInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Warranty (Months)</label>
                                                    <input type="number" name="stock_item_warranty_expiry_in_months" value={stockItemFormData.stock_item_warranty_expiry_in_months} onChange={handleStockItemInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                                                <button type="submit" style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Save Item</button>
                                                <button type="button" onClick={() => setShowStockItemForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {stockItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>
                                        No stock items found for this model.
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                                                <th style={{ padding: 'var(--space-2)' }}>Name</th>
                                                <th style={{ padding: 'var(--space-2)' }}>Inventory No.</th>
                                                <th style={{ padding: 'var(--space-2)' }}>Status</th>
                                                <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockItems.map(item => (
                                                <tr key={item.stock_item_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div style={{ fontWeight: '500' }}>{item.stock_item_name || 'Unnamed Item'}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div style={{ color: 'var(--color-text-secondary)' }}>{item.stock_item_inventory_number}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: 'var(--font-size-xs)',
                                                            backgroundColor: item.stock_item_status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-secondary)',
                                                            color: item.stock_item_status === 'active' ? 'var(--color-success)' : 'var(--color-text-secondary)'
                                                        }}>
                                                            {item.stock_item_status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => handleEditStockItem(item)}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteStockItem(item.stock_item_id)}
                                                            style={{ background: 'none', border: 'none', color: '#c33', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
                            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)', opacity: 0.2 }}>📦</div>
                            <p>Select a stock item model from the sidebar to view inventory.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockItemsPage;
