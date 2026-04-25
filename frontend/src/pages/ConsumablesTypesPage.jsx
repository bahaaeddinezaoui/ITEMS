import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Layers, 
    Settings2, 
    Trash2, 
    ChevronRight, 
    Info, 
    ArrowLeft,
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
import { consumableAttributeDefinitionService, consumableTypeAttributeService, consumableTypeService } from '../services/api';
import { Tag as TagIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TranslatableInput from '../components/TranslatableInput';
import { SkeletonListRows, SkeletonCardList } from '../components/SkeletonCard';

const getBilingualConsumableTypeLabel = (item, currentLang) => {
    const labelAr = item.consumable_type_label_ar;
    const labelEn = item.consumable_type_label_en;
    if (currentLang === 'ar') {
        return labelAr || labelEn || item.consumable_type_label;
    }
    return labelEn || labelAr || item.consumable_type_label;
};

const ConsumablesTypesPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isSuperuser = user?.roles?.some((role) => role.role_code === 'superuser');

    const [consumableTypes, setConsumableTypes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [selectedConsumableType, setSelectedConsumableType] = useState(null);
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [attributesLoading, setAttributesLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showTypeForm, setShowTypeForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        consumable_type_label: '',
        consumable_type_code: '',
    });
    const [formTranslations, setFormTranslations] = useState({});

    const [showAddTypeAttributeForm, setShowAddTypeAttributeForm] = useState(false);
    const [typeAttributeForm, setTypeAttributeForm] = useState({
        consumable_attribute_definition: '',
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
            const data = await consumableTypeService.getAll();
            setConsumableTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('consumablesTypes.fetchError') + ': ' + err.message);
            setConsumableTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypeAttributes = async (consumableTypeId) => {
        setAttributesLoading(true);
        setError(null);
        try {
            const data = await consumableTypeAttributeService.getByConsumableType(consumableTypeId);
            setTypeAttributes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('consumablesTypes.fetchAttributesError') + ': ' + err.message);
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
        if (!selectedConsumableType) {
            setError(t('consumablesTypes.selectTypeFirst'));
            return;
        }
        if (!typeAttributeForm.consumable_attribute_definition) {
            setError(t('consumablesTypes.selectAttributeDefinition'));
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                consumable_type: selectedConsumableType.consumable_type_id,
                consumable_attribute_definition: Number(typeAttributeForm.consumable_attribute_definition),
                is_mandatory: !!typeAttributeForm.is_mandatory,
                default_value: typeAttributeForm.default_value || null,
            };
            await consumableTypeAttributeService.create(payload);
            setTypeAttributeForm({ consumable_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowAddTypeAttributeForm(false);
            await fetchTypeAttributes(selectedConsumableType.consumable_type_id);
        } catch (err) {
            setError(t('consumablesTypes.addAttributeError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTypeAttribute = async (definitionId) => {
        if (!selectedConsumableType) return;
        if (!window.confirm(t('consumablesTypes.confirmRemoveAttribute'))) return;
        try {
            await consumableTypeAttributeService.delete(selectedConsumableType.consumable_type_id, definitionId);
            await fetchTypeAttributes(selectedConsumableType.consumable_type_id);
        } catch (err) {
            setError(t('consumablesTypes.removeAttributeError') + ': ' + err.message);
        }
    };

    const fetchAttributeDefinitions = async () => {
        try {
            const data = await consumableAttributeDefinitionService.getAll();
            setAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('consumablesTypes.fetchDefinitionsError') + ': ' + err.message);
            setAttributeDefinitions([]);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { consumable_type_label: value } }));
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = { ...formData };
            const translations = { ...formTranslations };
            if (formData.consumable_type_label) {
                translations['en'] = {
                    ...(translations['en'] || {}),
                    consumable_type_label: formData.consumable_type_label,
                };
            }
            if (Object.keys(translations).length > 0) {
                payload.translations = translations;
            }
            await consumableTypeService.create(payload);
            setFormData({ consumable_type_label: '', consumable_type_code: '' });
            setFormTranslations({});
            setShowTypeForm(false);
            await fetchTypes();
        } catch (err) {
            setError(t('consumablesTypes.createError') + ': ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm(t('consumablesTypes.confirmDelete'))) {
            try {
                await consumableTypeService.delete(id);
                await fetchTypes();
            } catch (err) {
                setError(t('consumablesTypes.deleteError') + ': ' + err.message);
            }
        }
    };

    const goToModels = (type) => {
        navigate(`/dashboard/consumables/models?typeId=${type.consumable_type_id}`);
    };

    const showTypeAttributes = async (type) => {
        setSelectedConsumableType(type);
        setShowAddTypeAttributeForm(false);
        setTypeAttributeForm({ consumable_attribute_definition: '', is_mandatory: false, default_value: '' });
        await fetchTypeAttributes(type.consumable_type_id);
    };

    const goToAttributeDefinitions = () => {
        navigate('/dashboard/consumables/attribute-definitions');
    };

    const goToBrands = () => {
        navigate('/dashboard/consumables/brands');
    };

    const filteredTypes = consumableTypes.filter(type => 
        getBilingualConsumableTypeLabel(type, i18n.language)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.consumable_type_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const assignedDefinitionIds = new Set((Array.isArray(typeAttributes) ? typeAttributes : []).map((a) => a.consumable_attribute_definition));
    const availableAttributeDefinitions = (Array.isArray(attributeDefinitions) ? attributeDefinitions : []).filter(
        (d) => !assignedDefinitionIds.has(d.consumable_attribute_definition_id)
    );

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Layers size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('consumablesTypes.title')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('consumablesTypes.subtitle')}
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
                        <TagIcon size={18} />
                        <span>{t('consumablesTypes.brands', 'Brands')}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={goToAttributeDefinitions}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <Settings2 size={18} />
                        <span>{t('consumablesTypes.definitions')}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => setShowTypeForm(true)}
                        style={{ padding: 'var(--space-3) var(--space-6)' }}
                    >
                        <Plus size={18} />
                        <span>{t('consumablesTypes.newType')}</span>
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
                <div style={{ flex: '1.2' }}>
                    <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
                        <Search 
                            size={18} 
                            style={{ 
                                position: 'absolute', 
                                left: 'var(--space-4)', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--color-text-muted)' 
                            }} 
                        />
                        <input 
                            type="text" 
                            placeholder={t('consumablesTypes.searchPlaceholder')} 
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 'var(--space-12)', height: '48px', background: 'var(--color-bg-card)' }}
                        />
                    </div>

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
                            <h3 className="empty-state-title">{t('consumablesTypes.noTypes')}</h3>
                            <p className="empty-state-text">
                                {searchTerm ? t('consumablesTypes.noResults', { searchTerm }) : t('consumablesTypes.createFirst')}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                            {filteredTypes.map((type) => (
                                <div 
                                    key={type.consumable_type_id} 
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
                                                <span style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>Type Photo</span>
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
                                                    title="View Models"
                                                >
                                                    <LayoutGrid size={16} />
                                                </button>
                                                {isSuperuser && (
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', color: 'var(--color-error)' }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.consumable_type_id); }}
                                                        title="Delete Type"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                                            {getBilingualConsumableTypeLabel(type, i18n.language)}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                                            <Hash size={14} />
                                            <span style={{ fontWeight: '600', letterSpacing: '0.05em' }}>{type.consumable_type_code}</span>
                                        </div>

                                        {/* Attributes Button */}
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                                            onClick={(e) => { e.stopPropagation(); showTypeAttributes(type); setShowAttributesModal(true); }}
                                        >
                                            <Settings size={16} />
                                            <span>{t('consumablesTypes.manageAttributes')}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Modal for Type Attributes */}
            {showAttributesModal && selectedConsumableType && (
                <div className="modal-overlay" onClick={() => setShowAttributesModal(false)}>
                    <div className="modal" style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-5)' }}>
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
                                    <h2 className="modal-title" style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>{getBilingualConsumableTypeLabel(selectedConsumableType, i18n.language)}</h2>
                                    <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                        {typeAttributes.length} attributes defined
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowAttributesModal(false)} style={{ padding: 'var(--space-2)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body" style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5)' }}>
                            {/* Add Attribute Button */}
                            <button
                                onClick={() => setShowAddTypeAttributeForm(!showAddTypeAttributeForm)}
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
                                <span>{showAddTypeAttributeForm ? 'Cancel' : 'Add New Attribute'}</span>
                            </button>

                            {/* Add Attribute Form */}
                            {showAddTypeAttributeForm && (
                                <div style={{ 
                                    marginBottom: 'var(--space-6)', 
                                    padding: 'var(--space-5)', 
                                    background: 'var(--color-bg-secondary)', 
                                    border: '2px solid var(--color-accent-primary)', 
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <h4 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-md)', color: 'var(--color-accent-primary)' }}>New Attribute</h4>
                                    <form onSubmit={handleAddTypeAttributeSubmit} className="form">
                                        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                            <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Attribute Definition</label>
                                            <select
                                                name="consumable_attribute_definition"
                                                value={typeAttributeForm.consumable_attribute_definition}
                                                onChange={handleTypeAttributeInputChange}
                                                className="form-input"
                                                style={{ height: '44px' }}
                                            >
                                                <option value="">Select a definition...</option>
                                                {availableAttributeDefinitions.map((def) => (
                                                    <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                                        {def.description}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Default Value</label>
                                                <input
                                                    type="text"
                                                    name="default_value"
                                                    placeholder="Enter default value (optional)"
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
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>Mandatory</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                                {saving ? 'Saving...' : 'Save Attribute'}
                                            </button>
                                            <button type="button" onClick={() => setShowAddTypeAttributeForm(false)} className="btn btn-secondary" style={{ flex: 1, padding: 'var(--space-3)' }}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}

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
                                    <p style={{ fontSize: 'var(--font-size-md)', margin: 0 }}>No attributes defined yet</p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>Click "Add New Attribute" to get started</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {typeAttributes.map((attr, index) => {
                                        const definition = attr.definition || attributeDefinitions.find((d) => d.consumable_attribute_definition_id === attr.consumable_attribute_definition);
                                        return (
                                            <div
                                                key={`${attr.consumable_type}-${attr.consumable_attribute_definition}`}
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
                                                                <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', fontWeight: '600' }}>Required</span>
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
                                                                    Default: {attr.default_value}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTypeAttribute(attr.consumable_attribute_definition)}
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
                                                    title="Remove attribute"
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
            )}

            {/* Modal for Creating New Type */}
            {showTypeForm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Consumable Type</h2>
                            <button className="modal-close" onClick={() => setShowTypeForm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleTypeSubmit} className="form">
                                <TranslatableInput
                                    label="Type Name"
                                    baseFieldName="consumable_type_label"
                                    value={formData.consumable_type_label}
                                    onChange={handleInputChange}
                                    translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.consumable_type_label]))}
                                    onTranslationChange={handleFormTranslationChange}
                                    placeholder="e.g. Printer Paper"
                                    required
                                />
                                <div className="form-group">
                                    <label className="form-label">Type Code</label>
                                    <input
                                        type="text"
                                        name="consumable_type_code"
                                        value={formData.consumable_type_code}
                                        onChange={(e) => handleInputChange('consumable_type_code', e.target.value)}
                                        placeholder="e.g. PPR"
                                        required
                                        className="form-input"
                                    />
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Used for inventory tracking and identification.</p>
                                </div>
                                <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
                                    <button type="button" onClick={() => setShowTypeForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {saving ? 'Creating...' : 'Create Type'}
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

export default ConsumablesTypesPage;
