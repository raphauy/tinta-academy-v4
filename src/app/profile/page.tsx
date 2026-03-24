import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserById } from '@/services/user-service'
import { getEducatorNotifications } from '@/services/educator-service'
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

  // Get educator notification preferences if applicable
  let educatorNotifications: { notifyOnComments: boolean } | null = null
  if (user.role === 'educator' || user.role === 'superadmin') {
    const educator = await getEducatorNotifications(user.id)
    if (educator) {
      educatorNotifications = { notifyOnComments: educator.notifyOnComments }
    }
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
              educatorNotifications={educatorNotifications}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
