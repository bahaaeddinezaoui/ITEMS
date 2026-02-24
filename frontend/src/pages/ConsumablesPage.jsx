import { useEffect, useMemo, useState } from 'react';
import {
    authService,
    personService,
    roomService,
    consumableTypeService,
    consumableModelService,
    consumableBrandService,
    consumableService,
    consumableAssignmentService,
    consumableAttributeDefinitionService,
    consumableTypeAttributeService,
    consumableModelAttributeService,
    consumableAttributeValueService
} from '../services/api';

const ConsumablesPage = () => {
    const [consumableTypes, setConsumableTypes] = useState([]);
    const [consumableBrands, setConsumableBrands] = useState([]);
    const [consumableModels, setConsumableModels] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [persons, setPersons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [consumableAttributeDefinitions, setConsumableAttributeDefinitions] = useState([]);
    const [consumableTypeAttributes, setConsumableTypeAttributes] = useState([]);
    const [consumableModelAttributes, setConsumableModelAttributes] = useState([]);
    const [consumableAttributes, setConsumableAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingConsumable, setMovingConsumable] = useState(null);
    const [moveCurrentRoomId, setMoveCurrentRoomId] = useState(null);
    const [moveCurrentRoomLabel, setMoveCurrentRoomLabel] = useState('');
    const [selectedMoveRoomId, setSelectedMoveRoomId] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);

    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assigningConsumable, setAssigningConsumable] = useState(null);
    const [dischargingAssignment, setDischargingAssignment] = useState(null);
    const [assignFormData, setAssignFormData] = useState({
        person: '',
        start_datetime: '',
        condition_on_assignment: 'Good'
    });

    // Attribute forms visibility
    const [showAttributeDefinitionForm, setShowAttributeDefinitionForm] = useState(false);
    const [showTypeAttributeForm, setShowTypeAttributeForm] = useState(false);
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [showConsumableAttributeForm, setShowConsumableAttributeForm] = useState(false);

    // Attribute form data
    const [attributeDefinitionForm, setAttributeDefinitionForm] = useState({
        description: '',
        data_type: '',
        unit: ''
    });
    const [typeAttributeForm, setTypeAttributeForm] = useState({
        consumable_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });
    const [modelAttributeForm, setModelAttributeForm] = useState({
        consumable_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [consumableAttributeForm, setConsumableAttributeForm] = useState({
        consumable_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    
    // Form visibility states
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [showConsumableForm, setShowConsumableForm] = useState(false);
    
    // Selection states
    const [selectedConsumableType, setSelectedConsumableType] = useState(null);
    const [selectedConsumableModel, setSelectedConsumableModel] = useState(null);
    const [selectedConsumable, setSelectedConsumable] = useState(null);
    
    // Form data states
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
    const [consumableFormData, setConsumableFormData] = useState({
        consumable_name: '',
        consumable_inventory_number: '',
        consumable_status: 'active',
        consumable_warranty_expiry_in_months: '',
        consumable_name_in_administrative_certificate: '',
        destruction_certificate_id: '',
        maintenance_step_id: null
    });
    
    const [editingConsumable, setEditingConsumable] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConsumableTypes();
        fetchConsumableBrands();
        fetchConsumableAttributeDefinitions();
        fetchRooms();
        fetchPersons();
        fetchAssignments();
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
            const data = await consumableAssignmentService.getAll();
            setAssignments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch consumable assignments:', err);
            setAssignments([]);
        }
    };

    useEffect(() => {
        const loadCurrentRoom = async () => {
            if (!showMoveModal || !movingConsumable) return;
            try {
                const current = await consumableService.getCurrentRoom(movingConsumable.consumable_id);
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
    }, [showMoveModal, movingConsumable, rooms]);

    useEffect(() => {
        if (selectedConsumableType) {
            fetchConsumableModels(selectedConsumableType.consumable_type_id);
            fetchConsumableTypeAttributes(selectedConsumableType.consumable_type_id);
            setSelectedConsumableModel(null);
            setConsumables([]);
            setConsumableModelAttributes([]);
            setSelectedConsumable(null);
            setConsumableAttributes([]);
        } else {
            setConsumableModels([]);
            setConsumableTypeAttributes([]);
            setConsumableModelAttributes([]);
            setSelectedConsumable(null);
            setConsumableAttributes([]);
        }
    }, [selectedConsumableType]);

    useEffect(() => {
        if (selectedConsumableModel) {
            fetchConsumables(selectedConsumableModel.consumable_model_id);
            fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
        } else {
            setConsumables([]);
            setConsumableModelAttributes([]);
            setSelectedConsumable(null);
            setConsumableAttributes([]);
        }
    }, [selectedConsumableModel]);

    useEffect(() => {
        if (selectedConsumable) {
            fetchConsumableAttributes(selectedConsumable.consumable_id);
        } else {
            setConsumableAttributes([]);
        }
    }, [selectedConsumable]);

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

    const fetchConsumables = async (consumableModelId) => {
        try {
            const data = await consumableService.getAll({ consumable_model: consumableModelId });
            setConsumables(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch consumables: ' + err.message);
            setConsumables([]);
        }
    };

    const fetchConsumableModelAttributes = async (consumableModelId) => {
        try {
            const data = await consumableModelAttributeService.getByConsumableModel(consumableModelId);
            setConsumableModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch model attributes: ' + err.message);
            setConsumableModelAttributes([]);
        }
    };

    const fetchConsumableAttributes = async (consumableId) => {
        try {
            const data = await consumableAttributeValueService.getByConsumable(consumableId);
            setConsumableAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch consumable attributes: ' + err.message);
            setConsumableAttributes([]);
        }
    };

    const definitionLookup = useMemo(() => {
        const map = new Map();
        consumableAttributeDefinitions.forEach((def) => {
            map.set(def.consumable_attribute_definition_id, def);
        });
        return map;
    }, [consumableAttributeDefinitions]);

    const fetchConsumableAttributeDefinitions = async () => {
        try {
            const data = await consumableAttributeDefinitionService.getAll();
            setConsumableAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch attribute definitions: ' + err.message);
            setConsumableAttributeDefinitions([]);
        }
    };

    const fetchConsumableTypeAttributes = async (consumableTypeId) => {
        try {
            const data = await consumableTypeAttributeService.getByConsumableType(consumableTypeId);
            setConsumableTypeAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch type attributes: ' + err.message);
            setConsumableTypeAttributes([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleConsumableAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConsumableAttributeForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleModelInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModelFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseInt(value) : '') : value)
        }));
    };

    const handleConsumableInputChange = (e) => {
        const { name, value } = e.target;
        setConsumableFormData(prev => ({ ...prev, [name]: value }));
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
            await consumableAttributeDefinitionService.create(payload);
            setAttributeDefinitionForm({ description: '', data_type: '', unit: '' });
            setShowAttributeDefinitionForm(false);
            await fetchConsumableAttributeDefinitions();
        } catch (err) {
            setError('Failed to create attribute definition: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTypeAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumableType) {
            setError('Please select a consumable type first');
            return;
        }
        if (!typeAttributeForm.consumable_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                consumable_type: selectedConsumableType.consumable_type_id,
                consumable_attribute_definition: Number(typeAttributeForm.consumable_attribute_definition),
                is_mandatory: typeAttributeForm.is_mandatory,
                default_value: typeAttributeForm.default_value || null
            };
            await consumableTypeAttributeService.create(payload);
            setTypeAttributeForm({ consumable_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowTypeAttributeForm(false);
            await fetchConsumableTypeAttributes(selectedConsumableType.consumable_type_id);
        } catch (err) {
            setError('Failed to assign attribute to type: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumableModel) {
            setError('Please select a consumable model first');
            return;
        }
        if (!modelAttributeForm.consumable_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                consumable_model: selectedConsumableModel.consumable_model_id,
                consumable_attribute_definition: Number(modelAttributeForm.consumable_attribute_definition),
                value_string: modelAttributeForm.value_string || null,
                value_number: modelAttributeForm.value_number ? Number(modelAttributeForm.value_number) : null,
                value_bool: modelAttributeForm.value_bool,
                value_date: modelAttributeForm.value_date || null
            };
            await consumableModelAttributeService.create(payload);
            setModelAttributeForm({
                consumable_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowModelAttributeForm(false);
            await fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
        } catch (err) {
            setError('Failed to add model attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleConsumableAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumable) {
            setError('Please select a consumable first');
            return;
        }
        if (!consumableAttributeForm.consumable_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                consumable: selectedConsumable.consumable_id,
                consumable_attribute_definition: Number(consumableAttributeForm.consumable_attribute_definition),
                value_string: consumableAttributeForm.value_string || null,
                value_number: consumableAttributeForm.value_number ? Number(consumableAttributeForm.value_number) : null,
                value_bool: consumableAttributeForm.value_bool,
                value_date: consumableAttributeForm.value_date || null
            };
            await consumableAttributeValueService.create(payload);
            setConsumableAttributeForm({
                consumable_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowConsumableAttributeForm(false);
            await fetchConsumableAttributes(selectedConsumable.consumable_id);
        } catch (err) {
            setError('Failed to add consumable attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttributeDefinition = async (id) => {
        if (window.confirm('Delete this attribute definition?')) {
            try {
                await consumableAttributeDefinitionService.delete(id);
                await fetchConsumableAttributeDefinitions();
            } catch (err) {
                setError('Failed to delete attribute definition: ' + err.message);
            }
        }
    };

    const handleDeleteTypeAttribute = async (consumableTypeId, definitionId) => {
        if (window.confirm('Remove this attribute from the consumable type?')) {
            try {
                await consumableTypeAttributeService.delete(consumableTypeId, definitionId);
                if (selectedConsumableType) {
                    await fetchConsumableTypeAttributes(selectedConsumableType.consumable_type_id);
                }
            } catch (err) {
                setError('Failed to remove type attribute: ' + err.message);
            }
        }
    };

    const handleDeleteModelAttribute = async (consumableModelId, definitionId) => {
        if (window.confirm('Remove this attribute value from the consumable model?')) {
            try {
                await consumableModelAttributeService.delete(consumableModelId, definitionId);
                if (selectedConsumableModel) {
                    await fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
                }
            } catch (err) {
                setError('Failed to remove model attribute: ' + err.message);
            }
        }
    };

    const handleDeleteConsumableAttribute = async (consumableId, definitionId) => {
        if (window.confirm('Remove this attribute value from the consumable?')) {
            try {
                await consumableAttributeValueService.delete(consumableId, definitionId);
                if (selectedConsumable) {
                    await fetchConsumableAttributes(selectedConsumable.consumable_id);
                }
            } catch (err) {
                setError('Failed to remove consumable attribute: ' + err.message);
            }
        }
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await consumableTypeService.create(formData);
            setFormData({ consumable_type_label: '', consumable_type_code: '' });
            setShowTypeForm(false);
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

    const handleConsumableSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumableModel) {
            setError('Please select a consumable model first');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...consumableFormData,
                consumable_model: selectedConsumableModel.consumable_model_id,
                destruction_certificate_id: consumableFormData.destruction_certificate_id ? Number(consumableFormData.destruction_certificate_id) : null,
            };
            if (editingConsumable) {
                await consumableService.update(editingConsumable, dataToSubmit);
            } else {
                await consumableService.create(dataToSubmit);
            }
            setConsumableFormData({
                consumable_name: '',
                consumable_inventory_number: '',
                consumable_status: 'active',
                consumable_warranty_expiry_in_months: '',
                consumable_name_in_administrative_certificate: '',
                destruction_certificate_id: '',
                maintenance_step_id: null
            });
            setEditingConsumable(null);
            setShowConsumableForm(false);
            await fetchConsumables(selectedConsumableModel.consumable_model_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError(`Failed to ${editingConsumable ? 'update' : 'create'} consumable: ` + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleEditConsumable = (item) => {
        setEditingConsumable(item.consumable_id);
        setConsumableFormData({
            consumable_name: item.consumable_name || '',
            consumable_inventory_number: item.consumable_inventory_number || '',
            consumable_status: item.consumable_status || 'active',
            consumable_warranty_expiry_in_months: item.consumable_warranty_expiry_in_months || '',
            consumable_name_in_administrative_certificate: item.consumable_name_in_administrative_certificate || '',
            destruction_certificate_id: item.destruction_certificate_id ?? '',
            maintenance_step_id: item.maintenance_step_id || null
        });
        setShowConsumableForm(true);
    };

    const handleDeleteType = async (id) => {
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

    const handleDeleteConsumable = async (id) => {
        if (window.confirm('Are you sure you want to delete this consumable?')) {
            try {
                await consumableService.delete(id);
                if (selectedConsumableModel) {
                    await fetchConsumables(selectedConsumableModel.consumable_model_id);
                }
            } catch (err) {
                setError('Failed to delete consumable: ' + err.message);
            }
        }
    };

    const handleAssignInputChange = (e) => {
        const { name, value } = e.target;
        setAssignFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assigningConsumable) return;
        setSaving(true);
        setError(null);
        try {
            await consumableAssignmentService.create({
                person: assignFormData.person,
                consumable: assigningConsumable.consumable_id,
                start_datetime: new Date(assignFormData.start_datetime).toISOString(),
                condition_on_assignment: assignFormData.condition_on_assignment,
            });
            setShowAssignForm(false);
            setAssigningConsumable(null);
            await fetchAssignments();
            alert('Consumable assigned successfully!');
        } catch (err) {
            setError('Failed to assign consumable: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDischarge = async (assignmentId) => {
        setSaving(true);
        setError(null);
        try {
            await consumableAssignmentService.discharge(assignmentId);
            setDischargingAssignment(null);
            await fetchAssignments();
            alert('Consumable discharged successfully!');
        } catch (err) {
            setError('Failed to discharge consumable: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const userAccount = authService.getUser();
    const isSuperuser = userAccount?.is_superuser;
    const isStockConsumableResponsible = userAccount?.roles?.some(r => r.role_code === 'stock_consumable_responsible') || isSuperuser;
    const isExploitationChief = userAccount?.roles?.some(r => r.role_code === 'exploitation_chief') || isSuperuser;
    const canMoveConsumables = isStockConsumableResponsible;
    const canAssignConsumables = isStockConsumableResponsible || isExploitationChief;

    const activeAssignmentsByConsumable = useMemo(() => {
        const map = new Map();
        assignments.forEach((a) => {
            if (a.is_active) {
                map.set(a.consumable?.consumable_id ?? a.consumable, a);
            }
        });
        return map;
    }, [assignments]);

    const openMoveModal = (item) => {
        setMovingConsumable(item);
        setMoveCurrentRoomId(null);
        setMoveCurrentRoomLabel('');
        setSelectedMoveRoomId('');
        setShowMoveModal(true);
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setMovingConsumable(null);
        setMoveCurrentRoomId(null);
        setMoveCurrentRoomLabel('');
        setSelectedMoveRoomId('');
    };

    const submitMove = async (e) => {
        e.preventDefault();
        if (!movingConsumable || !selectedMoveRoomId) return;
        setMoveSubmitting(true);
        setError(null);
        try {
            await consumableService.move(movingConsumable.consumable_id, {
                destination_room_id: selectedMoveRoomId,
            });
            if (selectedConsumableModel) {
                await fetchConsumables(selectedConsumableModel.consumable_model_id);
            }
            closeMoveModal();
        } catch (err) {
            setError('Failed to move consumable: ' + (err?.response?.data?.error || err.message));
        } finally {
            setMoveSubmitting(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Consumables Explorer</h1>
                <p className="page-subtitle">Manage consumable types, models, and inventory</p>
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
                            title="Add Consumable Type"
                        >
                            +
                        </button>
                    </div>

                    {showTypeForm && (
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <form onSubmit={handleTypeSubmit}>
                                <input
                                    type="text"
                                    name="consumable_type_label"
                                    value={formData.consumable_type_label}
                                    onChange={handleInputChange}
                                    placeholder="Type Name"
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <input
                                    type="text"
                                    name="consumable_type_code"
                                    value={formData.consumable_type_code}
                                    onChange={handleInputChange}
                                    placeholder="Code (e.g. INK)"
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
                        {consumableTypes.map(type => (
                            <div key={type.consumable_type_id}>
                                <div
                                    onClick={() => setSelectedConsumableType(selectedConsumableType?.consumable_type_id === type.consumable_type_id ? null : type)}
                                    style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedConsumableType?.consumable_type_id === type.consumable_type_id ? 'var(--color-bg-secondary)' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border)'
                                    }}
                                >
                                    <span style={{ fontWeight: '500' }}>{type.consumable_type_label}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.consumable_type_id); }}
                                        style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                {/* Models List (Nested) */}
                                {selectedConsumableType?.consumable_type_id === type.consumable_type_id && (
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
                                        {consumableModels.map(model => (
                                            <div
                                                key={model.consumable_model_id}
                                                onClick={() => setSelectedConsumableModel(model)}
                                                style={{
                                                    padding: 'var(--space-2) var(--space-4)',
                                                    paddingLeft: 'var(--space-8)',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedConsumableModel?.consumable_model_id === model.consumable_model_id ? 'var(--color-primary)' : 'transparent',
                                                    color: selectedConsumableModel?.consumable_model_id === model.consumable_model_id ? 'white' : 'var(--color-text)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: 'var(--font-size-sm)'
                                                }}
                                            >
                                                <span>{model.model_name}</span>
                                                {selectedConsumableModel?.consumable_model_id === model.consumable_model_id && (
                                                     <button
                                                     onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.consumable_model_id); }}
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
                        {consumableTypes.length === 0 && !loading && (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No consumable types.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content: Main Area */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {showModelForm ? (
                        <div style={{ padding: 'var(--space-6)', overflowY: 'auto' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h2>Add New Model for {selectedConsumableType?.consumable_type_label}</h2>
                                <button onClick={() => setShowModelForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                             </div>
                             {consumableBrands.length === 0 ? (
                                <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                    No consumable brands found. Please create a brand first.
                                </div>
                             ) : (
                                <form onSubmit={handleModelSubmit} style={{ maxWidth: '600px' }}>
                                    {/* Brand */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Brand *</label>
                                        <select name="consumable_brand" value={modelFormData.consumable_brand} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                            <option value="">Select a brand...</option>
                                            {consumableBrands.map(b => <option key={b.consumable_brand_id} value={b.consumable_brand_id}>{b.brand_name}</option>)}
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
                    ) : selectedConsumableModel ? (
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
                                        {selectedConsumableModel.model_name} <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', fontWeight: 'normal' }}>({selectedConsumableModel.model_code})</span>
                                    </h2>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                        {selectedConsumableModel.brand_name} • {consumables.length} Items
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingConsumable(null);
                                        setConsumableFormData({
                                            consumable_name: '',
                                            consumable_inventory_number: '',
                                            consumable_status: 'active',
                                            consumable_warranty_expiry_in_months: '',
                                            consumable_name_in_administrative_certificate: '',
                                            destruction_certificate_id: 0,
                                            maintenance_step_id: null
                                        });
                                        setShowConsumableForm(true);
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
                                            {consumableAttributeDefinitions.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attribute definitions.</div>
                                            ) : (
                                                consumableAttributeDefinitions.map((def) => (
                                                    <div key={def.consumable_attribute_definition_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{def.description || `Attribute ${def.consumable_attribute_definition_id}`}</div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{def.data_type || 'type'}{def.unit ? ` • ${def.unit}` : ''}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAttributeDefinition(def.consumable_attribute_definition_id)}
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
                                            <div style={{ fontWeight: '600' }}>Consumable Type Attributes</div>
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
                                                    name="consumable_attribute_definition"
                                                    value={typeAttributeForm.consumable_attribute_definition}
                                                    onChange={handleTypeAttributeInputChange}
                                                    required
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                >
                                                    <option value="">Select attribute definition...</option>
                                                    {consumableAttributeDefinitions.map((def) => (
                                                        <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                            {def.description || `Attribute ${def.consumable_attribute_definition_id}`}
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
                                            {consumableTypeAttributes.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned.</div>
                                            ) : (
                                                consumableTypeAttributes.map((attr) => {
                                                    const definition = attr.definition || definitionLookup.get(attr.consumable_attribute_definition);
                                                    return (
                                                        <div key={`${attr.consumable_type}-${attr.consumable_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.consumable_attribute_definition}`}</div>
                                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                    {definition?.data_type || 'type'}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                                    {attr.is_mandatory ? ' • mandatory' : ''}
                                                                    {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteTypeAttribute(attr.consumable_type, attr.consumable_attribute_definition)}
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
                                        <div style={{ fontWeight: '600' }}>Consumable Model Attributes</div>
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
                                                name="consumable_attribute_definition"
                                                value={modelAttributeForm.consumable_attribute_definition}
                                                onChange={handleModelAttributeInputChange}
                                                required
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            >
                                                <option value="">Select attribute definition...</option>
                                                {consumableAttributeDefinitions.map((def) => (
                                                    <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                        {def.description || `Attribute ${def.consumable_attribute_definition_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {(() => {
                                                const selectedDef = definitionLookup.get(Number(modelAttributeForm.consumable_attribute_definition));
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
                                    {consumableModelAttributes.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No model attribute values.</div>
                                    ) : (
                                        consumableModelAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.consumable_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            return (
                                                <div key={`${attr.consumable_model}-${attr.consumable_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.consumable_attribute_definition}`}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteModelAttribute(attr.consumable_model, attr.consumable_attribute_definition)}
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
                                            Consumable Attributes {selectedConsumable ? `• ${selectedConsumable.consumable_name || 'Consumable ' + selectedConsumable.consumable_id}` : ''}
                                        </div>
                                        <button
                                            onClick={() => setShowConsumableAttributeForm(!showConsumableAttributeForm)}
                                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                        >
                                            + Add Value
                                        </button>
                                    </div>
                                    {showConsumableAttributeForm && (
                                        <form onSubmit={handleConsumableAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                            <select
                                                name="consumable_attribute_definition"
                                                value={consumableAttributeForm.consumable_attribute_definition}
                                                onChange={handleConsumableAttributeInputChange}
                                                required
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            >
                                                <option value="">Select attribute definition...</option>
                                                {consumableAttributeDefinitions.map((def) => (
                                                    <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                        {def.description || `Attribute ${def.consumable_attribute_definition_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {(() => {
                                                const selectedDef = definitionLookup.get(Number(consumableAttributeForm.consumable_attribute_definition));
                                                const dataType = selectedDef?.data_type?.toLowerCase();
                                                if (dataType === 'number') {
                                                    return (
                                                        <input
                                                            type="number"
                                                            name="value_number"
                                                            placeholder="Number value"
                                                            value={consumableAttributeForm.value_number}
                                                            onChange={handleConsumableAttributeInputChange}
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
                                                                checked={consumableAttributeForm.value_bool}
                                                                onChange={handleConsumableAttributeInputChange}
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
                                                            value={consumableAttributeForm.value_date}
                                                            onChange={handleConsumableAttributeInputChange}
                                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <input
                                                        type="text"
                                                        name="value_string"
                                                        placeholder="String value"
                                                        value={consumableAttributeForm.value_string}
                                                        onChange={handleConsumableAttributeInputChange}
                                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                    />
                                                );
                                            })()}
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                                <button type="button" onClick={() => setShowConsumableAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                    {consumableAttributes.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No consumable attribute values.</div>
                                    ) : (
                                        consumableAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.consumable_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            return (
                                                <div key={`${attr.consumable}-${attr.consumable_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.consumable_attribute_definition}`}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteConsumableAttribute(attr.consumable, attr.consumable_attribute_definition)}
                                                        style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer' }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {showConsumableForm && (
                                    <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-4)' }}>{editingConsumable ? 'Edit Consumable' : 'New Consumable'}</div>
                                        <form onSubmit={handleConsumableSubmit}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Name</label>
                                                    <input type="text" name="consumable_name" value={consumableFormData.consumable_name} onChange={handleConsumableInputChange} placeholder="Consumable Name" style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Status</label>
                                                    <select name="consumable_status" value={consumableFormData.consumable_status} onChange={handleConsumableInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="maintenance">Maintenance</option>
                                                        <option value="retired">Retired</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Inventory Number</label>
                                                    <input type="text" name="consumable_inventory_number" value={consumableFormData.consumable_inventory_number} onChange={handleConsumableInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Warranty (Months)</label>
                                                    <input type="number" name="consumable_warranty_expiry_in_months" value={consumableFormData.consumable_warranty_expiry_in_months} onChange={handleConsumableInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                                                <button type="submit" style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Save Item</button>
                                                <button type="button" onClick={() => setShowConsumableForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {consumables.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>
                                        No consumables found for this model.
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
                                            {consumables.map(item => (
                                                <tr
                                                    key={item.consumable_id}
                                                    style={{
                                                        borderBottom: '1px solid var(--color-border)',
                                                        backgroundColor: selectedConsumable?.consumable_id === item.consumable_id ? 'var(--color-bg-secondary)' : 'transparent',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setSelectedConsumable(item)}
                                                >
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div style={{ fontWeight: '500' }}>{item.consumable_name || 'Unnamed Item'}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div style={{ color: 'var(--color-text-secondary)' }}>{item.consumable_inventory_number}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: 'var(--font-size-xs)',
                                                            backgroundColor: item.consumable_status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-secondary)',
                                                            color: item.consumable_status === 'active' ? 'var(--color-success)' : 'var(--color-text-secondary)'
                                                        }}>
                                                            {item.consumable_status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditConsumable(item); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        {canMoveConsumables && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openMoveModal(item); }}
                                                                style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                Move
                                                            </button>
                                                        )}
                                                        {canAssignConsumables && (
                                                            (() => {
                                                                const activeAssignment = activeAssignmentsByConsumable.get(item.consumable_id);
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
                                                                            setAssigningConsumable(item);
                                                                            const now = new Date();
                                                                            const tzOffset = now.getTimezoneOffset() * 60000;
                                                                            const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
                                                                            setAssignFormData({
                                                                                person: '',
                                                                                start_datetime: localISOTime,
                                                                                condition_on_assignment: item.consumable_status === 'active' ? 'Good' : 'Needs Repair'
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
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteConsumable(item.consumable_id); }}
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
                    ) : selectedConsumableType ? (
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
                                        {consumableAttributeDefinitions.length === 0 ? (
                                            <div style={{ color: 'var(--color-text-secondary)' }}>No attribute definitions.</div>
                                        ) : (
                                            consumableAttributeDefinitions.map((def) => (
                                                <div key={def.consumable_attribute_definition_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{def.description || `Attribute ${def.consumable_attribute_definition_id}`}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{def.data_type || 'type'}{def.unit ? ` • ${def.unit}` : ''}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAttributeDefinition(def.consumable_attribute_definition_id)}
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
                                        <div style={{ fontWeight: '600' }}>Consumable Type Attributes</div>
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
                                                name="consumable_attribute_definition"
                                                value={typeAttributeForm.consumable_attribute_definition}
                                                onChange={handleTypeAttributeInputChange}
                                                required
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            >
                                                <option value="">Select attribute definition...</option>
                                                {consumableAttributeDefinitions.map((def) => (
                                                    <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                        {def.description || `Attribute ${def.consumable_attribute_definition_id}`}
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
                                        {consumableTypeAttributes.length === 0 ? (
                                            <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned.</div>
                                        ) : (
                                            consumableTypeAttributes.map((attr) => {
                                                const definition = attr.definition || definitionLookup.get(attr.consumable_attribute_definition);
                                                return (
                                                    <div key={`${attr.consumable_type}-${attr.consumable_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.consumable_attribute_definition}`}</div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                {definition?.data_type || 'type'}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                                {attr.is_mandatory ? ' • mandatory' : ''}
                                                                {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTypeAttribute(attr.consumable_type, attr.consumable_attribute_definition)}
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
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
                            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)', opacity: 0.2 }}>🖨️</div>
                            <p>Select a consumable model from the sidebar to view inventory.</p>
                        </div>
                    )}
                </div>
            </div>

            {showMoveModal && movingConsumable && (
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
                                Move Consumable: {movingConsumable.consumable_name || `Consumable ${movingConsumable.consumable_id}`}
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

            {showAssignForm && assigningConsumable && (
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
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Assign Consumable: {assigningConsumable.consumable_name || `Consumable ${assigningConsumable.consumable_id}`}</h2>
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
                                    onClick={() => { setShowAssignForm(false); setAssigningConsumable(null); }}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--color-text)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    {saving ? 'Assigning...' : 'Assign Consumable'}
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
                            Are you sure you want to end the assignment of <strong>{dischargingAssignment.consumable?.consumable_name || 'Consumable'}</strong> to person <strong>{dischargingAssignment.person}</strong>?
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

export default ConsumablesPage;
