// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Import types from the main types file
import type { 
  User, 
  Category, 
  Flower,
  Complement,
  ComplementType,
  Order, 
  ApiResponse,
  PublicDashboardStats,
  PaginatedResponse
} from '@/types';

// Additional API-specific types
export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface PaginatedFlowersResponse {
  data: Flower[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PaginatedComplementsResponse {
  data: Complement[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface LandingPageContent {
  id: number;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'html' | 'image' | 'json';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingPageContentBySection {
  [key: string]: LandingPageContent;
}

export interface LandingPageContentGrouped {
  [section: string]: LandingPageContentBySection;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  clearToken() {
    this.setToken(null);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    // If body is FormData, remove Content-Type header to let browser set it
    if (options.body instanceof FormData) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
    }

    // Production environment - debug logs removed
    // console.log('API Request Debug:', {
    //   url,
    //   method: options.method || 'GET',
    //   hasToken: !!this.token,
    //   tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : 'None',
    //   bodyType: options.body ? options.body.constructor.name : 'None'
    // });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Manejar tokens expirados o inválidos
      if (response.status === 401 && this.token) {
        // console.warn('Token expirado o inválido, limpiando autenticación');
        this.clearToken();
        // Redirigir al login si estamos en el navegador
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth Methods
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      this.setToken(null);
    }

    return response;
  }

  async logoutAll(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout-all', {
      method: 'POST',
    });

    if (response.success) {
      this.setToken(null);
    }

    return response;
  }

  async verifyToken(): Promise<ApiResponse<{ expires_at: string; created_at: string }>> {
    return this.request('/auth/verify-token', {
      method: 'POST',
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      }),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Catalog Methods
  async getCategories(params?: {
    include_flower_count?: boolean;
    include_flowers?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    const searchParams = new URLSearchParams();
    if (params?.include_flower_count) searchParams.set('include_flower_count', 'true');
    if (params?.include_flowers) searchParams.set('include_flowers', 'true');

    const query = searchParams.toString();
    return this.request<Category[]>(`/catalog/categories${query ? `?${query}` : ''}`);
  }

  async getFlowers(params?: {
    category_id?: number;
    featured?: boolean;
    on_sale?: boolean;
    in_stock?: boolean;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: 'price' | 'name' | 'created_at' | 'sort_order';
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
    occasion?: string; // ✅ AGREGADO PARÁMETRO FALTANTE
    tipo_condolencia?: string;
  }): Promise<ApiResponse<PaginatedFlowersResponse>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/catalog/flowers${query ? `?${query}` : ''}`);
  }

  async getFeaturedFlowers(limit?: number): Promise<ApiResponse<Flower[]>> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Flower[]>(`/catalog/flowers/featured${query}`);
  }

  async getFlowersOnSale(limit?: number): Promise<ApiResponse<Flower[]>> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Flower[]>(`/catalog/flowers/on-sale${query}`);
  }

  async getFlowersByCategory(categoryId: number, params?: {
    sort_by?: string;
    sort_direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<{ 
    category: Category; 
    flowers: PaginatedFlowersResponse
  }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/catalog/flowers/category/${categoryId}${query ? `?${query}` : ''}`);
  }

  async getFlower(id: number): Promise<ApiResponse<Flower>> {
    return this.request<Flower>(`/catalog/flowers/${id}`);
  }

  // Admin Flower Management Methods
  async createFlower(flowerData: {
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    discount_percentage?: number;
    is_on_sale?: boolean;
    category_ids: number[]; // Cambiar a array de categorías
    stock: number;
    sku: string;
    images: string[];
    color: string;
    occasion: string;
    is_featured?: boolean;
    is_active?: boolean;
    short_description?: string;
  }): Promise<ApiResponse<Flower>> {
    // Usar ruta temporal pública sin autenticación
    return this.request<Flower>('/flowers-temp', {
      method: 'POST',
      body: JSON.stringify(flowerData),
    });
  }

  async updateFlower(id: number, flowerData: {
    name?: string;
    description?: string;
    price?: number;
    original_price?: number | null;
    discount_percentage?: number;
    is_on_sale?: boolean;
    category_ids?: number[]; // Cambiar a array de categorías
    stock?: number;
    sku?: string;
    images?: string[];
    color?: string;
    occasion?: string;
    is_featured?: boolean;
    is_active?: boolean;
    short_description?: string;
  }): Promise<ApiResponse<Flower>> {
    // Usar ruta temporal pública sin autenticación
    return this.request<Flower>(`/flowers-temp/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flowerData),
    });
  }

  async deleteFlower(id: number): Promise<ApiResponse<{ message: string }>> {
    // Usar ruta temporal pública sin autenticación
    return this.request<{ message: string }>(`/flowers-temp/${id}`, {
      method: 'DELETE',
    });
  }

  // Image Upload Methods
  async uploadImage(imageFile: File, folder?: string): Promise<ApiResponse<{
    url: string;
    path: string;
    filename: string;
    size: number;
    mime_type: string;
  }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (folder) {
      formData.append('folder', folder);
    }

    return this.request('/admin/images/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  async deleteImage(imagePath: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/admin/images/delete', {
      method: 'DELETE',
      body: JSON.stringify({ path: imagePath }),
    });
  }

  async getImageInfo(imagePath: string): Promise<ApiResponse<{
    path: string;
    size: number;
    mime_type: string;
    last_modified: string;
    url: string;
  }>> {
    const searchParams = new URLSearchParams();
    searchParams.set('path', imagePath);

    return this.request(`/admin/images/info?${searchParams.toString()}`);
  }

  // Complement Methods
  async getComplementTypes(): Promise<ApiResponse<ComplementType[]>> {
    return this.request<ComplementType[]>('/catalog/complements/types');
  }

  async getComplements(params?: {
    type?: string;
    featured?: boolean;
    on_sale?: boolean;
    in_stock?: boolean;
    search?: string;
    min_price?: number;
    max_price?: number;
    color?: string;
    size?: string;
    brand?: string;
    sort_by?: 'price' | 'name' | 'created_at' | 'sort_order' | 'rating';
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<PaginatedComplementsResponse>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/catalog/complements${query ? `?${query}` : ''}`);
  }

  async getFeaturedComplements(limit?: number): Promise<ApiResponse<Complement[]>> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Complement[]>(`/catalog/complements/featured${query}`);
  }

  async getComplementsOnSale(limit?: number): Promise<ApiResponse<Complement[]>> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Complement[]>(`/catalog/complements/on-sale${query}`);
  }

  async getComplementsByType(type: string, params?: {
    sort_by?: string;
    sort_direction?: string;
    per_page?: number;
    page?: number;
    featured?: boolean;
    on_sale?: boolean;
    in_stock?: boolean;
    search?: string;
  }): Promise<ApiResponse<{ 
    type: string; 
    complements: PaginatedComplementsResponse
  }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/catalog/complements/type/${type}${query ? `?${query}` : ''}`);
  }

  async getComplement(id: number): Promise<ApiResponse<Complement>> {
    return this.request<Complement>(`/catalog/complements/${id}`);
  }

  // Admin Complement Management Methods
  async createComplement(complementData: {
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    discount_percentage?: number;
    type: 'globos' | 'peluches' | 'chocolates';
    color?: string;
    size?: string;
    brand?: string;
    stock: number;
    images: string[];
    is_featured?: boolean;
    is_active?: boolean;
    short_description?: string;
  }): Promise<ApiResponse<Complement>> {
    return this.request<Complement>('/admin/complements', {
      method: 'POST',
      body: JSON.stringify(complementData),
    });
  }

  async updateComplement(id: number, complementData: {
    name?: string;
    description?: string;
    price?: number;
    original_price?: number | null;
    discount_percentage?: number;
    type?: 'globos' | 'peluches' | 'chocolates';
    color?: string;
    size?: string;
    brand?: string;
    stock?: number;
    images?: string[];
    is_featured?: boolean;
    is_active?: boolean;
    short_description?: string;
  }): Promise<ApiResponse<Complement>> {
    return this.request<Complement>(`/admin/complements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(complementData),
    });
  }

  async deleteComplement(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/admin/complements/${id}`, {
      method: 'DELETE',
    });
  }

  // Order Methods
  async createOrder(orderData: {
    items: Array<{
      flower_id?: number;
      complement_id?: number;
      item_type: 'flower' | 'complement';
      quantity: number;
      price: number;
    }>;
    shipping_address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      postal_code?: string;
    };
    billing_address?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      postal_code?: string;
    };
    customer_notes?: string;
    delivery_date?: string;
    delivery_time_slot?: string;
    payment_method: 'izipay' | 'cash_on_delivery';
    shipping_type: 'delivery' | 'pickup';
  }): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: {
    status?: string;
    payment_status?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<{ data: Order[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  // Get all orders for admin with pagination and filters
  async getAdminOrders(params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<{ data: Order[]; total: number; per_page: number; current_page: number; last_page: number; }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/admin/orders${query ? `?${query}` : ''}`);
  }

  // Get orders for the authenticated user
  async getUserOrders(params?: {
    status?: string;
    payment_status?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<{ data: Order[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  async trackOrder(orderNumber: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/tracking/${orderNumber}`);
  }

  // Landing Page Content Methods
  async getLandingPageContent(): Promise<ApiResponse<LandingPageContentGrouped>> {
    return this.request('/landing/content');
  }

  async getLandingPageContentBySection(section: string): Promise<ApiResponse<LandingPageContentBySection>> {
    return this.request(`/landing/content/${section}`);
  }

  async updateLandingPageContent(contentData: {
    section: string;
    key: string;
    value: string;
    type?: 'text' | 'html' | 'image' | 'json';
    description?: string;
  }): Promise<ApiResponse<LandingPageContent>> {
    return this.request('/admin/landing/content', {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  }

  async updateBulkLandingPageContent(contents: Array<{
    section: string;
    key: string;
    value: string;
    type?: 'text' | 'html' | 'image' | 'json';
    description?: string;
  }>): Promise<ApiResponse<LandingPageContent[]>> {
    return this.request('/admin/landing/content/bulk', {
      method: 'PUT',
      body: JSON.stringify({ contents }),
    });
  }

  // User Management Methods (Admin only)
  async getUsers(params?: {
    role?: 'admin' | 'user';
    is_active?: boolean;
    search?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<{ data: User[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/admin/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`);
  }

  async getAdminUserOrders(id: number, params?: {
    status?: string;
    payment_status?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<{ data: Order[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/admin/users/${id}/orders${query ? `?${query}` : ''}`);
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async getUserStatistics(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    admins: number;
    customers: number;
    users_with_orders: number;
    users_without_orders: number;
    new_users_this_month: number;
    total_customer_spent: number;
  }>> {
    return this.request('/admin/users/statistics');
  }

  // Payment Methods
  async createPaymentSession(orderId: number): Promise<ApiResponse<{
    payment_id: number;
    form_token: string;
    public_key: string;
    endpoint: string;
    order_number: string;
    amount: number;
  }>> {
    return this.request('/payments/session', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        payment_method: 'izipay'
      })
    });
  }

  async verifyPayment(paymentId: number): Promise<ApiResponse<{
    payment_status: string;
    transaction_status: string;
    order_status: string;
    paid_at: string | null;
  }>> {
    return this.request(`/payments/${paymentId}/verify`, {
      method: 'GET'
    });
  }

  async getPaymentHistory(): Promise<ApiResponse<{
    data: Array<{
      id: number;
      order_id: number;
      amount: number;
      currency: string;
      status: string;
      payment_method: string;
      paid_at: string | null;
      created_at: string;
      order: {
        order_number: string;
        total_amount: number;
        status: string;
      };
    }>;
  }>> {
    return this.request('/payments/history', {
      method: 'GET'
    });
  }

  // DASHBOARD ADMIN ENDPOINTS
  async getDashboardOverview(): Promise<ApiResponse<PublicDashboardStats>> {
    // Usar estadísticas públicas para el dashboard
    return this.request('/stats/general', {
      method: 'GET'
    });
  }

  async getSalesAnalytics(): Promise<ApiResponse<unknown>> {
    return this.request('/admin/dashboard/sales-analytics', {
      method: 'GET'
    });
  }

  async getCustomerAnalytics(): Promise<ApiResponse<unknown>> {
    return this.request('/admin/dashboard/customer-analytics', {
      method: 'GET'
    });
  }

  async getInventoryAnalytics(): Promise<ApiResponse<unknown>> {
    return this.request('/admin/dashboard/inventory-analytics', {
      method: 'GET'
    });
  }

  // ADMIN ORDER MANAGEMENT
  async getAllOrders(params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async updateOrderPaymentStatus(orderId: number, payment_status: string): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${orderId}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status })
    });
  }

  // Admin Order Deletion Methods
  async deleteOrder(orderId: number): Promise<ApiResponse<{ deleted_count: number; message: string }>> {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  async deleteAllOrders(): Promise<ApiResponse<{ deleted_count: number; message: string }>> {
    return this.request('/admin/orders', {
      method: 'DELETE'
    });
  }

  async deleteMultipleOrders(orderIds: number[]): Promise<ApiResponse<{ deleted_count: number; message: string }>> {
    return this.request('/admin/orders/delete-multiple', {
      method: 'POST',
      body: JSON.stringify({ order_ids: orderIds })
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types and client
export default apiClient;
