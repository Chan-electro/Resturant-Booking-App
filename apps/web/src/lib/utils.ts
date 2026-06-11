import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatOrderNumber(num: string): string {
  return `#${num}`;
}

export function generateOrderNumber(): string {
  const prefix = "BK";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}${random}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    placed: "bg-beige text-maroon border-beige",
    confirmed: "bg-blue-50 text-blue-800 border-blue-200",
    preparing: "bg-amber-50 text-amber-800 border-amber-200",
    ready: "bg-emerald-50 text-emerald-800 border-emerald-200",
    assigned: "bg-violet-50 text-violet-800 border-violet-200",
    out_for_delivery: "bg-orange-50 text-orange-800 border-orange-200",
    delivered: "bg-green-50 text-green-800 border-green-200",
    completed: "bg-green-100 text-green-900 border-green-300",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  };
  return colors[status] || "bg-ivory text-maroon border-ivory";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    placed: "Order Placed",
    confirmed: "Confirmed",
    preparing: "In Preparation",
    ready: "Ready",
    assigned: "Assigned",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

export function getDeliveryDateLabel(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(tomorrow);
}

export function getCountdownToTime(cutoffHour: number = 21): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(cutoffHour, 0, 0, 0);

  if (now >= cutoff) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const diff = cutoff.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isExpired: false };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
