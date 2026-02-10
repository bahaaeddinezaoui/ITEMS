import { useEffect, useState } from 'react';
import { assetTypeService, assetModelService, assetBrandService, assetService } from '../services/api';

const AssetsPage = () => {
    const [assetTypes, setAssetTypes] = useState([]);
    const [assetBrands, setAssetBrands] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Form visibility states
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [showAssetForm, setShowAssetForm] = useState(false);
    
    // Selection states
    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [selectedAssetModel, setSelectedAssetModel] = useState(null);
    
    // Form data states
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
    const [assetFormData, setAssetFormData] = useState({
        asset_serial_number: '',
        asset_inventory_number: '',
        asset_service_tag: '',
        asset_name: '',
        asset_status: 'active',
        attribution_order_id: 0,
        destruction_certificate_id: 0
    });
    
    const [editingAsset, setEditingAsset] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAssetTypes();
        fetchAssetBrands();
    }, []);

    useEffect(() => {
        if (selectedAssetType) {
            fetchAssetModels(selectedAssetType.asset_type_id);
            // We don't nullify selectedAssetModel immediately if we want to keep context, 
            // but usually switching type implies switching context. 
            // If the user clicks the SAME type, we might want to toggle collapse? 
            // For now, let's keep the behavior: select type -> fetch models -> clear asset selection
            setSelectedAssetModel(null);
            setAssets([]);
        } else {
            setAssetModels([]);
        }
    }, [selectedAssetType]);

    useEffect(() => {
        if (selectedAssetModel) {
            fetchAssets(selectedAssetModel.asset_model_id);
        } else {
            setAssets([]);
        }
    }, [selectedAssetModel]);

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

    const fetchAssets = async (assetModelId) => {
        try {
            const data = await assetService.getAll({ asset_model: assetModelId });
            setAssets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch assets: ' + err.message);
            setAssets([]);
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

    const handleAssetInputChange = (e) => {
        const { name, value } = e.target;
        setAssetFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await assetTypeService.create(formData);
            setFormData({ asset_type_label: '', asset_type_code: '' });
            setShowTypeForm(false);
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

    const handleAssetSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssetModel) {
            setError('Please select an asset model first');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...assetFormData,
                asset_model: selectedAssetModel.asset_model_id
            };
            if (editingAsset) {
                await assetService.update(editingAsset, dataToSubmit);
            } else {
                await assetService.create(dataToSubmit);
            }
            setAssetFormData({
                asset_serial_number: '',
                asset_inventory_number: '',
                asset_service_tag: '',
                asset_name: '',
                asset_status: 'active',
                attribution_order_id: 0,
                destruction_certificate_id: 0
            });
            setEditingAsset(null);
            setShowAssetForm(false);
            await fetchAssets(selectedAssetModel.asset_model_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError(`Failed to ${editingAsset ? 'update' : 'create'} asset: ` + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleEditAsset = (asset) => {
        setEditingAsset(asset.asset_id);
        setAssetFormData({
            asset_serial_number: asset.asset_serial_number || '',
            asset_inventory_number: asset.asset_inventory_number || '',
            asset_service_tag: asset.asset_service_tag || '',
            asset_name: asset.asset_name || '',
            asset_status: asset.asset_status || 'active',
            attribution_order_id: asset.attribution_order_id || 0,
            destruction_certificate_id: asset.destruction_certificate_id || 0
        });
        setShowAssetForm(true);
    };

    const handleDeleteType = async (id) => {
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

    const handleDeleteAsset = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await assetService.delete(id);
                if (selectedAssetModel) {
                    await fetchAssets(selectedAssetModel.asset_model_id);
                }
            } catch (err) {
                setError('Failed to delete asset: ' + err.message);
            }
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Assets Explorer</h1>
                <p className="page-subtitle">Manage asset types, models, and inventory</p>
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
                            title="Add Asset Type"
                        >
                            +
                        </button>
                    </div>

                    {showTypeForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f9f9f9' }}>
                            <form onSubmit={handleTypeSubmit}>
                                <input
                                    type="text"
                                    name="asset_type_label"
                                    value={formData.asset_type_label}
                                    onChange={handleInputChange}
                                    placeholder="Type Name"
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <input
                                    type="text"
                                    name="asset_type_code"
                                    value={formData.asset_type_code}
                                    onChange={handleInputChange}
                                    placeholder="Code (e.g. LAP)"
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                    <button type="button" onClick={() => setShowTypeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'white', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {assetTypes.map(type => (
                            <div key={type.asset_type_id}>
                                <div
                                    onClick={() => setSelectedAssetType(selectedAssetType?.asset_type_id === type.asset_type_id ? null : type)}
                                    style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedAssetType?.asset_type_id === type.asset_type_id ? '#e0f2fe' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border-light)'
                                    }}
                                >
                                    <span style={{ fontWeight: '500' }}>{type.asset_type_label}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.asset_type_id); }}
                                        style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                {/* Models List (Nested) */}
                                {selectedAssetType?.asset_type_id === type.asset_type_id && (
                                    <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                                        <div 
                                            onClick={() => setShowModelForm(true)}
                                            style={{
                                                padding: 'var(--space-2) var(--space-4)',
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-primary)',
                                                cursor: 'pointer',
                                                borderBottom: '1px dashed var(--color-border-light)',
                                                textAlign: 'center'
                                            }}
                                        >
                                            + Add Model
                                        </div>
                                        {assetModels.map(model => (
                                            <div
                                                key={model.asset_model_id}
                                                onClick={() => setSelectedAssetModel(model)}
                                                style={{
                                                    padding: 'var(--space-2) var(--space-4)',
                                                    paddingLeft: 'var(--space-8)',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedAssetModel?.asset_model_id === model.asset_model_id ? 'var(--color-primary)' : 'transparent',
                                                    color: selectedAssetModel?.asset_model_id === model.asset_model_id ? 'white' : 'var(--color-text)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: 'var(--font-size-sm)'
                                                }}
                                            >
                                                <span>{model.model_name}</span>
                                                {selectedAssetModel?.asset_model_id === model.asset_model_id && (
                                                     <button
                                                     onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.asset_model_id); }}
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
                        {assetTypes.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No asset types.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content: Main Area */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {showModelForm ? (
                        <div style={{ padding: 'var(--space-6)', overflowY: 'auto' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h2>Add New Model for {selectedAssetType?.asset_type_label}</h2>
                                <button onClick={() => setShowModelForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', background: 'white', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                             </div>
                             {assetBrands.length === 0 ? (
                                <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                    No asset brands found. Please create a brand first.
                                </div>
                             ) : (
                                <form onSubmit={handleModelSubmit} style={{ maxWidth: '600px' }}>
                                    {/* Brand */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Brand *</label>
                                        <select name="asset_brand" value={modelFormData.asset_brand} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                            <option value="">Select a brand...</option>
                                            {assetBrands.map(b => <option key={b.asset_brand_id} value={b.asset_brand_id}>{b.brand_name}</option>)}
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
                    ) : selectedAssetModel ? (
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
                                        {selectedAssetModel.model_name} <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', fontWeight: 'normal' }}>({selectedAssetModel.model_code})</span>
                                    </h2>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                        {selectedAssetModel.brand_name} • {assets.length} Assets
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingAsset(null);
                                        setAssetFormData({
                                            asset_serial_number: '',
                                            asset_inventory_number: '',
                                            asset_service_tag: '',
                                            asset_name: '',
                                            asset_status: 'active',
                                            attribution_order_id: 0,
                                            destruction_certificate_id: 0
                                        });
                                        setShowAssetForm(true);
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
                                    + Add Asset
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
                                {showAssetForm && (
                                    <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-4)' }}>{editingAsset ? 'Edit Asset' : 'New Asset'}</div>
                                        <form onSubmit={handleAssetSubmit}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Name</label>
                                                    <input type="text" name="asset_name" value={assetFormData.asset_name} onChange={handleAssetInputChange} placeholder="Asset Name" style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Status</label>
                                                    <select name="asset_status" value={assetFormData.asset_status} onChange={handleAssetInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="maintenance">Maintenance</option>
                                                        <option value="retired">Retired</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Serial Number</label>
                                                    <input type="text" name="asset_serial_number" value={assetFormData.asset_serial_number} onChange={handleAssetInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Inventory Number</label>
                                                    <input type="text" name="asset_inventory_number" value={assetFormData.asset_inventory_number} onChange={handleAssetInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                                                <button type="submit" style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Save Asset</button>
                                                <button type="button" onClick={() => setShowAssetForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {assets.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>
                                        No assets found for this model.
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                                                <th style={{ padding: 'var(--space-2)' }}>Name</th>
                                                <th style={{ padding: 'var(--space-2)' }}>Serial / Tag</th>
                                                <th style={{ padding: 'var(--space-2)' }}>Status</th>
                                                <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assets.map(asset => (
                                                <tr key={asset.asset_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div style={{ fontWeight: '500' }}>{asset.asset_name || 'Unnamed Asset'}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{asset.asset_inventory_number}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div>{asset.asset_serial_number}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{asset.asset_service_tag}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: 'var(--font-size-xs)',
                                                            backgroundColor: asset.asset_status === 'active' ? '#dcfce7' : '#f3f4f6',
                                                            color: asset.asset_status === 'active' ? '#166534' : '#374151'
                                                        }}>
                                                            {asset.asset_status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => handleEditAsset(asset)}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAsset(asset.asset_id)}
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
                            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)', opacity: 0.2 }}>📋</div>
                            <p>Select a model from the sidebar to view assets.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetsPage;
