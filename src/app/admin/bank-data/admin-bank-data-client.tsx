'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { BankAccount, Currency } from '@prisma/client'
import { AdminBankData } from '@/components/admin/admin-bank-data'
import { BankAccountFormDialog } from '@/components/admin/bank-account-form-dialog'
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog'
import {
  createBankAccountAction,
  updateBankAccountAction,
  toggleBankAccountStatusAction,
  deleteBankAccountAction,
} from './actions'

interface AdminBankDataClientProps {
  accounts: BankAccount[]
}

interface BankAccountFormData {
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: Currency
  swiftCode?: string
  routingNumber?: string
  displayOrder: number
  notes?: string
  isActive: boolean
}

export function AdminBankDataClient({ accounts }: AdminBankDataClientProps) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleCreateNew = () => {
    setSelectedAccount(null)
    setIsFormOpen(true)
  }

  const handleEdit = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (account) {
      setSelectedAccount(account)
      setIsFormOpen(true)
    }
  }

  const handleToggleActive = async (accountId: string) => {
    const result = await toggleBankAccountStatusAction(accountId)
    if (result.success) {
      const account = result.data
      toast.success(
        account.isActive
          ? 'Cuenta activada correctamente'
          : 'Cuenta desactivada correctamente'
      )
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (account) {
      setAccountToDelete(account)
      setIsDeleteOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return

    const result = await deleteBankAccountAction(accountToDelete.id)
    if (result.success) {
      toast.success('Cuenta eliminada correctamente')
      setAccountToDelete(null)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleSubmit = async (data: BankAccountFormData) => {
    const formattedData = {
      ...data,
      swiftCode: data.swiftCode || undefined,
      routingNumber: data.routingNumber || undefined,
      notes: data.notes || undefined,
    }

    if (selectedAccount) {
      const result = await updateBankAccountAction(selectedAccount.id, formattedData)
      if (result.success) {
        toast.success('Cuenta actualizada correctamente')
        router.refresh()
      } else {
        toast.error(result.error)
        throw new Error(result.error)
      }
    } else {
      const result = await createBankAccountAction(formattedData)
      if (result.success) {
        toast.success('Cuenta creada correctamente')
        router.refresh()
      } else {
        toast.error(result.error)
        throw new Error(result.error)
      }
    }
  }

  return (
    <>
      <AdminBankData
        accounts={accounts}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      <BankAccountFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        account={selectedAccount}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Eliminar cuenta bancaria"
        description={
          accountToDelete
            ? `¿Estas seguro de eliminar la cuenta "${accountToDelete.bankName} - ${accountToDelete.accountNumber}"? Si tiene ordenes asociadas, sera desactivada en lugar de eliminada.`
            : ''
        }
        confirmLabel="Eliminar"
        type="delete"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
