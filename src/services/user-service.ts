import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export type UserWithStringRole = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

function normalizeRole(role: string | null): string {
  return role ?? ''
}

export async function getUserByEmail(email: string): Promise<UserWithStringRole | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return null

  return {
    ...user,
    role: normalizeRole(user.role),
  }
}

export async function getUserById(id: string): Promise<UserWithStringRole | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) return null

  return {
    ...user,
    role: normalizeRole(user.role),
  }
}

export async function getUserForAuth(email: string): Promise<UserWithStringRole | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) return null

  return {
    ...user,
    role: normalizeRole(user.role),
  }
}

export async function createUser(data: CreateUserInput): Promise<UserWithStringRole> {
  const validated = createUserSchema.parse(data)

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      name: validated.name ?? null,
    },
  })

  return {
    ...user,
    role: normalizeRole(user.role),
  }
}

export async function getOrCreateUser(email: string): Promise<UserWithStringRole> {
  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    return existingUser
  }

  return createUser({ email })
}

export interface UpdateUserData {
  email?: string
  name?: string
  image?: string | null
}

export async function updateUser(id: string, data: UpdateUserData) {
  const updateData: Record<string, unknown> = {}

  if (data.email !== undefined) updateData.email = data.email
  if (data.name !== undefined) updateData.name = data.name
  if (data.image !== undefined) updateData.image = data.image

  return prisma.user.update({
    where: { id },
    data: updateData,
  })
}

export async function toggleUserStatus(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { isActive: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  })
}
