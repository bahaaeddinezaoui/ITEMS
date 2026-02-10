import { useEffect, useState } from 'react';
import { positionService } from '../services/api';

const PositionsPage = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        position_label: '',
        position_code: '',
        description: '',
    });

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await positionService.getAll();
            setPositions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch positions: ' + err.message);
            setPositions([]);
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
                await positionService.update(editingId, formData);
            } else {
                await positionService.create(formData);
            }
            setFormData({ position_label: '', position_code: '', description: '' });
            setShowForm(false);
            setEditingId(null);
            await fetchPositions();
        } catch (err) {
            setError('Failed to save position: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (position) => {
        setFormData({
            position_label: position.position_label,
            position_code: position.position_code,
            description: position.description || '',
        });
        setEditingId(position.position_id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this position?')) {
            try {
                await positionService.delete(id);
                await fetchPositions();
            } catch (err) {
                setError('Failed to delete position: ' + err.message);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ position_label: '', position_code: '', description: '' });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Positions</h1>
                <p className="page-subtitle">Manage job positions in the organization</p>
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
                        All Positions
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
                        {showForm ? 'Cancel' : '+ New Position'}
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
                                    Position Label *
                                </label>
                                <input
                                    type="text"
                                    name="position_label"
                                    value={formData.position_label}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Software Engineer"
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
                                    Position Code *
                                </label>
                                <input
                                    type="text"
                                    name="position_code"
                                    value={formData.position_code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., SE"
                                    maxLength="48"
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
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Optional description for this position"
                                    rows="3"
                                    maxLength="256"
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-2) var(--space-3)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 'var(--font-size-sm)',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
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
                    ) : positions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                            No positions found
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 150px 150px 100px',
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
                                <div>Position</div>
                                <div>Code</div>
                                <div>Description</div>
                                <div>Actions</div>
                            </div>
                            {positions.map((position, index) => (
                                <div
                                    key={position.position_id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 150px 150px 100px',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-4)',
                                        borderBottom: index < positions.length - 1 ? '1px solid var(--color-border)' : 'none',
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
                                            {position.position_label}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {position.position_code}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {position.description || '—'}
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button
                                            onClick={() => handleEdit(position)}
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
                                            onClick={() => handleDelete(position.position_id)}
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

export default PositionsPage;
