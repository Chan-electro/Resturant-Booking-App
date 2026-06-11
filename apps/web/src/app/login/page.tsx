"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ email: email.trim().toLowerCase(), password });
      if (res.success) {
        router.push(from);
        router.refresh();
      } else {
        setError((res as any).error || (res as any).message || "Invalid email or password.");
      }
    } catch {
      setError("Unable to connect. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-maroon relative overflow-hidden flex-col items-center justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon via-burgundy to-cocoa" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-burgundy/30 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <img
            src="/logo.png"
            alt="Brahma Kalasha"
            className="h-24 w-auto mx-auto mb-8 brightness-0 invert drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-cream font-display leading-tight mb-4">
            Brahma<br />Kalasha
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Premium Vegetarian</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <p className="text-cream/60 text-base leading-relaxed max-w-xs mx-auto">
            Wholesome meals, prepared with love and delivered fresh to your doorstep every morning.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Fresh Daily", icon: "🌿" },
              { label: "Pure Veg", icon: "🍃" },
              { label: "Home Style", icon: "🏡" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-cream/70 text-xs font-bold uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-cream relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ivory/80 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <img src="/logo.png" alt="Brahma Kalasha" className="h-16 w-auto mb-4 drop-shadow-sm brightness-0" />
            <h1 className="text-2xl font-bold text-maroon font-display">Brahma Kalasha</h1>
            <p className="text-maroon/50 text-sm font-medium mt-1">Premium Vegetarian Dining</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-maroon font-display">Welcome back</h2>
            <p className="text-maroon/55 font-medium mt-1.5">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl font-medium mb-5 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0 text-xs font-bold">!</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-maroon uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-ivory rounded-xl px-4 py-3.5 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-maroon uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-gold hover:text-gold-dark font-bold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white border border-ivory rounded-xl px-4 py-3.5 pr-12 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-maroon/40 hover:text-maroon transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-maroon hover:bg-burgundy text-cream font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-ivory" />
            <span className="text-[11px] text-maroon/40 font-bold uppercase tracking-wider">Or continue with</span>
            <span className="flex-1 h-px bg-ivory" />
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={() => (window.location.href = authApi.googleUrl())}
            className="w-full py-3.5 rounded-xl border border-ivory bg-white text-maroon font-bold text-sm hover:bg-cream hover:border-gold/30 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-maroon/55 mt-8 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-maroon font-bold hover:text-burgundy hover:underline transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-maroon flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo.png" alt="Brahma Kalasha" className="h-14 w-auto brightness-0 invert opacity-80" />
            <div className="w-6 h-6 border-2 border-cream border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
