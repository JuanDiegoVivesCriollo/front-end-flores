// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  flowers_count?: number;
  created_at: string;
  updated_at: string;
}

// Flower metadata types
export interface CondolenciaMetadata {
  tipo_condolencia?: 'lagrimas-piso' | 'mantos-especiales' | 'coronas' | 'tripodes';
  caracteristicas_especiales?: string[];
  duracion_estimada?: string;
  tamano?: 'pequeño' | 'mediano' | 'grande' | 'extra-grande';
}

// Flower types
export interface Flower {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  category_id: number;
  color: string;
  occasion: string;
  sku?: string; // Stock Keeping Unit
  images: string[]; // Array de URLs de imágenes
  image_urls?: string[]; // URLs completas generadas por el backend
  first_image?: string; // Primera imagen con URL completa
  rating: number;
  reviews_count: number;
  stock: number;
  is_featured: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  views: number;
  sort_order: number;
  metadata?: Record<string, unknown>; // JSON object
  category?: Category;
  categories?: Category[]; // Múltiples categorías
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Campos calculados para compatibilidad
  image_url?: string; // Primera imagen del array
  sale_price?: number; // Precio con descuento calculado
  stock_quantity?: number; // Alias para stock
  is_available?: boolean; // Basado en stock > 0
}

// Complement types
export interface Complement {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  type: 'globos' | 'peluches' | 'chocolates';
  color?: string;
  size?: string; // Para peluches y globos
  brand?: string; // Para chocolates
  images: string[]; // Array de URLs de imágenes
  image_urls?: string[]; // URLs completas generadas por el backend
  first_image?: string; // Primera imagen con URL completa
  rating: number;
  reviews_count: number;
  stock: number;
  is_featured: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  views: number;
  sort_order: number;
  metadata?: Record<string, unknown>; // JSON object
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Campos calculados para compatibilidad
  image_url?: string; // Primera imagen del array
  sale_price?: number; // Precio con descuento calculado
  stock_quantity?: number; // Alias para stock
  is_available?: boolean; // Basado en stock > 0
}

// Complement types for filters
export interface ComplementType {
  id: string;
  name: string;
  description: string;
}

// Address types
export interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
}

// Order types
export interface OrderItem {
  id: number;
  order_id: number;
  flower_id?: number;
  complement_id?: number;
  item_type: 'flower' | 'complement';
  quantity: number;
  price: number;
  subtotal: number;
  flower?: Flower;
  complement?: Complement;
  product_name?: string; // Nombre del producto (flower o complement)
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: string;
  total: number; // Campo del backend
  total_amount?: number; // Alias para compatibilidad
  subtotal: number;
  tax?: number;
  tax_amount?: number; // Alias para compatibilidad
  shipping_cost: number;
  shipping_amount?: number; // Alias para compatibilidad
  discount_amount?: number;
  payment_status?: string;
  payment_method?: string;
  shipping_type: 'delivery' | 'pickup';
  shipping_address: Address | Record<string, unknown>; // JSON del backend
  pickup_store?: Record<string, unknown>; // JSON del backend
  billing_address?: Address | null;
  customer_name: string; // Campo del backend
  customer_email: string; // Campo del backend
  customer_phone: string; // Campo del backend
  notes?: string; // Campo del backend
  customer_notes?: string;
  admin_notes?: string;
  delivery_date?: string;
  delivery_time_slot?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  order_items?: OrderItem[];
  items?: OrderItem[];
  payment?: Payment;
  status_history?: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Payment types
export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Dashboard types
export interface DashboardOverview {
  total_orders: number;
  total_customers: number;
  total_flowers: number;
  active_flowers: number;
  today_orders: number;
  today_revenue: number;
  month_orders: number;
  month_revenue: number;
  last_month_orders: number;
  last_month_revenue: number;
  orders_growth: number;
  revenue_growth: number;
}

// Public dashboard statistics (from backend)
export interface PublicDashboardStats {
  totalOrders: number;
  ordersGrowth: number;
  totalRevenue: number | string;
  revenueGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  totalFlowers: number;
  pendingOrders: number;
}

export interface OrdersByStatus {
  [status: string]: number;
}

export interface DashboardStats {
  overview: DashboardOverview;
  orders_by_status: OrdersByStatus;
  recent_orders: Order[];
  low_stock_flowers: Flower[];
  best_sellers: Array<{
    flower_id: number;
    total_sold: number;
    flower: Flower;
  }>;
}

// Tipo para las estadísticas públicas del dashboard (sin datos sensibles)
export interface PublicDashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalFlowers: number;
  pendingOrders: number;
  ordersGrowth: number;
  revenueGrowth: number;
  totalRevenue: number | string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Cart types
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
  category?: string;
  color?: string;
  occasion?: string;
  description?: string;
  slug?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}
