import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockItemAttributeDefinitionService, stockItemTypeAttributeService, stockItemTypeService } from '../services/api';

const StockItemsTypesPage = () => {
    const navigate = useNavigate();

    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [selectedStockItemType, setSelectedStockItemType] = useState(null);
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [attributesLoading, setAttributesLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showAttributeDefinitionForm, setShowAttributeDefinitionForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        stock_item_type_label: '',
        stock_item_type_code: '',
    });

    const [attributeDefinitionForm, setAttributeDefinitionForm] = useState({
        description: '',
        data_type: '',
        unit: ''
    });

    const [showAddTypeAttributeForm, setShowAddTypeAttributeForm] = useState(false);
    const [typeAttributeForm, setTypeAttributeForm] = useState({
        stock_item_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });

    useEffect(() => {
        fetchTypes();
        fetchAttributeDefinitions();
    }, []);

    const fetchTypes = async () => {
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

    const fetchTypeAttributes = async (stockItemTypeId) => {
        setAttributesLoading(true);
        setError(null);
        try {
            const data = await stockItemTypeAttributeService.getByStockItemType(stockItemTypeId);
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
        if (!selectedStockItemType) {
            setError('Please select a stock item type first');
            return;
        }
        if (!typeAttributeForm.stock_item_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                stock_item_type: selectedStockItemType.stock_item_type_id,
                stock_item_attribute_definition: Number(typeAttributeForm.stock_item_attribute_definition),
                is_mandatory: !!typeAttributeForm.is_mandatory,
                default_value: typeAttributeForm.default_value || null,
            };
            await stockItemTypeAttributeService.create(payload);
            setTypeAttributeForm({ stock_item_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowAddTypeAttributeForm(false);
            await fetchTypeAttributes(selectedStockItemType.stock_item_type_id);
        } catch (err) {
            setError('Failed to add type attribute: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTypeAttribute = async (definitionId) => {
        if (!selectedStockItemType) return;
        if (!window.confirm('Remove this attribute from the stock item type?')) return;
        try {
            await stockItemTypeAttributeService.delete(selectedStockItemType.stock_item_type_id, definitionId);
            await fetchTypeAttributes(selectedStockItemType.stock_item_type_id);
        } catch (err) {
            setError('Failed to remove type attribute: ' + err.message);
        }
    };

    const fetchAttributeDefinitions = async () => {
        try {
            const data = await stockItemAttributeDefinitionService.getAll();
            setAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item attribute definitions: ' + err.message);
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
            await stockItemTypeService.create(formData);
            setFormData({ stock_item_type_label: '', stock_item_type_code: '' });
            setShowTypeForm(false);
            await fetchTypes();
        } catch (err) {
            setError('Failed to create stock item type: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock item type?')) {
            try {
                await stockItemTypeService.delete(id);
                await fetchTypes();
            } catch (err) {
                setError('Failed to delete stock item type: ' + err.message);
            }
        }
    };

    const handleAttributeDefinitionSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                description: attributeDefinitionForm.description || null,
                data_type: attributeDefinitionForm.data_type || null,
                unit: attributeDefinitionForm.unit || null
            };
            await stockItemAttributeDefinitionService.create(payload);
            setAttributeDefinitionForm({ description: '', data_type: '', unit: '' });
            setShowAttributeDefinitionForm(false);
            await fetchAttributeDefinitions();
        } catch (err) {
            setError('Failed to create stock item attribute definition: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttributeDefinition = async (id) => {
        if (window.confirm('Delete this attribute definition?')) {
            try {
                await stockItemAttributeDefinitionService.delete(id);
                await fetchAttributeDefinitions();
            } catch (err) {
                setError('Failed to delete stock item attribute definition: ' + err.message);
            }
        }
    };

    const goToModels = (type) => {
        navigate(`/dashboard/stock-items/models?typeId=${type.stock_item_type_id}`);
    };

    const showTypeAttributes = async (type) => {
        setSelectedStockItemType(type);
        setShowAddTypeAttributeForm(false);
        setTypeAttributeForm({ stock_item_attribute_definition: '', is_mandatory: false, default_value: '' });
        await fetchTypeAttributes(type.stock_item_type_id);
    };

    const assignedDefinitionIds = new Set((Array.isArray(typeAttributes) ? typeAttributes : []).map((a) => a.stock_item_attribute_definition));
    const availableAttributeDefinitions = (Array.isArray(attributeDefinitions) ? attributeDefinitions : []).filter(
        (d) => !assignedDefinitionIds.has(d.stock_item_attribute_definition_id)
    );

    const goToAttributeDefinitions = () => {
        navigate('/dashboard/stock-items/attribute-definitions');
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Stock Items</h1>
                <p className="page-subtitle">Select a stock item type</p>
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
                        {stockItemTypes.map((type) => (
                            <div
                                key={type.stock_item_type_id}
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
                                <span style={{ fontWeight: '500' }}>{type.stock_item_type_label}</span>
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
                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.stock_item_type_id); }}
                                        style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}

                        {stockItemTypes.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No stock item types.
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
                            Type Attributes {selectedStockItemType ? `• ${selectedStockItemType.stock_item_type_label}` : ''}
                        </h2>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => setShowAddTypeAttributeForm((v) => !v)}
                                disabled={!selectedStockItemType}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--color-primary)',
                                    cursor: selectedStockItemType ? 'pointer' : 'not-allowed',
                                    opacity: selectedStockItemType ? 1 : 0.6
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
                        {!selectedStockItemType ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>Click "Attributes" on a type to view its attributes.</div>
                        ) : (
                            <>
                                {showAddTypeAttributeForm && (
                                    <form onSubmit={handleAddTypeAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                        <select
                                            name="stock_item_attribute_definition"
                                            value={typeAttributeForm.stock_item_attribute_definition}
                                            onChange={handleTypeAttributeInputChange}
                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                        >
                                            <option value="">Select attribute definition...</option>
                                            {availableAttributeDefinitions.map((def) => (
                                                <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                    {def.description || `Attribute ${def.stock_item_attribute_definition_id}`}
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
                                    const definition = attr.definition || attributeDefinitions.find((d) => d.stock_item_attribute_definition_id === attr.stock_item_attribute_definition);
                                    return (
                                        <div
                                            key={`${attr.stock_item_type}-${attr.stock_item_attribute_definition}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: 'var(--space-2) 0',
                                                borderBottom: '1px solid var(--color-border)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.stock_item_attribute_definition}`}</div>
                                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                                    {(definition?.data_type || 'n/a')}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                    {attr.is_mandatory ? ' • mandatory' : ''}
                                                    {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTypeAttribute(attr.stock_item_attribute_definition)}
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

export default StockItemsTypesPage;
