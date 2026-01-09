import { prisma } from '@/lib/prisma'
import { Coupon } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export type CouponError =
  | 'not_found'
  | 'expired'
  | 'exhausted'
  | 'invalid_email'
  | 'invalid_course'
  | 'min_amount'
  | 'inactive'
  | 'not_yet_valid'

export interface ValidateCouponResult {
  valid: boolean
  coupon?: Coupon
  error?: CouponError
  errorMessage?: string
  discountPercent?: number
  discountAmount?: number
  finalAmount?: number
}

export interface CreateCouponInput {
  code: string
  discountPercent: number
  maxUses?: number
  restrictedToEmail?: string
  restrictedToCourseId?: string
  minPurchaseAmount?: number
  validFrom?: Date
  expiresAt?: Date
  description?: string
  createdBy?: string
}

export interface UpdateCouponInput {
  code?: string
  discountPercent?: number
  maxUses?: number
  restrictedToEmail?: string | null
  restrictedToCourseId?: string | null
  minPurchaseAmount?: number | null
  validFrom?: Date
  expiresAt?: Date | null
  isActive?: boolean
  description?: string | null
}

// ============================================
// ERROR MESSAGES
// ============================================

const errorMessages: Record<CouponError, string> = {
  not_found: 'Cupón no encontrado',
  expired: 'Este cupón ha expirado',
  exhausted: 'Este cupón ya fue usado el máximo de veces permitido',
  invalid_email: 'Este cupón no es válido para tu cuenta',
  invalid_course: 'Este cupón no es válido para este curso',
  min_amount: 'El monto de compra no alcanza el mínimo requerido para este cupón',
  inactive: 'Este cupón no está activo',
  not_yet_valid: 'Este cupón aún no es válido',
}

// ============================================
// QUERIES
// ============================================

export async function getCouponByCode(code: string) {
  return prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })
}

export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
  })
}

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get active coupons (isActive=true, not expired, uses < maxUses)
 */
export async function getActiveCoupons() {
  const now = new Date()
  return prisma.coupon.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get coupons with filters for admin list
 */
export async function getCoupons(filters?: {
  isActive?: boolean
  includeExpired?: boolean
  courseId?: string
  search?: string
}) {
  const now = new Date()

  const where = {
    ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters?.courseId && { restrictedToCourseId: filters.courseId }),
    ...(filters?.search && {
      OR: [
        { code: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(!filters?.includeExpired && {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    }),
  }

  return prisma.coupon.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a coupon for a specific user, course, and amount
 * Returns validation result with calculated discount amounts
 */
export async function validateCoupon(
  code: string,
  userEmail: string,
  courseId: string,
  originalAmount: number
): Promise<ValidateCouponResult> {
  // Normalize code to uppercase
  const normalizedCode = code.toUpperCase().trim()

  // Find coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  })

  if (!coupon) {
    return {
      valid: false,
      error: 'not_found',
      errorMessage: errorMessages.not_found,
    }
  }

  // Check if active
  if (!coupon.isActive) {
    return {
      valid: false,
      coupon,
      error: 'inactive',
      errorMessage: errorMessages.inactive,
    }
  }

  const now = new Date()

  // Check if not yet valid (validFrom)
  if (coupon.validFrom > now) {
    return {
      valid: false,
      coupon,
      error: 'not_yet_valid',
      errorMessage: errorMessages.not_yet_valid,
    }
  }

  // Check expiration
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return {
      valid: false,
      coupon,
      error: 'expired',
      errorMessage: errorMessages.expired,
    }
  }

  // Check usage limit
  if (coupon.currentUses >= coupon.maxUses) {
    return {
      valid: false,
      coupon,
      error: 'exhausted',
      errorMessage: errorMessages.exhausted,
    }
  }

  // Check email restriction
  if (coupon.restrictedToEmail && coupon.restrictedToEmail.toLowerCase() !== userEmail.toLowerCase()) {
    return {
      valid: false,
      coupon,
      error: 'invalid_email',
      errorMessage: errorMessages.invalid_email,
    }
  }

  // Check course restriction
  if (coupon.restrictedToCourseId && coupon.restrictedToCourseId !== courseId) {
    return {
      valid: false,
      coupon,
      error: 'invalid_course',
      errorMessage: errorMessages.invalid_course,
    }
  }

  // Check minimum purchase amount
  if (coupon.minPurchaseAmount && originalAmount < coupon.minPurchaseAmount) {
    return {
      valid: false,
      coupon,
      error: 'min_amount',
      errorMessage: `${errorMessages.min_amount} (mínimo: $${coupon.minPurchaseAmount} USD)`,
    }
  }

  // Calculate discount
  const discountPercent = coupon.discountPercent
  const discountAmount = Math.round((originalAmount * discountPercent) / 100 * 100) / 100
  const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100)

  return {
    valid: true,
    coupon,
    discountPercent,
    discountAmount,
    finalAmount,
  }
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Increment coupon usage count by 1
 */
export async function incrementCouponUsage(couponId: string) {
  return prisma.coupon.update({
    where: { id: couponId },
    data: {
      currentUses: { increment: 1 },
    },
  })
}

/**
 * Create a new coupon (admin)
 */
export async function createCoupon(input: CreateCouponInput) {
  return prisma.coupon.create({
    data: {
      code: input.code.toUpperCase().trim(),
      discountPercent: input.discountPercent,
      maxUses: input.maxUses || 1,
      restrictedToEmail: input.restrictedToEmail?.toLowerCase(),
      restrictedToCourseId: input.restrictedToCourseId,
      minPurchaseAmount: input.minPurchaseAmount,
      validFrom: input.validFrom || new Date(),
      expiresAt: input.expiresAt,
      description: input.description,
      createdBy: input.createdBy,
    },
  })
}

/**
 * Update an existing coupon (admin)
 */
export async function updateCoupon(id: string, input: UpdateCouponInput) {
  return prisma.coupon.update({
    where: { id },
    data: {
      ...(input.code && { code: input.code.toUpperCase().trim() }),
      ...(input.discountPercent !== undefined && { discountPercent: input.discountPercent }),
      ...(input.maxUses !== undefined && { maxUses: input.maxUses }),
      ...(input.restrictedToEmail !== undefined && {
        restrictedToEmail: input.restrictedToEmail?.toLowerCase() || null,
      }),
      ...(input.restrictedToCourseId !== undefined && {
        restrictedToCourseId: input.restrictedToCourseId || null,
      }),
      ...(input.minPurchaseAmount !== undefined && {
        minPurchaseAmount: input.minPurchaseAmount || null,
      }),
      ...(input.validFrom && { validFrom: input.validFrom }),
      ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt || null }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.description !== undefined && { description: input.description || null }),
    },
  })
}

/**
 * Deactivate a coupon (soft delete)
 */
export async function deactivateCoupon(id: string) {
  return prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Reactivate a coupon
 */
export async function reactivateCoupon(id: string) {
  return prisma.coupon.update({
    where: { id },
    data: { isActive: true },
  })
}

/**
 * Delete a coupon permanently (only if not used)
 */
export async function deleteCoupon(id: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  })

  if (!coupon) {
    throw new Error('Cupón no encontrado')
  }

  if (coupon._count.orders > 0) {
    throw new Error('No se puede eliminar un cupón que ha sido usado en órdenes')
  }

  return prisma.coupon.delete({
    where: { id },
  })
}
