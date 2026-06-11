// Brahma Kalasha — Mock Data for Development
// This data mirrors the database schema and will be replaced by API calls

import type {
  Category,
  MenuItem,
  Order,
  User,
  Address,
  DashboardStats,
} from "@/lib/types";

// ===================== CATEGORIES =====================

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "South Indian Tiffins",
    slug: "south-indian-tiffins",
    description: "Traditional steamed and griddled breakfast favorites",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "South Indian Veg Lunches",
    slug: "south-indian-veg-lunches",
    description: "Complete wholesome meals with rice and accompaniments",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Indian Veg Chaats",
    slug: "indian-veg-chaats",
    description: "Healthy twists on classic Indian street food",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Indian Sweets",
    slug: "indian-sweets",
    description: "Traditional desserts with natural sweeteners",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "cat-5",
    name: "Healthy Specials",
    slug: "healthy-specials",
    description: "Nutrient-dense meals for health-conscious eaters",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "cat-6",
    name: "Seasonal Specials",
    slug: "seasonal-specials",
    description: "Limited-time dishes using seasonal ingredients",
    sortOrder: 6,
    isActive: true,
  },
];

// ===================== MENU ITEMS =====================

export const mockMenuItems: MenuItem[] = [
  {
    id: "m1",
    categoryId: "cat-1",
    name: "Classic Idli Sambar",
    slug: "classic-idli-sambar",
    description:
      "4 soft, fluffy steamed rice cakes served with aromatic lentil sambar and fresh coconut chutney. Made with organic rice.",
    price: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 280 | Protein: 8g | Fiber: 4g",
    tags: ["Protein-Rich", "Low-Fat", "Probiotic"],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "m2",
    categoryId: "cat-1",
    name: "Ragi Masala Dosa",
    slug: "ragi-masala-dosa",
    description:
      "Crispy, nutritious finger-millet crepe filled with spiced potato mash, served with sambar and three chutneys.",
    price: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 350 | Protein: 10g | Iron: 6mg",
    tags: ["High-Fiber", "Gluten-Free", "Iron-Rich"],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "m3",
    categoryId: "cat-1",
    name: "Rava Upma Bowl",
    slug: "rava-upma-bowl",
    description:
      "Semolina porridge tempered with mustard, curry leaves, and vegetables. Light yet satisfying breakfast bowl.",
    price: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 220 | Protein: 6g | Fiber: 3g",
    tags: ["Low-Calorie", "Wholesome"],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "m4",
    categoryId: "cat-2",
    name: "Homestyle Veg Thali",
    slug: "homestyle-veg-thali",
    description:
      "Complete wholesome meal: 3 Chapati, Dal Tadka, Seasonal Sabzi, Jeera Rice, Raita, Pickle, and Papad.",
    price: 220,
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 650 | Protein: 22g | Complete meal",
    tags: ["Balanced-Diet", "Iron-Rich", "Complete Meal"],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "m5",
    categoryId: "cat-2",
    name: "Lemon Rice Box",
    slug: "lemon-rice-box",
    description:
      "Tangy, turmeric-infused lemon rice with peanuts, served with pickle, papad, and a side of curd.",
    price: 160,
    imageUrl:
      "https://images.unsplash.com/photo-1626082929543-34e857416cb4?w=800&auto=format&fit=crop&q=60",
    isHealthy: false,
    nutritionInfo: "Calories: 420 | Protein: 8g",
    tags: ["Vegan", "Quick Meal"],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "m6",
    categoryId: "cat-2",
    name: "Bisi Bele Bath",
    slug: "bisi-bele-bath",
    description:
      "Hearty Karnataka classic — rice, lentils, and vegetables cooked together with aromatic spice powder. Topped with ghee and cashews.",
    price: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 480 | Protein: 16g | Fiber: 8g",
    tags: ["High-Protein", "Traditional"],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "m7",
    categoryId: "cat-3",
    name: "Sprouts Bhel Puri",
    slug: "sprouts-bhel-puri",
    description:
      "A healthy twist on classic street food — loaded with fresh sprouts, microgreens, pomegranate, and tangy-sweet chutneys.",
    price: 90,
    imageUrl:
      "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 180 | Protein: 12g | Low-Fat",
    tags: ["High-Protein", "Low-Calorie", "Superfood"],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "m8",
    categoryId: "cat-3",
    name: "Dahi Puri",
    slug: "dahi-puri",
    description:
      "Crispy puri shells filled with spiced potatoes, sweet yogurt, tamarind chutney, and sev. A refreshing delight.",
    price: 110,
    imageUrl:
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&auto=format&fit=crop&q=60",
    isHealthy: false,
    nutritionInfo: "Calories: 250 | Protein: 6g",
    tags: ["Classic", "Refreshing"],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "m9",
    categoryId: "cat-4",
    name: "Jaggery Kesari Bath",
    slug: "jaggery-kesari-bath",
    description:
      "Traditional semolina pudding sweetened with pure jaggery, infused with saffron and cardamom, topped with roasted nuts.",
    price: 110,
    imageUrl:
      "https://images.unsplash.com/photo-1605197136262-d98c253ff75c?w=800&auto=format&fit=crop&q=60",
    isHealthy: false,
    nutritionInfo: "Calories: 320 | Refined-Sugar-Free",
    tags: ["Refined-Sugar-Free", "Traditional"],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "m10",
    categoryId: "cat-4",
    name: "Coconut Laddu",
    slug: "coconut-laddu",
    description:
      "Soft, melt-in-mouth coconut balls sweetened with condensed milk and flavored with cardamom. Pack of 4.",
    price: 130,
    imageUrl:
      "https://images.unsplash.com/photo-1666190059744-1137ef0afe44?w=800&auto=format&fit=crop&q=60",
    isHealthy: false,
    nutritionInfo: "Calories: 160 per piece",
    tags: ["Festive", "Traditional"],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "m11",
    categoryId: "cat-5",
    name: "Quinoa Vegetable Bowl",
    slug: "quinoa-vegetable-bowl",
    description:
      "Protein-packed quinoa with roasted seasonal vegetables, avocado, lemon-tahini dressing, and toasted seeds.",
    price: 250,
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 380 | Protein: 18g | Superfoods",
    tags: ["Superfood", "High-Protein", "Gluten-Free"],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "m12",
    categoryId: "cat-5",
    name: "Millet Power Salad",
    slug: "millet-power-salad",
    description:
      "Warm foxtail millet salad with chickpeas, bell peppers, cucumber, and a mint-coriander yogurt dressing.",
    price: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1540914124281-342587941389?w=800&auto=format&fit=crop&q=60",
    isHealthy: true,
    nutritionInfo: "Calories: 320 | Protein: 14g | Fiber: 10g",
    tags: ["High-Fiber", "Diabetic-Friendly", "Ancient Grain"],
    isActive: true,
    sortOrder: 2,
  },
];

// ===================== MOCK ORDERS =====================

export const mockOrders: Order[] = [
  {
    id: "ord-1",
    userId: "user-2",
    orderNumber: "BK-A1B2C001",
    status: "placed",
    subtotal: 240,
    tax: 12,
    deliveryFee: 0,
    discount: 0,
    total: 252,
    paymentMethod: "online",
    paymentStatus: "paid",
    deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    specialInstructions: "Please pack sambar separately",
    items: [
      {
        id: "oi-1",
        orderId: "ord-1",
        menuItemId: "m1",
        name: "Classic Idli Sambar",
        price: 120,
        quantity: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=800&auto=format&fit=crop&q=60",
      },
    ],
    addressId: "addr-1",
    address: {
      id: "addr-1",
      userId: "user-2",
      label: "Office",
      street: "123 Tech Park, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560066",
      instructions: "Leave at reception desk",
      isDefault: true,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ord-2",
    userId: "user-3",
    orderNumber: "BK-A1B2C002",
    status: "preparing",
    subtotal: 220,
    tax: 11,
    deliveryFee: 0,
    discount: 0,
    total: 231,
    paymentMethod: "cod",
    paymentStatus: "pending",
    deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    items: [
      {
        id: "oi-2",
        orderId: "ord-2",
        menuItemId: "m4",
        name: "Homestyle Veg Thali",
        price: 220,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60",
      },
    ],
    addressId: "addr-2",
    address: {
      id: "addr-2",
      userId: "user-3",
      label: "Home",
      street: "Hostel Block B, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560034",
      isDefault: true,
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "ord-3",
    userId: "user-4",
    orderNumber: "BK-A1B2C003",
    status: "ready",
    subtotal: 430,
    tax: 21.5,
    deliveryFee: 0,
    discount: 50,
    total: 401.5,
    paymentMethod: "online",
    paymentStatus: "paid",
    deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    specialInstructions: "Extra sambar please",
    items: [
      {
        id: "oi-3",
        orderId: "ord-3",
        menuItemId: "m4",
        name: "Homestyle Veg Thali",
        price: 220,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60",
      },
      {
        id: "oi-4",
        orderId: "ord-3",
        menuItemId: "m11",
        name: "Quinoa Vegetable Bowl",
        price: 250,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
      },
    ],
    addressId: "addr-3",
    address: {
      id: "addr-3",
      userId: "user-4",
      label: "Home",
      street: "42 Indiranagar, 12th Main",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560038",
      isDefault: true,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ord-4",
    userId: "user-5",
    orderNumber: "BK-A1B2C004",
    status: "out_for_delivery",
    subtotal: 300,
    tax: 15,
    deliveryFee: 0,
    discount: 0,
    total: 315,
    paymentMethod: "cod",
    paymentStatus: "pending",
    deliveryDate: new Date().toISOString(),
    items: [
      {
        id: "oi-5",
        orderId: "ord-4",
        menuItemId: "m2",
        name: "Ragi Masala Dosa",
        price: 150,
        quantity: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=60",
      },
    ],
    addressId: "addr-4",
    address: {
      id: "addr-4",
      userId: "user-5",
      label: "Home",
      street: "78, HSR Layout, Sector 2",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560102",
      instructions: "Ring the doorbell twice",
      isDefault: true,
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// ===================== MOCK STATS =====================

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 48750,
  totalOrders: 186,
  activeOrders: 23,
  totalCustomers: 142,
  avgOrderValue: 262,
  topItems: [
    { name: "Classic Idli Sambar", count: 48, revenue: 5760 },
    { name: "Homestyle Veg Thali", count: 36, revenue: 7920 },
    { name: "Ragi Masala Dosa", count: 32, revenue: 4800 },
    { name: "Quinoa Vegetable Bowl", count: 28, revenue: 7000 },
    { name: "Sprouts Bhel Puri", count: 24, revenue: 2160 },
  ],
  revenueByDay: [
    { date: "Mon", revenue: 6200, orders: 24 },
    { date: "Tue", revenue: 7800, orders: 30 },
    { date: "Wed", revenue: 5400, orders: 21 },
    { date: "Thu", revenue: 8200, orders: 32 },
    { date: "Fri", revenue: 9100, orders: 35 },
    { date: "Sat", revenue: 6500, orders: 25 },
    { date: "Sun", revenue: 5550, orders: 19 },
  ],
  ordersByStatus: [
    { status: "placed", count: 5 },
    { status: "confirmed", count: 3 },
    { status: "preparing", count: 8 },
    { status: "ready", count: 4 },
    { status: "out_for_delivery", count: 3 },
    { status: "delivered", count: 156 },
    { status: "cancelled", count: 7 },
  ],
};

// ===================== SETTINGS =====================

export const mockSettings = {
  cutoffTime: "21:00",
  deliveryFee: 0,
  freeDeliveryMinimum: 200,
  taxRate: 5,
  maxOrdersPerSlot: 50,
  serviceZones: ["Bangalore", "Mysore"],
};
