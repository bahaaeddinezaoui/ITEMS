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
import BackButton from '../components/BackButton';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightLeft, RefreshCw, Package, Droplets, MapPin,
    Loader2, AlertCircle, CheckCircle2, Send, Monitor, Hash, Tag,
    FileText, Cpu, Layers, Award, Link2,
} from 'lucide-react';

const STATUS_KEY_MAP = {
    'not_delivered_to_company': 'statusNotDelivered',
    'in_stock': 'statusInStock',
    'assigned': 'statusAssigned',
    'under_internal_maintenance': 'statusUnderInternalMaintenance',
    'sent_to_external_maintenance': 'statusSentToExternalMaintenance',
    'received_by_maintenance_provider': 'statusReceivedByMaintenanceProvider',
    'sent_to_company_after_external_maintenance': 'statusSentToCompanyAfterExternalMaintenance',
    'received_by_company_after_external_maintenance': 'statusReceivedByCompanyAfterExternalMaintenance',
    'failed': 'statusFailed',
    'lost': 'statusLost',
    'stolen': 'statusStolen',
    'irrecoverably_damaged': 'statusIrrecoverablyDamaged',
    'destroyed': 'statusDestroyed',
    'suggested_for_destruction': 'statusSuggestedForDestruction',
    'operational': 'statusOperational',
    'out_of_service': 'statusOutOfService',
};

const translateStatus = (rawStatus, t) => {
    if (!rawStatus) return '';
    const key = STATUS_KEY_MAP[rawStatus.toLowerCase().trim()];
    return key ? t(`poMoveItems.${key}`) : rawStatus;
};

const getBilingualField = (valueAr, valueEn, fallbackValue, lang) => {
    if (lang === 'ar') {
        if (valueAr && valueEn && valueAr !== valueEn) return `${valueAr} (${valueEn})`;
        return valueAr || valueEn || fallbackValue || '';
    }
    if (valueEn && valueAr && valueEn !== valueAr) return `${valueEn} (${valueAr})`;
    return valueEn || valueAr || fallbackValue || '';
};

const getBilingualLocationName = (loc, lang) => {
    if (!loc) return '';
    const name = loc.location_name;
    const nameAr = loc.location_name_ar;
    const nameEn = loc.location_name_en;
    if (lang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || name || '';
    }
    if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
    return nameEn || nameAr || name || '';
};

const getLocationName = (locations, locId, lang) => {
    if (!locId) return null;
    const found = (locations || []).find((l) => l.location_id === Number(locId));
    return found ? getBilingualLocationName(found, lang) : `#${locId}`;
};

const StatusBadge = ({ status, displayStatus }) => {
    if (!status && !displayStatus) return null;
    const s = (status || '').toLowerCase();
    let cls = 'badge badge-info';
    if (s.includes('operational') || s.includes('active') || s.includes('good') || s.includes('functional') || s.includes('in_stock') || s.includes('received_by_company_after_external_maintenance')) cls = 'badge badge-success';
    else if (s.includes('out_of_service') || s.includes('damaged') || s.includes('broken') || s.includes('lost') || s.includes('destroyed')) cls = 'badge badge-error';
    else if (s.includes('maintenance') || s.includes('repair') || s.includes('pending') || s.includes('waiting') || s.includes('not_delivered')) cls = 'badge badge-warning';
    return <span className={cls}>{displayStatus || status}</span>;
};

const AssetCard = ({ asset, locations, allLocationOptions, destination, onSetDestination, onMove, submitting, disabled, t, lang }) => {
    const id = asset.asset_id;
    const displayName = getBilingualField(asset.asset_name_ar, asset.asset_name_en, asset.asset_name, lang) || `#${id}`;
    const status = asset.asset_status;
    const displayStatus = getBilingualField(asset.asset_status_ar, asset.asset_status_en, null, lang) || translateStatus(status, t);
    const key = `asset:${id}`;
    const isSubmitting = submitting === key;
    const currentLocName = asset.current_location
        ? getBilingualLocationName(asset.current_location, lang)
        : getLocationName(locations, asset.current_location_id, lang);

    return (
        <div className="move-item-card">
            <div className="move-item-card-head">
                <div className="move-item-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                    <Monitor size={18} style={{ color: 'var(--color-accent-primary)' }} />
                </div>
                <div className="move-item-card-info">
                    <div className="move-item-card-name">{displayName}</div>
                    <div className="move-item-card-meta">
                        <span className="move-item-card-id">#{id}</span>
                        <StatusBadge status={status} displayStatus={displayStatus} />
                    </div>
                </div>
            </div>
            <div className="move-item-card-body">
                <div className="move-item-card-location">
                    <MapPin size={14} />
                    <span className="move-item-card-location-label">{currentLocName || t('poMoveItems.unassigned')}</span>
                </div>
                <div className="move-item-card-destination">
                    <ArrowRightLeft size={14} className="move-item-card-dest-icon" />
                    <select
                        className="form-input move-item-card-select"
                        value={destination || ''}
                        onChange={(e) => onSetDestination(key, e.target.value)}
                    >
                        <option value="">{t('poMoveItems.selectLocation')}</option>
                        {allLocationOptions.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.displayName || `#${l.id}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                    type="button"
                    className="btn btn-primary move-item-card-btn"
                    disabled={disabled || isSubmitting || !destination}
                    onClick={() => onMove({ kind: 'asset', id })}
                >
                    {isSubmitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                    <span>{isSubmitting ? t('poMoveItems.moving') : t('poMoveItems.move')}</span>
                </button>
            </div>
        </div>
    );
};

const IncludedItemCard = ({ item, kind, subKind, locations, allLocationOptions, destination, onSetDestination, onMove, submitting, disabled, t, lang }) => {
    const id = kind === 'stock_item' ? item.id : item.id;
    const nameField = kind === 'stock_item' ? item.name : item.name;
    const nameFieldAr = kind === 'stock_item' ? item.name_ar : item.name_ar;
    const nameFieldEn = kind === 'stock_item' ? item.name_en : item.name_en;
    const displayName = getBilingualField(nameFieldAr, nameFieldEn, nameField, lang) || `#${id}`;
    const status = item.status;
    const statusAr = kind === 'stock_item' ? item.status_ar : item.status_ar;
    const statusEn = kind === 'stock_item' ? item.status_en : item.status_en;
    const displayStatus = getBilingualField(statusAr, statusEn, null, lang) || translateStatus(status, t);
    const key = `${kind}:${id}`;
    const isSubmitting = submitting === key;
    const Icon = kind === 'stock_item' ? Package : Droplets;
    const currentLocName = item.current_location
        ? getBilingualLocationName(item.current_location, lang)
        : getLocationName(locations, item.current_location_id, lang);

    const modelInfo = {
        model: getBilingualField(item.model_name_ar, item.model_name_en, item.model_name, lang),
        type: getBilingualField(item.type_label_ar, item.type_label_en, item.type_label, lang),
        brand: getBilingualField(item.brand_name_ar, item.brand_name_en, item.brand_name, lang),
    };

    const assetLabel = item.asset_name
        ? `${getBilingualField(item.asset_name_ar, item.asset_name_en, item.asset_name, lang)} (#${item.asset_id})`
        : item.asset_id ? `#${item.asset_id}` : null;

    const serialNumber = kind === 'stock_item' ? item.serial_number || item.stock_item_serial_number : item.serial_number || item.consumable_serial_number;
    const inventoryNumber = kind === 'stock_item' ? item.inventory_number || item.stock_item_inventory_number : item.inventory_number || item.consumable_inventory_number;
    const serviceTag = kind === 'consumable' ? (item.service_tag || item.consumable_service_tag) : null;

    return (
        <div className="move-item-card">
            <div className="move-item-card-head">
                <div className={`move-item-card-icon${subKind === 'accessory' ? ' move-item-card-icon-accessory' : ''}`}>
                    <Icon size={18} />
                </div>
                <div className="move-item-card-info">
                    <div className="move-item-card-name">{displayName}</div>
                    <div className="move-item-card-meta">
                        <span className="move-item-card-id">#{id}</span>
                        <StatusBadge status={status} displayStatus={displayStatus} />
                        {subKind === 'accessory' && (
                            <span className="badge badge-info" style={{ fontSize: 'var(--font-size-xs)' }}>{t('certMoveItems.accessoryBadge')}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="move-item-card-details">
                {modelInfo.type && (
                    <div className="move-item-card-detail-row">
                        <Layers size={13} />
                        <span className="move-item-card-detail-label">{t('poMoveItems.type')}</span>
                        <span className="move-item-card-detail-value">{modelInfo.type}</span>
                    </div>
                )}
                {modelInfo.brand && (
                    <div className="move-item-card-detail-row">
                        <Award size={13} />
                        <span className="move-item-card-detail-label">{t('poMoveItems.brand')}</span>
                        <span className="move-item-card-detail-value">{modelInfo.brand}</span>
                    </div>
                )}
                {modelInfo.model && (
                    <div className="move-item-card-detail-row">
                        <Cpu size={13} />
                        <span className="move-item-card-detail-label">{t('poMoveItems.model')}</span>
                        <span className="move-item-card-detail-value">{modelInfo.model}</span>
                    </div>
                )}
                {assetLabel && (
                    <div className="move-item-card-detail-row">
                        <Link2 size={13} />
                        <span className="move-item-card-detail-label">{t('certMoveItems.asset')}</span>
                        <span className="move-item-card-detail-value">{assetLabel}</span>
                    </div>
                )}
                {serialNumber && (
                    <div className="move-item-card-detail-row">
                        <Hash size={13} />
                        <span className="move-item-card-detail-label">{t('poMoveItems.serialNumber')}</span>
                        <span className="move-item-card-detail-value">{serialNumber}</span>
                    </div>
                )}
                {inventoryNumber && (
                    <div className="move-item-card-detail-row">
                        <FileText size={13} />
                        <span className="move-item-card-detail-label">{t('poMoveItems.inventoryNumber')}</span>
                        <span className="move-item-card-detail-value">{inventoryNumber}</span>
                    </div>
                )}
                {serviceTag && (
                    <div className="move-item-card-detail-row">
                        <Tag size={13} />
                        <span className="move-item-card-detail-label">{t('poMoveItems.serviceTag')}</span>
                        <span className="move-item-card-detail-value">{serviceTag}</span>
                    </div>
                )}
            </div>
            <div className="move-item-card-body">
                <div className="move-item-card-location">
                    <MapPin size={14} />
                    <span className="move-item-card-location-label">{currentLocName || t('poMoveItems.unassigned')}</span>
                </div>
                <div className="move-item-card-destination">
                    <ArrowRightLeft size={14} className="move-item-card-dest-icon" />
                    <select
                        className="form-input move-item-card-select"
                        value={destination || ''}
                        onChange={(e) => onSetDestination(key, e.target.value)}
                    >
                        <option value="">{t('poMoveItems.selectLocation')}</option>
                        {allLocationOptions.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.displayName || `#${l.id}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                    type="button"
                    className="btn btn-primary move-item-card-btn"
                    disabled={disabled || isSubmitting || !destination}
                    onClick={() => onMove({ kind, id })}
                >
                    {isSubmitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                    <span>{isSubmitting ? t('poMoveItems.moving') : t('poMoveItems.move')}</span>
                </button>
            </div>
        </div>
    );
};

const AdministrativeCertificateMoveItemsPage = () => {
    const { user, isSuperuser } = useAuth();
    const isAssetResponsible = isSuperuser || user?.roles?.some(
        (role) => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief'
    );

    const { certificateId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

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
        return (locations || []).map((l) => ({
            id: l.location_id,
            name: l.location_name,
            displayName: getBilingualLocationName(l, lang),
        }));
    }, [locations, lang]);

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
                    const kindLabel = it.kind === 'asset' ? t('poMoveItems.kindAsset') : (it.kind === 'stock_item' ? t('poMoveItems.kindStockItem') : t('poMoveItems.kindConsumable'));
                    setBulkErrors((prev) => [...prev, `${kindLabel} #${it.id}: ${msg}`]);
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

            const kindLabel = kind === 'asset' ? t('poMoveItems.kindAsset') : (kind === 'stock_item' ? t('poMoveItems.kindStockItem') : t('poMoveItems.kindConsumable'));
            setSuccess(t('poMoveItems.itemMoved', { kind: kindLabel, id }));
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

    if (!loading && error) {
        return (
            <div className="page-container">
                <div className="move-items-blocked">
                    <AlertCircle size={40} />
                    <div className="move-items-blocked-text">{error}</div>
                    <button type="button" className="btn btn-secondary" onClick={loadAll}>
                        <RefreshCw size={16} />
                        <span>{t('common.refresh')}</span>
                    </button>
                    <BackButton onClick={() => navigate('/dashboard/administrative-certificates')} label={t('certMoveItems.backToCertificates')} />
                </div>
            </div>
        );
    }

    if (!loading && !error && !isFullySigned) {
        return (
            <div className="page-container">
                <div className="move-items-blocked">
                    <AlertCircle size={40} />
                    <div className="move-items-blocked-text">{t('certMoveItems.notFullySigned')}</div>
                    <BackButton onClick={() => navigate('/dashboard/administrative-certificates')} label={t('certMoveItems.backToCertificates')} />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-container move-items-page" style={{ padding: 'var(--space-6)' }}>
                <SkeletonListRows count={8} />
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="page-container">
                <div className="move-items-blocked">
                    <AlertCircle size={40} />
                    <div className="move-items-blocked-text">{t('certMoveItems.notFound')}</div>
                    <BackButton onClick={() => navigate('/dashboard/administrative-certificates')} label={t('certMoveItems.backToCertificates')} />
                </div>
            </div>
        );
    }

    const assetCount = (assets || []).length;
    const stockCount = includedStockItems.length + accessoryStockItems.length;
    const consCount = includedConsumables.length + accessoryConsumables.length;

    return (
        <div className="page-container move-items-page">
            <div className="move-items-hero">
                <div className="move-items-hero-main">
                    <div className="move-items-hero-kicker">
                        <ArrowRightLeft size={14} />
                        <span>{t('certMoveItems.title')}</span>
                    </div>
                    <h1 className="move-items-hero-title">
                        {t('certMoveItems.certificate')} #{certificate.administrative_certificate_id}
                        {orderId ? <span className="move-items-hero-code"> | {t('purchaseOrderDetails.order')} #{orderId}</span> : ''}
                    </h1>
                    <div className="move-items-hero-stats">
                        <div className="move-items-hero-stat">
                            <Monitor size={16} />
                            <span className="move-items-hero-stat-val">{assetCount}</span>
                            <span className="move-items-hero-stat-lbl">{t('certMoveItems.assets')}</span>
                        </div>
                        <div className="move-items-hero-stat">
                            <Package size={16} />
                            <span className="move-items-hero-stat-val">{stockCount}</span>
                            <span className="move-items-hero-stat-lbl">{t('poMoveItems.stockItems')}</span>
                        </div>
                        <div className="move-items-hero-stat">
                            <Droplets size={16} />
                            <span className="move-items-hero-stat-val">{consCount}</span>
                            <span className="move-items-hero-stat-lbl">{t('poMoveItems.consumables')}</span>
                        </div>
                        <div className="move-items-hero-stat move-items-hero-stat-total">
                            <ArrowRightLeft size={16} />
                            <span className="move-items-hero-stat-val">{bulkItems.length}</span>
                            <span className="move-items-hero-stat-lbl">{t('poMoveItems.totalItems')}</span>
                        </div>
                    </div>
                </div>
                <div className="move-items-hero-actions">
                    <BackButton onClick={() => navigate('/dashboard/administrative-certificates')} />
                    <button type="button" className="dashboard-quick-btn" onClick={loadAll}>
                        <RefreshCw size={16} />
                        <span>{t('common.refresh')}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="move-items-alert move-items-alert-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="move-items-alert move-items-alert-success">
                    <CheckCircle2 size={18} />
                    <span>{success}</span>
                </div>
            )}

            <div className="move-items-bulk-bar">
                <div className="move-items-bulk-left">
                    <ArrowRightLeft size={18} />
                    <span className="move-items-bulk-label">{t('poMoveItems.bulkMove')}</span>
                </div>
                <div className="move-items-bulk-right">
                    <select
                        className="form-input move-items-bulk-select"
                        value={bulkDestinationId}
                        onChange={(e) => setBulkDestinationId(e.target.value)}
                    >
                        <option value="">{t('poMoveItems.selectDestination')}</option>
                        {allLocationOptions.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.displayName || `#${l.id}`}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="btn btn-primary move-items-bulk-btn"
                        disabled={!isFullySigned || bulkSubmitting || !bulkDestinationId || bulkItems.length === 0}
                        onClick={handleBulkMove}
                    >
                        {bulkSubmitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                        <span>{bulkSubmitting ? t('poMoveItems.movingProgress', { done: bulkProgress.done, total: bulkProgress.total }) : t('poMoveItems.moveAllItems')}</span>
                    </button>
                </div>
            </div>

            {bulkErrors.length > 0 && (
                <div className="move-items-alert move-items-alert-error">
                    <AlertCircle size={18} />
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('poMoveItems.someItemsFailed')}</div>
                        <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                            {bulkErrors.map((m, idx) => (
                                <div key={idx} style={{ fontSize: 'var(--font-size-sm)' }}>{m}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {assetCount > 0 && (
                <section className="move-items-section">
                    <div className="move-items-section-head">
                        <div className="move-items-section-title">
                            <Monitor size={18} />
                            <span>{t('certMoveItems.assets')}</span>
                            <span className="move-items-section-count">{assetCount}</span>
                        </div>
                    </div>
                    <div className="move-items-grid">
                        {assets.map((a) => {
                            const key = `asset:${a.asset_id}`;
                            return (
                                <AssetCard
                                    key={key}
                                    asset={a}
                                    locations={locations}
                                    allLocationOptions={allLocationOptions}
                                    destination={destinationsByKey[key]}
                                    onSetDestination={setDestination}
                                    onMove={doMove}
                                    submitting={submittingKey}
                                    disabled={!isFullySigned}
                                    t={t}
                                    lang={lang}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {includedStockItems.length > 0 && (
                <section className="move-items-section">
                    <div className="move-items-section-head">
                        <div className="move-items-section-title">
                            <Package size={18} />
                            <span>{t('certMoveItems.includedStockItems')}</span>
                            <span className="move-items-section-count">{includedStockItems.length}</span>
                        </div>
                    </div>
                    <div className="move-items-grid">
                        {includedStockItems.map((s) => {
                            const key = `stock_item:${s.id}`;
                            return (
                                <IncludedItemCard
                                    key={`included:${key}`}
                                    item={s}
                                    kind="stock_item"
                                    subKind="included"
                                    locations={locations}
                                    allLocationOptions={allLocationOptions}
                                    destination={destinationsByKey[key]}
                                    onSetDestination={setDestination}
                                    onMove={doMove}
                                    submitting={submittingKey}
                                    disabled={!isFullySigned}
                                    t={t}
                                    lang={lang}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {accessoryStockItems.length > 0 && (
                <section className="move-items-section">
                    <div className="move-items-section-head">
                        <div className="move-items-section-title">
                            <Package size={18} />
                            <span>{t('certMoveItems.accessoryStockItems')}</span>
                            <span className="move-items-section-count">{accessoryStockItems.length}</span>
                        </div>
                    </div>
                    <div className="move-items-grid">
                        {accessoryStockItems.map((s) => {
                            const key = `stock_item:${s.id}`;
                            return (
                                <IncludedItemCard
                                    key={`accessory:${key}`}
                                    item={s}
                                    kind="stock_item"
                                    subKind="accessory"
                                    locations={locations}
                                    allLocationOptions={allLocationOptions}
                                    destination={destinationsByKey[key]}
                                    onSetDestination={setDestination}
                                    onMove={doMove}
                                    submitting={submittingKey}
                                    disabled={!isFullySigned}
                                    t={t}
                                    lang={lang}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {includedConsumables.length > 0 && (
                <section className="move-items-section">
                    <div className="move-items-section-head">
                        <div className="move-items-section-title">
                            <Droplets size={18} />
                            <span>{t('certMoveItems.includedConsumables')}</span>
                            <span className="move-items-section-count">{includedConsumables.length}</span>
                        </div>
                    </div>
                    <div className="move-items-grid">
                        {includedConsumables.map((c) => {
                            const key = `consumable:${c.id}`;
                            return (
                                <IncludedItemCard
                                    key={`included:${key}`}
                                    item={c}
                                    kind="consumable"
                                    subKind="included"
                                    locations={locations}
                                    allLocationOptions={allLocationOptions}
                                    destination={destinationsByKey[key]}
                                    onSetDestination={setDestination}
                                    onMove={doMove}
                                    submitting={submittingKey}
                                    disabled={!isFullySigned}
                                    t={t}
                                    lang={lang}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {accessoryConsumables.length > 0 && (
                <section className="move-items-section">
                    <div className="move-items-section-head">
                        <div className="move-items-section-title">
                            <Droplets size={18} />
                            <span>{t('certMoveItems.accessoryConsumables')}</span>
                            <span className="move-items-section-count">{accessoryConsumables.length}</span>
                        </div>
                    </div>
                    <div className="move-items-grid">
                        {accessoryConsumables.map((c) => {
                            const key = `consumable:${c.id}`;
                            return (
                                <IncludedItemCard
                                    key={`accessory:${key}`}
                                    item={c}
                                    kind="consumable"
                                    subKind="accessory"
                                    locations={locations}
                                    allLocationOptions={allLocationOptions}
                                    destination={destinationsByKey[key]}
                                    onSetDestination={setDestination}
                                    onMove={doMove}
                                    submitting={submittingKey}
                                    disabled={!isFullySigned}
                                    t={t}
                                    lang={lang}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {assetCount === 0 && stockCount === 0 && consCount === 0 && (
                <div className="empty-state">
                    <Package className="empty-state-icon" size={48} />
                    <div className="empty-state-title">{t('poMoveItems.noItemsToMove')}</div>
                </div>
            )}
        </div>
    );
};

export default AdministrativeCertificateMoveItemsPage;
