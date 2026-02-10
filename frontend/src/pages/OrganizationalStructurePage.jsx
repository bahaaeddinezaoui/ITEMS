import { useState, useEffect, useMemo, useCallback } from 'react';
import { organizationalStructureService, organizationalStructureRelationService } from '../services/api';

// Separate form component to maintain stable reference
const FormTabContent = ({ editingId, formData, handleFormChange, handleSubmit, handleCancel }) => (
    <form onSubmit={handleSubmit} style={{ padding: 'var(--space-4)', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
            {editingId ? 'Edit Structure' : 'Add Structure'}
        </h3>

        <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Structure Code*</label>
            <input
                type="text"
                name="structure_code"
                value={formData.structure_code}
                onChange={handleFormChange}
                required
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '3px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                }}
            />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Structure Name*</label>
            <input
                type="text"
                name="structure_name"
                value={formData.structure_name}
                onChange={handleFormChange}
                required
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '3px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                }}
            />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Structure Type*</label>
            <input
                type="text"
                name="structure_type"
                value={formData.structure_type}
                onChange={handleFormChange}
                required
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '3px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                }}
            />
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleFormChange}
                    style={{ marginRight: '0.5rem' }}
                />
                <span>Active</span>
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
                }}
            >
                {editingId ? 'Update Structure' : 'Create Structure'}
            </button>
            {editingId && (
                <button
                    type="button"
                    onClick={handleCancel}
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
                    }}
                >
                    Cancel
                </button>
            )}
        </div>
    </form>
);

const StructuresTabContent = ({ loading, structures, handleEdit, handleSelectStructureForRelations, setActiveTab, handleDelete }) => (
    <div style={{ padding: 'var(--space-4)' }}>
        <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
            Organizational Structures List
        </h3>
        {loading ? (
            <p>Loading...</p>
        ) : structures.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No organizational structures found. Create one to get started!</p>
        ) : (
            <div style={{
                overflowX: 'auto',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 'var(--font-size-sm)',
                }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '2px solid var(--color-border)' }}>
                            <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Code</th>
                            <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Name</th>
                            <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: '600' }}>Active</th>
                            <th style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {structures.map((structure) => (
                            <tr key={structure.organizational_structure_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: 'var(--space-3)' }}>{structure.structure_code}</td>
                                <td style={{ padding: 'var(--space-3)' }}>{structure.structure_name}</td>
                                <td style={{ padding: 'var(--space-3)' }}>{structure.structure_type}</td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                    {structure.is_active ? '✓' : '✗'}
                                </td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleEdit(structure)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            marginRight: '0.5rem',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleSelectStructureForRelations(structure);
                                            setActiveTab('relations_list');
                                        }}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            marginRight: '0.5rem',
                                            backgroundColor: '#1e7e34',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        Relations
                                    </button>
                                    <button
                                        onClick={() => handleDelete(structure.organizational_structure_id)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            backgroundColor: '#d9534f',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const RelationsListTabContent = ({
    selectedStructure,
    loading,
    relations,
    handleEditRelation,
    handleDeleteRelation,
    setActiveTab
}) => (
    <div style={{ padding: 'var(--space-4)' }}>
        {!selectedStructure ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Please select a structure from the <strong>Structures</strong> tab first.
            </p>
        ) : (
            <>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
                    Relations for: <strong>{selectedStructure.structure_name}</strong>
                </h3>

                {/* Relations List */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : relations.length === 0 ? (
                        <p style={{ color: 'var(--color-text-secondary)' }}>No relations found.</p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 'var(--space-3)',
                        }}>
                            {relations.map((relation) => (
                                <div
                                    key={`${relation.organizational_structure}-${relation.parent_organizational_structure}`}
                                    style={{
                                        padding: 'var(--space-3)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: 'var(--color-bg-secondary)',
                                    }}
                                >
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                                            {relation.organizational_structure_name}
                                        </strong>
                                        <span style={{ display: 'block', margin: '0.25rem 0', color: 'var(--color-text-secondary)' }}>
                                            ↑ Parent
                                        </span>
                                        <strong style={{ fontSize: '0.85rem', color: '#1e7e34' }}>
                                            {relation.parent_organizational_structure_name}
                                        </strong>
                                    </div>
                                    {relation.relation_type && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                            <strong>Type:</strong> {relation.relation_type}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button
                                            onClick={() => {
                                                handleEditRelation(relation);
                                                setActiveTab('relations_form');
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.3rem 0.6rem',
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '2px',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRelation(
                                                relation.organizational_structure,
                                                relation.parent_organizational_structure
                                            )}
                                            style={{
                                                flex: 1,
                                                padding: '0.3rem 0.6rem',
                                                backgroundColor: '#d9534f',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '2px',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        )}
    </div>
);

const RelationFormTabContent = ({
    selectedStructure,
    editingRelation,
    handleSubmitRelation,
    relationFormData,
    handleRelationFormChange,
    structures,
    handleCancelRelation,
    setActiveTab
}) => (
    <div style={{ padding: 'var(--space-4)' }}>
        {!selectedStructure ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Please select a structure from the <strong>Structures</strong> tab first.
            </p>
        ) : (
            <div style={{ maxWidth: '400px' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
                    Relation for: <strong>{selectedStructure.structure_name}</strong>
                </h3>
                <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                    {editingRelation ? 'Edit Relation' : 'Add New Relation'}
                </h4>
                <form onSubmit={handleSubmitRelation}>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Parent Structure*
                        </label>
                        <select
                            name="parent_organizational_structure"
                            value={relationFormData.parent_organizational_structure}
                            onChange={handleRelationFormChange}
                            required
                            disabled={!!editingRelation}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '3px',
                                fontSize: '0.875rem',
                                boxSizing: 'border-box',
                                backgroundColor: editingRelation ? 'var(--color-bg-secondary)' : 'white',
                                color: editingRelation ? 'var(--color-text-secondary)' : 'inherit'
                            }}
                        >
                            <option value="">Select a parent...</option>
                            {structures.filter(s => s.organizational_structure_id !== selectedStructure.organizational_structure_id).map(structure => (
                                <option
                                    key={structure.organizational_structure_id}
                                    value={structure.organizational_structure_id}
                                >
                                    {structure.structure_name}
                                </option>
                            ))}
                        </select>
                        {editingRelation && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                Parent structure cannot be changed once created. Create a new relation instead.
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Relation Type (Optional)
                        </label>
                        <input
                            type="text"
                            name="relation_type"
                            value={relationFormData.relation_type}
                            onChange={handleRelationFormChange}
                            placeholder="e.g., Department, Division"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '3px',
                                fontSize: '0.875rem',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                backgroundColor: '#1e7e34',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            {editingRelation ? 'Update Relation' : 'Add Relation'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                handleCancelRelation();
                                setActiveTab('relations_list');
                            }}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            {editingRelation ? 'Cancel' : 'Clear Form'}
                        </button>
                    </div>
                </form>
            </div>
        )}
    </div>
);

const OrganizationalStructurePage = () => {
    const [activeTab, setActiveTab] = useState('structures');

    // Structures state
    const [structures, setStructures] = useState([]);
    const [formData, setFormData] = useState({
        structure_code: '',
        structure_name: '',
        structure_type: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);

    // Relations state
    const [relations, setRelations] = useState([]);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [relationFormData, setRelationFormData] = useState({
        organizational_structure: '',
        parent_organizational_structure: '',
        relation_type: '',
    });
    const [editingRelation, setEditingRelation] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        fetchStructures();
    }, []);

    // ============ STRUCTURES HANDLERS ============
    const fetchStructures = useCallback(async () => {
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
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
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

            setFormData({
                structure_code: '',
                structure_name: '',
                structure_type: '',
                is_active: true,
            });
            setEditingId(null);
            await fetchStructures();
        } catch (err) {
            setError('Failed to save organizational structure: ' + err.message);
        }
    }, [editingId, formData, fetchStructures]);

    const handleEdit = useCallback((structure) => {
        setFormData({
            structure_code: structure.structure_code,
            structure_name: structure.structure_name,
            structure_type: structure.structure_type,
            is_active: structure.is_active,
        });
        setEditingId(structure.organizational_structure_id);
        setActiveTab('form');
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Are you sure you want to delete this organizational structure?')) {
            try {
                await organizationalStructureService.delete(id);
                setSuccessMessage('Organizational structure deleted successfully!');
                await fetchStructures();
            } catch (err) {
                setError('Failed to delete organizational structure: ' + err.message);
            }
        }
    }, [fetchStructures]);

    const handleCancel = useCallback(() => {
        setFormData({
            structure_code: '',
            structure_name: '',
            structure_type: '',
            is_active: true,
        });
        setEditingId(null);
    }, []);

    // ============ RELATIONS HANDLERS ============
    const fetchRelations = useCallback(async (structureId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await organizationalStructureRelationService.getByStructureId(structureId);
            setRelations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch relations: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelectStructureForRelations = useCallback(async (structure) => {
        setSelectedStructure(structure);
        setRelationFormData({
            organizational_structure: structure.organizational_structure_id,
            parent_organizational_structure: '',
            relation_type: '',
        });
        setEditingRelation(null);
        const data = await organizationalStructureRelationService.getByStructureId(structure.organizational_structure_id);
        setRelations(Array.isArray(data) ? data : []);
    }, []);

    const handleRelationFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setRelationFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmitRelation = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!relationFormData.parent_organizational_structure) {
            setError('Please select a parent organizational structure');
            return;
        }

        try {
            if (editingRelation) {
                await organizationalStructureRelationService.update(
                    editingRelation.organizational_structure,
                    editingRelation.parent_organizational_structure,
                    relationFormData
                );
                setSuccessMessage('Relation updated successfully!');
            } else {
                await organizationalStructureRelationService.create(relationFormData);
                setSuccessMessage('Relation created successfully!');
            }

            setRelationFormData({
                organizational_structure: selectedStructure.organizational_structure_id,
                parent_organizational_structure: '',
                relation_type: '',
            });
            setEditingRelation(null);
            const data = await organizationalStructureRelationService.getByStructureId(selectedStructure.organizational_structure_id);
            setRelations(Array.isArray(data) ? data : []);
            setActiveTab('relations_list');
        } catch (err) {
            setError('Failed to save relation: ' + err.message);
        }
    }, [editingRelation, relationFormData, selectedStructure]);

    const handleEditRelation = useCallback((relation) => {
        setRelationFormData({
            organizational_structure: relation.organizational_structure,
            parent_organizational_structure: relation.parent_organizational_structure,
            relation_type: relation.relation_type || '',
        });
        setEditingRelation(relation);
    }, []);

    const handleDeleteRelation = useCallback(async (childId, parentId) => {
        if (window.confirm('Are you sure you want to delete this relation?')) {
            try {
                await organizationalStructureRelationService.delete(childId, parentId);
                setSuccessMessage('Relation deleted successfully!');
                const data = await organizationalStructureRelationService.getByStructureId(selectedStructure.organizational_structure_id);
                setRelations(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to delete relation: ' + err.message);
            }
        }
    }, [selectedStructure]);

    const handleCancelRelation = useCallback(() => {
        setRelationFormData({
            organizational_structure: selectedStructure.organizational_structure_id,
            parent_organizational_structure: '',
            relation_type: '',
        });
        setEditingRelation(null);
    }, [selectedStructure]);

    // ============ RENDER COMPONENTS ============

    // ============ MAIN RENDER ============
    return (
        <div style={{ padding: 'var(--space-4)' }}>
            {error && (
                <div style={{
                    padding: 'var(--space-3)',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-3)',
                    border: '1px solid #f5c6cb',
                }}>
                    {error}
                </div>
            )}

            {successMessage && (
                <div style={{
                    padding: 'var(--space-3)',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-3)',
                    border: '1px solid #c3e6cb',
                }}>
                    {successMessage}
                </div>
            )}

            <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Organizational Structure Management
            </h2>

            <div style={{
                display: 'flex',
                borderBottom: '2px solid var(--color-border)',
                marginBottom: 'var(--space-4)',
            }}>
                <button
                    onClick={() => setActiveTab('structures')}
                    style={{
                        padding: 'var(--space-3)',
                        backgroundColor: activeTab === 'structures' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'structures' ? 'white' : 'var(--color-text-primary)',
                        border: 'none',
                        borderBottom: activeTab === 'structures' ? '3px solid var(--color-primary)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'structures' ? '600' : '400',
                        fontSize: 'var(--font-size-sm)',
                    }}
                >
                    📋 Structures
                </button>
                <button
                    onClick={() => setActiveTab('form')}
                    style={{
                        padding: 'var(--space-3)',
                        backgroundColor: activeTab === 'form' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'form' ? 'white' : 'var(--color-text-primary)',
                        border: 'none',
                        borderBottom: activeTab === 'form' ? '3px solid var(--color-primary)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'form' ? '600' : '400',
                        fontSize: 'var(--font-size-sm)',
                    }}
                >
                    ➕ Add/Edit Structure
                </button>
                <button
                    onClick={() => setActiveTab('relations_list')}
                    style={{
                        padding: 'var(--space-3)',
                        backgroundColor: activeTab === 'relations_list' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'relations_list' ? 'white' : 'var(--color-text-primary)',
                        border: 'none',
                        borderBottom: activeTab === 'relations_list' ? '3px solid var(--color-primary)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'relations_list' ? '600' : '400',
                        fontSize: 'var(--font-size-sm)',
                    }}
                >
                    🔗 Relations List
                </button>
                <button
                    onClick={() => setActiveTab('relations_form')}
                    style={{
                        padding: 'var(--space-3)',
                        backgroundColor: activeTab === 'relations_form' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'relations_form' ? 'white' : 'var(--color-text-primary)',
                        border: 'none',
                        borderBottom: activeTab === 'relations_form' ? '3px solid var(--color-primary)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'relations_form' ? '600' : '400',
                        fontSize: 'var(--font-size-sm)',
                    }}
                >
                    🔗 Add/Edit Relation
                </button>
            </div>

            {activeTab === 'structures' && (
                <StructuresTabContent
                    loading={loading}
                    structures={structures}
                    handleEdit={handleEdit}
                    handleSelectStructureForRelations={handleSelectStructureForRelations}
                    setActiveTab={setActiveTab}
                    handleDelete={handleDelete}
                />
            )}
            {activeTab === 'form' && (
                <FormTabContent
                    editingId={editingId}
                    formData={formData}
                    handleFormChange={handleFormChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                />
            )}
            {activeTab === 'relations_list' && (
                <RelationsListTabContent
                    selectedStructure={selectedStructure}
                    loading={loading}
                    relations={relations}
                    handleEditRelation={handleEditRelation}
                    handleDeleteRelation={handleDeleteRelation}
                    setActiveTab={setActiveTab}
                />
            )}
            {activeTab === 'relations_form' && (
                <RelationFormTabContent
                    selectedStructure={selectedStructure}
                    editingRelation={editingRelation}
                    handleSubmitRelation={handleSubmitRelation}
                    relationFormData={relationFormData}
                    handleRelationFormChange={handleRelationFormChange}
                    structures={structures}
                    handleCancelRelation={handleCancelRelation}
                    setActiveTab={setActiveTab}
                />
            )}
        </div>
    );
};

export default OrganizationalStructurePage;
