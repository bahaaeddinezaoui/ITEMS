import { useEffect, useMemo, useState } from 'react';
import { SkeletonListRows } from '../components/SkeletonCard';
import {
    administrativeCertificateService,
    assetService,
    attributionOrderService,
    locationService,
    stockItemService,
    consumableService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightLeft } from 'lucide-react';

const AdministrativeCertificateMoveItemsPage = () => {
    const { user, isSuperuser } = useAuth();
    const isAssetResponsible = isSuperuser || user?.roles?.some(
        (role) => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief'
    );

    const { certificateId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

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
            setError(t('certMoveItems.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAssetResponsible) return;
        loadAll();
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
                    const msg = e?.response?.data?.error || t('common.failed');
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
            setSuccess(t('poMoveItems.bulkMoveFinished'));
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

            setSuccess(t('poMoveItems.itemMoved', { kind, id }));
            await loadAll();
        } catch (e) {
            setError(e?.response?.data?.error || t('poMoveItems.moveError'));
        } finally {
            setSubmittingKey(null);
        }
    };

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    <SkeletonListRows count={6} />
                </div>
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{t('certMoveItems.notFound')}</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><ArrowRightLeft size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('certMoveItems.title')}</h1>
                    <p className="page-subtitle">
                        {t('certMoveItems.certificate')} #{certificate.administrative_certificate_id} | {t('purchaseOrderDetails.order')} #{orderId || '-'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/dashboard/administrative-certificates')}
                    >
                        {t('common.back')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={loadAll}>
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {!isFullySigned && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {t('certMoveItems.notFullySigned')}
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
                    <h2 className="card-title" style={{ margin: 0 }}>{t('poMoveItems.bulkMove')}</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="form-input"
                            value={bulkDestinationId}
                            onChange={(e) => setBulkDestinationId(e.target.value)}
                            style={{ minWidth: 280 }}
                        >
                            <option value="">{t('poMoveItems.selectDestination')}</option>
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
                            {bulkSubmitting ? t('poMoveItems.movingProgress', { done: bulkProgress.done, total: bulkProgress.total }) : t('poMoveItems.moveAllItems')}
                        </button>
                        <div style={{ color: 'var(--color-text-secondary)' }}>
                            {t('poMoveItems.totalItems')}: {bulkItems.length}
                        </div>
                    </div>

                    {bulkErrors.length > 0 && (
                        <div className="alert alert-error" style={{ marginTop: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('poMoveItems.someItemsFailed')}</div>
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
                    <h2 className="card-title" style={{ margin: 0 }}>{t('certMoveItems.assets')}</h2>
                </div>
                <div className="card-body">
                    {(assets || []).length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('certMoveItems.noAssetsForOrder')}</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>{t('common.id')}</th>
                                        <th>{t('poMoveItems.name')}</th>
                                        <th>{t('common.status')}</th>
                                        <th>{t('poMoveItems.destination')}</th>
                                        <th style={{ textAlign: 'right' }}>{t('poMoveItems.action')}</th>
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
                                                        <option value="">{t('poMoveItems.selectLocation')}</option>
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
                                                        {submittingKey === key ? t('poMoveItems.moving') : t('poMoveItems.move')}
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
                    <h2 className="card-title" style={{ margin: 0 }}>{t('poMoveItems.stockItems')}</h2>
                </div>
                <div className="card-body">
                    {includedStockItems.length === 0 && accessoryStockItems.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('certMoveItems.noStockItemsForOrder')}</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('certMoveItems.includedStockItems')}</div>
                                {includedStockItems.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.none')}</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>{t('common.id')}</th>
                                                    <th>{t('poMoveItems.name')}</th>
                                                    <th>{t('common.status')}</th>
                                                    <th>{t('certMoveItems.asset')}</th>
                                                    <th>{t('poMoveItems.destination')}</th>
                                                    <th style={{ textAlign: 'right' }}>{t('poMoveItems.action')}</th>
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
                                                                    <option value="">{t('poMoveItems.selectLocation')}</option>
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
                                                                    {submittingKey === key ? t('poMoveItems.moving') : t('poMoveItems.move')}
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
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('certMoveItems.accessoryStockItems')}</div>
                                {accessoryStockItems.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.none')}</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>{t('common.id')}</th>
                                                    <th>{t('poMoveItems.name')}</th>
                                                    <th>{t('common.status')}</th>
                                                    <th>{t('certMoveItems.asset')}</th>
                                                    <th>{t('poMoveItems.destination')}</th>
                                                    <th style={{ textAlign: 'right' }}>{t('poMoveItems.action')}</th>
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
                                                                    <option value="">{t('poMoveItems.selectLocation')}</option>
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
                                                                    {submittingKey === key ? t('poMoveItems.moving') : t('poMoveItems.move')}
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
                    <h2 className="card-title" style={{ margin: 0 }}>{t('poMoveItems.consumables')}</h2>
                </div>
                <div className="card-body">
                    {includedConsumables.length === 0 && accessoryConsumables.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('certMoveItems.noConsumablesForOrder')}</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('certMoveItems.includedConsumables')}</div>
                                {includedConsumables.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.none')}</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>{t('common.id')}</th>
                                                    <th>{t('poMoveItems.name')}</th>
                                                    <th>{t('common.status')}</th>
                                                    <th>{t('certMoveItems.asset')}</th>
                                                    <th>{t('poMoveItems.destination')}</th>
                                                    <th style={{ textAlign: 'right' }}>{t('poMoveItems.action')}</th>
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
                                                                    <option value="">{t('poMoveItems.selectLocation')}</option>
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
                                                                    {submittingKey === key ? t('poMoveItems.moving') : t('poMoveItems.move')}
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
                                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('certMoveItems.accessoryConsumables')}</div>
                                {accessoryConsumables.length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.none')}</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>{t('common.id')}</th>
                                                    <th>{t('poMoveItems.name')}</th>
                                                    <th>{t('common.status')}</th>
                                                    <th>{t('certMoveItems.asset')}</th>
                                                    <th>{t('poMoveItems.destination')}</th>
                                                    <th style={{ textAlign: 'right' }}>{t('poMoveItems.action')}</th>
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
                                                                    <option value="">{t('poMoveItems.selectLocation')}</option>
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
                                                                    {submittingKey === key ? t('poMoveItems.moving') : t('poMoveItems.move')}
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
