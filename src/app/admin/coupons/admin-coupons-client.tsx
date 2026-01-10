'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Coupon } from '@prisma/client'
import { AdminCoupons } from '@/components/admin/admin-coupons'
import { CouponFormDialog } from '@/components/admin/coupon-form-dialog'
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog'
import {
  createCouponAction,
  updateCouponAction,
  toggleCouponStatusAction,
  deleteCouponAction,
} from './actions'

interface AdminCouponsClientProps {
  coupons: Coupon[]
}

interface CouponFormData {
  code: string
  discountPercent: number
  maxUses: number
  restrictedToEmail?: string
  restrictedToCourseId?: string
  minPurchaseAmount?: number
  validFrom?: string
  expiresAt?: string
  description?: string
  isActive: boolean
}

export function AdminCouponsClient({ coupons }: AdminCouponsClientProps) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleCreateNew = () => {
    setSelectedCoupon(null)
    setIsFormOpen(true)
  }

  const handleEdit = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId)
    if (coupon) {
      setSelectedCoupon(coupon)
      setIsFormOpen(true)
    }
  }

  const handleToggleActive = async (couponId: string) => {
    const result = await toggleCouponStatusAction(couponId)
    if (result.success) {
      const coupon = result.data
      toast.success(
        coupon.isActive
          ? 'Cupon activado correctamente'
          : 'Cupon desactivado correctamente'
      )
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId)
    if (coupon) {
      setCouponToDelete(coupon)
      setIsDeleteOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return

    const result = await deleteCouponAction(couponToDelete.id)
    if (result.success) {
      toast.success('Cupon eliminado correctamente')
      setCouponToDelete(null)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleSubmit = async (data: CouponFormData) => {
    const formattedData = {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      // Send empty string to clear the field, undefined to keep it unchanged
      restrictedToEmail: data.restrictedToEmail ?? '',
      restrictedToCourseId: data.restrictedToCourseId ?? '',
      minPurchaseAmount: data.minPurchaseAmount || undefined,
    }

    if (selectedCoupon) {
      const result = await updateCouponAction(selectedCoupon.id, formattedData)
      if (result.success) {
        toast.success('Cupon actualizado correctamente')
        router.refresh()
      } else {
        toast.error(result.error)
        throw new Error(result.error)
      }
    } else {
      const result = await createCouponAction(formattedData)
      if (result.success) {
        toast.success('Cupon creado correctamente')
        router.refresh()
      } else {
        toast.error(result.error)
        throw new Error(result.error)
      }
    }
  }

  return (
    <>
      <AdminCoupons
        coupons={coupons}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      <CouponFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        coupon={selectedCoupon}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Eliminar cupon"
        description={
          couponToDelete
            ? `¿Estas seguro de eliminar el cupon "${couponToDelete.code}"? Esta accion no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        type="delete"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
