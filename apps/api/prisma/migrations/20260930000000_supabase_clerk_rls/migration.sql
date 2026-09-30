-- Clerk is the identity provider. Supabase validates Clerk session JWTs and
-- exposes the Clerk user id as auth.jwt()->>'sub'. Application roles remain in
-- public.users so end users cannot promote themselves through Clerk metadata.

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.users
  WHERE "clerkId" = (SELECT auth.jwt()->>'sub')
    AND "isActive" = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS "UserRole"
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.users
  WHERE "clerkId" = (SELECT auth.jwt()->>'sub')
    AND "isActive" = true
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Direct browser access is read-only. All mutations go through authenticated
-- Vercel route handlers, which validate roles and business rules atomically.
REVOKE INSERT, UPDATE, DELETE ON public.users, public.addresses, public.categories,
  public.menu_items, public.daily_menus, public.orders, public.order_items,
  public.order_status_history, public.deliveries, public.notifications,
  public.coupons, public.settings, public.audit_logs FROM anon, authenticated;

GRANT SELECT ON public.categories, public.menu_items, public.daily_menus TO authenticated;
GRANT SELECT ON public.users, public.orders, public.order_items,
  public.order_status_history, public.deliveries, public.notifications TO authenticated;

CREATE POLICY "authenticated users can read active categories"
ON public.categories FOR SELECT TO authenticated
USING ("isActive" = true OR public.current_app_role() = 'ADMIN');

CREATE POLICY "authenticated users can read active menu items"
ON public.menu_items FOR SELECT TO authenticated
USING ("isActive" = true OR public.current_app_role() = 'ADMIN');

CREATE POLICY "authenticated users can read available daily menus"
ON public.daily_menus FOR SELECT TO authenticated
USING ("isAvailable" = true OR public.current_app_role() IN ('ADMIN', 'KITCHEN'));

CREATE POLICY "users can read their own profile and staff can read profiles"
ON public.users FOR SELECT TO authenticated
USING (
  id = public.current_app_user_id()
  OR public.current_app_role() IN ('ADMIN', 'KITCHEN', 'DELIVERY')
);

CREATE POLICY "customers see their orders and staff see operational orders"
ON public.orders FOR SELECT TO authenticated
USING (
  "userId" = public.current_app_user_id()
  OR public.current_app_role() IN ('ADMIN', 'KITCHEN', 'DELIVERY')
);

CREATE POLICY "order items follow order visibility"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items."orderId"
  )
);

CREATE POLICY "order history follows order visibility"
ON public.order_status_history FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history."orderId"
  )
);

CREATE POLICY "delivery visibility"
ON public.deliveries FOR SELECT TO authenticated
USING (
  "driverId" = public.current_app_user_id()
  OR public.current_app_role() IN ('ADMIN', 'KITCHEN')
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = deliveries."orderId"
      AND orders."userId" = public.current_app_user_id()
  )
);

CREATE POLICY "users can read their notifications"
ON public.notifications FOR SELECT TO authenticated
USING ("userId" = public.current_app_user_id());

-- Required for Supabase Postgres Changes subscriptions. The guarded block keeps
-- the migration safe if a project already added either table to the publication.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'deliveries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
  END IF;
END $$;
