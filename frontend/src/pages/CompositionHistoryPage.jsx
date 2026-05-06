import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Package, Box, Layers } from 'lucide-react';
import { assetService, stockItemService, consumableService } from '../services/api';
import { SkeletonListRows } from '../components/SkeletonCard';
import BackButton from '../components/BackButton';

const ENTITY_CONFIG = {
    asset: {
        service: assetService,
        idField: 'asset_id',
        nameField: 'asset_name',
        inventoryField: 'asset_inventory_number',
        tPrefix: 'assets',
        backPath: (id, params) => `/dashboard/assets/instances?typeId=${params.get('typeId') || ''}&modelId=${params.get('modelId') || ''}`,
        icon: Box,
    },
    'stock-item': {
        service: stockItemService,
        idField: 'stock_item_id',
        nameField: 'stock_item_name',
        inventoryField: 'stock_item_inventory_number',
        tPrefix: 'stockItems',
        backPath: () => '/dashboard/stock-items/instances',
        icon: Package,
    },
    consumable: {
        service: consumableService,
        idField: 'consumable_id',
        nameField: 'consumable_name',
        inventoryField: 'consumable_inventory_number',
        tPrefix: 'consumables',
        backPath: () => '/dashboard/consumables/instances',
        icon: Layers,
    },
};

const getEntityTypeFromPath = (pathname) => {
    if (pathname.includes('/assets/instances/')) return 'asset';
    if (pathname.includes('/stock-items/instances/')) return 'stock-item';
    if (pathname.includes('/consumables/instances/')) return 'consumable';
    return null;
};

const CompositionHistoryPage = () => {
    const { itemId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const entityType = getEntityTypeFromPath(location.pathname);
    const config = ENTITY_CONFIG[entityType];
    const Icon = config?.icon || Box;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState(null);
    const [itemName, setItemName] = useState('');
    const [itemInventory, setItemInventory] = useState('');

    useEffect(() => {
        if (!config || !itemId) return;
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await config.service.getCompositionHistory(itemId);
                setHistory(data);
                // Extract item name from the first history entry if available
                if (entityType === 'asset') {
                    const si = data?.stock_items?.[0];
                    const co = data?.consumables?.[0];
                    setItemName(si?.asset_name || co?.asset_name || '');
                    setItemInventory(si?.asset_inventory_number || co?.asset_inventory_number || '');
                } else {
                    const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
                    const idKey = entityType === 'stock-item' ? 'stock_item_name' : 'consumable_name';
                    const invKey = entityType === 'stock-item' ? 'stock_item_inventory_number' : 'consumable_inventory_number';
                    setItemName(first?.[idKey] || '');
                    setItemInventory(first?.[invKey] || '');
                }
            } catch (err) {
                setError(err?.message || t('compositionHistory.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [entityType, itemId]);

    if (!config) {
        return (
            <div className="empty-state">
                <p>{t('compositionHistory.invalidEntity')}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>{t('common.back')}</button>
            </div>
        );
    }

    const tp = config.tPrefix;
    const backPath = config.backPath(itemId, searchParams);

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : undefined) : '—';

    const renderAssetHistory = () => {
        if (!history || (history.stock_items?.length === 0 && history.consumables?.length === 0)) {
            return <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>{t(`${tp}.noCompositionHistory`)}</div>;
        }
        return (
            <>
                {history.stock_items?.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Package size={16} /> {t('assets.stockItemHistory')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {history.stock_items.map((h) => (
                                <div key={`si-${h.id}`} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-card)',
                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            {h.stock_item_name || `#${h.stock_item_id}`}
                                            {h.is_current && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '12px' }}>({t('assets.currentComposition')})</span>}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                            {t('assets.inventoryNumber')}: {h.stock_item_inventory_number || '—'} • {t('assets.startDate')}: {formatDate(h.start_datetime)} • {t('assets.endDate')}: {formatDate(h.end_datetime)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {history.consumables?.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Layers size={16} /> {t('assets.consumableHistory')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {history.consumables.map((h) => (
                                <div key={`c-${h.id}`} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-card)',
                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            {h.consumable_name || `#${h.consumable_id}`}
                                            {h.is_current && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '12px' }}>({t('assets.currentComposition')})</span>}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                            {t('assets.inventoryNumber')}: {h.consumable_inventory_number || '—'} • {t('assets.startDate')}: {formatDate(h.start_datetime)} • {t('assets.endDate')}: {formatDate(h.end_datetime)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderSimpleHistory = () => {
        if (!history || history.length === 0) {
            return <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>{t(`${tp}.noCompositionHistory`)}</div>;
        }
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {history.map((h) => (
                    <div key={h.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-card)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                    }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                {h.asset_name || `#${h.asset_id}`}
                                {h.is_current && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '12px' }}>({t(`${tp}.currentComposition`)})</span>}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                {t(`${tp}.inventoryNo`)}: {h.asset_inventory_number || '—'} • {t(`${tp}.startDate`)}: {formatDate(h.start_datetime)} • {t(`${tp}.endDate`)}: {formatDate(h.end_datetime)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Clock size={22} style={{ color: 'var(--color-accent-primary)' }} />
                            {t('compositionHistory.title')}
                        </h1>
                        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Icon size={14} />
                            {itemName || `#${itemId}`}
                            {itemInventory && <span style={{ color: 'var(--color-text-muted)' }}>• {itemInventory}</span>}
                        </p>
                    </div>
                    <BackButton onClick={() => navigate(backPath)} />
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{t(`${tp}.compositionHistory`)}</h2>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                    {loading ? (
                        <SkeletonListRows count={4} />
                    ) : entityType === 'asset' ? (
                        renderAssetHistory()
                    ) : (
                        renderSimpleHistory()
                    )}
                </div>
            </div>
        </>
    );
};

export default CompositionHistoryPage;
