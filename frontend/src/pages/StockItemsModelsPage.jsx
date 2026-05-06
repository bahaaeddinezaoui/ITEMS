import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Pencil, Sliders, Link2, Layers, Box, X, XCircle, Tag, Image, ChevronUp, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
import { stockItemAttributeDefinitionService, stockItemBrandService, stockItemModelAttributeService, stockItemModelService, stockItemTypeService, authService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { SkeletonListRows } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';
import BackButton from '../components/BackButton';

const StockItemsModelsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const typeId = searchParams.get('typeId');

    const formatModelLabel = (model) => {
        return [model?.brand_name, model?.model_name].filter(Boolean).join(' ');
    };

    const [stockItemType, setStockItemType] = useState(null);
    const [stockItemModels, setStockItemModels] = useState([]);
    const [selectedStockItemModel, setSelectedStockItemModel] = useState(null);
    const [stockItemBrands, setStockItemBrands] = useState([]);
    const [stockItemAttributeDefinitions, setStockItemAttributeDefinitions] = useState([]);
    const [stockItemModelAttributes, setStockItemModelAttributes] = useState([]);
    const [showModelForm, setShowModelForm] = useState(false);
    const [modelSaving, setModelSaving] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [modelForm, setModelForm] = useState({
        stock_item_brand: '',
        model_name_en: '',
        model_name_ar: '',
        model_code: '',
        warranty_expiry_in_months: '',
        stock_item_model_name_in_administrative_certificate_en: '',
        stock_item_model_name_in_administrative_certificate_ar: '',
    });
    const [showModelAttributeForm, setShowModelAttributeForm] = useState(false);
    const [modelAttributeForm, setModelAttributeForm] = useState({
        stock_item_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

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
        fetchStockItemAttributeDefinitions();
        fetchStockItemBrands();
    }, []);

    useEffect(() => {
        if (!selectedStockItemModel) {
            setStockItemModelAttributes([]);
            setShowModelAttributeForm(false);
            setModelAttributeForm({
                stock_item_attribute_definition: '',
                value_string: '',
                value_number: '',
                value_bool: false,
                value_date: ''
            });
            return;
        }
        fetchStockItemModelAttributes(selectedStockItemModel.stock_item_model_id);
    }, [selectedStockItemModel]);

    const fetchTypeAndModels = async (stockItemTypeId) => {
        setLoading(true);
        setError(null);
        try {
            const [types, models] = await Promise.all([
                stockItemTypeService.getAll(),
                stockItemModelService.getByStockItemType(stockItemTypeId),
            ]);
            const typesArr = Array.isArray(types) ? types : [];
            const foundType = typesArr.find((t) => String(t.stock_item_type_id) === String(stockItemTypeId)) || null;
            setStockItemType(foundType);
            setStockItemModels(Array.isArray(models) ? models : []);
            setSelectedStockItemModel(null);
        } catch (err) {
            setError(t('stockItemModels.fetchError') + ': ' + err.message);
            setStockItemType(null);
            setStockItemModels([]);
            setSelectedStockItemModel(null);
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
            setError(t('stockItemModels.enterBrandName'));
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
            await stockItemBrandService.create(formData);
            setBrandForm({ brand_name: '', brand_photo: null });
            setBrandPhotoPreview(null);
            setShowBrandForm(false);
            showSuccess(t('stockItemModels.createBrandSuccess', 'Brand created successfully'));
            await fetchStockItemBrands();
        } catch (err) {
            showError(t('stockItemModels.createBrandError') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setBrandSaving(false);
        }
    };

    const fetchStockItemAttributeDefinitions = async () => {
        try {
            const data = await stockItemAttributeDefinitionService.getAll();
            setStockItemAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setStockItemAttributeDefinitions([]);
        }
    };

    const fetchStockItemBrands = async () => {
        try {
            const data = await stockItemBrandService.getAll();
            setStockItemBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            setStockItemBrands([]);
        }
    };

    const fetchStockItemModelAttributes = async (stockItemModelId) => {
        try {
            const data = await stockItemModelAttributeService.getByStockItemModel(stockItemModelId);
            setStockItemModelAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('stockItemModels.fetchAttributesError') + ': ' + err.message);
            setStockItemModelAttributes([]);
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
        if (!modelForm.stock_item_brand) {
            setError(t('stockItemModels.selectBrand'));
            return;
        }

        setModelSaving(true);
        setError(null);
        try {
            const modelNameEn = modelForm.model_name_en?.trim() || null;
            const modelNameAr = modelForm.model_name_ar?.trim() || null;
            const adminCertEn = modelForm.stock_item_model_name_in_administrative_certificate_en?.trim() || null;
            const adminCertAr = modelForm.stock_item_model_name_in_administrative_certificate_ar?.trim() || null;
            const payload = {
                stock_item_type: Number(typeId),
                stock_item_brand: Number(modelForm.stock_item_brand),
                model_name: modelNameEn,
                model_code: modelForm.model_code || null,
                warranty_expiry_in_months: modelForm.warranty_expiry_in_months ? Number(modelForm.warranty_expiry_in_months) : null,
                translations: {
                    en: { model_name: modelNameEn, stock_item_model_name_in_administrative_certificate: adminCertEn },
                    ar: { model_name: modelNameAr, stock_item_model_name_in_administrative_certificate: adminCertAr },
                }
            };
            if (editingModel) {
                await stockItemModelService.update(editingModel.stock_item_model_id, payload);
            } else {
                await stockItemModelService.create(payload);
            }
            setModelForm({ stock_item_brand: '', model_name_en: '', model_name_ar: '', model_code: '', warranty_expiry_in_months: '', stock_item_model_name_in_administrative_certificate_en: '', stock_item_model_name_in_administrative_certificate_ar: '' });
            setShowModelForm(false);
            setEditingModel(null);
            showSuccess(editingModel ? t('stockItemModels.updateSuccess', 'Model updated successfully') : t('stockItemModels.createSuccess', 'Model created successfully'));
            await fetchTypeAndModels(typeId);
        } catch (err) {
            showError(t('stockItemModels.saveModelError', { action: editingModel ? t('stockItemModels.update') : t('stockItemModels.create') }) + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setModelSaving(false);
        }
    };

    const handleDeleteModel = async (model) => {
        if (!authService.isSuperuser()) return;
        const label = formatModelLabel(model) || model.model_name || `${t('stockItemModels.model')} ${model.stock_item_model_id}`;
        if (!window.confirm(t('stockItemModels.confirmDeleteModel', 'Are you sure you want to delete model "{{name}}"?', { name: label }))) return;
        try {
            await stockItemModelService.delete(model.stock_item_model_id);
            if (selectedStockItemModel?.stock_item_model_id === model.stock_item_model_id) {
                setSelectedStockItemModel(null);
            }
            await fetchTypeAndModels(typeId);
        } catch (err) {
            setError(t('stockItemModels.deleteModelError', 'Failed to delete model') + ': ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEditModel = (model) => {
        setEditingModel(model);
        setModelForm({
            stock_item_brand: model.stock_item_brand,
            model_name_en: model.model_name_en || model.model_name || '',
            model_name_ar: model.model_name_ar || '',
            model_code: model.model_code || '',
            warranty_expiry_in_months: model.warranty_expiry_in_months ?? '',
            stock_item_model_name_in_administrative_certificate_en: model.stock_item_model_name_in_administrative_certificate_en || '',
            stock_item_model_name_in_administrative_certificate_ar: model.stock_item_model_name_in_administrative_certificate_ar || '',
        });
        setShowModelForm(true);
    };

    const handleCancelModelForm = () => {
        setShowModelForm(false);
        setEditingModel(null);
        setModelForm({ stock_item_brand: '', model_name_en: '', model_name_ar: '', model_code: '', warranty_expiry_in_months: '', stock_item_model_name_in_administrative_certificate_en: '', stock_item_model_name_in_administrative_certificate_ar: '' });
    };

    const handleModelAttributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStockItemModel) {
            setError(t('stockItemModels.selectModelFirst'));
            return;
        }
        if (!modelAttributeForm.stock_item_attribute_definition) {
            setError(t('stockItemModels.selectDefinition'));
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
            showSuccess(t('stockItemModels.modelAttrSuccess', 'Model attribute added successfully'));
            await fetchStockItemModelAttributes(selectedStockItemModel.stock_item_model_id);
        } catch (err) {
            showError(t('stockItemModels.addAttributeError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModelAttribute = async (stockItemModelId, definitionId) => {
        if (window.confirm(t('stockItemModels.confirmRemoveAttribute'))) {
            try {
                await stockItemModelAttributeService.delete(stockItemModelId, definitionId);
                if (selectedStockItemModel) {
                    await fetchStockItemModelAttributes(selectedStockItemModel.stock_item_model_id);
                }
            } catch (err) {
                setError(t('stockItemModels.removeAttributeError') + ': ' + err.message);
            }
        }
    };

    const definitionLookup = useMemo(() => {
        const map = new Map();
        (Array.isArray(stockItemAttributeDefinitions) ? stockItemAttributeDefinitions : []).forEach((d) => {
            map.set(d.stock_item_attribute_definition_id, d);
        });
        return map;
    }, [stockItemAttributeDefinitions]);

    const availableStockItemAttributeDefinitions = useMemo(() => {
        if (!selectedStockItemModel) return stockItemAttributeDefinitions;
        const used = new Set((Array.isArray(stockItemModelAttributes) ? stockItemModelAttributes : []).map((a) => a.stock_item_attribute_definition));
        return (Array.isArray(stockItemAttributeDefinitions) ? stockItemAttributeDefinitions : []).filter((d) => !used.has(d.stock_item_attribute_definition_id));
    }, [selectedStockItemModel, stockItemAttributeDefinitions, stockItemModelAttributes]);

    const filteredModels = useMemo(() => {
        let result = [...stockItemModels];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.model_name?.toLowerCase().includes(term) ||
                m.model_code?.toLowerCase().includes(term) ||
                m.brand_name?.toLowerCase().includes(term)
            );
        }
        if (brandFilter) {
            result = result.filter(m => String(m.stock_item_brand) === String(brandFilter));
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
    }, [stockItemModels, searchTerm, brandFilter, sortField, sortDirection]);

    const goBack = () => {
        navigate('/dashboard/stock-items/types');
    };

    const goToInstances = (model) => {
        navigate(`/dashboard/stock-items/instances?typeId=${typeId}&modelId=${model.stock_item_model_id}`);
    };

    const goToCompatibility = (model) => {
        navigate(`/dashboard/stock-items/models/${model.stock_item_model_id}/compatibility?typeId=${typeId}`);
    };

    const goToDefaultConfiguration = (model) => {
        navigate(`/dashboard/stock-items/models/${model.stock_item_model_id}/default-composition?typeId=${typeId}`);
    };

    if (!typeId) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockItemModels.title', 'Stock Item Models')}</h1>
                        <p className="page-subtitle">{t('stockItemModels.selectTypeFirst')}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={goBack} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <span>{t('stockItemModels.backToTypes')}</span>
                    </button>
                </div>
                <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                    <Layers size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('stockItemModels.selectTypeFirst')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <BackButton onClick={goBack} />
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockItemModels.models', 'Stock Item Models')}</h1>
                        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Tag size={14} />
                            {stockItemType?.stock_item_type_label || `Type #${typeId}`}
                        </p>
                    </div>
                </div>
                {authService.isSuperuser() && (
                    <button className="btn btn-primary" onClick={() => { setEditingModel(null); setModelForm({ stock_item_brand: '', model_name_en: '', model_name_ar: '', model_code: '', warranty_expiry_in_months: '', stock_item_model_name_in_administrative_certificate_en: '', stock_item_model_name_in_administrative_certificate_ar: '' }); setShowModelForm(true); }} style={{ padding: 'var(--space-3) var(--space-6)', width: 'auto' }}>
                        <Plus size={18} />
                        <span>{t('stockItemModels.addModel')}</span>
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
                <ModalPortal>
                <div className="modal-overlay" onClick={handleCancelModelForm}>
                    <div className="modal" style={{ maxWidth: '560px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Plus size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                <h3 className="modal-title" style={{ margin: 0 }}>
                                    {editingModel ? t('stockItemModels.editModel') : t('stockItemModels.addNewModel')}
                                </h3>
                            </div>
                            <button className="modal-close" onClick={handleCancelModelForm} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleModelSubmit} className="modal-body" style={{ padding: 'var(--space-5)' }}>
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.selectBrandPlaceholder')} *
                                </label>
                                <select name="stock_item_brand" value={modelForm.stock_item_brand} onChange={handleModelInputChange} required className="form-input" style={{ height: '44px' }}>
                                    <option value="">{t('stockItemModels.selectBrandPlaceholder')}</option>
                                    {stockItemBrands.map((b) => (
                                        <option key={b.stock_item_brand_id} value={b.stock_item_brand_id}>{b.brand_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.modelName')} (EN) *
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-accent-primary)', background: 'var(--color-accent-glow)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>EN</span>
                                    <input type="text" name="model_name_en" value={modelForm.model_name_en} onChange={handleModelInputChange} placeholder={t('stockItemModels.modelNameEnPlaceholder', 'Model name in English')} className="form-input" style={{ height: '44px', flex: 1 }} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.modelName')} (AR)
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-accent-tertiary)', background: 'var(--color-accent-glow)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>AR</span>
                                    <input type="text" name="model_name_ar" value={modelForm.model_name_ar} onChange={handleModelInputChange} placeholder={t('stockItemModels.modelNameArPlaceholder', 'Model name in Arabic')} className="form-input" style={{ height: '44px', flex: 1, direction: 'rtl' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.modelCode')}
                                </label>
                                <input type="text" name="model_code" value={modelForm.model_code} onChange={handleModelInputChange} placeholder={t('stockItemModels.modelCode')} className="form-input" style={{ height: '44px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.warrantyMonths', 'Warranty (Months)')}
                                </label>
                                <input type="number" name="warranty_expiry_in_months" value={modelForm.warranty_expiry_in_months} onChange={handleModelInputChange} placeholder={t('stockItemModels.warrantyMonthsPlaceholder', 'e.g. 12')} className="form-input" style={{ height: '44px' }} min="0" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.nameInAdminCert', 'Name in Admin. Certificate (EN)')}
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-accent-primary)', background: 'var(--color-accent-glow)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>EN</span>
                                    <input type="text" name="stock_item_model_name_in_administrative_certificate_en" value={modelForm.stock_item_model_name_in_administrative_certificate_en} onChange={handleModelInputChange} placeholder={t('stockItemModels.nameInAdminCertEnPlaceholder', 'Name in administrative certificate (English)')} className="form-input" style={{ height: '44px', flex: 1 }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t('stockItemModels.nameInAdminCertAr', 'Name in Admin. Certificate (AR)')}
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-accent-tertiary)', background: 'var(--color-accent-glow)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>AR</span>
                                    <input type="text" name="stock_item_model_name_in_administrative_certificate_ar" value={modelForm.stock_item_model_name_in_administrative_certificate_ar} onChange={handleModelInputChange} placeholder={t('stockItemModels.nameInAdminCertArPlaceholder', 'Name in administrative certificate (Arabic)')} className="form-input" style={{ height: '44px', flex: 1, direction: 'rtl' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                                <button type="button" onClick={handleCancelModelForm} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" disabled={modelSaving} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-5)' }}>
                                    {modelSaving ? t('common.saving', 'Saving...') : (editingModel ? t('stockItemModels.update') : t('common.save'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Models Panel */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    {/* Model List */}
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                        {loading ? (
                            <div style={{ padding: 'var(--space-12)' }}>
                                <SkeletonListRows count={8} />
                            </div>
                        ) : filteredModels.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                                <Layers size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    {searchTerm || brandFilter ? t('stockItemModels.noMatchingModels', 'No matching models') : t('stockItemModels.noModels')}
                                </p>
                            </div>
                        ) : (
                            filteredModels.map(model => (
                                <div
                                    key={model.stock_item_model_id}
                                    style={{
                                        padding: 'var(--space-4) var(--space-5)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        borderBottom: '1px solid var(--color-border)',
                                        background: selectedStockItemModel?.stock_item_model_id === model.stock_item_model_id ? 'var(--color-accent-glow)' : 'transparent',
                                        cursor: 'pointer', transition: 'background 0.15s ease'
                                    }}
                                    onClick={() => setSelectedStockItemModel(model)}
                                    onMouseEnter={(e) => { if (selectedStockItemModel?.stock_item_model_id !== model.stock_item_model_id) e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                                    onMouseLeave={(e) => { if (selectedStockItemModel?.stock_item_model_id !== model.stock_item_model_id) e.currentTarget.style.background = 'transparent'; }}
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
                                                    {model.model_name || `${t('stockItemModels.model')} ${model.stock_item_model_id}`}
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
                                            <button onClick={(e) => { e.stopPropagation(); handleEditModel(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItemModels.editModel')}>
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                        {authService.isSuperuser() && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModel(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }} title={t('common.delete', 'Delete')}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedStockItemModel(model); setShowAttributesModal(true); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItemModels.modelAttributes')}>
                                            <Sliders size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); goToCompatibility(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItemModels.compatibility')}>
                                            <Link2 size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); goToDefaultConfiguration(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItemModels.defaultConfiguration')}>
                                            <Layers size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); goToInstances(model); }} className="btn btn-secondary" style={{ padding: 'var(--space-1)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('stockItemModels.instances')}>
                                            <Box size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Attributes Modal */}
                {showAttributesModal && selectedStockItemModel && (
                    <ModalPortal>
                    <div className="modal-overlay" onClick={() => { setShowAttributesModal(false); setShowModelAttributeForm(false); }}>
                        <div className="modal" style={{ maxWidth: '640px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <Sliders size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                    <div>
                                        <h3 className="modal-title" style={{ margin: 0 }}>
                                            {formatModelLabel(selectedStockItemModel) || selectedStockItemModel.model_name || `${t('stockItemModels.model')} ${selectedStockItemModel.stock_item_model_id}`}
                                        </h3>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {stockItemModelAttributes.length} {t('stockItemModels.attributesCount', 'attributes')}
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
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                {showModelAttributeForm && (
                                    <form onSubmit={handleModelAttributeSubmit} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-accent-primary)' }}>
                                        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                                            <select name="stock_item_attribute_definition" value={modelAttributeForm.stock_item_attribute_definition} onChange={handleModelAttributeInputChange} required className="form-input" style={{ height: '44px' }}>
                                                <option value="">{t('stockItemModels.selectAttributeDefinition')}</option>
                                                {availableStockItemAttributeDefinitions.map((def) => (
                                                    <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                        {def.description || `${t('stockItemModels.attribute')} ${def.stock_item_attribute_definition_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {(() => {
                                            const selectedDef = definitionLookup.get(Number(modelAttributeForm.stock_item_attribute_definition));
                                            const dataType = selectedDef?.data_type?.toLowerCase();
                                            if (dataType === 'number') {
                                                return <input type="number" name="value_number" placeholder={t('stockItemModels.numberValue')} value={modelAttributeForm.value_number} onChange={handleModelAttributeInputChange} className="form-input" style={{ height: '44px', marginBottom: 'var(--space-3)' }} />;
                                            }
                                            if (dataType === 'bool' || dataType === 'boolean') {
                                                return (
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                                                        <input type="checkbox" name="value_bool" checked={modelAttributeForm.value_bool} onChange={handleModelAttributeInputChange} style={{ width: '18px', height: '18px' }} />
                                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{t('common.true')}</span>
                                                    </label>
                                                );
                                            }
                                            if (dataType === 'date') {
                                                return <input type="date" name="value_date" value={modelAttributeForm.value_date} onChange={handleModelAttributeInputChange} className="form-input" style={{ height: '44px', marginBottom: 'var(--space-3)' }} />;
                                            }
                                            return <input type="text" name="value_string" placeholder={t('stockItemModels.stringValue')} value={modelAttributeForm.value_string} onChange={handleModelAttributeInputChange} className="form-input" style={{ height: '44px', marginBottom: 'var(--space-3)' }} />;
                                        })()}
                                        <div className="form-actions">
                                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-4)' }}>{t('common.save')}</button>
                                            <button type="button" onClick={() => setShowModelAttributeForm(false)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>{t('common.cancel')}</button>
                                        </div>
                                    </form>
                                )}

                                {stockItemModelAttributes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                                        <Sliders size={32} style={{ marginBottom: 'var(--space-2)', opacity: 0.3 }} />
                                        <p style={{ margin: 0 }}>{t('stockItemModels.noAttributeValues')}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {stockItemModelAttributes.map((attr) => {
                                            const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                            const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                            const dataType = definition?.data_type?.toLowerCase() || 'string';
                                            return (
                                                <div key={`${attr.stock_item_model}-${attr.stock_item_attribute_definition}`} style={{
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
                                                            <span style={{ fontWeight: '500', fontSize: 'var(--font-size-sm)' }}>{definition?.description || `${t('stockItemModels.attribute')} ${attr.stock_item_attribute_definition}`}</span>
                                                            <span style={{ marginLeft: 'var(--space-2)', color: value === '' ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                {value === '' ? '—' : String(value)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteModelAttribute(attr.stock_item_model, attr.stock_item_attribute_definition)}
                                                        style={{ border: 'none', background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease', flexShrink: 0 }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--color-error)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                                                        title={t('stockItemModels.removeAttribute', 'Remove attribute')}
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
                    </ModalPortal>
                )}

                {/* Manage Brands Card */}
                {authService.isSuperuser() && (
                    <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div
                            onClick={() => navigate('/dashboard/stock-items/brands')}
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
                                    {t('stockItemModels.manageBrands', 'Manage Brands')}
                                </span>
                                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                    {t('stockItemModels.manageBrandsHint', 'Add, edit or remove stock item brands')}
                                </p>
                            </div>
                            <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        </div>
                    </div>
                )}
            </div>
            <FilterSortFAB hasActiveFilters={!!searchTerm || !!brandFilter || sortField !== 'model_name' || sortDirection !== 'asc'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input type="text" placeholder={t('stockItemModels.searchPlaceholder', 'Search models...')} className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 'var(--space-10)', height: '40px', background: 'var(--color-bg-card)', width: '100%' }} />
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('stockItemModels.allBrands', 'All Brands')}</label>
                        <select className="form-input" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('stockItemModels.allBrands', 'All Brands')}</option>
                            {stockItemBrands.map(b => <option key={b.stock_item_brand_id} value={b.stock_item_brand_id}>{b.brand_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('common.sortBy', 'Sort by')}</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <select className="form-input" value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ height: '40px', flex: 1 }}>
                                <option value="model_name">{t('stockItemModels.sortByName', 'Name')}</option>
                                <option value="model_code">{t('stockItemModels.sortByCode', 'Code')}</option>
                                <option value="brand_name">{t('stockItemModels.sortByBrand', 'Brand')}</option>
                            </select>
                            <button className="btn btn-secondary" onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} style={{ padding: 'var(--space-2)', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={sortDirection === 'asc' ? t('common.ascending', 'Ascending') : t('common.descending', 'Descending')}>
                                {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </FilterSortFAB>
        </div>
    );
};

export default StockItemsModelsPage;
