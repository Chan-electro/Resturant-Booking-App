# Brahma Kalasha

Premium Vegetarian Pre-Order Platform

## Project Structure

```
brahma-kalasha/
├── apps/
│   ├── web/          # Next.js 14 frontend (Customer, Kitchen, Delivery, Admin)
│   └── api/          # NestJS backend (coming soon)
├── packages/
│   ├── shared/       # Shared TypeScript types
│   └── prisma/       # Prisma schema & migrations
├── package.json      # Monorepo root (npm workspaces)
└── complete.md       # Master PRD
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (for full backend, optional for frontend dev)

### Frontend Development

```bash
# Install dependencies
cd apps/web && npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Roles

The application supports 4 user roles:
- **Customer** — Browse menus, order meals, track deliveries
- **Kitchen** — Manage preparation queues, update cooking status
- **Delivery** — Navigate routes, confirm pickups/deliveries
- **Admin** — Dashboard, menu management, orders, analytics, settings

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS v4
- **UI Components**: Radix UI, Lucide Icons, Framer Motion
- **Backend**: NestJS (planned)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth v5)
- **Deployment**: Docker + AWS (planned)

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Maroon | `#4B0F16` | Primary, headers, CTAs |
| Burgundy | `#7A2E36` | Secondary, hover states |
| Temple Gold | `#C89B63` | Accents, pricing, highlights |
| Warm Ivory | `#E7DED7` | Borders, dividers |
| Soft Cream | `#F5F1EC` | Backgrounds |
| Dark Cocoa | `#2A1A1C` | Text emphasis |
| Muted Bronze | `#A86F3D` | Secondary accents |
| Sand Beige | `#D8C2A8` | Tags, badges |
