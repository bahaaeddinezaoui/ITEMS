import { useEffect, useMemo, useState } from 'react';
import { positionRoleMappingService, positionService, roleService } from '../services/api';

const PositionRoleMappingsPage = () => {
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ position: '', role: '' });
    const [query, setQuery] = useState('');

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

    const filteredMappings = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sortedMappings;
        return sortedMappings.filter((m) => {
            const haystack = [
                String(m.position_label ?? ''),
                String(m.position_code ?? ''),
                String(m.position ?? ''),
                String(m.role_label ?? ''),
                String(m.role_code ?? ''),
                String(m.role ?? ''),
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [sortedMappings, query]);

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

    const chipStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.15rem 0.5rem',
        borderRadius: '999px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
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
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>Create link</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            Choose a position, then add one or more roles.
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <form onSubmit={handleCreate} className="form" style={{ maxWidth: 980 }}>
                        <div className="form-grid" style={{ gridTemplateColumns: '2fr 2fr', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                            <select
                                className="form-select"
                                value={form.position}
                                onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                                required
                            >
                                <option value="">Position…</option>
                                {availablePositions.map((p) => (
                                    <option key={p.position_id} value={p.position_id}>
                                        {p.position_label} ({p.position_code})
                                    </option>
                                ))}
                            </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                            <select
                                className="form-select"
                                value={form.role}
                                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                                required
                            >
                                <option value="">Role…</option>
                                {roles.map((r) => (
                                    <option key={r.role_id} value={r.role_id}>
                                        {r.role_label} ({r.role_code})
                                    </option>
                                ))}
                            </select>
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card">
                <div
                    className="card-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>Existing links</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {filteredMappings.length} shown{query.trim() ? ' • search applied' : ''}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="form-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search links…"
                            style={{ width: 320, maxWidth: '100%' }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={fetchData} disabled={loading}>
                            Refresh
                        </button>
                    </div>
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
                        </div>
                    ) : filteredMappings.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No results</h3>
                            <p className="empty-state-text">Try adjusting your search.</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                                gap: 'var(--space-4)',
                            }}
                        >
                            {filteredMappings.map((m) => {
                                const positionTitle = m.position_label || `Position ${m.position}`;
                                const positionMeta = m.position_code ? m.position_code : `#${m.position}`;
                                const roleTitle = m.role_label || m.role_code || `Role ${m.role}`;
                                const roleMeta = m.role_code ? m.role_code : `#${m.role}`;

                                return (
                                    <div
                                        key={`${m.position}-${m.role}`}
                                        className="card"
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: 'var(--color-bg-card)',
                                            border: '1px solid var(--color-border)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{ ...chipStyle, borderColor: 'rgba(99, 102, 241, 0.35)', color: 'var(--color-text-primary)' }}>
                                                        link
                                                    </span>
                                                    <span style={chipStyle}>pos {positionMeta}</span>
                                                    <span style={chipStyle}>role {roleMeta}</span>
                                                </div>

                                                <div style={{ marginTop: '0.65rem', display: 'grid', gap: '0.25rem' }}>
                                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {positionTitle}
                                                    </div>
                                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {roleTitle}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => handleDelete(m.position, m.role)}
                                                    style={{ borderColor: 'rgba(239, 68, 68, 0.45)', color: 'var(--color-error)' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PositionRoleMappingsPage;
