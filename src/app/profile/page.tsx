import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserById } from '@/services/user-service'
import { ProfileForm } from '@/components/profile/profile-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Perfil de usuario</CardTitle>
            <CardDescription>
              Actualiza tu nombre y foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              user={{
                id: user.id,
                name: user.name ?? '',
                email: user.email,
                image: user.image,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
