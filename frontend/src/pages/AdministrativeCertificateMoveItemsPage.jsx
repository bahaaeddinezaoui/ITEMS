import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
    administrativeCertificateService,
    assetService,
    attributionOrderService,
    locationService,
    stockItemService,
    consumableService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdministrativeCertificateMoveItemsPage = () => {
    const { user } = useAuth();
    const isAssetResponsible = user?.roles?.some(
        (role) => role.role_code === 'asset_responsible' || role.role_code === 'it_bureau_chief'
    );

    const { certificateId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [certificate, setCertificate] = useState(null);
    const [assets, setAssets] = useState([]);
    const [included, setIncluded] = useState(null);
    const [locations, setLocations] = useState([]);

    const [destinationsByKey, setDestinationsByKey] = useState({});
    const [submittingKey, setSubmittingKey] = useState(null);

    const [bulkDestinationId, setBulkDestinationId] = useState('');
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
    const [bulkErrors, setBulkErrors] = useState([]);

    const isFullySigned = useMemo(() => {
        const c = certificate;
        if (!c) return false;
        return !!(
            c.is_signed_by_warehouse_storage_magaziner &&
            c.is_signed_by_warehouse_storage_accountant &&
            c.is_signed_by_warehouse_storage_marketer &&
            c.is_signed_by_warehouse_it_chief &&
            c.is_signed_by_warehouse_leader
        );
    }, [certificate]);

    const orderId = certificate?.attribution_order;

    const loadAll = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const cert = await administrativeCertificateService.getById(certificateId);
            setCertificate(cert);

            const [locs, assetsResp] = await Promise.all([
                locationService.getAll(),
                cert?.attribution_order
                    ? assetService.getAll({ attribution_order: cert.attribution_order })
                    : Promise.resolve([]),
            ]);

            const locList = Array.isArray(locs?.results) ? locs.results : Array.isArray(locs) ? locs : [];
            setLocations(locList);

            const assetList = Array.isArray(assetsResp?.results)
                ? assetsResp.results
                : Array.isArray(assetsResp)
                  ? assetsResp
                  : [];
            setAssets(assetList);

            if (cert?.attribution_order) {
                const inc = await attributionOrderService.getIncludedItems(cert.attribution_order);
                setIncluded(inc || null);
            } else {
                setIncluded(null);
            }
        } catch (e) {
            setError('Failed to load certificate items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAssetResponsible) return;
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAssetResponsible, certificateId]);

    const allLocationOptions = useMemo(() => {
        return (locations || []).map((l) => ({ id: l.location_id, name: l.location_name }));
    }, [locations]);

    const includedStockItems = useMemo(() => {
        if (!included) return [];
        return Array.isArray(included.stock_items) ? included.stock_items : [];
    }, [included]);

    const accessoryStockItems = useMemo(() => {
        if (!included) return [];
        return Array.isArray(included.accessory_stock_items) ? included.accessory_stock_items : [];
    }, [included]);

    const includedConsumables = useMemo(() => {
        if (!included) return [];
        return Array.isArray(included.consumables) ? included.consumables : [];
    }, [included]);

    const accessoryConsumables = useMemo(() => {
        if (!included) return [];
        return Array.isArray(included.accessory_consumables) ? included.accessory_consumables : [];
    }, [included]);

    const setDestination = (key, value) => {
        setDestinationsByKey((prev) => ({ ...prev, [key]: value }));
    };

    const bulkItems = useMemo(() => {
        const list = [];
        (assets || []).forEach((a) => list.push({ kind: 'asset', id: a.asset_id }));
        (includedStockItems || []).forEach((s) => list.push({ kind: 'stock_item', id: s.id }));
        (accessoryStockItems || []).forEach((s) => list.push({ kind: 'stock_item', id: s.id }));
        (includedConsumables || []).forEach((c) => list.push({ kind: 'consumable', id: c.id }));
        (accessoryConsumables || []).forEach((c) => list.push({ kind: 'consumable', id: c.id }));
        return list;
    }, [
        assets,
        includedStockItems,
        accessoryStockItems,
        includedConsumables,
        accessoryConsumables,
    ]);

    const handleBulkMove = async () => {
        if (!isFullySigned) return;
        if (!bulkDestinationId) return;

        const destination_location_id = bulkDestinationId;
        const items = bulkItems;

        setBulkSubmitting(true);
        setBulkErrors([]);
        setError('');
        setSuccess('');
        setBulkProgress({ done: 0, total: items.length });

        let anySuccess = false;

        try {
            for (let i = 0; i < items.length; i += 1) {
                const it = items[i];
                try {
                    if (it.kind === 'asset') {
                        await assetService.move(it.id, { destination_location_id });
                        anySuccess = true;
                    } else if (it.kind === 'stock_item') {
                        await stockItemService.move(it.id, { destination_location_id });
                        anySuccess = true;
                    } else if (it.kind === 'consumable') {
                        await consumableService.move(it.id, { destination_location_id });
                        anySuccess = true;
                    }
                } catch (e) {
                    const msg = e?.response?.data?.error || 'Failed';
                    setBulkErrors((prev) => [...prev, `${it.kind} #${it.id}: ${msg}`]);
                } finally {
                    setBulkProgress({ done: i + 1, total: items.length });
                }
            }

            if (anySuccess && certificate?.administrative_certificate_id && !certificate?.are_items_moved) {
                try {
                    await administrativeCertificateService.patch(certificate.administrative_certificate_id, {
                        are_items_moved: true,
                    });
                    setCertificate((prev) => (prev ? { ...prev, are_items_moved: true } : prev));
                } catch (e) {
                    // ignore
                }
            }

            await loadAll();
            setSuccess('Bulk move finished');
        } finally {
            setBulkSubmitting(false);
        }
    };

    const doMove = async ({ kind, id }) => {
        const key = `${kind}:${id}`;
        const destination_location_id = destinationsByKey[key];
        if (!destination_location_id) return;

        setSubmittingKey(key);
        setError('');
        setSuccess('');
        try {
            if (kind === 'asset') {
                await assetService.move(id, { destination_location_id });
            } else if (kind === 'stock_item') {
                await stockItemService.move(id, { destination_location_id });
            } else if (kind === 'consumable') {
                await consumableService.move(id, { destination_location_id });
            }

            if (certificate?.administrative_certificate_id && !certificate?.are_items_moved) {
                try {
                    await administrativeCertificateService.patch(certificate.administrative_certificate_id, {
                        are_items_moved: true,
                    });
                    setCertificate((prev) => (prev ? { ...prev, are_items_moved: true } : prev));
                } catch (e) {
                    // ignore
                }
            }

            setSuccess(`${kind} #${id} moved`);
            await loadAll();
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to move item');
        } finally {
            setSubmittingKey(null);
        }
    };

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">Loading...</div>;

    if (!certificate) {
        return (
            <div className="page-container">
                <div className="alert alert-error">Certificate not found.</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Move Items (Administrative Certificate)</h1>
                    <p className="page-subtitle">
                        Certificate #{certificate.administrative_certificate_id} | Order #{orderId || '-'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/dashboard/administrative-certificates')}
                    >
                        Back
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={loadAll}>
                        Refresh
                    </button>
                </div>
            </div>

            {!isFullySigned && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    This certificate is not fully signed yet.
                </div>
            )}

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                    {success}
                </div>
            )}

            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Bulk Move</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="form-input"
                            value={bulkDestinationId}
                            onChange={(e) => setBulkDestinationId(e.target.value)}
                            style={{ minWidth: 280 }}
                        >
                            <option value="">Select destination location</option>
                            {allLocationOptions.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name || `#${l.id}`}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!isFullySigned || bulkSubmitting || !bulkDestinationId || bulkItems.length === 0}
                            onClick={handleBulkMove}
                        >
                            {bulkSubmitting ? `Moving... (${bulkProgress.done}/${bulkProgress.total})` : 'Move All Items'}
                        </button>
                        <div style={{ color: 'var(--color-text-secondary)' }}>
                            Total items: {bulkItems.length}
                        </div>
                    </div>

                    {bulkErrors.length > 0 && (
                        <div className="alert alert-error" style={{ marginTop: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Some items failed to move</div>
                            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                {bulkErrors.map((m, idx) => (
                                    <div key={idx}>{m}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Assets</h2>
                </div>
                <div className="card-body">
                    {(assets || []).length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No assets for this order.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Destination</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((a) => {
                                        const key = `asset:${a.asset_id}`;
                                        return (
                                            <tr key={a.asset_id}>
                                                <td>#{a.asset_id}</td>
                                                <td>{a.asset_name || '-'}</td>
                                                <td>{a.asset_status || '-'}</td>
                                                <td>
                                                    <select
                                                        className="form-input"
                                                        value={destinationsByKey[key] || ''}
                                                        onChange={(e) => setDestination(key, e.target.value)}
                                                    >
                                                        <option value="">Select location</option>
                                                        {allLocationOptions.map((l) => (
                                                            <option key={l.id} value={l.id}>
                                                                {l.name || `#${l.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                        onClick={() => doMove({ kind: 'asset', id: a.asset_id })}
                                                    >
                                                        {submittingKey === key ? 'Moving...' : 'Move'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Stock Items</h2>
                </div>
                <div className="card-body">
                    {includedStockItems.length === 0 && accessoryStockItems.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No stock items for this order.</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Included Stock Items</div>
                                {includedStockItems.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>None.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Asset</th>
                                                    <th>Destination</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {includedStockItems.map((s) => {
                                                    const key = `stock_item:${s.id}`;
                                                    return (
                                                        <tr key={`included:${key}`}>
                                                            <td>#{s.id}</td>
                                                            <td>{s.name || '-'}</td>
                                                            <td>{s.status || '-'}</td>
                                                            <td>{s.asset_name ? `${s.asset_name} (#${s.asset_id})` : s.asset_id ? `#${s.asset_id}` : '-'}</td>
                                                            <td>
                                                                <select
                                                                    className="form-input"
                                                                    value={destinationsByKey[key] || ''}
                                                                    onChange={(e) => setDestination(key, e.target.value)}
                                                                >
                                                                    <option value="">Select location</option>
                                                                    {allLocationOptions.map((l) => (
                                                                        <option key={l.id} value={l.id}>
                                                                            {l.name || `#${l.id}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                                    onClick={() => doMove({ kind: 'stock_item', id: s.id })}
                                                                >
                                                                    {submittingKey === key ? 'Moving...' : 'Move'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Accessory Stock Items</div>
                                {accessoryStockItems.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>None.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Asset</th>
                                                    <th>Destination</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {accessoryStockItems.map((s) => {
                                                    const key = `stock_item:${s.id}`;
                                                    return (
                                                        <tr key={`accessory:${key}`}>
                                                            <td>#{s.id}</td>
                                                            <td>{s.name || '-'}</td>
                                                            <td>{s.status || '-'}</td>
                                                            <td>{s.asset_name ? `${s.asset_name} (#${s.asset_id})` : s.asset_id ? `#${s.asset_id}` : '-'}</td>
                                                            <td>
                                                                <select
                                                                    className="form-input"
                                                                    value={destinationsByKey[key] || ''}
                                                                    onChange={(e) => setDestination(key, e.target.value)}
                                                                >
                                                                    <option value="">Select location</option>
                                                                    {allLocationOptions.map((l) => (
                                                                        <option key={l.id} value={l.id}>
                                                                            {l.name || `#${l.id}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                                    onClick={() => doMove({ kind: 'stock_item', id: s.id })}
                                                                >
                                                                    {submittingKey === key ? 'Moving...' : 'Move'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Consumables</h2>
                </div>
                <div className="card-body">
                    {includedConsumables.length === 0 && accessoryConsumables.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No consumables for this order.</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Included Consumables</div>
                                {includedConsumables.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>None.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Asset</th>
                                                    <th>Destination</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {includedConsumables.map((c) => {
                                                    const key = `consumable:${c.id}`;
                                                    return (
                                                        <tr key={`included:${key}`}>
                                                            <td>#{c.id}</td>
                                                            <td>{c.name || '-'}</td>
                                                            <td>{c.status || '-'}</td>
                                                            <td>{c.asset_name ? `${c.asset_name} (#${c.asset_id})` : c.asset_id ? `#${c.asset_id}` : '-'}</td>
                                                            <td>
                                                                <select
                                                                    className="form-input"
                                                                    value={destinationsByKey[key] || ''}
                                                                    onChange={(e) => setDestination(key, e.target.value)}
                                                                >
                                                                    <option value="">Select location</option>
                                                                    {allLocationOptions.map((l) => (
                                                                        <option key={l.id} value={l.id}>
                                                                            {l.name || `#${l.id}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                                    onClick={() => doMove({ kind: 'consumable', id: c.id })}
                                                                >
                                                                    {submittingKey === key ? 'Moving...' : 'Move'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Accessory Consumables</div>
                                {accessoryConsumables.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>None.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Asset</th>
                                                    <th>Destination</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {accessoryConsumables.map((c) => {
                                                    const key = `consumable:${c.id}`;
                                                    return (
                                                        <tr key={`accessory:${key}`}>
                                                            <td>#{c.id}</td>
                                                            <td>{c.name || '-'}</td>
                                                            <td>{c.status || '-'}</td>
                                                            <td>{c.asset_name ? `${c.asset_name} (#${c.asset_id})` : c.asset_id ? `#${c.asset_id}` : '-'}</td>
                                                            <td>
                                                                <select
                                                                    className="form-input"
                                                                    value={destinationsByKey[key] || ''}
                                                                    onChange={(e) => setDestination(key, e.target.value)}
                                                                >
                                                                    <option value="">Select location</option>
                                                                    {allLocationOptions.map((l) => (
                                                                        <option key={l.id} value={l.id}>
                                                                            {l.name || `#${l.id}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                                    onClick={() => doMove({ kind: 'consumable', id: c.id })}
                                                                >
                                                                    {submittingKey === key ? 'Moving...' : 'Move'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdministrativeCertificateMoveItemsPage;
