# Brahma Kalasha — Full Build Design Spec

**Date:** 2026-05-31  
**Status:** Approved  
**Scope:** Complete production build — single unified implementation

---

## 1. Overview

Brahma Kalasha is a premium vegetarian pre-order food platform. Customers order by 9 PM for next-day delivery. The business prepares food based on confirmed pre-orders and delivers via its own staff.

**Four user roles:** Customer, Kitchen, Delivery, Admin.  
**Two platforms:** Web (Next.js) for all roles; Android (Expo) for customers and delivery staff.

---

## 2. Current Codebase State

| What exists | State |
|---|---|
| `apps/web` — Next.js with all 4 role UIs | Built with mock data; needs real API wiring |
| `packages/prisma` — Prisma schema | Complete, all tables defined, no migration run yet |
| `packages/shared` — TypeScript types | Complete, shared across packages |
| Tailwind v4 brand theme | Complete (maroon, gold, cream, ivory palette) |
| `apps/api` — NestJS backend | Does not exist yet |
| `apps/mobile` — Expo app | Does not exist yet |
| Authentication | Does not exist (role selector only) |
| Database connection | Does not exist |

---

## 3. Monorepo Structure

```
brahma-kalasha/
├── apps/
│   ├── web/          # Next.js 14 App Router — all 4 roles (web)
│   ├── api/          # NestJS — REST API, auth authority, business logic
│   └── mobile/       # Expo + NativeWind — Android app (customer + delivery)
├── packages/
│   ├── shared/       # TypeScript types (complete)
│   ├── prisma/       # Prisma schema + migrations (complete schema)
│   ├── ui/           # Shared component stubs
│   └── config/       # Shared ESLint, TypeScript configs
```

Root `package.json` already has npm workspaces covering `apps/*` and `packages/*`.

---

## 4. Authentication & Authorization

### Strategy
`apps/api` (NestJS) is the single authentication authority for all clients.

### Providers (Phase 1)
- **Email/Password** — bcrypt hash (12 rounds), stored in `users.passwordHash`
- **Google OAuth** — Passport.js `passport-google-oauth20` strategy

### Tokens
- **Access token:** JWT, 15-minute expiry, contains `{ sub: userId, role, email }`
- **Refresh token:** JWT, 7-day expiry, stored in HTTP-only `SameSite=Strict` cookie
- Refresh token rotation on every use

### Web (`apps/web`)
- Auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`
- Next.js middleware reads JWT access token from cookie, redirects unauthenticated requests
- Route groups protected by role: `/(customer)`, `/(kitchen)`, `/(delivery)`, `/(admin)`
- Token stored in HTTP-only cookie set by the API

### Mobile (`apps/mobile`)
- JWT stored in `expo-secure-store`
- Axios interceptor attaches `Authorization: Bearer <token>` to every API request
- Auto-refresh before expiry

### Role-Based Access
- `CUSTOMER` — ordering, cart, profile, favorites
- `KITCHEN` — order queue, status updates, production view
- `DELIVERY` — assigned deliveries, pickup/delivery confirmation
- `ADMIN` — full access: menu, orders, users, analytics, settings

---

## 5. Backend Architecture (`apps/api`)

### Stack
- NestJS with TypeScript
- Passport.js for OAuth strategies
- `class-validator` + `class-transformer` for DTO validation
- Prisma Client for database access
- `@nestjs/swagger` for OpenAPI documentation
- `@nestjs/throttler` for rate limiting

### Modules
| Module | Responsibility |
|---|---|
| Auth | Login, register, Google OAuth, JWT issue/refresh, logout |
| Users | Profile CRUD, address management |
| Menu | Categories, menu items, daily menu management |
| Orders | Place order, order history, status timeline |
| Cart | Add/remove/update cart items |
| Kitchen | Order queue view, status updates, production summary |
| Delivery | Assigned deliveries, pickup/delivery confirmation, COD |
| Notifications | In-app notifications, mark-read |
| Analytics | Revenue, orders, top items, performance metrics |
| Settings | Cutoff time, delivery fee, service zones, payment methods |
| Admin | User management, coupon management, audit logs |

### API Design
- Base: `/api/v1/`
- All responses: `{ success: boolean, data: T, error?: string, message?: string }`
- Paginated lists: `{ success, data: T[], total, page, pageSize, totalPages }`
- Rate limiting: 5 req/15min on auth endpoints; 100 req/min general

### Guards & Interceptors
- `JwtAuthGuard` — validates access token on every protected route
- `RolesGuard` — enforces `@Roles(...)` decorator
- `LoggingInterceptor` — logs all requests
- `TransformInterceptor` — wraps responses in standard envelope
- `GlobalHttpExceptionFilter` — standardizes error responses

---

## 6. Database

Schema is **complete** in `packages/prisma/schema.prisma`. No structural changes needed.

### Setup tasks
1. Create PostgreSQL database (local Docker for dev)
2. Run `prisma migrate dev` to create tables
3. Run seed script to populate: categories (6), sample menu items (12+), admin user

### Key indexes already defined
- `orders`: userId, status, deliveryDate, orderNumber
- `notifications`: userId + isRead
- `deliveries`: driverId
- `audit_logs`: entity+entityId, userId

---

## 7. Frontend Architecture (`apps/web`)

### shadcn/ui Integration
Brand variables mapped to shadcn CSS variable conventions:

| Brand | shadcn var | Role |
|---|---|---|
| `--color-maroon` (#4B0F16) | `--primary` | Primary actions, headings |
| `--color-cream` (#F5F1EC) | `--background` | Page backgrounds |
| `--color-ivory` (#E7DED7) | `--card` | Card surfaces |
| `--color-gold` (#C89B63) | `--accent` | Highlights, active states |
| `--color-cocoa` (#2A1A1C) | `--foreground` | Body text |
| `--color-burgundy` (#7A2E36) | `--primary-foreground` inverse | Text on primary |

Both variable sets coexist. Existing components keep `bg-maroon` / `text-gold` classes. New shadcn components use `bg-primary` / `text-accent`. No mass rewrite of existing UI.

### Route Structure (App Router)
```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── (customer)/
│   ├── page.tsx          # Home — hero, menu preview, countdown timer
│   ├── menu/             # Full menu browse with category tabs
│   ├── cart/             # Cart sheet / page
│   ├── checkout/         # Multi-step: address → payment → confirm
│   ├── orders/           # Order history list
│   ├── orders/[id]/      # Order detail + status timeline
│   ├── profile/          # Profile management
│   ├── addresses/        # Address CRUD
│   ├── favorites/        # Saved items
│   └── notifications/    # Notification center
├── (kitchen)/
│   ├── page.tsx          # Order queue (kanban)
│   └── production/       # Production summary + print sheet
├── (delivery)/
│   ├── page.tsx          # Today's deliveries
│   ├── [id]/             # Delivery detail
│   └── history/          # Delivery history
└── (admin)/
    ├── page.tsx          # Dashboard overview (KPIs + charts)
    ├── menu/             # Menu item CRUD
    ├── categories/       # Category management
    ├── orders/           # Order management table
    ├── customers/        # Customer list
    ├── delivery/         # Delivery assignment + tracking
    ├── coupons/          # Coupon management
    ├── analytics/        # Revenue + performance charts
    ├── reports/          # Generate + export reports
    ├── settings/         # Platform settings
    ├── audit-logs/       # Audit log viewer
    └── users/            # Staff account management
```

### Data Fetching
- Server Components for initial data loads (menus, order history)
- React Query (`@tanstack/react-query`) for client-side mutations and real-time updates
- API utility: `lib/api.ts` — typed Axios wrapper with JWT refresh interceptor

### Middleware
`middleware.ts` at root — reads JWT from cookie, checks role, redirects to `/login` if unauthenticated or to role home if wrong role.

---

## 8. Mobile Architecture (`apps/mobile`)

### Stack
- Expo (managed workflow)
- Expo Router (file-based routing)
- NativeWind (Tailwind for React Native — same brand tokens)
- React Query for server state
- Axios with SecureStore token interceptor

### Screens — Customer
- Home (hero, menu preview, countdown timer)
- Menu browse (category tabs, item cards)
- Item detail (image, description, nutrition, add to cart)
- Cart
- Checkout (address, payment, confirm)
- Order confirmation
- Orders list + order detail with status timeline
- Profile + address management
- Favorites
- Notifications

### Screens — Delivery
- Today's deliveries list
- Delivery detail (customer info, address, navigation link, call button)
- Pickup + delivery confirmation
- COD recording
- Delivery history

### Shared
- Types from `packages/shared`
- Same `/api/v1/` endpoints as web
- NativeWind config maps the same brand colors

---

## 9. Real-Time Features

- **Kitchen order queue** — WebSocket (NestJS `@nestjs/websockets` + socket.io) — new orders push to kitchen in real time
- **Delivery status** — WebSocket (same socket.io gateway) — customer sees status update without refresh
- **Admin dashboard** — WebSocket (same socket.io gateway) — live KPI updates

---

## 10. Notifications

- **In-app** — `notifications` table, bell icon in nav shows unread count
- **Email** — Nodemailer (local dev) / AWS SES (production) for: order confirmation, status updates, password reset
- **Push** — PWA Web Push for web; Expo Notifications for mobile

---

## 11. Security

- JWT in HTTP-only, SameSite=Strict, Secure cookies (web)
- SecureStore (mobile)
- bcrypt 12 rounds for passwords
- Helmet.js for security headers (HSTS, X-Frame-Options, CSP, X-Content-Type-Options)
- CORS restricted to known origins
- Rate limiting: 5/15min on auth; 100/min general
- Prisma parameterized queries (no SQL injection surface)
- `class-validator` on all API inputs
- Audit log on all state-changing operations
- Role guards on every protected endpoint

---

## 12. Deployment

### Local Dev
- Docker Compose: PostgreSQL + API + Web (Redis deferred — not needed for initial build)
- `.env` files per package

### Production
- Dockerfile for `apps/api` (NestJS standalone)
- Dockerfile for `apps/web` (Next.js standalone output)
- AWS: ECS or EC2 for apps, RDS for PostgreSQL, S3 for images, CloudFront for CDN
- GitHub Actions: lint → test → build → deploy (staging on PR, production on merge to main)
- Expo: `eas build` for Android APK/AAB

---

## 13. Testing

- **Unit:** Jest for NestJS services, React Testing Library for components
- **Integration:** Supertest for API endpoints with test database
- **E2E:** Playwright for critical customer/kitchen/delivery/admin flows
- **Security:** Manual OWASP checklist (SQL injection, XSS, CSRF, rate limiting, role escalation)
- **Performance:** Lighthouse CI (90+ target), k6 load test (100 concurrent users)

---

## 14. Key Constraints & Decisions

1. **No dark mode** — PRD explicitly excludes it
2. **Next.js App Router only** — no Pages Router
3. **Single auth authority** — NestJS API, not Auth.js/NextAuth
4. **Prisma schema is locked** — no structural changes to the existing complete schema
5. **Existing UI components preserved** — shadcn added alongside, not replacing existing components in mass
6. **Mobile is customer + delivery only** — Kitchen and Admin are web-only
7. **Phone OTP deferred** — not in this build; added later with Twilio/similar
8. **Google OAuth + Email/Password** — two auth providers from day one
