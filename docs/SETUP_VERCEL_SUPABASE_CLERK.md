# MS Brahmin Events: Clerk + Supabase + Vercel

This is the supported production architecture:

- Clerk: authentication, sessions, password recovery and social login
- Supabase: PostgreSQL and Realtime
- Vercel: Next.js UI and authenticated Route Handlers

The legacy password/JWT flow and the requirement for a separately hosted NestJS API have been removed from the web application.

## 1. Activate the Clerk student offer

If you use the GitHub Student Developer Pack, activate the Clerk offer from the pack before creating the production Clerk application. The offer currently provides Clerk Pro while the student status remains active.

Create one Clerk application. Enable Email/Password and any social providers you want, such as Google.

Copy these values from Clerk into `apps/web/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
```

Do not create a Supabase Auth login flow. Clerk is the only login UI.

## 2. Create the Supabase project

Create a Supabase project in the region nearest most users. In Project Settings, collect:

- Project URL
- Publishable key (not the secret/service-role key)
- Transaction pooler connection string (port 6543)
- Direct or session-pooler connection string (port 5432)

Add them to `apps/web/.env.local` using `apps/web/.env.example` as the template. URL-encode special characters in the database password.

Use the transaction pooler for `DATABASE_URL`, because Vercel functions create short-lived connections. Use the direct/session connection for `DIRECT_URL`, because Prisma migrations need a stable connection.

## 3. Connect Clerk to Supabase

1. In Clerk, open the Supabase integration and activate it.
2. Copy the Clerk domain shown by Clerk.
3. In Supabase, open **Authentication → Sign In / Providers → Add provider → Clerk**.
4. Paste the Clerk domain and save.

Use the native integration. Do not create the deprecated Supabase JWT template and never share the Supabase JWT secret with Clerk.

## 4. Apply the database

From PowerShell at the repository root:

```powershell
$env:DATABASE_URL="YOUR_SUPABASE_TRANSACTION_POOLER_URL"
$env:DIRECT_URL="YOUR_SUPABASE_DIRECT_OR_SESSION_POOLER_URL"
npm run db:generate
npm run db:migrate:deploy
npm run db:seed:api
```

The migrations create the application schema, add the Clerk user id, enable RLS, and add `orders` and `deliveries` to Supabase Realtime.

Set `ADMIN_EMAILS` to the owner addresses before the first sign-in:

```env
ADMIN_EMAILS=owner@example.com
```

Only addresses explicitly listed there receive the `ADMIN` role. Every other first-time Clerk user becomes a `CUSTOMER`. Afterwards, admins can assign Kitchen and Delivery roles from the app.

## 5. Run locally

Copy the environment template:

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
```

Fill in real values, then run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The health endpoint is `http://localhost:3000/api/health`.

## 6. Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Keep the repository root as the Vercel Root Directory; `vercel.json` selects the web build.
3. Add every variable from `apps/web/.env.example` in Vercel Project Settings.
4. Use production Clerk keys (`pk_live_...` and `sk_live_...`) for production.
5. Deploy.
6. In Clerk, add the Vercel production domain to the allowed origins/redirect URLs.
7. Run a production smoke test: sign up, sign in, place a COD order, advance it in Kitchen, accept it in Delivery, and verify the customer order status.

For Preview deployments, either add the preview domain pattern in Clerk or use a separate Clerk development instance.

## 7. Security and operations

- Never put `CLERK_SECRET_KEY`, database URLs, or Razorpay secrets in `NEXT_PUBLIC_*` variables.
- Do not add a Supabase service-role key to the browser.
- Application roles live in the database, not editable Clerk public metadata.
- Browser access to application tables is read-only; mutations pass through Clerk-protected Vercel handlers.
- Supabase RLS limits Realtime records to the signed-in customer or authorized staff.
- Keep Vercel's previous successful deployment available for rollback.
- Apply additive database migrations before deploying code that depends on them.

## Optional Razorpay setup

Set both variables in Vercel to enable online payments:

```env
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

When they are absent, customers should use cash on delivery. Payment signatures are verified only on the server.

## Official references

- Clerk + Supabase: https://clerk.com/docs/guides/development/integrations/databases/supabase
- Supabase Clerk provider: https://supabase.com/docs/guides/auth/third-party/clerk
- Vercel monorepos: https://vercel.com/docs/monorepos
