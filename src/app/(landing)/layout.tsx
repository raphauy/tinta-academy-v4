import { auth } from '@/lib/auth'
import { LandingShell } from '@/components/shell/landing-shell'

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <LandingShell
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
    </LandingShell>
  )
}
