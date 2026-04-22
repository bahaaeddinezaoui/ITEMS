import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationInventoryService, locationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const getLocalizedLocationName = (item, currentLang) => {
    if (currentLang === 'ar') {
        return item.location_name_ar || item.location_name_en || item.location_name;
    }
    return item.location_name_en || item.location_name_ar || item.location_name;
};

const getLocalizedLocationType = (item, currentLang) => {
    if (currentLang === 'ar') {
        return item.location_type_ar || item.location_type_en || item.location_type;
    }
    return item.location_type_en || item.location_type_ar || item.location_type;
};

const LocationInventoryPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [locations, setLocations] = useState([]);
    const { user, isSuperuser } = useAuth();
    const { t } = useTranslation();
    const currentLang = i18n.language;
    
    const roleCodes = useMemo(() => {
        if (!user || !user.roles) return [];
        return user.roles.map(r => typeof r === 'string' ? r : r.role_code).filter(Boolean);
    }, [user]);
    const hasFullAccess = isSuperuser || roleCodes.includes('asset_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    const hasMaintenanceAccess = roleCodes.includes('maintenance_chief') || roleCodes.includes('it_maintenance_technician') || roleCodes.includes('network_maintenance_technician');
    
    // Filter states
    const [itemTypeFilter, setItemTypeFilter] = useState(''); // 'asset', 'stock_item', 'consumable', or ''
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Status options based on item type
    const statusOptions = useMemo(() => {
        const commonOptions = [
            { value: 'in_stock', label: t('locationInventory.inStock') },
            { value: 'not_delivered_to_company', label: t('locationInventory.notDeliveredToCompany') },
            { value: 'suggested_for_destruction', label: t('locationInventory.suggestedForDestruction') },
            { value: 'destroyed', label: t('locationInventory.destroyed') },
            { value: 'failed', label: t('locationInventory.failed') },
            { value: 'stolen', label: t('locationInventory.stolen') },
            { value: 'lost', label: t('locationInventory.lost') },
            { value: 'irrecoverably_damaged', label: t('locationInventory.irrecoverablyDamaged') },
        ];

        if (itemTypeFilter === 'asset') {
            return commonOptions;
        }
        
        // Stock Items and Consumables can also be 'Included with Asset'
        return [
            ...commonOptions,
            { value: 'Included with Asset', label: t('locationInventory.includedWithAsset') },
        ];
    }, [itemTypeFilter]);

    const statusLabelMap = {
        'in_stock': t('locationInventory.inStock'),
        'not_delivered_to_company': t('locationInventory.notDeliveredToCompany'),
        'suggested_for_destruction': t('locationInventory.suggestedForDestruction'),
        'destroyed': t('locationInventory.destroyed'),
        'failed': t('locationInventory.failed'),
        'stolen': t('locationInventory.stolen'),
        'lost': t('locationInventory.lost'),
        'irrecoverably_damaged': t('locationInventory.irrecoverablyDamaged'),
        'Included with Asset': t('locationInventory.includedWithAsset'),
    };

    const formatStatusLabel = (value) => {
        if (!value) return '';
        return statusLabelMap[value] || value;
    };

    const getStatusBadge = (status) => {
        if (!status) return 'badge-info';
        const s = status.toLowerCase();
        if (s === 'in_stock') return 'badge-success';
        if (s === 'suggested_for_destruction') return 'badge-warning';
        if (s === 'destroyed' || s === 'failed' || s === 'stolen' || s === 'lost' || s === 'irrecoverably_damaged') return 'badge-error';
        if (s === 'not_delivered_to_company' || s === 'included with asset') return 'badge-info';
        return 'badge-info';
    };

    // Fetch inventory data
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = {};
            if (itemTypeFilter) params.item_type = itemTypeFilter;
            if (statusFilter) params.status = statusFilter;
            if (locationFilter) params.location_id = locationFilter;
            
            const data = await locationInventoryService.getInventory(params);
            setInventoryData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(t('locationInventory.loadError'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch locations for filter dropdown
    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            if (!hasFullAccess && hasMaintenanceAccess) {
                const filtered = data.filter(loc => {
                    const typeLabel = loc.location_type_label || '';
                    const typeAr = loc.location_type_label_ar || '';
                    const typeEn = loc.location_type_label_en || '';
                    // Check for Maintenance Room in English or Arabic
                    return typeLabel === 'Maintenance Room' ||
                           typeEn === 'Maintenance Room' ||
                           typeAr === 'غرفة صيانة' ||
                           typeLabel === 'غرفة صيانة';
                });
                setLocations(filtered);
                // Pre-select first maintenance room if nothing selected
                if (filtered.length > 0 && !locationFilter) {
                    setLocationFilter(filtered[0].location_id.toString());
                }
            } else {
                setLocations(data);
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    useEffect(() => {
        if (roleCodes.length > 0 || isSuperuser) {
            fetchLocations();
        }
    }, [hasFullAccess, hasMaintenanceAccess, isSuperuser, roleCodes]);

    useEffect(() => {
        fetchInventory();
    }, [itemTypeFilter, statusFilter, locationFilter]);

    // Filter items by search query
    const filteredItems = useMemo(() => {
        if (!inventoryData?.items) return [];
        
        if (!searchQuery.trim()) return inventoryData.items;
        
        const query = searchQuery.toLowerCase();
        return inventoryData.items.filter(item =>
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.inventory_number && item.inventory_number.toLowerCase().includes(query)) ||
            (item.serial_number && item.serial_number.toLowerCase().includes(query)) ||
            (item.model && item.model.toLowerCase().includes(query)) ||
            (item.brand && item.brand.toLowerCase().includes(query)) ||
            (item.type && item.type.toLowerCase().includes(query)) ||
            (item.status && item.status.toLowerCase().includes(query)) ||
            (item.location_name && item.location_name.toLowerCase().includes(query)) ||
            (item.location_name_ar && item.location_name_ar.toLowerCase().includes(query)) ||
            (item.location_name_en && item.location_name_en.toLowerCase().includes(query))
        );
    }, [inventoryData, searchQuery]);
    const getItemTypeIcon = (itemType) => {
        switch (itemType) {
            case 'asset':
                return '💻';
            case 'stock_item':
                return '📦';
            case 'consumable':
                return '🧴';
            default:
                return '📋';
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">📍 {t('locationInventory.title')}</h1>
                <p className="page-subtitle">{t('locationInventory.subtitle')}</p>
            </div>

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 520 }}>
                    <label className="form-label">{t('common.search')}</label>
                    <input
                        type="text"
                        placeholder={t('locationInventory.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="filter-item" style={{ maxWidth: 240 }}>
                    <label className="form-label">{t('locationInventory.itemType')}</label>
                    <select
                        value={itemTypeFilter}
                        onChange={(e) => {
                            setItemTypeFilter(e.target.value);
                            setStatusFilter('');
                        }}
                        className="form-input"
                    >
                        <option value="">{t('locationInventory.allItems')}</option>
                        <option value="asset">{t('locationInventory.assets')}</option>
                        <option value="stock_item">{t('locationInventory.stockItems')}</option>
                        <option value="consumable">{t('locationInventory.consumables')}</option>
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 260 }}>
                    <label className="form-label">{t('common.status')}</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        disabled={statusOptions.length === 0}
                        className="form-input"
                    >
                        <option value="">{t('locationInventory.allStatuses')}</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 300 }}>
                    <label className="form-label">{t('locationInventory.location')}</label>
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="form-input"
                    >
                        {hasFullAccess ? <option value="">{t('locationInventory.allLocations')}</option> : (locations.length > 1 ? <option value="">{t('locationInventory.allMaintenanceRooms')}</option> : null)}
                        {locations.map(loc => (
                            <option key={loc.location_id} value={loc.location_id}>
                                {getLocalizedLocationName(loc, currentLang)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {inventoryData && (
                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_assets || 0}</div>
                        <div className="stat-label">{t('locationInventory.assets')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_stock_items || 0}</div>
                        <div className="stat-label">{t('locationInventory.stockItems')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_consumables || 0}</div>
                        <div className="stat-label">{t('locationInventory.consumables')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.locations?.length || 0}</div>
                        <div className="stat-label">{t('locationInventory.locations')}</div>
                    </div>
                </div>
            )}

            {inventoryData && inventoryData.locations && inventoryData.locations.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">📊 {t('locationInventory.itemsByLocation')}</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('locationInventory.location')}</th>
                                    <th>{t('locationInventory.itemType')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('locationInventory.assets')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('locationInventory.stockItems')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('locationInventory.consumables')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('common.total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.locations.map(loc => (
                                    <tr key={loc.location_id}>
                                        <td><strong>{getLocalizedLocationName(loc, currentLang)}</strong></td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>{getLocalizedLocationType(loc, currentLang) || t('common.unknown')}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-info">{loc.asset_count}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-info">{loc.stock_item_count}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-info">{loc.consumable_count}</span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                            {loc.asset_count + loc.stock_item_count + loc.consumable_count}
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
                        📋 {t('locationInventory.itemDetails')} {filteredItems.length > 0 ? <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({filteredItems.length} {t('locationInventory.items')})</span> : null}
                    </h2>
                </div>
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <span>{t('locationInventory.loadingInventory')}</span>
                    </div>
                ) : error ? (
                    <div className="card-body">
                        <div className="error-message">{error}</div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-title">{t('locationInventory.noItemsFound')}</div>
                        <div className="empty-state-text">{t('locationInventory.noItemsMatchCriteria')}</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('locationInventory.itemType')}</th>
                                    <th>{t('common.name')}</th>
                                    <th>{t('locationInventory.inventoryNumber')}</th>
                                    <th>{t('locationInventory.modelBrand')}</th>
                                    <th>{t('locationInventory.category')}</th>
                                    <th>{t('common.status')}</th>
                                    <th>{t('locationInventory.location')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr key={`${item.item_type}-${item.item_id}-${index}`}>
                                        <td>
                                            <span style={{ fontSize: 18 }}>{getItemTypeIcon(item.item_type)}</span>
                                        </td>
                                        <td>
                                            <strong>{item.name}</strong>
                                            {item.serial_number && (
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                    {t('locationInventory.serialNumber')}: {item.serial_number}
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
                                        <td>{getLocalizedLocationName(item, currentLang) || '-'}</td>
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

export default LocationInventoryPage;
