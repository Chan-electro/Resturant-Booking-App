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
} from "lucide-react";
import { useOrders } from "@/lib/store";
import { useState } from "react";
import type { OrderStatus } from "@/lib/types";
import { cn, formatPrice, formatTime, getStatusLabel, getDeliveryDateLabel } from "@/lib/utils";

type DeliveryTab = "active" | "history";

export default function DeliveryApp() {
  const { orders, updateStatus } = useOrders();
  const [tab, setTab] = useState<DeliveryTab>("active");

  // Active deliveries: ready or out_for_delivery
  const activeDeliveries = orders
    .filter((o) => ["ready", "out_for_delivery"].includes(o.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Delivered history
  const deliveryHistory = orders
    .filter((o) => o.status === "delivered" || o.status === "completed")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const advanceStatus = (id: string, current: OrderStatus) => {
    const transitions: Record<string, OrderStatus> = {
      ready: "out_for_delivery",
      out_for_delivery: "delivered",
    };
    const next = transitions[current];
    if (next) updateStatus(id, next);
  };

  const displayedOrders = tab === "active" ? activeDeliveries : deliveryHistory;

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Header */}
      <header className="bg-maroon text-cream px-6 py-6 pb-8 rounded-b-[2rem] shadow-sm sticky top-0 z-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-sm">
            <Package className="w-5 h-5 text-gold" />
          </div>
          <div>
            <img src="/logo.png" alt="Brahma Kalasha" className="h-7 w-auto brightness-0 invert mb-0.5" />
            <p className="text-sm text-cream/60 font-medium">
              Courier Panel
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setTab("active")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              tab === "active"
                ? "bg-white/15 text-cream border border-white/20"
                : "text-cream/50 hover:text-cream/80"
            )}
          >
            <Package className="w-4 h-4" />
            Active ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              tab === "history"
                ? "bg-white/15 text-cream border border-white/20"
                : "text-cream/50 hover:text-cream/80"
            )}
          >
            <History className="w-4 h-4" />
            History ({deliveryHistory.length})
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 space-y-5 -mt-4 relative z-20">
        {displayedOrders.length === 0 ? (
          <div className="py-20 text-center text-maroon/50 flex flex-col items-center bg-white rounded-3xl border border-ivory shadow-sm">
            <div className="w-20 h-20 bg-ivory rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-xl font-bold text-maroon">
              {tab === "active" ? "All Caught Up!" : "No History Yet"}
            </h2>
            <p className="mt-2 text-sm font-medium px-8">
              {tab === "active"
                ? "No pending deliveries assigned to you right now."
                : "Completed deliveries will appear here."}
            </p>
          </div>
        ) : (
          displayedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[1.5rem] shadow-sm border border-ivory overflow-hidden animate-slide-up"
            >
              {/* Order Header */}
              <div
                className={cn(
                  "px-5 py-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b",
                  order.status === "ready"
                    ? "bg-cream text-maroon border-ivory"
                    : order.status === "out_for_delivery"
                      ? "bg-gold/10 text-maroon border-gold/20"
                      : "bg-green-50 text-green-800 border-green-100"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      order.status === "ready"
                        ? "bg-maroon/30"
                        : order.status === "out_for_delivery"
                          ? "bg-gold animate-pulse"
                          : "bg-green-500"
                    )}
                  />
                  {order.orderNumber}
                </span>
                <span className="bg-white px-2 py-1 rounded shadow-sm">
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="p-5">
                {/* Customer Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cream border border-ivory flex items-center justify-center font-bold text-maroon">
                    {(order.address?.label || "D").charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-maroon">
                      Delivery — {order.orderNumber}
                    </h3>
                    <p className="text-xs text-maroon/50 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Address */}
                {order.address && (
                  <div className="flex gap-3 text-maroon/70 mb-5 text-sm items-start bg-cream p-3 rounded-xl border border-ivory">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-gold" />
                    <p className="leading-snug font-medium text-maroon">
                      {order.address.street}, {order.address.city}{" "}
                      {order.address.zip}
                    </p>
                  </div>
                )}

                {/* Instructions */}
                {order.specialInstructions && (
                  <div className="mb-5 text-sm bg-gold/5 p-3 rounded-xl border border-gold/20 text-maroon">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-maroon/60 block mb-1">
                      Instructions
                    </span>
                    <span className="font-medium">
                      {order.specialInstructions}
                    </span>
                  </div>
                )}

                {/* Items & Payment */}
                <div className="flex items-center justify-between py-3 border-t border-b border-ivory mb-5">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-maroon/40" />
                    <span className="font-bold text-maroon">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                      Items
                    </span>
                  </div>
                  {order.paymentMethod === "cod" ? (
                    <div className="flex items-center gap-1.5 text-burgundy font-bold bg-burgundy/10 px-3 py-1.5 rounded-lg border border-burgundy/20">
                      <IndianRupee className="w-4 h-4" /> Collect{" "}
                      {formatPrice(order.total)}
                    </div>
                  ) : (
                    <div className="text-green-700 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      Prepaid ✓
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {tab === "active" && (
                  <>
                    <div className="flex gap-3 mb-4">
                      <button className="flex-1 bg-cream border border-ivory text-maroon font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gold hover:border-gold hover:text-white transition-colors shadow-sm">
                        <Phone className="w-4 h-4" /> Call
                      </button>
                      <button className="flex-1 bg-cream border border-ivory text-maroon font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gold hover:border-gold hover:text-white transition-colors shadow-sm">
                        <Navigation className="w-4 h-4" /> Navigate
                      </button>
                    </div>

                    {order.status === "ready" && (
                      <button
                        onClick={() => advanceStatus(order.id, order.status)}
                        className="w-full py-4 bg-maroon text-cream font-bold rounded-xl shadow-sm hover:bg-burgundy transition-colors active:scale-[0.98]"
                      >
                        Confirm Pickup
                      </button>
                    )}
                    {order.status === "out_for_delivery" && (
                      <button
                        onClick={() => advanceStatus(order.id, order.status)}
                        className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <CheckCircle className="w-5 h-5" /> Mark Delivered
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
