import { useEffect, useState } from 'react';
import { locationService, locationTypeService } from '../services/api';

const LocationsPage = () => {
    const [locations, setLocations] = useState([]);
    const [locationTypes, setLocationTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        location_name: '',
        location_type: '',
    });

    useEffect(() => {
        fetchLocations();
        fetchLocationTypes();
    }, []);

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
            } else {
                await locationService.create(formData);
            }
            setFormData({ location_name: '', location_type: '' });
            setShowForm(false);
            setEditingId(null);
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

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Locations</h1>
                <p className="page-subtitle">Manage building locations</p>
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
                                gridTemplateColumns: '1fr 200px 100px',
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
                                <div>Actions</div>
                            </div>
                            {locations.map((location, index) => (
                                <div
                                    key={location.location_id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 200px 100px',
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
        </>
    );
};

export default LocationsPage;
