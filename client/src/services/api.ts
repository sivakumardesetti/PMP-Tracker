import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }) => api.post('/auth/register', userData),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    department?: string;
  }) => api.put('/auth/profile', userData),
  
  updatePreferences: (preferences: any) =>
    api.put('/auth/preferences', preferences),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// Deals API
export const dealsAPI = {
  getDeals: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    advertiser?: string;
    platform?: string;
    exchange?: string;
    dealType?: string;
    deliveryStatus?: string;
    startDate?: string;
    endDate?: string;
    minBudget?: number;
    maxBudget?: number;
    activeOnly?: boolean;
  }) => api.get('/deals', { params }),
  
  getDeal: (id: string) => api.get(`/deals/${id}`),
  
  createDeal: (dealData: {
    dealId: string;
    dealName: string;
    advertiser: string;
    agency?: string;
    dealType: string;
    platform: string;
    exchange: string;
    startDate: string;
    endDate: string;
    totalBudget: number;
    cpm: number;
    targeting?: any;
    creativeSpecs?: any;
    notes?: string;
  }) => api.post('/deals', dealData),
  
  updateDeal: (id: string, dealData: any) => api.put(`/deals/${id}`, dealData),
  
  deleteDeal: (id: string) => api.delete(`/deals/${id}`),
  
  addPerformanceData: (id: string, performanceData: {
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions?: number;
    viewabilityRate?: number;
  }) => api.post(`/deals/${id}/performance`, performanceData),
  
  getAlerts: (id: string, params?: {
    resolved?: boolean;
    severity?: string;
  }) => api.get(`/deals/${id}/alerts`, { params }),
  
  updateAlert: (dealId: string, alertId: string, data: {
    resolved?: boolean;
  }) => api.put(`/deals/${dealId}/alerts/${alertId}`, data),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  
  getPerformance: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => api.get('/analytics/performance', { params }),
  
  getAdvertiserAnalytics: (advertiser: string) =>
    api.get(`/analytics/advertiser/${advertiser}`),
  
  getAlertsAnalytics: () => api.get('/analytics/alerts'),
  
  exportData: (params: {
    type: 'deals' | 'performance' | 'alerts';
    format?: 'json' | 'csv';
    startDate?: string;
    endDate?: string;
  }) => api.get('/analytics/export', { params }),
};

// Users API
export const usersAPI = {
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    department?: string;
    search?: string;
  }) => api.get('/users', { params }),
  
  getUser: (id: string) => api.get(`/users/${id}`),
  
  createUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    department?: string;
  }) => api.post('/users', userData),
  
  updateUser: (id: string, userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    department?: string;
    isActive?: boolean;
  }) => api.put(`/users/${id}`, userData),
  
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  
  resetPassword: (id: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { newPassword }),
  
  activateUser: (id: string, isActive: boolean) =>
    api.put(`/users/${id}/activate`, { isActive }),
  
  getUserActivity: () => api.get('/users/analytics/activity'),
};

export default api; 