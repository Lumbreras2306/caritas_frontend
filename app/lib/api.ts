import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token de autorización
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('caritas_token') : null;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('caritas_token');
        localStorage.removeItem('caritas_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Tipos para la API
export interface PreRegisterUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age: number;
  gender: 'M' | 'F';
  status: 'pending' | 'approved' | 'rejected';
  privacy_policy_accepted: boolean;
  created_at: string;
}

export interface CustomUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age: number;
  gender: 'M' | 'F';
  poverty_level: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
  last_login: string | null;
  main_hostel?: string;
}

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  landmarks?: string;
}

export interface Hostel {
  id: string;
  name: string;
  phone: string;
  men_capacity: number;
  women_capacity: number;
  is_active: boolean;
  location: Location;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  reservation_type: 'individual' | 'group';
  needs_approval: boolean;
  max_time: number;
  is_active: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  inventory: string;
  item: {
    id: string;
    name: string;
    category: string;
    unit: string;
    description: string;
  };
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
}

// Servicios de API
export const authService = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/users/auth/admin-login/', credentials),
  logout: () => api.post('/users/auth/admin-logout/'),
};

export const usersService = {
  getPreRegisters: (params?: any) => api.get('/users/pre-register/', { params }),
  createPreRegister: (data: Partial<PreRegisterUser>) =>
    api.post('/users/pre-register/', data),
  approvePreRegisters: (ids: string[]) =>
    api.post('/users/pre-register/approve/', { pre_register_ids: ids }),
  
  getCustomers: (params?: any) => api.get('/users/customers/', { params }),
  createCustomer: (data: Partial<CustomUser>) =>
    api.post('/users/customers/', data),
  
  getAdmins: (params?: any) => api.get('/users/admins/', { params }),
  createAdmin: (data: Partial<AdminUser>) =>
    api.post('/users/admins/', data),
};

export const hostelsService = {
  getHostels: (params?: any) => api.get('/albergues/hostels/', { params }),
  createHostel: (data: Partial<Hostel>) =>
    api.post('/albergues/hostels/', data),
  getHostel: (id: string) => api.get(`/albergues/hostels/${id}/`),
  getNearbyHostels: (lat: number, lng: number, radius = 10) =>
    api.get(`/albergues/hostels/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`),
  getAvailability: (id: string, date: string) =>
    api.get(`/albergues/hostels/${id}/availability/?date=${date}`),
  
  getReservations: (params?: any) => api.get('/albergues/reservations/', { params }),
  createReservation: (data: any) =>
    api.post('/albergues/reservations/', data),
};

export const servicesService = {
  getServices: (params?: any) => api.get('/services/services/', { params }),
  createService: (data: Partial<Service>) =>
    api.post('/services/services/', data),
  getStatistics: () => api.get('/services/services/statistics/'),
  
  getHostelServices: (params?: any) => api.get('/services/hostel-services/', { params }),
  createHostelService: (data: any) =>
    api.post('/services/hostel-services/', data),
  
  getReservations: (params?: any) => api.get('/services/reservations/', { params }),
  createReservation: (data: any) =>
    api.post('/services/reservations/', data),
};

export const inventoryService = {
  getItems: (params?: any) => api.get('/inventory/items/', { params }),
  createItem: (data: any) => api.post('/inventory/items/', data),
  getCategories: () => api.get('/inventory/items/categories/'),
  
  getInventories: (params?: any) => api.get('/inventory/inventories/', { params }),
  createInventory: (data: any) =>
    api.post('/inventory/inventories/', data),
  
  getInventoryItems: (params?: any) => api.get('/inventory/inventory-items/', { params }),
  createInventoryItem: (data: any) =>
    api.post('/inventory/inventory-items/', data),
  getLowStockItems: (params?: any) => api.get('/inventory/inventory-items/low-stock/', { params }),
};