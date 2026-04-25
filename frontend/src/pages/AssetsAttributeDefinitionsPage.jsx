import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X, XCircle, Settings2, Tag, Hash, Database, CheckCircle2, Calendar, ArrowLeft, Pencil } from 'lucide-react';
import { assetAttributeDefinitionService } from '../services/api';
import TranslatableInput from '../components/TranslatableInput';
import { SkeletonListRows } from '../components/SkeletonCard';

const dataTypeKeyMap = { string: 'string', number: 'number', bool: 'boolean', date: 'date' };

const getBilingualLabel = (arKey, enKey, currentLang) => {
    if (currentLang === 'ar') {
        const arVal = arKey;
        const enVal = enKey;
        if (arVal && enVal && arVal !== enVal) return `${arVal} (${enVal})`;
        return arVal || enVal;
    }
    const enVal = enKey;
    const arVal = arKey;
    if (enVal && arVal && arVal !== enVal) return `${enVal} (${arVal})`;
    return enVal || arVal;
};

const AssetsAttributeDefinitionsPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        description: '',
        data_type: '',
        unit: ''
    });
    const [formTranslations, setFormTranslations] = useState({});

    useEffect(() => {
        fetchAttributeDefinitions();
    }, []);

    const fetchAttributeDefinitions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await assetAttributeDefinitionService.getAll();
            setAttributeDefinitions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(t('assetsAttributeDefinitions.fetchError') + ': ' + err.message);
            setAttributeDefinitions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFormTranslationChange = (langCode, value) => {
        setFormTranslations((prev) => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
    };

    const handleEdit = (def) => {
        setEditingId(def.asset_attribute_definition_id);
        setForm({
            description: def.description || '',
            data_type: def.data_type || '',
            unit: def.unit || ''
        });
        const trans = {};
        if (def.description_ar) trans['ar'] = { description: def.description_ar };
        if (def.description_en) trans['en'] = { description: def.description_en };
        if (def.unit_ar) { trans['ar'] = { ...(trans['ar'] || {}), unit: def.unit_ar }; }
        if (def.unit_en) { trans['en'] = { ...(trans['en'] || {}), unit: def.unit_en }; }
        setFormTranslations(trans);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                description: form.description || null,
                data_type: form.data_type || null,
                unit: form.unit || null,
            };
            const translations = { ...formTranslations };
            if (form.description || form.unit) {
                translations['en'] = {
                    ...(translations['en'] || {}),
                    ...(form.description && { description: form.description }),
                    ...(form.unit && { unit: form.unit }),
                };
            }
            if (Object.keys(translations).length > 0) {
                payload.translations = translations;
            }
            if (editingId) {
                await assetAttributeDefinitionService.update(editingId, payload);
            } else {
                await assetAttributeDefinitionService.create(payload);
            }
            setForm({ description: '', data_type: '', unit: '' });
            setFormTranslations({});
            setEditingId(null);
            setShowForm(false);
            await fetchAttributeDefinitions();
        } catch (err) {
            setError(t('assetsAttributeDefinitions.createError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('assetsAttributeDefinitions.confirmDelete'))) return;
        try {
            await assetAttributeDefinitionService.delete(id);
            await fetchAttributeDefinitions();
        } catch (err) {
            setError(t('assetsAttributeDefinitions.deleteError') + ': ' + err.message);
        }
    };

    const getDataTypeIcon = (dataType) => {
        switch (dataType) {
            case 'string': return <Tag size={14} />;
            case 'number': return <Hash size={14} />;
            case 'bool': return <CheckCircle2 size={14} />;
            case 'date': return <Calendar size={14} />;
            default: return <Database size={14} />;
        }
    };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: 'var(--space-2) var(--space-3)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                        }}
                        title={t('common.back')}
                        aria-label={t('common.back')}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Settings2 size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assetsAttributeDefinitions.title')}</h1>
                        <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                            {t('assetsAttributeDefinitions.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Add New Definition Button */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    onClick={() => { setEditingId(null); setForm({ description: '', data_type: '', unit: '' }); setFormTranslations({}); setShowForm(true); }}
                    className="btn btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-5)'
                    }}
                >
                    <Plus size={20} />
                    <span>{t('assetsAttributeDefinitions.addDefinition')}</span>
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 'var(--space-4)'
                    }}
                    onClick={() => setShowForm(false)}
                >
                    <div
                        style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-xl)',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: 'var(--space-5) var(--space-6)',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
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
                                    {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                        {editingId ? t('assetsAttributeDefinitions.editDefinition', 'Edit Attribute Definition') : t('assetsAttributeDefinitions.addDefinition')}
                                    </h3>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                                        {editingId ? t('assetsAttributeDefinitions.editTemplate', 'Modify the attribute definition details') : t('assetsAttributeDefinitions.createTemplate')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowForm(false); setEditingId(null); setFormTranslations({}); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: 'var(--space-2)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 'var(--space-6)' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                                    <TranslatableInput
                                        label={t('assetsAttributeDefinitions.description')}
                                        baseFieldName="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.description || '']))}
                                        onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { description: value })}
                                        placeholder={t('assetsAttributeDefinitions.descriptionPlaceholder')}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                            {t('assetsAttributeDefinitions.dataType')}
                                        </label>
                                        <select
                                            name="data_type"
                                            value={form.data_type}
                                            onChange={(e) => handleChange('data_type', e.target.value)}
                                            className="form-input"
                                            style={{ width: '100%', height: '44px' }}
                                        >
                                            <option value="">{t('assetsAttributeDefinitions.selectDataType')}</option>
                                            <option value="string">{t('assetsAttributeDefinitions.string')}</option>
                                            <option value="number">{t('assetsAttributeDefinitions.number')}</option>
                                            <option value="bool">{t('assetsAttributeDefinitions.boolean')}</option>
                                            <option value="date">{t('assetsAttributeDefinitions.date')}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <TranslatableInput
                                            label={t('assetsAttributeDefinitions.unitOptional')}
                                            baseFieldName="unit"
                                            value={form.unit}
                                            onChange={handleChange}
                                            translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.unit || '']))}
                                            onTranslationChange={(langCode, value) => handleFormTranslationChange(langCode, { unit: value })}
                                            placeholder={t('assetsAttributeDefinitions.unitPlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setEditingId(null); setFormTranslations({}); }}
                                        className="btn"
                                        style={{
                                            padding: 'var(--space-3) var(--space-5)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary"
                                        style={{ padding: 'var(--space-3) var(--space-6)' }}
                                    >
                                        {saving ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
                                                {t('common.saving')}
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                                                {editingId ? t('common.save', 'Save') : t('assetsAttributeDefinitions.saveDefinition')}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Definitions List */}
            <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div className="card-header" style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    background: 'var(--color-bg-secondary)'
                }}>
                    <Settings2 size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                        {t('assetsAttributeDefinitions.attributeDefinitions')}
                    </h2>
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-bg-card)',
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        {attributeDefinitions.length} {t('common.total')}
                    </span>
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-12)' }}>
                            <SkeletonListRows count={8} />
                        </div>
                    ) : attributeDefinitions.length === 0 ? (
                        <div style={{
                            padding: 'var(--space-12)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)'
                        }}>
                            <Database size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>{t('assetsAttributeDefinitions.noDefinitions')}</p>
                            <p style={{ fontSize: 'var(--font-size-sm)' }}>{t('assetsAttributeDefinitions.clickToCreate')}</p>
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-2)' }}>
                            {attributeDefinitions.map((def, index) => (
                                <div
                                    key={def.asset_attribute_definition_id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--space-4) var(--space-4)',
                                        marginBottom: index === attributeDefinitions.length - 1 ? 0 : 'var(--space-2)',
                                        background: 'var(--color-bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                                        e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                        e.currentTarget.style.background = 'var(--color-bg-secondary)';
                                    }}
                                >
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
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                                                {getBilingualLabel(def.description_ar, def.description_en || def.description, i18n.language)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                {def.data_type && (
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 'var(--space-1)',
                                                        background: 'var(--color-bg-card)',
                                                        padding: '2px var(--space-2)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)'
                                                    }}>
                                                        {getDataTypeIcon(def.data_type)}
                                                        {getBilingualLabel(t('assetsAttributeDefinitions.' + (dataTypeKeyMap[def.data_type] || def.data_type)), t('assetsAttributeDefinitions.' + (dataTypeKeyMap[def.data_type] || def.data_type), { lng: 'en' }), i18n.language)}
                                                    </span>
                                                )}
                                                {def.unit && (
                                                    <span style={{
                                                        background: 'var(--color-bg-card)',
                                                        padding: '2px var(--space-2)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)'
                                                    }}>
                                                        {getBilingualLabel(def.unit_ar, def.unit_en || def.unit, i18n.language)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button
                                            onClick={() => handleEdit(def)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '36px',
                                                height: '36px',
                                                border: 'none',
                                                background: 'var(--color-bg-card)',
                                                color: 'var(--color-text-muted)',
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-md)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                                e.currentTarget.style.color = 'var(--color-accent-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--color-bg-card)';
                                                e.currentTarget.style.color = 'var(--color-text-muted)';
                                            }}
                                            title={t('assetsAttributeDefinitions.editDefinition', 'Edit Definition')}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(def.asset_attribute_definition_id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '36px',
                                                height: '36px',
                                                border: 'none',
                                                background: 'var(--color-bg-card)',
                                                color: 'var(--color-text-muted)',
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-md)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.color = 'var(--color-error)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--color-bg-card)';
                                                e.currentTarget.style.color = 'var(--color-text-muted)';
                                            }}
                                            title={t('assetsAttributeDefinitions.deleteDefinition')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetsAttributeDefinitionsPage;
