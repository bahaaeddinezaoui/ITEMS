import React, { useState, useEffect } from 'react';
import { locationService } from '../services/api';
import { useTranslation } from 'react-i18next';

const DestructionSelectionModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    asset,
    submitting 
}) => {
    const { t } = useTranslation();
    const [selectedStockItems, setSelectedStockItems] = useState([]);
    const [selectedConsumables, setSelectedConsumables] = useState([]);
    const [storageLocationId, setStorageLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedStockItems(asset?.stock_item_composition?.map(i => i.stock_item_id) || []);
            setSelectedConsumables(asset?.consumable_composition?.map(i => i.consumable_id) || []);
            loadStorageLocations();
        }
    }, [isOpen, asset]);

    const loadStorageLocations = async () => {
        try {
            setLoadingLocations(true);
            const data = await locationService.getAll();
            // Filter for storage/warehouse locations if possible, otherwise show all
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load locations', err);
        } finally {
            setLoadingLocations(false);
        }
    };

    const handleSelectAllStock = () => {
        setSelectedStockItems(asset?.stock_item_composition?.map(i => i.stock_item_id) || []);
    };

    const handleSelectAllConsumables = () => {
        setSelectedConsumables(asset?.consumable_composition?.map(i => i.consumable_id) || []);
    };

    const handleSelectAllBoth = () => {
        handleSelectAllStock();
        handleSelectAllConsumables();
    };

    const handleToggleStock = (id) => {
        setSelectedStockItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleConsumable = (id) => {
        setSelectedConsumables(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    const hasItems = (asset?.stock_item_composition?.length > 0) || (asset?.consumable_composition?.length > 0);
    const unselectedCount = (asset?.stock_item_composition?.length || 0) + (asset?.consumable_composition?.length || 0) 
                          - selectedStockItems.length - selectedConsumables.length;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{t('destructionModal.title')}: {asset?.asset_name}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    <p className="mb-4">{t('destructionModal.description')}</p>
                    
                    {hasItems && (
                        <div className="d-flex gap-2 mb-4">
                            <button className="btn btn-sm btn-secondary" onClick={handleSelectAllStock}>{t('destructionModal.selectAllStock')}</button>
                            <button className="btn btn-sm btn-secondary" onClick={handleSelectAllConsumables}>{t('destructionModal.selectAllConsumables')}</button>
                            <button className="btn btn-sm btn-secondary" onClick={handleSelectAllBoth}>{t('destructionModal.selectAllBoth')}</button>
                        </div>
                    )}

                    <div className="composition-lists" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                        {asset?.stock_item_composition?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">{t('destructionModal.stockItems')}</h4>
                                {asset.stock_item_composition.map(item => (
                                    <label key={item.stock_item_id} className="d-flex align-items-center gap-2 mb-1 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStockItems.includes(item.stock_item_id)}
                                            onChange={() => handleToggleStock(item.stock_item_id)}
                                        />
                                        <span>{item.stock_item_name}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {asset?.consumable_composition?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">{t('destructionModal.consumables')}</h4>
                                {asset.consumable_composition.map(item => (
                                    <label key={item.consumable_id} className="d-flex align-items-center gap-2 mb-1 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedConsumables.includes(item.consumable_id)}
                                            onChange={() => handleToggleConsumable(item.consumable_id)}
                                        />
                                        <span>{item.consumable_name}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {!hasItems && (
                            <p className="text-center text-gray-500 my-4">{t('destructionModal.noComposingItems')}</p>
                        )}
                    </div>

                    {unselectedCount > 0 && (
                        <div className="form-group">
                            <label className="form-label">{t('destructionModal.destinationStorage')}</label>
                            <select 
                                className="form-input"
                                value={storageLocationId}
                                onChange={e => setStorageLocationId(e.target.value)}
                                required
                            >
                                <option value="">{t('destructionModal.selectStorageRoom')}</option>
                                {locations.map(loc => (
                                    <option key={loc.location_id} value={loc.location_id}>
                                        {loc.location_name} ({loc.location_type_label})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">{t('destructionModal.approvalNote')}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>{t('destructionModal.cancel')}</button>
                    <button 
                        className="btn btn-primary" 
                        disabled={submitting || (unselectedCount > 0 && !storageLocationId)}
                        onClick={() => onConfirm({
                            stock_item_ids: selectedStockItems,
                            consumable_ids: selectedConsumables,
                            storage_location_id: storageLocationId
                        })}
                    >
                        {submitting ? t('destructionModal.processing') : t('destructionModal.confirmSuggestion')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DestructionSelectionModal;
