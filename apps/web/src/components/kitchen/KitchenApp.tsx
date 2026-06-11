"use client";

import { useState } from "react";
import {
  Play,
  Check,
  Clock,
  ChefHat,
  ShoppingBag,
  Search,
  Filter,
  Printer,
  AlertCircle,
} from "lucide-react";
import { useOrders } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { cn, formatTime, getStatusLabel } from "@/lib/utils";

type KitchenFilter = "all" | "pending" | "preparing" | "ready";

export default function KitchenApp() {
  const { orders, updateStatus } = useOrders();
  const [filter, setFilter] = useState<KitchenFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Kitchen sees orders that are confirmed/placed, preparing, or ready
  const kitchenStatuses: OrderStatus[] = ["placed", "confirmed", "preparing", "ready"];
  const kitchenOrders = orders
    .filter((o) => kitchenStatuses.includes(o.status))
    .filter((o) => {
      if (filter === "all") return true;
      if (filter === "pending") return o.status === "placed" || o.status === "confirmed";
      return o.status === filter;
    })
    .filter(
      (o) =>
        !searchQuery ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Production summary: aggregate item quantities
  const productionSummary = orders
    .filter((o) => ["placed", "confirmed", "preparing"].includes(o.status))
    .flatMap((o) => o.items)
    .reduce(
      (acc, item) => {
        const existing = acc.find((a) => a.name === item.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.orderCount += 1;
        } else {
          acc.push({ name: item.name, quantity: item.quantity, orderCount: 1 });
        }
        return acc;
      },
      [] as { name: string; quantity: number; orderCount: number }[]
    )
    .sort((a, b) => b.quantity - a.quantity);

  const counts = {
    pending: orders.filter((o) => o.status === "placed" || o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  const advanceStatus = (id: string, current: OrderStatus) => {
    const transitions: Record<string, OrderStatus> = {
      placed: "preparing",
      confirmed: "preparing",
      preparing: "ready",
    };
    const next = transitions[current];
    if (next) updateStatus(id, next);
  };

  const getCardStyle = (status: OrderStatus) => {
    switch (status) {
      case "placed":
      case "confirmed":
        return "border-l-4 border-l-gold";
      case "preparing":
        return "border-l-4 border-l-amber-500";
      case "ready":
        return "border-l-4 border-l-green-500";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Header */}
      <header className="bg-maroon text-cream p-5 shadow-sm sticky top-0 z-10 border-b border-ivory/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
              <ChefHat className="w-7 h-7 text-gold" />
            </div>
            <div>
              <img src="/logo.png" alt="Brahma Kalasha" className="h-7 w-auto brightness-0 invert mb-0.5" />
              <p className="text-sm text-cream/70 mt-0.5">
                Production KDS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/50" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/10 text-cream placeholder-cream/40 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-gold/50 w-48"
                placeholder="Search orders..."
              />
            </div>

            {/* Counters */}
            <div className="flex gap-2">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-gold">{counts.pending}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-cream/70">
                  Pending
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-ivory">{counts.preparing}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-cream/70">
                  Cooking
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-400">{counts.ready}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-cream/70">
                  Ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filter Tabs + Production Summary */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "pending", "preparing", "ready"] as KitchenFilter[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                    filter === f
                      ? "bg-maroon text-cream border-maroon shadow-sm"
                      : "bg-white text-maroon/70 border-ivory hover:border-gold/30"
                  )}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              )
            )}

            <button className="px-4 py-2 rounded-xl text-sm font-bold border bg-white text-maroon/70 border-ivory hover:border-gold/30 flex items-center gap-2 ml-auto">
              <Printer className="w-4 h-4" />
              Print Sheet
            </button>
          </div>
        </div>

        {/* Production Summary */}
        {productionSummary.length > 0 && (
          <div className="bg-white rounded-2xl border border-ivory shadow-sm p-5 mb-6">
            <h3 className="text-xs font-bold text-maroon/60 uppercase tracking-widest mb-4">
              Production Summary — Total Quantities
            </h3>
            <div className="flex flex-wrap gap-3">
              {productionSummary.map((item) => (
                <div
                  key={item.name}
                  className="bg-cream border border-ivory rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <span className="bg-maroon text-cream font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <div>
                    <p className="font-bold text-maroon text-sm">{item.name}</p>
                    <p className="text-xs text-maroon/50">
                      {item.orderCount} order{item.orderCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {kitchenOrders.map((order) => (
            <div
              key={order.id}
              className={cn(
                "bg-white rounded-2xl shadow-sm border border-ivory overflow-hidden flex flex-col",
                getCardStyle(order.status)
              )}
            >
              {/* Card Header */}
              <div className="px-4 py-3 flex justify-between items-center border-b border-ivory/50 bg-cream/50">
                <span className="font-bold text-sm text-maroon flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      order.status === "ready"
                        ? "bg-green-500"
                        : order.status === "preparing"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-gold"
                    )}
                  />
                  {order.orderNumber}
                </span>
                <span className="uppercase text-[10px] tracking-widest font-bold text-maroon/50 bg-white px-2 py-0.5 rounded-full border border-ivory">
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1">
                <p className="text-sm text-maroon/50 mb-4 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(order.createdAt)}
                </p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start border-b border-ivory/50 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex gap-3 font-medium text-maroon w-full">
                        <span className="bg-cream border border-ivory/80 px-2.5 py-1 rounded-lg h-fit text-sm shadow-sm shrink-0">
                          {item.quantity}x
                        </span>
                        <span className="font-bold text-sm pt-1">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {order.specialInstructions && (
                  <div className="mt-4 p-3 bg-gold/10 text-maroon rounded-xl text-sm border border-gold/20">
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-maroon/60 font-bold mb-1">
                      <AlertCircle className="w-3 h-3" />
                      Notes
                    </div>
                    {order.specialInstructions}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-cream/30 border-t border-ivory">
                {(order.status === "placed" || order.status === "confirmed") && (
                  <button
                    onClick={() => advanceStatus(order.id, order.status)}
                    className="w-full py-3.5 bg-maroon text-cream font-bold rounded-xl shadow-sm hover:bg-burgundy flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  >
                    <Play className="w-5 h-5 fill-current" /> Start Cooking
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => advanceStatus(order.id, order.status)}
                    className="w-full py-3.5 bg-gold text-maroon font-bold rounded-xl shadow-sm hover:bg-gold-dark flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  >
                    <Check className="w-5 h-5" /> Mark Ready
                  </button>
                )}
                {order.status === "ready" && (
                  <div className="w-full py-3.5 bg-green-50 text-green-800 font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-green-200">
                    <ShoppingBag className="w-5 h-5" /> Awaiting Pickup
                  </div>
                )}
              </div>
            </div>
          ))}
          {kitchenOrders.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-ivory" />
              <p className="text-lg text-maroon/40 font-medium">
                No active orders in the queue
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
