-- Keep Prisma-managed data inaccessible through Supabase's public Data API.
-- The application server connects directly to Postgres and continues to use
-- the database owner role, which is not restricted by these browser policies.

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- None of these tables are queried directly by the browser. Removing grants as
-- well as enabling RLS prevents accidental exposure if a permissive policy is
-- added later.
REVOKE ALL ON TABLE public.accounts, public.sessions,
  public.verification_tokens, public.menu_tags, public.menu_item_tags,
  public.carts, public.cart_items, public.reviews, public.favorites,
  public.subscription_plans, public.subscriptions, public._prisma_migrations
FROM anon, authenticated;

-- SECURITY DEFINER helpers used by RLS policies must not live in an exposed
-- schema. Policy dependencies follow the functions when their schema changes.
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO authenticated;

ALTER FUNCTION public.current_app_user_id() SET SCHEMA app_private;
ALTER FUNCTION public.current_app_role() SET SCHEMA app_private;

ALTER FUNCTION app_private.current_app_user_id() SET search_path TO '';
ALTER FUNCTION app_private.current_app_role() SET search_path TO '';

REVOKE ALL ON FUNCTION app_private.current_app_user_id() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION app_private.current_app_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.current_app_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.current_app_role() TO authenticated;

-- Stop future Prisma migrations from exposing new public tables or functions
-- to Supabase client roles by default. Required Data API access must be granted
-- explicitly in the migration that introduces it.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- Prisma's original Auth.js-compatible model used only a unique index. A real
-- compound primary key satisfies database integrity checks without changing
-- the identifier+token lookup used by Prisma Client.
DROP INDEX public.verification_tokens_identifier_token_key;
ALTER TABLE public.verification_tokens
  ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token);
