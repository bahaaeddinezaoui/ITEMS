import { useState, useEffect } from 'react';
import { organizationalStructureService } from '../services/api';

const OrganizationalStructurePage = () => {
    const [activeTab, setActiveTab] = useState('structures');
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formData, setFormData] = useState({
        structure_code: '',
        structure_name: '',
        structure_type: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchStructures();
    }, []);

    const fetchStructures = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await organizationalStructureService.getAll();
            setStructures(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch organizational structures: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            if (editingId) {
                await organizationalStructureService.update(editingId, formData);
                setSuccessMessage('Organizational structure updated successfully!');
            } else {
                await organizationalStructureService.create(formData);
                setSuccessMessage('Organizational structure created successfully!');
            }

            // Reset form
            setFormData({
                structure_code: '',
                structure_name: '',
                structure_type: '',
                is_active: true,
            });
            setEditingId(null);

            // Refresh list
            await fetchStructures();
        } catch (err) {
            setError('Failed to save organizational structure: ' + err.message);
        }
    };

    const handleEdit = (structure) => {
        setFormData({
            structure_code: structure.structure_code,
            structure_name: structure.structure_name,
            structure_type: structure.structure_type,
            is_active: structure.is_active,
        });
        setEditingId(structure.organizational_structure_id);
        setActiveTab('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this organizational structure?')) {
            try {
                await organizationalStructureService.delete(id);
                setSuccessMessage('Organizational structure deleted successfully!');
                await fetchStructures();
            } catch (err) {
                setError('Failed to delete organizational structure: ' + err.message);
            }
        }
    };

    const handleCancel = () => {
        setFormData({
            structure_code: '',
            structure_name: '',
            structure_type: '',
            is_active: true,
        });
        setEditingId(null);
        setActiveTab('structures');
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                    Loading...
                </div>
            );
        }

        if (activeTab === 'form') {
            return <FormTabContent
                formData={formData}
                editingId={editingId}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />;
        }

        if (activeTab === 'structures') {
            return <StructuresTabContent structures={structures} onEdit={handleEdit} onDelete={handleDelete} />;
        }

        return null;
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Organizational Structure</h1>
                <p className="page-subtitle">Manage organizational structure entries</p>
            </div>

            <div className="card">
                <div className="tabs-container" style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-secondary)'
                }}>
                    {['structures', 'form'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: tab === 'structures' ? '1' : 'auto',
                                padding: 'var(--space-4)',
                                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '3px solid var(--color-primary)' : 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: activeTab === tab ? '600' : '500',
                                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize',
                                position: 'relative',
                                top: activeTab === tab ? '1px' : '0',
                                minWidth: tab === 'form' ? '150px' : 'auto'
                            }}
                        >
                            {tab === 'structures' && `📋 Structures (${structures.length})`}
                            {tab === 'form' && (editingId ? '✏️ Edit Structure' : '➕ Add Structure')}
                        </button>
                    ))}
                </div>

                <div className="tab-content" style={{ padding: 'var(--space-6)' }}>
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
                    {successMessage && (
                        <div style={{
                            backgroundColor: '#efe',
                            color: '#3a3',
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: 'var(--space-4)',
                            border: '1px solid #cfc'
                        }}>
                            {successMessage}
                        </div>
                    )}
                    {renderTabContent()}
                </div>
            </div>
        </>
    );
};

const StructuresTabContent = ({ structures, onEdit, onDelete }) => {
    if (structures.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                No organizational structures found
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 200px 1fr 120px 100px',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    fontWeight: '600',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    <div>Code</div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>
                {structures.map((structure, index) => (
                    <div
                        key={structure.organizational_structure_id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 200px 1fr 120px 100px',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-4)',
                            borderBottom: index < structures.length - 1 ? '1px solid var(--color-border)' : 'none',
                            alignItems: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', wordBreak: 'break-word' }}>
                            {structure.structure_code}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', wordBreak: 'break-word' }}>
                            {structure.structure_name}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                            {structure.structure_type || '-'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: structure.is_active ? '#e8f5e9' : '#ffebee',
                                color: structure.is_active ? '#2e7d32' : '#c62828'
                            }}>
                                {structure.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => onEdit(structure)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: 'var(--font-size-xs)',
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    border: '1px solid #1976d2',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#1976d2';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#e3f2fd';
                                    e.target.style.color = '#1976d2';
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(structure.organizational_structure_id)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: 'var(--font-size-xs)',
                                    backgroundColor: '#ffebee',
                                    color: '#c62828',
                                    border: '1px solid #c62828',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#c62828';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#ffebee';
                                    e.target.style.color = '#c62828';
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FormTabContent = ({ formData, editingId, onFormChange, onSubmit, onCancel }) => {
    return (
        <form onSubmit={onSubmit} style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontWeight: '500',
                    color: 'var(--color-text-primary)'
                }}>
                    Structure Code <span style={{ color: '#c62828' }}>*</span>
                </label>
                <input
                    type="text"
                    name="structure_code"
                    value={formData.structure_code}
                    onChange={onFormChange}
                    required
                    maxLength={50}
                    style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        boxSizing: 'border-box'
                    }}
                    placeholder="e.g., ORG001"
                />
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontWeight: '500',
                    color: 'var(--color-text-primary)'
                }}>
                    Structure Name <span style={{ color: '#c62828' }}>*</span>
                </label>
                <input
                    type="text"
                    name="structure_name"
                    value={formData.structure_name}
                    onChange={onFormChange}
                    required
                    maxLength={255}
                    style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Regional Office - North"
                />
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontWeight: '500',
                    color: 'var(--color-text-primary)'
                }}>
                    Structure Type <span style={{ color: '#c62828' }}>*</span>
                </label>
                <input
                    type="text"
                    name="structure_type"
                    value={formData.structure_type}
                    onChange={onFormChange}
                    required
                    maxLength={30}
                    style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Regional, Department, Team"
                />
            </div>

            <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={onFormChange}
                    style={{ cursor: 'pointer' }}
                />
                <label htmlFor="is_active" style={{ cursor: 'pointer', marginBottom: 0 }}>
                    Active
                </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                    type="submit"
                    style={{
                        flex: 1,
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                    }}
                >
                    {editingId ? 'Update Structure' : 'Create Structure'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: 'var(--space-3)',
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--color-border)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--color-bg-secondary)';
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default OrganizationalStructurePage;
