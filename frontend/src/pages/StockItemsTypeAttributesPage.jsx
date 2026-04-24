import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { stockItemAttributeDefinitionService, stockItemTypeAttributeService, stockItemTypeService } from '../services/api';
import { useTranslation } from 'react-i18next';

const StockItemsTypeAttributesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const typeId = query.get('typeId');

    const [stockItemType, setStockItemType] = useState(null);
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        stock_item_attribute_definition: '',
        is_mandatory: false,
        default_value: ''
    });

    useEffect(() => {
        if (!typeId) {
            setError(t('stockItemTypeAttributes.typeIdRequired'));
            return;
        }
        fetchAll();
    }, [typeId]);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [type, defs, attrs] = await Promise.all([
                stockItemTypeService.getById(typeId),
                stockItemAttributeDefinitionService.getAll(),
                stockItemTypeAttributeService.getByStockItemType(typeId),
            ]);
            setStockItemType(type);
            setAttributeDefinitions(Array.isArray(defs) ? defs : []);
            setTypeAttributes(Array.isArray(attrs) ? attrs : []);
        } catch (err) {
            setError(t('stockItemTypeAttributes.loadError') + ': ' + err.message);
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
        if (!form.stock_item_attribute_definition) {
            setError(t('stockItemTypeAttributes.selectDefinition'));
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                stock_item_type: Number(typeId),
                stock_item_attribute_definition: Number(form.stock_item_attribute_definition),
                is_mandatory: form.is_mandatory,
                default_value: form.default_value || null,
            };
            await stockItemTypeAttributeService.create(payload);
            setForm({ stock_item_attribute_definition: '', is_mandatory: false, default_value: '' });
            setShowForm(false);
            await fetchAll();
        } catch (err) {
            setError(t('stockItemTypeAttributes.addError') + ': ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (definitionId) => {
        if (!window.confirm(t('stockItemTypeAttributes.confirmRemove'))) return;
        try {
            await stockItemTypeAttributeService.delete(Number(typeId), Number(definitionId));
            await fetchAll();
        } catch (err) {
            setError(t('stockItemTypeAttributes.removeError') + ': ' + err.message);
        }
    };

    const usedDefinitionIds = useMemo(() => {
        return new Set(typeAttributes.map(a => a.stock_item_attribute_definition));
    }, [typeAttributes]);

    const availableDefinitions = useMemo(() => {
        return attributeDefinitions.filter(d => !usedDefinitionIds.has(d.stock_item_attribute_definition_id));
    }, [attributeDefinitions, usedDefinitionIds]);

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">{t('stockItemTypeAttributes.title')}</h1>
                    <p className="page-subtitle">{stockItemType ? stockItemType.stock_item_type_label : t('stockItemTypeAttributes.type')} • {t('stockItemTypeAttributes.manageAttributes')}</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/stock-items/types')}
                    style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                    title={t('stockItemTypeAttributes.backToTypes')}
                    aria-label={t('stockItemTypeAttributes.backToTypes')}
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
                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>{t('stockItemTypeAttributes.attributes')}</h2>
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
                                name="stock_item_attribute_definition"
                                value={form.stock_item_attribute_definition}
                                onChange={handleChange}
                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                            >
                                <option value="">{t('stockItemTypeAttributes.selectAttributeDefinition')}</option>
                                {availableDefinitions.map(def => (
                                    <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
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
                                    {t('stockItemTypeAttributes.mandatory')}
                                </label>
                                <input
                                    type="text"
                                    name="default_value"
                                    placeholder={t('stockItemTypeAttributes.defaultValuePlaceholder')}
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
                    {loading && <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.loading')}</div>}
                    {!loading && typeAttributes.length === 0 && (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('stockItemTypeAttributes.noAttributes')}</div>
                    )}

                    {typeAttributes.map(attr => (
                        <div
                            key={attr.stock_item_attribute_definition}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-2) 0',
                                borderBottom: '1px solid var(--color-border)'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: '500' }}>{attr.definition?.description || `${t('stockItemTypeAttributes.definition')} ${attr.stock_item_attribute_definition}`}</div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                    {(attr.definition?.data_type || 'n/a')}{attr.definition?.unit ? ` • ${attr.definition.unit}` : ''}
                                    {attr.is_mandatory ? ` • ${t('stockItemTypeAttributes.mandatory').toLowerCase()}` : ''}
                                    {attr.default_value ? ` • ${t('stockItemTypeAttributes.defaultLabel')} ${attr.default_value}` : ''}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(attr.stock_item_attribute_definition)}
                                style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StockItemsTypeAttributesPage;
