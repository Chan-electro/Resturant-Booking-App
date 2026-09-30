"use client";

import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-mode";

export default function LoginPage() {
  if (!isClerkConfigured) return <SetupMessage />;

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-7">
        <img src="/brand/wordmark-maroon.svg" alt="MS Brahmin Events" className="h-20 w-auto" />
        <SignIn
          routing="hash"
          signUpUrl="/register"
          fallbackRedirectUrl="/"
          appearance={{ variables: { colorPrimary: "#7B1825", colorBackground: "#FFF7E8" } }}
        />
      </div>
    </main>
  );
}

function SetupMessage() {
  return (
    <main className="min-h-screen bg-cream grid place-items-center p-6">
      <section className="max-w-lg rounded-2xl border border-ivory bg-white p-8 text-center shadow-sm">
        <img src="/brand/wordmark-maroon.svg" alt="MS Brahmin Events" className="mx-auto mb-6 h-16 w-auto" />
        <h1 className="font-display text-2xl font-bold text-maroon">Clerk setup required</h1>
        <p className="mt-3 text-sm leading-6 text-maroon/65">
          Add your Clerk publishable and secret keys to <code>apps/web/.env.local</code>, then restart the app.
        </p>
      </section>
    </main>
  );
}
