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
    getAll: async () => {
        const response = await api.get('persons/');
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

export default api;
