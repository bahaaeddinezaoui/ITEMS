import { useEffect, useState } from 'react';
import { Plus, Trash2, X, XCircle, Settings2, Tag, Hash, Database, CheckCircle2, Calendar } from 'lucide-react';
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
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)' }}>
                        Asset Attribute Definitions
                    </h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        Define and manage attribute templates for asset types
                    </p>
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
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-5)'
                    }}
                >
                    <Plus size={20} />
                    <span>Add New Attribute Definition</span>
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
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                                        Add New Attribute Definition
                                    </h3>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                                        Create a new attribute template
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
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
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                        Description <span style={{ color: 'var(--color-error)' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Enter attribute description (e.g., Serial Number, Warranty Date)"
                                        value={form.description}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        style={{ width: '100%', height: '44px' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                            Data Type
                                        </label>
                                        <select
                                            name="data_type"
                                            value={form.data_type}
                                            onChange={handleChange}
                                            className="form-input"
                                            style={{ width: '100%', height: '44px' }}
                                        >
                                            <option value="">Select data type...</option>
                                            <option value="string">String (Text)</option>
                                            <option value="number">Number</option>
                                            <option value="bool">Boolean (Yes/No)</option>
                                            <option value="date">Date</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                            Unit (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="unit"
                                            placeholder="e.g., kg, mm, GB"
                                            value={form.unit}
                                            onChange={handleChange}
                                            className="form-input"
                                            style={{ width: '100%', height: '44px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
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
                                        Cancel
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
                                                Saving...
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <Plus size={18} />
                                                Save Definition
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
                        Attribute Definitions
                    </h2>
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-bg-card)',
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        {attributeDefinitions.length} total
                    </span>
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="loading-state" style={{ padding: 'var(--space-12)' }}>
                            <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                            <span>Loading definitions...</span>
                        </div>
                    ) : attributeDefinitions.length === 0 ? (
                        <div style={{
                            padding: 'var(--space-12)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)'
                        }}>
                            <Database size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>No attribute definitions yet</p>
                            <p style={{ fontSize: 'var(--font-size-sm)' }}>Click "Add New Attribute Definition" above to create one</p>
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
                                                {def.description}
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
                                                        {def.data_type}
                                                    </span>
                                                )}
                                                {def.unit && (
                                                    <span style={{
                                                        background: 'var(--color-bg-card)',
                                                        padding: '2px var(--space-2)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)'
                                                    }}>
                                                        {def.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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
                                        title="Delete definition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
