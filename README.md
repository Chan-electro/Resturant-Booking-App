# MS Brahmin Events

Event management and vegetarian home-catering platform with customer, kitchen, delivery, and administration workspaces.

## Stack

- Next.js 16 and React 19 frontend in `apps/web`
- NestJS API in `apps/api`
- Supabase PostgreSQL, Realtime, and Prisma migrations
- Clerk authentication
- Vercel Route Handlers (no separate production API host required)

## Local development

Requirements: Node.js 22.13+. A Clerk application and Supabase project are
required for authenticated application features.

```bash
npm install
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/api/.env.example apps/api/.env
npm run db:generate
npm run dev
```

Open `http://localhost:3000`. Until Clerk and Supabase are configured, the web
app displays a setup screen; it does not fall back to local password authentication.

## Enable Clerk

1. Create a Clerk application and copy its publishable and secret keys.
2. Copy `apps/web/.env.example` to `apps/web/.env.local` and add Clerk and Supabase values.
3. Put `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in the web environment.
4. Activate Clerk's native Supabase integration and configure Clerk as a third-party auth provider in Supabase.
5. Apply the database migrations with `npm run db:migrate:deploy` and seed the initial menu with `npm run db:seed:api`.

Clerk verifies the browser session. The Vercel Route Handlers synchronize the
Clerk identity with the application user and enforce database-backed roles.
Existing accounts are linked by verified email on first Clerk sign-in.

## Deployment

Production uses Vercel for the Next.js application, Supabase for PostgreSQL and Realtime, and Clerk for authentication. The NestJS workspace is retained only as migration/legacy reference and does not need a production host. Follow [the deployment guide](docs/SETUP_VERCEL_SUPABASE_CLERK.md).

## Brand system

| Color | Hex | Usage |
|---|---|---|
| Maroon | `#7B1825` | Primary actions and headings |
| Gold | `#B88A36` | Accents and highlights |
| Ivory | `#FFF7E8` | Main background |
| Green | `#426B38` | Optional supporting accent |

The web app uses the supplied MS Brahmin Events logo files and bundled DejaVu Sans/Serif fonts.
