'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Currency } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { BankAccount } from '@prisma/client'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Nombre del banco requerido'),
  accountHolder: z.string().min(1, 'Titular de la cuenta requerido'),
  accountType: z.string().min(1, 'Tipo de cuenta requerido'),
  accountNumber: z.string().min(1, 'Número de cuenta requerido'),
  currency: z.enum(['USD', 'UYU']),
  swiftCode: z.string().optional().or(z.literal('')),
  routingNumber: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  displayOrder: z.number().optional(),
})

const updateBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Nombre del banco requerido').optional(),
  accountHolder: z.string().min(1, 'Titular de la cuenta requerido').optional(),
  accountType: z.string().min(1, 'Tipo de cuenta requerido').optional(),
  accountNumber: z.string().min(1, 'Número de cuenta requerido').optional(),
  currency: z.enum(['USD', 'UYU']).optional(),
  swiftCode: z.string().optional().or(z.literal('')).nullable(),
  routingNumber: z.string().optional().or(z.literal('')).nullable(),
  notes: z.string().optional().or(z.literal('')).nullable(),
  displayOrder: z.number().optional(),
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
 * Get all bank accounts
 */
export async function getBankAccountsForAdminAction(): Promise<ActionResult<BankAccount[]>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return { success: true, data: bankAccounts }
  } catch (error) {
    console.error('Error fetching bank accounts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las cuentas bancarias',
    }
  }
}

/**
 * Create a new bank account
 */
export async function createBankAccountAction(
  data: z.input<typeof createBankAccountSchema>
): Promise<ActionResult<BankAccount>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const validatedData = createBankAccountSchema.parse(data)

    // Get the highest display order
    const maxOrder = await prisma.bankAccount.aggregate({
      _max: { displayOrder: true },
    })

    const bankAccount = await prisma.bankAccount.create({
      data: {
        bankName: validatedData.bankName,
        accountHolder: validatedData.accountHolder,
        accountType: validatedData.accountType,
        accountNumber: validatedData.accountNumber,
        currency: validatedData.currency as Currency,
        swiftCode: validatedData.swiftCode || null,
        routingNumber: validatedData.routingNumber || null,
        notes: validatedData.notes || null,
        displayOrder: validatedData.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
      },
    })

    revalidatePath('/admin/bank-data')
    revalidatePath('/admin')

    return { success: true, data: bankAccount }
  } catch (error) {
    console.error('Error creating bank account:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la cuenta bancaria',
    }
  }
}

/**
 * Update a bank account
 */
export async function updateBankAccountAction(
  accountId: string,
  data: z.input<typeof updateBankAccountSchema>
): Promise<ActionResult<BankAccount>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!accountId) {
    return { success: false, error: 'ID de cuenta requerido' }
  }

  try {
    const validatedData = updateBankAccountSchema.parse(data)

    const bankAccount = await prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        ...(validatedData.bankName !== undefined && { bankName: validatedData.bankName }),
        ...(validatedData.accountHolder !== undefined && {
          accountHolder: validatedData.accountHolder,
        }),
        ...(validatedData.accountType !== undefined && { accountType: validatedData.accountType }),
        ...(validatedData.accountNumber !== undefined && {
          accountNumber: validatedData.accountNumber,
        }),
        ...(validatedData.currency !== undefined && {
          currency: validatedData.currency as Currency,
        }),
        ...(validatedData.swiftCode !== undefined && {
          swiftCode: validatedData.swiftCode || null,
        }),
        ...(validatedData.routingNumber !== undefined && {
          routingNumber: validatedData.routingNumber || null,
        }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes || null }),
        ...(validatedData.displayOrder !== undefined && { displayOrder: validatedData.displayOrder }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    revalidatePath('/admin/bank-data')
    revalidatePath('/admin')

    return { success: true, data: bankAccount }
  } catch (error) {
    console.error('Error updating bank account:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la cuenta bancaria',
    }
  }
}

/**
 * Delete a bank account
 */
export async function deleteBankAccountAction(accountId: string): Promise<ActionResult<void>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!accountId) {
    return { success: false, error: 'ID de cuenta requerido' }
  }

  try {
    // Check if any orders reference this bank account
    const ordersCount = await prisma.order.count({
      where: { bankAccountId: accountId },
    })

    if (ordersCount > 0) {
      // Soft delete: just deactivate
      await prisma.bankAccount.update({
        where: { id: accountId },
        data: { isActive: false },
      })
    } else {
      // Hard delete: no orders reference it
      await prisma.bankAccount.delete({
        where: { id: accountId },
      })
    }

    revalidatePath('/admin/bank-data')
    revalidatePath('/admin')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting bank account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la cuenta bancaria',
    }
  }
}

/**
 * Toggle bank account active status
 */
export async function toggleBankAccountStatusAction(
  accountId: string
): Promise<ActionResult<BankAccount>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!accountId) {
    return { success: false, error: 'ID de cuenta requerido' }
  }

  try {
    const account = await prisma.bankAccount.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      return { success: false, error: 'Cuenta bancaria no encontrada' }
    }

    const updatedAccount = await prisma.bankAccount.update({
      where: { id: accountId },
      data: { isActive: !account.isActive },
    })

    revalidatePath('/admin/bank-data')
    revalidatePath('/admin')

    return { success: true, data: updatedAccount }
  } catch (error) {
    console.error('Error toggling bank account status:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al cambiar el estado de la cuenta bancaria',
    }
  }
}
