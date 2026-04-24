import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, Plus, Box, Pencil, X, XCircle, Sliders, Tag, Layers } from 'lucide-react';
import TranslatableInput from '../components/TranslatableInput';
import {
    assetTypeService,
    assetModelService,
    assetBrandService,
    assetService,
    locationService,
    assetAttributeDefinitionService,
    assetTypeAttributeService,
    assetModelAttributeService,
    assetAttributeValueService,
    personService,
    assetAssignmentService,
    authService
} from '../services/api';

const AssetsPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const typeIdParam = searchParams.get('typeId');
    const modelIdParam = searchParams.get('modelId');
    const isInstancesMode = location.pathname.endsWith('/instances');

    const formatModelLabel = (model) => {
        return [model?.brand_name, model?.model_name].filter(Boolean).join(' ');
    };

    const [assetTypes, setAssetTypes] = useState([]);
    const [assetBrands, setAssetBrands] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const [assets, setAssets] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [assetTypeAttributes, setAssetTypeAttributes] = useState([]);
    const [assetModelAttributes, setAssetModelAttributes] = useState([]);
    const [assetAttributes, setAssetAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [persons, setPersons] = useState([]);
    const [assignments, setAssignments] = useState([]);

    // Form visibility states
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [showTypeAttributeForm, setShowTypeAttributeForm] = useState(false);
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [showAssetAttributeForm, setShowAssetAttributeForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);

    // Selection states
    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [selectedAssetModel, setSelectedAssetModel] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assigningAsset, setAssigningAsset] = useState(null);
    const [dischargingAssignment, setDischargingAssignment] = useState(null);

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
    const [formTranslations, setFormTranslations] = useState({});
    const [assetFormData, setAssetFormData] = useState({
        asset_serial_number: '',
        asset_inventory_number: '',
        asset_service_tag: '',
        asset_name: '',
        asset_status: 'in_stock',
        attribution_order_id: '',
        destruction_certificate_id: ''
    });
    const [typeAttributeForm, setTypeAttributeForm] = useState({
        asset_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });
    const [modelAttributeForm, setModelAttributeForm] = useState({
        asset_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [assetAttributeForm, setAssetAttributeForm] = useState({
        asset_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [assignFormData, setAssignFormData] = useState({
        person: '',
        start_datetime: '',
        end_datetime: '',
        condition_on_assignment: 'New'
    });

    const [editingAsset, setEditingAsset] = useState(null);
    const [saving, setSaving] = useState(false);

    const [movingAsset, setMovingAsset] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveLocations, setMoveLocations] = useState([]);
    const [moveCurrentLocationId, setMoveCurrentLocationId] = useState(null);
    const [moveCurrentLocationLabel, setMoveCurrentLocationLabel] = useState('');
    const [selectedMoveLocationId, setSelectedMoveLocationId] = useState('');
    const [movementReasonAr, setMovementReasonAr] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const formatStatusLabel = (value, asset) => {
        if (!value) return '';
        const lang = i18n.language;
        const statusAr = asset?.asset_status_ar;
        const statusEn = asset?.asset_status_en;
        if (lang === 'ar') {
            if (statusAr && statusEn && statusAr !== statusEn) return `${statusAr} (${statusEn})`;
            return statusAr || statusEn || value.split('_').map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p)).join(' ');
        }
        if (statusEn && statusAr && statusEn !== statusAr) return `${statusEn} (${statusAr})`;
        return statusEn || statusAr || value.split('_').map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p)).join(' ');
    };

    useEffect(() => {
        fetchAssetTypes();
        fetchAssetBrands();
        fetchAttributeDefinitions();
        fetchPersons();
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!typeIdParam || !modelIdParam) {
            navigate('/dashboard/assets/types', { replace: true });
        }
    }, [isInstancesMode, typeIdParam, modelIdParam, navigate]);

    useEffect(() => {
        if (selectedAssetType) {
            fetchAssetModels(selectedAssetType.asset_type_id);
            fetchAssetTypeAttributes(selectedAssetType.asset_type_id);
            // We don't nullify selectedAssetModel immediately if we want to keep context, 
            // but usually switching type implies switching context. 
            // If the user clicks the SAME type, we might want to toggle collapse? 
            // For now, let's keep the behavior: select type -> fetch models -> clear asset selection
            setSelectedAssetModel(null);
            setAssets([]);
            setAssetModelAttributes([]);
        } else {
            setAssetModels([]);
            setAssetTypeAttributes([]);
        }
    }, [selectedAssetType]);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!typeIdParam) return;
        if (!Array.isArray(assetTypes) || assetTypes.length === 0) return;
        const foundType = assetTypes.find((t) => String(t.asset_type_id) === String(typeIdParam)) || null;
        if (foundType && selectedAssetType?.asset_type_id !== foundType.asset_type_id) {
            setSelectedAssetType(foundType);
        }
    }, [isInstancesMode, typeIdParam, assetTypes, selectedAssetType]);

    useEffect(() => {
        if (selectedAssetModel) {
            fetchAssets(selectedAssetModel.asset_model_id);
            fetchAssetModelAttributes(selectedAssetModel.asset_model_id);
        } else {
            setAssets([]);
            setAssetModelAttributes([]);
            setSelectedAsset(null);
            setAssetAttributes([]);
        }
    }, [selectedAssetModel]);

    useEffect(() => {
        if (!isInstancesMode) return;
        if (!modelIdParam) return;
        if (!Array.isArray(assetModels) || assetModels.length === 0) return;
        const foundModel = assetModels.find((m) => String(m.asset_model_id) === String(modelIdParam)) || null;
        if (foundModel && selectedAssetModel?.asset_model_id !== foundModel.asset_model_id) {
            setSelectedAssetModel(foundModel);
        }
    }, [isInstancesMode, modelIdParam, assetModels, selectedAssetModel]);

    useEffect(() => {
        if (selectedAsset) {
            fetchAssetAttributes(selectedAsset.asset_id);
        } else {
            setAssetAttributes([]);
        }
    }, [selectedAsset]);

    const activeAssignmentsByAsset = useMemo(() => {
        const map = new Map();
        assignments.forEach(a => {
            if (a.is_active) {
                map.set(a.asset?.asset_id, a);
            }
        });
        return map;
    }, [assignments]);

    const definitionLookup = useMemo(() => {
        const map = new Map();
        attributeDefinitions.forEach((def) => {
            map.set(def.asset_attribute_definition_id, def);
        });
        return map;
    }, [attributeDefinitions]);

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

    const fetchAttributeDefinitions = async () => {
        try {
            const data = await assetAttributeDefinitionService.getAll();
            setAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch attribute definitions: ' + err.message);
            setAttributeDefinitions([]);
        }
    };

    const fetchAssetTypeAttributes = async (assetTypeId) => {
        try {
            const data = await assetTypeAttributeService.getByAssetType(assetTypeId);
            setAssetTypeAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch asset type attributes: ' + err.message);
            setAssetTypeAttributes([]);
        }
    };

    const fetchAssetModelAttributes = async (assetModelId) => {
        try {
            const data = await assetModelAttributeService.getByAssetModel(assetModelId);
            setAssetModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch asset model attributes: ' + err.message);
            setAssetModelAttributes([]);
        }
    };

    const fetchAssetAttributes = async (assetId) => {
        try {
            const data = await assetAttributeValueService.getByAsset(assetId);
            setAssetAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch asset attributes: ' + err.message);
            setAssetAttributes([]);
        }
    };

    const fetchPersons = async () => {
        try {
            const data = await personService.getAll();
            setPersons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch persons:', err);
        }
    };

    const fetchAssignments = async () => {
        try {
            const data = await assetAssignmentService.getAll();
            setAssignments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
        }
    };

    const handleAssignInputChange = (e) => {
        const { name, value } = e.target;
        setAssignFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assigningAsset) return;
        setSaving(true);
        setError(null);
        try {
            await assetAssignmentService.create({
                ...assignFormData,
                asset: assigningAsset.asset_id,
                start_datetime: new Date(assignFormData.start_datetime).toISOString(),
                end_datetime: assignFormData.end_datetime ? new Date(assignFormData.end_datetime).toISOString() : null,
            });
            setShowAssignForm(false);
            setAssigningAsset(null);
            fetchAssignments();
            alert('Asset assigned successfully!');
        } catch (err) {
            setError('Failed to assign asset: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDischarge = async (assignmentId) => {
        setSaving(true);
        setError(null);
        try {
            await assetAssignmentService.discharge(assignmentId);
            setDischargingAssignment(null);
            fetchAssignments();
            alert('Asset discharged successfully!');
        } catch (err) {
            setError('Failed to discharge asset: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmAssignment = async (assignmentId) => {
        setSaving(true);
        setError(null);
        try {
            await assetAssignmentService.confirm(assignmentId);
            fetchAssignments();
            alert('Assignment confirmed successfully!');
        } catch (err) {
            setError('Failed to confirm assignment: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
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

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { asset_name: value } }));
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

    const handleAssetAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAssetAttributeForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            setError(t('assets.createTypeError') + ': ' + (err.response?.data?.error || err.message));
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
            setError(t('assets.selectBrand'));
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
            setError(t('assets.createModelError') + ': ' + errorMsg);
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
                asset_model: selectedAssetModel.asset_model_id,
                attribution_order_id: assetFormData.attribution_order_id ? Number(assetFormData.attribution_order_id) : null,
                destruction_certificate_id: assetFormData.destruction_certificate_id ? Number(assetFormData.destruction_certificate_id) : null,
            };
            const translations = { ...formTranslations };
            if (assetFormData.asset_name) {
                translations['en'] = {
                    ...(translations['en'] || {}),
                    asset_name: assetFormData.asset_name,
                };
            }
            if (Object.keys(translations).length > 0) {
                dataToSubmit.translations = translations;
            }
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
                asset_status: 'in_stock',
                attribution_order_id: '',
                destruction_certificate_id: ''
            });
            setFormTranslations({});
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

    const handleTypeAttributeSubmit = async (e) => {
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
                is_mandatory: typeAttributeForm.is_mandatory,
                default_value: typeAttributeForm.default_value || null
            };
            await assetTypeAttributeService.create(payload);
            setTypeAttributeForm({ asset_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowTypeAttributeForm(false);
            await fetchAssetTypeAttributes(selectedAssetType.asset_type_id);
        } catch (err) {
            setError('Failed to assign attribute to asset type: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssetModel) {
            setError('Please select an asset model first');
            return;
        }
        if (!modelAttributeForm.asset_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                asset_model: selectedAssetModel.asset_model_id,
                asset_attribute_definition: Number(modelAttributeForm.asset_attribute_definition),
                value_string: modelAttributeForm.value_string || null,
                value_number: modelAttributeForm.value_number ? Number(modelAttributeForm.value_number) : null,
                value_bool: modelAttributeForm.value_bool,
                value_date: modelAttributeForm.value_date || null
            };
            await assetModelAttributeService.create(payload);
            setModelAttributeForm({
                asset_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowModelAttributeForm(false);
            await fetchAssetModelAttributes(selectedAssetModel.asset_model_id);
        } catch (err) {
            setError('Failed to add model attribute value: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAssetAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAsset) {
            setError('Please select an asset first');
            return;
        }
        if (!assetAttributeForm.asset_attribute_definition) {
            setError('Please select an attribute definition');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                asset: selectedAsset.asset_id,
                asset_attribute_definition: Number(assetAttributeForm.asset_attribute_definition),
                value_string: assetAttributeForm.value_string || null,
                value_number: assetAttributeForm.value_number ? Number(assetAttributeForm.value_number) : null,
                value_bool: assetAttributeForm.value_bool,
                value_date: assetAttributeForm.value_date || null
            };
            await assetAttributeValueService.create(payload);
            setAssetAttributeForm({
                asset_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            setShowAssetAttributeForm(false);
            await fetchAssetAttributes(selectedAsset.asset_id);
        } catch (err) {
            setError('Failed to add asset attribute value: ' + err.message);
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
            asset_status: asset.asset_status || 'not_delivered_to_company',
            attribution_order_id: asset.attribution_order_id ?? '',
            destruction_certificate_id: asset.destruction_certificate_id ?? ''
        });
        const trans = {};
        if (asset.asset_name_ar) trans['ar'] = { asset_name: asset.asset_name_ar };
        if (asset.asset_name_en) trans['en'] = { asset_name: asset.asset_name_en };
        setFormTranslations(trans);
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

    const handleDeleteTypeAttribute = async (assetTypeId, definitionId) => {
        if (window.confirm('Remove this attribute from the asset type?')) {
            try {
                await assetTypeAttributeService.delete(assetTypeId, definitionId);
                if (selectedAssetType) {
                    await fetchAssetTypeAttributes(selectedAssetType.asset_type_id);
                }
            } catch (err) {
                setError('Failed to remove asset type attribute: ' + err.message);
            }
        }
    };

    const handleDeleteModelAttribute = async (assetModelId, definitionId) => {
        if (window.confirm('Remove this attribute value from the asset model?')) {
            try {
                await assetModelAttributeService.delete(assetModelId, definitionId);
                if (selectedAssetModel) {
                    await fetchAssetModelAttributes(selectedAssetModel.asset_model_id);
                }
            } catch (err) {
                setError('Failed to remove asset model attribute: ' + err.message);
            }
        }
    };

    const handleDeleteAssetAttribute = async (assetId, definitionId) => {
        if (window.confirm('Remove this attribute value from the asset?')) {
            try {
                await assetAttributeValueService.delete(assetId, definitionId);
                if (selectedAsset) {
                    await fetchAssetAttributes(selectedAsset.asset_id);
                }
            } catch (err) {
                setError('Failed to remove asset attribute: ' + err.message);
            }
        }
    };

    const openAssetDetailsModal = (asset) => {
        setSelectedAsset(asset);
        setShowAssetDetailsModal(true);
    };

    const closeAssetDetailsModal = () => {
        setShowAssetDetailsModal(false);
        setShowAssetAttributeForm(false);
    };

    const submitSuggestAssetForDestruction = async () => {
        if (!selectedAsset) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await assetService.suggestForDestruction(selectedAsset.asset_id);
            setSelectedAsset(updated);
            if (selectedAssetModel) {
                await fetchAssets(selectedAssetModel.asset_model_id);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to suggest asset for destruction');
        } finally {
            setSaving(false);
        }
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setMovingAsset(null);
        setMoveLocations([]);
        setMoveCurrentLocationId(null);
        setMoveCurrentLocationLabel('');
        setSelectedMoveLocationId('');
        setMovementReasonAr('');
        setMoveSubmitting(false);
    };

    const openMoveModal = async (asset) => {
        setError(null);
        setMovingAsset(asset);
        setMoveCurrentLocationId(null);
        setMoveCurrentLocationLabel('');
        setSelectedMoveLocationId('');
        setMovementReasonAr('');
        setShowMoveModal(true);
        try {
            const [locations, currentLocation] = await Promise.all([
                locationService.getAll(),
                assetService.getCurrentLocation(asset.asset_id),
            ]);

            const locationsArr = Array.isArray(locations) ? locations : [];
            setMoveLocations(locationsArr);

            const currentLocationId = currentLocation?.location?.location_id ?? null;
            setMoveCurrentLocationId(currentLocationId);
            const currentLocationObj = locationsArr.find((r) => r.location_id === currentLocationId);
            setMoveCurrentLocationLabel(
                currentLocationObj?.location_name || (currentLocationId ? `Location ${currentLocationId}` : 'Unknown')
            );
        } catch (err) {
            console.error(err);
            setMoveLocations([]);
            setError('Failed to load locations');
        }
    };

    const submitMove = async (e) => {
        e.preventDefault();
        if (!movingAsset) return;
        if (!selectedMoveLocationId) {
            setError('Please select a destination location');
            return;
        }
        try {
            setMoveSubmitting(true);
            await assetService.move(movingAsset.asset_id, {
                destination_location_id: Number(selectedMoveLocationId),
                movement_reason_ar: movementReasonAr || undefined,
            });
            if (selectedAssetModel) {
                await fetchAssets(selectedAssetModel.asset_model_id);
            }
            closeMoveModal();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to move asset');
        } finally {
            setMoveSubmitting(false);
        }
    };

    const userAccount = authService.getUser();
    const isSuperuser = userAccount?.is_superuser;
    const isAssetResponsible = isSuperuser || userAccount?.roles?.some(r => r.role_code === 'asset_responsible' || r.role_code === 'exploitation_chief' || r.role_code === 'it_bureau_chief');
    const isExploitationChief = userAccount?.roles?.some(r => r.role_code === 'exploitation_chief') || isSuperuser;
    const isMaintenanceChief = userAccount?.roles?.some(r => r.role_code === 'maintenance_chief') || isSuperuser;
    const canMoveAssets = isAssetResponsible || isExploitationChief;
    const canAssignAssets = isAssetResponsible || isExploitationChief;

    const canSuggestAssetForDestruction = isMaintenanceChief;

    const pendingConfirmations = assignments.filter(a => !a.is_confirmed_by_exploitation_chief && a.is_active);

    const filteredAssets = useMemo(() => {
        let result = assets;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(a =>
                (a.asset_name || '').toLowerCase().includes(term) ||
                (a.asset_inventory_number || '').toLowerCase().includes(term) ||
                (a.asset_serial_number || '').toLowerCase().includes(term)
            );
        }
        if (statusFilter) {
            result = result.filter(a => a.asset_status === statusFilter);
        }
        return result;
    }, [assets, searchTerm, statusFilter]);

    if (isInstancesMode) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <button className="btn btn-secondary" onClick={() => {
                            if (typeIdParam) {
                                navigate(`/dashboard/assets/models?typeId=${typeIdParam}`);
                            } else {
                                navigate('/dashboard/assets/types');
                            }
                        }} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Box size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.assets')}</h1>
                            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Tag size={14} />
                                {selectedAssetType?.asset_type_label || `Type #${typeIdParam || ''}`} • {formatModelLabel(selectedAssetModel) || selectedAssetModel?.model_name || `Model #${modelIdParam || ''}`}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingAsset(null);
                        setFormTranslations({});
                        setAssetFormData({
                            asset_name: '',
                            asset_serial_number: '',
                            asset_inventory_number: '',
                            asset_service_tag: '',
                            asset_status: 'not_delivered_to_company',
                            asset_name_in_administrative_certificate: '',
                            asset_warranty_expiry_in_months: '',
                            asset_purchase_date: '',
                            asset_purchase_price: '',
                            administrative_certificate_id: '',
                            destruction_certificate_id: 0,
                            maintenance_step_id: null
                        });
                        setShowAssetForm(true);
                    }} style={{ padding: 'var(--space-3) var(--space-6)', width: 'auto' }}>
                        <Plus size={18} />
                        <span>{t('assets.addAsset')}</span>
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

                {/* Add/Edit Asset Modal */}
                {showAssetForm && (
                    <div className="modal-overlay" onClick={() => setShowAssetForm(false)}>
                        <div className="modal" style={{ maxWidth: '560px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{editingAsset ? t('assets.editAsset') : t('assets.addAsset')}</h3>
                                <button className="modal-close" onClick={() => setShowAssetForm(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAssetSubmit} className="form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <TranslatableInput
                                                label={t('assets.assetName')}
                                                baseFieldName="asset_name"
                                                value={assetFormData.asset_name}
                                                onChange={(name, value) => handleAssetInputChange({ target: { name, value } })}
                                                translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.asset_name]))}
                                                onTranslationChange={handleFormTranslationChange}
                                                placeholder={t('assets.assetName')}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <select name="asset_status" value={assetFormData.asset_status} onChange={handleAssetInputChange} className="form-input" style={{ height: '44px' }}>
                                                <option value="not_delivered_to_company">{t('assets.notDelivered')}</option>
                                                <option value="in_stock">{t('assets.inStock')}</option>
                                                <option value="assigned">{t('assets.assigned')}</option>
                                                <option value="maintenance">{t('assets.maintenance')}</option>
                                                <option value="failed">{t('assets.failed')}</option>
                                                <option value="lost">{t('assets.lost')}</option>
                                                <option value="stolen">{t('assets.stolen')}</option>
                                                <option value="irrecoverably_damaged">{t('assets.irrecoverablyDamaged')}</option>
                                                <option value="destroyed">{t('assets.destroyed')}</option>
                                                <option value="inactive">{t('assets.inactive')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <input type="text" name="asset_serial_number" value={assetFormData.asset_serial_number} onChange={handleAssetInputChange} placeholder={t('assets.serialNumber')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                        <div className="form-group">
                                            <input type="text" name="asset_inventory_number" value={assetFormData.asset_inventory_number} onChange={handleAssetInputChange} placeholder={t('assets.inventoryNumber')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                                            {editingAsset ? t('common.update') : t('common.save')}
                                        </button>
                                        <button type="button" onClick={() => setShowAssetForm(false)} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Assets Panel */}
                    <div className="card" style={{ overflow: 'hidden' }}>
                        {/* Toolbar */}
                        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '0 1 320px', minWidth: '180px' }}>
                                <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input type="text" placeholder={t('assets.searchPlaceholder', 'Search assets...')} className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 'var(--space-10)', height: '40px', background: 'var(--color-bg-card)' }} />
                            </div>
                            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: '44px', minWidth: '130px' }}>
                                <option value="">{t('assets.allStatuses', 'All Statuses')}</option>
                                <option value="in_stock">{t('assets.inStock')}</option>
                                <option value="assigned">{t('assets.assigned')}</option>
                                <option value="maintenance">{t('assets.maintenance')}</option>
                                <option value="failed">{t('assets.failed')}</option>
                                <option value="not_delivered_to_company">{t('assets.notDelivered')}</option>
                                <option value="lost">{t('assets.lost')}</option>
                                <option value="stolen">{t('assets.stolen')}</option>
                                <option value="destroyed">{t('assets.destroyed')}</option>
                                <option value="inactive">{t('assets.inactive')}</option>
                            </select>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontWeight: '600' }}>
                                {filteredAssets.length}
                            </span>
                        </div>

                        {/* Asset List */}
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                            {loading ? (
                                <div className="loading-state" style={{ padding: 'var(--space-12)' }}>
                                    <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                    <span>{t('assets.loading', 'Loading...')}</span>
                                </div>
                            ) : filteredAssets.length === 0 ? (
                                <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                                    <Box size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                                    <p style={{ color: 'var(--color-text-muted)' }}>
                                        {searchTerm || statusFilter ? t('assets.noMatchingAssets', 'No matching assets') : t('assets.noAssets', 'No assets found')}
                                    </p>
                                </div>
                            ) : (
                                filteredAssets.map(asset => (
                                    <div
                                        key={asset.asset_id}
                                        style={{
                                            padding: 'var(--space-4) var(--space-5)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid var(--color-border)',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease'
                                        }}
                                        onClick={() => openAssetDetailsModal(asset)}
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
                                                {(asset.asset_name || '?')[0].toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {asset.asset_name || t('assets.unnamedAsset', 'Unnamed Asset')}
                                                    </span>
                                                    {asset.asset_inventory_number && (
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                            {asset.asset_inventory_number}
                                                        </span>
                                                    )}
                                                    {asset.asset_serial_number && (
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace', background: 'var(--color-bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-sm)' }}>
                                                            {asset.asset_serial_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: '2px' }}>
                                                    <span style={{
                                                        padding: '1px 6px', borderRadius: '12px', fontSize: 'var(--font-size-xs)',
                                                        backgroundColor: asset.asset_status === 'in_stock' ? 'rgba(16, 185, 129, 0.15)' :
                                                                         asset.asset_status === 'not_delivered_to_company' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-bg-secondary)',
                                                        color: asset.asset_status === 'in_stock' ? 'var(--color-success)' :
                                                               asset.asset_status === 'not_delivered_to_company' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                                                    }}>
                                                        {formatStatusLabel(asset.asset_status, asset)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
                                            <button onClick={(e) => { e.stopPropagation(); openAssetDetailsModal(asset); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('assets.attributes')}>
                                                <Sliders size={14} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleEditAsset(asset); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('common.edit')}>
                                                <Pencil size={14} />
                                            </button>
                                            {canMoveAssets && (
                                                <button onClick={(e) => { e.stopPropagation(); openMoveModal(asset); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('assets.move')}>
                                                    <Box size={14} />
                                                </button>
                                            )}
                                            {canAssignAssets && (
                                                (() => {
                                                    const activeAssignment = activeAssignmentsByAsset.get(asset.asset_id);
                                                    return activeAssignment ? (
                                                        <button onClick={(e) => { e.stopPropagation(); setDischargingAssignment(activeAssignment); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('assets.discharge')}>
                                                            <X size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAssigningAsset(asset);
                                                            const now = new Date();
                                                            const tzOffset = now.getTimezoneOffset() * 60000;
                                                            const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
                                                            setAssignFormData({
                                                                person: '',
                                                                start_datetime: localISOTime,
                                                                end_datetime: '',
                                                                condition_on_assignment: asset.asset_status === 'in_stock' ? 'Good' : 'Needs Repair'
                                                            });
                                                            setShowAssignForm(true);
                                                        }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }} title={t('assets.assign')}>
                                                            <Plus size={14} />
                                                        </button>
                                                    );
                                                })()
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.asset_id); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('common.delete')}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Assign Form Modal */}
                {showAssignForm && assigningAsset && (
                    <div className="modal-overlay" onClick={() => setShowAssignForm(false)}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.assignAsset')}</h3>
                                <button className="modal-close" onClick={() => setShowAssignForm(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAssignSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.person')}</label>
                                        <select name="person" value={assignFormData.person} onChange={handleAssignInputChange} required className="form-input" style={{ height: '44px' }}>
                                            <option value="">{t('assets.selectPerson')}</option>
                                            {persons.map(p => <option key={p.person_id} value={p.person_id}>{p.person_name || `Person ${p.person_id}`}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">{t('assets.startDatetime')}</label>
                                            <input type="datetime-local" name="start_datetime" value={assignFormData.start_datetime} onChange={handleAssignInputChange} required className="form-input" style={{ height: '44px' }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('assets.endDatetime')}</label>
                                            <input type="datetime-local" name="end_datetime" value={assignFormData.end_datetime} onChange={handleAssignInputChange} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.conditionOnAssignment')}</label>
                                        <select name="condition_on_assignment" value={assignFormData.condition_on_assignment} onChange={handleAssignInputChange} required className="form-input" style={{ height: '44px' }}>
                                            <option value="New">{t('assets.conditionNew')}</option>
                                            <option value="Good">{t('assets.conditionGood')}</option>
                                            <option value="Needs Repair">{t('assets.conditionNeedsRepair')}</option>
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? t('assets.assigning') : t('assets.assign')}</button>
                                        <button type="button" onClick={() => { setShowAssignForm(false); setAssigningAsset(null); }} className="btn btn-secondary">{t('common.cancel')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Asset Details Modal */}
                {showAssetDetailsModal && selectedAsset && (
                    <div className="modal-overlay" onClick={closeAssetDetailsModal}>
                        <div className="modal" style={{ maxWidth: '720px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <h3 className="modal-title" style={{ margin: 0 }}>
                                        {selectedAsset.asset_name || t('assets.assetWithId', { id: selectedAsset.asset_id })}
                                    </h3>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        {t('assets.inventory')}: {selectedAsset.asset_inventory_number || '—'} • {t('assets.status')}: {formatStatusLabel(selectedAsset.asset_status, selectedAsset)}
                                    </span>
                                </div>
                                <button className="modal-close" onClick={closeAssetDetailsModal}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                {canSuggestAssetForDestruction && (selectedAsset.asset_status || '').toLowerCase() === 'failed' && (
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <button
                                            type="button"
                                            onClick={submitSuggestAssetForDestruction}
                                            disabled={saving}
                                            className="btn btn-secondary"
                                        >
                                            {saving ? t('assets.saving') : t('assets.suggestForDestruction')}
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
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.serialNumber')}</div>
                                            <div style={{ fontWeight: 600 }}>{selectedAsset.asset_serial_number || '—'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.assignedTo')}</div>
                                            {(() => {
                                                const activeAssignment = activeAssignmentsByAsset.get(selectedAsset.asset_id);
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
                                        <div style={{ fontWeight: '600' }}>{t('assets.assetAttributes')}</div>
                                        <button
                                            onClick={() => setShowAssetAttributeForm(!showAssetAttributeForm)}
                                            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                        >
                                            + {t('assets.addValue')}
                                        </button>
                                    </div>
                                    {showAssetAttributeForm && (
                                        <form onSubmit={handleAssetAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                            <select
                                                name="asset_attribute_definition"
                                                value={assetAttributeForm.asset_attribute_definition}
                                                onChange={handleAssetAttributeInputChange}
                                                required
                                                className="form-input"
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }}
                                            >
                                                <option value="">{t('assets.selectAttrDefPlaceholder')}</option>
                                                {attributeDefinitions.map((def) => (
                                                    <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                        {def.description || t('assets.attributeWithId', { id: def.asset_attribute_definition_id })}
                                                    </option>
                                                ))}
                                            </select>
                                            {(() => {
                                                const selectedDef = definitionLookup.get(Number(assetAttributeForm.asset_attribute_definition));
                                                const dataType = selectedDef?.data_type?.toLowerCase();
                                                if (dataType === 'number') {
                                                    return <input type="number" name="value_number" placeholder={t('assets.numberValue')} value={assetAttributeForm.value_number} onChange={handleAssetAttributeInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                                }
                                                if (dataType === 'bool' || dataType === 'boolean') {
                                                    return (
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                            <input type="checkbox" name="value_bool" checked={assetAttributeForm.value_bool} onChange={handleAssetAttributeInputChange} />
                                                            {t('assets.true')}
                                                        </label>
                                                    );
                                                }
                                                if (dataType === 'date') {
                                                    return <input type="date" name="value_date" value={assetAttributeForm.value_date} onChange={handleAssetAttributeInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                                }
                                                return <input type="text" name="value_string" placeholder={t('assets.stringValue')} value={assetAttributeForm.value_string} onChange={handleAssetAttributeInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                            })()}
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{t('assets.save')}</button>
                                                <button type="button" onClick={() => setShowAssetAttributeForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>{t('assets.cancel')}</button>
                                            </div>
                                        </form>
                                    )}
                                    {assetAttributes.length === 0 ? (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('assets.noAttrValues')}</div>
                                    ) : (
                                        assetAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.asset_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            return (
                                                <div key={`${attr.asset}-${attr.asset_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{definition?.description || t('assets.attributeWithId', { id: attr.asset_attribute_definition })}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? t('assets.noValue') : String(value)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAssetAttribute(attr.asset, attr.asset_attribute_definition)}
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

                {/* Discharge Assignment Modal */}
                {dischargingAssignment && (
                    <div className="modal-overlay" onClick={() => setDischargingAssignment(null)}>
                        <div className="modal" style={{ maxWidth: '480px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.dischargeAsset')}</h3>
                                <button className="modal-close" onClick={() => setDischargingAssignment(null)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <p>{t('assets.dischargeConfirm')}</p>
                                <div className="form-actions">
                                    <button onClick={() => handleDischarge(dischargingAssignment.assignment_id)} disabled={saving} className="btn btn-primary">{t('assets.discharge')}</button>
                                    <button onClick={() => setDischargingAssignment(null)} className="btn btn-secondary">{t('common.cancel')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Move Asset Modal */}
                {showMoveModal && movingAsset && (
                    <div className="modal-overlay" onClick={() => !moveSubmitting && closeMoveModal()}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.moveAssetTitle')}: {movingAsset.asset_name || t('assets.assetWithId', { id: movingAsset.asset_id })}</h3>
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
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{t('assets.currentLocation')}</div>
                                            <div style={{ fontWeight: 600 }}>{moveCurrentLocationLabel || t('assets.unknown')}</div>
                                        </div>
                                        <label className="form-label">{t('assets.destinationLocation')}</label>
                                        <select
                                            value={selectedMoveLocationId}
                                            onChange={(e) => setSelectedMoveLocationId(e.target.value)}
                                            required
                                            disabled={moveSubmitting}
                                            className="form-input"
                                            style={{ height: '44px' }}
                                        >
                                            <option value="">{t('assets.selectLocation')}</option>
                                            {moveLocations.map((r) => (
                                                <option key={r.location_id} value={r.location_id}>
                                                    {r.location_name || `Location ${r.location_id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.movementReasonAr')}</label>
                                        <input
                                            type="text"
                                            value={movementReasonAr}
                                            onChange={(e) => setMovementReasonAr(e.target.value)}
                                            disabled={moveSubmitting}
                                            className="form-input"
                                            placeholder={t('assets.movementReasonArPlaceholder')}
                                            dir="rtl"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={moveSubmitting || !selectedMoveLocationId} className="btn btn-primary">
                                            {moveSubmitting ? t('assets.moving') : t('assets.move')}
                                        </button>
                                        <button type="button" onClick={closeMoveModal} disabled={moveSubmitting} className="btn btn-secondary">{t('common.cancel')}</button>
                                    </div>
                                </form>
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
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Box size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.assets')}</h1>
                <p className="page-subtitle">{t('assets.subtitle')}</p>
            </div>

            {isExploitationChief && pendingConfirmations.length > 0 && (
                <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                        {t('assets.pendingConfirmations')} ({pendingConfirmations.length})
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                        {pendingConfirmations.map(a => (
                            <div key={a.assignment_id} style={{
                                backgroundColor: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text)',
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                minWidth: '250px',
                                fontSize: 'var(--font-size-xs)'
                            }}>
                                <div style={{ fontWeight: '600' }}>{a.asset?.asset_name || t('assets.asset')} (ID: {a.asset?.asset_id})</div>
                                <div style={{ color: 'var(--color-text-secondary)' }}>{t('assets.assigneeId')}: {a.person}</div>
                                <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleConfirmAssignment(a.assignment_id)}
                                        style={{
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t('assets.confirm')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('assets.library')}</h2>
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
                            title={t('assets.addAssetType')}
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
                        {assetTypes.map(type => (
                            <div key={type.asset_type_id}>
                                <div
                                    onClick={() => setSelectedAssetType(selectedAssetType?.asset_type_id === type.asset_type_id ? null : type)}
                                    style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedAssetType?.asset_type_id === type.asset_type_id ? 'var(--color-bg-secondary)' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border)'
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
                                                <span>{formatModelLabel(model) || `Model ${model.asset_model_id}`}</span>
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
                )}

                {/* Right Content: Main Area */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {showModelForm ? (
                        <div style={{ padding: 'var(--space-6)', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h2>Add New Model for {selectedAssetType?.asset_type_label}</h2>
                                <button onClick={() => setShowModelForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
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
                                        {formatModelLabel(selectedAssetModel) || selectedAssetModel.model_name || ''} <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', fontWeight: 'normal' }}>({selectedAssetModel.model_code})</span>
                                    </h2>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                                        {selectedAssetModel.brand_name} • {assets.length} Assets
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingAsset(null);
                                        setFormTranslations({});
                                        setAssetFormData({
                                            asset_serial_number: '',
                                            asset_inventory_number: '',
                                            asset_service_tag: '',
                                            asset_name: '',
                                            asset_status: 'not_delivered_to_company',
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
                                {!isInstancesMode && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                                    <div style={{ fontWeight: '600' }}>Asset Type Attributes</div>
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
                                                            name="asset_attribute_definition"
                                                            value={typeAttributeForm.asset_attribute_definition}
                                                            onChange={handleTypeAttributeInputChange}
                                                            required
                                                            style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                        >
                                                            <option value="">Select attribute definition...</option>
                                                            {attributeDefinitions.map((def) => (
                                                                <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                                    {def.description || `Attribute ${def.asset_attribute_definition_id}`}
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
                                                    {assetTypeAttributes.length === 0 ? (
                                                        <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned.</div>
                                                    ) : (
                                                        assetTypeAttributes.map((attr) => {
                                                            const definition = attr.definition || definitionLookup.get(attr.asset_attribute_definition);
                                                            return (
                                                                <div key={`${attr.asset_type}-${attr.asset_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.asset_attribute_definition}`}</div>
                                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                            {definition?.data_type || 'type'}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                                            {attr.is_mandatory ? ' • mandatory' : ''}
                                                                            {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteTypeAttribute(attr.asset_type, attr.asset_attribute_definition)}
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
                                                <div style={{ fontWeight: '600' }}>Asset Model Attributes</div>
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
                                                        name="asset_attribute_definition"
                                                        value={modelAttributeForm.asset_attribute_definition}
                                                        onChange={handleModelAttributeInputChange}
                                                        required
                                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                    >
                                                        <option value="">Select attribute definition...</option>
                                                        {attributeDefinitions.map((def) => (
                                                            <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                                {def.description || `Attribute ${def.asset_attribute_definition_id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {(() => {
                                                        const selectedDef = definitionLookup.get(Number(modelAttributeForm.asset_attribute_definition));
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
                                            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                                {assetModelAttributes.length === 0 ? (
                                                    <div style={{ color: 'var(--color-text-secondary)' }}>No model attribute values.</div>
                                                ) : (
                                                    assetModelAttributes.map((attr) => {
                                                        const definition = attr.definition || definitionLookup.get(attr.asset_attribute_definition);
                                                        const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                                        return (
                                                            <div key={`${attr.asset_model}-${attr.asset_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.asset_attribute_definition}`}</div>
                                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteModelAttribute(attr.asset_model, attr.asset_attribute_definition)}
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
                                    </>
                                )}
                                {showAssetForm && (
                                    <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-4)' }}>{editingAsset ? 'Edit Asset' : 'New Asset'}</div>
                                        <form onSubmit={handleAssetSubmit}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div>
                                                    <TranslatableInput
                                                        label="Name"
                                                        baseFieldName="asset_name"
                                                        value={assetFormData.asset_name}
                                                        onChange={(name, value) => handleAssetInputChange({ target: { name, value } })}
                                                        translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.asset_name]))}
                                                        onTranslationChange={handleFormTranslationChange}
                                                        placeholder="Asset Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>Status</label>
                                                    <select name="asset_status" value={assetFormData.asset_status} onChange={handleAssetInputChange} style={{ width: '100%', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                                        <option value="not_delivered_to_company">Not Delivered to Company</option>
                                                        <option value="in_stock">In Stock</option>
                                                        <option value="assigned">Assigned</option>
                                                        <option value="maintenance">Maintenance</option>
                                                        <option value="failed">Failed</option>
                                                        <option value="lost">Lost</option>
                                                        <option value="stolen">Stolen</option>
                                                        <option value="irrecoverably_damaged">Irrecoverably Damaged</option>
                                                        <option value="destroyed">Destroyed</option>
                                                        <option value="inactive">Inactive</option>
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
                                                <button type="button" onClick={() => setShowAssetForm(false)} style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
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
                                                <tr
                                                    key={asset.asset_id}
                                                    onClick={() => openAssetDetailsModal(asset)}
                                                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                >
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
                                                            backgroundColor: asset.asset_status === 'in_stock' ? 'rgba(16, 185, 129, 0.15)' : 
                                                                             asset.asset_status === 'not_delivered_to_company' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-bg-secondary)',
                                                            color: asset.asset_status === 'in_stock' ? 'var(--color-success)' : 
                                                                   asset.asset_status === 'not_delivered_to_company' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                                                        }}>
                                                            {formatStatusLabel(asset.asset_status, asset)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openAssetDetailsModal(asset); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Attributes
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditAsset(asset); }}
                                                            style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        {canMoveAssets && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openMoveModal(asset); }}
                                                                style={{ marginRight: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                Move
                                                            </button>
                                                        )}
                                                        {canAssignAssets && (
                                                            (() => {
                                                                const activeAssignment = activeAssignmentsByAsset.get(asset.asset_id);
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
                                                                            setAssigningAsset(asset);
                                                                            const now = new Date();
                                                                            const tzOffset = now.getTimezoneOffset() * 60000;
                                                                            const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
                                                                            setAssignFormData({
                                                                                person: '',
                                                                                start_datetime: localISOTime,
                                                                                end_datetime: '',
                                                                                condition_on_assignment: asset.asset_status === 'in_stock' ? 'Good' : 'Needs Repair'
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
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.asset_id); }}
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
                    ) : selectedAssetType ? (
                        <div style={{ padding: 'var(--space-6)', overflowY: 'auto' }}>
                            <h2 style={{ marginBottom: 'var(--space-4)' }}>{selectedAssetType.asset_type_label} Attributes</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
                                {!isInstancesMode && (
                                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                            <div style={{ fontWeight: '600' }}>Asset Type Attributes</div>
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
                                                    name="asset_attribute_definition"
                                                    value={typeAttributeForm.asset_attribute_definition}
                                                    onChange={handleTypeAttributeInputChange}
                                                    required
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                >
                                                    <option value="">Select attribute definition...</option>
                                                    {attributeDefinitions.map((def) => (
                                                        <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                            {def.description || `Attribute ${def.asset_attribute_definition_id}`}
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
                                        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                            {assetTypeAttributes.length === 0 ? (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No attributes assigned.</div>
                                            ) : (
                                                assetTypeAttributes.map((attr) => {
                                                    const definition = attr.definition || definitionLookup.get(attr.asset_attribute_definition);
                                                    return (
                                                        <div key={`${attr.asset_type}-${attr.asset_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.asset_attribute_definition}`}</div>
                                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                    {definition?.data_type || 'type'}{definition?.unit ? ` • ${definition.unit}` : ''}
                                                                    {attr.is_mandatory ? ' • mandatory' : ''}
                                                                    {attr.default_value ? ` • default: ${attr.default_value}` : ''}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteTypeAttribute(attr.asset_type, attr.asset_attribute_definition)}
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
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
                            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)', opacity: 0.2 }}>📋</div>
                            <p>Select a model from the sidebar to view assets.</p>
                        </div>
                    )}
                </div>
            </div>

            {showAssignForm && assigningAsset && (
                <div className="modal-overlay" onClick={() => { setShowAssignForm(false); setAssigningAsset(null); }}>
                    <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{t('assets.assignAsset')}</h3>
                            <button className="modal-close" onClick={() => { setShowAssignForm(false); setAssigningAsset(null); }}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAssignSubmit}>
                                <div className="form-group">
                                    <label className="form-label">{t('assets.person')}</label>
                                    <select name="person" value={assignFormData.person} onChange={handleAssignInputChange} required className="form-input" style={{ height: '44px' }}>
                                        <option value="">{t('assets.selectPerson')}</option>
                                        {persons.map(p => <option key={p.person_id} value={p.person_id}>{p.person_name || `Person ${p.person_id}`}</option>)}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.startDatetime')}</label>
                                        <input type="datetime-local" name="start_datetime" value={assignFormData.start_datetime} onChange={handleAssignInputChange} required className="form-input" style={{ height: '44px' }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.endDatetime')}</label>
                                        <input type="datetime-local" name="end_datetime" value={assignFormData.end_datetime} onChange={handleAssignInputChange} className="form-input" style={{ height: '44px' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('assets.conditionOnAssignment')}</label>
                                    <select name="condition_on_assignment" value={assignFormData.condition_on_assignment} onChange={handleAssignInputChange} required className="form-input" style={{ height: '44px' }}>
                                        <option value="New">{t('assets.conditionNew')}</option>
                                        <option value="Good">{t('assets.conditionGood')}</option>
                                        <option value="Needs Repair">{t('assets.conditionNeedsRepair')}</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" disabled={saving} className="btn btn-primary">{saving ? t('assets.assigning') : t('assets.assign')}</button>
                                    <button type="button" onClick={() => { setShowAssignForm(false); setAssigningAsset(null); }} className="btn btn-secondary">{t('common.cancel')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showAssetDetailsModal && selectedAsset && (
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
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 'var(--space-4)' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
                                    {selectedAsset.asset_name || `Asset ${selectedAsset.asset_id}`}
                                </h2>
                                <div style={{ marginTop: 6, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                    ID: {selectedAsset.asset_id}
                                    {selectedAsset.asset_inventory_number ? ` • Inv: ${selectedAsset.asset_inventory_number}` : ''}
                                    {selectedAsset.asset_serial_number ? ` • SN: ${selectedAsset.asset_serial_number}` : ''}
                                    {selectedAsset.asset_service_tag ? ` • Tag: ${selectedAsset.asset_service_tag}` : ''}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeAssetDetailsModal}
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

                        {canSuggestAssetForDestruction && (selectedAsset.asset_status || '').toLowerCase() === 'failed' && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <button
                                    type="button"
                                    onClick={submitSuggestAssetForDestruction}
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
                                    {saving ? 'Saving...' : 'Suggest for destruction'}
                                </button>
                            </div>
                        )}

                        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                <div style={{ fontWeight: '600' }}>Asset Attributes</div>
                                <button
                                    onClick={() => setShowAssetAttributeForm(!showAssetAttributeForm)}
                                    style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                                >
                                    + Add Value
                                </button>
                            </div>

                            {showAssetAttributeForm && (
                                <form onSubmit={handleAssetAttributeSubmit} style={{ marginBottom: 'var(--space-4)' }}>
                                    <select
                                        name="asset_attribute_definition"
                                        value={assetAttributeForm.asset_attribute_definition}
                                        onChange={handleAssetAttributeInputChange}
                                        required
                                        style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                    >
                                        <option value="">Select attribute definition...</option>
                                        {attributeDefinitions.map((def) => (
                                            <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                {def.description || `Attribute ${def.asset_attribute_definition_id}`}
                                            </option>
                                        ))}
                                    </select>
                                    {(() => {
                                        const selectedDef = definitionLookup.get(Number(assetAttributeForm.asset_attribute_definition));
                                        const dataType = selectedDef?.data_type?.toLowerCase();
                                        if (dataType === 'number') {
                                            return (
                                                <input
                                                    type="number"
                                                    name="value_number"
                                                    placeholder="Number value"
                                                    value={assetAttributeForm.value_number}
                                                    onChange={handleAssetAttributeInputChange}
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
                                                        checked={assetAttributeForm.value_bool}
                                                        onChange={handleAssetAttributeInputChange}
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
                                                    value={assetAttributeForm.value_date}
                                                    onChange={handleAssetAttributeInputChange}
                                                    style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                                />
                                            );
                                        }
                                        return (
                                            <input
                                                type="text"
                                                name="value_string"
                                                placeholder="String value"
                                                value={assetAttributeForm.value_string}
                                                onChange={handleAssetAttributeInputChange}
                                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                                            />
                                        );
                                    })()}
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                        <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                        <button type="button" onClick={() => setShowAssetAttributeForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                                    </div>
                                </form>
                            )}

                            {assetAttributes.length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>No attribute values set for this asset.</div>
                            ) : (
                                assetAttributes.map((attr) => {
                                    const definition = attr.definition || definitionLookup.get(attr.asset_attribute_definition);
                                    const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                    return (
                                        <div key={`${attr.asset}-${attr.asset_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{definition?.description || `Attribute ${attr.asset_attribute_definition}`}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? 'No value' : String(value)}</div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAssetAttribute(attr.asset, attr.asset_attribute_definition)}
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
                        maxWidth: '400px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Confirm Discharge</h2>
                        <p style={{ marginBottom: 'var(--space-6)' }}>
                            Are you sure you want to end the assignment of <strong>{dischargingAssignment.asset?.asset_name}</strong> to person <strong>{dischargingAssignment.person}</strong>?
                            <br /><br />
                            The end date will be set to right now.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setDischargingAssignment(null)}
                                style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
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

            {showMoveModal && movingAsset && (
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
                            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>Move Asset to Location</h2>
                            <button
                                onClick={() => closeMoveModal()}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 'var(--space-1)',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
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
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Current location</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {moveCurrentLocationLabel || 'Unknown'}
                                        </div>
                                    </div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Destination location</label>
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
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text)'
                                        }}
                                    >
                                        <option value="">Select a location...</option>
                                        {moveLocations.map((r) => (
                                            <option key={r.location_id} value={r.location_id}>
                                                {r.location_name || `Location ${r.location_id}`}
                                            </option>
                                        ))}
                                    </select>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', marginTop: 'var(--space-3)' }}>Movement reason (Arabic)</label>
                                    <input
                                        type="text"
                                        value={movementReasonAr}
                                        onChange={(e) => setMovementReasonAr(e.target.value)}
                                        disabled={moveSubmitting}
                                        placeholder="سبب التنقلة (اختياري)"
                                        dir="rtl"
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-2)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text)'
                                        }}
                                    />
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
                                        disabled={moveSubmitting || !selectedMoveLocationId}
                                        style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                    >
                                        {moveSubmitting ? 'Moving...' : 'Move Asset'}
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

export default AssetsPage;
