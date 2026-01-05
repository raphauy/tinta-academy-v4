import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/shell'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'student') {
    redirect('/')
  }

  return (
    <AppShell
      variant="student"
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
