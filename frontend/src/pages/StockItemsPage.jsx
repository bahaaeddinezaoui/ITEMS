import { useEffect, useMemo, useState } from 'react';
import {
    authService,
    roomService,
    stockItemTypeService,
    stockItemModelService,
    stockItemBrandService,
    stockItemService,
    stockItemAttributeDefinitionService,
    stockItemTypeAttributeService,
    stockItemModelAttributeService,
    stockItemAttributeValueService
} from '../services/api';

const StockItemsPage = () => {
    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemBrands, setStockItemBrands] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [stockItemAttributeDefinitions, setStockItemAttributeDefinitions] = useState([]);
    const [stockItemTypeAttributes, setStockItemTypeAttributes] = useState([]);
    const [stockItemModelAttributes, setStockItemModelAttributes] = useState([]);
    const [stockItemAttributes, setStockItemAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingStockItem, setMovingStockItem] = useState(null);
    const [moveCurrentRoomId, setMoveCurrentRoomId] = useState(null);
    const [moveCurrentRoomLabel, setMoveCurrentRoomLabel] = useState('');
    const [selectedMoveRoomId, setSelectedMoveRoomId] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);

    // Attribute forms visibility
    const [showAttributeDefinitionForm, setShowAttributeDefinitionForm] = useState(false);
    const [showTypeAttributeForm, setShowTypeAttributeForm] = useState(false);
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [showStockItemAttributeForm, setShowStockItemAttributeForm] = useState(false);

    // Stock item selection for attribute values
    const [selectedStockItem, setSelectedStockItem] = useState(null);

    // Attribute form data
    const [attributeDefinitionForm, setAttributeDefinitionForm] = useState({
        description: '',
        data_type: '',
        unit: ''
    });
    const [typeAttributeForm, setTypeAttributeForm] = useState({
        stock_item_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });
    const [modelAttributeForm, setModelAttributeForm] = useState({
        stock_item_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [stockItemAttributeForm, setStockItemAttributeForm] = useState({
        stock_item_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    
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
        fetchStockItemAttributeDefinitions();
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await roomService.getAll();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            setRooms([]);
        }
    };

    useEffect(() => {
        const loadCurrentRoom = async () => {
            if (!showMoveModal || !movingStockItem) return;
            try {
                const current = await stockItemService.getCurrentRoom(movingStockItem.stock_item_id);
                const currentRoomId = current?.room_id ?? null;
                setMoveCurrentRoomId(currentRoomId);
                const currentRoomObj = rooms.find((r) => r.room_id === currentRoomId);
                setMoveCurrentRoomLabel(
                    currentRoomObj?.room_name || (currentRoomId ? `Room ${currentRoomId}` : 'Unknown')
                );
            } catch (err) {
                console.error(err);
                setMoveCurrentRoomId(null);
                setMoveCurrentRoomLabel('Unknown');
            }
        };
        loadCurrentRoom();
    }, [showMoveModal, movingStockItem, rooms]);

    useEffect(() => {
        if (selectedStockItemType) {
            fetchStockItemModels(selectedStockItemType.stock_item_type_id);
            fetchStockItemTypeAttributes(selectedStockItemType.stock_item_type_id);
            setSelectedStockItemModel(null);
            setSelectedStockItem(null);
            setStockItems([]);
            setStockItemModelAttributes([]);
            setStockItemAttributes([]);
        } else {
            setStockItemModels([]);
            setStockItemTypeAttributes([]);
        }
    }, [selectedStockItemType]);

    useEffect(() => {
        if (selectedStockItemModel) {
            fetchStockItems(selectedStockItemModel.stock_item_model_id);
            fetchStockItemModelAttributes(selectedStockItemModel.stock_item_model_id);
        } else {
            setStockItems([]);
            setStockItemModelAttributes([]);
            setSelectedStockItem(null);
            setStockItemAttributes([]);
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

    useEffect(() => {
        if (selectedStockItem) {
            fetchStockItemAttributes(selectedStockItem.stock_item_id);
        } else {
            setStockItemAttributes([]);
        }
    }, [selectedStockItem]);

    const definitionLookup = useMemo(() => {
        const map = new Map();
        stockItemAttributeDefinitions.forEach((def) => {
            map.set(def.stock_item_attribute_definition_id, def);
        });
        return map;
    }, [stockItemAttributeDefinitions]);

    const fetchStockItems = async (stockItemModelId) => {
        try {
            const data = await stockItemService.getAll({ stock_item_model: stockItemModelId });
            setStockItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock items: ' + err.message);
            setStockItems([]);
        }
    };

    const fetchStockItemAttributeDefinitions = async () => {
        try {
            const data = await stockItemAttributeDefinitionService.getAll();
            setStockItemAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item attribute definitions: ' + err.message);
            setStockItemAttributeDefinitions([]);
        }
    };

    const fetchStockItemTypeAttributes = async (stockItemTypeId) => {
        try {
            const data = await stockItemTypeAttributeService.getByStockItemType(stockItemTypeId);
            setStockItemTypeAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item type attributes: ' + err.message);
            setStockItemTypeAttributes([]);
        }
    };

    const fetchStockItemModelAttributes = async (stockItemModelId) => {
        try {
            const data = await stockItemModelAttributeService.getByStockItemModel(stockItemModelId);
            setStockItemModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item model attributes: ' + err.message);
            setStockItemModelAttributes([]);
        }
    };

    const fetchStockItemAttributes = async (stockItemId) => {
        try {
            const data = await stockItemAttributeValueService.getByStockItem(stockItemId);
            setStockItemAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch stock item attributes: ' + err.message);
            setStockItemAttributes([]);
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

    const handleAttributeDefinitionInputChange = (e) => {
        const { name, value } = e.target;
        setAttributeDefinitionForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTypeAttributeForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleModelAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModelAttributeForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleStockItemAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setStockItemAttributeForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            await fetchStockItemAttributeDefinitions();
        } catch (err) {
            setError('Failed to create stock item attribute definition: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTypeAttributeSubmit = async (e) => {
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
                is_mandatory: typeAttributeForm.is_mandatory,
                default_value: typeAttributeForm.default_value || null
            };
            await stockItemTypeAttributeService.create(payload);
            setTypeAttributeForm({ stock_item_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowTypeAttributeForm(false);
            await fetchStockItemTypeAttributes(selectedStockItemType.stock_item_type_id);
        } catch (err) {
            setError('Failed to assign attribute to stock item type: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItemModel) {
            setError('Please select a stock item model first');
            return;
        }
        if (!modelAttributeForm.stock_item_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                stock_item_model: selectedStockItemModel.stock_item_model_id,
                stock_item_attribute_definition: Number(modelAttributeForm.stock_item_attribute_definition),
                value_string: modelAttributeForm.value_string || null,
                value_number: modelAttributeForm.value_number ? Number(modelAttributeForm.value_number) : null,
                value_bool: modelAttributeForm.value_bool,
                value_date: modelAttributeForm.value_date || null
            };
            await stockItemModelAttributeService.create(payload);
            setModelAttributeForm({
                stock_item_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowModelAttributeForm(false);
            await fetchStockItemModelAttributes(selectedStockItemModel.stock_item_model_id);
        } catch (err) {
            setError('Failed to add model attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStockItemAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItem) {
            setError('Please select a stock item first');
            return;
        }
        if (!stockItemAttributeForm.stock_item_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                stock_item: selectedStockItem.stock_item_id,
                stock_item_attribute_definition: Number(stockItemAttributeForm.stock_item_attribute_definition),
                value_string: stockItemAttributeForm.value_string || null,
                value_number: stockItemAttributeForm.value_number ? Number(stockItemAttributeForm.value_number) : null,
                value_bool: stockItemAttributeForm.value_bool,
                value_date: stockItemAttributeForm.value_date || null
            };
            await stockItemAttributeValueService.create(payload);
            setStockItemAttributeForm({
                stock_item_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowStockItemAttributeForm(false);
            await fetchStockItemAttributes(selectedStockItem.stock_item_id);
        } catch (err) {
            setError('Failed to add stock item attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttributeDefinition = async (id) => {
        if (window.confirm('Delete this attribute definition?')) {
            try {
                await stockItemAttributeDefinitionService.delete(id);
                await fetchStockItemAttributeDefinitions();
            } catch (err) {
                setError('Failed to delete stock item attribute definition: ' + err.message);
            }
        }
    };

    const handleDeleteTypeAttribute = async (stockItemTypeId, definitionId) => {
        if (window.confirm('Remove this attribute from the stock item type?')) {
            try {
                await stockItemTypeAttributeService.delete(stockItemTypeId, definitionId);
                if (selectedStockItemType) {
                    await fetchStockItemTypeAttributes(selectedStockItemType.stock_item_type_id);
                }
            } catch (err) {
                setError('Failed to remove stock item type attribute: ' + err.message);
            }
        }
    };

    const handleDeleteModelAttribute = async (stockItemModelId, definitionId) => {
        if (window.confirm('Remove this attribute value from the stock item model?')) {
            try {
                await stockItemModelAttributeService.delete(stockItemModelId, definitionId);
                if (selectedStockItemModel) {
                    await fetchStockItemModelAttributes(selectedStockItemModel.stock_item_model_id);
                }
            } catch (err) {
                setError('Failed to remove stock item model attribute: ' + err.message);
            }
        }
    };

    const handleDeleteStockItemAttribute = async (stockItemId, definitionId) => {
        if (window.confirm('Remove this attribute value from the stock item?')) {
            try {
                await stockItemAttributeValueService.delete(stockItemId, definitionId);
                if (selectedStockItem) {
                    await fetchStockItemAttributes(selectedStockItem.stock_item_id);
                }
            } catch (err) {
                setError('Failed to remove stock item attribute: ' + err.message);
            }
        }
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

    const userAccount = authService.getUser();
    const isSuperuser = userAccount?.is_superuser;
    const isStockConsumableResponsible = userAccount?.roles?.some(r => r.role_code === 'stock_consumable_responsible') || isSuperuser;
    const canMoveStockItems = isStockConsumableResponsible;

    const openMoveModal = (item) => {
        setMovingStockItem(item);
        setMoveCurrentRoomId(null);
        setMoveCurrentRoomLabel('');
        setSelectedMoveRoomId('');
        setShowMoveModal(true);
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setMovingStockItem(null);
        setMoveCurrentRoomId(null);
        setMoveCurrentRoomLabel('');
        setSelectedMoveRoomId('');
    };

    const submitMove = async (e) => {
        e.preventDefault();
        if (!movingStockItem || !selectedMoveRoomId) return;
        setMoveSubmitting(true);
        setError(null);
        try {
            await stockItemService.move(movingStockItem.stock_item_id, {
                destination_room_id: selectedMoveRoomId,
            });
            if (selectedStockItemModel) {
                await fetchStockItems(selectedStockItemModel.stock_item_model_id);
            }
            closeMoveModal();
        } catch (err) {
            setError('Failed to move stock item: ' + (err?.response?.data?.error || err.message));
        } finally {
            setMoveSubmitting(false);
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontWeight: '600' }}>Attribute Definitions</div>
                                            <button
                                                onClick={() => setShowAttributeDefinitionForm(!showAttributeDefinitionForm)}
                                                style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                        {showAttributeDefinitionForm && (
                                            <form onSubmit={handleAttributeDefinitionSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    placeholder="Description"
                                                    value={attributeDefinitionForm.description}
                                                    onChange={handleAttributeDefinitionInputChange}
                                                    required
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                                    <select
                                                        name="data_type"
                                                        value={attributeDefinitionForm.data_type}
                                                        onChange={handleAttributeDefinitionInputChange}
                                                        style={{ padding: 'var(--space-2)' }}
                                                    >
                                                        <option value="">Data Type</option>
                                                        <option value="string">String</option>
                                                        <option value="number">Number</option>
                                                        <option value="bool">Boolean</option>
                                                        <option value="date">Date</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        name="unit"
                                                        placeholder="Unit"
                                                        value={attributeDefinitionForm.unit}
                                                        onChange={handleAttributeDefinitionInputChange}
                                                        style={{ padding: 'var(--space-2)' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                                    <button type="button" onClick={() => setShowAttributeDefinitionForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                                </div>
                                            </form>
                                        )}
                                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                            {stockItemAttributeDefinitions.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attribute definitions.</div>
                                            ) : (
                                                stockItemAttributeDefinitions.map((def) => (
                                                    <div key={def.stock_item_attribute_definition_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{def.description || `Attribute ${def.stock_item_attribute_definition_id}`}</div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{def.data_type || 'type'}{def.unit ? ` • ${def.unit}` : ''}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAttributeDefinition(def.stock_item_attribute_definition_id)}
                                                            style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontWeight: '600' }}>Stock Item Type Attributes</div>
                                            <button
                                                onClick={() => setShowTypeAttributeForm(!showTypeAttributeForm)}
                                                style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                            >
                                                + Assign
                                            </button>
                                        </div>
                                        {showTypeAttributeForm && (
                                            <form onSubmit={handleTypeAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                                <select
                                                    name="stock_item_attribute_definition"
                                                    value={typeAttributeForm.stock_item_attribute_definition}
                                                    onChange={handleTypeAttributeInputChange}
                                                    required
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                >
                                                    <option value="">Select attribute definition...</option>
                                                    {stockItemAttributeDefinitions.map((def) => (
                                                        <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                            {def.description || `Attribute ${def.stock_item_attribute_definition_id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    name="default_value"
                                                    placeholder="Default value"
                                                    value={typeAttributeForm.default_value}
                                                    onChange={handleTypeAttributeInputChange}
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                />
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="is_mandatory"
                                                        checked={typeAttributeForm.is_mandatory}
                                                        onChange={handleTypeAttributeInputChange}
                                                    />
                                                    Mandatory
                                                </label>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                                    <button type="button" onClick={() => setShowTypeAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                                </div>
                                            </form>
                                        )}
                                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                            {stockItemTypeAttributes.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned.</div>
                                            ) : (
                                                stockItemTypeAttributes.map((attr) => {
                                                    const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                                    return (
                                                        <div key={`${attr.stock_item_type}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.stock_item_attribute_definition}`}</div>
                                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                    {definition?.data_type || 'type'}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                                    {attr.is_mandatory ? ' • mandatory' : ''}
                                                                    {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteTypeAttribute(attr.stock_item_type, attr.stock_item_attribute_definition)}
                                                                style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                        <div style={{ fontWeight: '600' }}>Stock Item Model Attributes</div>
                                        <button
                                            onClick={() => setShowModelAttributeForm(!showModelAttributeForm)}
                                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                        >
                                            + Add Value
                                        </button>
                                    </div>
                                    {showModelAttributeForm && (
                                        <form onSubmit={handleModelAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                            <select
                                                name="stock_item_attribute_definition"
                                                value={modelAttributeForm.stock_item_attribute_definition}
                                                onChange={handleModelAttributeInputChange}
                                                required
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            >
                                                <option value="">Select attribute definition...</option>
                                                {stockItemAttributeDefinitions.map((def) => (
                                                    <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                        {def.description || `Attribute ${def.stock_item_attribute_definition_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {(() => {
                                                const selectedDef = definitionLookup.get(Number(modelAttributeForm.stock_item_attribute_definition));
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
                                    {stockItemModelAttributes.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No model attribute values.</div>
                                    ) : (
                                        stockItemModelAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            return (
                                                <div key={`${attr.stock_item_model}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.stock_item_attribute_definition}`}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteModelAttribute(attr.stock_item_model, attr.stock_item_attribute_definition)}
                                                        style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                        <div style={{ fontWeight: '600' }}>
                                            Stock Item Attributes {selectedStockItem ? `• ${selectedStockItem.stock_item_name || 'Item ' + selectedStockItem.stock_item_id}` : ''}
                                        </div>
                                        <button
                                            onClick={() => setShowStockItemAttributeForm(!showStockItemAttributeForm)}
                                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                        >
                                            + Add Value
                                        </button>
                                    </div>
                                    {showStockItemAttributeForm && (
                                        <form onSubmit={handleStockItemAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                            <select
                                                name="stock_item_attribute_definition"
                                                value={stockItemAttributeForm.stock_item_attribute_definition}
                                                onChange={handleStockItemAttributeInputChange}
                                                required
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            >
                                                <option value="">Select attribute definition...</option>
                                                {stockItemAttributeDefinitions.map((def) => (
                                                    <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                        {def.description || `Attribute ${def.stock_item_attribute_definition_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {(() => {
                                                const selectedDef = definitionLookup.get(Number(stockItemAttributeForm.stock_item_attribute_definition));
                                                const dataType = selectedDef?.data_type?.toLowerCase();
                                                if (dataType === 'number') {
                                                    return (
                                                        <input
                                                            type="number"
                                                            name="value_number"
                                                            placeholder="Number value"
                                                            value={stockItemAttributeForm.value_number}
                                                            onChange={handleStockItemAttributeInputChange}
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
                                                                checked={stockItemAttributeForm.value_bool}
                                                                onChange={handleStockItemAttributeInputChange}
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
                                                            value={stockItemAttributeForm.value_date}
                                                            onChange={handleStockItemAttributeInputChange}
                                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <input
                                                        type="text"
                                                        name="value_string"
                                                        placeholder="String value"
                                                        value={stockItemAttributeForm.value_string}
                                                        onChange={handleStockItemAttributeInputChange}
                                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                    />
                                                );
                                            })()}
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                                <button type="button" onClick={() => setShowStockItemAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                    {!selectedStockItem ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>Select a stock item to view or add values.</div>
                                    ) : stockItemAttributes.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No attribute values set for this stock item.</div>
                                    ) : (
                                        stockItemAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            return (
                                                <div key={`${attr.stock_item}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.stock_item_attribute_definition}`}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteStockItemAttribute(attr.stock_item, attr.stock_item_attribute_definition)}
                                                        style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

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
                                                <tr
                                                    key={item.stock_item_id}
                                                    onClick={() => setSelectedStockItem(item)}
                                                    style={{
                                                        borderBottom: '1px solid var(--color-border)',
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedStockItem?.stock_item_id === item.stock_item_id ? 'var(--color-bg-secondary)' : 'transparent'
                                                    }}
                                                >
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
                                                            onClick={(e) => { e.stopPropagation(); setSelectedStockItem(item); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Attributes
                                                        </button>
                                                        {canMoveStockItems && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openMoveModal(item); }}
                                                                style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                Move
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditStockItem(item); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteStockItem(item.stock_item_id); }}
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
                    ) : selectedStockItemType ? (
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
                                        {selectedStockItemType.stock_item_type_label}
                                    </h2>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontWeight: '600' }}>Attribute Definitions</div>
                                            <button
                                                onClick={() => setShowAttributeDefinitionForm(!showAttributeDefinitionForm)}
                                                style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                        {showAttributeDefinitionForm && (
                                            <form onSubmit={handleAttributeDefinitionSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    placeholder="Description"
                                                    value={attributeDefinitionForm.description}
                                                    onChange={handleAttributeDefinitionInputChange}
                                                    required
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                                    <select
                                                        name="data_type"
                                                        value={attributeDefinitionForm.data_type}
                                                        onChange={handleAttributeDefinitionInputChange}
                                                        style={{ padding: 'var(--space-2)' }}
                                                    >
                                                        <option value="">Data Type</option>
                                                        <option value="string">String</option>
                                                        <option value="number">Number</option>
                                                        <option value="bool">Boolean</option>
                                                        <option value="date">Date</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        name="unit"
                                                        placeholder="Unit"
                                                        value={attributeDefinitionForm.unit}
                                                        onChange={handleAttributeDefinitionInputChange}
                                                        style={{ padding: 'var(--space-2)' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                                    <button type="button" onClick={() => setShowAttributeDefinitionForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                                </div>
                                            </form>
                                        )}
                                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                            {stockItemAttributeDefinitions.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attribute definitions.</div>
                                            ) : (
                                                stockItemAttributeDefinitions.map((def) => (
                                                    <div key={def.stock_item_attribute_definition_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{def.description || `Attribute ${def.stock_item_attribute_definition_id}`}</div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{def.data_type || 'type'}{def.unit ? ` • ${def.unit}` : ''}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAttributeDefinition(def.stock_item_attribute_definition_id)}
                                                            style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontWeight: '600' }}>Stock Item Type Attributes</div>
                                            <button
                                                onClick={() => setShowTypeAttributeForm(!showTypeAttributeForm)}
                                                style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                            >
                                                + Assign
                                            </button>
                                        </div>
                                        {showTypeAttributeForm && (
                                            <form onSubmit={handleTypeAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                                <select
                                                    name="stock_item_attribute_definition"
                                                    value={typeAttributeForm.stock_item_attribute_definition}
                                                    onChange={handleTypeAttributeInputChange}
                                                    required
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                >
                                                    <option value="">Select attribute definition...</option>
                                                    {stockItemAttributeDefinitions.map((def) => (
                                                        <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                            {def.description || `Attribute ${def.stock_item_attribute_definition_id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    name="default_value"
                                                    placeholder="Default value"
                                                    value={typeAttributeForm.default_value}
                                                    onChange={handleTypeAttributeInputChange}
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                />
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="is_mandatory"
                                                        checked={typeAttributeForm.is_mandatory}
                                                        onChange={handleTypeAttributeInputChange}
                                                    />
                                                    Mandatory
                                                </label>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                                    <button type="button" onClick={() => setShowTypeAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                                </div>
                                            </form>
                                        )}
                                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                            {stockItemTypeAttributes.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned.</div>
                                            ) : (
                                                stockItemTypeAttributes.map((attr) => {
                                                    const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                                    return (
                                                        <div key={`${attr.stock_item_type}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.stock_item_attribute_definition}`}</div>
                                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                    {definition?.data_type || 'type'}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                                    {attr.is_mandatory ? ' • mandatory' : ''}
                                                                    {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteTypeAttribute(attr.stock_item_type, attr.stock_item_attribute_definition)}
                                                                style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
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

            {showMoveModal && movingStockItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text)',
                        padding: 'var(--space-6)',
                        borderRadius: 'var(--radius-md)',
                        width: '100%',
                        maxWidth: '520px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
                            <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
                                Move Stock Item: {movingStockItem.stock_item_name || `Item ${movingStockItem.stock_item_id}`}
                            </h2>
                            <button
                                type="button"
                                onClick={() => !moveSubmitting && closeMoveModal()}
                                style={{
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '6px 10px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={submitMove}>
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <div style={{
                                    marginBottom: 'var(--space-3)',
                                    padding: 'var(--space-3)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)'
                                }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Current room</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {moveCurrentRoomLabel || 'Unknown'}
                                    </div>
                                </div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Destination room</label>
                                <select
                                    value={selectedMoveRoomId}
                                    onChange={(e) => setSelectedMoveRoomId(e.target.value)}
                                    required
                                    disabled={moveSubmitting}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-2)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text)'
                                    }}
                                >
                                    <option value="">Select a room...</option>
                                    {rooms.map((r) => (
                                        <option key={r.room_id} value={r.room_id}>
                                            {r.room_name || `Room ${r.room_id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => !moveSubmitting && closeMoveModal()}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={moveSubmitting || !selectedMoveRoomId}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    {moveSubmitting ? 'Moving...' : 'Move'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockItemsPage;
