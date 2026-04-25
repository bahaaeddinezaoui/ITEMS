import { useEffect, useMemo, useState } from 'react';
import { SkeletonListRows } from '../components/SkeletonCard';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { consumableAttributeDefinitionService, consumableTypeAttributeService, consumableTypeService } from '../services/api';

const ConsumablesTypeAttributesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { typeId } = useParams(); // Using useParams instead of query string if possible, or keeping consistency

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const typeIdFromQuery = query.get('typeId') || typeId;

    const [consumableType, setConsumableType] = useState(null);
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        consumable_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });

    useEffect(() => {
        if (!typeIdFromQuery) {
            setError(t('consumablesTypeAttributes.typeIdRequired'));
            return;
        }
        fetchAll();
    }, [typeIdFromQuery]);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [type, defs, attrs] = await Promise.all([
                consumableTypeService.getById(typeIdFromQuery),
                consumableAttributeDefinitionService.getAll(),
                consumableTypeAttributeService.getByConsumableType(typeIdFromQuery),
            ]);
            setConsumableType(type);
            setAttributeDefinitions(Array.isArray(defs) ? defs : []);
            setTypeAttributes(Array.isArray(attrs) ? attrs : []);
        } catch (err) {
            setError(t('consumablesTypeAttributes.loadError') + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.consumable_attribute_definition) {
            setError(t('consumablesTypeAttributes.selectDefinition'));
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                consumable_type: Number(typeIdFromQuery),
                consumable_attribute_definition: Number(form.consumable_attribute_definition),
                is_mandatory: form.is_mandatory,
                default_value: form.default_value || null,
            };
            await consumableTypeAttributeService.create(payload);
            setForm({ consumable_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowForm(false);
            await fetchAll();
        } catch (err) {
            setError(t('consumablesTypeAttributes.addError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (definitionId) => {
        if (!window.confirm(t('consumablesTypeAttributes.confirmRemove'))) return;
        try {
            await consumableTypeAttributeService.delete(Number(typeIdFromQuery), Number(definitionId));
            await fetchAll();
        } catch (err) {
            setError(t('consumablesTypeAttributes.removeError') + ': ' + err.message);
        }
    };

    const usedDefinitionIds = useMemo(() => {
        return new Set(typeAttributes.map(a => a.consumable_attribute_definition));
    }, [typeAttributes]);

    const availableDefinitions = useMemo(() => {
        return attributeDefinitions.filter(d => !usedDefinitionIds.has(d.consumable_attribute_definition_id));
    }, [attributeDefinitions, usedDefinitionIds]);

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><SlidersHorizontal size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('consumablesTypeAttributes.title')}</h1>
                    <p className="page-subtitle">{consumableType ? consumableType.consumable_type_label : t('common.type')} • {t('consumablesTypeAttributes.manageAttributes')}</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/consumables/types')}
                    style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                    title={t('consumablesTypeAttributes.backToTypes')}
                    aria-label={t('consumablesTypeAttributes.backToTypes')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
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

            <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="card-header" style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-secondary)'
                }}>
                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('consumablesTypeAttributes.attributes')}</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                        + {t('common.add')}
                    </button>
                </div>

                {showForm && (
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                        <form onSubmit={handleSubmit}>
                            <select
                                name="consumable_attribute_definition"
                                value={form.consumable_attribute_definition}
                                onChange={handleChange}
                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                            >
                                <option value="">{t('consumablesTypeAttributes.selectDefinition')}</option>
                                {availableDefinitions.map(def => (
                                    <option key={def.consumable_attribute_definition_id} value={def.consumable_attribute_definition_id}>
                                        {def.description} ({def.data_type || 'n/a'}{def.unit ? ` • ${def.unit}` : ''})
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input
                                        type="checkbox"
                                        name="is_mandatory"
                                        checked={form.is_mandatory}
                                        onChange={handleChange}
                                    />
                                    {t('common.mandatory')}
                                </label>
                                <input
                                    type="text"
                                    name="default_value"
                                    placeholder={t('consumablesTypeAttributes.defaultValuePlaceholder')}
                                    value={form.default_value}
                                    onChange={handleChange}
                                    style={{ padding: 'var(--space-2)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>{t('common.save')}</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>{t('common.cancel')}</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-4)' }}>
                    {loading ? (
                        <SkeletonListRows count={6} />
                    ) : typeAttributes.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('consumablesTypeAttributes.noAttributes')}</div>
                    ) : (
                        typeAttributes.map(attr => (
                            <div
                                key={attr.consumable_attribute_definition}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-3)',
                                    marginBottom: 'var(--space-2)',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-border)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontWeight: '600' }}>{attr.definition?.description || `${t('consumablesTypeAttributes.attribute')} #${attr.consumable_attribute_definition}`}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{attr.definition?.data_type}{attr.definition?.unit ? ` (${attr.definition.unit})` : ''}{attr.is_mandatory ? ` · ${t('consumablesTypeAttributes.mandatory')}` : ''}</div>
                                </div>
                                <button onClick={() => handleDelete(attr.consumable_attribute_definition)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} title={t('common.delete')}><SlidersHorizontal size={14} /></button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsumablesTypeAttributesPage;
