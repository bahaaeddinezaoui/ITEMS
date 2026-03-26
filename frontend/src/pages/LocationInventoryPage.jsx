import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationInventoryService, locationService } from '../services/api';

const LocationInventoryPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [locations, setLocations] = useState([]);
    
    // Filter states
    const [itemTypeFilter, setItemTypeFilter] = useState(''); // 'asset', 'stock_item', 'consumable', or ''
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Status options based on item type
    const statusOptions = useMemo(() => {
        if (itemTypeFilter === 'asset') {
            return [
                { value: 'in_stock', label: 'In Stock' },
                { value: 'not_delivered_to_company', label: 'Not Delivered to Company' },
                { value: 'suggested_for_destruction', label: 'Suggested for Destruction' },
                { value: 'destroyed', label: 'Destroyed' },
                { value: 'failed', label: 'Failed' },
            ];
        } else if (itemTypeFilter === 'stock_item') {
            return [
                { value: 'in_stock', label: 'In Stock' },
                { value: 'Included with Asset', label: 'Included with Asset' },
                { value: 'not_delivered_to_company', label: 'Not Delivered to Company' },
                { value: 'suggested_for_destruction', label: 'Suggested for Destruction' },
                { value: 'destroyed', label: 'Destroyed' },
                { value: 'failed', label: 'Failed' },
            ];
        } else if (itemTypeFilter === 'consumable') {
            return [
                { value: 'in_stock', label: 'In Stock' },
                { value: 'Included with Asset', label: 'Included with Asset' },
                { value: 'not_delivered_to_company', label: 'Not Delivered to Company' },
                { value: 'suggested_for_destruction', label: 'Suggested for Destruction' },
                { value: 'destroyed', label: 'Destroyed' },
                { value: 'failed', label: 'Failed' },
            ];
        }
        return [];
    }, [itemTypeFilter]);

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
            setError('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch locations for filter dropdown
    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            setLocations(data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

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
            (item.location_name && item.location_name.toLowerCase().includes(query))
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
                <h1 className="page-title">📍 Location Inventory</h1>
                <p className="page-subtitle">View all assets, stock items, and consumables by location</p>
            </div>

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 520 }}>
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        placeholder="Search by name, inventory number, model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="filter-item" style={{ maxWidth: 240 }}>
                    <label className="form-label">Item Type</label>
                    <select
                        value={itemTypeFilter}
                        onChange={(e) => {
                            setItemTypeFilter(e.target.value);
                            setStatusFilter('');
                        }}
                        className="form-input"
                    >
                        <option value="">All Items</option>
                        <option value="asset">Assets</option>
                        <option value="stock_item">Stock Items</option>
                        <option value="consumable">Consumables</option>
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 260 }}>
                    <label className="form-label">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        disabled={statusOptions.length === 0}
                        className="form-input"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 300 }}>
                    <label className="form-label">Location</label>
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="form-input"
                    >
                        <option value="">All Locations</option>
                        {locations.map(loc => (
                            <option key={loc.location_id} value={loc.location_id}>
                                {loc.location_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {inventoryData && (
                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_assets || 0}</div>
                        <div className="stat-label">Assets</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_stock_items || 0}</div>
                        <div className="stat-label">Stock Items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.summary?.total_consumables || 0}</div>
                        <div className="stat-label">Consumables</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{inventoryData.locations?.length || 0}</div>
                        <div className="stat-label">Locations</div>
                    </div>
                </div>
            )}

            {inventoryData && inventoryData.locations && inventoryData.locations.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">📊 Items by Location</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Type</th>
                                    <th style={{ textAlign: 'center' }}>Assets</th>
                                    <th style={{ textAlign: 'center' }}>Stock Items</th>
                                    <th style={{ textAlign: 'center' }}>Consumables</th>
                                    <th style={{ textAlign: 'center' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.locations.map(loc => (
                                    <tr key={loc.location_id}>
                                        <td><strong>{loc.location_name}</strong></td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>{loc.location_type || 'Unknown'}</td>
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
                        📋 Item Details {filteredItems.length > 0 ? <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({filteredItems.length} items)</span> : null}
                    </h2>
                </div>
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <span>Loading inventory data...</span>
                    </div>
                ) : error ? (
                    <div className="card-body">
                        <div className="error-message">{error}</div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-title">No items found</div>
                        <div className="empty-state-text">No items match the selected criteria.</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Inventory #</th>
                                    <th>Model/Brand</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Location</th>
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
                                        <td>{item.location_name || '-'}</td>
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
