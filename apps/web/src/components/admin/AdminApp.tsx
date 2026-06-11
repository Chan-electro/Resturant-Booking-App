"use client";

import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  ShoppingBag,
  LayoutDashboard,
  Utensils,
  Settings as SettingsIcon,
  BarChart3,
  Package,
  Clock,
  ChevronDown,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Bell,
  FileText,
  Mail,
  Phone,
  Calendar,
  Lock,
  X,
  ShieldCheck,
  ChefHat,
  Bike,
  UserCircle,
  User,
} from "lucide-react";
import type { Category, MenuItem, Order, OrderStatus, PaymentMethod, PaymentStatus, DashboardStats } from "@/lib/types";
import { cn, formatPrice, getStatusColor, formatDate, formatTime } from "@/lib/utils";
import { adminApi, analyticsApi, menuApi, ordersApi } from "@/lib/api";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useApp } from "@/lib/store";

type AdminPage = "dashboard" | "menu" | "orders" | "customers" | "analytics" | "settings";

export default function AdminApp() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    topItems: [],
    revenueByDay: [],
    ordersByStatus: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({
    cutoff_time: "21:00",
    tax_rate: "5",
    free_delivery_minimum: "200",
    delivery_fee: "0",
    service_zones: "Malleshwaram, Rajajinagar, Sadashivanagar",
  });
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const { state: appState } = useApp();

  // User Management States
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [activeRoleFilter, setActiveRoleFilter] = useState("ALL");
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CUSTOMER",
  });
  const [createUserError, setCreateUserError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const fetchUsers = async (page = 1, role = "", search = "") => {
    try {
      setUsersLoading(true);
      const res = await adminApi.users(page, role === "ALL" ? "" : role, search);
      if (res.success && res.data) {
        setUsers(res.data as any[]);
        setUsersTotalPages((res as any).totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activePage === "customers") {
      const timer = setTimeout(() => {
        fetchUsers(usersPage, activeRoleFilter, userSearchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activePage, usersPage, activeRoleFilter, userSearchQuery]);

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const res = await adminApi.updateUserRole(userId, role);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u))
        );
      } else {
        alert(res.error || "Failed to update user role");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating user role");
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await adminApi.updateUserStatus(userId, isActive);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive } : u))
        );
      } else {
        alert(res.error || "Failed to update user status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating user status");
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");
    setIsCreatingUser(true);
    try {
      const res = await adminApi.createUser(createUserForm);
      if (res.success) {
        setIsCreateUserModalOpen(false);
        setCreateUserForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "CUSTOMER",
        });
        fetchUsers(usersPage, activeRoleFilter, userSearchQuery);
      } else {
        setCreateUserError(res.error || "Failed to create user");
      }
    } catch (err: any) {
      console.error(err);
      setCreateUserError("An error occurred. Make sure email and phone are unique.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Menu Management States
  const [tomorrowItems, setTomorrowItems] = useState<any[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    categoryId: "",
    price: 0,
    description: "",
    imageUrl: "",
    isHealthy: false,
    nutritionInfo: "",
    prepNotes: "",
  });
  const [itemFormError, setItemFormError] = useState("");
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !itemForm.categoryId) {
      setItemForm((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: "",
      categoryId: categories[0]?.id || "",
      price: 0,
      description: "",
      imageUrl: "",
      isHealthy: false,
      nutritionInfo: "",
      prepNotes: "",
    });
    setItemFormError("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      isHealthy: !!item.isHealthy,
      nutritionInfo: item.nutritionInfo || "",
      prepNotes: item.prepNotes || "",
    });
    setItemFormError("");
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormError("");
    setIsSavingItem(true);
    try {
      const slug = itemForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const payload = {
        ...itemForm,
        slug,
        price: Number(itemForm.price),
      };

      let res;
      if (editingItem) {
        res = await menuApi.updateItem(editingItem.id, payload);
      } else {
        res = await menuApi.createItem(payload);
      }

      if (res.success) {
        setIsItemModalOpen(false);
        setEditingItem(null);
        setItemForm({
          name: "",
          categoryId: categories[0]?.id || "",
          price: 0,
          description: "",
          imageUrl: "",
          isHealthy: false,
          nutritionInfo: "",
          prepNotes: "",
        });
        fetchData();
      } else {
        setItemFormError(res.error || "Failed to save menu item");
      }
    } catch (err) {
      console.error(err);
      setItemFormError("An error occurred while saving the menu item.");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const res = await menuApi.deleteItem(itemId);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error || "Failed to delete menu item");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting menu item");
    }
  };

  const handleToggleTomorrowMenu = async (item: MenuItem) => {
    const existingEntry = tomorrowItems.find((t) => t.menuItemId === item.id);
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDateStr = tomorrowDate.toISOString().split("T")[0];

    try {
      if (existingEntry) {
        const updatedStatus = !existingEntry.isAvailable;
        const res = await menuApi.updateDailyMenu(existingEntry.id, {
          isAvailable: updatedStatus,
        });
        if (res.success) {
          setTomorrowItems((prev) =>
            prev.map((t) => (t.id === existingEntry.id ? { ...t, isAvailable: updatedStatus } : t))
          );
        } else {
          alert(res.error || "Failed to update tomorrow's menu");
        }
      } else {
        const res = await menuApi.setDailyMenu({
          date: tomorrowDateStr,
          menuItemId: item.id,
          availableQty: 100,
          isAvailable: true,
        });
        if (res.success && res.data) {
          setTomorrowItems((prev) => [...prev, res.data]);
        } else {
          alert(res.error || "Failed to add to tomorrow's menu");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error updating tomorrow's menu");
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, catRes, menuRes, ordersRes, settingsRes, dailyRes] = await Promise.all([
        analyticsApi.dashboard(),
        menuApi.categories(),
        menuApi.items(),
        ordersApi.adminList(1, 100),
        adminApi.settings(),
        menuApi.daily(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data as DashboardStats);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data as Category[]);
      }
      if (menuRes.success && menuRes.data) {
        const rawItems = menuRes.data as any[];
        const mappedItems: MenuItem[] = rawItems.map((item) => ({
          ...item,
          tags: item.tags ? item.tags.map((t: any) => t.tag?.name || t.tagId) : [],
        }));
        setMenuItems(mappedItems);
      }
      if (ordersRes.success && ordersRes.data) {
        const rawOrders = ordersRes.data as any[];
        const mappedOrders: Order[] = rawOrders.map((o) => ({
          ...o,
          status: o.status.toLowerCase() as OrderStatus,
          paymentMethod: o.paymentMethod.toLowerCase() as PaymentMethod,
          paymentStatus: o.paymentStatus.toLowerCase() as PaymentStatus,
        }));
        setOrders(mappedOrders);
      }
      if (settingsRes.success && settingsRes.data) {
        const rawSettings = settingsRes.data as { key: string; value: string }[];
        const mappedSettings: Record<string, string> = {};
        rawSettings.forEach((s) => {
          mappedSettings[s.key] = s.value;
        });
        setSettings((prev) => ({ ...prev, ...mappedSettings }));
      }
      if (dailyRes.success && dailyRes.data) {
        setTomorrowItems((dailyRes.data as any).tomorrow?.items || []);
      }
    } catch (err) {
      console.error("Failed to load admin console data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      setSavingSettings(true);
      const res = await adminApi.updateSetting(key, value);
      if (res.success) {
        // Refresh settings
        const settingsRes = await adminApi.settings();
        if (settingsRes.success && settingsRes.data) {
          const rawSettings = settingsRes.data as { key: string; value: string }[];
          const mappedSettings: Record<string, string> = {};
          rawSettings.forEach((s) => {
            mappedSettings[s.key] = s.value;
          });
          setSettings((prev) => ({ ...prev, ...mappedSettings }));
        }
        alert("Setting updated successfully!");
      } else {
        alert("Failed to update setting: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save setting");
    } finally {
      setSavingSettings(false);
    }
  };

  const navItems = [
    { id: "dashboard" as AdminPage, icon: LayoutDashboard, label: "Dashboard" },
    { id: "menu" as AdminPage, icon: Utensils, label: "Menu" },
    { id: "orders" as AdminPage, icon: ShoppingBag, label: "Orders" },
    { id: "customers" as AdminPage, icon: Users, label: "Customers" },
    { id: "analytics" as AdminPage, icon: BarChart3, label: "Analytics" },
    { id: "settings" as AdminPage, icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-maroon text-cream flex-col hidden lg:flex shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-ivory/10">
          <div className="flex items-center gap-2.5 mb-2">
            <img src="/logo.png" alt="Brahma Kalasha" className="h-8 w-auto brightness-0 invert" />
          </div>
          <p className="text-sm text-gold/80 font-medium">Admin Console</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors text-left",
                activePage === item.id
                  ? "bg-white/10 text-gold border-r-4 border-gold"
                  : "text-cream/60 hover:text-cream hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-ivory/10">
          <ProfileDropdown theme="light" onSettingsClick={() => setActivePage('settings')} />
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ivory z-30 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex flex-col items-center py-3 px-2 text-xs font-bold transition-colors",
                activePage === item.id
                  ? "text-maroon"
                  : "text-maroon/40"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-cream pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-ivory p-4 lg:p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="Brahma Kalasha" className="h-7 w-auto brightness-0" />
            <h2 className="text-lg font-bold text-maroon font-display">
              {navItems.find((n) => n.id === activePage)?.label}
            </h2>
          </div>
          <h2 className="text-2xl font-bold text-maroon hidden lg:block font-display">
            {navItems.find((n) => n.id === activePage)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maroon/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-cream border border-ivory rounded-xl pl-10 pr-4 py-2.5 text-sm text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold w-56"
                placeholder="Search..."
              />
            </div>
            <button className="w-10 h-10 rounded-xl bg-cream border border-ivory flex items-center justify-center text-maroon/50 hover:text-maroon transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full" />
            </button>
            <ProfileDropdown theme="dark" onSettingsClick={() => setActivePage('settings')} />
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* ==================== DASHBOARD ==================== */}
          {activePage === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-ivory">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">
                      Revenue (Week)
                    </p>
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-maroon">
                    {formatPrice(stats.totalRevenue)}
                  </h3>
                  <p className="text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-md mt-2">
                    +12% from last week
                  </p>
                </div>

                <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-ivory">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">
                      Total Orders
                    </p>
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-maroon">
                    {stats.totalOrders}
                  </h3>
                  <p className="text-sm text-maroon/50 mt-2">
                    {stats.activeOrders} active now
                  </p>
                </div>

                <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-ivory">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">
                      Customers
                    </p>
                    <div className="w-10 h-10 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-violet-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-maroon">
                    {stats.totalCustomers}
                  </h3>
                  <p className="text-sm text-maroon/50 mt-2">
                    Avg. {formatPrice(stats.avgOrderValue)}/order
                  </p>
                </div>

                <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-ivory">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">
                      Cutoff Time
                    </p>
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-maroon">
                    9:00 PM
                  </h3>
                  <p className="text-sm text-maroon/50 mt-2">Tonight&apos;s deadline</p>
                </div>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="bg-white rounded-2xl shadow-sm border border-ivory p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-maroon">Revenue This Week</h3>
                  <button className="text-sm font-bold text-gold bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20">
                    View Report
                  </button>
                </div>
                <div className="flex items-end gap-3 h-48">
                  {stats.revenueByDay.map((day) => {
                    const maxRevenue = Math.max(
                      ...stats.revenueByDay.map((d) => d.revenue)
                    );
                    const heightPct = (day.revenue / maxRevenue) * 100;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <span className="text-xs font-bold text-maroon/60">
                          {formatPrice(day.revenue / 1000)}k
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-maroon to-burgundy rounded-t-lg transition-all duration-500 hover:from-gold hover:to-gold-dark cursor-pointer relative group"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-maroon text-cream text-xs px-2 py-1 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.orders} orders
                          </div>
                        </div>
                        <span className="text-xs font-bold text-maroon/50">
                          {day.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Items + Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-ivory p-6">
                  <h3 className="font-bold text-lg text-maroon mb-4">
                    Top Selling Items
                  </h3>
                  <div className="space-y-3">
                    {stats.topItems.map((item, i) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-ivory/50"
                      >
                        <span className="w-8 h-8 rounded-lg bg-maroon text-cream font-bold text-sm flex items-center justify-center shadow-sm">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-maroon text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-maroon/50">
                            {item.count} orders
                          </p>
                        </div>
                        <span className="font-bold text-gold text-sm">
                          {formatPrice(item.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-ivory overflow-hidden">
                  <div className="px-6 py-4 border-b border-ivory flex justify-between items-center bg-cream/50">
                    <h3 className="font-bold text-lg text-maroon">Recent Orders</h3>
                    <button
                      onClick={() => setActivePage("orders")}
                      className="text-sm font-bold text-gold"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="divide-y divide-ivory">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="px-6 py-4 flex justify-between items-center hover:bg-ivory/20 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-maroon text-sm">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-maroon/50 mt-0.5">
                            {order.items.length} items · {formatPrice(order.total)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border",
                            getStatusColor(order.status)
                          )}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MENU MANAGEMENT ==================== */}
          {activePage === "menu" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-maroon/60 font-medium">
                  {menuItems.length} items across {categories.length}{" "}
                  categories
                </p>
                <button
                  onClick={handleOpenAddItem}
                  className="bg-maroon text-cream font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-burgundy transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-ivory overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-cream text-maroon/60 text-xs font-bold uppercase tracking-wider border-b border-ivory">
                      <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Tags</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Tomorrow's Menu</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ivory text-sm">
                      {menuItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-ivory/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-cream overflow-hidden shrink-0 border border-ivory/50">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-maroon">
                                  {item.name}
                                </p>
                                {item.isHealthy && (
                                  <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                                    Healthy
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-maroon/70 font-medium">
                            {categories.find(
                              (c) => c.id === item.categoryId
                            )?.name || "—"}
                          </td>
                          <td className="px-6 py-4 font-bold text-maroon">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] bg-ivory font-bold text-maroon/60 px-2 py-0.5 rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                                item.isActive
                                  ? "bg-green-50 text-green-800 border border-green-200"
                                  : "bg-red-50 text-red-800 border border-red-200"
                              )}
                            >
                              {item.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const entry = tomorrowItems.find((t) => t.menuItemId === item.id);
                              const active = entry ? entry.isAvailable : false;
                              return (
                                <button
                                  onClick={() => handleToggleTomorrowMenu(item)}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95",
                                    active
                                      ? "bg-gold/15 text-gold border-gold/30 hover:bg-gold/25"
                                      : "bg-cream text-maroon/50 border-ivory hover:bg-ivory/20"
                                  )}
                                >
                                  {active ? "★ Scheduled" : "☆ Add"}
                                </button>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenEditItem(item)}
                                className="w-8 h-8 rounded-lg bg-cream border border-ivory flex items-center justify-center text-maroon/50 hover:text-gold hover:border-gold/30 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-8 h-8 rounded-lg bg-cream border border-ivory flex items-center justify-center text-maroon/50 hover:text-red-500 hover:border-red-200 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ORDERS ==================== */}
          {activePage === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-maroon/60 font-medium">
                  {orders.length} total orders
                </p>
                <div className="flex gap-2">
                  <button className="bg-white text-maroon font-bold px-4 py-2 rounded-xl border border-ivory shadow-sm hover:border-gold/30 flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="bg-white text-maroon font-bold px-4 py-2 rounded-xl border border-ivory shadow-sm hover:border-gold/30 flex items-center gap-2 text-sm">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-ivory overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-cream text-maroon/60 text-xs font-bold uppercase tracking-wider border-b border-ivory">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ivory text-sm">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-ivory/20 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-maroon">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 text-maroon/70 max-w-[200px] truncate">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border",
                                getStatusColor(order.status)
                              )}
                            >
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-maroon">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-6 py-4 text-maroon/70 font-medium">
                            <span
                              className={cn(
                                "text-xs",
                                order.paymentMethod === "cod"
                                  ? "text-amber-700"
                                  : "text-green-700"
                              )}
                            >
                              {order.paymentMethod.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-maroon/50 text-xs">
                            {formatDate(order.createdAt)}
                            <br />
                            {formatTime(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CUSTOMERS & STAFF DIRECTORY ==================== */}
          {activePage === "customers" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-maroon/60 font-medium text-sm">
                    Manage users, kitchen staff, couriers, and administrators
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="bg-maroon text-cream font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-burgundy transition-all flex items-center gap-2 text-sm active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Add Staff / User
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-ivory flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maroon/40" />
                  <input
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                    className="w-full bg-cream border border-ivory rounded-xl pl-10 pr-4 py-2.5 text-sm text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold"
                    placeholder="Search by name, email..."
                  />
                </div>

                {/* Role Filter Tabs */}
                <div className="flex flex-wrap gap-1 bg-cream p-1.5 rounded-xl border border-ivory/50">
                  {["ALL", "CUSTOMER", "KITCHEN", "DELIVERY", "ADMIN"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setActiveRoleFilter(role);
                        setUsersPage(1);
                      }}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                        activeRoleFilter === role
                          ? "bg-maroon text-cream shadow-sm"
                          : "text-maroon/60 hover:text-maroon hover:bg-white/50"
                      )}
                    >
                      {role === "ALL" ? "All Users" : role.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-ivory overflow-hidden">
                {usersLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-maroon/50 font-medium">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-20 text-center">
                    <Users className="w-12 h-12 text-ivory mx-auto mb-3" />
                    <p className="font-bold text-maroon">No users found</p>
                    <p className="text-xs text-maroon/50 mt-1">Try adjusting your search query or filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-cream text-maroon/60 text-xs font-bold uppercase tracking-wider border-b border-ivory">
                          <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Registered</th>
                            <th className="px-6 py-4">Change Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ivory text-sm">
                          {users.map((u) => {
                            let roleBadge = "bg-cream text-maroon/60 border-ivory";
                            let roleIcon = <UserCircle className="w-3.5 h-3.5" />;
                            if (u.role === "ADMIN") {
                              roleBadge = "bg-gold/10 text-gold border-gold/30";
                              roleIcon = <ShieldCheck className="w-3.5 h-3.5" />;
                            } else if (u.role === "KITCHEN") {
                              roleBadge = "bg-burgundy/10 text-burgundy border-burgundy/30";
                              roleIcon = <ChefHat className="w-3.5 h-3.5" />;
                            } else if (u.role === "DELIVERY") {
                              roleBadge = "bg-violet-50 text-violet-700 border-violet-200";
                              roleIcon = <Bike className="w-3.5 h-3.5" />;
                            }

                            return (
                              <tr key={u.id} className="hover:bg-ivory/10 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gold/15 text-maroon font-bold flex items-center justify-center border border-gold/10 shrink-0">
                                      {u.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-maroon">{u.name}</p>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-maroon/50 font-medium mt-0.5">
                                        <span className="flex items-center gap-1">
                                          <Mail className="w-3 h-3 text-maroon/30" />
                                          {u.email}
                                        </span>
                                        {u.phone && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-maroon/30" />
                                            {u.phone}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border w-fit", roleBadge)}>
                                    {roleIcon}
                                    <span>{u.role}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.id, !u.isActive)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95",
                                      u.isActive
                                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                    )}
                                  >
                                    {u.isActive ? "Active" : "Disabled"}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-maroon/50 text-xs font-medium">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-maroon/30" />
                                    {formatDate(u.createdAt)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                    className="bg-cream border border-ivory rounded-lg text-xs text-maroon font-bold p-1.5 focus:outline-none focus:border-gold"
                                    disabled={u.email === appState.userEmail}
                                  >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="KITCHEN">Kitchen Staff</option>
                                    <option value="DELIVERY">Courier</option>
                                    <option value="ADMIN">System Admin</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {usersTotalPages > 1 && (
                      <div className="px-6 py-4 border-t border-ivory flex justify-between items-center bg-cream/30">
                        <button
                          onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                          disabled={usersPage === 1}
                          className="px-4 py-2 border border-ivory bg-white rounded-xl text-xs font-bold text-maroon disabled:opacity-50 hover:bg-ivory/20 transition-all"
                        >
                          Previous
                        </button>
                        <span className="text-xs text-maroon/50 font-bold">
                          Page {usersPage} of {usersTotalPages}
                        </span>
                        <button
                          onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                          disabled={usersPage === usersTotalPages}
                          className="px-4 py-2 border border-ivory bg-white rounded-xl text-xs font-bold text-maroon disabled:opacity-50 hover:bg-ivory/20 transition-all"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ==================== ANALYTICS (Placeholder) ==================== */}
          {activePage === "analytics" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-ivory p-6">
                  <h3 className="font-bold text-lg text-maroon mb-4">
                    Orders by Status
                  </h3>
                  <div className="space-y-3">
                    {stats.ordersByStatus.map((s) => {
                      const maxCount = Math.max(
                        ...stats.ordersByStatus.map((x) => x.count)
                      );
                      const widthPct = (s.count / maxCount) * 100;
                      return (
                        <div key={s.status} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-maroon/60 w-32 truncate capitalize">
                            {s.status.replace(/_/g, " ")}
                          </span>
                          <div className="flex-1 bg-cream rounded-full h-6 overflow-hidden border border-ivory/50">
                            <div
                              className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                              style={{ width: `${widthPct}%` }}
                            >
                              <span className="text-[10px] font-bold text-cream">
                                {s.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-ivory p-6">
                  <h3 className="font-bold text-lg text-maroon mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-cream rounded-xl border border-ivory">
                      <p className="text-xs text-maroon/50 font-bold uppercase mb-1">
                        Avg. Order Value
                      </p>
                      <p className="text-2xl font-bold text-maroon">
                        {formatPrice(stats.avgOrderValue)}
                      </p>
                    </div>
                    <div className="p-4 bg-cream rounded-xl border border-ivory">
                      <p className="text-xs text-maroon/50 font-bold uppercase mb-1">
                        Order Completion Rate
                      </p>
                      <p className="text-2xl font-bold text-maroon">96.2%</p>
                    </div>
                    <div className="p-4 bg-cream rounded-xl border border-ivory">
                      <p className="text-xs text-maroon/50 font-bold uppercase mb-1">
                        Customer Satisfaction
                      </p>
                      <p className="text-2xl font-bold text-maroon">4.7 / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SETTINGS ==================== */}
          {activePage === "settings" && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="bg-white rounded-2xl shadow-sm border border-ivory p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-ivory/50 pb-4">
                  <h3 className="font-bold text-lg text-maroon">
                    Platform Settings
                  </h3>
                  {savingSettings && (
                    <div className="text-xs text-gold font-bold animate-pulse">Saving changes...</div>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Cutoff Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-cream rounded-xl border border-ivory">
                    <div>
                      <p className="font-bold text-maroon">Booking Cutoff Time</p>
                      <p className="text-sm text-maroon/50">
                        Orders close at this time each day
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.cutoff_time || ""}
                        onChange={(e) => setSettings({ ...settings, cutoff_time: e.target.value })}
                        className="bg-white border border-ivory rounded-xl px-4 py-2 text-sm text-maroon font-bold w-24 focus:outline-none focus:border-gold"
                        placeholder="21:00"
                      />
                      <button
                        onClick={() => handleSaveSetting("cutoff_time", settings.cutoff_time)}
                        className="bg-maroon text-cream text-xs font-bold px-3 py-2 rounded-lg hover:bg-burgundy transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Tax Rate */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-cream rounded-xl border border-ivory">
                    <div>
                      <p className="font-bold text-maroon">Tax Rate (%)</p>
                      <p className="text-sm text-maroon/50">
                        Applied to all orders
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.tax_rate || ""}
                        onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                        className="bg-white border border-ivory rounded-xl px-4 py-2 text-sm text-maroon font-bold w-24 focus:outline-none focus:border-gold"
                        placeholder="5"
                      />
                      <button
                        onClick={() => handleSaveSetting("tax_rate", settings.tax_rate)}
                        className="bg-maroon text-cream text-xs font-bold px-3 py-2 rounded-lg hover:bg-burgundy transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Free Delivery Minimum */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-cream rounded-xl border border-ivory">
                    <div>
                      <p className="font-bold text-maroon">Free Delivery Minimum (₹)</p>
                      <p className="text-sm text-maroon/50">
                        Orders above this get free delivery
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.free_delivery_minimum || ""}
                        onChange={(e) => setSettings({ ...settings, free_delivery_minimum: e.target.value })}
                        className="bg-white border border-ivory rounded-xl px-4 py-2 text-sm text-maroon font-bold w-24 focus:outline-none focus:border-gold"
                        placeholder="200"
                      />
                      <button
                        onClick={() => handleSaveSetting("free_delivery_minimum", settings.free_delivery_minimum)}
                        className="bg-maroon text-cream text-xs font-bold px-3 py-2 rounded-lg hover:bg-burgundy transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-cream rounded-xl border border-ivory">
                    <div>
                      <p className="font-bold text-maroon">Standard Delivery Fee (₹)</p>
                      <p className="text-sm text-maroon/50">
                        Fee for orders below the free delivery minimum
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.delivery_fee || ""}
                        onChange={(e) => setSettings({ ...settings, delivery_fee: e.target.value })}
                        className="bg-white border border-ivory rounded-xl px-4 py-2 text-sm text-maroon font-bold w-24 focus:outline-none focus:border-gold"
                        placeholder="30"
                      />
                      <button
                        onClick={() => handleSaveSetting("delivery_fee", settings.delivery_fee)}
                        className="bg-maroon text-cream text-xs font-bold px-3 py-2 rounded-lg hover:bg-burgundy transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Service Zones */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-cream rounded-xl border border-ivory">
                    <div>
                      <p className="font-bold text-maroon">Service Zones</p>
                      <p className="text-sm text-maroon/50">
                        Commas-separated list of delivery regions
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                      <input
                        type="text"
                        value={settings.service_zones || ""}
                        onChange={(e) => setSettings({ ...settings, service_zones: e.target.value })}
                        className="bg-white border border-ivory rounded-xl px-4 py-2 text-sm text-maroon font-bold flex-1 focus:outline-none focus:border-gold"
                        placeholder="Malleshwaram, Rajajinagar"
                      />
                      <button
                        onClick={() => handleSaveSetting("service_zones", settings.service_zones)}
                        className="bg-maroon text-cream text-xs font-bold px-3 py-2 rounded-lg hover:bg-burgundy transition-all shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-ivory overflow-hidden transform animate-scale-in">
            {/* Modal Header */}
            <div className="bg-maroon text-cream px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gold font-display">Add User Account</h3>
                <p className="text-xs text-cream/70 mt-0.5">Register customers or staff members directly</p>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-cream hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              {createUserError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                  ⚠️ {createUserError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-maroon/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={createUserForm.name}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                    className="w-full bg-cream border border-ivory rounded-xl pl-10 pr-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-maroon/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    className="w-full bg-cream border border-ivory rounded-xl pl-10 pr-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-maroon/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    className="w-full bg-cream border border-ivory rounded-xl pl-10 pr-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                    placeholder="+919876543210"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">System Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "CUSTOMER", label: "Customer" },
                    { id: "KITCHEN", label: "Kitchen Staff" },
                    { id: "DELIVERY", label: "Courier/Driver" },
                    { id: "ADMIN", label: "Admin" },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setCreateUserForm({ ...createUserForm, role: role.id })}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center",
                        createUserForm.role === role.id
                          ? "bg-maroon text-cream border-maroon shadow-inner"
                          : "bg-cream text-maroon/65 border-ivory hover:bg-ivory/50"
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-maroon/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    className="w-full bg-cream border border-ivory rounded-xl pl-10 pr-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                    placeholder="Minimum 8 characters"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="flex-1 py-3 border border-ivory rounded-xl text-xs font-bold text-maroon hover:bg-cream/50 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="flex-1 py-3 bg-maroon text-cream rounded-xl text-xs font-bold hover:bg-burgundy transition-all text-center disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isCreatingUser ? (
                    <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Menu Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-ivory overflow-hidden transform animate-scale-in">
            {/* Modal Header */}
            <div className="bg-maroon text-cream px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gold font-display">
                  {editingItem ? "Edit Menu Item" : "Create Menu Item"}
                </h3>
                <p className="text-xs text-cream/70 mt-0.5">
                  {editingItem ? "Update food detail details" : "Add a new dish to the system master menu"}
                </p>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-cream hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {itemFormError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                  ⚠️ {itemFormError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Dish Name</label>
                <input
                  required
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                  placeholder="e.g. Masala Dosa"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Category</label>
                <select
                  required
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Price (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={itemForm.price || ""}
                  onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                  placeholder="e.g. 120"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Image URL</label>
                <input
                  required
                  type="text"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-bold focus:outline-none focus:border-gold"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Description</label>
                <textarea
                  required
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-medium focus:outline-none focus:border-gold h-20 resize-none"
                  placeholder="Describe the dish ingredients, taste..."
                />
              </div>

              {/* Is Healthy Toggle */}
              <div className="flex items-center justify-between p-3 bg-cream rounded-xl border border-ivory">
                <div>
                  <p className="text-xs font-bold text-maroon">Mark as Healthy</p>
                  <p className="text-[10px] text-maroon/50 mt-0.5">Show a green healthy badge next to this item</p>
                </div>
                <input
                  type="checkbox"
                  checked={itemForm.isHealthy}
                  onChange={(e) => setItemForm({ ...itemForm, isHealthy: e.target.checked })}
                  className="w-4 h-4 text-maroon accent-maroon focus:ring-0 focus:ring-offset-0 rounded border-ivory"
                />
              </div>

              {/* Nutrition Info */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Nutrition Info (Optional)</label>
                <input
                  type="text"
                  value={itemForm.nutritionInfo}
                  onChange={(e) => setItemForm({ ...itemForm, nutritionInfo: e.target.value })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-medium focus:outline-none focus:border-gold"
                  placeholder="e.g. 240 kcal, 6g Protein"
                />
              </div>

              {/* Prep Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-maroon/65 block">Prep Notes (Optional)</label>
                <input
                  type="text"
                  value={itemForm.prepNotes}
                  onChange={(e) => setItemForm({ ...itemForm, prepNotes: e.target.value })}
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-2.5 text-sm text-maroon font-medium focus:outline-none focus:border-gold"
                  placeholder="e.g. Contains dairy, prepared without onion"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-3 border border-ivory rounded-xl text-xs font-bold text-maroon hover:bg-cream/50 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="flex-1 py-3 bg-maroon text-cream rounded-xl text-xs font-bold hover:bg-burgundy transition-all text-center disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isSavingItem ? (
                    <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
