import { useEffect, useState } from 'react';
import { inventoryReportService } from '../services/api';

const InventoryReportsPage = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInventoryData();
    }, []);

    const loadInventoryData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await inventoryReportService.getAll();
            setInventoryData(data);
        } catch (err) {
            console.error('Failed to load inventory data:', err);
            setError(err.response?.data?.error || 'Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const totalAssets = inventoryData.reduce((sum, item) => sum + item.asset_count, 0);
    const totalStockItems = inventoryData.reduce((sum, item) => sum + item.stock_item_count, 0);
    const totalConsumables = inventoryData.reduce((sum, item) => sum + item.consumable_count, 0);
    const totalItems = inventoryData.reduce((sum, item) => sum + item.total_items, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Inventory Reports</h1>
                <p className="page-subtitle">View item counts by location</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Location Inventory Summary</h2>
                    <button
                        className="btn btn-secondary"
                        onClick={loadInventoryData}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                <div className="card-body">
                    {error && (
                        <div className="error-message" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                                    {totalAssets}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Total Assets</p>
                            </div>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                                    {totalStockItems}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Total Stock Items</p>
                            </div>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                                    {totalConsumables}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Total Consumables</p>
                            </div>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                                    {totalItems}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Total Items</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
                                Loading inventory data...
                            </p>
                        </div>
                    ) : inventoryData.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 3h18v18H3z"/>
                                <path d="M7 7h10"/>
                                <path d="M7 12h10"/>
                                <path d="M7 17h6"/>
                            </svg>
                            <h3 className="empty-state-title">No inventory data</h3>
                            <p className="empty-state-text">No items found in any location.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Assets</th>
                                        <th>Stock Items</th>
                                        <th>Consumables</th>
                                        <th>Total Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventoryData.map((item) => (
                                        <tr key={item.location_id}>
                                            <td>
                                                <strong>{item.location_name}</strong>
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary">
                                                    {item.location_type || 'Unknown'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.asset_count > 0 ? 'badge-success' : 'badge-secondary'}`}>
                                                    {item.asset_count}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.stock_item_count > 0 ? 'badge-info' : 'badge-secondary'}`}>
                                                    {item.stock_item_count}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.consumable_count > 0 ? 'badge-warning' : 'badge-secondary'}`}>
                                                    {item.consumable_count}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className={item.total_items > 0 ? 'text-primary' : ''}>
                                                    {item.total_items}
                                                </strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryReportsPage;