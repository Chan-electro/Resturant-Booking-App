"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      setError("Unable to connect. Please try again.");
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
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Brahma Kalasha" className="h-16 w-auto mx-auto mb-4 drop-shadow-sm brightness-0" />
          <p className="text-maroon/55 font-medium text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ivory p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
                <span className="text-2xl">✉️</span>
              </div>
              <div>
                <h2 className="font-bold text-maroon text-lg mb-2">Check your email</h2>
                <p className="text-maroon/60 text-sm">
                  If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-maroon text-cream font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-burgundy transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl font-medium">
                  {error}
                </div>
              )}
              <p className="text-sm text-maroon/60 font-medium">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-maroon mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-cream border border-ivory rounded-xl px-4 py-3 text-maroon font-medium placeholder-maroon/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-3.5 bg-maroon text-cream font-bold rounded-xl shadow-sm transition-all text-sm",
                    "hover:bg-burgundy active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-maroon/55 mt-6 font-medium">
          Remember your password?{" "}
          <Link href="/login" className="text-maroon font-bold hover:text-burgundy transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
