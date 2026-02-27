import { useState, useEffect, useMemo, useCallback } from 'react';
import { organizationalStructureService, organizationalStructureRelationService } from '../services/api';

// Separate form component to maintain stable reference
const FormTabContent = ({ editingId, formData, handleFormChange, handleSubmit, handleCancel }) => (
    <form onSubmit={handleSubmit} className="form">
        <h3 className="form-title">{editingId ? 'Edit Structure' : 'Add Structure'}</h3>

        <div className="form-group">
            <label className="form-label">Structure Code*</label>
            <input
                type="text"
                name="structure_code"
                value={formData.structure_code}
                onChange={handleFormChange}
                required
                className="form-control"
            />
        </div>

        <div className="form-group">
            <label className="form-label">Structure Name*</label>
            <input
                type="text"
                name="structure_name"
                value={formData.structure_name}
                onChange={handleFormChange}
                required
                className="form-control"
            />
        </div>

        <div className="form-group">
            <label className="form-label">Structure Type*</label>
            <input
                type="text"
                name="structure_type"
                value={formData.structure_type}
                onChange={handleFormChange}
                required
                className="form-control"
            />
        </div>

        <div className="form-group">
            <label className="form-label">Active</label>
            <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleFormChange}
                className="form-checkbox"
            />
        </div>

        <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Structure' : 'Create Structure'}</button>
            {editingId && (
                <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
            )}
        </div>
    </form>
);

const StructuresTabContent = ({ loading, structures, handleEdit, handleSelectStructureForRelations, setActiveTab, handleDelete }) => (
    <div>
        <h3 className="card-title">Organizational Structures List</h3>
        {loading ? (
            <div className="loading-state">
                <div className="loading-spinner" />
                <p>Loading structures...</p>
            </div>
        ) : structures.length === 0 ? (
            <div className="empty-state">
                <h3 className="empty-state-title">No organizational structures found</h3>
                <p className="empty-state-text">Create one to get started</p>
            </div>
        ) : (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {structures.map((structure) => (
                            <tr key={structure.organizational_structure_id}>
                                <td>{structure.structure_code}</td>
                                <td>{structure.structure_name}</td>
                                <td>{structure.structure_type}</td>
                                <td>
                                    <span className={`badge ${structure.is_active ? 'badge-success' : 'badge-warning'}`}>
                                        {structure.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="org-actions">
                                        <button className="btn btn-primary" type="button" onClick={() => handleEdit(structure)}>Edit</button>
                                        <button className="btn btn-secondary" type="button" onClick={() => {
                                            handleSelectStructureForRelations(structure);
                                            setActiveTab('relations_list');
                                        }}>Relations</button>
                                        <button className="btn btn-secondary" type="button" onClick={() => handleDelete(structure.organizational_structure_id)}>Delete</button>
                                    </div>
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
    <div>
        {!selectedStructure ? (
            <p>Please select a structure from the <strong>Structures</strong> tab first.</p>
        ) : (
            <>
                <h3>Relations for: <strong>{selectedStructure.structure_name}</strong></h3>

                {/* Relations List */}
                <div>
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <p>Loading relations...</p>
                        </div>
                    ) : relations.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No relations found</h3>
                            <p className="empty-state-text">Create one to connect structures</p>
                        </div>
                    ) : (
                        <div className="org-relations-grid">
                            {relations.map((relation) => (
                                <div key={`${relation.organizational_structure}-${relation.parent_organizational_structure}`} className="org-relation-card">
                                    <div>
                                        <strong>{relation.organizational_structure_name}</strong>
                                        <span>↑ Parent</span>
                                        <strong>{relation.parent_organizational_structure_name}</strong>
                                    </div>
                                    {relation.relation_type && (
                                        <div>
                                            <strong>Type:</strong> {relation.relation_type}
                                        </div>
                                    )}
                                    <div className="org-actions">
                                        <button className="btn btn-primary" type="button" onClick={() => {
                                            handleEditRelation(relation);
                                            setActiveTab('relations_form');
                                        }}>Edit</button>
                                        <button className="btn btn-secondary" type="button" onClick={() => handleDeleteRelation(
                                            relation.organizational_structure,
                                            relation.parent_organizational_structure
                                        )}>Delete</button>
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
    <div>
        {!selectedStructure ? (
            <p>Please select a structure from the <strong>Structures</strong> tab first.</p>
        ) : (
            <div>
                <h3>Relation for: <strong>{selectedStructure.structure_name}</strong></h3>
                <h4>{editingRelation ? 'Edit Relation' : 'Add New Relation'}</h4>
                <form onSubmit={handleSubmitRelation}>
                    <div className="form-group">
                        <label className="form-label">Parent Structure*</label>
                        <select
                            name="parent_organizational_structure"
                            value={relationFormData.parent_organizational_structure}
                            onChange={handleRelationFormChange}
                            required
                            disabled={!!editingRelation}
                            className="form-control"
                        >
                            <option value="">Select a parent...</option>
                            {structures.filter(s => s.organizational_structure_id !== selectedStructure.organizational_structure_id).map(structure => (
                                <option key={structure.organizational_structure_id} value={structure.organizational_structure_id}>
                                    {structure.structure_name}
                                </option>
                            ))}
                        </select>
                        {editingRelation && (
                            <p>Parent structure cannot be changed once created. Create a new relation instead.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Relation Type (Optional)</label>
                        <input
                            type="text"
                            name="relation_type"
                            value={relationFormData.relation_type}
                            onChange={handleRelationFormChange}
                            placeholder="e.g., Department, Division"
                            className="form-control"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">{editingRelation ? 'Update Relation' : 'Add Relation'}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => {
                            handleCancelRelation();
                            setActiveTab('relations_list');
                        }}>{editingRelation ? 'Cancel' : 'Clear Form'}</button>
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
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Organizational Structure</h1>
                <p className="page-subtitle">Manage structures and their parent-child relations</p>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Management</h2>
                    <div className="org-tabs">
                        <button
                            type="button"
                            className={`org-tab ${activeTab === 'structures' ? 'active' : ''}`}
                            onClick={() => setActiveTab('structures')}
                        >
                            Structures
                        </button>
                        <button
                            type="button"
                            className={`org-tab ${activeTab === 'form' ? 'active' : ''}`}
                            onClick={() => setActiveTab('form')}
                        >
                            Add/Edit Structure
                        </button>
                        <button
                            type="button"
                            className={`org-tab ${activeTab === 'relations_list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('relations_list')}
                        >
                            Relations List
                        </button>
                        <button
                            type="button"
                            className={`org-tab ${activeTab === 'relations_form' ? 'active' : ''}`}
                            onClick={() => setActiveTab('relations_form')}
                        >
                            Add/Edit Relation
                        </button>
                    </div>
                </div>

                <div className="card-body">
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
            </div>
        </div>
    );
};

export default OrganizationalStructurePage;
