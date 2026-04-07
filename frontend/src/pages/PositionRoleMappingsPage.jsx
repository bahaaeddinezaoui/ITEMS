import { useEffect, useMemo, useState } from 'react';
import { positionRoleMappingService, positionService, roleService } from '../services/api';

const PositionRoleMappingsPage = () => {
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ position: '', role: '', source: 'manual' });

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [positionsData, rolesData, mappingsData] = await Promise.all([
                positionService.getAll(),
                roleService.getAll(),
                positionRoleMappingService.getAll(),
            ]);
            setPositions(Array.isArray(positionsData) ? positionsData : []);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setMappings(Array.isArray(mappingsData) ? mappingsData : []);
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const sortedMappings = useMemo(() => {
        return [...mappings].sort((a, b) => {
            const posA = String(a.position_label || '').toLowerCase();
            const posB = String(b.position_label || '').toLowerCase();
            if (posA !== posB) return posA.localeCompare(posB);
            const roleA = String(a.role_label || '').toLowerCase();
            const roleB = String(b.role_label || '').toLowerCase();
            return roleA.localeCompare(roleB);
        });
    }, [mappings]);

    const availablePositions = useMemo(() => {
        const mappedPositionIds = new Set((mappings || []).map((m) => Number(m.position)));
        return (positions || []).filter((p) => !mappedPositionIds.has(Number(p.position_id)));
    }, [positions, mappings]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.position || !form.role) return;
        setSaving(true);
        setError('');
        try {
            await positionRoleMappingService.create({
                position: Number(form.position),
                role: Number(form.role),
                source: form.source || 'manual',
            });
            setForm((prev) => ({ ...prev, role: '' }));
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to create link');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (positionId, roleId) => {
        if (!window.confirm('Delete this position-role link?')) return;
        setError('');
        try {
            await positionRoleMappingService.delete(positionId, roleId);
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to delete link');
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Position-Role Links</h1>
                <p className="page-subtitle">Define which roles are linked to each position.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <h2 className="card-title">Create Link</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleCreate} className="form" style={{ maxWidth: 760 }}>
                        <div className="form-group">
                            <label className="form-label">Position</label>
                            <select
                                className="form-select"
                                value={form.position}
                                onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                                required
                            >
                                <option value="">Select position...</option>
                                {availablePositions.map((p) => (
                                    <option key={p.position_id} value={p.position_id}>
                                        {p.position_label} ({p.position_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                className="form-select"
                                value={form.role}
                                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                                required
                            >
                                <option value="">Select role...</option>
                                {roles.map((r) => (
                                    <option key={r.role_id} value={r.role_id}>
                                        {r.role_label} ({r.role_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Source</label>
                            <input
                                className="form-input"
                                value={form.source}
                                onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                                maxLength={32}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Add Link'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Existing Links</h2>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-4)' }}>Loading...</div>
                    ) : sortedMappings.length === 0 ? (
                        <div style={{ padding: 'var(--space-4)' }}>No links found.</div>
                    ) : (
                        sortedMappings.map((m, idx) => (
                            <div
                                key={`${m.position}-${m.role}`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 140px 120px',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    borderBottom: idx < sortedMappings.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    alignItems: 'center',
                                }}
                            >
                                <div>{m.position_label || `Position ${m.position}`}</div>
                                <div>{m.role_label || m.role_code || `Role ${m.role}`}</div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    {m.source || 'manual'}
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleDelete(m.position, m.role)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#c33',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default PositionRoleMappingsPage;
