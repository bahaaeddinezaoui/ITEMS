import { useEffect, useMemo, useState } from 'react';
import { assetService, maintenanceService, maintenanceStepService } from '../services/api';

const AssetMaintenanceHistoryPage = () => {
    const [assets, setAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [stepsByMaintenance, setStepsByMaintenance] = useState({});
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAssets = async () => {
            setLoadingAssets(true);
            setError('');
            try {
                const data = await assetService.getAll();
                setAssets(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to load assets: ' + (err?.message || 'unknown error'));
                setAssets([]);
            } finally {
                setLoadingAssets(false);
            }
        };
        loadAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        const q = (searchQuery || '').trim().toLowerCase();
        if (!q) return [];
        return (assets || []).filter(a => {
            const name = (a.asset_name || '').toLowerCase();
            const inv = (a.asset_inventory_number || '').toLowerCase();
            const sn = (a.asset_serial_number || '').toLowerCase();
            return name.includes(q) || inv.includes(q) || sn.includes(q);
        }).slice(0, 20);
    }, [assets, searchQuery]);

    const loadHistory = async (asset) => {
        if (!asset) return;
        setLoadingHistory(true);
        setError('');
        setMaintenances([]);
        setStepsByMaintenance({});
        try {
            const allMaintenances = await maintenanceService.getAll();
            const forAsset = (Array.isArray(allMaintenances) ? allMaintenances : []).filter(
                m => String(m.asset) === String(asset.asset_id) || String(m.asset_id) === String(asset.asset_id)
            );
            // Fetch steps per maintenance
            const stepsEntries = await Promise.all(
                forAsset.map(async (m) => {
                    try {
                        const steps = await maintenanceStepService.getAll({ maintenance: m.maintenance_id });
                        return [m.maintenance_id, Array.isArray(steps) ? steps : []];
                    } catch {
                        return [m.maintenance_id, []];
                    }
                })
            );
            const stepsMap = {};
            stepsEntries.forEach(([mid, steps]) => { stepsMap[mid] = steps; });
            setMaintenances(forAsset);
            setStepsByMaintenance(stepsMap);
        } catch (err) {
            setError('Failed to load maintenance history: ' + (err?.message || 'unknown error'));
        } finally {
            setLoadingHistory(false);
        }
    };

    const formatDateTime = (dt) => {
        if (!dt) return '-';
        const d = new Date(dt);
        if (Number.isNaN(d.getTime())) return String(dt);
        return d.toLocaleString();
    };

    const getStatusBadge = (status) => {
        if (!status) return 'badge';
        const s = status.toLowerCase();
        if (s.includes('done') || s.includes('completed') || s === 'closed') return 'badge badge-success';
        if (s.includes('fail') || s.includes('cancel')) return 'badge badge-error';
        if (s.includes('progress') || s.includes('start')) return 'badge badge-info';
        if (s.includes('pending') || s.includes('wait')) return 'badge badge-warning';
        return 'badge';
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Asset Maintenance History</h1>
                <p className="page-subtitle">Search by inventory number, serial number, or name</p>
            </div>

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 520 }}>
                    <label className="form-label">Search Asset</label>
                    <input
                        className="form-input"
                        type="text"
                        placeholder="e.g. INV-00123, SN-ABC123, or Dell Latitude"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loadingAssets ? (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>Loading assets...</span>
                </div>
            ) : null}

            {!selectedAsset && filteredAssets.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Matching Assets</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Inventory #</th>
                                    <th>Serial #</th>
                                    <th>Status</th>
                                    <th style={{ width: 1 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.map(a => (
                                    <tr key={a.asset_id}>
                                        <td>{a.asset_name || '-'}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{a.asset_inventory_number || '-'}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{a.asset_serial_number || '-'}</td>
                                        <td><span className={getStatusBadge(a.asset_status)}>{a.asset_status || '-'}</span></td>
                                        <td>
                                            <button className="btn btn-primary" onClick={() => { setSelectedAsset(a); loadHistory(a); }}>
                                                View History
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedAsset && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 className="card-title">
                            History for: {selectedAsset.asset_name || `Asset ${selectedAsset.asset_id}`}
                            {selectedAsset.asset_inventory_number ? (
                                <span style={{ marginLeft: 'var(--space-3)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                                    ({selectedAsset.asset_inventory_number})
                                </span>
                            ) : null}
                        </h2>
                        <button className="btn" onClick={() => { setSelectedAsset(null); setMaintenances([]); setStepsByMaintenance({}); }}>
                            Change Asset
                        </button>
                    </div>
                    {loadingHistory ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <span>Loading maintenance history...</span>
                        </div>
                    ) : error ? (
                        <div className="card-body">
                            <div className="error-message">{error}</div>
                        </div>
                    ) : maintenances.length === 0 ? (
                        <div className="card-body">
                            <div className="empty-state">No maintenances found for this asset.</div>
                        </div>
                    ) : (
                        <div className="card-body">
                            {maintenances.map(m => {
                                const steps = stepsByMaintenance[m.maintenance_id] || [];
                                return (
                                    <div key={m.maintenance_id} className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                        <div className="card-header">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <div>
                                                    <h3 className="card-title" style={{ marginBottom: 0 }}>
                                                        Maintenance #{m.maintenance_id}
                                                    </h3>
                                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                        Start: {formatDateTime(m.start_datetime)} • End: {formatDateTime(m.end_datetime)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className={getStatusBadge(m.maintenance_status)}>{m.maintenance_status || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {steps.length > 0 ? (
                                            <div className="table-container">
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Step</th>
                                                            <th>Status</th>
                                                            <th>Technician</th>
                                                            <th>Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {steps.map((s, idx) => {
                                                            const stepDesc =
                                                                s.maintenance_typical_step_label
                                                                || (s.maintenance_typical_step && typeof s.maintenance_typical_step === 'object'
                                                                    ? (s.maintenance_typical_step.description || `Step ${s.maintenance_step_id}`)
                                                                    : (typeof s.maintenance_typical_step === 'string' ? s.maintenance_typical_step : null))
                                                                || '-';
                                                            const personLabel =
                                                                s.person_name
                                                                || (s.person && typeof s.person === 'object'
                                                                    ? [s.person.first_name, s.person.last_name].filter(Boolean).join(' ').trim() || null
                                                                    : (typeof s.person === 'string' ? s.person : null))
                                                                || '-';
                                                            return (
                                                                <tr key={s.maintenance_step_id || idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>{stepDesc}</td>
                                                                    <td><span className={getStatusBadge(s.maintenance_step_status)}>{s.maintenance_step_status || '-'}</span></td>
                                                                    <td>{personLabel}</td>
                                                                    <td>{s.notes || '-'}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="card-body">
                                                <div className="empty-state">No steps for this maintenance.</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AssetMaintenanceHistoryPage;
