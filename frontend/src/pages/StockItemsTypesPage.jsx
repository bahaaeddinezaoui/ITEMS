import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Layers, 
    Settings2, 
    Trash2, 
    ChevronRight, 
    Info, 
    Tag,
    Hash,
    CheckCircle2,
    XCircle,
    X,
    LayoutGrid,
    Search,
    RefreshCw,
    Settings,
    Image
} from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
import { stockItemTypeService, stockItemAttributeDefinitionService, stockItemTypeAttributeService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import TranslatableInput from '../components/TranslatableInput';
import { SkeletonListRows, SkeletonCardList } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';

const getBilingualStockItemTypeLabel = (item, currentLang) => {
    const labelAr = item.stock_item_type_label_ar;
    const labelEn = item.stock_item_type_label_en;
    if (currentLang === 'ar') {
        return labelAr || labelEn || item.stock_item_type_label;
    }
    return labelEn || labelAr || item.stock_item_type_label;
};

const StockItemsTypesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isSuperuser = user?.roles?.some((role) => role.role_code === 'superuser');

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

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();
    const [formData, setFormData] = useState({
        stock_item_type_label: '',
        stock_item_type_code: '',
    });
    const [formTranslations, setFormTranslations] = useState({});

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
    const [showAttributesModal, setShowAttributesModal] = useState(false);

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
            setError(t('stockItemTypes.fetchError') + ': ' + err.message);
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
            setError(t('stockItemTypes.fetchAttributesError') + ': ' + err.message);
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
            setError(t('stockItemTypes.selectTypeFirst'));
            return;
        }
        if (!typeAttributeForm.stock_item_attribute_definition) {
            setError(t('stockItemTypes.selectDefinition'));
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
            showSuccess(t('stockItemTypes.typeAttrSuccess', 'Attribute added to type successfully'));
            await fetchTypeAttributes(selectedStockItemType.stock_item_type_id);
        } catch (err) {
            showError(t('stockItemTypes.addAttributeError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTypeAttribute = async (definitionId) => {
        if (!selectedStockItemType) return;
        if (!window.confirm(t('stockItemTypes.confirmRemoveAttribute'))) return;
        try {
            await stockItemTypeAttributeService.delete(selectedStockItemType.stock_item_type_id, definitionId);
            await fetchTypeAttributes(selectedStockItemType.stock_item_type_id);
        } catch (err) {
            setError(t('stockItemTypes.removeAttributeError') + ': ' + err.message);
        }
    };

    const fetchAttributeDefinitions = async () => {
        try {
            const data = await stockItemAttributeDefinitionService.getAll();
            setAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('stockItemTypes.fetchDefinitionsError') + ': ' + err.message);
            setAttributeDefinitions([]);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { stock_item_type_label: value } }));
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
            const payload = { ...formData };
            const translations = { ...formTranslations };
            if (formData.stock_item_type_label) {
                translations['en'] = {
                    ...(translations['en'] || {}),
                    stock_item_type_label: formData.stock_item_type_label,
                };
            }
            if (Object.keys(translations).length > 0) {
                payload.translations = translations;
            }
            await stockItemTypeService.create(payload);
            setFormData({ stock_item_type_label: '', stock_item_type_code: '' });
            setFormTranslations({});
            setShowTypeForm(false);
            showSuccess(t('stockItemTypes.createSuccess', 'Stock item type created successfully'));
            await fetchTypes();
        } catch (err) {
            showError(t('stockItemTypes.createError') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm(t('stockItemTypes.confirmDelete'))) {
            try {
                await stockItemTypeService.delete(id);
                await fetchTypes();
            } catch (err) {
                setError(t('stockItemTypes.deleteError') + ': ' + err.message);
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
            setError(t('stockItemTypes.createDefinitionError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttributeDefinition = async (id) => {
        if (window.confirm(t('stockItemTypes.confirmDeleteDefinition'))) {
            try {
                await stockItemAttributeDefinitionService.delete(id);
                await fetchAttributeDefinitions();
            } catch (err) {
                setError(t('stockItemTypes.deleteDefinitionError') + ': ' + err.message);
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

    const goToBrands = () => {
        navigate('/dashboard/stock-items/brands');
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredTypes = stockItemTypes.filter(type => 
        getBilingualStockItemTypeLabel(type, i18n.language)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.stock_item_type_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockItemTypes.title')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('stockItemTypes.subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={fetchTypes} 
                        disabled={loading}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>{t('common.refresh')}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={goToBrands}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <Tag size={18} />
                        <span>{t('stockItemTypes.brands', 'Brands')}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={goToAttributeDefinitions}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <Settings2 size={18} />
                        <span>{t('stockItemTypes.definitions')}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => setShowTypeForm(true)}
                        style={{ padding: 'var(--space-3) var(--space-6)' }}
                    >
                        <Plus size={18} />
                        <span>{t('stockItemTypes.newType')}</span>
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
                {/* Left Column: Types Grid */}
                <div style={{ flex: '1.2' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-16)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                                <SkeletonCardList count={6} cardLines={2} gap="var(--space-4)" bodyPadding="var(--space-6)" style={{ display: 'contents' }} />
                            </div>
                        </div>
                    ) : filteredTypes.length === 0 ? (
                        <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                            <div className="empty-state-icon">
                                <Layers size={64} />
                            </div>
                            <h3 className="empty-state-title">{t('stockItemTypes.noTypesFound')}</h3>
                            <p className="empty-state-text">
                                {searchTerm ? t('stockItemTypes.noResultsFor', { term: searchTerm }) : t('stockItemTypes.startByCreating')}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                            {filteredTypes.map((type) => (
                                <div 
                                    key={type.stock_item_type_id} 
                                    className="card" 
                                    style={{ 
                                        background: 'var(--color-bg-card)', 
                                        border: '1px solid var(--color-border)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                                        {/* Type Photo Placeholder */}
                                        <div style={{ 
                                            width: '100%', 
                                            height: '120px', 
                                            background: 'var(--color-bg-secondary)', 
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: 'var(--space-4)',
                                            border: '2px dashed var(--color-border)'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Image size={32} style={{ marginBottom: 'var(--space-2)', opacity: 0.5 }} />
                                                <span style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>{t('stockItemTypes.typePhoto')}</span>
                                            </div>
                                        </div>

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
                                                    title={t('stockItemTypes.viewModels')}
                                                >
                                                    <LayoutGrid size={16} />
                                                </button>
                                                {isSuperuser && (
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', color: 'var(--color-error)' }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.stock_item_type_id); }}
                                                        title={t('stockItemTypes.deleteType')}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                                            {getBilingualStockItemTypeLabel(type, i18n.language)}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                                            <Hash size={14} />
                                            <span style={{ fontWeight: '600', letterSpacing: '0.05em' }}>{type.stock_item_type_code}</span>
                                        </div>

                                        {/* Attributes Button */}
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                                            onClick={(e) => { e.stopPropagation(); showTypeAttributes(type); setShowAttributesModal(true); }}
                                        >
                                            <Settings size={16} />
                                            <span>{t('stockItemTypes.manageAttributes')}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Modal for Type Attributes */}
            {showAttributesModal && selectedStockItemType && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => { if (!showAddTypeAttributeForm) setShowAttributesModal(false); }}>
                    <div className="modal" style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="modal-header" style={{ padding: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    background: 'var(--color-accent-glow)', 
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-accent-primary)'
                                }}>
                                    <Settings2 size={24} />
                                </div>
                                <div>
                                    <h2 className="modal-title" style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>{getBilingualStockItemTypeLabel(selectedStockItemType, i18n.language)}</h2>
                                    <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                        {t('stockItemTypes.attributesDefined', { count: typeAttributes.length })}
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowAttributesModal(false)} style={{ padding: 'var(--space-2)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body" style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5)' }}>
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            {/* Add Attribute Button */}
                            <button
                                onClick={() => setShowAddTypeAttributeForm(true)}
                                className="btn btn-primary"
                                style={{ 
                                    width: '100%', 
                                    padding: 'var(--space-4)', 
                                    marginBottom: 'var(--space-5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'var(--space-2)'
                                }}
                            >
                                <Plus size={18} />
                                <span>{t('stockItemTypes.addNewAttribute')}</span>
                            </button>

                            {/* Attributes List */}
                            {attributesLoading ? (
                                <div style={{ padding: 'var(--space-8)' }}>
                                    <SkeletonListRows count={4} rowHeight={40} />
                                </div>
                            ) : typeAttributes.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: 'var(--space-12)', 
                                    color: 'var(--color-text-muted)',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px dashed var(--color-border)'
                                }}>
                                    <Settings2 size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
                                    <p style={{ fontSize: 'var(--font-size-md)', margin: 0 }}>{t('stockItemTypes.noAttributesYet')}</p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>{t('stockItemTypes.clickAddAttribute')}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {typeAttributes.map((attr, index) => {
                                        const definition = attr.definition || attributeDefinitions.find((d) => d.stock_item_attribute_definition_id === attr.stock_item_attribute_definition);
                                        return (
                                            <div
                                                key={`${attr.stock_item_type}-${attr.stock_item_attribute_definition}`}
                                                style={{
                                                    padding: 'var(--space-4) var(--space-5)',
                                                    background: 'var(--color-bg-card)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    border: '1px solid var(--color-border)',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                    <div style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        background: 'var(--color-accent-glow)', 
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'var(--color-accent-primary)',
                                                        fontSize: '14px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                                                            <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>{definition?.description}</span>
                                                            {attr.is_mandatory && (
                                                                <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', fontWeight: '600' }}>{t('stockItemTypes.required')}</span>
                                                            )}
                                                        </div>
                                                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                                <Tag size={12} />
                                                                {definition?.data_type || 'any'}
                                                            </span>
                                                            {definition?.unit && <span>• {definition.unit}</span>}
                                                            {attr.default_value && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-accent-primary)' }}>
                                                                    <Hash size={12} />
                                                                    {t('stockItemTypes.defaultLabel')} {attr.default_value}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTypeAttribute(attr.stock_item_attribute_definition)}
                                                    style={{ 
                                                        border: 'none', 
                                                        background: 'var(--color-bg-secondary)', 
                                                        color: 'var(--color-text-muted)', 
                                                        cursor: 'pointer', 
                                                        padding: 'var(--space-2)',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--color-error)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                                                    title={t('stockItemTypes.removeAttribute')}
                                                >
                                                    <X size={18} />
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

            {/* Nested Modal for Adding New Attribute */}
            {showAddTypeAttributeForm && selectedStockItemType && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setShowAddTypeAttributeForm(false)} style={{ zIndex: 1001 }}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    background: 'var(--color-accent-glow)', 
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-accent-primary)'
                                }}>
                                    <Plus size={20} />
                                </div>
                                <h2 className="modal-title" style={{ margin: 0 }}>{t('stockItemTypes.newAttribute')}</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowAddTypeAttributeForm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            <form onSubmit={handleAddTypeAttributeSubmit} className="form">
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>{t('stockItemTypes.attributeDefinition')}</label>
                                    <select
                                        name="stock_item_attribute_definition"
                                        value={typeAttributeForm.stock_item_attribute_definition}
                                        onChange={handleTypeAttributeInputChange}
                                        className="form-input"
                                        style={{ height: '44px' }}
                                    >
                                        <option value="">{t('stockItemTypes.selectDefinition')}</option>
                                        {availableAttributeDefinitions.map((def) => (
                                            <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                                {def.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>{t('stockItemTypes.defaultValue')}</label>
                                        <input
                                            type="text"
                                            name="default_value"
                                            placeholder={t('stockItemTypes.defaultValuePlaceholder')}
                                            value={typeAttributeForm.default_value}
                                            onChange={handleTypeAttributeInputChange}
                                            className="form-input"
                                            style={{ height: '44px' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <label style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 'var(--space-3)', 
                                            cursor: 'pointer',
                                            padding: 'var(--space-3)',
                                            background: 'var(--color-bg-card)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)',
                                            width: '100%'
                                        }}>
                                            <input
                                                type="checkbox"
                                                name="is_mandatory"
                                                checked={typeAttributeForm.is_mandatory}
                                                onChange={handleTypeAttributeInputChange}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>{t('stockItemTypes.mandatory')}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
                                    <button type="button" onClick={() => setShowAddTypeAttributeForm(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {saving ? t('common.saving') : t('stockItemTypes.saveAttribute')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* Modal for Creating New Type */}
            {showTypeForm && (
                <ModalPortal>
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{t('stockItemTypes.newStockItemType')}</h2>
                            <button className="modal-close" onClick={() => setShowTypeForm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                            <form onSubmit={handleTypeSubmit} className="form">
                                <TranslatableInput
                                    label={t('stockItemTypes.typeName')}
                                    baseFieldName="stock_item_type_label"
                                    value={formData.stock_item_type_label}
                                    onChange={handleInputChange}
                                    translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.stock_item_type_label]))}
                                    onTranslationChange={handleFormTranslationChange}
                                    placeholder={t('stockItemTypes.typeNamePlaceholder')}
                                    required
                                />
                                <div className="form-group">
                                    <label className="form-label">{t('stockItemTypes.typeCode')}</label>
                                    <input
                                        type="text"
                                        name="stock_item_type_code"
                                        value={formData.stock_item_type_code}
                                        onChange={(e) => handleInputChange('stock_item_type_code', e.target.value)}
                                        placeholder={t('stockItemTypes.typeCodePlaceholder')}
                                        required
                                        className="form-input"
                                    />
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{t('stockItemTypes.typeCodeHint')}</p>
                                </div>
                                <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
                                    <button type="button" onClick={() => setShowTypeForm(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {saving ? t('common.saving') : t('stockItemTypes.createType')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
            <FilterSortFAB hasActiveFilters={!!searchTerm}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('stockItemTypes.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '40px', paddingLeft: 'var(--space-10)', paddingRight: searchTerm ? 'var(--space-10)' : 'var(--space-4)' }} />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        )}
                    </div>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </div>
    );
};

export default StockItemsTypesPage;
