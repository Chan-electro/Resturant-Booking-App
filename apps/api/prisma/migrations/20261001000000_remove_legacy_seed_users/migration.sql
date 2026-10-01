-- Remove predictable legacy password accounts created by the old development
-- seed. Clerk is now the only identity provider, and application roles are
-- assigned from ADMIN_EMAILS or by an authenticated administrator.
DELETE FROM "users"
WHERE "clerkId" IS NULL
  AND email IN (
    'admin@brahmakalasha.com',
    'kitchen@brahmakalasha.com',
    'delivery@brahmakalasha.com'
  );
