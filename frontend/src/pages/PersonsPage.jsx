import { useState, useEffect } from 'react';
import { personService } from '../services/api';

const PersonsPage = () => {
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        sex: 'Male',
        birth_date: '',
        is_approved: false,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPersons();
    }, []);

    const loadPersons = async () => {
        try {
            setLoading(true);
            const data = await personService.getAll();
            setPersons(data);
        } catch {
            setError('Failed to load persons');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await personService.create(formData);
            setShowModal(false);
            setFormData({
                first_name: '',
                last_name: '',
                sex: 'Male',
                birth_date: '',
                is_approved: false,
            });
            loadPersons();
        } catch {
            setError('Failed to create person');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Persons</h1>
                <p className="page-subtitle">Manage all registered persons in the system</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Persons</h2>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Person
                    </button>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading persons...</p>
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <p className="empty-state-title" style={{ color: 'var(--color-error)' }}>{error}</p>
                        </div>
                    ) : persons.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3 className="empty-state-title">No persons yet</h3>
                            <p className="empty-state-text">Get started by adding your first person</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Sex</th>
                                    <th>Birth Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {persons.map((person) => (
                                    <tr key={person.person_id}>
                                        <td>{person.person_id}</td>
                                        <td>
                                            <strong>{person.first_name} {person.last_name}</strong>
                                        </td>
                                        <td>{person.sex}</td>
                                        <td>{formatDate(person.birth_date)}</td>
                                        <td>
                                            <span className={`badge ${person.is_approved ? 'badge-success' : 'badge-warning'}`}>
                                                {person.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Person Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Person</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="first_name" className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            className="form-input"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="last_name" className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            className="form-input"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="sex" className="form-label">Sex</label>
                                        <select
                                            id="sex"
                                            name="sex"
                                            className="form-input"
                                            value={formData.sex}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="birth_date" className="form-label">Birth Date</label>
                                        <input
                                            type="date"
                                            id="birth_date"
                                            name="birth_date"
                                            className="form-input"
                                            value={formData.birth_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            name="is_approved"
                                            checked={formData.is_approved}
                                            onChange={handleInputChange}
                                        />
                                        Approved
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <span className="loading-spinner" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Person'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonsPage;
