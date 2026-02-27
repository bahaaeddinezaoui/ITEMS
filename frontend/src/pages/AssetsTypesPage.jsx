import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetAttributeDefinitionService, assetTypeAttributeService, assetTypeService } from '../services/api';

const AssetsTypesPage = () => {
    const navigate = useNavigate();

    const [assetTypes, setAssetTypes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [attributesLoading, setAttributesLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showAttributeDefinitionForm, setShowAttributeDefinitionForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        asset_type_label: '',
        asset_type_code: '',
    });

    const [attributeDefinitionForm, setAttributeDefinitionForm] = useState({
        description: '',
        data_type: '',
        unit: ''
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

    const handleAttributeDefinitionInputChange = (e) => {
        const { name, value } = e.target;
        setAttributeDefinitionForm((prev) => ({ ...prev, [name]: value }));
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

    const assignedDefinitionIds = new Set((Array.isArray(typeAttributes) ? typeAttributes : []).map((a) => a.asset_attribute_definition));
    const availableAttributeDefinitions = (Array.isArray(attributeDefinitions) ? attributeDefinitions : []).filter(
        (d) => !assignedDefinitionIds.has(d.asset_attribute_definition_id)
    );

    const goToAttributeDefinitions = () => {
        navigate('/dashboard/assets/attribute-definitions');
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Assets</h1>
                <p className="page-subtitle">Select an asset type</p>
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Types</h2>
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
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
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
                                    <button type="button" onClick={() => setShowTypeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {assetTypes.map((type) => (
                            <div
                                key={type.asset_type_id}
                                onClick={() => goToModels(type)}
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--color-border)'
                                }}
                            >
                                <span style={{ fontWeight: '500' }}>{type.asset_type_label}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); showTypeAttributes(type); }}
                                        style={{
                                            padding: 'var(--space-1) var(--space-2)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Attributes
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.asset_type_id); }}
                                        style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}

                        {assetTypes.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No asset types.
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
                            Type Attributes {selectedAssetType ? `• ${selectedAssetType.asset_type_label}` : ''}
                        </h2>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => setShowAddTypeAttributeForm((v) => !v)}
                                disabled={!selectedAssetType}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--color-primary)',
                                    cursor: selectedAssetType ? 'pointer' : 'not-allowed',
                                    opacity: selectedAssetType ? 1 : 0.6
                                }}
                            >
                                + Add
                            </button>
                            <button
                                onClick={goToAttributeDefinitions}
                                style={{
                                    padding: 'var(--space-2) var(--space-3)',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-tertiary)',
                                    color: 'var(--color-text)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer'
                                }}
                            >
                                Manage
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-4)' }}>
                        {!selectedAssetType ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Click "Attributes" on a type to view its attributes.</div>
                        ) : (
                            <>
                                {showAddTypeAttributeForm && (
                                    <form onSubmit={handleAddTypeAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                        <select
                                            name="asset_attribute_definition"
                                            value={typeAttributeForm.asset_attribute_definition}
                                            onChange={handleTypeAttributeInputChange}
                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                        >
                                            <option value="">Select attribute definition...</option>
                                            {availableAttributeDefinitions.map((def) => (
                                                <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                    {def.description || `Attribute ${def.asset_attribute_definition_id}`}
                                                </option>
                                            ))}
                                        </select>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <input
                                                    type="checkbox"
                                                    name="is_mandatory"
                                                    checked={typeAttributeForm.is_mandatory}
                                                    onChange={handleTypeAttributeInputChange}
                                                />
                                                Mandatory
                                            </label>
                                            <input
                                                type="text"
                                                name="default_value"
                                                placeholder="Default value (optional)"
                                                value={typeAttributeForm.default_value}
                                                onChange={handleTypeAttributeInputChange}
                                                style={{ padding: 'var(--space-2)' }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                            <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                            <button type="button" onClick={() => setShowAddTypeAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                        </div>
                                    </form>
                                )}

                                {attributesLoading && <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>}
                                {!attributesLoading && typeAttributes.length === 0 && (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned to this type.</div>
                                )}
                                {!attributesLoading && typeAttributes.map((attr) => {
                                    const definition = attr.definition || attributeDefinitions.find((d) => d.asset_attribute_definition_id === attr.asset_attribute_definition);
                                    return (
                                        <div
                                            key={`${attr.asset_type}-${attr.asset_attribute_definition}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: 'var(--space-2) 0',
                                                borderBottom: '1px solid var(--color-border)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.asset_attribute_definition}`}</div>
                                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                                    {(definition?.data_type || 'n/a')}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                    {attr.is_mandatory ? ' • mandatory' : ''}
                                                    {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTypeAttribute(attr.asset_attribute_definition)}
                                                style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetsTypesPage;
