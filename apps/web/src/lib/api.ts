const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "/api/v1";
};

const API_BASE = getApiBase();

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

  return res.json().catch(() => ({ success: false, error: "Invalid server response" }));
}

// ===================== AUTH =====================

export const authApi = {
  me: () => request("/auth/me"),
};

// ===================== MENU =====================

export const menuApi = {
  categories: () => request("/menu/categories"),
  items: (params?: { categoryId?: string; date?: string; all?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/menu/items${qs ? `?${qs}` : ""}`);
  },
  daily: (date?: string, all = false) => {
    const qs = new URLSearchParams({ ...(date ? { date } : {}), ...(all ? { all: "true" } : {}) });
    return request(`/menu/daily${qs.size ? `?${qs}` : ""}`);
  },
  item: (id: string) => request(`/menu/items/${id}`),
  createItem: (data: object) =>
    request("/menu/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id: string, data: object) =>
    request(`/menu/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteItem: (id: string) =>
    request(`/menu/items/${id}`, { method: "DELETE" }),
  setDailyMenu: (data: object) =>
    request("/menu/daily", { method: "POST", body: JSON.stringify(data) }),
  updateDailyMenu: (id: string, data: object) =>
    request(`/menu/daily/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
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
  orderingConfig: () => request("/ordering-config"),
  validateCoupon: (code: string, subtotal: number) =>
    request("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
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

  adminList: (page = 1, pageSize = 20, status?: string, date?: string) => {
    const qs = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(status && { status }),
      ...(date && { date }),
    }).toString();
    return request(`/orders/admin?${qs}`);
  },

  get: (id: string) => request(`/orders/${id}`),

  cancel: (id: string) => request(`/orders/${id}/cancel`, { method: "POST" }),

  updateStatus: (id: string, status: string, note?: string) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),

  verifyPayment: (
    orderId: string,
    data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
  ) =>
    request(`/orders/${orderId}/verify-payment`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  confirmTestPayment: (orderId: string) =>
    request(`/orders/${orderId}/confirm-test-payment`, { method: "POST" }),

  kitchenQueue: () => request("/kitchen/orders"),

  productionSummary: () => request("/kitchen/production"),

  deliveryAssignments: () => request("/delivery/assignments"),

  availableDeliveries: () => request("/delivery/available"),

  acceptDelivery: (id: string) => request(`/delivery/${id}/accept`, { method: "PATCH" }),

  confirmPickup: (id: string) => request(`/delivery/${id}/pickup`, { method: "PATCH" }),

  confirmDelivery: (id: string, codCollected?: number) =>
    request(`/delivery/${id}/deliver`, { method: "PATCH", body: JSON.stringify({ codCollected }) }),

  deliveryHistory: (page = 1, pageSize = 20) =>
    request(`/delivery/history?page=${page}&pageSize=${pageSize}`),
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
    lat?: number;
    lng?: number;
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
  users: (page = 1, role = "", search = "") => {
    const params = new URLSearchParams({
      page: String(page),
      ...(role && { role }),
      ...(search && { search }),
    });
    return request(`/admin/users?${params.toString()}`);
  },
  createUser: (data: object) =>
    request("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateUserStatus: (id: string, isActive: boolean) =>
    request(`/admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  updateUserRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  coupons: () => request("/admin/coupons"),
  createCoupon: (data: object) =>
    request("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),
  settings: () => request("/settings"),
  updateSetting: (key: string, value: string) =>
    request(`/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) }),
};
