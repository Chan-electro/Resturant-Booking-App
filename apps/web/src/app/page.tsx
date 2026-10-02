"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { authApi } from "@/lib/api";
import { isClerkConfigured } from "@/lib/auth-mode";
import { useApp } from "@/lib/store";
import CustomerApp from "@/components/customer/CustomerApp";
import CustomerOnboarding from "@/components/customer/CustomerOnboarding";
import KitchenApp from "@/components/kitchen/KitchenApp";
import DeliveryApp from "@/components/delivery/DeliveryApp";
import AdminApp from "@/components/admin/AdminApp";
import type { UserRole } from "@/lib/types";

function mapRole(apiRole: string): UserRole {
  const roles: Record<string, UserRole> = { CUSTOMER: "customer", KITCHEN: "kitchen", DELIVERY: "delivery", ADMIN: "admin" };
  return roles[apiRole] ?? "customer";
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/brand/wordmark-maroon.svg" alt="MS Brahmin Events" className="h-14 w-auto opacity-80" />
        <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

function SetupRequired() {
  return (
    <main className="min-h-screen bg-cream grid place-items-center p-6">
      <section className="max-w-xl rounded-3xl border border-ivory bg-white p-10 text-center shadow-sm">
        <img src="/brand/wordmark-maroon.svg" alt="MS Brahmin Events" className="mx-auto mb-6 h-20 w-auto" />
        <h1 className="font-display text-3xl font-bold text-maroon">Connect Clerk and Supabase</h1>
        <p className="mt-4 leading-7 text-maroon/65">
          The application is installed. Add the values documented in <code>apps/web/.env.example</code>, apply the database migrations, and restart the development server.
        </p>
      </section>
    </main>
  );
}

function AuthenticatedApp() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { state, dispatch } = useApp();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }
    let active = true;
    authApi.me()
      .then((response) => {
        if (!response.success || !response.data) throw new Error(response.error || "Unable to load your account");
        const profile = response.data as { role: string; name: string; email?: string };
        if (active) {
          dispatch({ type: "SET_ROLE", payload: mapRole(profile.role) });
          dispatch({ type: "SET_USER", payload: { name: profile.name, email: profile.email } });
        }
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "Unable to load your account"));
    return () => { active = false; };
  }, [dispatch, isLoaded, isSignedIn, router]);

  if (!state.currentRole && !error) return <LoadingScreen />;
  if (error) return (
    <main className="min-h-screen bg-cream grid place-items-center p-6">
      <section className="max-w-md rounded-2xl border border-ivory bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-bold text-maroon">Unable to start the app</h1>
        <p className="mt-3 text-sm text-maroon/65">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-maroon px-5 py-3 text-sm font-bold text-cream">Try again</button>
      </section>
    </main>
  );

  return <>{state.currentRole === "customer" && <CustomerOnboarding><CustomerApp /></CustomerOnboarding>}{state.currentRole === "kitchen" && <KitchenApp />}{state.currentRole === "delivery" && <DeliveryApp />}{state.currentRole === "admin" && <AdminApp />}</>;
}

export default function Home() {
  return isClerkConfigured ? <AuthenticatedApp /> : <SetupRequired />;
}
