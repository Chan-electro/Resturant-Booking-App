"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useApp } from "@/lib/store";
import CustomerApp from "@/components/customer/CustomerApp";
import KitchenApp from "@/components/kitchen/KitchenApp";
import DeliveryApp from "@/components/delivery/DeliveryApp";
import AdminApp from "@/components/admin/AdminApp";
import RoleSelector from "@/components/RoleSelector";
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
        const user = res.data as { role: string; name: string; email?: string };
        const role = mapRole(user.role);
        if (role) {
          dispatch({ type: "SET_ROLE", payload: role });
        }
        dispatch({
          type: "SET_USER",
          payload: { name: user.name, email: user.email },
        });
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

  if (!state.currentRole) {
    // API unavailable or not logged in — show dev role selector
    return (
      <RoleSelector
        onSelect={(role) => dispatch({ type: "SET_ROLE", payload: role })}
      />
    );
  }

  return (
    <>
      {state.currentRole === "customer" && <CustomerApp />}
      {state.currentRole === "kitchen" && <KitchenApp />}
      {state.currentRole === "delivery" && <DeliveryApp />}
      {state.currentRole === "admin" && <AdminApp />}
    </>
  );
}
