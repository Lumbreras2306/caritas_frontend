import axios from 'axios';

const API_BASE_URL = 'http://20.246.91.21:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('caritas_token') : null;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('caritas_token');
        localStorage.removeItem('caritas_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export interface PreRegisterUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age: number;
  gender: 'M' | 'F';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  privacy_policy_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age: number;
  gender: 'M' | 'F';
  poverty_level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  is_active: boolean;
  approved_at: string | null;
  approved_by_name: string | null;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  last_login?: string | null;
  main_hostel?: string;
  date_joined: string;
}

export interface Location {
  id: string;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  landmarks?: string;
  formatted_address?: string;
  google_maps_url?: string;
  timezone?: string;
}

export interface Hostel {
  id: string;
  name: string;
  phone: string;
  men_capacity: number;
  women_capacity: number;
  is_active: boolean;
  image_url?: string; // URL de la imagen del albergue
  location: string; // ID de la ubicación
  location_data: Location; // Datos completos de la ubicación
  coordinates?: [number, number]; // Array de coordenadas [lat, lng]
  formatted_address?: string;
  available_capacity?: {
    men: number;
    women: number;
    total: number;
  };
  current_capacity?: number;
  current_men_capacity?: number;
  current_women_capacity?: number;
  total_capacity?: number;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
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
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  hostel: string;
  hostel_name: string;
  name: string;
  description: string;
  is_active: boolean;
  last_updated: string;
  created_at: string;
}

export interface InventoryItemDetail {
  id: string;
  inventory: string;
  inventory_name: string;
  hostel_name: string;
  item: InventoryItem;
  item_name: string;
  item_category: string;
  item_unit: string;
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const authService = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/users/auth/admin-login/', credentials),
  logout: () => api.post('/users/auth/admin-logout/'),
  getUserInfo: () => api.get('/users/auth/user-info/'),
};

export const usersService = {
  getPreRegisters: (params?: any) => 
    api.get<PaginatedResponse<PreRegisterUser>>('/users/pre-register/', { params }),
  getPreRegister: (id: string) => 
    api.get<PreRegisterUser>(`/users/pre-register/${id}/`),
  createPreRegister: (data: Partial<PreRegisterUser>) =>
    api.post<PreRegisterUser>('/users/pre-register/', data),
  updatePreRegister: (id: string, data: Partial<PreRegisterUser>) =>
    api.patch<PreRegisterUser>(`/users/pre-register/${id}/`, data),
  deletePreRegister: (id: string) =>
    api.delete(`/users/pre-register/${id}/`),
  approvePreRegisters: (ids: string[]) =>
    api.post('/users/pre-register/approve/', { pre_register_ids: ids }),
  rejectPreRegister: (id: string) =>
    api.patch(`/users/pre-register/${id}/`, { status: 'REJECTED' }),
  verifyPhone: (phone_number: string) =>
    api.post('/users/pre-register/verify-phone/', { phone_number }),
  
  getCustomers: (params?: any) => 
    api.get<PaginatedResponse<CustomUser>>('/users/customers/', { params }),
  getCustomer: (id: string) => 
    api.get<CustomUser>(`/users/customers/${id}/`),
  createCustomer: (data: Partial<CustomUser>) =>
    api.post<CustomUser>('/users/customers/', data),
  updateCustomer: (id: string, data: Partial<CustomUser>) =>
    api.patch<CustomUser>(`/users/customers/${id}/`, data),
  deleteCustomer: (id: string) =>
    api.delete(`/users/customers/${id}/`),
  deactivateMultiple: (ids: string[]) =>
    api.post('/users/customers/deactivate-multiple/', { customer_ids: ids }),
  
  getAdmins: (params?: any) => 
    api.get<PaginatedResponse<AdminUser>>('/users/admins/', { params }),
  getAdmin: (id: string) => 
    api.get<AdminUser>(`/users/admins/${id}/`),
  createAdmin: (data: Partial<AdminUser>) =>
    api.post<AdminUser>('/users/admins/', data),
  updateAdmin: (id: string, data: Partial<AdminUser>) =>
    api.patch<AdminUser>(`/users/admins/${id}/`, data),
  deleteAdmin: (id: string) =>
    api.delete(`/users/admins/${id}/`),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/users/admins/change-password/', data),
};

export interface HostelCreateData {
  name: string;
  phone: string;
  men_capacity: number;
  women_capacity: number;
  is_active: boolean;
  image_url?: string; // URL de la imagen del albergue
  location: {
    latitude: string; // Cambiado a string según la API
    longitude: string; // Cambiado a string según la API
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    landmarks?: string;
  };
}

export interface HostelUpdateData {
  name?: string;
  phone?: string;
  men_capacity?: number;
  women_capacity?: number;
  is_active?: boolean;
  image_url?: string; // URL de la imagen del albergue
  // location se omite en las actualizaciones porque el backend espera un UUID
}

export interface LocationRequest {
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  landmarks?: string;
  timezone?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string | null;
}

export interface AdminUserCreateData {
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  password: string;
}

export interface AdminUserUpdateData {
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  password?: string;
}

export interface AdminUserPasswordChangeData {
  old_password: string;
  new_password: string;
}

export const hostelsService = {
  getHostels: (params?: any) => {
    return api.get<PaginatedResponse<Hostel>>('/albergues/hostels/', { params });
  },
  getHostel: (id: string) => {
    return api.get<Hostel>(`/albergues/hostels/${id}/`);
  },
  createHostel: (data: HostelCreateData) => {
    return api.post<Hostel>('/albergues/hostels/', data);
  },
  updateHostel: (id: string, data: HostelUpdateData) => {
    return api.patch<Hostel>(`/albergues/hostels/${id}/`, data);
  },
  deleteHostel: (id: string) => {
    return api.delete(`/albergues/hostels/${id}/`);
  },
  getNearbyHostels: (lat: number, lng: number, radius = 10) =>
    api.get(`/albergues/hostels/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`),
  getAvailability: (id: string, date: string) =>
    api.get(`/albergues/hostels/${id}/availability/?date=${date}`),
  getStatistics: () =>
    api.get('/albergues/hostels/statistics/'),
  
  getReservations: (params?: any) => 
    api.get('/albergues/reservations/', { params }),
  getReservation: (id: string) => 
    api.get(`/albergues/reservations/${id}/`),
  createReservation: (data: any) =>
    api.post('/albergues/reservations/', data),
  updateReservation: (id: string, data: any) =>
    api.patch(`/albergues/reservations/${id}/`, data),
  deleteReservation: (id: string) =>
    api.delete(`/albergues/reservations/${id}/`),
  updateReservationStatus: (id: string, status: string) =>
    api.patch(`/albergues/reservations/${id}/`, { status }),
};

export const locationsService = {
  getLocation: (id: string) => {
    return api.get<Location>(`/albergues/locations/${id}/`);
  },
  updateLocation: (id: string, data: LocationRequest) => {
    return api.put<Location>(`/albergues/locations/${id}/`, data);
  },
  patchLocation: (id: string, data: Partial<LocationRequest>) => {
    return api.patch<Location>(`/albergues/locations/${id}/`, data);
  },
};

export const servicesService = {
  getServices: (params?: any) => 
    api.get<PaginatedResponse<Service>>('/services/services/', { params }),
  getService: (id: string) => 
    api.get<Service>(`/services/services/${id}/`),
  createService: (data: Partial<Service>) =>
    api.post<Service>('/services/services/', data),
  updateService: (id: string, data: Partial<Service>) =>
    api.patch<Service>(`/services/services/${id}/`, data),
  deleteService: (id: string) =>
    api.delete(`/services/services/${id}/`),
  getStatistics: () => 
    api.get('/services/services/statistics/'),
  
  getHostelServices: (params?: any) => 
    api.get('/services/hostel-services/', { params }),
  getHostelService: (id: string) => 
    api.get(`/services/hostel-services/${id}/`),
  createHostelService: (data: any) =>
    api.post('/services/hostel-services/', data),
  updateHostelService: (id: string, data: any) =>
    api.patch(`/services/hostel-services/${id}/`, data),
  deleteHostelService: (id: string) =>
    api.delete(`/services/hostel-services/${id}/`),
  getSchedules: (params?: any) => 
    api.get('/services/schedules/', { params }),
  getServicesByHostel: (hostelId: string) =>
    api.get(`/services/hostel-services/by-hostel/?hostel=${hostelId}`),
  
  getReservations: (params?: any) => 
    api.get('/services/reservations/', { params }),
  getReservation: (id: string) => 
    api.get(`/services/reservations/${id}/`),
  createReservation: (data: any) =>
    api.post('/services/reservations/', data),
  updateReservation: (id: string, data: any) =>
    api.patch(`/services/reservations/${id}/`, data),
  deleteReservation: (id: string) =>
    api.delete(`/services/reservations/${id}/`),
  updateMultipleStatus: (data: { reservation_ids: string[]; status: string }) =>
    api.post('/services/reservations/update-status/', data),
};

export const inventoryService = {
  getItems: (params?: any) => 
    api.get<PaginatedResponse<InventoryItem>>('/inventory/items/', { params }),
  getItem: (id: string) => 
    api.get<InventoryItem>(`/inventory/items/${id}/`),
  createItem: (data: Partial<InventoryItem>) => 
    api.post<InventoryItem>('/inventory/items/', data),
  updateItem: (id: string, data: Partial<InventoryItem>) =>
    api.patch<InventoryItem>(`/inventory/items/${id}/`, data),
  deleteItem: (id: string) =>
    api.delete(`/inventory/items/${id}/`),
  getCategories: () => 
    api.get('/inventory/items/categories/'),
  
  getInventories: (params?: any) => 
    api.get<PaginatedResponse<Inventory>>('/inventory/inventories/', { params }),
  getInventory: (id: string) => 
    api.get<Inventory>(`/inventory/inventories/${id}/`),
  createInventory: (data: Partial<Inventory>) =>
    api.post<Inventory>('/inventory/inventories/', data),
  updateInventory: (id: string, data: Partial<Inventory>) =>
    api.patch<Inventory>(`/inventory/inventories/${id}/`, data),
  deleteInventory: (id: string) =>
    api.delete(`/inventory/inventories/${id}/`),
  getInventorySummary: (id: string) =>
    api.get(`/inventory/inventories/${id}/summary/`),
  
  getInventoryItems: (params?: any) => 
    api.get<PaginatedResponse<InventoryItemDetail>>('/inventory/inventory-items/', { params }),
  getInventoryItem: (id: string) => 
    api.get<InventoryItemDetail>(`/inventory/inventory-items/${id}/`),
  createInventoryItem: (data: any) =>
    api.post<InventoryItemDetail>('/inventory/inventory-items/', data),
  updateInventoryItem: (id: string, data: any) =>
    api.patch<InventoryItemDetail>(`/inventory/inventory-items/${id}/`, data),
  deleteInventoryItem: (id: string) =>
    api.delete(`/inventory/inventory-items/${id}/`),
  updateQuantity: (id: string, data: { action: 'add' | 'subtract'; amount: number }) =>
    api.post(`/inventory/inventory-items/${id}/update-quantity/`, data),
  getLowStockItems: (params?: any) => 
    api.get<PaginatedResponse<InventoryItemDetail>>('/inventory/inventory-items/low-stock/', { params }),
};

export const adminUsersService = {
  getAdminUsers: (params?: any) => {
    return api.get<PaginatedResponse<AdminUser>>('/users/admins/', { params });
  },
  getAdminUser: (id: string) => {
    return api.get<AdminUser>(`/users/admins/${id}/`);
  },
  createAdminUser: (data: AdminUserCreateData) => {
    return api.post<AdminUser>('/users/admins/', data);
  },
  updateAdminUser: (id: string, data: AdminUserUpdateData) => {
    return api.patch<AdminUser>(`/users/admins/${id}/`, data);
  },
  deleteAdminUser: (id: string) => {
    return api.delete(`/users/admins/${id}/`);
  },
  changePassword: (data: AdminUserPasswordChangeData) => {
    return api.post('/users/admins/change_password/', data);
  },
};