import { auth } from '@/lib/auth'
import { AppShell } from '@/components/shell'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <AppShell
      variant="public"
      user={
        session?.user
          ? {
              name: session.user.name,
              email: session.user.email ?? undefined,
              image: session.user.image,
              role: session.user.role,
            }
          : undefined
      }
    >
      {children}
    </AppShell>
  )
}
