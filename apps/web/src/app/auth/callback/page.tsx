"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const success = params.get("success");

  useEffect(() => {
    if (success === "true") {
      router.replace("/");
    } else {
      router.replace("/login?error=oauth_failed");
    }
  }, [success, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.png" alt="Brahma Kalasha" className="h-14 w-auto opacity-80" />
        <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
        <p className="text-maroon/55 text-sm font-medium">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Brahma Kalasha" className="h-14 w-auto opacity-80" />
          <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
          <p className="text-maroon/55 text-sm font-medium">Loading…</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

