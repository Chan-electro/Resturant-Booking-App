"use client";

import { useState, useEffect } from "react";
import {
  Leaf,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  UserCircle,
  Clock,
  CheckCircle,
  ChevronLeft,
  Star,
  Heart,
  Search,
  X,
  MapPin,
} from "lucide-react";
import { useCart } from "@/lib/store";
import type { MenuItem, Category, Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";
import { cn, formatPrice, getDeliveryDateLabel, getCountdownToTime } from "@/lib/utils";
import { menuApi, ordersApi, usersApi } from "@/lib/api";
import ProfileDropdown from "@/components/ProfileDropdown";

type View = "menu" | "cart" | "checkout" | "success" | "orders";

export default function CustomerApp() {
  const cart = useCart();
  const [view, setView] = useState<View>("menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [countdown, setCountdown] = useState(getCountdownToTime());
  const [loading, setLoading] = useState(true);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // User's order list
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "Bangalore",
    state: "Karnataka",
    zip: "",
    instructions: "",
  });
  const [payment, setPayment] = useState<"cod" | "online">("online");

  // Load menu and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, dailyRes] = await Promise.all([
          menuApi.categories(),
          menuApi.daily(),
        ]);
        if (catRes.success && catRes.data) {
          const cats = catRes.data as Category[];
          setCategories(cats);
          if (cats.length > 0) setActiveCategory(cats[0].id);
        }
        if (dailyRes.success && dailyRes.data) {
          const rawItems = (dailyRes.data as any).tomorrow?.items || [];
          const mapped: MenuItem[] = rawItems.map((entry: any) => {
            const dbItem = entry.menuItem;
            return {
              id: dbItem.id,
              categoryId: dbItem.categoryId,
              name: dbItem.name,
              slug: dbItem.slug,
              description: dbItem.description,
              price: dbItem.price,
              imageUrl: dbItem.imageUrl,
              isHealthy: dbItem.isHealthy,
              nutritionInfo: dbItem.nutritionInfo || undefined,
              prepNotes: dbItem.prepNotes || undefined,
              tags: dbItem.tags ? dbItem.tags.map((t: any) => t.tag?.name || t.tagId) : [],
              isActive: dbItem.isActive,
              sortOrder: dbItem.sortOrder,
            };
          });
          setMenuItems(mapped);
        }
      } catch (err) {
        console.error("Failed to load customer menu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load orders when view becomes "orders"
  useEffect(() => {
    if (view === "orders") {
      setLoadingOrders(true);
      ordersApi.list(1, 20).then((res) => {
        if (res.success && res.data) {
          const rawOrders = res.data as any[];
          const mapped: Order[] = rawOrders.map((o: any) => ({
            ...o,
            status: o.status.toLowerCase() as OrderStatus,
            paymentMethod: o.paymentMethod.toLowerCase() as PaymentMethod,
            paymentStatus: o.paymentStatus.toLowerCase() as PaymentStatus,
          }));
          setUserOrders(mapped);
        }
      }).catch((err) => {
        console.error("Failed to load orders:", err);
      }).finally(() => {
        setLoadingOrders(false);
      });
    }
  }, [view]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdownToTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = item.categoryId === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isActive;
  });

  const getQty = (id: string) =>
    cart.items.find((c) => c.menuItem.id === id)?.quantity || 0;

  const handleAdd = (item: MenuItem) => {
    cart.addItem({ menuItem: item, quantity: 1 });
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderId: string, razorpayData: any) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load Razorpay SDK. Please check your internet connection.");
      return;
    }

    const options = {
      key: razorpayData.key,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      name: "Brahma Kalasha",
      description: "Pre-order Vegetarian Meal",
      order_id: razorpayData.id,
      handler: async function (response: any) {
        try {
          const verifyRes = await ordersApi.verifyPayment(orderId, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature || "",
          });
          if (verifyRes.success) {
            setView("success");
          } else {
            alert("Payment verification failed: " + (verifyRes.error || "Unknown error"));
          }
        } catch (err) {
          console.error("Payment verification failed:", err);
          alert("Failed to verify payment with server.");
        }
      },
      prefill: {
        name: name,
        contact: phone,
      },
      theme: {
        color: "#4B0F16",
      },
      modal: {
        ondismiss: function () {
          alert("Payment cancelled. You can complete/view your order in My Orders.");
          setView("orders");
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Add Address
      const addrRes = await usersApi.addAddress({
        label: "Delivery",
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        instructions: address.instructions || undefined,
        isDefault: true,
      });

      if (!addrRes.success || !addrRes.data) {
        alert("Failed to save delivery address: " + (addrRes.error || "Unknown error"));
        return;
      }

      const addressId = (addrRes.data as any).id;

      // 2. Map items
      const items = cart.items.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
      }));

      // Delivery Date is tomorrow
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 1);

      // 3. Place Order
      const orderRes = await ordersApi.place({
        addressId,
        deliveryDate: deliveryDate.toISOString().split("T")[0],
        items,
        paymentMethod: payment === "online" ? "ONLINE" : "COD",
        specialInstructions: address.instructions || undefined,
      });

      if (orderRes.success && orderRes.data) {
        cart.clearCart();
        const rawOrder = (orderRes.data as any).order || orderRes.data;
        const razorpayData = (orderRes.data as any).razorpay;

        setLastPlacedOrder({
          ...rawOrder,
          status: rawOrder.status.toLowerCase() as OrderStatus,
          paymentMethod: rawOrder.paymentMethod.toLowerCase() as PaymentMethod,
          paymentStatus: rawOrder.paymentStatus.toLowerCase() as PaymentStatus,
        });

        if (payment === "online" && razorpayData) {
          await handleRazorpayPayment(rawOrder.id, razorpayData);
        } else {
          setView("success");
        }
      } else {
        alert("Failed to place order: " + (orderRes.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("An unexpected error occurred during checkout.");
    }
  };

  // ==================== SUCCESS VIEW ====================
  if (view === "success") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md md:max-w-xl bg-white rounded-3xl border border-ivory shadow-lg p-6 md:p-10 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/25 to-transparent pointer-events-none" />
          <div className="flex-grow flex flex-col items-center justify-center text-center relative z-10 animate-scale-in">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
              <CheckCircle className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-maroon mb-3 font-display">
              Order Confirmed!
            </h2>
            <p className="text-maroon/70 mb-8 px-4 leading-relaxed text-sm md:text-base">
              Your wholesome vegetarian meal is booked for{" "}
              <strong>{getDeliveryDateLabel()}</strong>. The kitchen has received
              your order.
            </p>

            <div className="bg-cream/45 p-6 rounded-2xl w-full border border-ivory/60 text-left relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 bg-ivory/20 w-32 h-32 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-4 text-sm md:text-base">
                <div className="flex justify-between border-b border-ivory/60 pb-4">
                  <span className="text-maroon/60 font-medium">Order Number</span>
                  <span className="font-bold text-maroon font-mono text-sm">
                    {lastPlacedOrder?.orderNumber || "BK-XXXX"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-ivory/60 pb-4">
                  <span className="text-maroon/60 font-medium">Delivery</span>
                  <span className="font-bold text-maroon">
                    {getDeliveryDateLabel()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-maroon/60 font-medium">Total</span>
                  <span className="font-bold text-maroon text-lg">
                    {formatPrice(lastPlacedOrder?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="z-10 relative space-y-3">
            <button
              onClick={() => {
                setView("orders");
              }}
              className="w-full py-3.5 bg-white text-maroon font-bold rounded-xl border border-ivory shadow-sm hover:bg-cream transition-colors text-sm md:text-base"
            >
              View My Orders
            </button>
            <button
              onClick={() => setView("menu")}
              className="w-full py-3.5 bg-maroon text-cream font-bold rounded-xl shadow-sm hover:bg-burgundy transition-colors active:scale-[0.98] text-sm md:text-base"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ORDERS VIEW ====================
  if (view === "orders") {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-screen bg-cream pb-safe md:py-8 px-4">
        <header className="bg-white p-4 rounded-b-2xl md:rounded-2xl sticky top-0 md:relative z-30 flex items-center gap-3 border border-ivory shadow-sm mb-6">
          <button
            onClick={() => setView("menu")}
            className="w-10 h-10 rounded-full border border-ivory flex items-center justify-center hover:bg-cream transition-colors text-maroon"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-maroon font-display">My Orders</h1>
        </header>

        <main>
          {loadingOrders ? (
            <div className="py-20 text-center">
              <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-maroon/50 font-medium">Loading orders...</p>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-ivory">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-ivory" />
              <p className="text-maroon/50 font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-ivory shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-ivory flex justify-between items-center bg-cream/20">
                    <div>
                      <p className="font-mono text-xs text-maroon/50">
                        {order.orderNumber}
                      </p>
                      <p className="font-bold text-maroon mt-1 text-lg">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border",
                        order.status === "delivered" || order.status === "completed"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : order.status === "cancelled"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : order.status === "preparing"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-beige text-maroon border-beige"
                      )}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-grow">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-maroon/70">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-maroon">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 bg-cream/10 border-t border-ivory/50 flex justify-between items-center text-xs text-maroon/50">
                    <span>Delivery: {getDeliveryDateLabel()}</span>
                    <span>Method: {order.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==================== CART / CHECKOUT VIEW ====================
  if (view === "cart" || view === "checkout") {
    return (
      <div className="w-full max-w-5xl mx-auto min-h-screen bg-cream pb-safe relative px-4 md:py-8">
        <header className="bg-white p-4 rounded-b-2xl md:rounded-2xl sticky top-0 md:relative z-30 flex items-center justify-between border border-ivory shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("menu")}
              className="w-10 h-10 rounded-full border border-ivory flex items-center justify-center hover:bg-cream transition-colors text-maroon"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-maroon font-display">Checkout</h1>
          </div>
          <span className="text-sm text-maroon/50 font-medium">
            {cart.totalItems} items
          </span>
        </header>

        <main className="p-0 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
          {/* Order Summary */}
          <section className="lg:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-ivory h-fit">
            <h2 className="text-xs font-bold text-maroon/60 uppercase tracking-widest mb-4 border-b border-ivory pb-3">
              {getDeliveryDateLabel()} — Order
            </h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex justify-between items-center bg-cream p-3 rounded-xl border border-ivory/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-lg bg-ivory overflow-hidden shrink-0 border border-ivory/50">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-maroon text-sm leading-tight truncate">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-gold font-bold text-sm mt-1">
                        {formatPrice(item.menuItem.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-ivory h-fit shrink-0 ml-3">
                    <button
                      onClick={() =>
                        cart.updateQty(item.menuItem.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded bg-cream flex items-center justify-center text-maroon border border-ivory/50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-maroon">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        cart.updateQty(item.menuItem.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded bg-maroon flex items-center justify-center text-cream"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-5 pt-4 border-t border-ivory text-sm">
              <div className="flex justify-between text-maroon/60 font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-maroon/60 font-medium">
                <span>Tax (5%)</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="flex justify-between text-maroon/60 font-medium">
                <span>Delivery</span>
                <span
                  className={cn(
                    "font-bold",
                    cart.deliveryFee === 0
                      ? "text-green-600 bg-green-50 px-2 rounded"
                      : ""
                  )}
                >
                  {cart.deliveryFee === 0 ? "Free" : formatPrice(cart.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-xl text-maroon pt-3 border-t border-ivory mt-3">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
          </section>

          {/* Delivery Form */}
          <form
            id="checkout-form"
            onSubmit={handleCheckout}
            className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-ivory space-y-5"
          >
            <h2 className="text-xs font-bold text-maroon/60 uppercase tracking-widest mb-1">
              Delivery Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-maroon mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-maroon mb-1.5">
                  Phone
                </label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon mb-1.5">
                Delivery Address
              </label>
              <input
                required
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                type="text"
                className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                placeholder="House/Flat No., Street, Locality"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-maroon mb-1.5">
                  PIN Code
                </label>
                <input
                  required
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  type="text"
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                  placeholder="560001"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-maroon mb-1.5">
                  Instructions{" "}
                  <span className="text-maroon/40 font-normal">(Optional)</span>
                </label>
                <input
                  value={address.instructions}
                  onChange={(e) =>
                    setAddress({ ...address, instructions: e.target.value })
                  }
                  type="text"
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                  placeholder="e.g. Leave at door"
                />
              </div>
            </div>

            <h2 className="text-xs font-bold text-maroon/60 uppercase tracking-widest mt-6 mb-2 pt-5 border-t border-ivory">
              Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPayment("online")}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  payment === "online"
                    ? "bg-gold/10 border-gold text-maroon shadow-sm"
                    : "bg-cream border-ivory text-maroon/60 hover:border-gold/50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-ivory">
                  💳
                </div>
                <span className="font-bold text-sm">Pay Online</span>
              </button>
              <button
                type="button"
                onClick={() => setPayment("cod")}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  payment === "cod"
                    ? "bg-gold/10 border-gold text-maroon shadow-sm"
                    : "bg-cream border-ivory text-maroon/60 hover:border-gold/50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-ivory">
                  💵
                </div>
                <span className="font-bold text-sm">Cash on Delivery</span>
              </button>
            </div>

            {/* Desktop Place Order Button */}
            <div className="hidden md:block mt-6">
              <button
                form="checkout-form"
                type="submit"
                disabled={cart.totalItems === 0}
                className="w-full py-4 bg-maroon text-cream font-bold text-lg rounded-xl shadow-sm hover:bg-burgundy transition-all flex justify-between items-center px-6 disabled:opacity-50 active:scale-[0.98]"
              >
                <span>Place Order</span>
                <span className="bg-cream/20 px-3 py-1 rounded-lg">
                  {formatPrice(cart.total)}
                </span>
              </button>
            </div>
          </form>
        </main>

        {/* Mobile Place Order Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-ivory p-4 pb-safe z-20 shadow-[0_-4px_20px_rgba(75,15,22,0.05)]">
          <button
            form="checkout-form"
            type="submit"
            disabled={cart.totalItems === 0}
            className="w-full py-4 bg-maroon text-cream font-bold text-lg rounded-xl shadow-sm hover:bg-burgundy transition-all flex justify-between items-center px-6 disabled:opacity-50 active:scale-[0.98]"
          >
            <span>Place Order</span>
            <span className="bg-cream/20 px-3 py-1 rounded-lg">
              {formatPrice(cart.total)}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== MENU VIEW (Home) ====================
  return (
    <div className="w-full min-h-screen bg-cream relative pb-24">
      {/* Header */}
      <header className="text-cream px-6 pt-12 pb-10 shadow-sm relative z-30 overflow-visible max-w-md lg:max-w-6xl mx-auto lg:mt-6">
        {/* Background rounded wrapper to clip blur circles */}
        <div className="absolute inset-0 bg-maroon rounded-b-[2rem] lg:rounded-[2rem] overflow-hidden pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] lg:rounded-[2rem] pointer-events-none">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-burgundy rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <img
            src="/logo.png"
            alt="Brahma Kalasha"
            className="h-8 w-auto brightness-0 invert"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("orders")}
              className="w-11 h-11 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors border border-cream/20 backdrop-blur-sm"
            >
              <ShoppingBag className="w-5 h-5 text-cream" />
            </button>
            <ProfileDropdown />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl font-bold leading-tight font-display">
            Tomorrow&apos;s
            <br />
            Fresh Menu
          </h1>
          <p className="text-cream/70 text-sm font-medium">
            {getDeliveryDateLabel()} Delivery
          </p>

          {/* Countdown */}
          {!countdown.isExpired ? (
            <div className="inline-flex items-center gap-3 bg-burgundy/60 backdrop-blur px-4 py-2.5 rounded-xl text-sm font-medium border border-cream/10">
              <Clock className="w-4 h-4 text-gold" />
              <span>Closes in</span>
              <div className="flex gap-1.5">
                <span className="bg-cream/15 px-2 py-0.5 rounded font-bold font-mono">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-gold">:</span>
                <span className="bg-cream/15 px-2 py-0.5 rounded font-bold font-mono">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-gold">:</span>
                <span className="bg-cream/15 px-2 py-0.5 rounded font-bold font-mono">
                  {String(countdown.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-red-900/40 backdrop-blur px-4 py-2.5 rounded-xl text-sm font-bold border border-red-400/20">
              ⏰ Ordering closed for tomorrow
            </div>
          )}
        </div>
      </header>

      {/* Search Toggle */}
      <div className="px-5 mt-6 relative z-20 max-w-md lg:max-w-6xl mx-auto lg:px-8">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-ivory flex items-center gap-3 text-maroon/40 hover:border-gold/30 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-sm font-medium">Search dishes...</span>
        </button>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="px-5 mt-3 animate-slide-down max-w-md lg:max-w-6xl mx-auto lg:px-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maroon/40" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gold/30 rounded-xl pl-12 pr-12 py-3.5 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-gold/30 shadow-sm"
              placeholder="Search by dish name..."
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearch(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-ivory flex items-center justify-center text-maroon/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="px-4 py-6 hide-scrollbar overflow-x-auto lg:overflow-visible max-w-md lg:max-w-6xl mx-auto lg:px-8">
        <div className="flex lg:flex-wrap gap-2.5 px-1 w-max lg:w-full">
          {loading ? (
            <div className="flex gap-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-24 h-10 bg-white border border-ivory rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2.5 rounded-full text-sm font-bold shadow-sm whitespace-nowrap transition-all duration-200 border",
                  activeCategory === cat.id
                    ? "bg-maroon border-maroon text-cream scale-105 shadow-md"
                    : "bg-white border-ivory text-maroon/70 hover:bg-cream hover:border-gold/30"
                )}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Responsive Columns Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-5 lg:px-8 max-w-md lg:max-w-6xl mx-auto">
        {/* Menu Items (now a grid on tablet/desktop) */}
        <main className="lg:col-span-8 space-y-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center col-span-full">
              <p className="text-maroon/40 font-medium">
                No dishes found in this category
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-ivory flex gap-4 transition-transform active:scale-[0.99] relative overflow-hidden group h-fit"
              >
                <div className="w-[100px] h-[110px] rounded-2xl overflow-hidden bg-cream shrink-0 relative border border-ivory/50">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.isHealthy && (
                    <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Healthy
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="font-bold text-maroon leading-tight pr-2 text-base">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-maroon/55 line-clamp-2 leading-relaxed mt-1">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-ivory font-bold text-maroon/65 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-3 -mb-0.5">
                    <span className="font-bold text-lg text-gold">
                      {formatPrice(item.price)}
                    </span>

                    {getQty(item.id) > 0 ? (
                      <div className="flex items-center gap-3 bg-cream rounded-xl p-1 shadow-sm border border-ivory">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cart.updateQty(item.id, getQty(item.id) - 1);
                          }}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-maroon shadow-sm border border-ivory/50 hover:bg-cream transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-bold text-maroon">
                          {getQty(item.id)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cart.updateQty(item.id, getQty(item.id) + 1);
                          }}
                          className="w-8 h-8 rounded-lg bg-maroon flex items-center justify-center text-cream shadow-sm hover:bg-burgundy transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(item);
                        }}
                        className="bg-cream text-maroon font-bold px-5 py-2 text-sm rounded-xl hover:bg-gold hover:text-white transition-colors shadow-sm border border-ivory"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Persistent desktop cart sidebar (hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-4 h-fit sticky top-6">
          <div className="bg-white rounded-[1.25rem] border border-ivory shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-ivory pb-4">
              <h2 className="text-lg font-bold text-maroon font-display flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                Your Order
              </h2>
              <span className="text-xs font-bold text-cream bg-gold px-2.5 py-1 rounded-full">
                {cart.totalItems} items
              </span>
            </div>

            {cart.items.length === 0 ? (
              <div className="py-12 text-center text-maroon/40 space-y-3">
                <div className="w-12 h-12 rounded-full bg-cream border border-ivory flex items-center justify-center mx-auto text-xl">
                  🛒
                </div>
                <p className="text-sm font-semibold">Your cart is empty</p>
                <p className="text-xs leading-relaxed max-w-[180px] mx-auto">
                  Add delicious wholesome meals from the menu.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
                  {cart.items.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex justify-between items-center bg-cream p-3 rounded-xl border border-ivory/50"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <h4 className="font-bold text-maroon text-xs leading-tight truncate">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-gold font-bold text-xs mt-1">
                          {formatPrice(item.menuItem.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white rounded-lg p-0.5 border border-ivory shrink-0">
                        <button
                          onClick={() =>
                            cart.updateQty(item.menuItem.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded bg-cream flex items-center justify-center text-maroon border border-ivory/50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-bold text-maroon">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            cart.updateQty(item.menuItem.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded bg-maroon flex items-center justify-center text-cream"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-ivory text-xs md:text-sm">
                  <div className="flex justify-between text-maroon/60 font-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-maroon/60 font-medium">
                    <span>Tax (5%)</span>
                    <span>{formatPrice(cart.tax)}</span>
                  </div>
                  <div className="flex justify-between text-maroon/60 font-medium">
                    <span>Delivery</span>
                    <span
                      className={cn(
                        "font-bold",
                        cart.deliveryFee === 0
                          ? "text-green-600 bg-green-50 px-2 rounded"
                          : ""
                      )}
                    >
                      {cart.deliveryFee === 0 ? "Free" : formatPrice(cart.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-maroon pt-3 border-t border-ivory mt-2">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setView("checkout")}
                  className="w-full py-3.5 bg-maroon text-cream font-bold rounded-xl shadow-md hover:bg-burgundy transition-all flex justify-between items-center px-4 active:scale-[0.98] text-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button (hidden on desktop) */}
      {cart.totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 w-full max-w-md mx-auto px-5 z-30 animate-slide-up lg:hidden">
          <button
            onClick={() => setView("cart")}
            className="w-full bg-maroon text-cream p-4 rounded-[1.25rem] shadow-[0_8px_30px_rgb(75,15,22,0.3)] flex justify-between items-center hover:bg-burgundy transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="bg-cream/10 border border-cream/20 w-12 h-12 rounded-xl flex items-center justify-center relative backdrop-blur-sm">
                <ShoppingBag className="w-6 h-6 text-gold" />
                <span className="absolute -top-2 -right-2 bg-gold text-maroon text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-sm">
                  {cart.totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="font-bold tracking-wide text-base">View Cart</p>
                <p className="text-sm text-gold">{formatPrice(cart.subtotal)}</p>
              </div>
            </div>
            <div className="bg-cream/10 p-2.5 rounded-xl border border-cream/20">
              <ArrowRight className="w-5 h-5 text-gold" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
