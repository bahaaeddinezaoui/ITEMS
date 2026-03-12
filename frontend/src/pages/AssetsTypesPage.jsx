import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Layers, 
    Settings2, 
    Trash2, 
    ChevronRight, 
    Info, 
    ArrowLeft,
    Tag,
    Hash,
    CheckCircle2,
    XCircle,
    X,
    LayoutGrid,
    Search,
    RefreshCw
} from 'lucide-react';
import { assetAttributeDefinitionService, assetTypeAttributeService, assetTypeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssetsTypesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isSuperuser = user?.roles?.some((role) => role.role_code === 'superuser');

    const [assetTypes, setAssetTypes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [attributesLoading, setAttributesLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showTypeForm, setShowTypeForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        asset_type_label: '',
        asset_type_code: '',
    });

    const [showAddTypeAttributeForm, setShowAddTypeAttributeForm] = useState(false);
    const [typeAttributeForm, setTypeAttributeForm] = useState({
        asset_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });

    useEffect(() => {
        fetchAssetTypes();
        fetchAttributeDefinitions();
    }, []);

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

    const fetchTypeAttributes = async (assetTypeId) => {
        setAttributesLoading(true);
        setError(null);
        try {
            const data = await assetTypeAttributeService.getByAssetType(assetTypeId);
            setTypeAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch type attributes: ' + err.message);
            setTypeAttributes([]);
        } finally {
            setAttributesLoading(false);
        }
    };

    const handleTypeAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTypeAttributeForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddTypeAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssetType) {
            setError('Please select an asset type first');
            return;
        }
        if (!typeAttributeForm.asset_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                asset_type: selectedAssetType.asset_type_id,
                asset_attribute_definition: Number(typeAttributeForm.asset_attribute_definition),
                is_mandatory: !!typeAttributeForm.is_mandatory,
                default_value: typeAttributeForm.default_value || null,
            };
            await assetTypeAttributeService.create(payload);
            setTypeAttributeForm({ asset_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowAddTypeAttributeForm(false);
            await fetchTypeAttributes(selectedAssetType.asset_type_id);
        } catch (err) {
            setError('Failed to add type attribute: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTypeAttribute = async (definitionId) => {
        if (!selectedAssetType) return;
        if (!window.confirm('Remove this attribute from the asset type?')) return;
        try {
            await assetTypeAttributeService.delete(selectedAssetType.asset_type_id, definitionId);
            await fetchTypeAttributes(selectedAssetType.asset_type_id);
        } catch (err) {
            setError('Failed to remove type attribute: ' + err.message);
        }
    };

    const fetchAttributeDefinitions = async () => {
        try {
            const data = await assetAttributeDefinitionService.getAll();
            setAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch attribute definitions: ' + err.message);
            setAttributeDefinitions([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const handleDeleteType = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset type?')) {
            try {
                await assetTypeService.delete(id);
                await fetchAssetTypes();
            } catch (err) {
                setError('Failed to delete asset type: ' + err.message);
            }
        }
    };

    const goToModels = (type) => {
        navigate(`/dashboard/assets/models?typeId=${type.asset_type_id}`);
    };

    const showTypeAttributes = async (type) => {
        setSelectedAssetType(type);
        setShowAddTypeAttributeForm(false);
        setTypeAttributeForm({ asset_attribute_definition: '', is_mandatory: false, default_value: '' });
        await fetchTypeAttributes(type.asset_type_id);
    };

    const goToAttributeDefinitions = () => {
        navigate('/dashboard/assets/attribute-definitions');
    };

    const filteredTypes = assetTypes.filter(type => 
        type.asset_type_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.asset_type_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const assignedDefinitionIds = new Set((Array.isArray(typeAttributes) ? typeAttributes : []).map((a) => a.asset_attribute_definition));
    const availableAttributeDefinitions = (Array.isArray(attributeDefinitions) ? attributeDefinitions : []).filter(
        (d) => !assignedDefinitionIds.has(d.asset_attribute_definition_id)
    );

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)' }}>Asset Types</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        Define and manage categories for your assets and their specific attributes.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={fetchAssetTypes} 
                        disabled={loading}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => setShowTypeForm(true)}
                        style={{ padding: 'var(--space-3) var(--space-6)' }}
                    >
                        <Plus size={18} />
                        <span>New Type</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
                <div style={{ flex: '1.2' }}>
                    <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
                        <Search 
                            size={18} 
                            style={{ 
                                position: 'absolute', 
                                left: 'var(--space-4)', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--color-text-muted)' 
                            }} 
                        />
                        <input 
                            type="text" 
                            placeholder="Search types by name or code..." 
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 'var(--space-12)', height: '48px', background: 'var(--color-bg-card)' }}
                        />
                    </div>

                    {loading ? (
                        <div className="loading-state" style={{ padding: 'var(--space-16)' }}>
                            <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                            <span style={{ fontSize: 'var(--font-size-lg)' }}>Loading types...</span>
                        </div>
                    ) : filteredTypes.length === 0 ? (
                        <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                            <div className="empty-state-icon">
                                <Layers size={64} />
                            </div>
                            <h3 className="empty-state-title">No asset types found</h3>
                            <p className="empty-state-text">
                                {searchTerm ? `No results for "${searchTerm}"` : "Start by creating your first asset category."}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                            {filteredTypes.map((type) => (
                                <div 
                                    key={type.asset_type_id} 
                                    className="card" 
                                    style={{ 
                                        background: selectedAssetType?.asset_type_id === type.asset_type_id ? 'var(--color-accent-glow)' : 'var(--color-bg-card)', 
                                        border: '1px solid',
                                        borderColor: selectedAssetType?.asset_type_id === type.asset_type_id ? 'var(--color-accent-primary)' : 'var(--color-border)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => showTypeAttributes(type)}
                                >
                                    <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                background: 'var(--color-bg-secondary)', 
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--color-accent-primary)'
                                            }}>
                                                <Tag size={20} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px' }}
                                                    onClick={(e) => { e.stopPropagation(); goToModels(type); }}
                                                    title="View Models"
                                                >
                                                    <LayoutGrid size={16} />
                                                </button>
                                                {isSuperuser && (
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', color: 'var(--color-error)' }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.asset_type_id); }}
                                                        title="Delete Type"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                                            {type.asset_type_label}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            <Hash size={14} />
                                            <span style={{ fontWeight: '600', letterSpacing: '0.05em' }}>{type.asset_type_code}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: '0.8', position: 'sticky', top: 'var(--space-6)' }}>
                    <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                        <div className="card-header" style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Settings2 size={20} className="text-accent" />
                                <h2 className="card-title" style={{ margin: 0 }}>Type Attributes</h2>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    onClick={goToAttributeDefinitions}
                                    className="btn btn-secondary"
                                    style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                                >
                                    Definitions
                                </button>
                                {selectedAssetType && (
                                    <button
                                        onClick={() => setShowAddTypeAttributeForm(!showAddTypeAttributeForm)}
                                        className="btn btn-primary"
                                        style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                                    >
                                        <Plus size={14} />
                                        <span>Add</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                            {!selectedAssetType ? (
                                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                                    <Info size={40} style={{ marginBottom: 'var(--space-3)', opacity: 0.5 }} />
                                    <p>Select a type to manage its attributes</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--color-accent-primary)' }}>{selectedAssetType.asset_type_label}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{typeAttributes.length} assigned attributes</div>
                                    </div>

                                    {showAddTypeAttributeForm && (
                                        <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-accent-primary)', borderRadius: 'var(--radius-md)' }}>
                                            <form onSubmit={handleAddTypeAttributeSubmit} className="form">
                                                <div className="form-group">
                                                    <label className="form-label">Definition</label>
                                                    <select
                                                        name="asset_attribute_definition"
                                                        value={typeAttributeForm.asset_attribute_definition}
                                                        onChange={handleTypeAttributeInputChange}
                                                        className="form-input"
                                                    >
                                                        <option value="">Select an attribute...</option>
                                                        {availableAttributeDefinitions.map((def) => (
                                                            <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                                {def.description}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                                    <div className="form-group">
                                                        <label className="form-label">Default Value</label>
                                                        <input
                                                            type="text"
                                                            name="default_value"
                                                            placeholder="None"
                                                            value={typeAttributeForm.default_value}
                                                            onChange={handleTypeAttributeInputChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--space-3)' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                                            <input
                                                                type="checkbox"
                                                                name="is_mandatory"
                                                                checked={typeAttributeForm.is_mandatory}
                                                                onChange={handleTypeAttributeInputChange}
                                                            />
                                                            <span style={{ fontSize: 'var(--font-size-sm)' }}>Mandatory</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                                    <button type="button" onClick={() => setShowAddTypeAttributeForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {attributesLoading ? (
                                        <div className="loading-state">
                                            <div className="loading-spinner"></div>
                                        </div>
                                    ) : typeAttributes.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No attributes defined for this type.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                            {typeAttributes.map((attr) => {
                                                const definition = attr.definition || attributeDefinitions.find((d) => d.asset_attribute_definition_id === attr.asset_attribute_definition);
                                                return (
                                                    <div
                                                        key={`${attr.asset_type}-${attr.asset_attribute_definition}`}
                                                        style={{
                                                            padding: 'var(--space-3) var(--space-4)',
                                                            background: 'var(--color-bg-secondary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: '1px solid var(--color-border)'
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                                                <span style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>{definition?.description}</span>
                                                                {attr.is_mandatory && (
                                                                    <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>Mandatory</span>
                                                                )}
                                                            </div>
                                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', display: 'flex', gap: 'var(--space-3)' }}>
                                                                <span>{definition?.data_type || 'any'}</span>
                                                                {definition?.unit && <span>• {definition.unit}</span>}
                                                                {attr.default_value && <span>• Def: {attr.default_value}</span>}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTypeAttribute(attr.asset_attribute_definition)}
                                                            style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 'var(--space-1)' }}
                                                            className="hover-text-error"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Creating New Type */}
            {showTypeForm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Asset Type</h2>
                            <button className="modal-close" onClick={() => setShowTypeForm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleTypeSubmit} className="form">
                                <div className="form-group">
                                    <label className="form-label">Type Name</label>
                                    <input
                                        type="text"
                                        name="asset_type_label"
                                        value={formData.asset_type_label}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Laptops"
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type Code</label>
                                    <input
                                        type="text"
                                        name="asset_type_code"
                                        value={formData.asset_type_code}
                                        onChange={handleInputChange}
                                        placeholder="e.g. LAP"
                                        required
                                        className="form-input"
                                    />
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Used for inventory tracking and identification.</p>
                                </div>
                                <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
                                    <button type="button" onClick={() => setShowTypeForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {saving ? 'Creating...' : 'Create Type'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsTypesPage;
