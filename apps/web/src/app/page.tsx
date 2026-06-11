"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useApp } from "@/lib/store";
import CustomerApp from "@/components/customer/CustomerApp";
import KitchenApp from "@/components/kitchen/KitchenApp";
import DeliveryApp from "@/components/delivery/DeliveryApp";
import AdminApp from "@/components/admin/AdminApp";
import type { UserRole } from "@/lib/types";

// Map API role enum to our internal role type
function mapRole(apiRole: string): UserRole | null {
  const map: Record<string, UserRole> = {
    CUSTOMER: "customer",
    KITCHEN: "kitchen",
    DELIVERY: "delivery",
    ADMIN: "admin",
  };
  return map[apiRole] ?? null;
}

export default function Home() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.me().then((res) => {
      if (res.success && res.data) {
        const user = res.data as { role: string; name: string };
        const role = mapRole(user.role);
        if (role) dispatch({ type: "SET_ROLE", payload: role });
      } else {
        router.replace("/login");
      }
    }).catch(() => {
      // API unreachable — fall back to role selector for dev
    }).finally(() => {
      setChecking(false);
    });
  }, [dispatch, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Brahma Kalasha" className="h-14 w-auto opacity-80" />
          <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authApi.logout();
    dispatch({ type: "SET_ROLE", payload: null });
    router.push("/login");
  };

  if (!state.currentRole) {
    // API unavailable or not logged in — show dev role selector
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <img src="/logo.png" alt="Brahma Kalasha" className="h-16 w-auto mb-8 drop-shadow-sm" />
        <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
          {(["customer", "kitchen", "delivery", "admin"] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => dispatch({ type: "SET_ROLE", payload: role })}
              className="py-3.5 px-6 bg-white border border-ivory rounded-xl text-maroon font-bold capitalize hover:bg-cream hover:border-gold/40 transition-all shadow-sm"
            >
              {role}
            </button>
          ))}
        </div>
        <p className="text-maroon/40 text-xs mt-6 font-medium">Development mode — API offline</p>
      </div>
    );
  }

  return (
    <>
      {/* Logout button */}
      <div className="fixed top-4 right-4 z-[100]">
        <button
          onClick={handleLogout}
          className="bg-maroon/90 backdrop-blur-sm text-cream font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:bg-burgundy transition-all active:scale-95 border border-maroon-light/20 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          {state.currentRole.charAt(0).toUpperCase() + state.currentRole.slice(1)}
        </button>
      </div>

      {state.currentRole === "customer" && <CustomerApp />}
      {state.currentRole === "kitchen" && <KitchenApp />}
      {state.currentRole === "delivery" && <DeliveryApp />}
      {state.currentRole === "admin" && <AdminApp />}
    </>
  );
}
