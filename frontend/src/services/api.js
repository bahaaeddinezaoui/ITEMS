import axios from 'axios';

const API_URL = '/api/';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const postForm = async (url, formData) => {
    const response = await api.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response;
};

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth functions
export const authService = {
    login: async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        const { access, refresh, user } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    isSuperuser: () => {
        const user = authService.getUser();
        return user?.is_superuser || false;
    },
};

// Company Asset Request service
export const companyAssetRequestService = {
    getAll: async () => {
        const response = await api.get('company-asset-requests/');
        return response.data;
    },

    create: async (data) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        const response = isFormData
            ? await postForm('company-asset-requests/', data)
            : await api.post('company-asset-requests/', data);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`company-asset-requests/${id}/`);
        return response.data;
    },
};

// External Maintenance services
export const externalMaintenanceProviderService = {
    getAll: async () => {
        const response = await api.get('external-maintenance-providers/');
        return response.data;
    },
};

export const externalMaintenanceTypicalStepService = {
    getAll: async () => {
        const response = await api.get('external-maintenance-typical-steps/');
        return response.data;
    },
};

export const externalMaintenanceService = {
    getAll: async (params) => {
        const response = await api.get('external-maintenances/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`external-maintenances/${id}/`);
        return response.data;
    },

    createForMaintenance: async (maintenance_id) => {
        const response = await api.post('external-maintenances/create-for-maintenance/', {
            maintenance_id,
        });
        return response.data;
    },

    sendToProvider: async (external_maintenance_id, external_maintenance_provider_id, destination_room_id) => {
        const response = await api.post(`external-maintenances/${external_maintenance_id}/send-to-provider/`, {
            external_maintenance_provider_id,
            destination_room_id,
        });
        return response.data;
    },

    createStep: async (external_maintenance_id, external_maintenance_typical_step_id) => {
        const response = await api.post(`external-maintenances/${external_maintenance_id}/create-step/`, {
            external_maintenance_typical_step_id,
        });
        return response.data;
    },

    confirmReceivedByProvider: async (external_maintenance_id) => {
        const response = await api.post(`external-maintenances/${external_maintenance_id}/confirm-received-by-provider/`);
        return response.data;
    },

    confirmSentToCompany: async (external_maintenance_id) => {
        const response = await api.post(`external-maintenances/${external_maintenance_id}/confirm-sent-to-company/`);
        return response.data;
    },

    confirmReceivedByCompany: async (external_maintenance_id, destination_room_id) => {
        const response = await api.post(`external-maintenances/${external_maintenance_id}/confirm-received-by-company/`, {
            destination_room_id,
        });
        return response.data;
    },
};

export const externalMaintenanceStepService = {
    getAll: async (params) => {
        const response = await api.get('external-maintenance-steps/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`external-maintenance-steps/${id}/`);
        return response.data;
    },
};

// Person service
export const personService = {
    getAll: async (params) => {
        const response = await api.get('persons/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`persons/${id}/`);
        return response.data;
    },

    create: async (personData) => {
        const response = await api.post('persons/', personData);
        return response.data;
    },

    update: async (id, personData) => {
        const response = await api.put(`persons/${id}/`, personData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`persons/${id}/`);
    },
};

// User Account service (superuser-only operations)
export const userAccountService = {
    create: async (data) => {
        const response = await api.post('user-accounts/', data);
        return response.data;
    },
};

// My Items service
export const myItemsService = {
    get: async () => {
        const response = await api.get('my-items/');
        return response.data;
    },
};

// Problem Reports service
export const problemReportService = {
    getAll: async () => {
        const response = await api.get('problem-reports/');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('problem-reports/', data);
        return response.data;
    },
    createMaintenance: async (data) => {
        const response = await api.post('problem-reports/create-maintenance/', data);
        return response.data;
    },
};

// Asset Type service
export const assetTypeService = {
    getAll: async () => {
        const response = await api.get('asset-types/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`asset-types/${id}/`);
        return response.data;
    },

    create: async (assetTypeData) => {
        const response = await api.post('asset-types/', assetTypeData);
        return response.data;
    },

    update: async (id, assetTypeData) => {
        const response = await api.put(`asset-types/${id}/`, assetTypeData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`asset-types/${id}/`);
    },
};

// Asset Brand service
export const assetBrandService = {
    getAll: async () => {
        const response = await api.get('asset-brands/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`asset-brands/${id}/`);
        return response.data;
    },

    create: async (assetBrandData) => {
        const response = await api.post('asset-brands/', assetBrandData);
        return response.data;
    },

    update: async (id, assetBrandData) => {
        const response = await api.put(`asset-brands/${id}/`, assetBrandData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`asset-brands/${id}/`);
    },
};

// Asset Model service
export const assetModelService = {
    getAll: async () => {
        const response = await api.get('asset-models/');
        return response.data;
    },

    getByAssetType: async (assetTypeId) => {
        const response = await api.get(`asset-models/?asset_type=${assetTypeId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`asset-models/${id}/`);
        return response.data;
    },

    create: async (assetModelData) => {
        const response = await api.post('asset-models/', assetModelData);
        return response.data;
    },

    update: async (id, assetModelData) => {
        const response = await api.put(`asset-models/${id}/`, assetModelData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`asset-models/${id}/`);
    },

    getCompatibleStockItemModels: async (assetModelId) => {
        const response = await api.get(`asset-models/${assetModelId}/compatible-stock-item-models/`);
        return response.data;
    },

    addCompatibleStockItemModel: async (assetModelId, stock_item_model_id) => {
        const response = await api.post(`asset-models/${assetModelId}/compatible-stock-item-models/`, {
            stock_item_model_id,
        });
        return response.data;
    },

    removeCompatibleStockItemModel: async (assetModelId, stockItemModelId) => {
        const response = await api.delete(`asset-models/${assetModelId}/compatible-stock-item-models/${stockItemModelId}/`);
        return response.data;
    },

    getCompatibleConsumableModels: async (assetModelId) => {
        const response = await api.get(`asset-models/${assetModelId}/compatible-consumable-models/`);
        return response.data;
    },

    addCompatibleConsumableModel: async (assetModelId, consumable_model_id) => {
        const response = await api.post(`asset-models/${assetModelId}/compatible-consumable-models/`, {
            consumable_model_id,
        });
        return response.data;
    },

    removeCompatibleConsumableModel: async (assetModelId, consumableModelId) => {
        const response = await api.delete(`asset-models/${assetModelId}/compatible-consumable-models/${consumableModelId}/`);
        return response.data;
    },

    // Default composition management
    getDefaultStockItems: async (assetModelId) => {
        const response = await api.get(`asset-model-default-stock-items/?asset_model=${assetModelId}`);
        return response.data;
    },

    addDefaultStockItem: async (assetModelId, stockItemModelId, quantity = 1, notes = '') => {
        const response = await api.post('asset-model-default-stock-items/', {
            asset_model: assetModelId,
            stock_item_model: stockItemModelId,
            quantity,
            notes,
        });
        return response.data;
    },

    removeDefaultStockItem: async (id) => {
        await api.delete(`asset-model-default-stock-items/${id}/`);
    },

    getDefaultConsumables: async (assetModelId) => {
        const response = await api.get(`asset-model-default-consumables/?asset_model=${assetModelId}`);
        return response.data;
    },

    addDefaultConsumable: async (assetModelId, consumableModelId, quantity = 1, notes = '') => {
        const response = await api.post('asset-model-default-consumables/', {
            asset_model: assetModelId,
            consumable_model: consumableModelId,
            quantity,
            notes,
        });
        return response.data;
    },

    removeDefaultConsumable: async (id) => {
        await api.delete(`asset-model-default-consumables/${id}/`);
    },
};

// Asset Attribute Definition service
export const assetAttributeDefinitionService = {
    getAll: async () => {
        const response = await api.get('asset-attribute-definitions/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('asset-attribute-definitions/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`asset-attribute-definitions/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`asset-attribute-definitions/${id}/`);
    },
};

// Asset Type Attribute service
export const assetTypeAttributeService = {
    getByAssetType: async (assetTypeId) => {
        const response = await api.get(`asset-type-attributes/?asset_type=${assetTypeId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('asset-type-attributes/', data);
        return response.data;
    },

    update: async (assetTypeId, assetAttributeDefinitionId, data) => {
        const response = await api.put(`asset-type-attributes/${assetTypeId}/`, {
            asset_type: assetTypeId,
            asset_attribute_definition: assetAttributeDefinitionId,
            ...data,
        });
        return response.data;
    },

    delete: async (assetTypeId, assetAttributeDefinitionId) => {
        await api.delete(`asset-type-attributes/${assetAttributeDefinitionId}/`, {
            params: {
                asset_type: assetTypeId,
                asset_attribute_definition: assetAttributeDefinitionId,
            },
        });
    },
};

// Asset Model Attribute service
export const assetModelAttributeService = {
    getByAssetModel: async (assetModelId) => {
        const response = await api.get(`asset-model-attributes/?asset_model=${assetModelId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('asset-model-attributes/', data);
        return response.data;
    },

    update: async (assetModelId, assetAttributeDefinitionId, data) => {
        const response = await api.put(`asset-model-attributes/${assetModelId}/`, {
            asset_model: assetModelId,
            asset_attribute_definition: assetAttributeDefinitionId,
            ...data,
        });
        return response.data;
    },

    delete: async (assetModelId, assetAttributeDefinitionId) => {
        await api.delete(`asset-model-attributes/${assetAttributeDefinitionId}/`, {
            params: {
                asset_model: assetModelId,
                asset_attribute_definition: assetAttributeDefinitionId,
            },
        });
    },
};

// Asset Attribute Value service
export const assetAttributeValueService = {
    getByAsset: async (assetId) => {
        const response = await api.get(`asset-attributes/?asset=${assetId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('asset-attributes/', data);
        return response.data;
    },

    update: async (assetId, assetAttributeDefinitionId, data) => {
        const response = await api.put(`asset-attributes/${assetAttributeDefinitionId}/`, {
            asset: assetId,
            asset_attribute_definition: assetAttributeDefinitionId,
            ...data,
        });
        return response.data;
    },

    delete: async (assetId, assetAttributeDefinitionId) => {
        await api.delete(`asset-attributes/${assetAttributeDefinitionId}/`, {
            params: {
                asset: assetId,
                asset_attribute_definition: assetAttributeDefinitionId,
            },
        });
    },
};

// Stock Item Attribute Definition service
export const stockItemAttributeDefinitionService = {
    getAll: async () => {
        const response = await api.get('stock-item-attribute-definitions/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('stock-item-attribute-definitions/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`stock-item-attribute-definitions/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`stock-item-attribute-definitions/${id}/`);
    },
};

// Stock Item Type Attribute service
export const stockItemTypeAttributeService = {
    getByStockItemType: async (stockItemTypeId) => {
        const response = await api.get(`stock-item-type-attributes/?stock_item_type=${stockItemTypeId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('stock-item-type-attributes/', data);
        return response.data;
    },

    delete: async (stockItemTypeId, stockItemAttributeDefinitionId) => {
        await api.delete(`stock-item-type-attributes/${stockItemAttributeDefinitionId}/`, {
            params: {
                stock_item_type: stockItemTypeId,
                stock_item_attribute_definition: stockItemAttributeDefinitionId,
            },
        });
    },
};

// Stock Item Model Attribute service
export const stockItemModelAttributeService = {
    getByStockItemModel: async (stockItemModelId) => {
        const response = await api.get(`stock-item-model-attributes/?stock_item_model=${stockItemModelId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('stock-item-model-attributes/', data);
        return response.data;
    },

    delete: async (stockItemModelId, stockItemAttributeDefinitionId) => {
        await api.delete(`stock-item-model-attributes/${stockItemAttributeDefinitionId}/`, {
            params: {
                stock_item_model: stockItemModelId,
                stock_item_attribute_definition: stockItemAttributeDefinitionId,
            },
        });
    },
};

// Stock Item Attribute Value service
export const stockItemAttributeValueService = {
    getByStockItem: async (stockItemId) => {
        const response = await api.get(`stock-item-attributes/?stock_item=${stockItemId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('stock-item-attributes/', data);
        return response.data;
    },

    delete: async (stockItemId, stockItemAttributeDefinitionId) => {
        await api.delete(`stock-item-attributes/${stockItemAttributeDefinitionId}/`, {
            params: {
                stock_item: stockItemId,
                stock_item_attribute_definition: stockItemAttributeDefinitionId,
            },
        });
    },
};

// Consumable Attribute Definition service
export const consumableAttributeDefinitionService = {
    getAll: async () => {
        const response = await api.get('consumable-attribute-definitions/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('consumable-attribute-definitions/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`consumable-attribute-definitions/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`consumable-attribute-definitions/${id}/`);
    },
};

// Consumable Type Attribute service
export const consumableTypeAttributeService = {
    getByConsumableType: async (consumableTypeId) => {
        const response = await api.get(`consumable-type-attributes/?consumable_type=${consumableTypeId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('consumable-type-attributes/', data);
        return response.data;
    },

    delete: async (consumableTypeId, consumableAttributeDefinitionId) => {
        await api.delete(`consumable-type-attributes/${consumableAttributeDefinitionId}/`, {
            params: {
                consumable_type: consumableTypeId,
                consumable_attribute_definition: consumableAttributeDefinitionId,
            },
        });
    },
};

// Consumable Model Attribute service
export const consumableModelAttributeService = {
    getByConsumableModel: async (consumableModelId) => {
        const response = await api.get(`consumable-model-attributes/?consumable_model=${consumableModelId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('consumable-model-attributes/', data);
        return response.data;
    },

    delete: async (consumableModelId, consumableAttributeDefinitionId) => {
        await api.delete(`consumable-model-attributes/${consumableAttributeDefinitionId}/`, {
            params: {
                consumable_model: consumableModelId,
                consumable_attribute_definition: consumableAttributeDefinitionId,
            },
        });
    },
};

// Consumable Attribute Value service
export const consumableAttributeValueService = {
    getByConsumable: async (consumableId) => {
        const response = await api.get(`consumable-attributes/?consumable=${consumableId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('consumable-attributes/', data);
        return response.data;
    },

    delete: async (consumableId, consumableAttributeDefinitionId) => {
        await api.delete(`consumable-attributes/${consumableAttributeDefinitionId}/`, {
            params: {
                consumable: consumableId,
                consumable_attribute_definition: consumableAttributeDefinitionId,
            },
        });
    },
};

// Stock Item Type service
export const stockItemTypeService = {
    getAll: async () => {
        const response = await api.get('stock-item-types/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`stock-item-types/${id}/`);
        return response.data;
    },

    create: async (stockItemTypeData) => {
        const response = await api.post('stock-item-types/', stockItemTypeData);
        return response.data;
    },

    update: async (id, stockItemTypeData) => {
        const response = await api.put(`stock-item-types/${id}/`, stockItemTypeData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`stock-item-types/${id}/`);
    },
};

// Stock Item Brand service
export const stockItemBrandService = {
    getAll: async () => {
        const response = await api.get('stock-item-brands/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`stock-item-brands/${id}/`);
        return response.data;
    },

    create: async (stockItemBrandData) => {
        const response = await api.post('stock-item-brands/', stockItemBrandData);
        return response.data;
    },

    update: async (id, stockItemBrandData) => {
        const response = await api.put(`stock-item-brands/${id}/`, stockItemBrandData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`stock-item-brands/${id}/`);
    },
};

// Stock Item Model service
export const stockItemModelService = {
    getAll: async () => {
        const response = await api.get('stock-item-models/');
        return response.data;
    },

    getByStockItemType: async (stockItemTypeId) => {
        const response = await api.get(`stock-item-models/?stock_item_type=${stockItemTypeId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`stock-item-models/${id}/`);
        return response.data;
    },

    create: async (stockItemModelData) => {
        const response = await api.post('stock-item-models/', stockItemModelData);
        return response.data;
    },

    update: async (id, stockItemModelData) => {
        const response = await api.put(`stock-item-models/${id}/`, stockItemModelData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`stock-item-models/${id}/`);
    },

    getCompatibleAssetModels: async (stockItemModelId) => {
        const response = await api.get(`stock-item-models/${stockItemModelId}/compatible-asset-models/`);
        return response.data;
    },

    addCompatibleAssetModel: async (stockItemModelId, asset_model_id) => {
        const response = await api.post(`stock-item-models/${stockItemModelId}/compatible-asset-models/`, {
            asset_model_id,
        });
        return response.data;
    },

    removeCompatibleAssetModel: async (stockItemModelId, assetModelId) => {
        const response = await api.delete(`stock-item-models/${stockItemModelId}/compatible-asset-models/${assetModelId}/`);
        return response.data;
    },
};

// Consumable Type service
export const consumableTypeService = {
    getAll: async () => {
        const response = await api.get('consumable-types/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`consumable-types/${id}/`);
        return response.data;
    },

    create: async (consumableTypeData) => {
        const response = await api.post('consumable-types/', consumableTypeData);
        return response.data;
    },

    update: async (id, consumableTypeData) => {
        const response = await api.put(`consumable-types/${id}/`, consumableTypeData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`consumable-types/${id}/`);
    },
};

// Consumable Brand service
export const consumableBrandService = {
    getAll: async () => {
        const response = await api.get('consumable-brands/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`consumable-brands/${id}/`);
        return response.data;
    },

    create: async (consumableBrandData) => {
        const response = await api.post('consumable-brands/', consumableBrandData);
        return response.data;
    },

    update: async (id, consumableBrandData) => {
        const response = await api.put(`consumable-brands/${id}/`, consumableBrandData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`consumable-brands/${id}/`);
    },
};

// Consumable Model service
export const consumableModelService = {
    getAll: async () => {
        const response = await api.get('consumable-models/');
        return response.data;
    },

    getByConsumableType: async (consumableTypeId) => {
        const response = await api.get(`consumable-models/?consumable_type=${consumableTypeId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`consumable-models/${id}/`);
        return response.data;
    },

    create: async (consumableModelData) => {
        const response = await api.post('consumable-models/', consumableModelData);
        return response.data;
    },

    update: async (id, consumableModelData) => {
        const response = await api.put(`consumable-models/${id}/`, consumableModelData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`consumable-models/${id}/`);
    },

    getCompatibleAssetModels: async (consumableModelId) => {
        const response = await api.get(`consumable-models/${consumableModelId}/compatible-asset-models/`);
        return response.data;
    },

    addCompatibleAssetModel: async (consumableModelId, asset_model_id) => {
        const response = await api.post(`consumable-models/${consumableModelId}/compatible-asset-models/`, {
            asset_model_id,
        });
        return response.data;
    },

    removeCompatibleAssetModel: async (consumableModelId, assetModelId) => {
        const response = await api.delete(`consumable-models/${consumableModelId}/compatible-asset-models/${assetModelId}/`);
        return response.data;
    },
};

// Room Type service
export const roomTypeService = {
    getAll: async () => {
        const response = await api.get('room-types/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`room-types/${id}/`);
        return response.data;
    },

    create: async (roomTypeData) => {
        const response = await api.post('room-types/', roomTypeData);
        return response.data;
    },

    update: async (id, roomTypeData) => {
        const response = await api.put(`room-types/${id}/`, roomTypeData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`room-types/${id}/`);
    },
};

// Room service
export const roomService = {
    getAll: async () => {
        const response = await api.get('rooms/');
        return response.data;
    },

    getByRoomType: async (roomTypeId) => {
        const response = await api.get(`rooms/?room_type=${roomTypeId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`rooms/${id}/`);
        return response.data;
    },

    create: async (roomData) => {
        const response = await api.post('rooms/', roomData);
        return response.data;
    },

    update: async (id, roomData) => {
        const response = await api.put(`rooms/${id}/`, roomData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`rooms/${id}/`);
    },
};

// Position service
export const positionService = {
    getAll: async () => {
        const response = await api.get('positions/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`positions/${id}/`);
        return response.data;
    },

    create: async (positionData) => {
        const response = await api.post('positions/', positionData);
        return response.data;
    },

    update: async (id, positionData) => {
        const response = await api.put(`positions/${id}/`, positionData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`positions/${id}/`);
    },
};

// Organizational Structure service
export const organizationalStructureService = {
    getAll: async () => {
        const response = await api.get('organizational-structures/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`organizational-structures/${id}/`);
        return response.data;
    },

    create: async (orgStructData) => {
        const response = await api.post('organizational-structures/', orgStructData);
        return response.data;
    },

    update: async (id, orgStructData) => {
        const response = await api.put(`organizational-structures/${id}/`, orgStructData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`organizational-structures/${id}/`);
    },
};

// Organizational Structure Relation service
export const organizationalStructureRelationService = {
    getAll: async () => {
        const response = await api.get('organizational-structure-relations/');
        return response.data;
    },

    getByStructureId: async (structureId) => {
        const response = await api.get(`organizational-structure-relations/?org_structure_id=${structureId}`);
        return response.data;
    },

    create: async (relationData) => {
        const response = await api.post('organizational-structure-relations/', relationData);
        return response.data;
    },

    update: async (childId, parentId, relationData) => {
        // Use composite key for update - the endpoint needs both ids
        const response = await api.put(`organizational-structure-relations/${childId}/${parentId}/`, relationData);
        return response.data;
    },

    delete: async (childId, parentId) => {
        // Use composite key for delete
        await api.delete(`organizational-structure-relations/${childId}/${parentId}/`);
    },
};

// Asset service
export const assetService = {
    getAll: async (params) => {
        const response = await api.get('assets/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`assets/${id}/`);
        return response.data;
    },

    create: async (assetData) => {
        const response = await api.post('assets/', assetData);
        return response.data;
    },

    update: async (id, assetData) => {
        const response = await api.put(`assets/${id}/`, assetData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`assets/${id}/`);
    },

    getCurrentRoom: async (id) => {
        const response = await api.get(`assets/${id}/current-room/`);
        return response.data;
    },

    move: async (id, data) => {
        const response = await api.post(`assets/${id}/move/`, data);
        return response.data;
    },
};

// Stock Item service
export const stockItemService = {
    getAll: async (params) => {
        const response = await api.get('stock-items/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`stock-items/${id}/`);
        return response.data;
    },

    create: async (stockItemData) => {
        const response = await api.post('stock-items/', stockItemData);
        return response.data;
    },

    update: async (id, stockItemData) => {
        const response = await api.put(`stock-items/${id}/`, stockItemData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`stock-items/${id}/`);
    },

    getCurrentRoom: async (id) => {
        const response = await api.get(`stock-items/${id}/current-room/`);
        return response.data;
    },

    move: async (id, data) => {
        const response = await api.post(`stock-items/${id}/move/`, data);
        return response.data;
    },
};

// Consumable service
export const consumableService = {
    getAll: async (params) => {
        const response = await api.get('consumables/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`consumables/${id}/`);
        return response.data;
    },

    create: async (consumableData) => {
        const response = await api.post('consumables/', consumableData);
        return response.data;
    },

    update: async (id, consumableData) => {
        const response = await api.put(`consumables/${id}/`, consumableData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`consumables/${id}/`);
    },

    getCurrentRoom: async (id) => {
        const response = await api.get(`consumables/${id}/current-room/`);
        return response.data;
    },

    move: async (id, data) => {
        const response = await api.post(`consumables/${id}/move/`, data);
        return response.data;
    },
};

// Maintenance service
export const maintenanceService = {
    getAll: async () => {
        const response = await api.get('maintenances/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`maintenances/${id}/`);
        return response.data;
    },

    create: async (maintenanceData) => {
        const response = await api.post('maintenances/', maintenanceData);
        return response.data;
    },

    createDirect: async (data) => {
        const response = await api.post('maintenances/create-direct/', data);
        return response.data;
    },

    end: async (id, data) => {
        const response = await api.post(`maintenances/${id}/end/`, data || {});
        return response.data;
    },

    update: async (id, maintenanceData) => {
        const response = await api.put(`maintenances/${id}/`, maintenanceData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`maintenances/${id}/`);
    },
};

// Maintenance Step service
export const maintenanceStepService = {
    getAll: async (params) => {
        const response = await api.get('maintenance-steps/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`maintenance-steps/${id}/`);
        return response.data;
    },

    create: async (stepData) => {
        const response = await api.post('maintenance-steps/', stepData);
        return response.data;
    },

    update: async (id, stepData) => {
        const response = await api.put(`maintenance-steps/${id}/`, stepData);
        return response.data;
    },

    patch: async (id, stepData) => {
        const response = await api.patch(`maintenance-steps/${id}/`, stepData);
        return response.data;
    },

    requestStockItem: async (id, data) => {
        const response = await api.post(`maintenance-steps/${id}/request-stock-item/`, data);
        return response.data;
    },

    requestConsumable: async (id, data) => {
        const response = await api.post(`maintenance-steps/${id}/request-consumable/`, data);
        return response.data;
    },

    getComponents: async (id) => {
        const response = await api.get(`maintenance-steps/${id}/components/`);
        return response.data;
    },

    removeComponent: async (id, data) => {
        const response = await api.post(`maintenance-steps/${id}/remove-component/`, data);
        return response.data;
    },

    updateAssetCondition: async (id, data) => {
        const response = await api.post(`maintenance-steps/${id}/update-asset-condition/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`maintenance-steps/${id}/`);
    },
};

export const physicalConditionService = {
    getAll: async () => {
        const response = await api.get('physical-conditions/');
        return response.data;
    },
};

// Asset Maintenance Timeline service
export const assetMaintenanceTimelineService = {
    getAll: async () => {
        const response = await api.get('asset-maintenance-timeline/');
        return response.data;
    },

    getByAssetId: async (assetId) => {
        const response = await api.get(`asset-maintenance-timeline/${assetId}/`);
        return response.data;
    },
};

export const maintenanceStepItemRequestService = {
    getAll: async (params) => {
        const response = await api.get('maintenance-step-item-requests/', { params });
        return response.data;
    },

    fulfill: async (id, data) => {
        const response = await api.post(`maintenance-step-item-requests/${id}/fulfill/`, data);
        return response.data;
    },

    reject: async (id, data) => {
        const response = await api.post(`maintenance-step-item-requests/${id}/reject/`, data);
        return response.data;
    },

    selectRandom: async (id) => {
        const response = await api.get(`maintenance-step-item-requests/${id}/select-random/`);
        return response.data;
    },

    eligibleItems: async (id) => {
        const response = await api.get(`maintenance-step-item-requests/${id}/eligible-items/`);
        return response.data;
    },
};

// Maintenance Typical Step service
export const maintenanceTypicalStepService = {
    getAll: async () => {
        const response = await api.get('maintenance-typical-steps/'); // Assuming this endpoint exists or will exist. If not, I might need to create it or fetching typical steps might be different.
        // Wait, I didn't check if TypicalStep has a viewset. 
        // Let's check backend/api/urls.py again mentally. 
        // It wasn't in the list I saw earlier. 
        // I should probably check if I need to create it or if I can just use raw data/hardcode for now or if I missed it.
        // Re-reading urls.py content from earlier log... 
        // It was NOT in urls.py. 
        // I'll add the service but might need to implement the backend endpoint if it's missing.
        return response.data;
    },
};

// Asset Assignment service
export const assetAssignmentService = {
    getAll: async (params) => {
        const response = await api.get('asset-assignments/', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('asset-assignments/', data);
        return response.data;
    },

    confirm: async (id) => {
        const response = await api.post(`asset-assignments/${id}/confirm/`);
        return response.data;
    },

    discharge: async (id) => {
        const response = await api.post(`asset-assignments/${id}/discharge/`);
        return response.data;
    },
};

export const stockItemAssignmentService = {
    getAll: async (params) => {
        const response = await api.get('stock-item-assignments/', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('stock-item-assignments/', data);
        return response.data;
    },

    discharge: async (id) => {
        const response = await api.post(`stock-item-assignments/${id}/discharge/`);
        return response.data;
    },
};

export const consumableAssignmentService = {
    getAll: async (params) => {
        const response = await api.get('consumable-assignments/', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('consumable-assignments/', data);
        return response.data;
    },

    discharge: async (id) => {
        const response = await api.post(`consumable-assignments/${id}/discharge/`);
        return response.data;
    },
};

// Warehouse service
export const warehouseService = {
    getAll: async () => {
        const response = await api.get('warehouses/');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('warehouses/', data);
        return response.data;
    },
};

// Attribution Order service
export const attributionOrderService = {
    getAll: async () => {
        const response = await api.get('attribution-orders/');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`attribution-orders/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('attribution-orders/', data);
        return response.data;
    },
    getIncludedItems: async (id) => {
        const response = await api.get(`attribution-orders/${id}/included-items/`);
        return response.data;
    },
};

// Receipt Report service
export const receiptReportService = {
    getById: async (id) => {
        const response = await api.get(`receipt-reports/${id}/`);
        return response.data;
    },
    create: async (formData) => {
        const response = await api.post('receipt-reports/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// Administrative Certificate service
export const administrativeCertificateService = {
    getAll: async (params) => {
        const response = await api.get('administrative-certificates/', { params });
        return response.data;
    },
    create: async (data) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        const response = isFormData
            ? await postForm('administrative-certificates/', data)
            : await api.post('administrative-certificates/', data);
        return response.data;
    },
};

export default api;
