# Tinta Academy - Agent Instructions

## Project Overview

Tinta Academy is an online wine education platform built with Next.js 16, using:
- **Auth:** NextAuth v5 with OTP-based login
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **UI:** shadcn/ui components with Tailwind CSS 4
- **Email:** Resend for transactional emails

## Quick Commands

### Development
```bash
# Start dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build for production
pnpm build
```

### Verification Workflow (IMPORTANT)

**Run these commands IN SEQUENCE, not in parallel:**

```bash
# 1. First typecheck - catches type errors
pnpm tsc --noEmit

# 2. Then lint - catches style/code issues
pnpm lint

# 3. Finally build - catches production-only errors
pnpm build
```

**Why sequential?**
- Fixing typecheck errors often resolves lint errors too
- Fixing lint errors can resolve some build errors
- Running in parallel wastes time fixing the same issue multiple times
- Some errors only appear in build (not in typecheck), so always run build last

### Database
```bash
# Generate Prisma client after schema changes
pnpm prisma generate

# Create and apply migration (PREFERRED - use this instead of db push)
pnpm prisma migrate dev --name <migration_name>

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Run seed script
pnpm prisma db seed
```

**IMPORTANT:** Always use `prisma migrate dev` instead of `prisma db push` for schema changes. Migrations provide version control and are required for production deployments.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (public)/          # Public pages (landing)
│   ├── admin/             # Admin panel
│   ├── educator/          # Educator panel
│   ├── student/           # Student panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── shell/             # App shell (nav, sidebar)
│   └── shared/            # Shared components
├── lib/                   # Core utilities
├── services/              # Business logic
└── types/                 # TypeScript types

prisma/
└── schema.prisma          # Database schema

product-plan/
├── sections/              # UI components to copy
├── instructions/          # Implementation guides
└── data-model/            # Type definitions
```

## Key Patterns

### Architecture Layers

```
┌─────────────────────────────────────────┐
│  UI (Client Components)                 │
└─────────────────┬───────────────────────┘
                  │ calls (mutations)
┌─────────────────▼───────────────────────┐
│  Server Actions (actions.ts)            │
│  - Validation (Zod)                     │
│  - Call services for mutations          │
└─────────────────┬───────────────────────┘
                  │ calls
                  │
┌─────────────────┴───────────────────────┐
│  RSC / Pages (page.tsx)                 │────┐
│  - Can call services directly (reads)   │    │
└─────────────────────────────────────────┘    │ calls
                                               │
┌──────────────────────────────────────────────▼┐
│  Services (src/services/*.ts)                 │
│  - Business logic                             │
│  - Prisma calls                               │
└─────────────────┬─────────────────────────────┘
                  │ calls
┌─────────────────▼───────────────────────┐
│  Prisma (database)                      │
└─────────────────────────────────────────┘
```

**IMPORTANT:**
- Only services access Prisma directly
- RSC/Pages can call services directly for reading data
- Server Actions are for mutations (forms, buttons) - they call services
- Client Components call Server Actions for mutations

### Data Fetching (Server Components)
Fetch data via services in async Server Components:
```typescript
// src/app/(public)/page.tsx
import { getUpcomingCourses, getPastCourses } from '@/services/course-service'

export default async function Page() {
  const upcoming = await getUpcomingCourses()
  const past = await getPastCourses()
  return <CourseList upcoming={upcoming} past={past} />
}
```

### Services (Data Access Layer)
All Prisma calls go in services:
```typescript
// src/services/course-service.ts
import { prisma } from '@/lib/prisma'

export async function getUpcomingCourses() {
  return prisma.course.findMany({
    where: { status: { in: ['announced', 'enrolling', 'available'] } },
    include: { educator: true, tags: true }
  })
}
```

### Server Actions (Mutations)
Server actions validate input and call services:
```typescript
// src/app/(public)/actions.ts
'use server'
import { z } from 'zod'
import { subscribe } from '@/services/newsletter-service'

const emailSchema = z.string().email()

export async function subscribeToNewsletter(email: string) {
  const validated = emailSchema.parse(email)
  return subscribe(validated)
}
```

### API Routes (External Only)
**ONLY** use API routes for:
- Webhooks (MercadoPago, Stripe, etc.)
- External integrations
- Public APIs consumed by third parties

**DO NOT** use API routes for internal app operations.

### UI Components

**ALWAYS use shadcn/ui components, NOT native HTML elements:**

| DON'T use | USE instead | Import from |
|-----------|-------------|-------------|
| `<button>` | `<Button>` | `@/components/ui/button` |
| `<input>` | `<Input>` | `@/components/ui/input` |
| `<select>` | `<Select>` | `@/components/ui/select` |
| `<textarea>` | `<Textarea>` | `@/components/ui/textarea` |
| `<checkbox>` | `<Checkbox>` | `@/components/ui/checkbox` |
| `<dialog>` | `<Dialog>` | `@/components/ui/dialog` |
| `<table>` | `<Table>` | `@/components/ui/table` |

Example:
```typescript
// WRONG - native HTML
<button onClick={handleClick}>Submit</button>
<select onChange={handleChange}>...</select>

// CORRECT - shadcn/ui
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Button onClick={handleClick}>Submit</Button>
<Select onValueChange={handleChange}>
  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

Available components in `src/components/ui/`: Check the directory for all available components.

Copy pre-built components from `product-plan/sections/*/components/` and integrate with real data.

## Database Models Status

### Implemented
- User (with role: superadmin | educator | student)
- Student (extends User)
- Educator (extends User)
- OtpToken (for passwordless login)

### To Implement (as needed per milestone)
- Course, Module, Lesson, Resource
- Enrollment, Progress
- Order, Coupon, BankData
- Tag (for course filtering)
- EmailTemplate, EmailCampaign

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=...
BLOB_READ_WRITE_TOKEN=...
```

## Common Issues & Solutions

### Prisma client not found
```bash
pnpm prisma generate
```

### Type errors after schema change
```bash
pnpm prisma generate && pnpm tsc --noEmit
```

### Auth issues
Check that AUTH_SECRET is set and cookies are not blocked.

## Learnings Log

<!-- Ralph will append learnings here -->
