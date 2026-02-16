# CLAUDE.md

## Communication
Always communicate in Spanish.

## Project Overview
Tinta Academy: wine education platform. Educators sell/manage courses, students purchase/access them. Payments via MercadoPago or bank transfer.

## Testing Workflow
- **Never run `pnpm dev`** - user runs it separately and tests UI manually
- Server logs: `dev.log` (use Read/tail to check errors)

## Tech Stack
Next.js 16 (App Router) | PostgreSQL (Neon) + Prisma 7 | NextAuth v5 (OTP) | Resend + React Email | shadcn/ui + Tailwind v4 | Vercel Blob | MercadoPago

## Commands
```bash
pnpm dev | build | lint | typecheck | email
pnpm prisma migrate dev | db seed | studio
```

## Architecture

### Route Groups
- `(landing)/` `(public)/` `(auth)/login/` - Public
- `admin/` `educator/` `student/` `profile/` - Protected by role
- `checkout/` - Public (handles own auth)

### Patterns
- **Actions:** `src/app/[group]/actions.ts` → returns `ActionResult<T>`
- **Services:** `src/services/*.ts` - business logic
- **Validations:** `src/lib/validations/*.ts` - zod schemas
- **Auth:** `src/proxy.ts` - middleware protecting routes by role

### Key Services
`course-service` | `checkout-service` | `email-service` | `email-campaign-service` | `enrollment-service` | `mercadopago-service`

### Database Models
User (role) → Student/Educator | Course → Enrollment | Order | EmailTemplate → EmailCampaign/WorkflowTemplate

## Conventions
- Forms: react-hook-form + zod + @hookform/resolvers
- Dates: America/Montevideo, date-fns + date-fns-tz
- Uploads: Vercel Blob via upload-service

## Linear

- Si el issue no está 100% claro: pregunta antes de codificar.
- Si el issue tiene imagen adjunta y la necesitas: pídela al usuario.
- El issue generalmente está escrito por el dueño de OnMind que no es técnico, por lo que los comentarios que se agreguen no deben ser técnicos, deben ser concretos y para el usuario de OnMind, no para el desarrollador.
- Escribir comentarios en primera persona
- Marcar Done solo después de que el usuario pruebe y confirme.