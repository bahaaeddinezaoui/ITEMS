import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { locationInventoryService, locationService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { SkeletonListRows } from '../components/SkeletonCard';

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

    const getItemTypeLabel = (itemType) => {
        if (itemType === 'stock_item') return t('stockConsumablesInventory.stockItems');
        if (itemType === 'consumable') return t('stockConsumablesInventory.consumables');
        return '-';
    };

    const getItemTypeBadgeClass = (itemType) => {
        if (itemType === 'stock_item') return 'badge-info';
        if (itemType === 'consumable') return 'badge-warning';
        return 'badge-info';
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
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Package size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('stockConsumablesInventory.title')}</h1>
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
                        <h2 className="card-title">{t('stockConsumablesInventory.itemsByLocation')}</h2>
                    </div>
                    <div className="card-body">
                        <div className="sci-location-grid">
                            {inventoryData.locations.map(loc => (
                                <div key={loc.location_id} className="sci-location-card">
                                    <div className="sci-location-card-head">
                                        <strong className="sci-location-card-name">{getBilingualName(loc.location_name_ar, loc.location_name_en, loc.location_name, i18n.language)}</strong>
                                        <span className="sci-location-card-type">{getBilingualTypeLabel(loc.location_type_ar, loc.location_type_en, loc.location_type, i18n.language) || t('stockConsumablesInventory.unknown')}</span>
                                    </div>
                                    <div className="sci-location-card-stats">
                                        <div className="sci-location-stat">
                                            <span className="sci-location-stat-value">{loc.stock_item_count}</span>
                                            <span className="sci-location-stat-label">{t('stockConsumablesInventory.stockItems')}</span>
                                        </div>
                                        <div className="sci-location-stat">
                                            <span className="sci-location-stat-value">{loc.consumable_count}</span>
                                            <span className="sci-location-stat-label">{t('stockConsumablesInventory.consumables')}</span>
                                        </div>
                                        <div className="sci-location-stat sci-location-stat-total">
                                            <span className="sci-location-stat-value">{loc.stock_item_count + loc.consumable_count}</span>
                                            <span className="sci-location-stat-label">{t('stockConsumablesInventory.total')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        {t('stockConsumablesInventory.itemDetails')} {filteredItems.length > 0 ? <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({filteredItems.length} {t('stockConsumablesInventory.items')})</span> : null}
                    </h2>
                </div>
                {loading ? (
                    <div className="card-body">
                        <SkeletonListRows count={8} />
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
                    <div className="card-body">
                        <div className="sci-item-grid">
                            {filteredItems.map((item, index) => (
                                <div key={`${item.item_type}-${item.item_id}-${index}`} className="sci-item-card">
                                    <div className="sci-item-card-head">
                                        <span className={`badge ${getItemTypeBadgeClass(item.item_type)}`}>{getItemTypeLabel(item.item_type)}</span>
                                        <span className={`badge ${getStatusBadge(item.status)}`}>{formatStatusLabel(item.status)}</span>
                                    </div>
                                    <div className="sci-item-card-body">
                                        <div className="sci-item-card-name">
                                            <strong>{item.name || '-'}</strong>
                                            {item.serial_number && (
                                                <span className="sci-item-card-serial">{item.serial_number}</span>
                                            )}
                                        </div>
                                        <div className="sci-item-card-details">
                                            {item.inventory_number && (
                                                <span className="sci-item-card-tag sci-item-card-mono">{item.inventory_number}</span>
                                            )}
                                            {item.model && (
                                                <span className="sci-item-card-tag">{item.model}</span>
                                            )}
                                            {item.brand && (
                                                <span className="sci-item-card-tag">{item.brand}</span>
                                            )}
                                            {item.type && (
                                                <span className="sci-item-card-tag">{item.type}</span>
                                            )}
                                            <span className="sci-item-card-tag">
                                                {getBilingualName(item.location_name_ar, item.location_name_en, item.location_name, i18n.language) || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default StockConsumablesInventoryPage;

