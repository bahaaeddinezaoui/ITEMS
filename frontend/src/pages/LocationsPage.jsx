import { useEffect, useState, useCallback } from 'react';
import { locationService, locationTypeService, locationRelationService } from '../services/api';

// Modal Component for Location Hierarchy Configuration
const LocationHierarchyModal = ({
    isOpen,
    onClose,
    selectedLocation,
    locations,
    relations,
    relationFormData,
    handleRelationFormChange,
    handleSubmitRelation,
    editingRelation,
    handleCancelRelation,
    handleEditRelation,
    handleDeleteRelation
}) => {
    if (!isOpen || !selectedLocation) return null;

    const hasRelation = relations.length > 0;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal" style={{
                maxWidth: '520px',
                width: '90%',
                borderRadius: '16px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    padding: '24px 28px',
                    color: 'white',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                                    Location Hierarchy
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
                                    {selectedLocation.location_name}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                borderRadius: '10px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '28px', background: '#0f172a' }}>
                    {/* Current Parent Card */}
                    {hasRelation ? (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '14px',
                            padding: '20px 22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ 
                                        fontSize: '11px', 
                                        color: '#86efac', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '1px',
                                        fontWeight: '600',
                                        marginBottom: '4px'
                                    }}>
                                        Currently Located In
                                    </div>
                                    <div style={{ 
                                        fontWeight: '700', 
                                        color: '#f0fdf4',
                                        fontSize: '17px',
                                        letterSpacing: '-0.3px'
                                    }}>
                                        {relations[0].parent_location_name}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleEditRelation(relations[0])}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '10px',
                                        padding: '10px 16px',
                                        color: '#f0fdf4',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.2)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                    Change
                                </button>
                                <button
                                    onClick={() => handleDeleteRelation(
                                        relations[0].child_location,
                                        relations[0].parent_location
                                    )}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        color: '#fca5a5',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Form Section */}
                    {(editingRelation || !hasRelation) && (
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(71, 85, 105, 0.4)',
                            borderRadius: '14px',
                            padding: '24px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {editingRelation?.parent_location ? (
                                            <>
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </>
                                        ) : (
                                            <>
                                                <path d="M12 5v14"/><path d="M5 12h14"/>
                                            </>
                                        )}
                                    </svg>
                                </div>
                                <span style={{ 
                                    fontWeight: '700', 
                                    color: '#f8fafc',
                                    fontSize: '16px'
                                }}>
                                    {editingRelation?.parent_location ? 'Change Parent Location' : 'Assign Parent Location'}
                                </span>
                            </div>
                            
                            <form onSubmit={handleSubmitRelation}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Select Parent Location
                                    </label>
                                    <select
                                        name="parent_location"
                                        value={relationFormData.parent_location}
                                        onChange={handleRelationFormChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(71, 85, 105, 0.5)',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: '#f1f5f9',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            appearance: 'none',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 16px center',
                                            paddingRight: '44px'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="" style={{ background: '#0f172a' }}>Choose a parent location...</option>
                                        {locations
                                            .filter(l => l.location_id !== selectedLocation.location_id)
                                            .sort((a, b) => a.location_name.localeCompare(b.location_name))
                                            .map(location => (
                                                <option 
                                                    key={location.location_id} 
                                                    value={location.location_id}
                                                    style={{ background: '#0f172a' }}
                                                >
                                                    {location.location_name} — {location.location_type_label || 'No type'}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        type="submit" 
                                        style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '14px 24px',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)';
                                        }}
                                    >
                                        {editingRelation?.parent_location ? 'Update Connection' : 'Create Connection'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancelRelation}
                                        style={{
                                            padding: '14px 24px',
                                            background: 'rgba(71, 85, 105, 0.3)',
                                            border: '1px solid rgba(71, 85, 105, 0.5)',
                                            borderRadius: '10px',
                                            color: '#cbd5e1',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(71, 85, 105, 0.5)';
                                            e.target.style.borderColor = 'rgba(71, 85, 105, 0.7)';
                                            e.target.style.color = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(71, 85, 105, 0.3)';
                                            e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                                            e.target.style.color = '#cbd5e1';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LocationsPage = () => {
    const [activeTab, setActiveTab] = useState('locations');

    // Locations state
    const [locations, setLocations] = useState([]);
    const [locationTypes, setLocationTypes] = useState([]);
    const [formData, setFormData] = useState({
        location_name: '',
        location_type: '',
    });
    const [editingId, setEditingId] = useState(null);

    // Relations state
    const [relations, setRelations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [relationFormData, setRelationFormData] = useState({
        child_location: '',
        parent_location: '',
    });
    const [editingRelation, setEditingRelation] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLocations();
        fetchLocationTypes();
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

    // Modal management
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

    const fetchLocationTypes = async () => {
        try {
            const data = await locationTypeService.getAll();
            setLocationTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setLocationTypes([]);
        }
    };

    const fetchLocations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await locationService.getAll();
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch locations: ' + err.message);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingId) {
                await locationService.update(editingId, formData);
                setSuccessMessage('Location updated successfully!');
            } else {
                await locationService.create(formData);
                setSuccessMessage('Location created successfully!');
            }
            setFormData({ location_name: '', location_type: '' });
            setShowForm(false);
            setEditingId(null);
            setActiveTab('locations');
            await fetchLocations();
        } catch (err) {
            setError('Failed to save location: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (location) => {
        setFormData({
            location_name: location.location_name,
            location_type: location.location_type || '',
        });
        setEditingId(location.location_id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await locationService.delete(id);
                setSuccessMessage('Location deleted successfully!');
                await fetchLocations();
            } catch (err) {
                setError('Failed to delete location: ' + err.message);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ location_name: '', location_type: '' });
        setShowForm(false);
        setEditingId(null);
    };

    // ============ RELATIONS HANDLERS ============
    const handleSelectLocationForRelations = useCallback(async (location) => {
        setSelectedLocation(location);
        setRelationFormData({
            child_location: location.location_id,
            parent_location: '',
        });
        setEditingRelation(null);
        try {
            const data = await locationRelationService.getByChildId(location.location_id);
            setRelations(Array.isArray(data) ? data : []);
        } catch (err) {
            setRelations([]);
        }
        setIsModalOpen(true);
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

        if (!relationFormData.parent_location) {
            setError('Please select a parent location');
            return;
        }

        try {
            if (editingRelation?.parent_location) {
                await locationRelationService.update(
                    editingRelation.child_location,
                    editingRelation.parent_location,
                    relationFormData
                );
                setSuccessMessage('Relation updated successfully!');
            } else {
                await locationRelationService.create(relationFormData);
                setSuccessMessage('Relation created successfully!');
            }

            setRelationFormData({
                child_location: selectedLocation.location_id,
                parent_location: '',
            });
            setEditingRelation(null);
            const data = await locationRelationService.getByChildId(selectedLocation.location_id);
            setRelations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to save relation: ' + (err.response?.data?.error || err.message));
        }
    }, [editingRelation, relationFormData, selectedLocation]);

    const handleEditRelation = useCallback((relation) => {
        setRelationFormData({
            child_location: relation.child_location,
            parent_location: relation.parent_location,
        });
        setEditingRelation(relation);
    }, []);

    const handleDeleteRelation = useCallback(async (childId, parentId) => {
        if (window.confirm('Are you sure you want to delete this relation?')) {
            try {
                await locationRelationService.delete(childId, parentId);
                setSuccessMessage('Relation deleted successfully!');
                const data = await locationRelationService.getByChildId(selectedLocation.location_id);
                setRelations(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to delete relation: ' + err.message);
            }
        }
    }, [selectedLocation]);

    const handleCancelRelation = useCallback(() => {
        setRelationFormData({
            child_location: selectedLocation.location_id,
            parent_location: '',
        });
        setEditingRelation(null);
    }, [selectedLocation]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLocation(null);
        setRelations([]);
        setEditingRelation(null);
    };

    const handleSelect = (location) => {
        handleSelectLocationForRelations(location);
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Locations</h1>
                <p className="page-subtitle">Manage building locations and their hierarchy</p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-6)',
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
                    marginBottom: 'var(--space-6)',
                    border: '1px solid #cfc'
                }}>
                    {successMessage}
                </div>
            )}

            <div className="card">
                <div className="card-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', margin: 0 }}>
                        All Locations
                    </h2>
                    <button
                        onClick={() => {
                            if (showForm) {
                                handleCancel();
                            } else {
                                setShowForm(true);
                            }
                        }}
                        style={{
                            backgroundColor: showForm ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {showForm ? 'Cancel' : '+ New Location'}
                    </button>
                </div>

                {showForm && (
                    <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 'var(--space-2)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: '500'
                                }}>
                                    Location Name *
                                </label>
                                <input
                                    type="text"
                                    name="location_name"
                                    value={formData.location_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Conference Room A"
                                    maxLength="30"
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-2) var(--space-3)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 'var(--font-size-sm)',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 'var(--space-2)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: '500'
                                }}>
                                    Location Type *
                                </label>
                                <select
                                    name="location_type"
                                    value={formData.location_type}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-2) var(--space-3)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 'var(--font-size-sm)',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">Select a location type</option>
                                    {locationTypes.map((rt) => (
                                        <option key={rt.location_type_id} value={rt.location_type_id}>
                                            {rt.location_type_label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1,
                                        backgroundColor: saving ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: 'var(--space-2) var(--space-4)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: saving ? 'default' : 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '500',
                                        opacity: saving ? 0.6 : 1
                                    }}
                                >
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        padding: 'var(--space-2) var(--space-4)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                            Loading...
                        </div>
                    ) : locations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                            No locations found
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 200px 150px 100px',
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
                                <div>Location Name</div>
                                <div>Location Type</div>
                                <div>Hierarchy</div>
                                <div>Actions</div>
                            </div>
                            {locations.map((location, index) => (
                                <div
                                    key={location.location_id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 200px 150px 100px',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-4)',
                                        borderBottom: index < locations.length - 1 ? '1px solid var(--color-border)' : 'none',
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
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                                            {location.location_name}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {location.location_type_label || location.location_type}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        <button
                                            onClick={() => handleSelect(location)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'var(--color-primary)',
                                                border: '1px solid var(--color-primary)',
                                                padding: 'var(--space-1) var(--space-2)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-xs)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = 'var(--color-primary)';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = 'var(--color-primary)';
                                            }}
                                        >
                                            Hierarchy
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button
                                            onClick={() => handleEdit(location)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'var(--color-primary)',
                                                border: 'none',
                                                padding: 'var(--space-1) var(--space-2)',
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-xs)',
                                                opacity: 0.7,
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.target.style.opacity = 1; }}
                                            onMouseLeave={(e) => { e.target.style.opacity = 0.7; }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(location.location_id)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#c33',
                                                border: 'none',
                                                padding: 'var(--space-1) var(--space-2)',
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-xs)',
                                                opacity: 0.7,
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.target.style.opacity = 1; }}
                                            onMouseLeave={(e) => { e.target.style.opacity = 0.7; }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Location Hierarchy Modal */}
            <LocationHierarchyModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedLocation={selectedLocation}
                locations={locations}
                relations={relations}
                relationFormData={relationFormData}
                handleRelationFormChange={handleRelationFormChange}
                handleSubmitRelation={handleSubmitRelation}
                editingRelation={editingRelation}
                handleCancelRelation={handleCancelRelation}
                handleEditRelation={handleEditRelation}
                handleDeleteRelation={handleDeleteRelation}
            />
        </>
    );
};

export default LocationsPage;
