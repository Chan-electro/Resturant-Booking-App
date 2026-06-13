"use client";

import {
  Package,
  MapPin,
  Phone,
  CheckCircle,
  Navigation,
  IndianRupee,
  Clock,
  History,
  Check,
  TrendingUp,
  User,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Crosshair,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";
import { cn, formatPrice, formatTime, getStatusLabel } from "@/lib/utils";
import { ordersApi } from "@/lib/api";
import ProfileDropdown from "@/components/ProfileDropdown";

type DeliveryTab = "available" | "active" | "history";

export default function DeliveryApp() {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DeliveryTab>("available");
  
  // State for COD popup modal
  const [confirmingOrder, setConfirmingOrder] = useState<any | null>(null);
  const [codInput, setCodInput] = useState<string>("");

  const fetchData = async () => {
    try {
      // 1. Fetch available orders (READY status, unassigned)
      const resAvailable = await ordersApi.availableDeliveries();
      if (resAvailable.success && resAvailable.data) {
        const mapped = (resAvailable.data as any[]).map((o) => ({
          id: o.id, // This is order ID
          orderNumber: o.orderNumber,
          status: "ready",
          createdAt: o.createdAt,
          address: o.address,
          specialInstructions: o.specialInstructions,
          items: o.items || [],
          paymentMethod: o.paymentMethod ? o.paymentMethod.toLowerCase() : "cod",
          paymentStatus: o.paymentStatus ? o.paymentStatus.toLowerCase() : "pending",
          total: o.total,
          user: o.user,
        }));
        setAvailableOrders(mapped);
      }

      // 2. Fetch active driver assignments
      const resActive = await ordersApi.deliveryAssignments();
      if (resActive.success && resActive.data) {
        const mapped = (resActive.data as any[]).map((o) => ({
          id: o.id, // Delivery ID (needed for confirmPickup & confirmDelivery API calls)
          orderId: o.order.id,
          orderNumber: o.order.orderNumber,
          status: o.status === "ASSIGNED" 
            ? "ready" 
            : o.status === "PICKED_UP" 
              ? "out_for_delivery" 
              : o.status.toLowerCase(),
          createdAt: o.order.createdAt,
          address: o.order.address,
          specialInstructions: o.order.specialInstructions,
          items: o.order.items || [],
          paymentMethod: o.order.paymentMethod ? o.order.paymentMethod.toLowerCase() : "cod",
          paymentStatus: o.order.paymentStatus ? o.order.paymentStatus.toLowerCase() : "pending",
          total: o.order.total,
          user: o.order.user,
        }));
        setActiveOrders(mapped);
      }

      // 3. Fetch history
      const resHistory = await ordersApi.deliveryHistory(1, 50);
      if (resHistory.success && resHistory.data) {
        const rawHistory = (resHistory.data as any).deliveries || resHistory.data || [];
        const mapped = rawHistory.map((o: any) => ({
          id: o.id,
          orderNumber: o.order.orderNumber,
          status: "delivered",
          createdAt: o.order.createdAt,
          updatedAt: o.updatedAt,
          address: o.order.address,
          specialInstructions: o.order.specialInstructions,
          items: o.order.items || [],
          paymentMethod: o.order.paymentMethod ? o.order.paymentMethod.toLowerCase() : "cod",
          paymentStatus: o.order.paymentStatus ? o.order.paymentStatus.toLowerCase() : "pending",
          total: o.order.total,
          user: o.order.user,
        }));
        setHistoryOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch deliveries data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for live status updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const claimJob = async (orderId: string) => {
    try {
      setLoading(true);
      const res = await ordersApi.acceptDelivery(orderId);
      if (res.success) {
        await fetchData();
        setTab("active"); // Automatically switch to Active Queue tab on accept
      } else {
        alert("Failed to accept delivery: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error accepting job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (order: any) => {
    try {
      if (order.status === "ready") {
        // Confirm Pickup
        const res = await ordersApi.confirmPickup(order.id);
        if (res.success) {
          fetchData();
        } else {
          alert("Failed to confirm pickup: " + (res.error || "Unknown error"));
        }
      } else if (order.status === "out_for_delivery") {
        if (order.paymentMethod === "cod") {
          // Open COD collected input modal
          setConfirmingOrder(order);
          setCodInput(order.total.toString());
        } else {
          // Prepaid order delivery confirm
          const res = await ordersApi.confirmDelivery(order.id);
          if (res.success) {
            fetchData();
          } else {
            alert("Failed to confirm delivery: " + (res.error || "Unknown error"));
          }
        }
      }
    } catch (err) {
      console.error("Failed to advance status:", err);
    }
  };

  const handleConfirmCodDelivery = async () => {
    if (!confirmingOrder) return;
    const collected = parseFloat(codInput);
    if (isNaN(collected) || collected < 0) {
      alert("Please enter a valid amount collected.");
      return;
    }
    try {
      const res = await ordersApi.confirmDelivery(confirmingOrder.id, collected);
      if (res.success) {
        setConfirmingOrder(null);
        fetchData();
      } else {
        alert("Failed to confirm delivery: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to confirm COD delivery:", err);
    }
  };

  // Base earnings: ₹45 standard pay per delivery
  const totalEarnings = historyOrders.length * 45;

  return (
    <div className="min-h-screen bg-cream pb-16 font-sans">
      {/* Header - Stacking z-30 and overflow-visible to keep the profile dropdown fully visible and unclipped */}
      <header className="bg-maroon text-cream px-6 py-6 pb-10 rounded-b-[2.5rem] shadow-md sticky top-0 z-30 relative overflow-visible">
        {/* Background Decorative Gradient blur */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 backdrop-blur-sm shadow-inner transition-transform hover:scale-105">
                <Package className="w-5 h-5 text-gold" />
              </div>
              <div>
                <img src="/logo.png" alt="Brahma Kalasha" className="h-6 w-auto brightness-0 invert mb-0.5" />
                <p className="text-xs text-cream/70 font-semibold tracking-wider uppercase">
                  Courier Dashboard
                </p>
              </div>
            </div>
            {/* The dropdown triggers absolute popup. Stacking context is preserved correctly. */}
            <ProfileDropdown theme="light" />
          </div>

          {/* Quick Metrics Panel */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 border border-white/10 p-3 rounded-2xl backdrop-blur-md flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-cream/60 font-bold uppercase tracking-widest">Available</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-gold animate-pulse">{availableOrders.length}</span>
                <span className="text-xs text-cream/50">jobs</span>
              </div>
            </div>
            <div className="bg-white/10 border border-white/10 p-3 rounded-2xl backdrop-blur-md flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-cream/60 font-bold uppercase tracking-widest">Active Queue</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-ivory">{activeOrders.length}</span>
                <span className="text-xs text-cream/50">trips</span>
              </div>
            </div>
            <div className="bg-white/10 border border-white/10 p-3 rounded-2xl backdrop-blur-md flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-cream/60 font-bold uppercase tracking-widest">Earnings</span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-[10px] text-gold font-bold">₹</span>
                <span className="text-xl font-extrabold text-white">{totalEarnings}</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigator */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mt-6 shadow-inner">
            <button
              onClick={() => setTab("available")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5",
                tab === "available"
                  ? "bg-gold text-maroon shadow-md scale-[1.02]"
                  : "text-cream/70 hover:text-cream hover:bg-white/5"
              )}
            >
              <Crosshair className="w-3.5 h-3.5" />
              Available ({availableOrders.length})
            </button>
            <button
              onClick={() => setTab("active")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5",
                tab === "active"
                  ? "bg-gold text-maroon shadow-md scale-[1.02]"
                  : "text-cream/70 hover:text-cream hover:bg-white/5"
              )}
            >
              <Package className="w-3.5 h-3.5" />
              Active Queue ({activeOrders.length})
            </button>
            <button
              onClick={() => setTab("history")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5",
                tab === "history"
                  ? "bg-gold text-maroon shadow-md scale-[1.02]"
                  : "text-cream/70 hover:text-cream hover:bg-white/5"
              )}
            >
              <History className="w-3.5 h-3.5" />
              History ({historyOrders.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Wrapper */}
      <main className="max-w-md mx-auto px-5 py-6 space-y-5">
        {loading && (availableOrders.length === 0 && activeOrders.length === 0 && historyOrders.length === 0) ? (
          <div className="py-20 text-center text-maroon/50 flex flex-col items-center bg-white rounded-3xl border border-ivory shadow-sm">
            <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold tracking-wide">Loading latest runs...</p>
          </div>
        ) : tab === "available" ? (
          /* Available Jobs Section */
          availableOrders.length === 0 ? (
            <div className="py-20 text-center text-maroon/50 flex flex-col items-center bg-white rounded-3xl border border-ivory shadow-sm px-6">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4 border border-ivory">
                <CheckCircle className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-bold text-maroon">No jobs available right now</h3>
              <p className="mt-2 text-xs text-maroon/60 font-medium px-4 leading-relaxed">
                Waiting for the kitchen to confirm and package orders. New jobs will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold text-maroon/50 uppercase tracking-widest px-1">
                Awaiting Courier Pickup ({availableOrders.length})
              </h2>
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-ivory overflow-hidden transition-all hover:shadow-md hover:border-gold/25 duration-300"
                >
                  <div className="px-5 py-3.5 bg-cream/35 border-b border-ivory/50 flex justify-between items-center">
                    <span className="font-extrabold text-xs text-maroon/70 tracking-wider">
                      {order.orderNumber}
                    </span>
                    <span className="bg-gold/10 text-maroon text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-gold/15">
                      Ready
                    </span>
                  </div>

                  <div className="p-5">
                    {/* Routing Details */}
                    <div className="space-y-3.5">
                      <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5 border border-gold/10 text-gold text-xs font-extrabold">
                          K
                        </div>
                        <div>
                          <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">Pickup From</p>
                          <p className="text-sm font-bold text-maroon mt-0.5">Brahma Kalasha Kitchen</p>
                          <p className="text-xs text-maroon/65">Main Road, Temple Lane</p>
                        </div>
                      </div>

                      <div className="border-l border-dashed border-gold/45 h-5 ml-3" />

                      <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-maroon/5 flex items-center justify-center shrink-0 mt-0.5 border border-maroon/10 text-maroon text-xs font-extrabold">
                          D
                        </div>
                        <div>
                          <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">Deliver To</p>
                          {order.address ? (
                            <>
                              <p className="text-sm font-bold text-maroon mt-0.5">{order.address.street}</p>
                              <p className="text-xs text-maroon/65">
                                {order.address.city}, {order.address.zip}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-bold text-maroon/50">Address Info Missing</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order summary info */}
                    <div className="flex items-center justify-between border-t border-ivory mt-5 pt-4">
                      <div className="flex items-center gap-2 text-maroon/60">
                        <Package className="w-4.5 h-4.5" />
                        <span className="text-xs font-bold">
                          {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-maroon/50 font-bold uppercase">Payment:</span>
                        {order.paymentMethod === "cod" ? (
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                            COD (₹{formatPrice(order.total)})
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                            Prepaid ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Accept Job button */}
                    <button
                      onClick={() => claimJob(order.id)}
                      className="w-full mt-5 py-4 bg-maroon text-cream text-sm font-extrabold rounded-2xl shadow-sm hover:bg-burgundy transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Check className="w-4 h-4 text-gold" />
                      Accept & Claim Delivery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "active" ? (
          /* Active Jobs/Assignments Queue */
          activeOrders.length === 0 ? (
            <div className="py-20 text-center text-maroon/50 flex flex-col items-center bg-white rounded-3xl border border-ivory shadow-sm px-6">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4 border border-ivory">
                <Package className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-bold text-maroon">No active deliveries</h3>
              <p className="mt-2 text-xs text-maroon/60 font-medium px-4 leading-relaxed">
                Accept incoming orders from the "Available" jobs pool to populate your active trip list.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold text-maroon/50 uppercase tracking-widest px-1">
                Your Active Runs ({activeOrders.length})
              </h2>
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-ivory overflow-hidden transition-all"
                >
                  {/* Status indicator bar */}
                  <div
                    className={cn(
                      "px-5 py-3.5 flex justify-between items-center text-xs font-extrabold border-b",
                      order.status === "ready"
                        ? "bg-cream/45 text-maroon border-ivory/50"
                        : "bg-gold/10 text-maroon border-gold/15"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          order.status === "ready" ? "bg-maroon/30" : "bg-gold animate-pulse"
                        )}
                      />
                      {order.orderNumber}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-ivory uppercase tracking-widest text-[9px]">
                      {order.status === "ready" ? "Assigned" : "Out for delivery"}
                    </span>
                  </div>

                  <div className="p-5">
                    {/* Customer Info Card */}
                    <div className="bg-cream/35 border border-ivory/80 rounded-2xl p-4 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 text-maroon font-extrabold flex items-center justify-center border border-gold/20 text-sm">
                          {order.user?.name ? order.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs text-maroon/50 font-bold uppercase tracking-wider">Customer</p>
                          <p className="text-sm font-extrabold text-maroon mt-0.5">
                            {order.user?.name || "Guest User"}
                          </p>
                        </div>
                      </div>

                      {order.user?.phone && (
                        <a
                          href={`tel:${order.user.phone}`}
                          className="w-10 h-10 rounded-full bg-white border border-ivory hover:bg-gold/15 hover:border-gold/30 flex items-center justify-center shadow-sm text-maroon hover:text-gold transition-colors duration-250"
                          title="Call Customer"
                        >
                          <Phone className="w-4.5 h-4.5" />
                        </a>
                      )}
                    </div>

                    {/* Delivery Address & Directions */}
                    <div className="space-y-4">
                      {order.address && (
                        <div className="bg-cream/20 border border-ivory/50 rounded-2xl p-4 flex items-start gap-3 justify-between">
                          <div className="flex gap-2.5 items-start text-maroon/75">
                            <MapPin className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-maroon/50 uppercase tracking-wider">Delivery Address</p>
                              <p className="text-sm font-bold text-maroon mt-1 leading-snug">
                                {order.address.street}, {order.address.city} {order.address.zip}
                              </p>
                            </div>
                          </div>
                          
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${order.address.street}, ${order.address.city} ${order.address.zip}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white border border-ivory hover:bg-gold/15 hover:border-gold/30 flex items-center justify-center shadow-sm text-maroon hover:text-gold shrink-0 transition-colors duration-250"
                            title="Open in Maps"
                          >
                            <Navigation className="w-4.5 h-4.5" />
                          </a>
                        </div>
                      )}

                      {/* Instructions */}
                      {order.specialInstructions && (
                        <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/50 text-maroon">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Instructions / Notes
                          </span>
                          <span className="text-xs font-semibold leading-relaxed">
                            {order.specialInstructions}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Verification / Checklist summary */}
                    <div className="mt-5 border-t border-ivory pt-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-maroon/40 mb-2.5">
                        Double-Check Order Contents:
                      </p>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-maroon/70 font-medium">
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-cream border border-ivory/80 flex items-center justify-center font-extrabold text-[10px] text-maroon shadow-sm shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="font-bold">{item.name}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="flex items-center justify-between border-t border-ivory mt-5 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-maroon/40 font-bold uppercase tracking-widest">
                          Payment Status
                        </span>
                        {order.paymentMethod === "cod" ? (
                          <span className="text-sm font-extrabold text-amber-800 flex items-center gap-0.5 mt-0.5">
                            Collect: ₹{formatPrice(order.total)}
                          </span>
                        ) : (
                          <span className="text-sm font-extrabold text-green-700 flex items-center gap-1 mt-0.5">
                            Prepaid ✓
                          </span>
                        )}
                      </div>

                      <div className="w-1/2">
                        {order.status === "ready" && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            className="w-full py-3 bg-maroon text-cream text-xs font-extrabold rounded-xl shadow-sm hover:bg-burgundy transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1"
                          >
                            Confirm Pickup
                          </button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            className="w-full py-3 bg-green-600 text-white text-xs font-extrabold rounded-xl shadow-sm hover:bg-green-700 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Past Deliveries History Section */
          historyOrders.length === 0 ? (
            <div className="py-20 text-center text-maroon/50 flex flex-col items-center bg-white rounded-3xl border border-ivory shadow-sm px-6">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4 border border-ivory">
                <History className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-bold text-maroon">No completed deliveries</h3>
              <p className="mt-2 text-xs text-maroon/60 font-medium px-4 leading-relaxed">
                Your completed runs will list here once you confirm active deliveries.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold text-maroon/50 uppercase tracking-widest px-1">
                Completed Trips ({historyOrders.length})
              </h2>
              {historyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-ivory overflow-hidden opacity-90 hover:opacity-100 transition-opacity"
                >
                  <div className="px-5 py-3.5 bg-cream/20 border-b border-ivory/50 flex justify-between items-center text-xs">
                    <span className="font-extrabold text-maroon/65 tracking-wider">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-green-700 font-extrabold bg-green-50 px-2 py-0.5 rounded-full border border-green-150 uppercase tracking-widest">
                      Delivered ✓
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex gap-2.5 items-start">
                      <MapPin className="w-4 h-4 text-maroon/40 shrink-0 mt-0.5" />
                      <div>
                        {order.address ? (
                          <p className="text-xs font-semibold text-maroon/70">
                            {order.address.street}, {order.address.city}
                          </p>
                        ) : (
                          <p className="text-xs text-maroon/40 font-bold">Address not specified</p>
                        )}
                        <p className="text-[10px] text-maroon/45 font-medium mt-1">
                          Completed at: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "Recently"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-ivory mt-4 pt-3 text-xs">
                      <span className="text-maroon/50 font-bold">Base Earnings: ₹45.00</span>
                      <span className="font-extrabold text-maroon">
                        {order.paymentMethod === "cod" ? "COD Collected" : "Prepaid"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* COD Delivery Collected Confirmation Dialog Modal */}
      {confirmingOrder && (
        <div className="fixed inset-0 bg-maroon/80 backdrop-blur-sm z-[300] flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm border border-ivory shadow-2xl p-6 overflow-hidden animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-maroon mt-4">Collect COD Cash</h3>
              <p className="text-xs text-maroon/60 mt-1 font-medium leading-relaxed px-4">
                Please collect the exact cash amount from the customer for Order #{confirmingOrder.orderNumber}.
              </p>
            </div>

            <div className="mt-5 bg-cream/45 border border-ivory rounded-2xl p-4 text-center">
              <span className="text-[10px] text-maroon/50 font-bold uppercase tracking-widest block mb-1">
                Order Total to Collect
              </span>
              <span className="text-2xl font-extrabold text-maroon">
                ₹{formatPrice(confirmingOrder.total)}
              </span>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-maroon/50 block mb-1.5 px-1">
                Enter Amount Collected (₹)
              </label>
              <input
                type="number"
                value={codInput}
                onChange={(e) => setCodInput(e.target.value)}
                className="w-full bg-cream border border-ivory rounded-xl px-4 py-3.5 text-sm font-extrabold text-maroon focus:outline-none focus:border-gold/50 shadow-inner"
                placeholder="e.g. 250"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setConfirmingOrder(null)}
                className="py-3 bg-cream border border-ivory text-maroon text-xs font-extrabold rounded-xl hover:bg-ivory transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCodDelivery}
                className="py-3 bg-green-600 text-white text-xs font-extrabold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                Confirm Cash & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
