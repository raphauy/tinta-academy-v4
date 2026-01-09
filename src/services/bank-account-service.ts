import { prisma } from '@/lib/prisma'
import { Currency, BankAccount } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CreateBankAccountInput {
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: Currency
  swiftCode?: string
  routingNumber?: string
  displayOrder?: number
  notes?: string
  isActive?: boolean
}

export interface UpdateBankAccountInput {
  bankName?: string
  accountHolder?: string
  accountType?: string
  accountNumber?: string
  currency?: Currency
  swiftCode?: string | null
  routingNumber?: string | null
  displayOrder?: number
  notes?: string | null
  isActive?: boolean
}

// ============================================
// QUERIES
// ============================================

/**
 * Get bank account by ID
 */
export async function getBankAccountById(id: string): Promise<BankAccount | null> {
  return prisma.bankAccount.findUnique({
    where: { id },
  })
}

/**
 * Get all bank accounts (for admin)
 */
export async function getAllBankAccounts(): Promise<BankAccount[]> {
  return prisma.bankAccount.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

/**
 * Get active bank accounts (for checkout display)
 * Ordered by displayOrder for proper presentation
 */
export async function getActiveBankAccounts(): Promise<BankAccount[]> {
  return prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

/**
 * Get bank accounts by currency
 */
export async function getBankAccountsByCurrency(
  currency: Currency
): Promise<BankAccount[]> {
  return prisma.bankAccount.findMany({
    where: {
      currency,
      isActive: true,
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new bank account (admin only)
 */
export async function createBankAccount(
  input: CreateBankAccountInput
): Promise<BankAccount> {
  return prisma.bankAccount.create({
    data: {
      bankName: input.bankName,
      accountHolder: input.accountHolder,
      accountType: input.accountType,
      accountNumber: input.accountNumber,
      currency: input.currency,
      swiftCode: input.swiftCode,
      routingNumber: input.routingNumber,
      displayOrder: input.displayOrder ?? 0,
      notes: input.notes,
      isActive: input.isActive ?? true,
    },
  })
}

/**
 * Update bank account (admin only)
 */
export async function updateBankAccount(
  id: string,
  input: UpdateBankAccountInput
): Promise<BankAccount> {
  return prisma.bankAccount.update({
    where: { id },
    data: {
      ...(input.bankName !== undefined && { bankName: input.bankName }),
      ...(input.accountHolder !== undefined && { accountHolder: input.accountHolder }),
      ...(input.accountType !== undefined && { accountType: input.accountType }),
      ...(input.accountNumber !== undefined && { accountNumber: input.accountNumber }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.swiftCode !== undefined && { swiftCode: input.swiftCode }),
      ...(input.routingNumber !== undefined && { routingNumber: input.routingNumber }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  })
}

/**
 * Toggle bank account active status
 */
export async function toggleBankAccountStatus(id: string): Promise<BankAccount> {
  const account = await prisma.bankAccount.findUnique({
    where: { id },
  })

  if (!account) {
    throw new Error('Cuenta bancaria no encontrada')
  }

  return prisma.bankAccount.update({
    where: { id },
    data: { isActive: !account.isActive },
  })
}

/**
 * Delete bank account
 * - Hard delete if no orders linked
 * - Throws error if orders exist (use soft delete via toggleBankAccountStatus instead)
 */
export async function deleteBankAccount(id: string): Promise<void> {
  const account = await prisma.bankAccount.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  })

  if (!account) {
    throw new Error('Cuenta bancaria no encontrada')
  }

  if (account._count.orders > 0) {
    throw new Error(
      `No se puede eliminar esta cuenta porque tiene ${account._count.orders} orden(es) asociada(s). Desactívela en su lugar.`
    )
  }

  await prisma.bankAccount.delete({
    where: { id },
  })
}

/**
 * Reorder bank accounts
 * Takes an array of IDs in the desired order and updates displayOrder accordingly
 */
export async function reorderBankAccounts(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.bankAccount.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  )
}
