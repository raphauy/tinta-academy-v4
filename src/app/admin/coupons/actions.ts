'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Coupon } from '@prisma/client'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface CouponWithStats extends Coupon {
  restrictedCourse: { id: string; title: string } | null
  usageCount: number
}

export interface CouponStats {
  couponId: string
  code: string
  totalUses: number
  totalDiscount: number
  orders: Array<{
    id: string
    createdAt: Date
    userName: string
    courseName: string
    discountAmount: number
  }>
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCouponSchema = z.object({
  code: z.string().min(1, 'Código requerido').transform((v) => v.toUpperCase()),
  discountPercent: z.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
  maxUses: z.number().min(1, 'Mínimo 1 uso'),
  restrictedToEmail: z.string().email().optional().or(z.literal('')),
  restrictedToCourseId: z.string().optional().or(z.literal('')),
  expiresAt: z.date().optional().nullable(),
  minPurchaseAmount: z.number().optional().nullable(),
  description: z.string().optional(),
})

const updateCouponSchema = z.object({
  code: z.string().min(1, 'Código requerido').transform((v) => v.toUpperCase()).optional(),
  discountPercent: z.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%').optional(),
  maxUses: z.number().min(1, 'Mínimo 1 uso').optional(),
  restrictedToEmail: z.string().email().optional().or(z.literal('')).nullable(),
  restrictedToCourseId: z.string().optional().or(z.literal('')).nullable(),
  expiresAt: z.date().optional().nullable(),
  minPurchaseAmount: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

async function requireSuperAdmin(): Promise<
  { error: string } | { userId: string }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'superadmin') {
    return { error: 'Acceso denegado. Solo superadministradores.' }
  }

  return { userId: session.user.id }
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all coupons with usage stats
 */
export async function getCouponsForAdminAction(): Promise<ActionResult<CouponWithStats[]>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        restrictedCourse: {
          select: { id: true, title: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const couponsWithStats: CouponWithStats[] = coupons.map((coupon) => ({
      ...coupon,
      restrictedCourse: coupon.restrictedCourse,
      usageCount: coupon._count.orders,
    }))

    return { success: true, data: couponsWithStats }
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los cupones',
    }
  }
}

/**
 * Get detailed usage statistics for a coupon
 */
export async function getCouponStatsAction(couponId: string): Promise<ActionResult<CouponStats>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!couponId) {
    return { success: false, error: 'ID de cupón requerido' }
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        orders: {
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!coupon) {
      return { success: false, error: 'Cupón no encontrado' }
    }

    const stats: CouponStats = {
      couponId: coupon.id,
      code: coupon.code,
      totalUses: coupon.orders.length,
      totalDiscount: coupon.orders.reduce((sum, order) => sum + order.discountAmount, 0),
      orders: coupon.orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        userName: order.user.name || order.user.email,
        courseName: order.course.title,
        discountAmount: order.discountAmount,
      })),
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching coupon stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las estadísticas del cupón',
    }
  }
}

/**
 * Create a new coupon
 */
export async function createCouponAction(
  data: z.input<typeof createCouponSchema>
): Promise<ActionResult<Coupon>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const validatedData = createCouponSchema.parse(data)

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCoupon) {
      return { success: false, error: 'Ya existe un cupón con ese código' }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: validatedData.code,
        discountPercent: validatedData.discountPercent,
        maxUses: validatedData.maxUses,
        restrictedToEmail: validatedData.restrictedToEmail || null,
        restrictedToCourseId: validatedData.restrictedToCourseId || null,
        expiresAt: validatedData.expiresAt,
        minPurchaseAmount: validatedData.minPurchaseAmount,
        description: validatedData.description,
        createdBy: authResult.userId,
      },
    })

    revalidatePath('/admin/coupons')
    revalidatePath('/admin')

    return { success: true, data: coupon }
  } catch (error) {
    console.error('Error creating coupon:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el cupón',
    }
  }
}

/**
 * Update a coupon
 */
export async function updateCouponAction(
  couponId: string,
  data: z.input<typeof updateCouponSchema>
): Promise<ActionResult<Coupon>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!couponId) {
    return { success: false, error: 'ID de cupón requerido' }
  }

  try {
    const validatedData = updateCouponSchema.parse(data)

    // Check if code already exists (if changing code)
    if (validatedData.code) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: validatedData.code },
      })

      if (existingCoupon && existingCoupon.id !== couponId) {
        return { success: false, error: 'Ya existe un cupón con ese código' }
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...(validatedData.code !== undefined && { code: validatedData.code }),
        ...(validatedData.discountPercent !== undefined && {
          discountPercent: validatedData.discountPercent,
        }),
        ...(validatedData.maxUses !== undefined && { maxUses: validatedData.maxUses }),
        ...(validatedData.restrictedToEmail !== undefined && {
          restrictedToEmail: validatedData.restrictedToEmail || null,
        }),
        ...(validatedData.restrictedToCourseId !== undefined && {
          restrictedToCourseId: validatedData.restrictedToCourseId || null,
        }),
        ...(validatedData.expiresAt !== undefined && { expiresAt: validatedData.expiresAt }),
        ...(validatedData.minPurchaseAmount !== undefined && {
          minPurchaseAmount: validatedData.minPurchaseAmount,
        }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    revalidatePath('/admin/coupons')
    revalidatePath('/admin')

    return { success: true, data: coupon }
  } catch (error) {
    console.error('Error updating coupon:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el cupón',
    }
  }
}

/**
 * Delete a coupon
 */
export async function deleteCouponAction(couponId: string): Promise<ActionResult<void>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!couponId) {
    return { success: false, error: 'ID de cupón requerido' }
  }

  try {
    // Check if coupon has been used
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { _count: { select: { orders: true } } },
    })

    if (!coupon) {
      return { success: false, error: 'Cupón no encontrado' }
    }

    if (coupon._count.orders > 0) {
      // Soft delete: just deactivate
      await prisma.coupon.update({
        where: { id: couponId },
        data: { isActive: false },
      })
    } else {
      // Hard delete: no orders reference it
      await prisma.coupon.delete({
        where: { id: couponId },
      })
    }

    revalidatePath('/admin/coupons')
    revalidatePath('/admin')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el cupón',
    }
  }
}

/**
 * Toggle coupon active status
 */
export async function toggleCouponStatusAction(couponId: string): Promise<ActionResult<Coupon>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!couponId) {
    return { success: false, error: 'ID de cupón requerido' }
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    })

    if (!coupon) {
      return { success: false, error: 'Cupón no encontrado' }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive },
    })

    revalidatePath('/admin/coupons')
    revalidatePath('/admin')

    return { success: true, data: updatedCoupon }
  } catch (error) {
    console.error('Error toggling coupon status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar el estado del cupón',
    }
  }
}
