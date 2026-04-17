import { useState, useEffect, useCallback } from 'react';
import { organizationalStructureService, organizationalStructureRelationService, organizationalStructureTypeService } from '../services/api';

// Form Tab Component
const FormTabContent = ({ editingId, formData, handleFormChange, handleSubmit, handleCancel, structureTypes, structureTypesLoading }) => (
    <div className="card">
        <div className="card-body">
            <div className="form-header" style={{ marginBottom: 'var(--space-6)' }}>
                <h3 className="form-title">{editingId ? 'Edit Structure' : 'Add Structure'}</h3>
                <p className="form-subtitle">
                    {editingId ? 'Update the organizational structure details' : 'Create a new organizational structure'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Structure Code *</label>
                        <input
                            type="text"
                            name="structure_code"
                            value={formData.structure_code}
                            onChange={handleFormChange}
                            required
                            className="form-control"
                            placeholder="e.g., IT, HR, FIN"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Structure Type *</label>
                        <select
                            name="structure_type_id"
                            value={formData.structure_type_id}
                            onChange={handleFormChange}
                            required
                            className="form-control"
                            disabled={structureTypesLoading}
                        >
                            <option value="">{structureTypesLoading ? 'Loading...' : 'Select a type...'}</option>
                            {structureTypes.map(type => (
                                <option key={type.organizational_structure_type_id} value={type.organizational_structure_type_id}>
                                    {type.organizational_structure_type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Structure Name *</label>
                    <input
                        type="text"
                        name="structure_name"
                        value={formData.structure_name}
                        onChange={handleFormChange}
                        required
                        className="form-control"
                        placeholder="e.g., Information Technology Department"
                    />
                </div>

                <div className="form-group form-group-checkbox">
                    <label className="form-checkbox-label">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleFormChange}
                            className="form-checkbox"
                        />
                        <span>Active Structure</span>
                    </label>
                    <span className="form-hint">Inactive structures are hidden from selection</span>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        {editingId ? 'Save Changes' : 'Create Structure'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={handleCancel} className="btn btn-secondary">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    </div>
);

// Modal Component for Hierarchy Configuration
const HierarchyModal = ({
    isOpen,
    onClose,
    selectedStructure,
    structures,
    relations,
    relationFormData,
    handleRelationFormChange,
    handleSubmitRelation,
    editingRelation,
    handleCancelRelation,
    handleEditRelation,
    handleDeleteRelation
}) => {
    if (!isOpen || !selectedStructure) return null;

    return (
        <div className="hierarchy-modal-overlay" onClick={onClose}>
            <div className="hierarchy-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="hierarchy-modal-header">
                    <div className="hierarchy-header-left">
                        <div className="hierarchy-header-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M15 6H9a3 3 0 0 0-3 3v3"/>
                            </svg>
                        </div>
                        <div className="hierarchy-header-text">
                            <h3 className="hierarchy-modal-title">Hierarchy Configuration</h3>
                            <p className="hierarchy-modal-subtitle">
                                {selectedStructure.structure_name} <span className="hierarchy-code-badge">{selectedStructure.structure_code}</span>
                            </p>
                        </div>
                    </div>
                    <button className="hierarchy-close-btn" onClick={onClose} aria-label="Close modal">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div className="hierarchy-modal-body">
                    {/* Current Parent Display */}
                    {relations.length > 0 && !editingRelation && (
                        <div className="hierarchy-section">
                            <div className="hierarchy-section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M15 6H9a3 3 0 0 0-3 3v3"/>
                                </svg>
                                <span>Current Parent</span>
                            </div>
                            
                            {relations.map((relation) => {
                                const parentStructure = structures.find(s => s.organizational_structure_id === relation.parent_organizational_structure);
                                return parentStructure ? (
                                    <div key={relation.parent_organizational_structure} className="hierarchy-connected-card">
                                        <div className="hierarchy-connected-info">
                                            <div className="hierarchy-connected-indicator">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M15 6H9a3 3 0 0 0-3 3v3"/>
                                                </svg>
                                            </div>
                                            <div className="hierarchy-connected-text">
                                                <span className="hierarchy-connected-label">Parent Structure</span>
                                                <span className="hierarchy-connected-name">
                                                    {parentStructure.structure_name} ({parentStructure.structure_code})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="hierarchy-connected-actions">
                                            <button 
                                                className="hierarchy-btn hierarchy-btn-outline"
                                                onClick={() => handleEditRelation(relation)}
                                            >
                                                Change
                                            </button>
                                            <button 
                                                className="hierarchy-btn hierarchy-btn-danger-outline"
                                                onClick={() => handleDeleteRelation(relation.child_organizational_structure, relation.parent_organizational_structure)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}

                    {/* Parent Assignment Form */}
                    {(editingRelation || (relations.length === 0 && selectedStructure)) && (
                        <div className="hierarchy-section hierarchy-form-section">
                            <div className="hierarchy-section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14"/><path d="M5 12h14"/>
                                </svg>
                                <span>{editingRelation?.parent_organizational_structure ? 'Change Parent' : 'Assign Parent'}</span>
                            </div>
                            
                            <form onSubmit={handleSubmitRelation}>
                                <div className="hierarchy-form-group">
                                    <label className="hierarchy-form-label">Select Parent Structure</label>
                                    <select
                                        name="parent_organizational_structure"
                                        value={relationFormData.parent_organizational_structure}
                                        onChange={handleRelationFormChange}
                                        required
                                        className="hierarchy-form-select"
                                    >
                                        <option value="">Choose a parent structure...</option>
                                        {structures
                                            .filter(s => s.organizational_structure_id !== selectedStructure.organizational_structure_id)
                                            .sort((a, b) => a.structure_name.localeCompare(b.structure_name))
                                            .map(structure => (
                                                <option 
                                                    key={structure.organizational_structure_id} 
                                                    value={structure.organizational_structure_id}
                                                >
                                                    {structure.structure_name} ({structure.structure_code}) - {structure.structure_type_label || 'N/A'}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="hierarchy-form-actions">
                                    <button type="submit" className="hierarchy-btn hierarchy-btn-primary">
                                        {editingRelation?.parent_organizational_structure ? 'Update Connection' : 'Save Connection'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="hierarchy-btn hierarchy-btn-outline"
                                        onClick={handleCancelRelation}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* No Parent State */}
                    {relations.length === 0 && !editingRelation && selectedStructure && (
                        <div className="hierarchy-section">
                            <div className="hierarchy-empty-card">
                                <div className="hierarchy-empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M15 6H9a3 3 0 0 0-3 3v3"/>
                                    </svg>
                                </div>
                                <h3 className="hierarchy-empty-title">No Parent Structure</h3>
                                <p className="hierarchy-empty-desc">
                                    This structure has no parent assigned. You can assign a parent structure to establish hierarchy.
                                </p>
                                <button 
                                    className="hierarchy-btn hierarchy-btn-primary"
                                    onClick={() => handleEditRelation({})}
                                >
                                    Assign Parent
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StructuresTabContent = ({ 
    loading, 
    structures, 
    handleEdit, 
    handleDelete,
    relationFormData,
    handleRelationFormChange,
    handleSubmitRelation,
    editingRelation,
    handleCancelRelation,
    handleEditRelation,
    handleDeleteRelation,
    relations,
    selectedStructure,
    handleSelectStructureForRelations
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('structure_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') handleCloseModal(); };
            document.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleEsc);
            };
        }
        return () => { document.body.style.overflow = ''; };
    }, [isModalOpen]);

    const filteredStructures = structures.filter(s =>
        s.structure_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.structure_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.structure_type_label || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        const aVal = a[sortField]?.toString().toLowerCase() || '';
        const bVal = b[sortField]?.toString().toLowerCase() || '';
        return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
    });

    const handleSelect = (structure) => {
        handleSelectStructureForRelations(structure);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        handleSelectStructureForRelations(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Search Header */}
            <div className="structures-search-header">
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search structures by name, code, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <span className="results-count">{filteredStructures.length} of {structures.length} structures</span>
            </div>

            {/* Structures Table */}
            <div className="card">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Loading structures...</p>
                    </div>
                ) : filteredStructures.length === 0 ? (
                    <div className="empty-state">
                        <h3 className="empty-state-title">
                            {searchQuery ? 'No structures found' : 'No organizational structures'}
                        </h3>
                        <p className="empty-state-text">
                            {searchQuery ? 'Try adjusting your search terms' : 'Create one to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th 
                                        className="sortable-header"
                                        onClick={() => {
                                            setSortField('structure_code');
                                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                        }}
                                    >
                                        Code
                                        {sortField === 'structure_code' && (
                                            <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                                        )}
                                    </th>
                                    <th 
                                        className="sortable-header"
                                        onClick={() => {
                                            setSortField('structure_name');
                                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                        }}
                                    >
                                        Structure Name
                                        {sortField === 'structure_name' && (
                                            <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                                        )}
                                    </th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th className="actions-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStructures.map((structure) => (
                                    <tr key={structure.organizational_structure_id}>
                                        <td>
                                            <div className="code-cell">
                                                <div className="code-avatar">
                                                    {structure.structure_code.slice(0, 2)}
                                                </div>
                                                <span className="code-text">{structure.structure_code}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="structure-name-cell">
                                                <span className="structure-name">{structure.structure_name}</span>
                                                <span className="structure-id">ID: {structure.organizational_structure_id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-info">{structure.structure_type_label || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${structure.is_active ? 'badge-success' : 'badge-warning'}`}>
                                                {structure.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="org-actions">
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEdit(structure)}
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleSelect(structure)}
                                                >
                                                    Select
                                                </button>
                                                <button 
                                                    className="btn btn-secondary btn-sm btn-danger-hover"
                                                    onClick={() => handleDelete(structure.organizational_structure_id)}
                                                    title="Delete"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Hierarchy Configuration Modal */}
            <HierarchyModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedStructure={selectedStructure}
                structures={structures}
                relations={relations}
                relationFormData={relationFormData}
                handleRelationFormChange={handleRelationFormChange}
                handleSubmitRelation={handleSubmitRelation}
                editingRelation={editingRelation}
                handleCancelRelation={handleCancelRelation}
                handleEditRelation={handleEditRelation}
                handleDeleteRelation={handleDeleteRelation}
            />
        </div>
    );
};

const OrganizationalStructurePage = () => {
    const [activeTab, setActiveTab] = useState('structures');

    // Structures state
    const [structures, setStructures] = useState([]);
    const [structureTypes, setStructureTypes] = useState([]);
    const [structureTypesLoading, setStructureTypesLoading] = useState(false);
    const [formData, setFormData] = useState({
        structure_code: '',
        structure_name: '',
        structure_type_id: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);

    // Relations state
    const [relations, setRelations] = useState([]);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [relationFormData, setRelationFormData] = useState({
        child_organizational_structure: '',
        parent_organizational_structure: '',
    });
    const [editingRelation, setEditingRelation] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        fetchStructures();
        fetchStructureTypes();
    }, []);

    // Auto-dismiss notifications
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

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

    const fetchStructureTypes = useCallback(async () => {
        setStructureTypesLoading(true);
        try {
            const data = await organizationalStructureTypeService.getAll();
            setStructureTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch structure types: ' + err.message);
        } finally {
            setStructureTypesLoading(false);
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
                structure_type_id: '',
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
            structure_type_id: structure.structure_type_id || '',
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
            structure_type_id: '',
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
            child_organizational_structure: structure.organizational_structure_id,
            parent_organizational_structure: '',
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
            if (editingRelation?.parent_organizational_structure) {
                await organizationalStructureRelationService.update(
                    editingRelation.child_organizational_structure,
                    editingRelation.parent_organizational_structure,
                    relationFormData
                );
                setSuccessMessage('Relation updated successfully!');
            } else {
                await organizationalStructureRelationService.create(relationFormData);
                setSuccessMessage('Relation created successfully!');
            }

            setRelationFormData({
                child_organizational_structure: selectedStructure.organizational_structure_id,
                parent_organizational_structure: '',
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
            child_organizational_structure: relation.child_organizational_structure,
            parent_organizational_structure: relation.parent_organizational_structure,
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
            child_organizational_structure: selectedStructure.organizational_structure_id,
            parent_organizational_structure: '',
        });
        setEditingRelation(null);
    }, [selectedStructure]);

    // ============ MAIN RENDER ============
    return (
        <div className="page-container org-structure-page">
            <style>{`
                .org-structure-page {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: var(--space-6);
                }

                .page-header-section {
                    margin-bottom: var(--space-6);
                }

                .page-title-with-icon {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    margin-bottom: var(--space-2);
                }

                .page-title-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--gradient-primary);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    box-shadow: var(--shadow-glow);
                }

                .page-title-text h1 {
                    font-size: var(--font-size-2xl);
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin: 0;
                }

                .page-title-text p {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin: 0;
                }

                /* Search Header Styles */
                .structures-search-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-4);
                    margin-bottom: var(--space-4);
                }

                .search-input-wrapper {
                    position: relative;
                    flex: 1;
                    max-width: 500px;
                }

                .search-icon {
                    position: absolute;
                    left: var(--space-3);
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    color: var(--color-text-muted);
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    color: var(--color-text-primary);
                    font-size: var(--font-size-base);
                    transition: all var(--transition-fast);
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--color-accent-primary);
                    box-shadow: 0 0 0 3px var(--color-accent-glow);
                }

                .results-count {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                }

                /* Table Enhancements */
                .code-cell {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .code-avatar {
                    width: 32px;
                    height: 32px;
                    background: var(--gradient-primary);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: var(--font-size-xs);
                    color: white;
                }

                .code-text {
                    font-weight: 500;
                    color: var(--color-text-primary);
                }

                .structure-name-cell {
                    display: flex;
                    flex-direction: column;
                }

                .structure-name {
                    font-weight: 500;
                    color: var(--color-text-primary);
                }

                .structure-id {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                }

                .sortable-header {
                    cursor: pointer;
                    user-select: none;
                    transition: color var(--transition-fast);
                }

                .sortable-header:hover {
                    color: var(--color-accent-primary);
                }

                .sort-indicator {
                    margin-left: var(--space-1);
                    color: var(--color-accent-primary);
                }

                .actions-header {
                    text-align: right;
                }

                .selected-row {
                    background: rgba(99, 102, 241, 0.1) !important;
                    border-left: 3px solid var(--color-accent-primary);
                }

                /* Button Sizes */
                .btn-sm {
                    padding: var(--space-2) var(--space-3);
                    font-size: var(--font-size-sm);
                }

                .btn-icon {
                    padding: var(--space-2);
                    width: 36px;
                    height: 36px;
                }

                .btn-danger-hover:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                    border-color: var(--color-error);
                }


                /* Notification Styles */
                .notification-error,
                .notification-success {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-4);
                    animation: slideIn 0.3s ease-out;
                }

                .notification-error {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: var(--color-error);
                }

                .notification-success {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: var(--color-success);
                }

                .notification-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .notification-error .notification-icon {
                    background: rgba(239, 68, 68, 0.2);
                }

                .notification-success .notification-icon {
                    background: rgba(16, 185, 129, 0.2);
                }

                .notification-close {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity var(--transition-fast);
                }

                .notification-close:hover {
                    opacity: 1;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Form Row Layout */
                .form-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: var(--space-4);
                    margin-bottom: var(--space-4);
                }

                .form-header {
                    margin-bottom: var(--space-6);
                }

                .form-title {
                    font-size: var(--font-size-xl);
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin: 0 0 var(--space-2) 0;
                }

                .form-subtitle {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin: 0;
                }

                /* Form Checkbox Styles */
                .form-group-checkbox {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-lg);
                }

                .form-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    cursor: pointer;
                    font-weight: 500;
                }

                .form-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .form-hint {
                    margin-left: auto;
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                }

                /* Tab Navigation */
                .org-tabs-modern {
                    display: flex;
                    gap: var(--space-2);
                    padding: var(--space-3);
                    border-bottom: 1px solid var(--color-border);
                }

                .org-tab-modern {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-4);
                    border-radius: var(--radius-lg);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .org-tab-modern:hover {
                    color: var(--color-text-primary);
                    background: var(--color-bg-card-hover);
                }

                .org-tab-modern.active {
                    color: var(--color-accent-tertiary);
                    background: rgba(99, 102, 241, 0.1);
                    box-shadow: var(--shadow-sm);
                }

                .tab-indicator {
                    width: 8px;
                    height: 8px;
                    background: var(--color-accent-primary);
                    border-radius: var(--radius-full);
                }

                /* Hierarchy Modal - Overlay */
                .hierarchy-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: var(--space-4);
                    animation: hierarchyFadeIn 0.2s ease-out;
                }

                /* Hierarchy Modal - Dialog */
                .hierarchy-modal-dialog {
                    background: var(--color-bg-primary);
                    border: 1px solid var(--color-border);
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4),
                                0 0 0 1px rgba(99, 102, 241, 0.1);
                    max-width: 520px;
                    width: 100%;
                    max-height: calc(100vh - var(--space-8));
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: hierarchySlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Hierarchy Modal - Header */
                .hierarchy-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-5) var(--space-6);
                    border-bottom: 1px solid var(--color-border);
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.03) 100%);
                    flex-shrink: 0;
                }

                .hierarchy-header-left {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    min-width: 0;
                }

                .hierarchy-header-icon {
                    width: 36px;
                    height: 36px;
                    background: var(--gradient-primary);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .hierarchy-header-text {
                    min-width: 0;
                }

                .hierarchy-modal-title {
                    font-size: var(--font-size-lg);
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin: 0;
                    line-height: 1.3;
                }

                .hierarchy-modal-subtitle {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin: 2px 0 0 0;
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    flex-wrap: wrap;
                }

                .hierarchy-code-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 1px 8px;
                    background: rgba(99, 102, 241, 0.12);
                    color: var(--color-accent-tertiary);
                    border-radius: 6px;
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }

                .hierarchy-close-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    transition: all 0.15s ease;
                    flex-shrink: 0;
                }

                .hierarchy-close-btn:hover {
                    background: rgba(239, 68, 68, 0.08);
                    border-color: rgba(239, 68, 68, 0.2);
                    color: var(--color-error);
                }

                /* Hierarchy Modal - Body */
                .hierarchy-modal-body {
                    padding: var(--space-5) var(--space-6);
                    overflow-y: auto;
                    flex: 1;
                    min-height: 0;
                }

                /* Hierarchy Sections */
                .hierarchy-section {
                    margin-bottom: var(--space-5);
                }

                .hierarchy-section:last-child {
                    margin-bottom: 0;
                }

                .hierarchy-section-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--color-text-muted);
                    margin-bottom: var(--space-3);
                }

                .hierarchy-section-header svg {
                    color: var(--color-accent-primary);
                }

                /* Connected Card */
                .hierarchy-connected-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    background: rgba(16, 185, 129, 0.04);
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    border-radius: 12px;
                }

                .hierarchy-connected-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    min-width: 0;
                }

                .hierarchy-connected-indicator {
                    width: 28px;
                    height: 28px;
                    background: rgba(16, 185, 129, 0.12);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-success);
                    flex-shrink: 0;
                }

                .hierarchy-connected-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .hierarchy-connected-label {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                }

                .hierarchy-connected-name {
                    font-size: var(--font-size-sm);
                    font-weight: 600;
                    color: var(--color-text-primary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .hierarchy-connected-actions {
                    display: flex;
                    gap: var(--space-2);
                    flex-shrink: 0;
                }

                /* Empty Card */
                .hierarchy-empty-card {
                    text-align: center;
                    padding: var(--space-6) var(--space-4);
                    background: var(--color-bg-secondary);
                    border: 1px dashed var(--color-border);
                    border-radius: 12px;
                }

                .hierarchy-empty-icon {
                    color: var(--color-text-muted);
                    margin-bottom: var(--space-3);
                    opacity: 0.5;
                }

                .hierarchy-empty-title {
                    font-size: var(--font-size-base);
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin: 0 0 var(--space-1) 0;
                }

                .hierarchy-empty-desc {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin: 0 0 var(--space-4) 0;
                }

                /* Form Section */
                .hierarchy-form-section {
                    padding-top: var(--space-5);
                    border-top: 1px solid var(--color-border);
                }

                .hierarchy-form-group {
                    margin-bottom: var(--space-4);
                }

                .hierarchy-form-label {
                    display: block;
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    margin-bottom: var(--space-2);
                }

                .hierarchy-form-select {
                    width: 100%;
                    padding: var(--space-3) var(--space-4);
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: 10px;
                    color: var(--color-text-primary);
                    font-size: var(--font-size-sm);
                    transition: all 0.15s ease;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    padding-right: 36px;
                }

                .hierarchy-form-select:focus {
                    outline: none;
                    border-color: var(--color-accent-primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
                }

                .hierarchy-form-actions {
                    display: flex;
                    gap: var(--space-3);
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--color-border);
                }

                /* Hierarchy Buttons */
                .hierarchy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: 1px solid transparent;
                    white-space: nowrap;
                }

                .hierarchy-btn-primary {
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .hierarchy-btn-primary:hover {
                    opacity: 0.9;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .hierarchy-btn-outline {
                    background: transparent;
                    color: var(--color-text-secondary);
                    border: 1px solid var(--color-border);
                }

                .hierarchy-btn-outline:hover {
                    background: var(--color-bg-secondary);
                    border-color: var(--color-accent-primary);
                    color: var(--color-accent-primary);
                }

                .hierarchy-btn-danger-outline {
                    background: transparent;
                    color: var(--color-text-secondary);
                    border: 1px solid var(--color-border);
                }

                .hierarchy-btn-danger-outline:hover {
                    background: rgba(239, 68, 68, 0.06);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: var(--color-error);
                }

                @keyframes hierarchyFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes hierarchySlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>

            {/* Page Header */}
            <div className="page-header-section">
                <div className="page-title-with-icon">
                    <div className="page-title-icon">🏢</div>
                    <div className="page-title-text">
                        <h1>Organizational Structure</h1>
                        <p>Manage organizational units and their hierarchical relationships</p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="notification-error">
                    <div className="notification-icon">✕</div>
                    <p>{error}</p>
                    <button className="notification-close" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {successMessage && (
                <div className="notification-success">
                    <div className="notification-icon">✓</div>
                    <p>{successMessage}</p>
                    <button className="notification-close" onClick={() => setSuccessMessage(null)}>✕</button>
                </div>
            )}

            {/* Main Content */}
            <div className="card">
                {/* Tab Navigation */}
                <div className="org-tabs-modern">
                    <button
                        type="button"
                        className={`org-tab-modern ${activeTab === 'structures' ? 'active' : ''}`}
                        onClick={() => setActiveTab('structures')}
                    >
                        <span>⚡</span>
                        Structures & Hierarchy
                        {selectedStructure && <span className="tab-indicator"></span>}
                    </button>
                    <button
                        type="button"
                        className={`org-tab-modern ${activeTab === 'form' ? 'active' : ''}`}
                        onClick={() => setActiveTab('form')}
                    >
                        <span>{editingId ? '✎' : '+'}</span>
                        {editingId ? 'Edit Structure' : 'New Structure'}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="card-body">
                    {activeTab === 'structures' && (
                        <StructuresTabContent
                            loading={loading}
                            structures={structures}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            relationFormData={relationFormData}
                            handleRelationFormChange={handleRelationFormChange}
                            handleSubmitRelation={handleSubmitRelation}
                            editingRelation={editingRelation}
                            handleCancelRelation={handleCancelRelation}
                            handleEditRelation={handleEditRelation}
                            handleDeleteRelation={handleDeleteRelation}
                            relations={relations}
                            selectedStructure={selectedStructure}
                            handleSelectStructureForRelations={handleSelectStructureForRelations}
                        />
                    )}
                    {activeTab === 'form' && (
                        <FormTabContent
                            editingId={editingId}
                            formData={formData}
                            handleFormChange={handleFormChange}
                            handleSubmit={handleSubmit}
                            handleCancel={handleCancel}
                            structureTypes={structureTypes}
                            structureTypesLoading={structureTypesLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizationalStructurePage;
