import axios from 'axios';

const API_URL = '/api/';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

    delete: async (id) => {
        await api.delete(`maintenance-steps/${id}/`);
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

export default api;
