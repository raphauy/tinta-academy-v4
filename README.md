# Tinta Academy V4

Plataforma de educación en vinos.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Base de Datos:** PostgreSQL (Neon) + Prisma 7
- **Autenticación:** NextAuth v5 + OTP via email
- **Email:** Resend + React Email
- **UI:** shadcn/ui + Tailwind CSS
- **Storage:** Vercel Blob

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   pnpm install
   ```
3. Configurar variables de entorno (ver `.env.example`)
4. Ejecutar migraciones:
   ```bash
   pnpm prisma migrate dev
   ```
5. Ejecutar seed:
   ```bash
   pnpm prisma db seed
   ```
6. Iniciar servidor:
   ```bash
   pnpm dev
   ```

## Variables de Entorno

```env
DATABASE_URL=
AUTH_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
BLOB_READ_WRITE_TOKEN=
```

## Estructura

```
src/
├── app/
│   ├── (auth)/login/     # Login con OTP
│   ├── (public)/         # Landing pública
│   ├── admin/            # Panel superadmin
│   ├── educator/         # Panel educador
│   ├── student/          # Panel estudiante
│   └── profile/          # Perfil de usuario
├── components/
│   ├── ui/               # shadcn/ui
│   ├── shell/            # AppShell, navegación
│   └── shared/           # Componentes compartidos
├── services/             # Lógica de negocio
└── lib/                  # Utilidades, auth, prisma
```

## Roles

- **superadmin:** Acceso completo al panel de administración
- **educator:** Gestión de cursos y estudiantes
- **student:** Acceso a cursos comprados
