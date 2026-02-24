import { useEffect, useState } from 'react';
import { roomService, roomTypeService } from '../services/api';

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        room_name: '',
        room_type: '',
    });

    useEffect(() => {
        fetchRooms();
        fetchRoomTypes();
    }, []);

    const fetchRoomTypes = async () => {
        try {
            const data = await roomTypeService.getAll();
            setRoomTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setRoomTypes([]);
        }
    };

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await roomService.getAll();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch rooms: ' + err.message);
            setRooms([]);
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
                await roomService.update(editingId, formData);
            } else {
                await roomService.create(formData);
            }
            setFormData({ room_name: '', room_type: '' });
            setShowForm(false);
            setEditingId(null);
            await fetchRooms();
        } catch (err) {
            setError('Failed to save room: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (room) => {
        setFormData({
            room_name: room.room_name,
            room_type: room.room_type || '',
        });
        setEditingId(room.room_id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await roomService.delete(id);
                await fetchRooms();
            } catch (err) {
                setError('Failed to delete room: ' + err.message);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ room_name: '', room_type: '' });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Rooms</h1>
                <p className="page-subtitle">Manage building rooms</p>
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
                        All Rooms
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
                        {showForm ? 'Cancel' : '+ New Room'}
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
                                    Room Name *
                                </label>
                                <input
                                    type="text"
                                    name="room_name"
                                    value={formData.room_name}
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
                                    Room Type *
                                </label>
                                <select
                                    name="room_type"
                                    value={formData.room_type}
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
                                    <option value="">Select a room type</option>
                                    {roomTypes.map((rt) => (
                                        <option key={rt.room_type_id} value={rt.room_type_id}>
                                            {rt.room_type_label}
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
                    ) : rooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                            No rooms found
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
                                <div>Room Name</div>
                                <div>Room Type</div>
                                <div>Actions</div>
                            </div>
                            {rooms.map((room, index) => (
                                <div
                                    key={room.room_id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 200px 100px',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-4)',
                                        borderBottom: index < rooms.length - 1 ? '1px solid var(--color-border)' : 'none',
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
                                            {room.room_name}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {room.room_type_label || room.room_type}
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button
                                            onClick={() => handleEdit(room)}
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
                                            onClick={() => handleDelete(room.room_id)}
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

export default RoomsPage;
