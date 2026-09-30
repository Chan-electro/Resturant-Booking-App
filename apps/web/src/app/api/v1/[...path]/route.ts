import { createHmac, timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { ApiError, requireAppUser, requireRole } from "@/lib/server/session";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ path: string[] }> };
type Json = Record<string, unknown>;

const ok = (data: unknown, extra: Json = {}) =>
  Response.json({ success: true, data, ...extra });

const fail = (message: string, status = 400) =>
  Response.json({ success: false, error: message }, { status });

async function body(request: NextRequest): Promise<Json> {
  try {
    return (await request.json()) as Json;
  } catch {
    return {};
  }
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateOnly(value: string | Date) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function dispatch(request: NextRequest, segments: string[]) {
  const method = request.method;
  const route = segments.join("/");
  const url = request.nextUrl;
  const user = await requireAppUser();

  if (method === "GET" && route === "auth/me") return ok(user);

  if (method === "GET" && route === "menu/categories") {
    const categories = await prisma.category.findMany({
      where: url.searchParams.get("all") === "true" ? {} : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return ok(categories);
  }

  if (method === "GET" && route === "menu/items") {
    const categoryId = url.searchParams.get("categoryId") || undefined;
    const items = await prisma.menuItem.findMany({
      where: { isActive: true, ...(categoryId ? { categoryId } : {}) },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return ok(items);
  }

  if (method === "GET" && segments[0] === "menu" && segments[1] === "items" && segments[2]) {
    const item = await prisma.menuItem.findUnique({
      where: { id: segments[2] },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!item) throw new ApiError("Menu item not found", 404);
    return ok(item);
  }

  if (method === "GET" && route === "menu/daily") {
    const today = dateOnly(url.searchParams.get("date") || new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const include = { menuItem: { include: { category: true, tags: { include: { tag: true } } } } };
    const [todayItems, tomorrowItems] = await Promise.all([
      prisma.dailyMenu.findMany({ where: { date: today, isAvailable: true }, include, orderBy: { menuItem: { sortOrder: "asc" } } }),
      prisma.dailyMenu.findMany({ where: { date: tomorrow, isAvailable: true }, include, orderBy: { menuItem: { sortOrder: "asc" } } }),
    ]);
    return ok({
      today: { date: today.toISOString().slice(0, 10), items: todayItems },
      tomorrow: { date: tomorrow.toISOString().slice(0, 10), items: tomorrowItems },
    });
  }

  if (method === "POST" && route === "menu/items") {
    requireRole(user, "ADMIN");
    const input = await body(request);
    const name = String(input.name || "").trim();
    if (!name || !input.categoryId || !input.description || !input.imageUrl) throw new ApiError("Missing menu item fields");
    return ok(await prisma.menuItem.create({ data: {
      name,
      slug: String(input.slug || slugify(name)),
      categoryId: String(input.categoryId),
      description: String(input.description),
      price: number(input.price),
      imageUrl: String(input.imageUrl),
      isHealthy: Boolean(input.isHealthy),
      nutritionInfo: input.nutritionInfo ? String(input.nutritionInfo) : null,
      prepNotes: input.prepNotes ? String(input.prepNotes) : null,
    } }));
  }

  if ((method === "PATCH" || method === "DELETE") && segments[0] === "menu" && segments[1] === "items" && segments[2]) {
    requireRole(user, "ADMIN");
    if (method === "DELETE") return ok(await prisma.menuItem.update({ where: { id: segments[2] }, data: { isActive: false } }));
    const input = await body(request);
    const allowed = ["name", "slug", "categoryId", "description", "price", "imageUrl", "isHealthy", "nutritionInfo", "prepNotes", "sortOrder", "isActive"];
    const data = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
    return ok(await prisma.menuItem.update({ where: { id: segments[2] }, data }));
  }

  if (method === "POST" && route === "menu/daily") {
    requireRole(user, "ADMIN");
    const input = await body(request);
    const date = dateOnly(String(input.date));
    const availableQty = Math.max(0, number(input.availableQty, 100));
    return ok(await prisma.dailyMenu.upsert({
      where: { date_menuItemId: { date, menuItemId: String(input.menuItemId) } },
      create: { date, menuItemId: String(input.menuItemId), availableQty, remainingQty: availableQty, isAvailable: input.isAvailable !== false },
      update: { availableQty, remainingQty: availableQty, isAvailable: input.isAvailable !== false },
    }));
  }

  if (method === "PATCH" && segments[0] === "menu" && segments[1] === "daily" && segments[2]) {
    requireRole(user, "ADMIN");
    const input = await body(request);
    return ok(await prisma.dailyMenu.update({ where: { id: segments[2] }, data: {
      ...(input.isAvailable !== undefined ? { isAvailable: Boolean(input.isAvailable) } : {}),
      ...(input.availableQty !== undefined ? { availableQty: number(input.availableQty) } : {}),
      ...(input.remainingQty !== undefined ? { remainingQty: number(input.remainingQty) } : {}),
    } }));
  }

  if (method === "GET" && route === "users/profile") return ok(await prisma.user.findUnique({ where: { id: user.id } }));

  if (method === "PATCH" && route === "users/profile") {
    const input = await body(request);
    return ok(await prisma.user.update({ where: { id: user.id }, data: {
      ...(input.name ? { name: String(input.name).trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone ? String(input.phone).trim() : null } : {}),
    } }));
  }

  if (method === "GET" && route === "users/addresses") {
    return ok(await prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }));
  }

  if (method === "POST" && route === "users/addresses") {
    const input = await body(request);
    if (!input.street || !input.city || !input.zip) throw new ApiError("Street, city and PIN code are required");
    const makeDefault = Boolean(input.isDefault);
    const address = await prisma.$transaction(async (tx) => {
      if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.address.create({ data: {
        userId: user.id,
        label: String(input.label || "Home"),
        street: String(input.street), city: String(input.city), state: String(input.state || "Karnataka"), zip: String(input.zip),
        instructions: input.instructions ? String(input.instructions) : null, isDefault: makeDefault,
      } });
    });
    return ok(address);
  }

  if (method === "DELETE" && segments[0] === "users" && segments[1] === "addresses" && segments[2]) {
    const found = await prisma.address.findFirst({ where: { id: segments[2], userId: user.id } });
    if (!found) throw new ApiError("Address not found", 404);
    await prisma.address.delete({ where: { id: found.id } });
    return ok({ deleted: true });
  }

  if (method === "POST" && route === "orders") {
    const input = await body(request);
    const items = Array.isArray(input.items) ? input.items as Array<{ menuItemId?: string; quantity?: number }> : [];
    if (!input.addressId || !input.deliveryDate || items.length === 0) throw new ApiError("Address, delivery date and items are required");
    const onlinePayment = input.paymentMethod === "ONLINE";
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (onlinePayment && (!keyId || !keySecret)) throw new ApiError("Online payments are not configured. Please choose cash on delivery.", 503);
    const deliveryDate = dateOnly(String(input.deliveryDate));
    if (deliveryDate <= dateOnly(new Date())) throw new ApiError("Delivery date must be in the future");
    const address = await prisma.address.findFirst({ where: { id: String(input.addressId), userId: user.id } });
    if (!address) throw new ApiError("Address not found", 404);

    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: items.map((item) => String(item.menuItemId)) }, isActive: true } });
    if (menuItems.length !== new Set(items.map((item) => item.menuItemId)).size) throw new ApiError("One or more menu items are unavailable");
    const rows = items.map((item) => {
      const menuItem = menuItems.find((entry) => entry.id === item.menuItemId)!;
      const quantity = Math.max(1, Math.floor(number(item.quantity, 1)));
      return { menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity, imageUrl: menuItem.imageUrl };
    });
    const subtotal = rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const settings = await prisma.setting.findMany({ where: { key: { in: ["tax_rate", "delivery_fee", "free_delivery_minimum", "cutoff_time"] } } });
    const setting = (key: string, fallback: number) => number(settings.find((item) => item.key === key)?.value, fallback);
    const cutoff = settings.find((item) => item.key === "cutoff_time")?.value || "21:00";
    const indiaTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
    if (indiaTime >= cutoff) throw new ApiError(`Orders close at ${cutoff} IST for next-day delivery`);
    const tax = Math.round(subtotal * (setting("tax_rate", 5) / 100) * 100) / 100;
    const deliveryFee = subtotal >= setting("free_delivery_minimum", 200) ? 0 : setting("delivery_fee", 0);
    const total = subtotal + tax + deliveryFee;
    const orderNumber = `MS${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
    const order = await prisma.$transaction(async (tx) => {
      for (const item of rows) {
        const availability = await tx.dailyMenu.findUnique({ where: { date_menuItemId: { date: deliveryDate, menuItemId: item.menuItemId } } });
        if (!availability?.isAvailable || availability.remainingQty < item.quantity) throw new ApiError(`${item.name} is unavailable for the selected date`);
      }
      const created = await tx.order.create({ data: {
        userId: user.id, addressId: address.id, orderNumber, subtotal, tax, deliveryFee, total,
        paymentMethod: onlinePayment ? "ONLINE" : "COD", deliveryDate,
        specialInstructions: input.specialInstructions ? String(input.specialInstructions) : null,
        items: { create: rows }, statusHistory: { create: { status: "PLACED", changedBy: user.id, note: "Order placed by customer" } },
      }, include: { items: true, address: true } });
      for (const item of rows) {
        const reserved = await tx.dailyMenu.updateMany({
          where: { date: deliveryDate, menuItemId: item.menuItemId, isAvailable: true, remainingQty: { gte: item.quantity } },
          data: { remainingQty: { decrement: item.quantity } },
        });
        if (reserved.count !== 1) throw new ApiError(`${item.name} sold out while the order was being placed`, 409);
      }
      await tx.notification.create({ data: { userId: user.id, title: "Order placed", body: `Order #${orderNumber} has been received.`, type: "ORDER_CONFIRMATION", data: { orderId: created.id } } });
      return created;
    });
    if (!onlinePayment) return ok(order);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` }, body: JSON.stringify({ amount: Math.round(total * 100), currency: "INR", receipt: orderNumber }) });
    if (!razorpayResponse.ok) throw new ApiError("Unable to initialize online payment", 502);
    const razorpay = await razorpayResponse.json() as { id: string; amount: number; currency: string };
    return ok({ order, razorpay: { ...razorpay, key: keyId } });
  }

  if (method === "GET" && route === "orders") {
    const page = Math.max(1, number(url.searchParams.get("page"), 1));
    const pageSize = Math.min(100, Math.max(1, number(url.searchParams.get("pageSize"), 10)));
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where: { userId: user.id }, include: { items: true, address: true, delivery: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.order.count({ where: { userId: user.id } }),
    ]);
    return ok(orders, { total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }

  if (method === "GET" && route === "orders/admin") {
    requireRole(user, "ADMIN", "KITCHEN", "DELIVERY");
    const status = url.searchParams.get("status") || undefined;
    const pageSize = Math.min(100, Math.max(1, number(url.searchParams.get("pageSize"), 20)));
    const page = Math.max(1, number(url.searchParams.get("page"), 1));
    const where = status ? { status: status as never } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, include: { items: true, address: true, delivery: true, user: { select: { id: true, name: true, email: true, phone: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.order.count({ where }),
    ]);
    return ok(orders, { total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }

  if (method === "GET" && route === "kitchen/orders") {
    requireRole(user, "ADMIN", "KITCHEN");
    return ok(await prisma.order.findMany({ where: { status: { in: ["PLACED", "CONFIRMED", "PREPARING", "READY"] } }, include: { items: true, address: true, user: { select: { id: true, name: true, phone: true } } }, orderBy: { createdAt: "asc" } }));
  }

  if (method === "PATCH" && segments[0] === "orders" && segments[2] === "status") {
    requireRole(user, "ADMIN", "KITCHEN", "DELIVERY");
    const input = await body(request);
    const status = String(input.status || "").toUpperCase();
    const allowed = ["CONFIRMED", "PREPARING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) throw new ApiError("Invalid order status");
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id: segments[1] }, data: { status: status as never } });
      await tx.orderStatusHistory.create({ data: { orderId: updated.id, status: status as never, changedBy: user.id, note: input.note ? String(input.note) : null } });
      await tx.notification.create({ data: { userId: updated.userId, title: "Order status updated", body: `Order #${updated.orderNumber} is now ${status.replaceAll("_", " ").toLowerCase()}.`, type: "ORDER_STATUS", data: { orderId: updated.id, status } } });
      return updated;
    });
    return ok(order);
  }

  if (method === "POST" && segments[0] === "orders" && segments[2] === "verify-payment") {
    const input = await body(request);
    const order = await prisma.order.findFirst({ where: { id: segments[1], userId: user.id } });
    if (!order) throw new ApiError("Order not found", 404);
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new ApiError("Payment verification is not configured", 503);
    const expected = createHmac("sha256", secret).update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`).digest();
    const supplied = Buffer.from(String(input.razorpaySignature || ""), "hex");
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new ApiError("Invalid payment signature", 400);
    return ok(await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" }, include: { items: true, address: true } }));
  }

  if (method === "GET" && route === "delivery/available") {
    requireRole(user, "ADMIN", "DELIVERY");
    return ok(await prisma.order.findMany({ where: { status: "READY", delivery: null }, include: { items: true, address: true, user: { select: { id: true, name: true, phone: true } } }, orderBy: { updatedAt: "asc" } }));
  }

  if (method === "GET" && route === "delivery/assignments") {
    requireRole(user, "ADMIN", "DELIVERY");
    return ok(await prisma.delivery.findMany({ where: { driverId: user.id, status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] } }, include: { order: { include: { items: true, address: true, user: { select: { id: true, name: true, phone: true } } } } }, orderBy: { createdAt: "desc" } }));
  }

  if (method === "GET" && route === "delivery/history") {
    requireRole(user, "ADMIN", "DELIVERY");
    const deliveries = await prisma.delivery.findMany({ where: { driverId: user.id, status: "DELIVERED" }, include: { order: { include: { items: true, address: true, user: { select: { id: true, name: true } } } } }, orderBy: { deliveredAt: "desc" }, take: 50 });
    return ok(deliveries);
  }

  if (method === "PATCH" && segments[0] === "delivery" && segments[2] === "accept") {
    requireRole(user, "ADMIN", "DELIVERY");
    const order = await prisma.order.findFirst({ where: { id: segments[1], status: "READY", delivery: null } });
    if (!order) throw new ApiError("Order is no longer available", 409);
    const delivery = await prisma.$transaction(async (tx) => {
      const created = await tx.delivery.create({ data: { orderId: order.id, driverId: user.id } });
      await tx.order.update({ where: { id: order.id }, data: { status: "ASSIGNED" } });
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "ASSIGNED", changedBy: user.id, note: "Accepted by delivery partner" } });
      return created;
    });
    return ok(delivery);
  }

  if (method === "PATCH" && segments[0] === "delivery" && ["pickup", "deliver"].includes(segments[2])) {
    requireRole(user, "ADMIN", "DELIVERY");
    const input = await body(request);
    const delivery = await prisma.delivery.findFirst({ where: { id: segments[1], driverId: user.id }, include: { order: true } });
    if (!delivery) throw new ApiError("Delivery not found", 404);
    if (segments[2] === "pickup") {
      if (delivery.status !== "ASSIGNED") throw new ApiError("Delivery is not ready for pickup", 409);
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.delivery.update({ where: { id: delivery.id }, data: { status: "PICKED_UP", pickedUpAt: new Date() } });
        await tx.order.update({ where: { id: delivery.orderId }, data: { status: "OUT_FOR_DELIVERY" } });
        await tx.orderStatusHistory.create({ data: { orderId: delivery.orderId, status: "OUT_FOR_DELIVERY", changedBy: user.id, note: "Order picked up" } });
        return updated;
      });
      return ok(result);
    }
    if (!["PICKED_UP", "IN_TRANSIT"].includes(delivery.status)) throw new ApiError("Order must be picked up first", 409);
    const result = await prisma.$transaction(async (tx) => {
      const codCollected = input.codCollected === undefined ? undefined : number(input.codCollected);
      const updated = await tx.delivery.update({ where: { id: delivery.id }, data: { status: "DELIVERED", deliveredAt: new Date(), ...(codCollected !== undefined ? { codCollected } : {}) } });
      await tx.order.update({ where: { id: delivery.orderId }, data: { status: "DELIVERED", ...(codCollected !== undefined ? { paymentStatus: "PAID" } : {}) } });
      await tx.orderStatusHistory.create({ data: { orderId: delivery.orderId, status: "DELIVERED", changedBy: user.id, note: "Order delivered" } });
      return updated;
    });
    return ok(result);
  }

  if (method === "GET" && route === "admin/users") {
    requireRole(user, "ADMIN");
    const role = url.searchParams.get("role") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const page = Math.max(1, number(url.searchParams.get("page"), 1));
    const pageSize = 20;
    const where = { ...(role ? { role: role as never } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [users, total] = await Promise.all([prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), prisma.user.count({ where })]);
    return ok(users, { total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }

  if (method === "POST" && route === "admin/users") {
    requireRole(user, "ADMIN");
    const input = await body(request);
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    if (!email || password.length < 8) throw new ApiError("A valid email and 8-character password are required");
    const [firstName, ...rest] = String(input.name || "User").trim().split(/\s+/);
    const clerk = await clerkClient();
    const created = await clerk.users.createUser({ emailAddress: [email], password, firstName, lastName: rest.join(" ") || undefined });
    return ok(await prisma.user.create({ data: { clerkId: created.id, name: String(input.name || email), email, phone: input.phone ? String(input.phone) : null, role: ["CUSTOMER", "KITCHEN", "DELIVERY", "ADMIN"].includes(String(input.role)) ? String(input.role) as never : "CUSTOMER", avatarUrl: created.imageUrl } }));
  }

  if (method === "PATCH" && segments[0] === "admin" && segments[1] === "users" && segments[3] === "role") {
    requireRole(user, "ADMIN");
    const input = await body(request);
    const role = String(input.role || "");
    if (!["CUSTOMER", "KITCHEN", "DELIVERY", "ADMIN"].includes(role)) throw new ApiError("Invalid role");
    if (segments[2] === user.id && role !== "ADMIN") throw new ApiError("You cannot remove your own admin access", 409);
    return ok(await prisma.user.update({ where: { id: segments[2] }, data: { role: role as never } }));
  }

  if (method === "PATCH" && segments[0] === "admin" && segments[1] === "users" && segments[3] === "status") {
    requireRole(user, "ADMIN");
    const input = await body(request);
    if (segments[2] === user.id && !input.isActive) throw new ApiError("You cannot disable your own account", 409);
    return ok(await prisma.user.update({ where: { id: segments[2] }, data: { isActive: Boolean(input.isActive) } }));
  }

  if (method === "GET" && route === "admin/coupons") {
    requireRole(user, "ADMIN");
    return ok(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
  }

  if (method === "POST" && route === "admin/coupons") {
    requireRole(user, "ADMIN");
    const input = await body(request);
    return ok(await prisma.coupon.create({ data: { code: String(input.code || "").toUpperCase(), type: String(input.type) as never, value: number(input.value), minOrder: number(input.minOrder), maxDiscount: input.maxDiscount === undefined ? null : number(input.maxDiscount), validFrom: new Date(String(input.validFrom)), validUntil: new Date(String(input.validUntil)), usageLimit: number(input.usageLimit, 100), isActive: input.isActive !== false } }));
  }

  if (method === "GET" && route === "settings") {
    requireRole(user, "ADMIN");
    return ok(await prisma.setting.findMany({ orderBy: { key: "asc" } }));
  }

  if (method === "PATCH" && segments[0] === "settings" && segments[1]) {
    requireRole(user, "ADMIN");
    const input = await body(request);
    return ok(await prisma.setting.upsert({ where: { key: segments[1] }, create: { key: segments[1], value: String(input.value ?? ""), updatedBy: user.id }, update: { value: String(input.value ?? ""), updatedBy: user.id } }));
  }

  if (method === "GET" && route === "analytics/dashboard") {
    requireRole(user, "ADMIN");
    const [completed, totalOrders, activeOrders, totalCustomers, items, recentOrders] = await Promise.all([
      prisma.order.aggregate({ where: { status: { in: ["DELIVERED", "COMPLETED"] } }, _sum: { total: true } }),
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { status: { in: ["PLACED", "CONFIRMED", "PREPARING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY"] } } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.orderItem.groupBy({ by: ["name"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
      prisma.order.findMany({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) }, status: { not: "CANCELLED" } }, select: { createdAt: true, total: true } }),
    ]);
    const revenueByDay = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - (6 - index));
      const key = day.toISOString().slice(0, 10);
      const matching = recentOrders.filter((order) => order.createdAt.toISOString().slice(0, 10) === key);
      return { date: key, revenue: matching.reduce((sum, order) => sum + order.total, 0), orders: matching.length };
    });
    const statusCounts = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
    const totalRevenue = completed._sum.total || 0;
    return ok({ totalRevenue, totalOrders, activeOrders, totalCustomers, avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0, topItems: items.map((item) => ({ name: item.name, count: item._sum.quantity || 0, revenue: 0 })), revenueByDay, ordersByStatus: statusCounts.map((item) => ({ status: item.status, count: item._count._all })) });
  }

  throw new ApiError(`Endpoint not implemented: ${method} /api/v1/${route}`, 404);
}

async function handle(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    return await dispatch(request, path);
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.status);
    console.error("API request failed", error);
    return fail(process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Internal server error", 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
