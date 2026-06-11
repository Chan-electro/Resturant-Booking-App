"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || res.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Unable to connect. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-burgundy/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Brahma Kalasha"
            className="h-14 w-auto mx-auto mb-4 drop-shadow-sm brightness-0"
          />
          <p className="text-maroon/55 font-medium text-sm">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ivory p-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-maroon mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set("name")}
                placeholder="Your full name"
                className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon mb-1.5 uppercase tracking-wide">
                Phone <span className="text-maroon/40 font-normal normal-case">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 98765 43210"
                className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 8 characters"
                  className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 pr-11 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon/40 hover:text-maroon transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="Re-enter your password"
                className={cn(
                  "w-full bg-cream border rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:ring-1 transition-all text-sm",
                  form.confirm && form.confirm !== form.password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-ivory focus:border-gold focus:ring-gold"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3.5 bg-maroon text-cream font-bold rounded-xl shadow-sm transition-all text-sm mt-2",
                "hover:bg-burgundy active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-ivory" />
            <span className="text-xs text-maroon/40 font-medium">or</span>
            <span className="flex-1 h-px bg-ivory" />
          </div>

          <a
            href={authApi.googleUrl()}
            className="w-full flex items-center justify-center gap-3 py-3 border border-ivory bg-white rounded-xl text-maroon font-medium text-sm hover:bg-cream hover:border-gold/40 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>
        </div>

        <p className="text-center text-sm text-maroon/55 mt-6 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-maroon font-bold hover:text-burgundy transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
