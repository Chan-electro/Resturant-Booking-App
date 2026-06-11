// Brahma Kalasha — Frontend Types
// Re-exports shared types and adds frontend-specific types

// ===================== ENUMS =====================

export type UserRole = "customer" | "kitchen" | "delivery" | "admin";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

// ===================== ENTITIES =====================

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

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
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
  createdAt: string;
  updatedAt: string;
}

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

// ===================== FRONTEND STATE =====================

export interface AppState {
  cart: CartItem[];
  orders: Order[];
  currentRole: UserRole | null;
}
