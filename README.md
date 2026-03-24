# SwiftShip — Courier Management System (Frontend)

Frontend for SwiftShip, a full-featured courier and delivery management platform. Built with Next.js 16, React 19, TanStack Query, TanStack Form, shadcn/ui, and Tailwind CSS v4.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8)](https://tailwindcss.com/)

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Server State | TanStack Query v5 |
| Forms | TanStack Form v1 |
| Tables | TanStack Table v8 |
| Validation | Zod v4 |
| HTTP Client | Axios |
| Charts | Recharts |
| Notifications | Sonner |

---

## Prerequisites

- Node.js 20 or higher
- Bun 1.3 or higher — [bun.sh](https://bun.sh)
- Backend server running at `http://localhost:5000` — see [Backend README](../L2B6A5-Backend-Management-System/README.md)

---

## Getting Started

**1. Install dependencies**

```bash
bun install
```

**2. Set up environment variables**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
JWT_ACCESS_SECRET=your_super_secret_access_token_key_here
```

> `JWT_ACCESS_SECRET` must match `ACCESS_TOKEN_SECRET` in the backend `.env`.

**3. Start the development server**

```bash
bun dev
```

App runs at `http://localhost:4000`

**4. Build for production**

```bash
bun run build
bun start
```

---

## Project Structure

```
src/
├── app/
│   ├── (commonLayout)/          # Public pages (home, login, register)
│   ├── (dashboardLayout)/       # Protected dashboard pages
│   │   ├── admin/dashboard/     # Admin routes
│   │   ├── courier/dashboard/   # Courier routes
│   │   ├── merchant/dashboard/  # Merchant routes
│   │   └── dashboard/           # User routes
│   └── globals.css
├── components/
│   ├── modules/                 # Feature-specific components
│   │   ├── Auth/
│   │   ├── Dashboord/
│   │   ├── Home/
│   │   ├── Admin/
│   │   └── Shipment/
│   ├── shared/                  # Reusable components (table, form, charts)
│   └── ui/                      # shadcn/ui primitives
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities (auth, nav, jwt, cookies)
├── providers/                   # QueryProvider
├── services/                    # Server actions (API calls)
├── types/                       # TypeScript interfaces
├── zod/                         # Zod validation schemas
└── proxy.ts                     # Next.js middleware (auth + route guard)
```

---

## User Roles & Routes

| Role | Dashboard Route | Key Pages |
|---|---|---|
| `SUPER_ADMIN` / `ADMIN` | `/admin/dashboard` | Couriers, Merchants, Users, Shipments, Payments, Pricing, Notifications |
| `COURIER` | `/courier/dashboard` | Available Shipments, My Deliveries, Earnings, Notifications |
| `MERCHANT` | `/merchant/dashboard` | My Shipments, Create Shipment, Notifications |
| `USER` | `/dashboard` | My Shipments, Create Shipment, Track, Notifications |

Route access is enforced by the middleware in `src/proxy.ts`. Unauthenticated users are redirected to `/login`. Authenticated users accessing the wrong role's route are redirected to their own dashboard.

---

## Key Features

**Authentication**
- JWT stored in non-httpOnly cookies for cross-origin requests
- Tokens sent via Authorization header
- Automatic token refresh via `x-refresh-token` header
- Middleware-level route protection per role
- Client-side navigation after login for proper cookie handling

**Notifications**
- Real-time notification dropdown with unread count badge
- Mark as read functionality with checkmark button
- Auto-refresh every 30 seconds
- Role-based notification pages for all user types
- Admin can view all system notifications with user info

**Shipment Creation**
- No manual amount input — price is fetched live from `/pricing/calculate` as you fill in city and weight
- Full price breakdown shown before submit (base, weight charge, express surcharge, total)

**Admin Pricing Management**
- View all configured region tiers (LOCAL / NATIONAL / INTERNATIONAL)
- Upsert rates directly from the dashboard

**Data Tables**
- Server-managed search, filter, sort, and pagination via URL query params
- Reusable `DataTable`, `DataTableSearch`, `DataTableFilters`, `DataTablePagination` components
- Proper data access patterns for paginated API responses

**Charts**
- Shipment bar chart and pie chart on admin dashboard using Recharts

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base URL |
| `JWT_ACCESS_SECRET` | Yes | Must match backend `ACCESS_TOKEN_SECRET` |

---

## Scripts

```bash
bun dev          # Development server with hot reload (port 4000)
bun run build    # Production build
bun start        # Start production server (port 4000)
bun run lint     # Run ESLint
```

---

## Design

- Primary color: Purple `oklch(0.52 0.26 295)`
- Accent color: Cyan `oklch(0.72 0.15 195)`
- Background: Off-white `oklch(0.98 0.004 80)`
- Sidebar: Deep purple `oklch(0.22 0.08 295)`
- Hover effects: 70-80% opacity for subtle interaction feedback
- Full dark mode support

---

## Related

- [Backend Repository](../L2B6A5-Backend-Management-System/README.md)
- [API Documentation](../L2B6A5-Backend-Management-System/API_DOCUMENTATION.md)
