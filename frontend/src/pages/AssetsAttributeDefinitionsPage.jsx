import { useEffect, useState } from 'react';
import { assetAttributeDefinitionService } from '../services/api';

const AssetsAttributeDefinitionsPage = () => {
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        description: '',
        data_type: '',
        unit: ''
    });

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
            setError('Failed to fetch attribute definitions: ' + err.message);
            setAttributeDefinitions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
            await assetAttributeDefinitionService.create(payload);
            setForm({ description: '', data_type: '', unit: '' });
            setShowForm(false);
            await fetchAttributeDefinitions();
        } catch (err) {
            setError('Failed to create attribute definition: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attribute definition?')) return;
        try {
            await assetAttributeDefinitionService.delete(id);
            await fetchAttributeDefinitions();
        } catch (err) {
            setError('Failed to delete attribute definition: ' + err.message);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h1 className="page-title">Asset Attribute Definitions</h1>
                <p className="page-subtitle">Manage asset attribute definitions</p>
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
                    <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Definitions</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                        + Add
                    </button>
                </div>

                {showForm && (
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', marginBottom: 'var(--space-2)', padding: 'var(--space-2)' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                <select
                                    name="data_type"
                                    value={form.data_type}
                                    onChange={handleChange}
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
                                    value={form.unit}
                                    onChange={handleChange}
                                    style={{ padding: 'var(--space-2)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                <button type="submit" disabled={saving} style={{ flex: 1, padding: 'var(--space-1)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>Save</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 'var(--space-1)', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-4)' }}>
                    {loading && <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>}
                    {!loading && attributeDefinitions.length === 0 && (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No attribute definitions.</div>
                    )}
                    {attributeDefinitions.map(def => (
                        <div
                            key={def.asset_attribute_definition_id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-2) 0',
                                borderBottom: '1px solid var(--color-border)'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: '500' }}>{def.description}</div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                    {def.data_type}{def.unit ? ` • ${def.unit}` : ''}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(def.asset_attribute_definition_id)}
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

export default AssetsAttributeDefinitionsPage;
