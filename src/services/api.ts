const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function for API requests
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

// Flowers API
export const flowersAPI = {
  getAll: (params?: Record<string, string>) => {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI<any>(`/catalog/flowers${searchParams}`);
  },
  getById: (id: number) => fetchAPI<any>(`/catalog/flowers/${id}`),
  getFeatured: () => fetchAPI<any>('/catalog/flowers/featured'),
  getOnSale: () => fetchAPI<any>('/catalog/flowers/on-sale'),
  getColors: () => fetchAPI<any>('/catalog/flowers/colors'),
  getOccasions: () => fetchAPI<any>('/catalog/flowers/occasions'),
  getByCategory: (categoryId: number) => fetchAPI<any>(`/catalog/flowers/category/${categoryId}`),
  search: (query: string) => fetchAPI<any>(`/catalog/flowers/search?q=${encodeURIComponent(query)}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => fetchAPI<any>('/catalog/categories'),
  getById: (id: number) => fetchAPI<any>(`/catalog/categories/${id}`),
  getStatistics: (id: number) => fetchAPI<any>(`/catalog/categories/${id}/statistics`),
};

// Breakfasts API
export const breakfastsAPI = {
  getAll: (params?: Record<string, string>) => {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI<any>(`/catalog/breakfasts${searchParams}`);
  },
  getById: (id: number) => fetchAPI<any>(`/catalog/breakfasts/${id}`),
  getFeatured: () => fetchAPI<any>('/catalog/breakfasts/featured'),
};

// Complements API
export const complementsAPI = {
  getAll: () => fetchAPI<any>('/catalog/complements'),
  getById: (id: number) => fetchAPI<any>(`/catalog/complements/${id}`),
  getTypes: () => fetchAPI<any>('/catalog/complements/types'),
  getFeatured: () => fetchAPI<any>('/catalog/complements/featured'),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    fetchAPI<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: any) =>
    fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: (token: string) => fetchAPI<any>('/auth/logout', { 
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }),
  getProfile: (token: string) =>
    fetchAPI<any>('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateProfile: (token: string, data: any) =>
    fetchAPI<any>('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};

// Orders API
export const ordersAPI = {
  create: (data: any, token?: string) => fetchAPI<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  }),
  getAll: (token: string) => fetchAPI<any>('/orders', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  getById: (orderNumber: string, token: string) => fetchAPI<any>(`/orders/${orderNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  cancel: (orderNumber: string, token: string) => fetchAPI<any>(`/orders/${orderNumber}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }),
};

// Direct Payment API
export const directPaymentAPI = {
  create: (data: any) => fetchAPI<any>('/orders/direct', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getByOrderNumber: (orderNumber: string) => fetchAPI<any>(`/orders/direct/${orderNumber}`),
  confirmPayment: (orderNumber: string, data: any) => fetchAPI<any>(`/orders/direct/${orderNumber}/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Payment API (Izipay)
export const paymentAPI = {
  createFormToken: (data: {
    order_id: string | number;
    amount: number;
    currency?: string;
    order_type?: 'order' | 'direct_payment' | 'guest';
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_document?: string;
    customer_address?: string;
  }) => 
    fetchAPI<{
      success: boolean;
      data?: {
        formToken: string;
        publicKey: string;
        payment_id: number;
        transaction_id?: string;
        order_number?: string;
        amount?: number;
        currency?: string;
      };
      message?: string;
    }>('/payments/create-form-token', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  confirmPayment: (data: {
    order_number: string;
    izipay_data: {
      rawClientAnswer: string;
      hash: string;
      clientAnswer: unknown;
    };
  }) =>
    fetchAPI<{
      success: boolean;
      message?: string;
      data?: {
        order_number: string;
        status: string;
        transaction_id?: string;
      };
    }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  handleIPN: (data: any) =>
    fetchAPI<any>('/payments/ipn', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  verify: (paymentId: string) => 
    fetchAPI<{
      success: boolean;
      data?: {
        payment_id: number;
        status: string;
        is_completed: boolean;
        transaction_id?: string;
        order_number?: string;
      };
    }>(`/payments/${paymentId}/verify`),
};

// Delivery API
export const deliveryAPI = {
  getDistricts: () => fetchAPI<any>('/delivery/districts'),
  calculateShipping: (data: any) => fetchAPI<any>('/delivery/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  checkFreeShipping: (data: any) => fetchAPI<any>('/delivery/check-free-shipping', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export default {
  flowers: flowersAPI,
  categories: categoriesAPI,
  breakfasts: breakfastsAPI,
  complements: complementsAPI,
  auth: authAPI,
  orders: ordersAPI,
  directPayment: directPaymentAPI,
  payment: paymentAPI,
  delivery: deliveryAPI,
};
