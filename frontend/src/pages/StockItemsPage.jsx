import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    authService,
    personService,
    roomService,
    stockItemAssignmentService,
    stockItemTypeService,
    stockItemModelService,
    stockItemBrandService,
    stockItemService,
    stockItemAttributeDefinitionService,
    stockItemTypeAttributeService,
    stockItemAttributeValueService
} from '../services/api';

const StockItemsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const typeIdParam = searchParams.get('typeId');
    const modelIdParam = searchParams.get('modelId');
    const isInstancesMode = location.pathname.endsWith('/instances');

    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemBrands, setStockItemBrands] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [persons, setPersons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [stockItemAttributeDefinitions, setStockItemAttributeDefinitions] = useState([]);
    const [stockItemTypeAttributes, setStockItemTypeAttributes] = useState([]);
    const [stockItemAttributes, setStockItemAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingStockItem, setMovingStockItem] = useState(null);
    const [moveCurrentRoomId, setMoveCurrentRoomId] = useState(null);
    const [moveCurrentRoomLabel, setMoveCurrentRoomLabel] = useState('');
    const [selectedMoveRoomId, setSelectedMoveRoomId] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);

    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assigningStockItem, setAssigningStockItem] = useState(null);
    const [dischargingAssignment, setDischargingAssignment] = useState(null);
    const [assignFormData, setAssignFormData] = useState({
        person: '',
        start_datetime: '',
        condition_on_assignment: 'Good'
    });

    const [showTypeAttributeForm, setShowTypeAttributeForm] = useState(false);
    const [showStockItemAttributeForm, setShowStockItemAttributeForm] = useState(false);
    const [showStockItemDetailsModal, setShowStockItemDetailsModal] = useState(false);

    // Stock item selection for attribute values
    const [selectedStockItem, setSelectedStockItem] = useState(null);

    const [typeAttributeForm, setTypeAttributeForm] = useState({
        stock_item_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
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
        fetchPersons();
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!typeIdParam || !modelIdParam) {
            navigate('/dashboard/stock-items/types', { replace: true });
        }
    }, [isInstancesMode, typeIdParam, modelIdParam, navigate]);

    const fetchRooms = async () => {
        try {
            const data = await roomService.getAll();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            setRooms([]);
        }
    };

    const fetchPersons = async () => {
        try {
            const data = await personService.getAll();
            setPersons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch persons:', err);
            setPersons([]);
        }
    };

    const fetchAssignments = async () => {
        try {
            const data = await stockItemAssignmentService.getAll();
            setAssignments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch stock item assignments:', err);
            setAssignments([]);
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
            setStockItemAttributes([]);
        } else {
            setStockItemModels([]);
            setStockItemTypeAttributes([]);
        }
    }, [selectedStockItemType]);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!typeIdParam) return;
        if (!Array.isArray(stockItemTypes) || stockItemTypes.length === 0) return;
        const foundType = stockItemTypes.find((t) => String(t.stock_item_type_id) === String(typeIdParam)) || null;
        if (foundType && selectedStockItemType?.stock_item_type_id !== foundType.stock_item_type_id) {
            setSelectedStockItemType(foundType);
        }
    }, [isInstancesMode, typeIdParam, stockItemTypes, selectedStockItemType]);

    useEffect(() => {
        if (selectedStockItemModel) {
            fetchStockItems(selectedStockItemModel.stock_item_model_id);
        } else {
            setStockItems([]);
            setSelectedStockItem(null);
            setStockItemAttributes([]);
        }
    }, [selectedStockItemModel]);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!modelIdParam) return;
        if (!Array.isArray(stockItemModels) || stockItemModels.length === 0) return;
        const foundModel = stockItemModels.find((m) => String(m.stock_item_model_id) === String(modelIdParam)) || null;
        if (foundModel && selectedStockItemModel?.stock_item_model_id !== foundModel.stock_item_model_id) {
            setSelectedStockItemModel(foundModel);
        }
    }, [isInstancesMode, modelIdParam, stockItemModels, selectedStockItemModel]);

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
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleStockItemInputChange = (e) => {
        const { name, value } = e.target;
        setStockItemFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTypeAttributeForm(prev => ({
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

    const openStockItemDetailsModal = (item) => {
        setSelectedStockItem(item);
        setShowStockItemDetailsModal(true);
    };

    const closeStockItemDetailsModal = () => {
        setShowStockItemDetailsModal(false);
        setShowStockItemAttributeForm(false);
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItemType) {
            setError('Please select a stock item type first');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...modelFormData,
                stock_item_brand: modelFormData.stock_item_brand ? Number(modelFormData.stock_item_brand) : null,
                stock_item_type: selectedStockItemType.stock_item_type_id,
                release_year: modelFormData.release_year ? Number(modelFormData.release_year) : null,
                discontinued_year: modelFormData.discontinued_year ? Number(modelFormData.discontinued_year) : null,
                warranty_expiry_in_months: modelFormData.warranty_expiry_in_months ? Number(modelFormData.warranty_expiry_in_months) : null,
            };
            await stockItemModelService.create(payload);
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
            setError('Failed to create stock item model: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock item model?')) {
            try {
                await stockItemModelService.delete(id);
                if (selectedStockItemModel?.stock_item_model_id === id) {
                    setSelectedStockItemModel(null);
                }
                if (selectedStockItemType) {
                    await fetchStockItemModels(selectedStockItemType.stock_item_type_id);
                }
            } catch (err) {
                setError('Failed to delete stock item model: ' + err.message);
            }
        }
    };

    const handleStockItemSubmit = async (e) => {
        e.preventDefault();
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

    const handleAssignInputChange = (e) => {
        const { name, value } = e.target;
        setAssignFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assigningStockItem) return;
        setSaving(true);
        setError(null);
        try {
            await stockItemAssignmentService.create({
                person: assignFormData.person,
                stock_item: assigningStockItem.stock_item_id,
                start_datetime: new Date(assignFormData.start_datetime).toISOString(),
                condition_on_assignment: assignFormData.condition_on_assignment,
            });
            setShowAssignForm(false);
            setAssigningStockItem(null);
            await fetchAssignments();
            alert('Stock item assigned successfully!');
        } catch (err) {
            setError('Failed to assign stock item: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDischarge = async (assignmentId) => {
        setSaving(true);
        setError(null);
        try {
            await stockItemAssignmentService.discharge(assignmentId);
            setDischargingAssignment(null);
            await fetchAssignments();
            alert('Stock item discharged successfully!');
        } catch (err) {
            setError('Failed to discharge stock item: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const userAccount = authService.getUser();
    const isSuperuser = userAccount?.is_superuser;
    const isStockConsumableResponsible = userAccount?.roles?.some(r => r.role_code === 'stock_consumable_responsible') || isSuperuser;
    const isExploitationChief = userAccount?.roles?.some(r => r.role_code === 'exploitation_chief') || isSuperuser;
    const canMoveStockItems = isStockConsumableResponsible;
    const canAssignStockItems = isStockConsumableResponsible || isExploitationChief;

    const activeAssignmentsByStockItem = useMemo(() => {
        const map = new Map();
        assignments.forEach((a) => {
            if (a.is_active) {
                map.set(a.stock_item?.stock_item_id ?? a.stock_item, a);
            }
        });
        return map;
    }, [assignments]);

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div>
                        <h1 className="page-title">Stock Items Explorer</h1>
                        <p className="page-subtitle">Manage stock item types, models, and inventory</p>
                    </div>
                    {isInstancesMode && (
                        <button
                            type="button"
                            onClick={() => {
                                if (typeIdParam) {
                                    navigate(`/dashboard/stock-items/models?typeId=${typeIdParam}`);
                                } else {
                                    navigate('/dashboard/stock-items/types');
                                }
                            }}
                            style={{
                                padding: 'var(--space-2) var(--space-4)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                height: 'fit-content'
                            }}
                            title="Back"
                            aria-label="Back"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    )}
                </div>
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
                gridTemplateColumns: isInstancesMode ? '1fr' : '300px 1fr', 
                gap: 'var(--space-6)',
                flex: 1,
                minHeight: 0 // Important for nested scrolling
            }}>
                {!isInstancesMode && (
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
                )}

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
                                                <tr
                                                    key={item.stock_item_id}
                                                    onClick={() => openStockItemDetailsModal(item)}
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
                                                            onClick={(e) => { e.stopPropagation(); openStockItemDetailsModal(item); }}
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
                                                        {canAssignStockItems && (
                                                            (() => {
                                                                const activeAssignment = activeAssignmentsByStockItem.get(item.stock_item_id);
                                                                return activeAssignment ? (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setDischargingAssignment(activeAssignment); }}
                                                                        style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500' }}
                                                                    >
                                                                        Discharge
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAssigningStockItem(item);
                                                                            const now = new Date();
                                                                            const tzOffset = now.getTimezoneOffset() * 60000;
                                                                            const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
                                                                            setAssignFormData({
                                                                                person: '',
                                                                                start_datetime: localISOTime,
                                                                                condition_on_assignment: item.stock_item_status === 'active' ? 'Good' : 'Needs Repair'
                                                                            });
                                                                            setShowAssignForm(true);
                                                                        }}
                                                                        style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: '500' }}
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                );
                                                            })()
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
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

            {showStockItemDetailsModal && selectedStockItem && (
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
                    zIndex: 1000,
                    padding: 'var(--space-4)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text)',
                        padding: 'var(--space-6)',
                        borderRadius: 'var(--radius-md)',
                        width: '100%',
                        maxWidth: '720px',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
                                    {selectedStockItem.stock_item_name || `Item ${selectedStockItem.stock_item_id}`}
                                </h2>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                    Inventory: {selectedStockItem.stock_item_inventory_number || '—'} • Status: {selectedStockItem.stock_item_status || '—'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeStockItemDetailsModal}
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

                        <div style={{
                            marginBottom: 'var(--space-6)',
                            padding: 'var(--space-4)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-bg-secondary)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>Warranty (months)</div>
                                    <div style={{ fontWeight: 600 }}>{selectedStockItem.stock_item_warranty_expiry_in_months ?? '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>Assigned to</div>
                                    {(() => {
                                        const activeAssignment = activeAssignmentsByStockItem.get(selectedStockItem.stock_item_id);
                                        return (
                                            <div style={{ fontWeight: 600 }}>
                                                {activeAssignment?.person_name || '—'}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                <div style={{ fontWeight: '600' }}>Stock Item Attributes</div>
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

                            {stockItemAttributes.length === 0 ? (
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
                    </div>
                </div>
            )}

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

            {showAssignForm && assigningStockItem && (
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
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Assign Stock Item: {assigningStockItem.stock_item_name || `Item ${assigningStockItem.stock_item_id}`}</h2>
                        <form onSubmit={handleAssignSubmit}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Assign to Person</label>
                                <select
                                    name="person"
                                    value={assignFormData.person}
                                    onChange={handleAssignInputChange}
                                    required
                                    disabled={saving}
                                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                >
                                    <option value="">Select a person...</option>
                                    {persons.map(p => (
                                        <option key={p.person_id} value={p.person_id}>
                                            {p.first_name} {p.last_name} ({p.person_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Start Date (Automatic)</label>
                                <input
                                    type="datetime-local"
                                    name="start_datetime"
                                    value={assignFormData.start_datetime}
                                    onChange={handleAssignInputChange}
                                    required
                                    readOnly
                                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Condition</label>
                                <input
                                    type="text"
                                    name="condition_on_assignment"
                                    value={assignFormData.condition_on_assignment}
                                    onChange={handleAssignInputChange}
                                    placeholder="e.g. Good, New"
                                    required
                                    disabled={saving}
                                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowAssignForm(false); setAssigningStockItem(null); }}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--color-text)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    {saving ? 'Assigning...' : 'Assign Stock Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {dischargingAssignment && (
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
                        maxWidth: '420px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Confirm Discharge</h2>
                        <p style={{ marginBottom: 'var(--space-6)' }}>
                            Are you sure you want to end the assignment of <strong>{dischargingAssignment.stock_item?.stock_item_name || 'Stock Item'}</strong> to person <strong>{dischargingAssignment.person}</strong>?
                            <br /><br />
                            The end date will be set to right now.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setDischargingAssignment(null)}
                                style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--color-text)' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDischarge(dischargingAssignment.assignment_id)}
                                disabled={saving}
                                style={{ padding: 'var(--space-2) var(--space-4)', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {saving ? 'Discharging...' : 'Confirm Discharge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockItemsPage;
