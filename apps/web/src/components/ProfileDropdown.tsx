"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ChefHat,
  Bike,
  ShieldCheck,
  LogOut,
  Settings,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { authApi } from "@/lib/api";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  align?: "left" | "right";
  onSettingsClick?: () => void;
  theme?: "light" | "dark"; // 'light' means light text for dark backgrounds, 'dark' means dark text for light backgrounds
}

export default function ProfileDropdown({
  align = "right",
  onSettingsClick,
  theme = "light",
}: ProfileDropdownProps) {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    dispatch({ type: "SET_ROLE", payload: null });
    router.push("/login");
  };

  const handleRoleSelect = (role: UserRole) => {
    dispatch({ type: "SET_ROLE", payload: role });
    setIsOpen(false);
  };

  const getRoleIcon = (role: UserRole | null) => {
    switch (role) {
      case "customer":
        return <User className="w-4 h-4" />;
      case "kitchen":
        return <ChefHat className="w-4 h-4" />;
      case "delivery":
        return <Bike className="w-4 h-4" />;
      case "admin":
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <UserCircle className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case "customer":
        return "Customer";
      case "kitchen":
        return "Kitchen Staff";
      case "delivery":
        return "Courier";
      case "admin":
        return "System Admin";
      default:
        return "Guest";
    }
  };

  const userInitials = state.userName
    ? state.userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all focus:outline-none active:scale-[0.98] shadow-sm text-xs md:text-sm font-bold",
          theme === "light"
            ? "border-ivory/25 bg-cream/15 backdrop-blur-sm text-cream hover:bg-cream/25 hover:border-ivory/40"
            : "border-maroon/20 bg-cream text-maroon hover:bg-ivory hover:border-maroon/40"
        )}
      >
        <div className="w-7 h-7 rounded-full bg-gold/90 text-maroon font-bold flex items-center justify-center shadow-inner text-xs">
          {userInitials}
        </div>
        <span className="max-w-[80px] md:max-w-[120px] truncate">
          {state.userName || "User"}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-[200] mt-2 w-64 rounded-2xl border border-ivory bg-white p-2 shadow-xl animate-scale-in focus:outline-none",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-ivory/50">
            <p className="text-sm font-bold text-maroon truncate">{state.userName}</p>
            <p className="text-xs text-maroon/50 truncate font-medium mt-0.5">{state.userEmail || "Logged in"}</p>
            <div className="mt-2.5 flex items-center gap-1.5 bg-gold/10 text-maroon text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg w-fit border border-gold/10">
              {getRoleIcon(state.currentRole)}
              <span>{getRoleLabel(state.currentRole)}</span>
            </div>
          </div>

          {/* Switch Roles Section - Dev Only */}
          {process.env.NODE_ENV !== "production" && (
            <div className="py-2 border-b border-ivory/50">
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-maroon/40">
                Switch Workspace (Dev Only)
              </p>
              <div className="space-y-0.5 px-1.5">
                {(["customer", "kitchen", "delivery", "admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left",
                      state.currentRole === r
                        ? "bg-cream text-gold"
                        : "text-maroon/65 hover:bg-cream/50 hover:text-maroon"
                    )}
                  >
                    <span className={cn("text-maroon/40", state.currentRole === r && "text-gold")}>
                      {getRoleIcon(r)}
                    </span>
                    <span>{getRoleLabel(r)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* General Actions */}
          <div className="py-1 px-1.5">
            {onSettingsClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSettingsClick();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-maroon/65 hover:bg-cream/50 hover:text-maroon transition-all text-left"
              >
                <Settings className="w-4 h-4 text-maroon/40" />
                <span>Settings</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 transition-all text-left mt-0.5"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
