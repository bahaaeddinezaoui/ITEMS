import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Pencil, Sliders, Link2, Layers, Box, X, XCircle, Tag, Hash, Image, ChevronUp, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { consumableAttributeDefinitionService, consumableBrandService, consumableModelAttributeService, consumableModelService, consumableTypeService, authService } from '../services/api';

const ConsumablesModelsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeId = searchParams.get('typeId');

    const formatModelLabel = (model) => {
        return [model?.brand_name, model?.model_name].filter(Boolean).join(' ');
    };

    const [consumableType, setConsumableType] = useState(null);
    const [consumableModels, setConsumableModels] = useState([]);
    const [selectedConsumableModel, setSelectedConsumableModel] = useState(null);
    const [consumableBrands, setConsumableBrands] = useState([]);
    const [consumableAttributeDefinitions, setConsumableAttributeDefinitions] = useState([]);
    const [consumableModelAttributes, setConsumableModelAttributes] = useState([]);
    const [showModelForm, setShowModelForm] = useState(false);
    const [modelSaving, setModelSaving] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [modelForm, setModelForm] = useState({
        consumable_brand: '',
        model_name_en: '',
        model_name_ar: '',
        model_code: ''
    });
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [modelAttributeForm, setModelAttributeForm] = useState({
        consumable_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [showBrandForm, setShowBrandForm] = useState(false);
    const [brandSaving, setBrandSaving] = useState(false);
    const [brandForm, setBrandForm] = useState({
        brand_name: '',
        brand_photo: null
    });
    const [brandPhotoPreview, setBrandPhotoPreview] = useState(null);

    const [showAttributesModal, setShowAttributesModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('model_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [brandFilter, setBrandFilter] = useState('');

    const toBrandCode = (name) => {
        const code = String(name || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_\-]/g, '');
        return code.slice(0, 16);
    };

    useEffect(() => {
        if (!typeId) return;
        fetchTypeAndModels(typeId);
    }, [typeId]);

    useEffect(() => {
        fetchConsumableAttributeDefinitions();
        fetchConsumableBrands();
    }, []);

    useEffect(() => {
        if (!selectedConsumableModel) {
            setConsumableModelAttributes([]);
            setShowModelAttributeForm(false);
            setModelAttributeForm({
                consumable_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            return;
        }
        fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
    }, [selectedConsumableModel]);

    const fetchTypeAndModels = async (consumableTypeId) => {
        setLoading(true);
        setError(null);
        try {
            const [types, models] = await Promise.all([
                consumableTypeService.getAll(),
                consumableModelService.getByConsumableType(consumableTypeId),
            ]);
            const typesArr = Array.isArray(types) ? types : [];
            const foundType = typesArr.find((t) => String(t.consumable_type_id) === String(consumableTypeId)) || null;
            setConsumableType(foundType);
            setConsumableModels(Array.isArray(models) ? models : []);
            setSelectedConsumableModel(null);
        } catch (err) {
            setError(t('consumableModels.fetchError') + ': ' + err.message);
            setConsumableType(null);
            setConsumableModels([]);
            setSelectedConsumableModel(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBrandInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            setBrandForm((prev) => ({ ...prev, [name]: file }));
            setBrandPhotoPreview(URL.createObjectURL(file));
        } else {
            setBrandForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleBrandSubmit = async (e) => {
        e.preventDefault();
        if (!authService.isSuperuser()) return;
        const brandName = brandForm.brand_name?.trim();
        if (!brandName) {
            setError(t('consumableModels.enterBrandName'));
            return;
        }

        setBrandSaving(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('brand_name', brandName);
            formData.append('brand_code', toBrandCode(brandName));
            formData.append('is_active', 'true');
            if (brandForm.brand_photo) {
                formData.append('brand_photo', brandForm.brand_photo);
            }
            await consumableBrandService.create(formData);
            setBrandForm({ brand_name: '', brand_photo: null });
            setBrandPhotoPreview(null);
            setShowBrandForm(false);
            await fetchConsumableBrands();
        } catch (err) {
            setError(t('consumableModels.createBrandError') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setBrandSaving(false);
        }
    };

    const fetchConsumableAttributeDefinitions = async () => {
        try {
            const data = await consumableAttributeDefinitionService.getAll();
            setConsumableAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setConsumableAttributeDefinitions([]);
        }
    };

    const fetchConsumableBrands = async () => {
        try {
            const data = await consumableBrandService.getAll();
            setConsumableBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            setConsumableBrands([]);
        }
    };

    const fetchConsumableModelAttributes = async (consumableModelId) => {
        try {
            const data = await consumableModelAttributeService.getByConsumableModel(consumableModelId);
            setConsumableModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('consumableModels.fetchAttributesError') + ': ' + err.message);
            setConsumableModelAttributes([]);
        }
    };

    const handleModelAttributeInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModelAttributeForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleModelInputChange = (e) => {
        const { name, value } = e.target;
        setModelForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        if (!typeId) return;
        if (!modelForm.consumable_brand) {
            setError(t('consumableModels.selectBrand'));
            return;
        }

        setModelSaving(true);
        setError(null);
        try {
            const modelNameEn = modelForm.model_name_en?.trim() || null;
            const modelNameAr = modelForm.model_name_ar?.trim() || null;
            const payload = {
                consumable_type: Number(typeId),
                consumable_brand: Number(modelForm.consumable_brand),
                model_name: modelNameEn,
                model_code: modelForm.model_code || null,
                translations: {
                    en: { model_name: modelNameEn },
                    ar: { model_name: modelNameAr },
                }
            };
            if (editingModel) {
                await consumableModelService.update(editingModel.consumable_model_id, payload);
            } else {
                await consumableModelService.create(payload);
            }
            setModelForm({ consumable_brand: '', model_name_en: '', model_name_ar: '', model_code: '' });
            setShowModelForm(false);
            setEditingModel(null);
            await fetchTypeAndModels(typeId);
        } catch (err) {
            setError(t('consumableModels.saveModelError', { action: editingModel ? t('consumableModels.update') : t('consumableModels.create') }) + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setModelSaving(false);
        }
    };

    const handleDeleteModel = async (model) => {
        if (!authService.isSuperuser()) return;
        const label = formatModelLabel(model) || model.model_name || `Model ${model.consumable_model_id}`;
        if (!window.confirm(t('consumableModels.confirmDeleteModel', 'Are you sure you want to delete model "{{name}}"?', { name: label }))) return;
        try {
            await consumableModelService.delete(model.consumable_model_id);
            if (selectedConsumableModel?.consumable_model_id === model.consumable_model_id) {
                setSelectedConsumableModel(null);
            }
            await fetchTypeAndModels(typeId);
        } catch (err) {
            setError(t('consumableModels.deleteModelError', 'Failed to delete model') + ': ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEditModel = (model) => {
        setEditingModel(model);
        setModelForm({
            consumable_brand: model.consumable_brand,
            model_name_en: model.model_name_en || model.model_name || '',
            model_name_ar: model.model_name_ar || '',
            model_code: model.model_code || ''
        });
        setShowModelForm(true);
    };

    const handleCancelModelForm = () => {
        setShowModelForm(false);
        setEditingModel(null);
        setModelForm({ consumable_brand: '', model_name_en: '', model_name_ar: '', model_code: '' });
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsumableModel) {
            setError(t('consumableModels.selectModelFirst'));
            return;
        }
        if (!modelAttributeForm.consumable_attribute_definition) {
            setError(t('consumableModels.selectDefinition'));
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
            setError(t('consumableModels.addAttributeError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModelAttribute = async (consumableModelId, definitionId) => {
        if (window.confirm(t('consumableModels.confirmRemoveAttribute'))) {
            try {
                await consumableModelAttributeService.delete(consumableModelId, definitionId);
                if (selectedConsumableModel) {
                    await fetchConsumableModelAttributes(selectedConsumableModel.consumable_model_id);
                }
            } catch (err) {
                setError(t('consumableModels.removeAttributeError') + ': ' + err.message);
            }
        }
    };

    const definitionLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(consumableAttributeDefinitions) ? consumableAttributeDefinitions : []).forEach((d) => {
            map.set(d.consumable_attribute_definition_id, d);
        });
        return map;
    }, [consumableAttributeDefinitions]);

    const availableConsumableAttributeDefinitions = useMemo(() => {
        if (!selectedConsumableModel) return consumableAttributeDefinitions;
        const used = new Set((Array.isArray(consumableModelAttributes) ? consumableModelAttributes : []).map((a) => a.consumable_attribute_definition));
        return (Array.isArray(consumableAttributeDefinitions) ? consumableAttributeDefinitions : []).filter((d) => !used.has(d.consumable_attribute_definition_id));
    }, [consumableAttributeDefinitions, consumableModelAttributes, selectedConsumableModel]);

    const filteredModels = useMemo(() => {
        let result = [...consumableModels];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.model_name?.toLowerCase().includes(term) ||
                m.model_code?.toLowerCase().includes(term) ||
                m.brand_name?.toLowerCase().includes(term)
            );
        }
        if (brandFilter) {
            result = result.filter(m => String(m.consumable_brand) === String(brandFilter));
        }
        result.sort((a, b) => {
            let aVal, bVal;
            switch (sortField) {
                case 'model_code':
                    aVal = a.model_code || '';
                    bVal = b.model_code || '';
                    break;
                case 'brand_name':
                    aVal = a.brand_name || '';
                    bVal = b.brand_name || '';
                    break;
                default:
                    aVal = a.model_name || '';
                    bVal = b.model_name || '';
            }
            const cmp = aVal.localeCompare(bVal);
            return sortDirection === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [consumableModels, searchTerm, brandFilter, sortField, sortDirection]);

    const goBack = () => {
        navigate('/dashboard/consumables/types');
    };

    const goToInstances = (model) => {
        navigate(`/dashboard/consumables/instances?typeId=${typeId}&modelId=${model.consumable_model_id}`);
    };

    const goToCompatibility = (model) => {
        navigate(`/dashboard/consumables/models/${model.consumable_model_id}/compatibility?typeId=${typeId}`);
    };

    if (!typeId) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('consumableModels.title', 'Consumable Models')}</h1>
                        <p className="page-subtitle">{t('consumableModels.selectTypeFirst', 'Select a type first')}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={goBack} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <ArrowLeft size={18} />
                        <span>{t('consumableModels.backToTypes', 'Back to Types')}</span>
                    </button>
                </div>
                <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                    <Layers size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('consumableModels.selectTypeFirst', 'Select a type first')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <button className="btn btn-secondary" onClick={goBack} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('consumableModels.models', 'Consumable Models')}</h1>
                        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Tag size={14} />
                            {consumableType?.consumable_type_label || `Type #${typeId}`}
                        </p>
                    </div>
                </div>
                {authService.isSuperuser() && (
                    <button className="btn btn-primary" onClick={() => { setEditingModel(null); setModelForm({ consumable_brand: '', model_name_en: '', model_name_ar: '', model_code: '' }); setShowModelForm(true); }} style={{ padding: 'var(--space-3) var(--space-6)', width: 'auto' }}>
                        <Plus size={18} />
                        <span>{t('consumableModels.addModel', 'Add Model')}</span>
                    </button>
                )}
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

            {/* Add/Edit Model Modal */}
            {showModelForm && (
                <div className="modal-overlay" onClick={handleCancelModelForm}>
                    <div className="modal" style={{ maxWidth: '560px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Plus size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                <h3 className="modal-title" style={{ margin: 0 }}>
                                    {editingModel ? t('consumableModels.editModel', 'Edit Model') : t('consumableModels.addNewModel', 'Add New Model')}
                                </h3>
                            </div>
                            <button className="modal-close" onClick={handleCancelModelForm} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleModelSubmit} className="modal-body" style={{ padding: 'var(--space-5)' }}>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('consumableModels.selectBrand', 'Select Brand')} *
                                </label>
                                <select name="consumable_brand" value={modelForm.consumable_brand} onChange={handleModelInputChange} required className="form-input" style={{ height: '44px' }}>
                                    <option value="">{t('consumableModels.selectBrand', 'Select Brand')}</option>
                                    {consumableBrands.map((b) => (
                                        <option key={b.consumable_brand_id} value={b.consumable_brand_id}>{b.brand_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('consumableModels.modelName', 'Model Name')} (EN) *
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-accent-primary)', background: 'var(--color-accent-glow)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>EN</span>
                                    <input type="text" name="model_name_en" value={modelForm.model_name_en} onChange={handleModelInputChange} placeholder={t('consumableModels.modelNameEnPlaceholder', 'Model name in English')} className="form-input" style={{ height: '44px', flex: 1 }} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('consumableModels.modelName', 'Model Name')} (AR)
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-accent-tertiary)', background: 'var(--color-accent-glow)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>AR</span>
                                    <input type="text" name="model_name_ar" value={modelForm.model_name_ar} onChange={handleModelInputChange} placeholder={t('consumableModels.modelNameArPlaceholder', 'Model name in Arabic')} className="form-input" style={{ height: '44px', flex: 1, direction: 'rtl' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('consumableModels.modelCode', 'Model Code')}
                                </label>
                                <input type="text" name="model_code" value={modelForm.model_code} onChange={handleModelInputChange} placeholder={t('consumableModels.modelCode', 'Model Code')} className="form-input" style={{ height: '44px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                                <button type="button" onClick={handleCancelModelForm} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" disabled={modelSaving} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                    {modelSaving ? t('common.saving', 'Saving...') : (editingModel ? t('common.update') : t('common.save'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Models Panel */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '0 1 320px', minWidth: '180px' }}>
                            <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input type="text" placeholder={t('consumableModels.searchPlaceholder', 'Search models...')} className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 'var(--space-10)', height: '40px', background: 'var(--color-bg-card)' }} />
                        </div>
                        <select className="form-input" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={{ height: '44px', minWidth: '130px' }}>
                            <option value="">{t('consumableModels.allBrands', 'All Brands')}</option>
                            {consumableBrands.map(b => <option key={b.consumable_brand_id} value={b.consumable_brand_id}>{b.brand_name}</option>)}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <select className="form-input" value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ height: '44px', minWidth: '110px' }}>
                                <option value="model_name">{t('consumableModels.sortByName', 'Name')}</option>
                                <option value="model_code">{t('consumableModels.sortByCode', 'Code')}</option>
                                <option value="brand_name">{t('consumableModels.sortByBrand', 'Brand')}</option>
                            </select>
                            <button className="btn btn-secondary" onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} style={{ padding: 'var(--space-2)', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={sortDirection === 'asc' ? t('common.ascending', 'Ascending') : t('common.descending', 'Descending')}>
                                {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontWeight: '600' }}>
                            {filteredModels.length}
                        </span>
                    </div>

                    {/* Model List */}
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                        {loading ? (
                            <div className="loading-state" style={{ padding: 'var(--space-12)' }}>
                                <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                <span>{t('consumableModels.loading', 'Loading...')}</span>
                            </div>
                        ) : filteredModels.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                                <Layers size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    {searchTerm || brandFilter ? t('consumableModels.noMatchingModels', 'No matching models') : t('consumableModels.noModels', 'No models')}
                                </p>
                            </div>
                        ) : (
                            filteredModels.map(model => (
                                <div
                                    key={model.consumable_model_id}
                                    style={{
                                        padding: 'var(--space-4) var(--space-5)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border)',
                                        background: selectedConsumableModel?.consumable_model_id === model.consumable_model_id ? 'var(--color-accent-glow)' : 'transparent',
                                        cursor: 'pointer', transition: 'background 0.15s ease'
                                    }}
                                    onClick={() => setSelectedConsumableModel(model)}
                                    onMouseEnter={(e) => { if (selectedConsumableModel?.consumable_model_id !== model.consumable_model_id) e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                                    onMouseLeave={(e) => { if (selectedConsumableModel?.consumable_model_id !== model.consumable_model_id) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                            background: 'var(--color-accent-glow)', border: '1px solid var(--color-border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-accent-tertiary)', flexShrink: 0
                                        }}>
                                            {(model.brand_name || '?')[0].toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {model.model_name || `Model ${model.consumable_model_id}`}
                                                </span>
                                                {model.brand_name && (
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{model.brand_name}</span>
                                                )}
                                                {model.model_code && (
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace', background: 'var(--color-bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-sm)' }}>
                                                        {model.model_code}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
                                        {authService.isSuperuser() && (
                                            <button onClick={(e) => { e.stopPropagation(); handleEditModel(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('common.edit')}>
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                        {authService.isSuperuser() && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModel(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('common.delete', 'Delete')}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedConsumableModel(model); setShowAttributesModal(true); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('consumableModels.modelAttributes')}>
                                            <Sliders size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); goToCompatibility(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('consumableModels.compatibility', 'Compatibility')}>
                                            <Link2 size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); goToInstances(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('consumableModels.instances', 'Instances')}>
                                            <Box size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Attributes Modal */}
                {showAttributesModal && selectedConsumableModel && (
                    <div className="modal-overlay" onClick={() => { setShowAttributesModal(false); setShowModelAttributeForm(false); }}>
                        <div className="modal" style={{ maxWidth: '640px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <Sliders size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                    <div>
                                        <h3 className="modal-title" style={{ margin: 0 }}>
                                            {formatModelLabel(selectedConsumableModel) || selectedConsumableModel.model_name || `Model ${selectedConsumableModel.consumable_model_id}`}
                                        </h3>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {consumableModelAttributes.length} {t('consumableModels.attributesCount', 'attributes')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <button onClick={() => setShowModelAttributeForm(v => !v)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                                        <Plus size={14} />
                                    </button>
                                    <button className="modal-close" onClick={() => { setShowAttributesModal(false); setShowModelAttributeForm(false); }} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="modal-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                {showModelAttributeForm && (
                                    <form onSubmit={handleModelAttributeSubmit} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-accent-primary)' }}>
                                        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                                            <select name="consumable_attribute_definition" value={modelAttributeForm.consumable_attribute_definition} onChange={handleModelAttributeInputChange} required className="form-input" style={{ height: '44px' }}>
                                                <option value="">{t('consumableModels.selectAttributeDefinition', 'Select attribute...')}</option>
                                                {availableConsumableAttributeDefinitions.map((def) => (
                                                    <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                        {def.description || `Attribute ${def.consumable_attribute_definition_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {(() => {
                                            const selectedDef = definitionLookup.get(Number(modelAttributeForm.consumable_attribute_definition));
                                            const dataType = selectedDef?.data_type?.toLowerCase();
                                            if (dataType === 'number') {
                                                return <input type="number" name="value_number" placeholder={t('consumableModels.numberValue', 'Number')} value={modelAttributeForm.value_number} onChange={handleModelAttributeInputChange} className="form-input" style={{ height: '44px', marginBottom: 'var(--space-3)' }} />;
                                            }
                                            if (dataType === 'bool' || dataType === 'boolean') {
                                                return (
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                                                        <input type="checkbox" name="value_bool" checked={modelAttributeForm.value_bool} onChange={handleModelAttributeInputChange} style={{ width: '18px', height: '18px' }} />
                                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{t('common.true', 'True')}</span>
                                                    </label>
                                                );
                                            }
                                            if (dataType === 'date') {
                                                return <input type="date" name="value_date" value={modelAttributeForm.value_date} onChange={handleModelAttributeInputChange} className="form-input" style={{ height: '44px', marginBottom: 'var(--space-3)' }} />;
                                            }
                                            return <input type="text" name="value_string" placeholder={t('consumableModels.stringValue', 'Value')} value={modelAttributeForm.value_string} onChange={handleModelAttributeInputChange} className="form-input" style={{ height: '44px', marginBottom: 'var(--space-3)' }} />;
                                        })()}
                                        <div className="form-actions">
                                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-4)' }}>{t('common.save')}</button>
                                            <button type="button" onClick={() => setShowModelAttributeForm(false)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>{t('common.cancel')}</button>
                                        </div>
                                    </form>
                                )}

                                {consumableModelAttributes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                                        <Sliders size={32} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                        <p style={{ margin: 0 }}>{t('consumableModels.noAttributeValues', 'No attribute values')}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {consumableModelAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.consumable_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            const dataType = definition?.data_type?.toLowerCase() || 'string';
                                            return (
                                                <div key={`${attr.consumable_model}-${attr.consumable_attribute_definition}`} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-card)',
                                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-hover)'; e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                                                        <span className="badge badge-info" style={{ flexShrink: 0, fontSize: '10px' }}>
                                                            {dataType.slice(0, 3).toUpperCase()}
                                                        </span>
                                                        <div style={{ minWidth: 0 }}>
                                                            <span style={{ fontWeight: '500', fontSize: 'var(--font-size-sm)' }}>{definition?.description || `Attribute ${attr.consumable_attribute_definition}`}</span>
                                                            <span style={{ marginLeft: 'var(--space-2)', color: value === '' ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                {value === '' ? '—' : String(value)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteModelAttribute(attr.consumable_model, attr.consumable_attribute_definition)}
                                                        style={{ border: 'none', background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease', flexShrink: 0 }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--color-error)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                                                        title={t('consumableModels.removeAttribute', 'Remove attribute')}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Brands Card */}
                {authService.isSuperuser() && (
                    <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div
                            onClick={() => navigate('/dashboard/consumables/brands')}
                            style={{
                                padding: 'var(--space-4) var(--space-5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{
                                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                background: 'var(--color-accent-glow)', border: '1px solid var(--color-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-accent-primary)', flexShrink: 0
                            }}>
                                <Tag size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
                                    {t('consumableModels.manageBrands', 'Manage Brands')}
                                </span>
                                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                    {t('consumableModels.manageBrandsHint', 'Add, edit or remove consumable brands')}
                                </p>
                            </div>
                            <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumablesModelsPage;
