"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export function useOrderRealtime(onChange: () => void) {
  const { session } = useSession();
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!session || !url || !key) return;

    const supabase = createClient(url, key, {
      accessToken: () => session.getToken(),
    });
    const channel = supabase
      .channel("order-workspace")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => callback.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "deliveries" }, () => callback.current())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session]);
}
