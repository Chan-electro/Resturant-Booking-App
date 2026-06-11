"use client";

import { ChefHat, Bike, User, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/lib/types";

const roles = [
  {
    id: "customer" as UserRole,
    icon: User,
    title: "Customer",
    subtitle: "Browse menus & order fresh meals",
    gradient: "from-gold/20 to-bronze/10",
  },
  {
    id: "kitchen" as UserRole,
    icon: ChefHat,
    title: "Kitchen",
    subtitle: "Manage prep queues & cooking",
    gradient: "from-burgundy/10 to-maroon/5",
  },
  {
    id: "delivery" as UserRole,
    icon: Bike,
    title: "Delivery",
    subtitle: "Navigate routes & mark deliveries",
    gradient: "from-sage/20 to-sage-light/10",
  },
  {
    id: "admin" as UserRole,
    icon: ShieldCheck,
    title: "Admin",
    subtitle: "Dashboard, analytics & management",
    gradient: "from-cocoa/10 to-maroon/5",
  },
];

export default function RoleSelector({
  onSelect,
}: {
  onSelect: (role: UserRole) => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-burgundy/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ivory/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[480px] w-full">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in">
          <img
            src="/logo.png"
            alt="Brahma Kalasha"
            className="h-20 w-auto mx-auto mb-6 drop-shadow-sm brightness-0"
          />
          <p className="text-maroon/60 mt-2 font-medium text-lg">
            Premium Vegetarian Cuisine
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold/40" />
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">
              Pre-Order Platform
            </span>
            <span className="h-px w-8 bg-gold/40" />
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 gap-3.5 animate-slide-up">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-ivory bg-white hover:border-gold/50 hover:shadow-md transition-all duration-300 text-left relative overflow-hidden"
              style={{ animationDelay: `${index * 80}ms` }}
              id={`role-${role.id}`}
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative z-10 w-13 h-13 rounded-xl bg-cream flex items-center justify-center shadow-sm text-gold shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:bg-white border border-ivory group-hover:border-gold/30">
                <role.icon className="w-6 h-6" />
              </div>

              <div className="relative z-10 flex-1">
                <h2 className="font-bold text-lg text-maroon group-hover:text-maroon transition-colors">
                  {role.title}
                </h2>
                <p className="text-sm text-maroon/55 mt-0.5 font-medium">
                  {role.subtitle}
                </p>
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-ivory/50 flex items-center justify-center text-maroon/30 group-hover:text-gold group-hover:bg-gold/10 transition-all duration-300 group-hover:translate-x-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-maroon/30 mt-8 font-medium animate-fade-in">
          Wholesome meals, prepared with love, delivered fresh.
        </p>
      </div>
    </div>
  );
}
