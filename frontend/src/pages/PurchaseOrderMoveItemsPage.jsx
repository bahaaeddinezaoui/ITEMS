import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService, locationService, stockItemService, consumableService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, RefreshCw, Package, Droplets, MapPin, ArrowRightLeft, Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react';

const getBilingualItemName = (item, kind, lang) => {
    const name = kind === 'stock_item' ? item.stock_item_name : item.consumable_name;
    const nameAr = kind === 'stock_item' ? item.stock_item_name_ar : item.consumable_name_ar;
    const nameEn = kind === 'stock_item' ? item.stock_item_name_en : item.consumable_name_en;
    if (lang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || name || '';
    }
    if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
    return nameEn || nameAr || name || '';
};

const getBilingualStatus = (item, kind, lang) => {
    const statusAr = kind === 'stock_item' ? item.stock_item_status_ar : (kind === 'consumable' ? item.consumable_status_ar : item.asset_status_ar);
    const statusEn = kind === 'stock_item' ? item.stock_item_status_en : (kind === 'consumable' ? item.consumable_status_en : item.asset_status_en);
    const rawStatus = kind === 'stock_item' ? item.stock_item_status : (kind === 'consumable' ? item.consumable_status : item.asset_status);
    if (lang === 'ar') {
        if (statusAr && statusEn && statusAr !== statusEn) return `${statusAr} (${statusEn})`;
        return statusAr || statusEn || rawStatus || '';
    }
    if (statusEn && statusAr && statusEn !== statusAr) return `${statusEn} (${statusAr})`;
    return statusEn || statusAr || rawStatus || '';
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
    if (s.includes('operational') || s.includes('active') || s.includes('good') || s.includes('functional') || s.includes('available') || s.includes('in_stock')) cls = 'badge badge-success';
    else if (s.includes('out_of_service') || s.includes('damaged') || s.includes('broken') || s.includes('lost') || s.includes('destroyed')) cls = 'badge badge-error';
    else if (s.includes('maintenance') || s.includes('repair') || s.includes('pending') || s.includes('waiting') || s.includes('not_delivered')) cls = 'badge badge-warning';
    return <span className={cls}>{displayStatus || status}</span>;
};

const ItemCard = ({ item, kind, locations, allLocationOptions, destination, onSetDestination, onMove, submitting, disabled, t, lang }) => {
    const id = kind === 'stock_item' ? item.stock_item_id : item.consumable_id;
    const displayName = getBilingualItemName(item, kind, lang) || `#${id}`;
    const status = kind === 'stock_item' ? item.stock_item_status : item.consumable_status;
    const displayStatus = getBilingualStatus(item, kind, lang);
    const key = `${kind}:${id}`;
    const isSubmitting = submitting === key;
    const Icon = kind === 'stock_item' ? Package : Droplets;
    const currentLocName = item.current_location
        ? getBilingualLocationName(item.current_location, lang)
        : getLocationName(locations, item.current_location_id, lang);

    return (
        <div className="move-item-card">
            <div className="move-item-card-head">
                <div className="move-item-card-icon">
                    <Icon size={18} />
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
    );
};

const PurchaseOrderMoveItemsPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [order, setOrder] = useState(null);
    const [acceptanceReport, setAcceptanceReport] = useState(null);
    const [locations, setLocations] = useState([]);

    const [stockItems, setStockItems] = useState([]);
    const [consumables, setConsumables] = useState([]);

    const [destinationsByKey, setDestinationsByKey] = useState({});
    const [submittingKey, setSubmittingKey] = useState(null);

    const [bulkDestinationId, setBulkDestinationId] = useState('');
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
    const [bulkErrors, setBulkErrors] = useState([]);

    const loadAll = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const [orderData, arData, locs, included] = await Promise.all([
                purchaseOrderService.getById(orderId),
                purchaseOrderService.getAcceptanceReport(orderId),
                locationService.getAll(),
                purchaseOrderService.includedItems(orderId),
            ]);
            setOrder(orderData || null);
            setAcceptanceReport(arData || null);

            const locList = Array.isArray(locs?.results) ? locs.results : Array.isArray(locs) ? locs : [];
            setLocations(locList);

            const stockList = Array.isArray(included?.stock_items) ? included.stock_items : [];
            const consList = Array.isArray(included?.consumables) ? included.consumables : [];

            const uniqStock = [];
            const seenStock = new Set();
            stockList.forEach((s) => {
                const sid = Number(s.stock_item_id);
                if (!sid || Number.isNaN(sid)) return;
                if (seenStock.has(sid)) return;
                seenStock.add(sid);
                uniqStock.push(s);
            });

            const uniqCons = [];
            const seenCons = new Set();
            consList.forEach((c) => {
                const cid = Number(c.consumable_id);
                if (!cid || Number.isNaN(cid)) return;
                if (seenCons.has(cid)) return;
                seenCons.add(cid);
                uniqCons.push(c);
            });

            setStockItems(uniqStock);
            setConsumables(uniqCons);
        } catch (e) {
            setError(e?.response?.data?.error || t('poMoveItems.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        loadAll();
    }, [isStockConsumableResponsible, orderId]);

    const isFullySigned = useMemo(() => {
        const a = acceptanceReport;
        if (!a || !a.exists) return false;
        return !!(
            a.is_signed_by_director_of_administration_and_support
            && a.is_signed_by_protection_and_security_bureau_chief
            && a.is_signed_by_school_headquarter
            && a.is_signed_by_information_technilogy_bureau_chief
            && a.acceptance_report_is_stock_item_and_consumable_responsible
        );
    }, [acceptanceReport]);

    const allLocationOptions = useMemo(() => {
        return (locations || []).map((l) => ({ id: l.location_id, name: l.location_name, displayName: getBilingualLocationName(l, lang) }));
    }, [locations, lang]);

    const setDestination = (key, value) => {
        setDestinationsByKey((prev) => ({ ...prev, [key]: value }));
    };

    const enrichCurrentLocations = async () => {
        try {
            const stockIds = (stockItems || []).map((s) => Number(s.stock_item_id)).filter((x) => x && !Number.isNaN(x));
            const consIds = (consumables || []).map((c) => Number(c.consumable_id)).filter((x) => x && !Number.isNaN(x));

            const [stockLocs, consLocs] = await Promise.all([
                Promise.all(stockIds.map((id) => stockItemService.getCurrentLocation(id).then((d) => [id, d]).catch(() => [id, null]))),
                Promise.all(consIds.map((id) => consumableService.getCurrentLocation(id).then((d) => [id, d]).catch(() => [id, null]))),
            ]);

            const stockLocMap = new Map(stockLocs.map(([id, d]) => [id, { location_id: d?.location_id ?? null, location: d?.location ?? null }]));
            const consLocMap = new Map(consLocs.map(([id, d]) => [id, { location_id: d?.location_id ?? null, location: d?.location ?? null }]));

            setStockItems((prev) => prev.map((s) => {
                const locData = stockLocMap.get(Number(s.stock_item_id));
                return { ...s, current_location_id: locData?.location_id ?? s.current_location_id ?? null, current_location: locData?.location ?? s.current_location ?? null };
            }));
            setConsumables((prev) => prev.map((c) => {
                const locData = consLocMap.get(Number(c.consumable_id));
                return { ...c, current_location_id: locData?.location_id ?? c.current_location_id ?? null, current_location: locData?.location ?? c.current_location ?? null };
            }));
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        if (loading) return;
        enrichCurrentLocations();
    }, [loading, isStockConsumableResponsible]);

    const bulkItems = useMemo(() => {
        const list = [];
        (stockItems || []).forEach((s) => list.push({ kind: 'stock_item', id: s.stock_item_id }));
        (consumables || []).forEach((c) => list.push({ kind: 'consumable', id: c.consumable_id }));
        return list;
    }, [stockItems, consumables]);

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
                    if (it.kind === 'stock_item') {
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

            if (anySuccess) {
                setSuccess(t('poMoveItems.bulkMoveFinished'));
            }
        } finally {
            setBulkSubmitting(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        if (!success) return;
        if (bulkSubmitting) return;
        if (bulkErrors.length > 0) return;
        if (bulkItems.length === 0) return;

        try {
            localStorage.setItem(`po_items_moved_${orderId}`, '1');
        } catch {
            // ignore
        }

        navigate('/dashboard/purchase-orders');
    }, [success, bulkSubmitting, bulkErrors.length, orderId]);

    const doMove = async ({ kind, id }) => {
        const key = `${kind}:${id}`;
        const destination_location_id = destinationsByKey[key];
        if (!destination_location_id) return;

        setSubmittingKey(key);
        setError('');
        setSuccess('');
        try {
            if (kind === 'stock_item') {
                await stockItemService.move(id, { destination_location_id });
            } else if (kind === 'consumable') {
                await consumableService.move(id, { destination_location_id });
            }

            setSuccess(t('poMoveItems.itemMoved', { kind, id }));
        } catch (e) {
            setError(e?.response?.data?.error || t('poMoveItems.moveError'));
        } finally {
            setSubmittingKey(null);
        }
    };

    if (!isStockConsumableResponsible) {
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
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        <ArrowLeft size={16} />
                        <span>{t('poMoveItems.backToPurchaseOrders')}</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!loading && !error && !isFullySigned) {
        return (
            <div className="page-container">
                <div className="move-items-blocked">
                    <AlertCircle size={40} />
                    <div className="move-items-blocked-text">{t('poMoveItems.signatoriesRequired')}</div>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        <ArrowLeft size={16} />
                        <span>{t('poMoveItems.backToPurchaseOrders')}</span>
                    </button>
                </div>
            </div>
        );
    }

    const stockCount = (stockItems || []).length;
    const consCount = (consumables || []).length;

    return (
        <div className="page-container move-items-page">
            <div className="move-items-hero">
                <div className="move-items-hero-main">
                    <div className="move-items-hero-kicker">
                        <ArrowRightLeft size={14} />
                        <span>{t('poMoveItems.title')}</span>
                    </div>
                    <h1 className="move-items-hero-title">
                        {t('purchaseOrderDetails.order')} #{orderId}
                        {order?.purchase_order_code ? <span className="move-items-hero-code"> | {order.purchase_order_code}</span> : ''}
                    </h1>
                    <div className="move-items-hero-stats">
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
                    <button type="button" className="dashboard-quick-btn" onClick={() => navigate('/dashboard/purchase-orders')}>
                        <ArrowLeft size={16} />
                        <span>{t('common.back')}</span>
                    </button>
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

            {loading ? (
                <div className="loading-state">
                    <Loader2 size={24} className="spin-icon" />
                    <span>{t('common.loading')}</span>
                </div>
            ) : (
                <>
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

                    {stockCount > 0 && (
                        <section className="move-items-section">
                            <div className="move-items-section-head">
                                <div className="move-items-section-title">
                                    <Package size={18} />
                                    <span>{t('poMoveItems.stockItems')}</span>
                                    <span className="move-items-section-count">{stockCount}</span>
                                </div>
                            </div>
                            <div className="move-items-grid">
                                {stockItems.map((s) => {
                                    const key = `stock_item:${s.stock_item_id}`;
                                    return (
                                        <ItemCard
                                            key={key}
                                            item={s}
                                            kind="stock_item"
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

                    {consCount > 0 && (
                        <section className="move-items-section">
                            <div className="move-items-section-head">
                                <div className="move-items-section-title">
                                    <Droplets size={18} />
                                    <span>{t('poMoveItems.consumables')}</span>
                                    <span className="move-items-section-count">{consCount}</span>
                                </div>
                            </div>
                            <div className="move-items-grid">
                                {consumables.map((c) => {
                                    const key = `consumable:${c.consumable_id}`;
                                    return (
                                        <ItemCard
                                            key={key}
                                            item={c}
                                            kind="consumable"
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

                    {stockCount === 0 && consCount === 0 && (
                        <div className="empty-state">
                            <Package className="empty-state-icon" size={48} />
                            <div className="empty-state-title">{t('poMoveItems.noItemsToMove')}</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchaseOrderMoveItemsPage;
