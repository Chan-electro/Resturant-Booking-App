"use client";

import { useAuth, useClerk, useSession } from "@clerk/nextjs";
import { useCallback, useEffect, useRef } from "react";

const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_WRITE_THROTTLE_MS = 5 * 1000;
const STORAGE_KEY_PREFIX = "ms-brahmin-session-activity:";

export default function SessionTimeout() {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const { session } = useSession();
  const { signOut } = useClerk();
  const isSigningOut = useRef(false);

  const expireSession = useCallback(async (storageKey: string) => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;
    window.localStorage.removeItem(storageKey);

    try {
      await signOut({ redirectUrl: "/login" });
    } catch (error) {
      console.error("Automatic session sign out failed", error);
    } finally {
      // A hard navigation also clears all in-memory customer and staff data.
      window.location.replace("/login");
    }
  }, [signOut]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !sessionId || !session) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${sessionId}`;
    const maximumSessionDeadline = session.createdAt.getTime() + SESSION_IDLE_TIMEOUT_MS;
    let timeoutId: number | undefined;
    let lastWrite = 0;

    const readLastActivity = () => {
      const value = Number(window.localStorage.getItem(storageKey));
      return Number.isFinite(value) && value > 0 ? value : null;
    };

    const scheduleExpiry = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      const lastActivity = readLastActivity();
      if (!lastActivity) return;

      const inactivityDeadline = lastActivity + SESSION_IDLE_TIMEOUT_MS;
      const remaining = Math.min(inactivityDeadline, maximumSessionDeadline) - Date.now();
      if (remaining <= 0) {
        void expireSession(storageKey);
        return;
      }

      timeoutId = window.setTimeout(() => {
        void expireSession(storageKey);
      }, remaining);
    };

    const recordActivity = () => {
      const now = Date.now();
      const lastActivity = readLastActivity();

      // Do not let activity after the deadline revive an expired session.
      if (
        now >= maximumSessionDeadline ||
        (lastActivity && now - lastActivity >= SESSION_IDLE_TIMEOUT_MS)
      ) {
        void expireSession(storageKey);
        return;
      }

      if (now - lastWrite >= ACTIVITY_WRITE_THROTTLE_MS) {
        window.localStorage.setItem(storageKey, String(now));
        lastWrite = now;
      }
      scheduleExpiry();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") recordActivity();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) scheduleExpiry();
    };

    if (!readLastActivity()) {
      const now = Date.now();
      window.localStorage.setItem(storageKey, String(now));
      lastWrite = now;
    }
    scheduleExpiry();

    const activityEvents: Array<keyof WindowEventMap> = [
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [expireSession, isLoaded, isSignedIn, session, sessionId]);

  return null;
}
