import { useEffect, useMemo, useState } from 'react';
import { locationInventoryService, locationService } from '../services/api';
import { useTranslation } from 'react-i18next';

const getBilingualName = (nameAr, nameEn, fallbackName, currentLang) => {
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || fallbackName;
    } else {
        if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
        return nameEn || nameAr || fallbackName;
    }
};

const getBilingualTypeLabel = (typeAr, typeEn, fallbackType, currentLang) => {
    if (currentLang === 'ar') {
        return typeAr || typeEn || fallbackType;
    } else {
        return typeEn || typeAr || fallbackType;
    }
};

const StockConsumablesInventoryPage = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inventoryData, setInventoryData] = useState(null);
    const [locations, setLocations] = useState([]);

    const [itemTypeFilter, setItemTypeFilter] = useState(''); // '', 'stock_item', 'consumable'
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const statusOptions = useMemo(() => {
        if (itemTypeFilter === 'stock_item') {
            return [
                { value: 'in_stock', label: t('stockConsumablesInventory.inStock') },
                { value: 'Included with Asset', label: t('stockConsumablesInventory.includedWithAsset') },
                { value: 'not_delivered_to_company', label: t('stockConsumablesInventory.notDelivered') },
                { value: 'suggested_for_destruction', label: t('stockConsumablesInventory.suggestedForDestruction') },
                { value: 'destroyed', label: t('stockConsumablesInventory.destroyed') },
                { value: 'failed', label: t('stockConsumablesInventory.failed') },
            ];
        } else if (itemTypeFilter === 'consumable') {
            return [
                { value: 'in_stock', label: t('stockConsumablesInventory.inStock') },
                { value: 'Included with Asset', label: t('stockConsumablesInventory.includedWithAsset') },
                { value: 'not_delivered_to_company', label: t('stockConsumablesInventory.notDelivered') },
                { value: 'suggested_for_destruction', label: t('stockConsumablesInventory.suggestedForDestruction') },
                { value: 'destroyed', label: t('stockConsumablesInventory.destroyed') },
                { value: 'failed', label: t('stockConsumablesInventory.failed') },
            ];
        }
        return [];
    }, [itemTypeFilter]);

    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            setLocations(Array.isArray(data) ? data : []);
        } catch {
            setLocations([]);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError('');
            const params = {};
            if (itemTypeFilter) params.item_type = itemTypeFilter;
            if (statusFilter) params.status = statusFilter;
            if (locationFilter) params.location_id = locationFilter;
            const data = await locationInventoryService.getInventory(params);
            const filtered = data && data.items
                ? data.items.filter(i => i.item_type === 'stock_item' || i.item_type === 'consumable')
                : [];
            const locations = Array.isArray(data?.locations) ? data.locations : [];
            const summary = {
                total_stock_items: filtered.filter(i => i.item_type === 'stock_item').length,
                total_consumables: filtered.filter(i => i.item_type === 'consumable').length,
            };
            setInventoryData({ items: filtered, locations, summary });
        } catch (err) {
            setError(t('stockConsumablesInventory.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [itemTypeFilter, statusFilter, locationFilter]);

    const filteredItems = useMemo(() => {
        if (!inventoryData?.items) return [];
        if (!searchQuery.trim()) return inventoryData.items;
        const q = searchQuery.toLowerCase();
        return inventoryData.items.filter(item =>
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.inventory_number && item.inventory_number.toLowerCase().includes(q)) ||
            (item.serial_number && item.serial_number.toLowerCase().includes(q)) ||
            (item.model && item.model.toLowerCase().includes(q)) ||
            (item.brand && item.brand.toLowerCase().includes(q)) ||
            (item.type && item.type.toLowerCase().includes(q)) ||
            (item.status && item.status.toLowerCase().includes(q)) ||
            (item.location_name && item.location_name.toLowerCase().includes(q))
        );
    }, [inventoryData, searchQuery]);

    const formatStatusLabel = (value) => {
        if (!value) return '';
        return value
            .split('_')
            .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1) : p)
            .join(' ');
    };

    const getItemTypeIcon = (itemType) => {
        if (itemType === 'stock_item') return '📦';
        if (itemType === 'consumable') return '🧴';
        return '📋';
    };

    const getStatusBadge = (status) => {
        if (!status) return 'badge-info';
        const s = status.toLowerCase();
        if (s === 'in_stock') return 'badge-success';
        if (s === 'suggested_for_destruction') return 'badge-warning';
        if (s === 'destroyed' || s === 'failed') return 'badge-error';
        if (s === 'not_delivered_to_company' || s === 'included with asset') return 'badge-info';
        return 'badge-info';
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">📦🧴 {t('stockConsumablesInventory.title')}</h1>
                <p className="page-subtitle">{t('stockConsumablesInventory.subtitle')}</p>
            </div>

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 520 }}>
                    <label className="form-label">{t('stockConsumablesInventory.search')}</label>
                    <input
                        className="form-input"
                        type="text"
                        placeholder={t('stockConsumablesInventory.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-item" style={{ maxWidth: 240 }}>
                    <label className="form-label">{t('stockConsumablesInventory.itemType')}</label>
                    <select
                        className="form-input"
                        value={itemTypeFilter}
                        onChange={(e) => {
                            setItemTypeFilter(e.target.value);
                            setStatusFilter('');
                        }}
                    >
                        <option value="">{t('common.all')}</option>
                        <option value="stock_item">{t('stockConsumablesInventory.stockItems')}</option>
                        <option value="consumable">{t('stockConsumablesInventory.consumables')}</option>
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 260 }}>
                    <label className="form-label">{t('common.status')}</label>
                    <select
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        disabled={statusOptions.length === 0}
                    >
                        <option value="">{t('stockConsumablesInventory.allStatuses')}</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 300 }}>
                    <label className="form-label">{t('stockConsumablesInventory.location')}</label>
                    <select
                        className="form-input"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        <option value="">{t('stockConsumablesInventory.allLocations')}</option>
                        {locations.map(loc => (
                            <option key={loc.location_id} value={loc.location_id}>
                                {getBilingualName(loc.location_name_ar, loc.location_name_en, loc.location_name, i18n.language)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {inventoryData && (
                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_stock_items || 0}</div>
                        <div className="stat-label">{t('stockConsumablesInventory.stockItems')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_consumables || 0}</div>
                        <div className="stat-label">{t('stockConsumablesInventory.consumables')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.locations?.length || 0}</div>
                        <div className="stat-label">{t('stockConsumablesInventory.locations')}</div>
                    </div>
                </div>
            )}

            {inventoryData && inventoryData.locations && inventoryData.locations.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">📊 {t('stockConsumablesInventory.itemsByLocation')}</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('stockConsumablesInventory.location')}</th>
                                    <th>{t('stockConsumablesInventory.type')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('stockConsumablesInventory.stockItems')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('stockConsumablesInventory.consumables')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('stockConsumablesInventory.total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.locations.map(loc => (
                                    <tr key={loc.location_id}>
                                        <td><strong>{getBilingualName(loc.location_name_ar, loc.location_name_en, loc.location_name, i18n.language)}</strong></td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>{getBilingualTypeLabel(loc.location_type_ar, loc.location_type_en, loc.location_type, i18n.language) || t('stockConsumablesInventory.unknown')}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-info">{loc.stock_item_count}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-info">{loc.consumable_count}</span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                            {loc.stock_item_count + loc.consumable_count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        📋 {t('stockConsumablesInventory.itemDetails')} {filteredItems.length > 0 ? <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({filteredItems.length} {t('stockConsumablesInventory.items')})</span> : null}
                    </h2>
                </div>
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <span>{t('stockConsumablesInventory.loading')}</span>
                    </div>
                ) : error ? (
                    <div className="card-body">
                        <div className="error-message">{error}</div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-title">{t('stockConsumablesInventory.noItemsFound')}</div>
                        <div className="empty-state-text">{t('stockConsumablesInventory.noItemsMatch')}</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('stockConsumablesInventory.type')}</th>
                                    <th>{t('stockConsumablesInventory.name')}</th>
                                    <th>{t('stockConsumablesInventory.inventoryNumber')}</th>
                                    <th>{t('stockConsumablesInventory.modelBrand')}</th>
                                    <th>{t('stockConsumablesInventory.category')}</th>
                                    <th>{t('common.status')}</th>
                                    <th>{t('stockConsumablesInventory.location')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr key={`${item.item_type}-${item.item_id}-${index}`}>
                                        <td><span style={{ fontSize: 18 }}>{getItemTypeIcon(item.item_type)}</span></td>
                                        <td>
                                            <strong>{item.name}</strong>
                                            {item.serial_number && (
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                    S/N: {item.serial_number}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontFamily: 'monospace' }}>{item.inventory_number || '-'}</td>
                                        <td>
                                            {item.model || '-'}
                                            {item.brand && (
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                    {item.brand}
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.type || '-'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(item.status)}`}>
                                                {formatStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td>{getBilingualName(item.location_name_ar, item.location_name_en, item.location_name, i18n.language) || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default StockConsumablesInventoryPage;

