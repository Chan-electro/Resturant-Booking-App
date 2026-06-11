// Typed API client for the Brahma Kalasha NestJS backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Try refresh
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      // Retry original request
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      return retryRes.json();
    }
    return { success: false, error: "Unauthorized" };
  }

  return res.json();
}

// ===================== AUTH =====================

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/auth/me"),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, newPassword: string) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }),

  googleUrl: () => `${API_BASE}/auth/google`,
};

// ===================== MENU =====================

export const menuApi = {
  categories: () => request("/menu/categories"),
  items: (params?: { categoryId?: string; date?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/menu/items${qs ? `?${qs}` : ""}`);
  },
  daily: (date?: string) => request(`/menu/daily${date ? `?date=${date}` : ""}`),
  item: (id: string) => request(`/menu/items/${id}`),
};

// ===================== CART =====================

export const cartApi = {
  get: () => request("/cart"),
  addItem: (menuItemId: string, quantity: number) =>
    request("/cart/items", { method: "POST", body: JSON.stringify({ menuItemId, quantity }) }),
  updateItem: (menuItemId: string, quantity: number) =>
    request(`/cart/items/${menuItemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
  removeItem: (menuItemId: string) =>
    request(`/cart/items/${menuItemId}`, { method: "DELETE" }),
  clear: () => request("/cart", { method: "DELETE" }),
};

// ===================== ORDERS =====================

export const ordersApi = {
  place: (data: {
    addressId: string;
    deliveryDate: string;
    items: { menuItemId: string; quantity: number }[];
    paymentMethod: "COD" | "ONLINE";
    specialInstructions?: string;
    couponCode?: string;
  }) => request("/orders", { method: "POST", body: JSON.stringify(data) }),

  list: (page = 1, pageSize = 10) =>
    request(`/orders?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => request(`/orders/${id}`),

  cancel: (id: string) => request(`/orders/${id}/cancel`, { method: "POST" }),

  updateStatus: (id: string, status: string, note?: string) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),

  kitchenQueue: () => request("/kitchen/orders"),

  productionSummary: () => request("/kitchen/production"),

  deliveryAssignments: () => request("/delivery/assignments"),

  confirmPickup: (id: string) => request(`/delivery/${id}/pickup`, { method: "PATCH" }),

  confirmDelivery: (id: string, codCollected?: number) =>
    request(`/delivery/${id}/deliver`, { method: "PATCH", body: JSON.stringify({ codCollected }) }),
};

// ===================== USERS =====================

export const usersApi = {
  profile: () => request("/users/profile"),
  updateProfile: (data: { name?: string; phone?: string }) =>
    request("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),
  addresses: () => request("/users/addresses"),
  addAddress: (data: {
    label?: string;
    street: string;
    city: string;
    state?: string;
    zip: string;
    instructions?: string;
    isDefault?: boolean;
  }) => request("/users/addresses", { method: "POST", body: JSON.stringify(data) }),
  deleteAddress: (id: string) => request(`/users/addresses/${id}`, { method: "DELETE" }),
};

// ===================== NOTIFICATIONS =====================

export const notificationsApi = {
  list: () => request("/notifications"),
  unreadCount: () => request("/notifications/unread-count"),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
};

// ===================== ANALYTICS (Admin) =====================

export const analyticsApi = {
  dashboard: () => request("/analytics/dashboard"),
  revenue: (days = 7) => request(`/analytics/revenue?days=${days}`),
  topItems: () => request("/analytics/top-items"),
  ordersByStatus: () => request("/analytics/orders-by-status"),
};

// ===================== ADMIN =====================

export const adminApi = {
  users: (page = 1) => request(`/admin/users?page=${page}`),
  updateUserRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  coupons: () => request("/admin/coupons"),
  createCoupon: (data: object) =>
    request("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),
  settings: () => request("/settings"),
  updateSetting: (key: string, value: string) =>
    request(`/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) }),
};
