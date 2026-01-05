import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getUserForAuth } from '@/services/user-service'
import { verifyOtpToken } from '@/services/auth-service'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
    verifyRequest: '/login?message=check-email',
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const otp = credentials?.otp as string | undefined

        if (!email || !otp) {
          return null
        }

        const user = await getUserForAuth(email)
        if (!user) {
          return null
        }

        // Block inactive users from logging in
        if (!user.isActive) {
          return null
        }

        const isValid = await verifyOtpToken({
          userId: user.id,
          token: otp,
        })

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      // Initial sign in - populate token with user data
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.role = user.role
      }

      // Session update (when update() is called from client)
      if (trigger === 'update' && session) {
        if (session.name !== undefined) token.name = session.name
        if (session.image !== undefined) token.image = session.image
      }

      return token
    },

    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string | null
        session.user.image = token.image as string | null
        session.user.role = token.role as string
      }
      return session
    },
  },
})
