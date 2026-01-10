import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
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

// ============================================
// ADMIN FUNCTIONS
// ============================================

export interface UserWithDetails {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  hasStudentProfile: boolean
  hasEducatorProfile: boolean
}

export interface UserStats {
  total: number
  admins: number
  educators: number
  students: number
  regularUsers: number
  newThisMonth: number
  activeThisMonth: number
}

/**
 * Get all users with details for admin panel
 */
export async function getAllUsersWithDetails(): Promise<UserWithDetails[]> {
  const users = await prisma.user.findMany({
    include: {
      student: { select: { id: true } },
      educator: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hasStudentProfile: !!user.student,
    hasEducatorProfile: !!user.educator,
  }))
}

/**
 * Get aggregated user statistics for dashboard
 */
export async function getUserStats(): Promise<UserStats> {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    total,
    admins,
    educators,
    students,
    newThisMonth,
    activeThisMonth,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: Role.superadmin, isActive: true } }),
    prisma.user.count({ where: { role: Role.educator, isActive: true } }),
    prisma.user.count({ where: { role: Role.student, isActive: true } }),
    prisma.user.count({
      where: {
        createdAt: { gte: thisMonthStart },
        isActive: true,
      },
    }),
    // Active this month = users with orders or enrollments this month
    prisma.user.count({
      where: {
        isActive: true,
        OR: [
          {
            orders: {
              some: {
                createdAt: { gte: thisMonthStart },
              },
            },
          },
          {
            student: {
              enrollments: {
                some: {
                  enrolledAt: { gte: thisMonthStart },
                },
              },
            },
          },
        ],
      },
    }),
  ])

  const regularUsers = total - admins - educators - students

  return {
    total,
    admins,
    educators,
    students,
    regularUsers,
    newThisMonth,
    activeThisMonth,
  }
}

/**
 * Update user role
 * Handles constraints: cannot demote last superadmin
 */
export async function updateUserRole(
  userId: string,
  newRole: Role | null,
  currentUserId: string
): Promise<UserWithStringRole> {
  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // If demoting a superadmin, check if they're the last one
  if (user.role === Role.superadmin && newRole !== Role.superadmin) {
    const superadminCount = await prisma.user.count({
      where: { role: Role.superadmin },
    })

    if (superadminCount <= 1) {
      throw new Error('No se puede quitar el rol de superadmin al único administrador')
    }
  }

  // Cannot change own role
  if (userId === currentUserId) {
    throw new Error('No puedes cambiar tu propio rol')
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  return {
    ...updatedUser,
    role: normalizeRole(updatedUser.role),
  }
}

/**
 * Delete user and all related data
 * Handles constraints: cannot delete self, cannot delete last superadmin
 */
export async function deleteUser(userId: string, currentUserId: string): Promise<void> {
  // Cannot delete self
  if (userId === currentUserId) {
    throw new Error('No puedes eliminar tu propia cuenta')
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // If deleting a superadmin, check if they're the last one
  if (user.role === Role.superadmin) {
    const superadminCount = await prisma.user.count({
      where: { role: Role.superadmin },
    })

    if (superadminCount <= 1) {
      throw new Error('No se puede eliminar al único superadmin')
    }
  }

  // Delete user - cascades will handle related data
  try {
    await prisma.user.delete({
      where: { id: userId },
    })
  } catch (error) {
    // Handle foreign key constraint error (P2003)
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2003'
    ) {
      throw new Error(
        'No se puede eliminar este usuario porque tiene ordenes asociadas. Usa la opcion de Desactivar para bloquear el acceso sin perder el historial.'
      )
    }
    throw error
  }
}

export interface UserActivity {
  type: 'login' | 'enrollment' | 'order' | 'profile_update'
  description: string
  timestamp: Date
}

/**
 * Get user activity history
 */
export async function getUserActivity(userId: string): Promise<UserActivity[]> {
  const activities: UserActivity[] = []

  // Get user's orders
  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      paidAt: true,
      course: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  for (const order of orders) {
    activities.push({
      type: 'order',
      description: `Orden creada para ${order.course.title} (${order.status})`,
      timestamp: order.createdAt,
    })

    if (order.paidAt) {
      activities.push({
        type: 'order',
        description: `Pago confirmado para ${order.course.title}`,
        timestamp: order.paidAt,
      })
    }
  }

  // Get user's enrollments (through student profile)
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      enrollments: {
        select: {
          enrolledAt: true,
          course: { select: { title: true } },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 20,
      },
    },
  })

  if (student) {
    for (const enrollment of student.enrollments) {
      activities.push({
        type: 'enrollment',
        description: `Inscripción confirmada en ${enrollment.course.title}`,
        timestamp: enrollment.enrolledAt,
      })
    }
  }

  // Sort all activities by timestamp (most recent first)
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get users without student or educator profile (visitors)
 */
export async function getVisitors(): Promise<UserWithDetails[]> {
  const users = await prisma.user.findMany({
    where: {
      student: null,
      educator: null,
      role: null,
    },
    include: {
      student: { select: { id: true } },
      educator: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hasStudentProfile: false,
    hasEducatorProfile: false,
  }))
}

/**
 * Get users eligible to become educators (users without educator profile)
 */
export async function getEligibleEducatorUsers(): Promise<UserWithDetails[]> {
  const users = await prisma.user.findMany({
    where: {
      educator: null,
    },
    include: {
      student: { select: { id: true } },
      educator: { select: { id: true } },
    },
    orderBy: { name: 'asc' },
  })

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hasStudentProfile: !!user.student,
    hasEducatorProfile: false,
  }))
}
