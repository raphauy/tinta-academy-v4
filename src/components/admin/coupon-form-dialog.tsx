'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Ticket } from 'lucide-react'
import type { Coupon } from '@prisma/client'

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

interface CouponFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: Coupon | null
  onSubmit: (data: CouponFormData) => Promise<void>
}

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSubmit,
}: CouponFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountPercent: 10,
    maxUses: 1,
    isActive: true,
  })

  const isEditing = !!coupon

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        maxUses: coupon.maxUses,
        restrictedToEmail: coupon.restrictedToEmail || undefined,
        restrictedToCourseId: coupon.restrictedToCourseId || undefined,
        minPurchaseAmount: coupon.minPurchaseAmount || undefined,
        validFrom: formatDateForInput(coupon.validFrom),
        expiresAt: formatDateForInput(coupon.expiresAt),
        description: coupon.description || undefined,
        isActive: coupon.isActive,
      })
    } else {
      setFormData({
        code: '',
        discountPercent: 10,
        maxUses: 1,
        isActive: true,
      })
    }
  }, [coupon, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Editar Cupon' : 'Nuevo Cupon'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del cupon de descuento'
                  : 'Crea un nuevo cupon de descuento'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Codigo *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="DESCUENTO20"
                required
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercent">Descuento (%) *</Label>
              <Input
                id="discountPercent"
                type="number"
                min={1}
                max={100}
                value={formData.discountPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercent: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Usos maximos *</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPurchaseAmount">Monto minimo (USD)</Label>
              <Input
                id="minPurchaseAmount"
                type="number"
                min={0}
                value={formData.minPurchaseAmount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPurchaseAmount: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Sin minimo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valido desde</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom || ''}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expira</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt || ''}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restrictedToEmail">Restringido a email</Label>
            <Input
              id="restrictedToEmail"
              type="email"
              value={formData.restrictedToEmail || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  restrictedToEmail: e.target.value || undefined,
                })
              }
              placeholder="usuario@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value || undefined,
                })
              }
              placeholder="Nota interna sobre el cupon..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <div>
              <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
                Cupon activo
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Los cupones inactivos no pueden ser usados
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#143F3B] hover:bg-[#0e2c29] text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear cupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
