"use client";

import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-mode";

export default function RegisterPage() {
  if (!isClerkConfigured) {
    return (
      <main className="min-h-screen bg-cream grid place-items-center p-6 text-center text-maroon">
        <p>Configure Clerk in <code>apps/web/.env.local</code> before creating accounts.</p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-7">
        <img src="/brand/wordmark-maroon.svg" alt="MS Brahmin Events" className="h-20 w-auto" />
        <SignUp
          routing="hash"
          signInUrl="/login"
          fallbackRedirectUrl="/"
          appearance={{ variables: { colorPrimary: "#7B1825", colorBackground: "#FFF7E8" } }}
        />
      </div>
    </main>
  );
}
