import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/shell'

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'educator') {
    redirect('/')
  }

  return (
    <AppShell
      variant="educator"
      user={{
        name: session.user.name,
        email: session.user.email ?? undefined,
        image: session.user.image,
        role: session.user.role,
      }}
    >
      {children}
    </AppShell>
  )
}
