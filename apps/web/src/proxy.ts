import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth-mode";

// Authorization is enforced at each protected resource: the home workspace
// checks the Clerk session and every API handler calls requireAppUser().
const clerkProxy = clerkMiddleware();

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // Setup mode keeps the site reachable until Clerk keys are provided. It never
  // falls back to the removed password/JWT authentication system.
  return isClerkConfigured ? clerkProxy(request, event) : NextResponse.next();
}

export const config = {
  matcher: [
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
    "/((?!_next/static|_next/image|favicon.ico|logo.png|brand/|.*\\.png|.*\\.svg).*)",
  ],
};
