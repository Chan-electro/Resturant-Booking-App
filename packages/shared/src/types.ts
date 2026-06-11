// Brahma Kalasha — Shared Types
// All TypeScript types shared between frontend and backend

// ===================== ENUMS =====================

export type UserRole = 'customer' | 'kitchen' | 'delivery' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type CouponType = 'percentage' | 'fixed';

export type NotificationType =
  | 'order_confirmation'
  | 'order_status'
  | 'delivery_update'
  | 'promotion'
  | 'reminder'
  | 'system';

// ===================== USER =====================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

// ===================== MENU =====================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  isHealthy: boolean;
  nutritionInfo?: string;
  prepNotes?: string;
  tags: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface DailyMenu {
  id: string;
  date: string;
  menuItemId: string;
  menuItem?: MenuItem;
  availableQty: number;
  remainingQty: number;
  isAvailable: boolean;
}

// ===================== CART =====================

export interface CartItem {
  id: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

// ===================== ORDER =====================

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  addressId: string;
  address?: Address;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryDate: string;
  specialInstructions?: string;
  items: OrderItem[];
  statusHistory?: OrderStatusEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

// ===================== DELIVERY =====================

export interface Delivery {
  id: string;
  orderId: string;
  order?: Order;
  driverId: string;
  driver?: User;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  pickedUpAt?: string;
  deliveredAt?: string;
  codCollected?: number;
  notes?: string;
}

// ===================== REVIEW =====================

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  user?: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ===================== COUPON =====================

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// ===================== NOTIFICATION =====================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ===================== SETTINGS =====================

export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedBy?: string;
  updatedAt: string;
}

// ===================== ANALYTICS =====================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  topItems: { name: string; count: number; revenue: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
}

// ===================== API RESPONSE =====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
