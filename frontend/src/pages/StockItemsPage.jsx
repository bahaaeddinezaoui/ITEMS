import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, Plus, Box, Pencil, X, XCircle, Sliders, Tag, Scissors, Package, Hash } from 'lucide-react';
import TranslatableInput from '../components/TranslatableInput';
import {
    authService,
    personService,
    locationService,
    stockItemAssignmentService,
    stockItemTypeService,
    stockItemModelService,
    stockItemBrandService,
    stockItemService,
    stockItemAttributeDefinitionService,
    stockItemTypeAttributeService,
    stockItemAttributeValueService
} from '../services/api';
import { useTranslation } from 'react-i18next';

const StockItemsPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const typeIdParam = searchParams.get('typeId');
    const modelIdParam = searchParams.get('modelId');
    const createParam = searchParams.get('create');
    const isInstancesMode = location.pathname.endsWith('/instances');

    const formatModelLabel = (model) => {
        return [model?.brand_name, model?.model_name].filter(Boolean).join(' ');
    };

    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [stockItemBrands, setStockItemBrands] = useState([]);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [persons, setPersons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [stockItemAttributeDefinitions, setStockItemAttributeDefinitions] = useState([]);
    const [stockItemTypeAttributes, setStockItemTypeAttributes] = useState([]);
    const [stockItemAttributes, setStockItemAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successToast, setSuccessToast] = useState('');

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingStockItem, setMovingStockItem] = useState(null);
    const [moveLocationId, setMoveLocationId] = useState(null);
    const [moveLocationLabel, setMoveLocationLabel] = useState('');
    const [selectedMoveLocationId, setSelectedMoveLocationId] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splittingStockItem, setSplittingStockItem] = useState(null);
    const [splitAttributeOptions, setSplitAttributeOptions] = useState([]);
    const [splitSubmitting, setSplitSubmitting] = useState(false);
    const [splitFormData, setSplitFormData] = useState({
        attribute_definition_id: '',
        split_value: '',
        new_item_name: '',
        new_item_inventory_number: '',
        new_item_status: 'in_stock',
        destination_location_id: '',
    });

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
    const [formTranslations, setFormTranslations] = useState({});
    const [stockItemFormData, setStockItemFormData] = useState({
        stock_item_name: '',
        stock_item_inventory_number: '',
        stock_item_status: 'in_stock',
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
        fetchLocations();
        fetchPersons();
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!typeIdParam || !modelIdParam) {
            navigate('/dashboard/stock-items/types', { replace: true });
        }
    }, [isInstancesMode, typeIdParam, modelIdParam, navigate]);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (String(createParam || '') !== '1') return;
        if (!selectedStockItemModel) return;
        if (showStockItemForm) return;

        setEditingStockItem(null);
        setStockItemFormData({
            stock_item_name: '',
            stock_item_inventory_number: '',
            stock_item_status: 'in_stock',
            stock_item_name_in_administrative_certificate: '',
            destruction_certificate_id: 0,
            maintenance_step_id: null
        });
        setShowStockItemForm(true);

        const sp = new URLSearchParams(searchParams);
        sp.delete('create');
        const qs = sp.toString();
        navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
    }, [isInstancesMode, createParam, selectedStockItemModel, showStockItemForm]);

    useEffect(() => {
        if (!successToast) return;
        const timer = setTimeout(() => {
            setSuccessToast('');
        }, 3500);
        return () => clearTimeout(timer);
    }, [successToast]);

    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch locations:', err);
            setLocations([]);
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
        const loadCurrentLocation = async () => {
            if (!showMoveModal || !movingStockItem) return;
            try {
                const current = await stockItemService.getCurrentLocation(movingStockItem.stock_item_id);
                const currentLocationId = current?.location_id ?? null;
                setMoveLocationId(currentLocationId);
                const currentLocationObj = locations.find((r) => r.location_id === currentLocationId);
                setMoveLocationLabel(
                    currentLocationObj?.location_name || (currentLocationId ? t('stockItems.locationWithId', { id: currentLocationId }) : t('stockItems.unknown'))
                );
            } catch (err) {
                console.error(err);
                setMoveLocationId(null);
                setMoveLocationLabel(t('stockItems.unknown'));
            }
        };
        loadCurrentLocation();
    }, [showMoveModal, movingStockItem, locations]);

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
            setError(t('stockItems.fetchTypesError') + ' ' + err.message);
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
            setError(t('stockItems.fetchModelsError') + ' ' + err.message);
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
            setError(t('stockItems.fetchItemsError') + ' ' + err.message);
            setStockItems([]);
        }
    };

    const fetchStockItemAttributeDefinitions = async () => {
        try {
            const data = await stockItemAttributeDefinitionService.getAll();
            setStockItemAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('stockItems.fetchAttrDefsError') + ' ' + err.message);
            setStockItemAttributeDefinitions([]);
        }
    };

    const fetchStockItemTypeAttributes = async (stockItemTypeId) => {
        try {
            const data = await stockItemTypeAttributeService.getByStockItemType(stockItemTypeId);
            setStockItemTypeAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('stockItems.fetchTypeAttrsError') + ' ' + err.message);
            setStockItemTypeAttributes([]);
        }
    };

    const fetchStockItemAttributes = async (stockItemId) => {
        try {
            const data = await stockItemAttributeValueService.getByStockItem(stockItemId);
            setStockItemAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('stockItems.fetchItemAttrsError') + ' ' + err.message);
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

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { stock_item_name: value } }));
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
            setError(t('stockItems.createTypeError') + ' ' + (err.response?.data?.error || err.message));
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
            setError(t('stockItems.selectTypeFirst'));
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
            setError(t('stockItems.createModelError') + ' ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm(t('stockItems.confirmDeleteModel'))) {
            try {
                await stockItemModelService.delete(id);
                if (selectedStockItemModel?.stock_item_model_id === id) {
                    setSelectedStockItemModel(null);
                }
                if (selectedStockItemType) {
                    await fetchStockItemModels(selectedStockItemType.stock_item_type_id);
                }
            } catch (err) {
                setError(t('stockItems.deleteModelError') + ' ' + err.message);
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
            const translations = { ...formTranslations };
            if (stockItemFormData.stock_item_name) {
                translations['en'] = {
                    ...(translations['en'] || {}),
                    stock_item_name: stockItemFormData.stock_item_name,
                };
            }
            if (Object.keys(translations).length > 0) {
                dataToSubmit.translations = translations;
            }
            if (editingStockItem) {
                await stockItemService.update(editingStockItem, dataToSubmit);
            } else {
                await stockItemService.create(dataToSubmit);
            }
            setStockItemFormData({
                stock_item_name: '',
                stock_item_inventory_number: '',
                stock_item_status: 'in_stock',
                stock_item_name_in_administrative_certificate: '',
                destruction_certificate_id: '',
                maintenance_step_id: null
            });
            setFormTranslations({});
            setEditingStockItem(null);
            setShowStockItemForm(false);
            await fetchStockItems(selectedStockItemModel.stock_item_model_id);
        } catch (err) {
            const errorMsg = err.response?.data ? 
                (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) :
                err.message;
            setError(t(editingStockItem ? 'stockItems.updateItemError' : 'stockItems.createItemError') + ' ' + errorMsg);
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
            stock_item_name_in_administrative_certificate: item.stock_item_name_in_administrative_certificate || '',
            destruction_certificate_id: item.destruction_certificate_id ?? '',
            maintenance_step_id: item.maintenance_step_id || null
        });
        const trans = {};
        if (item.stock_item_name_ar) trans['ar'] = { stock_item_name: item.stock_item_name_ar };
        if (item.stock_item_name_en) trans['en'] = { stock_item_name: item.stock_item_name_en };
        setFormTranslations(trans);
        setShowStockItemForm(true);
    };

    const handleTypeAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItemType) {
            setError(t('stockItems.selectTypeFirst'));
            return;
        }
        if (!typeAttributeForm.stock_item_attribute_definition) {
            setError(t('stockItems.selectAttrDef'));
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
            setError(t('stockItems.assignAttrError') + ' ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStockItemAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItem) {
            setError(t('stockItems.selectItemFirst'));
            return;
        }
        if (!stockItemAttributeForm.stock_item_attribute_definition) {
            setError(t('stockItems.selectAttrDef'));
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
            setError(t('stockItems.addItemAttrError') + ' ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTypeAttribute = async (stockItemTypeId, definitionId) => {
        if (window.confirm(t('stockItems.confirmRemoveTypeAttr'))) {
            try {
                await stockItemTypeAttributeService.delete(stockItemTypeId, definitionId);
                if (selectedStockItemType) {
                    await fetchStockItemTypeAttributes(selectedStockItemType.stock_item_type_id);
                }
            } catch (err) {
                setError(t('stockItems.removeTypeAttrError') + ' ' + err.message);
            }
        }
    };

    const handleDeleteStockItemAttribute = async (stockItemId, definitionId) => {
        if (window.confirm(t('stockItems.confirmRemoveItemAttr'))) {
            try {
                await stockItemAttributeValueService.delete(stockItemId, definitionId);
                if (selectedStockItem) {
                    await fetchStockItemAttributes(selectedStockItem.stock_item_id);
                }
            } catch (err) {
                setError(t('stockItems.removeItemAttrError') + ' ' + err.message);
            }
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm(t('stockItems.confirmDeleteType'))) {
            try {
                await stockItemTypeService.delete(id);
                if (selectedStockItemType?.stock_item_type_id === id) {
                    setSelectedStockItemType(null);
                }
                await fetchStockItemTypes();
            } catch (err) {
                setError(t('stockItems.deleteTypeError') + ' ' + err.message);
            }
        }
    };

    const handleDeleteStockItem = async (id) => {
        if (window.confirm(t('stockItems.confirmDeleteItem'))) {
            try {
                await stockItemService.delete(id);
                if (selectedStockItemModel) {
                    await fetchStockItems(selectedStockItemModel.stock_item_model_id);
                }
            } catch (err) {
                setError(t('stockItems.deleteItemError') + ' ' + err.message);
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
            alert(t('stockItems.assignedSuccess'));
        } catch (err) {
            setError(t('stockItems.assignError') + ' ' + (err.response?.data?.error || err.message));
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
            alert(t('stockItems.dischargedSuccess'));
        } catch (err) {
            setError(t('stockItems.dischargeError') + ' ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const userAccount = authService.getUser();
    const isSuperuser = userAccount?.is_superuser;
    const isStockConsumableResponsible = userAccount?.roles?.some(r => r.role_code === 'stock_consumable_responsible' || r.role_code === 'exploitation_chief') || isSuperuser;
    const isExploitationChief = userAccount?.roles?.some(r => r.role_code === 'exploitation_chief') || isSuperuser;
    const isMaintenanceChief = userAccount?.roles?.some(r => r.role_code === 'maintenance_chief') || isSuperuser;
    const canMoveStockItems = isStockConsumableResponsible;
    const canAssignStockItems = isStockConsumableResponsible || isExploitationChief;
    const canSplitStockItems = isStockConsumableResponsible;

    const canSuggestStockItemForDestruction = isMaintenanceChief;

    const submitSuggestStockItemForDestruction = async () => {
        if (!selectedStockItem) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await stockItemService.suggestForDestruction(selectedStockItem.stock_item_id);
            setSelectedStockItem(updated);
            if (selectedStockItemModel) {
                await fetchStockItems(selectedStockItemModel.stock_item_model_id);
            }
        } catch (err) {
            setError(err.response?.data?.error || t('stockItems.suggestDestructionError'));
        } finally {
            setSaving(false);
        }
    };

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
        setMoveLocationId(null);
        setMoveLocationLabel('');
        setSelectedMoveLocationId('');
        setShowMoveModal(true);
    };

    const openSplitModal = async (item) => {
        setSplittingStockItem(item);
        setSplitFormData({
            attribute_definition_id: '',
            split_value: '',
            new_item_name: item.stock_item_name || '',
            new_item_inventory_number: '',
            new_item_status: item.stock_item_status || 'in_stock',
            destination_location_id: '',
        });
        setSplitAttributeOptions([]);
        setShowSplitModal(true);
        setError(null);
        try {
            const attrs = await stockItemAttributeValueService.getByStockItem(item.stock_item_id);
            const options = (Array.isArray(attrs) ? attrs : [])
                .map((attr) => {
                    const definitionId = Number(attr.stock_item_attribute_definition);
                    const definition = attr.definition || definitionLookup.get(definitionId);
                    const dt = String(definition?.data_type || '').toLowerCase();
                    const isNumeric = ['number', 'numeric', 'decimal', 'int', 'integer', 'float', 'double'].includes(dt);
                    return {
                        attr,
                        definitionId,
                        definition,
                        isNumeric,
                    };
                })
                .filter((x) => x.isNumeric && x.attr?.value_number != null);
            setSplitAttributeOptions(options);
            if (options.length > 0) {
                setSplitFormData((prev) => ({ ...prev, attribute_definition_id: String(options[0].definitionId) }));
            }
        } catch (err) {
            setError(t('stockItems.loadSplitAttrsError') + ' ' + (err?.response?.data?.error || err.message));
        }
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setMovingStockItem(null);
        setMoveLocationId(null);
        setMoveLocationLabel('');
        setSelectedMoveLocationId('');
    };

    const closeSplitModal = () => {
        if (splitSubmitting) return;
        setShowSplitModal(false);
        setSplittingStockItem(null);
        setSplitAttributeOptions([]);
        setSplitFormData({
            attribute_definition_id: '',
            split_value: '',
            new_item_name: '',
            new_item_inventory_number: '',
            new_item_status: 'in_stock',
            destination_location_id: '',
        });
    };

    const submitMove = async (e) => {
        e.preventDefault();
        if (!movingStockItem || !selectedMoveLocationId) return;
        setMoveSubmitting(true);
        setError(null);
        try {
            await stockItemService.move(movingStockItem.stock_item_id, {
                destination_location_id: selectedMoveLocationId,
            });
            if (selectedStockItemModel) {
                await fetchStockItems(selectedStockItemModel.stock_item_model_id);
            }
            closeMoveModal();
        } catch (err) {
            setError(t('stockItems.moveError') + ' ' + (err?.response?.data?.error || err.message));
        } finally {
            setMoveSubmitting(false);
        }
    };

    const submitSplit = async (e) => {
        e.preventDefault();
        if (!splittingStockItem) return;
        if (!splitFormData.attribute_definition_id) {
            setError(t('stockItems.chooseNumericAttr'));
            return;
        }
        if (!splitFormData.split_value || Number(splitFormData.split_value) <= 0) {
            setError(t('stockItems.splitValueGtZero'));
            return;
        }
        setSplitSubmitting(true);
        setError(null);
        try {
            const payload = {
                attribute_definition_id: Number(splitFormData.attribute_definition_id),
                split_value: Number(splitFormData.split_value),
                new_item_name: splitFormData.new_item_name || null,
                new_item_inventory_number: splitFormData.new_item_inventory_number || null,
                new_item_status: splitFormData.new_item_status || null,
                destination_location_id: splitFormData.destination_location_id ? Number(splitFormData.destination_location_id) : null,
            };
            const result = await stockItemService.split(splittingStockItem.stock_item_id, payload);
            if (selectedStockItemModel) {
                await fetchStockItems(selectedStockItemModel.stock_item_model_id);
            }
            if (selectedStockItem?.stock_item_id === splittingStockItem.stock_item_id && result?.source_stock_item) {
                setSelectedStockItem(result.source_stock_item);
            }
            closeSplitModal();
            setSuccessToast(t('stockItems.splitDone', { sourceVal: result?.source_remaining_value ?? '-', newVal: result?.new_item_value ?? '-' }));
        } catch (err) {
            setError(t('stockItems.splitError') + ' ' + (err?.response?.data?.error || err.message));
        } finally {
            setSplitSubmitting(false);
        }
    };

    const filteredStockItems = useMemo(() => {
        let result = stockItems;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.stock_item_name || '').toLowerCase().includes(term) ||
                (item.stock_item_inventory_number || '').toLowerCase().includes(term)
            );
        }
        if (statusFilter) {
            result = result.filter(item => item.stock_item_status === statusFilter);
        }
        return result;
    }, [stockItems, searchTerm, statusFilter]);

    const formatStatus = (value, item) => {
        if (!value) return '';
        const lang = i18n.language;
        const statusAr = item?.stock_item_status_ar;
        const statusEn = item?.stock_item_status_en;
        if (lang === 'ar') {
            if (statusAr && statusEn && statusAr !== statusEn) return `${statusAr} (${statusEn})`;
            return statusAr || statusEn || String(value).split('_').map((p) => p ? p[0].toUpperCase() + p.slice(1) : p).join(' ');
        }
        if (statusEn && statusAr && statusEn !== statusAr) return `${statusEn} (${statusAr})`;
        return statusEn || statusAr || String(value).split('_').map((p) => p ? p[0].toUpperCase() + p.slice(1) : p).join(' ');
    };

    if (isInstancesMode) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <button className="btn btn-secondary" onClick={() => {
                            if (typeIdParam) {
                                navigate(`/dashboard/stock-items/models?typeId=${typeIdParam}`);
                            } else {
                                navigate('/dashboard/stock-items/types');
                            }
                        }} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Package size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockItems.title')}</h1>
                            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Tag size={14} />
                                {selectedStockItemType?.stock_item_type_label || `Type #${typeIdParam || ''}`} • {formatModelLabel(selectedStockItemModel) || selectedStockItemModel?.model_name || `Model #${modelIdParam || ''}`}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingStockItem(null);
                        setFormTranslations({});
                        setStockItemFormData({
                            stock_item_name: '',
                            stock_item_inventory_number: '',
                            stock_item_status: 'not_delivered_to_company',
                            stock_item_name_in_administrative_certificate: '',
                            destruction_certificate_id: 0,
                            maintenance_step_id: null
                        });
                        setShowStockItemForm(true);
                    }} style={{ padding: 'var(--space-3) var(--space-6)', width: 'auto' }}>
                        <Plus size={18} />
                        <span>{t('stockItems.addItem')}</span>
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="error-message" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <XCircle size={20} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Success Toast */}
                {successToast && (
                    <div style={{
                        position: 'fixed', top: '88px', right: '20px', zIndex: 2100,
                        backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac',
                        borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                        fontSize: 'var(--font-size-sm)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.18)', maxWidth: '420px'
                    }}>
                        {successToast}
                    </div>
                )}

                {/* Add/Edit Stock Item Modal */}
                {showStockItemForm && (
                    <div className="modal-overlay" onClick={() => setShowStockItemForm(false)}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header" style={{ gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                                        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', boxShadow: 'var(--shadow-glow)', flexShrink: 0,
                                    }}>
                                        <Package size={20} style={{ color: 'white' }} />
                                    </div>
                                    <div>
                                        <h3 className="modal-title" style={{ margin: 0 }}>{editingStockItem ? t('stockItems.editItem') : t('stockItems.newItem')}</h3>
                                        <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                            {selectedStockItemModel?.model_name || ''}
                                        </p>
                                    </div>
                                </div>
                                <button className="modal-close" onClick={() => setShowStockItemForm(false)}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleStockItemSubmit}>
                                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                                    <div className="form-group">
                                        <TranslatableInput
                                            label={t('stockItems.name')}
                                            baseFieldName="stock_item_name"
                                            value={stockItemFormData.stock_item_name}
                                            onChange={(name, value) => handleStockItemInputChange({ target: { name, value } })}
                                            translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.stock_item_name]))}
                                            onTranslationChange={handleFormTranslationChange}
                                            placeholder={t('stockItems.itemNamePlaceholder')}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <Tag size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                {t('common.status')}
                                            </label>
                                            <select name="stock_item_status" value={stockItemFormData.stock_item_status} onChange={handleStockItemInputChange} className="form-input" style={{ height: '44px' }}>
                                                <option value="not_delivered_to_company">{t('stockItems.statusNotDelivered')}</option>
                                                <option value="in_stock">{t('stockItems.statusInStock')}</option>
                                                <option value="assigned">{t('stockItems.statusAssigned')}</option>
                                                <option value="maintenance">{t('stockItems.statusMaintenance')}</option>
                                                <option value="expired">{t('stockItems.statusExpired')}</option>
                                                <option value="failed">{t('stockItems.statusFailed')}</option>
                                                <option value="lost">{t('stockItems.statusLost')}</option>
                                                <option value="stolen">{t('stockItems.statusStolen')}</option>
                                                <option value="irrecoverably_damaged">{t('stockItems.statusIrrecoverablyDamaged')}</option>
                                                <option value="destroyed">{t('stockItems.statusDestroyed')}</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <Hash size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                {t('stockItems.inventoryNumber')}
                                            </label>
                                            <input type="text" name="stock_item_inventory_number" value={stockItemFormData.stock_item_inventory_number} onChange={handleStockItemInputChange} placeholder={t('stockItems.inventoryNumber')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowStockItemForm(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {editingStockItem ? t('common.update') : t('common.save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Stock Items Panel */}
                    <div className="card" style={{ overflow: 'hidden' }}>
                        {/* Toolbar */}
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '0 1 320px', minWidth: '180px' }}>
                                <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input type="text" placeholder={t('stockItems.searchPlaceholder', 'Search stock items...')} className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 'var(--space-10)', height: '40px', background: 'var(--color-bg-card)' }} />
                            </div>
                            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: '44px', minWidth: '130px' }}>
                                <option value="">{t('stockItems.allStatuses', 'All Statuses')}</option>
                                <option value="in_stock">{t('stockItems.statusInStock')}</option>
                                <option value="assigned">{t('stockItems.statusAssigned')}</option>
                                <option value="maintenance">{t('stockItems.statusMaintenance')}</option>
                                <option value="failed">{t('stockItems.statusFailed')}</option>
                                <option value="not_delivered_to_company">{t('stockItems.statusNotDelivered')}</option>
                                <option value="expired">{t('stockItems.statusExpired')}</option>
                                <option value="lost">{t('stockItems.statusLost')}</option>
                                <option value="destroyed">{t('stockItems.statusDestroyed')}</option>
                            </select>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontWeight: '600' }}>
                                {filteredStockItems.length}
                            </span>
                        </div>

                        {/* Stock Item List */}
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                            {loading ? (
                                <div className="loading-state" style={{ padding: 'var(--space-12)' }}>
                                    <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                    <span>{t('stockItems.loading', 'Loading...')}</span>
                                </div>
                            ) : filteredStockItems.length === 0 ? (
                                <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                                    <Box size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                                    <p style={{ color: 'var(--color-text-muted)' }}>
                                        {searchTerm || statusFilter ? t('stockItems.noMatchingItems', 'No matching stock items') : t('stockItems.noItemsForModel')}
                                    </p>
                                </div>
                            ) : (
                                filteredStockItems.map(item => (
                                    <div
                                        key={item.stock_item_id}
                                        style={{
                                            padding: 'var(--space-4) var(--space-5)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid var(--color-border)',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease'
                                        }}
                                        onClick={() => openStockItemDetailsModal(item)}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                                background: 'var(--color-accent-glow)', border: '1px solid var(--color-border)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-accent-tertiary)',
                                                flexShrink: 0
                                            }}>
                                                {(item.stock_item_name || '?')[0].toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.stock_item_name || t('stockItems.unnamedItem')}
                                                    </span>
                                                    {item.stock_item_inventory_number && (
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                            {item.stock_item_inventory_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: '2px' }}>
                                                    <span style={{
                                                        padding: '1px 6px', borderRadius: '12px', fontSize: 'var(--font-size-xs)',
                                                        backgroundColor: item.stock_item_status === 'in_stock' ? 'rgba(16, 185, 129, 0.15)' :
                                                                         item.stock_item_status === 'not_delivered_to_company' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-bg-secondary)',
                                                        color: item.stock_item_status === 'in_stock' ? 'var(--color-success)' :
                                                               item.stock_item_status === 'not_delivered_to_company' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                                                    }}>
                                                        {formatStatus(item.stock_item_status, item)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
                                            <button onClick={(e) => { e.stopPropagation(); openStockItemDetailsModal(item); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItems.attributes')}>
                                                <Sliders size={14} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleEditStockItem(item); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('common.edit')}>
                                                <Pencil size={14} />
                                            </button>
                                            {canMoveStockItems && (
                                                <button onClick={(e) => { e.stopPropagation(); openMoveModal(item); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItems.move')}>
                                                    <Box size={14} />
                                                </button>
                                            )}
                                            {canSplitStockItems && (
                                                <button onClick={(e) => { e.stopPropagation(); openSplitModal(item); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }} title={t('stockItems.split')}>
                                                    <Scissors size={14} />
                                                </button>
                                            )}
                                            {canAssignStockItems && (
                                                (() => {
                                                    const activeAssignment = activeAssignmentsByStockItem.get(item.stock_item_id);
                                                    return activeAssignment ? (
                                                        <button onClick={(e) => { e.stopPropagation(); setDischargingAssignment(activeAssignment); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('stockItems.discharge')}>
                                                            <X size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAssigningStockItem(item);
                                                            const now = new Date();
                                                            const tzOffset = now.getTimezoneOffset() * 60000;
                                                            const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
                                                            setAssignFormData({
                                                                person: '',
                                                                start_datetime: localISOTime,
                                                                condition_on_assignment: item.stock_item_status === 'in_stock' ? 'Good' : 'Needs Repair'
                                                            });
                                                            setShowAssignForm(true);
                                                        }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }} title={t('stockItems.assign')}>
                                                            <Plus size={14} />
                                                        </button>
                                                    );
                                                })()
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteStockItem(item.stock_item_id); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('common.delete')}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock Item Details Modal */}
                {showStockItemDetailsModal && selectedStockItem && (
                    <div className="modal-overlay" onClick={closeStockItemDetailsModal}>
                        <div className="modal" style={{ maxWidth: '720px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <h3 className="modal-title" style={{ margin: 0 }}>
                                        {selectedStockItem.stock_item_name || t('stockItems.itemWithId', { id: selectedStockItem.stock_item_id })}
                                    </h3>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        {t('stockItems.inventoryNo')}: {selectedStockItem.stock_item_inventory_number || '—'} • {t('stockItems.status')}: {formatStatus(selectedStockItem.stock_item_status, selectedStockItem)}
                                    </span>
                                </div>
                                <button className="modal-close" onClick={closeStockItemDetailsModal}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                {canSuggestStockItemForDestruction && (selectedStockItem.stock_item_status || '').toLowerCase() === 'failed' && (
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <button
                                            type="button"
                                            onClick={submitSuggestStockItemForDestruction}
                                            disabled={saving}
                                            className="btn btn-secondary"
                                        >
                                            {saving ? t('stockItems.saving') : t('stockItems.suggestForDestruction')}
                                        </button>
                                    </div>
                                )}

                                <div style={{
                                    marginBottom: 'var(--space-6)',
                                    padding: 'var(--space-4)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-bg-secondary)'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.inventoryNo')}</div>
                                            <div style={{ fontWeight: 600 }}>{selectedStockItem.stock_item_inventory_number || '—'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.assignedTo')}</div>
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
                                        <div style={{ fontWeight: '600' }}>{t('stockItems.stockItemAttributes')}</div>
                                        <button
                                            onClick={() => setShowStockItemAttributeForm(!showStockItemAttributeForm)}
                                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                        >
                                            + {t('stockItems.addValue')}
                                        </button>
                                    </div>
                                    {showStockItemAttributeForm && (
                                        <form onSubmit={handleStockItemAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                            <select
                                                name="stock_item_attribute_definition"
                                                value={stockItemAttributeForm.stock_item_attribute_definition}
                                                onChange={handleStockItemAttributeInputChange}
                                                required
                                                className="form-input"
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }}
                                            >
                                                <option value="">{t('stockItems.selectAttrDefPlaceholder')}</option>
                                                {stockItemAttributeDefinitions.map((def) => (
                                                    <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                        {def.description || t('stockItems.attributeWithId', { id: def.stock_item_attribute_definition_id })}
                                                    </option>
                                                ))}
                                            </select>
                                            {(() => {
                                                const selectedDef = definitionLookup.get(Number(stockItemAttributeForm.stock_item_attribute_definition));
                                                const dataType = selectedDef?.data_type?.toLowerCase();
                                                if (dataType === 'number') {
                                                    return <input type="number" name="value_number" placeholder={t('stockItems.numberValue')} value={stockItemAttributeForm.value_number} onChange={handleStockItemAttributeInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                                }
                                                if (dataType === 'bool' || dataType === 'boolean') {
                                                    return (
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                            <input type="checkbox" name="value_bool" checked={stockItemAttributeForm.value_bool} onChange={handleStockItemAttributeInputChange} />
                                                            {t('stockItems.true')}
                                                        </label>
                                                    );
                                                }
                                                if (dataType === 'date') {
                                                    return <input type="date" name="value_date" value={stockItemAttributeForm.value_date} onChange={handleStockItemAttributeInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                                }
                                                return <input type="text" name="value_string" placeholder={t('stockItems.stringValue')} value={stockItemAttributeForm.value_string} onChange={handleStockItemAttributeInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                            })()}
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{t('stockItems.save')}</button>
                                                <button type="button" onClick={() => setShowStockItemAttributeForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>{t('stockItems.cancel')}</button>
                                            </div>
                                        </form>
                                    )}
                                    {stockItemAttributes.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('stockItems.noAttrValues')}</div>
                                    ) : (
                                        stockItemAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            return (
                                                <div key={`${attr.stock_item}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{definition?.description || t('stockItems.attributeWithId', { id: attr.stock_item_attribute_definition })}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? t('stockItems.noValue') : String(value)}</div>
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
                    </div>
                )}

                {/* Split Modal */}
                {showSplitModal && splittingStockItem && (
                    <div className="modal-overlay" onClick={() => !splitSubmitting && closeSplitModal()}>
                        <div className="modal" style={{ maxWidth: '620px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('stockItems.splitItemTitle')}: {splittingStockItem.stock_item_name || t('stockItems.itemWithId', { id: splittingStockItem.stock_item_id })}</h3>
                                <button className="modal-close" onClick={closeSplitModal} disabled={splitSubmitting}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={submitSplit}>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.numericAttribute')}</label>
                                        <select
                                            value={splitFormData.attribute_definition_id}
                                            onChange={(e) => setSplitFormData((prev) => ({ ...prev, attribute_definition_id: e.target.value }))}
                                            className="form-input"
                                            style={{ height: '44px' }}
                                            required
                                        >
                                            {splitAttributeOptions.length === 0 && <option value="">{t('stockItems.noNumericAttr')}</option>}
                                            {splitAttributeOptions.map((x) => (
                                                <option key={x.definitionId} value={x.definitionId}>
                                                    {(x.definition?.description || t('stockItems.attributeWithId', { id: x.definitionId }))} ({t('stockItems.current')}: {String(x.attr.value_number)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.splitValue')}</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            min="0.000001"
                                            value={splitFormData.split_value}
                                            onChange={(e) => setSplitFormData((prev) => ({ ...prev, split_value: e.target.value }))}
                                            className="form-input"
                                            style={{ height: '44px' }}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.newItemName')}</label>
                                            <input
                                                type="text"
                                                value={splitFormData.new_item_name}
                                                onChange={(e) => setSplitFormData((prev) => ({ ...prev, new_item_name: e.target.value }))}
                                                className="form-input"
                                                style={{ height: '44px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.newInventoryNumber')}</label>
                                            <input
                                                type="text"
                                                value={splitFormData.new_item_inventory_number}
                                                onChange={(e) => setSplitFormData((prev) => ({ ...prev, new_item_inventory_number: e.target.value }))}
                                                className="form-input"
                                                style={{ height: '44px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.newItemStatus')}</label>
                                            <input
                                                type="text"
                                                value={splitFormData.new_item_status}
                                                onChange={(e) => setSplitFormData((prev) => ({ ...prev, new_item_status: e.target.value }))}
                                                className="form-input"
                                                style={{ height: '44px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.destinationLocation')}</label>
                                            <select
                                                value={splitFormData.destination_location_id}
                                                onChange={(e) => setSplitFormData((prev) => ({ ...prev, destination_location_id: e.target.value }))}
                                                className="form-input"
                                                style={{ height: '44px' }}
                                            >
                                                <option value="">{t('stockItems.sameAsSourceLocation')}</option>
                                                {locations.map((loc) => (
                                                    <option key={loc.location_id} value={loc.location_id}>
                                                        {loc.location_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" onClick={closeSplitModal} disabled={splitSubmitting} className="btn btn-secondary">{t('stockItems.cancel')}</button>
                                        <button type="submit" disabled={splitSubmitting || splitAttributeOptions.length === 0} className="btn btn-primary">
                                            {splitSubmitting ? t('stockItems.splitting') : t('stockItems.split')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Move Modal */}
                {showMoveModal && movingStockItem && (
                    <div className="modal-overlay" onClick={() => !moveSubmitting && closeMoveModal()}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('stockItems.moveItemTitle')}: {movingStockItem.stock_item_name || t('stockItems.itemWithId', { id: movingStockItem.stock_item_id })}</h3>
                                <button className="modal-close" onClick={closeMoveModal} disabled={moveSubmitting}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={submitMove}>
                                    <div className="form-group">
                                        <div style={{
                                            marginBottom: 'var(--space-3)',
                                            padding: 'var(--space-3)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'var(--color-bg-secondary)'
                                        }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{t('stockItems.currentLocation')}</div>
                                            <div style={{ fontWeight: 600 }}>{moveLocationLabel || t('stockItems.unknown')}</div>
                                        </div>
                                        <label className="form-label">{t('stockItems.destinationLocation')}</label>
                                        <select
                                            value={selectedMoveLocationId}
                                            onChange={(e) => setSelectedMoveLocationId(e.target.value)}
                                            required
                                            disabled={moveSubmitting}
                                            className="form-input"
                                            style={{ height: '44px' }}
                                        >
                                            <option value="">{t('stockItems.selectLocation')}</option>
                                            {locations.map((r) => (
                                                <option key={r.location_id} value={r.location_id}>
                                                    {r.location_name || t('stockItems.locationWithId', { id: r.location_id })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={moveSubmitting || !selectedMoveLocationId} className="btn btn-primary">
                                            {moveSubmitting ? t('stockItems.moving') : t('stockItems.move')}
                                        </button>
                                        <button type="button" onClick={closeMoveModal} disabled={moveSubmitting} className="btn btn-secondary">{t('stockItems.cancel')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Modal */}
                {showAssignForm && assigningStockItem && (
                    <div className="modal-overlay" onClick={() => { setShowAssignForm(false); setAssigningStockItem(null); }}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('stockItems.assignItemTitle')}: {assigningStockItem.stock_item_name || t('stockItems.itemWithId', { id: assigningStockItem.stock_item_id })}</h3>
                                <button className="modal-close" onClick={() => { setShowAssignForm(false); setAssigningStockItem(null); }}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAssignSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.assignToPerson')}</label>
                                        <select name="person" value={assignFormData.person} onChange={handleAssignInputChange} required disabled={saving} className="form-input" style={{ height: '44px' }}>
                                            <option value="">{t('stockItems.selectPerson')}</option>
                                            {persons.map(p => (
                                                <option key={p.person_id} value={p.person_id}>
                                                    {p.first_name} {p.last_name} ({p.person_id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.startDateAuto')}</label>
                                        <input type="datetime-local" name="start_datetime" value={assignFormData.start_datetime} onChange={handleAssignInputChange} required readOnly className="form-input" style={{ height: '44px', cursor: 'not-allowed' }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.condition')}</label>
                                        <input type="text" name="condition_on_assignment" value={assignFormData.condition_on_assignment} onChange={handleAssignInputChange} placeholder={t('stockItems.conditionPlaceholder')} required disabled={saving} className="form-input" style={{ height: '44px' }} />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={saving} className="btn btn-primary">
                                            {saving ? t('stockItems.assigning') : t('stockItems.assignItem')}
                                        </button>
                                        <button type="button" onClick={() => { setShowAssignForm(false); setAssigningStockItem(null); }} className="btn btn-secondary">{t('stockItems.cancel')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Discharge Modal */}
                {dischargingAssignment && (
                    <div className="modal-overlay" onClick={() => setDischargingAssignment(null)}>
                        <div className="modal" style={{ maxWidth: '480px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('stockItems.confirmDischarge')}</h3>
                                <button className="modal-close" onClick={() => setDischargingAssignment(null)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    {t('stockItems.dischargeConfirmText', { item: dischargingAssignment.stock_item?.stock_item_name || t('stockItems.stockItem'), person: dischargingAssignment.person })}
                                    <br /><br />
                                    {t('stockItems.endDateNow')}
                                </p>
                                <div className="form-actions">
                                    <button onClick={() => handleDischarge(dischargingAssignment.assignment_id)} disabled={saving} className="btn btn-primary" style={{ backgroundColor: '#ef4444' }}>
                                        {saving ? t('stockItems.discharging') : t('stockItems.confirmDischarge')}
                                    </button>
                                    <button onClick={() => setDischargingAssignment(null)} className="btn btn-secondary">{t('stockItems.cancel')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Package size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockItems.title')}</h1>
                        <p className="page-subtitle">{t('stockItems.subtitle')}</p>
                    </div>
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
            {successToast && (
                <div style={{
                    position: 'fixed',
                    top: '88px',
                    right: '20px',
                    zIndex: 2100,
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #86efac',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-sm)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.18)',
                    maxWidth: '420px'
                }}>
                    {successToast}
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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('stockItems.library')}</h2>
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
                            title={t('stockItems.addType')}
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
                                    placeholder={t('stockItems.typeName')}
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <input
                                    type="text"
                                    name="stock_item_type_code"
                                    value={formData.stock_item_type_code}
                                    onChange={handleInputChange}
                                    placeholder={t('stockItems.codePlaceholder')}
                                    required
                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>{t('stockItems.save')}</button>
                                    <button type="button" onClick={() => setShowTypeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>{t('stockItems.cancel')}</button>
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
                                            + {t('stockItems.addModel')}
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
                                                <span>{formatModelLabel(model) || t('stockItems.modelWithId', { id: model.stock_item_model_id })}</span>
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
                                {t('stockItems.noTypes')}
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
                                <h2>{t('stockItems.addNewModelFor')} {selectedStockItemType?.stock_item_type_label}</h2>
                                <button onClick={() => setShowModelForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>{t('stockItems.cancel')}</button>
                             </div>
                             {stockItemBrands.length === 0 ? (
                                <div style={{ color: '#c33', backgroundColor: '#fee', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                    {t('stockItems.noBrandsFound')}
                                </div>
                             ) : (
                                <form onSubmit={handleModelSubmit} style={{ maxWidth: '600px' }}>
                                    {/* Brand */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>{t('stockItems.brand')} *</label>
                                        <select name="stock_item_brand" value={modelFormData.stock_item_brand} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                            <option value="">{t('stockItems.selectBrand')}</option>
                                            {stockItemBrands.map(b => <option key={b.stock_item_brand_id} value={b.stock_item_brand_id}>{b.brand_name}</option>)}
                                        </select>
                                    </div>
                                    {/* Model Name & Code */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>{t('stockItems.modelName')} *</label>
                                            <input type="text" name="model_name" value={modelFormData.model_name} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>{t('stockItems.modelCode')} *</label>
                                            <input type="text" name="model_code" value={modelFormData.model_code} onChange={handleModelInputChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                    </div>
                                    {/* Year & Warranty */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>{t('stockItems.releaseYear')}</label>
                                            <input type="number" name="release_year" value={modelFormData.release_year} onChange={handleModelInputChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>{t('stockItems.warrantyMonths')}</label>
                                            <input type="number" name="warranty_expiry_in_months" value={modelFormData.warranty_expiry_in_months} onChange={handleModelInputChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                        </div>
                                    </div>
                                    {/* Notes */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>{t('stockItems.notes')}</label>
                                        <textarea name="notes" value={modelFormData.notes} onChange={handleModelInputChange} rows="3" style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                                    </div>
                                    {/* Active */}
                                    <div style={{ marginBottom: 'var(--space-6)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                            <input type="checkbox" name="is_active" checked={modelFormData.is_active} onChange={handleModelInputChange} />
                                            {t('stockItems.activeModel')}
                                        </label>
                                    </div>
                                    <button type="submit" disabled={saving} style={{ padding: 'var(--space-2) var(--space-6)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                                        {saving ? t('stockItems.creating') : t('stockItems.createModel')}
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
                                        {formatModelLabel(selectedStockItemModel) || selectedStockItemModel.model_name || ''} <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', fontWeight: 'normal' }}>({selectedStockItemModel.model_code})</span>
                                    </h2>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                        {selectedStockItemModel.brand_name} • {t('stockItems.itemCount', { count: stockItems.length })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingStockItem(null);
                                        setFormTranslations({});
                                        setStockItemFormData({
                                            stock_item_name: '',
                                            stock_item_inventory_number: '',
                                            stock_item_status: 'not_delivered_to_company',
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
                                    + {t('stockItems.addItem')}
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
                                {showStockItemForm && (
                                    <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-4)' }}>{editingStockItem ? t('stockItems.editItem') : t('stockItems.newItem')}</div>
                                        <form onSubmit={handleStockItemSubmit}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div>
                                                    <TranslatableInput
                                                        label={t('stockItems.name')}
                                                        baseFieldName="stock_item_name"
                                                        value={stockItemFormData.stock_item_name}
                                                        onChange={(name, value) => handleStockItemInputChange({ target: { name, value } })}
                                                        translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.stock_item_name]))}
                                                        onTranslationChange={handleFormTranslationChange}
                                                        placeholder={t('stockItems.itemNamePlaceholder')}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('stockItems.status')}</label>
                                                    <select name="stock_item_status" value={stockItemFormData.stock_item_status} onChange={handleStockItemInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                                        <option value="not_delivered_to_company">{t('stockItems.statusNotDelivered')}</option>
                                                        <option value="in_stock">{t('stockItems.statusInStock')}</option>
                                                        <option value="in_use">{t('stockItems.statusInUse')}</option>
                                                        <option value="reserved">{t('stockItems.statusReserved')}</option>
                                                        <option value="expired">{t('stockItems.statusExpired')}</option>
                                                        <option value="failed">{t('stockItems.statusFailed')}</option>
                                                        <option value="lost">{t('stockItems.statusLost')}</option>
                                                        <option value="stolen">{t('stockItems.statusStolen')}</option>
                                                        <option value="irrecoverably_damaged">{t('stockItems.statusIrrecoverablyDamaged')}</option>
                                                        <option value="destroyed">{t('stockItems.statusDestroyed')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>{t('stockItems.inventoryNumber')}</label>
                                                    <input type="text" name="stock_item_inventory_number" value={stockItemFormData.stock_item_inventory_number} onChange={handleStockItemInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                                                <button type="submit" style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>{t('stockItems.saveItem')}</button>
                                                <button type="button" onClick={() => setShowStockItemForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>{t('stockItems.cancel')}</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {stockItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>
                                        {t('stockItems.noItemsForModel')}
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                                                <th style={{ padding: 'var(--space-2)' }}>{t('stockItems.name')}</th>
                                                <th style={{ padding: 'var(--space-2)' }}>{t('stockItems.inventoryNo')}</th>
                                                <th style={{ padding: 'var(--space-2)' }}>{t('stockItems.status')}</th>
                                                <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>{t('stockItems.actions')}</th>
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
                                                        <div style={{ fontWeight: '500' }}>{item.stock_item_name || t('stockItems.unnamedItem')}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <div style={{ color: 'var(--color-text-secondary)' }}>{item.stock_item_inventory_number}</div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: 'var(--font-size-xs)',
                                                            backgroundColor: item.stock_item_status === 'in_stock' ? 'rgba(16, 185, 129, 0.15)' : 
                                                                             item.stock_item_status === 'not_delivered_to_company' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-bg-secondary)',
                                                            color: item.stock_item_status === 'in_stock' ? 'var(--color-success)' : 
                                                                   item.stock_item_status === 'not_delivered_to_company' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                                                        }}>
                                                            {String(item.stock_item_status || '').split('_').map((p) => p ? p[0].toUpperCase() + p.slice(1) : p).join(' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openStockItemDetailsModal(item); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            {t('stockItems.attributes')}
                                                        </button>
                                                        {canMoveStockItems && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openMoveModal(item); }}
                                                                style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                {t('stockItems.move')}
                                                            </button>
                                                        )}
                                                        {canSplitStockItems && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openSplitModal(item); }}
                                                                style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                {t('stockItems.split')}
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
                                                                        {t('stockItems.discharge')}
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
                                                                                condition_on_assignment: item.stock_item_status === 'in_stock' ? 'Good' : 'Needs Repair'
                                                                            });
                                                                            setShowAssignForm(true);
                                                                        }}
                                                                        style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: '500' }}
                                                                    >
                                                                        {t('stockItems.assign')}
                                                                    </button>
                                                                );
                                                            })()
                                                        )}
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditStockItem(item); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            {t('stockItems.edit')}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteStockItem(item.stock_item_id); }}
                                                            style={{ background: 'none', border: 'none', color: '#c33', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            {t('stockItems.delete')}
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
                            <p>{t('stockItems.selectModelPrompt')}</p>
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
                                    {selectedStockItem.stock_item_name || t('stockItems.itemWithId', { id: selectedStockItem.stock_item_id })}
                                </h2>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                    {t('stockItems.inventory')}: {selectedStockItem.stock_item_inventory_number || '—'} • {t('stockItems.status')}: {selectedStockItem.stock_item_status || '—'}
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
                                {t('stockItems.close')}
                            </button>
                        </div>

                        {canSuggestStockItemForDestruction && (selectedStockItem.stock_item_status || '').toLowerCase() === 'failed' && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <button
                                    type="button"
                                    onClick={submitSuggestStockItemForDestruction}
                                    disabled={saving}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {saving ? t('stockItems.saving') : t('stockItems.suggestForDestruction')}
                                </button>
                            </div>
                        )}

                        <div style={{
                            marginBottom: 'var(--space-6)',
                            padding: 'var(--space-4)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-bg-secondary)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.assignedTo')}</div>
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
                                <div style={{ fontWeight: '600' }}>{t('stockItems.stockItemAttributes')}</div>
                                <button
                                    onClick={() => setShowStockItemAttributeForm(!showStockItemAttributeForm)}
                                    style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                >
                                    + {t('stockItems.addValue')}
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
                                        <option value="">{t('stockItems.selectAttrDefPlaceholder')}</option>
                                        {stockItemAttributeDefinitions.map((def) => (
                                            <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                {def.description || t('stockItems.attributeWithId', { id: def.stock_item_attribute_definition_id })}
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
                                                    placeholder={t('stockItems.numberValue')}
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
                                                    {t('stockItems.true')}
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
                                                placeholder={t('stockItems.stringValue')}
                                                value={stockItemAttributeForm.value_string}
                                                onChange={handleStockItemAttributeInputChange}
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            />
                                        );
                                    })()}
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                        <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>{t('stockItems.save')}</button>
                                        <button type="button" onClick={() => setShowStockItemAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>{t('stockItems.cancel')}</button>
                                    </div>
                                </form>
                            )}

                            {stockItemAttributes.length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>{t('stockItems.noAttrValues')}</div>
                            ) : (
                                stockItemAttributes.map((attr) => {
                                    const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                    const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                    return (
                                        <div key={`${attr.stock_item}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{definition?.description || t('stockItems.attributeWithId', { id: attr.stock_item_attribute_definition })}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? t('stockItems.noValue') : String(value)}</div>
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

            {showSplitModal && splittingStockItem && (
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
                        width: '100%',
                        maxWidth: 620,
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: 'var(--space-4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
                                {t('stockItems.splitItemTitle')}: {splittingStockItem.stock_item_name || t('stockItems.itemWithId', { id: splittingStockItem.stock_item_id })}
                            </h2>
                            <button
                                type="button"
                                onClick={closeSplitModal}
                                style={{ border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: splitSubmitting ? 'not-allowed' : 'pointer', fontSize: 18 }}
                                disabled={splitSubmitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={submitSplit}>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>{t('stockItems.numericAttribute')}</label>
                                <select
                                    value={splitFormData.attribute_definition_id}
                                    onChange={(e) => setSplitFormData((prev) => ({ ...prev, attribute_definition_id: e.target.value }))}
                                    style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                    required
                                >
                                    {splitAttributeOptions.length === 0 && <option value="">{t('stockItems.noNumericAttr')}</option>}
                                    {splitAttributeOptions.map((x) => (
                                        <option key={x.definitionId} value={x.definitionId}>
                                            {(x.definition?.description || t('stockItems.attributeWithId', { id: x.definitionId }))} ({t('stockItems.current')}: {String(x.attr.value_number)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>{t('stockItems.splitValue')}</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    min="0.000001"
                                    value={splitFormData.split_value}
                                    onChange={(e) => setSplitFormData((prev) => ({ ...prev, split_value: e.target.value }))}
                                    style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>{t('stockItems.newItemName')}</label>
                                    <input
                                        type="text"
                                        value={splitFormData.new_item_name}
                                        onChange={(e) => setSplitFormData((prev) => ({ ...prev, new_item_name: e.target.value }))}
                                        style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>{t('stockItems.newInventoryNumber')}</label>
                                    <input
                                        type="text"
                                        value={splitFormData.new_item_inventory_number}
                                        onChange={(e) => setSplitFormData((prev) => ({ ...prev, new_item_inventory_number: e.target.value }))}
                                        style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>{t('stockItems.newItemStatus')}</label>
                                    <input
                                        type="text"
                                        value={splitFormData.new_item_status}
                                        onChange={(e) => setSplitFormData((prev) => ({ ...prev, new_item_status: e.target.value }))}
                                        style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>{t('stockItems.destinationLocation')}</label>
                                    <select
                                        value={splitFormData.destination_location_id}
                                        onChange={(e) => setSplitFormData((prev) => ({ ...prev, destination_location_id: e.target.value }))}
                                        style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                    >
                                        <option value="">{t('stockItems.sameAsSourceLocation')}</option>
                                        {locations.map((loc) => (
                                            <option key={loc.location_id} value={loc.location_id}>
                                                {loc.location_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                <button
                                    type="button"
                                    onClick={closeSplitModal}
                                    style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: splitSubmitting ? 'not-allowed' : 'pointer' }}
                                    disabled={splitSubmitting}
                                >
                                    {t('stockItems.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: splitSubmitting ? 'not-allowed' : 'pointer' }}
                                    disabled={splitSubmitting || splitAttributeOptions.length === 0}
                                >
                                    {splitSubmitting ? t('stockItems.splitting') : t('stockItems.split')}
                                </button>
                            </div>
                        </form>
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
                                {t('stockItems.moveItemTitle')}: {movingStockItem.stock_item_name || t('stockItems.itemWithId', { id: movingStockItem.stock_item_id })}
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
                                {t('stockItems.close')}
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
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{t('stockItems.currentLocation')}</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {moveLocationLabel || t('stockItems.unknown')}
                                    </div>
                                </div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>{t('stockItems.destinationLocation')}</label>
                                <select
                                    value={selectedMoveLocationId}
                                    onChange={(e) => setSelectedMoveLocationId(e.target.value)}
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
                                    <option value="">{t('stockItems.selectLocation')}</option>
                                    {locations.map((r) => (
                                        <option key={r.location_id} value={r.location_id}>
                                            {r.location_name || t('stockItems.locationWithId', { id: r.location_id })}
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
                                    {t('stockItems.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={moveSubmitting || !selectedMoveLocationId}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    {moveSubmitting ? t('stockItems.moving') : t('stockItems.move')}
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
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>{t('stockItems.assignItemTitle')}: {assigningStockItem.stock_item_name || t('stockItems.itemWithId', { id: assigningStockItem.stock_item_id })}</h2>
                        <form onSubmit={handleAssignSubmit}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>{t('stockItems.assignToPerson')}</label>
                                <select
                                    name="person"
                                    value={assignFormData.person}
                                    onChange={handleAssignInputChange}
                                    required
                                    disabled={saving}
                                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                >
                                    <option value="">{t('stockItems.selectPerson')}</option>
                                    {persons.map(p => (
                                        <option key={p.person_id} value={p.person_id}>
                                            {p.first_name} {p.last_name} ({p.person_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>{t('stockItems.startDateAuto')}</label>
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
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>{t('stockItems.condition')}</label>
                                <input
                                    type="text"
                                    name="condition_on_assignment"
                                    value={assignFormData.condition_on_assignment}
                                    onChange={handleAssignInputChange}
                                    placeholder={t('stockItems.conditionPlaceholder')}
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
                                    {t('stockItems.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                >
                                    {saving ? t('stockItems.assigning') : t('stockItems.assignItem')}
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
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>{t('stockItems.confirmDischarge')}</h2>
                        <p style={{ marginBottom: 'var(--space-6)' }}>
                            {t('stockItems.dischargeConfirmText', { item: dischargingAssignment.stock_item?.stock_item_name || t('stockItems.stockItem'), person: dischargingAssignment.person })}
                            <br /><br />
                            {t('stockItems.endDateNow')}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setDischargingAssignment(null)}
                                style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--color-text)' }}
                            >
                                {t('stockItems.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDischarge(dischargingAssignment.assignment_id)}
                                disabled={saving}
                                style={{ padding: 'var(--space-2) var(--space-4)', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                                {saving ? t('stockItems.discharging') : t('stockItems.confirmDischarge')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockItemsPage;
