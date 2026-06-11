import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ===================== SETTINGS =====================
  const settings = [
    { key: 'cutoff_time', value: '21:00' },
    { key: 'delivery_fee', value: '0' },
    { key: 'free_delivery_minimum', value: '200' },
    { key: 'tax_rate', value: '5' },
    { key: 'max_orders_per_day', value: '200' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }
  console.log('Settings seeded.');

  // ===================== USERS =====================
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const kitchenHash = await bcrypt.hash('Kitchen@123', 12);
  const deliveryHash = await bcrypt.hash('Delivery@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@brahmakalasha.com' },
    create: {
      name: 'Admin User',
      email: 'admin@brahmakalasha.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
    },
    update: { passwordHash: adminHash, role: 'ADMIN' },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@brahmakalasha.com' },
    create: {
      name: 'Kitchen Staff',
      email: 'kitchen@brahmakalasha.com',
      passwordHash: kitchenHash,
      role: 'KITCHEN',
      isActive: true,
    },
    update: { passwordHash: kitchenHash, role: 'KITCHEN' },
  });

  const delivery = await prisma.user.upsert({
    where: { email: 'delivery@brahmakalasha.com' },
    create: {
      name: 'Delivery Driver',
      email: 'delivery@brahmakalasha.com',
      passwordHash: deliveryHash,
      role: 'DELIVERY',
      isActive: true,
    },
    update: { passwordHash: deliveryHash, role: 'DELIVERY' },
  });

  console.log('Users seeded:', admin.email, kitchen.email, delivery.email);

  // ===================== CATEGORIES =====================
  const categories = [
    {
      name: 'South Indian Tiffins',
      slug: 'south-indian-tiffins',
      description: 'Authentic South Indian breakfast and tiffin items',
      sortOrder: 1,
    },
    {
      name: 'South Indian Veg Lunches',
      slug: 'south-indian-veg-lunches',
      description: 'Complete South Indian vegetarian lunch thalis',
      sortOrder: 2,
    },
    {
      name: 'Indian Veg Chaats',
      slug: 'indian-veg-chaats',
      description: 'Popular Indian street food chaats',
      sortOrder: 3,
    },
    {
      name: 'Indian Sweets',
      slug: 'indian-sweets',
      description: 'Traditional Indian mithai and desserts',
      sortOrder: 4,
    },
    {
      name: 'Healthy Specials',
      slug: 'healthy-specials',
      description: 'Nutritious and healthy meal options',
      sortOrder: 5,
    },
    {
      name: 'Seasonal Specials',
      slug: 'seasonal-specials',
      description: 'Limited seasonal and festive dishes',
      sortOrder: 6,
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { ...cat, isActive: true },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log('Categories seeded.');

  // ===================== MENU ITEMS =====================
  const menuItems = [
    {
      categorySlug: 'south-indian-tiffins',
      name: 'Masala Dosa',
      slug: 'masala-dosa',
      description: 'Crispy golden dosa filled with spiced potato masala, served with coconut chutney and sambar',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
      isHealthy: false,
      sortOrder: 1,
    },
    {
      categorySlug: 'south-indian-tiffins',
      name: 'Idli Sambar',
      slug: 'idli-sambar',
      description: 'Soft steamed rice cakes served with flavorful sambar and fresh coconut chutney',
      price: 60,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400',
      isHealthy: true,
      sortOrder: 2,
    },
    {
      categorySlug: 'south-indian-tiffins',
      name: 'Medu Vada',
      slug: 'medu-vada',
      description: 'Crispy lentil donuts served with sambar and chutneys',
      price: 50,
      imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
      isHealthy: false,
      sortOrder: 3,
    },
    {
      categorySlug: 'south-indian-veg-lunches',
      name: 'South Indian Thali',
      slug: 'south-indian-thali',
      description: 'Complete thali with rice, sambar, rasam, kootu, pickle, papad, and dessert',
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      isHealthy: true,
      sortOrder: 1,
    },
    {
      categorySlug: 'south-indian-veg-lunches',
      name: 'Curd Rice',
      slug: 'curd-rice',
      description: 'Comforting yogurt rice tempered with mustard seeds, curry leaves, and green chilies',
      price: 70,
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      isHealthy: true,
      sortOrder: 2,
    },
    {
      categorySlug: 'indian-veg-chaats',
      name: 'Pani Puri',
      slug: 'pani-puri',
      description: 'Crispy hollow puris filled with spiced water, chickpeas, and chutneys',
      price: 60,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      isHealthy: false,
      sortOrder: 1,
    },
    {
      categorySlug: 'indian-veg-chaats',
      name: 'Bhel Puri',
      slug: 'bhel-puri',
      description: 'Puffed rice mixed with vegetables, chutneys and sev for a delightful crunch',
      price: 50,
      imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
      isHealthy: false,
      sortOrder: 2,
    },
    {
      categorySlug: 'indian-sweets',
      name: 'Gulab Jamun',
      slug: 'gulab-jamun',
      description: 'Soft milk-solid balls soaked in rose-flavored sugar syrup, served warm',
      price: 40,
      imageUrl: 'https://images.unsplash.com/photo-1666385778718-e18de7ebe62c?w=400',
      isHealthy: false,
      sortOrder: 1,
    },
    {
      categorySlug: 'indian-sweets',
      name: 'Kheer',
      slug: 'kheer',
      description: 'Creamy rice pudding slow-cooked with milk, sugar, cardamom, and dry fruits',
      price: 60,
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      isHealthy: false,
      sortOrder: 2,
    },
    {
      categorySlug: 'healthy-specials',
      name: 'Sprouts Salad',
      slug: 'sprouts-salad',
      description: 'Fresh mixed sprouts with cucumber, tomato, lemon, and spices',
      price: 70,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      isHealthy: true,
      sortOrder: 1,
    },
    {
      categorySlug: 'healthy-specials',
      name: 'Quinoa Upma',
      slug: 'quinoa-upma',
      description: 'Protein-rich quinoa cooked with vegetables and South Indian spices',
      price: 120,
      imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400',
      isHealthy: true,
      sortOrder: 2,
    },
    {
      categorySlug: 'seasonal-specials',
      name: 'Mango Lassi',
      slug: 'mango-lassi',
      description: 'Refreshing yogurt drink blended with fresh Alphonso mangoes',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
      isHealthy: false,
      sortOrder: 1,
    },
  ];

  const menuItemMap: Record<string, string> = {};
  for (const item of menuItems) {
    const { categorySlug, ...itemData } = item;
    const categoryId = categoryMap[categorySlug];

    const created = await prisma.menuItem.upsert({
      where: { slug: item.slug },
      create: { ...itemData, categoryId, isActive: true },
      update: { ...itemData, categoryId },
    });
    menuItemMap[item.slug] = created.id;
  }
  console.log('Menu items seeded.');

  // ===================== TOMORROW'S DAILY MENU =====================
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  for (const [slug, menuItemId] of Object.entries(menuItemMap)) {
    await prisma.dailyMenu.upsert({
      where: {
        date_menuItemId: {
          date: tomorrow,
          menuItemId,
        },
      },
      create: {
        date: tomorrow,
        menuItemId,
        availableQty: 100,
        remainingQty: 100,
        isAvailable: true,
      },
      update: {
        availableQty: 100,
        remainingQty: 100,
        isAvailable: true,
      },
    });
  }
  console.log(`Daily menu seeded for ${tomorrow.toDateString()}.`);

  console.log('\n=== Seed Complete ===');
  console.log('Admin: admin@brahmakalasha.com / Admin@123');
  console.log('Kitchen: kitchen@brahmakalasha.com / Kitchen@123');
  console.log('Delivery: delivery@brahmakalasha.com / Delivery@123');
  console.log(`Daily menu available for: ${tomorrow.toDateString()}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
