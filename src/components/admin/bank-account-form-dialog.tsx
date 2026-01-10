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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Building2 } from 'lucide-react'
import type { BankAccount, Currency } from '@prisma/client'

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

interface BankAccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: BankAccount | null
  onSubmit: (data: BankAccountFormData) => Promise<void>
}

export function BankAccountFormDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
}: BankAccountFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BankAccountFormData>({
    bankName: '',
    accountHolder: '',
    accountType: 'Caja de ahorro',
    accountNumber: '',
    currency: 'USD',
    displayOrder: 0,
    isActive: true,
  })

  const isEditing = !!account

  useEffect(() => {
    if (account) {
      setFormData({
        bankName: account.bankName,
        accountHolder: account.accountHolder,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        currency: account.currency,
        swiftCode: account.swiftCode || undefined,
        routingNumber: account.routingNumber || undefined,
        displayOrder: account.displayOrder,
        notes: account.notes || undefined,
        isActive: account.isActive,
      })
    } else {
      setFormData({
        bankName: '',
        accountHolder: '',
        accountType: 'Caja de ahorro',
        accountNumber: '',
        currency: 'USD',
        displayOrder: 0,
        isActive: true,
      })
    }
  }, [account, open])

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
              <Building2 className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos de la cuenta bancaria'
                  : 'Agrega una nueva cuenta para recibir pagos'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nombre del banco *</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                placeholder="BROU, Santander, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value as Currency })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dolares</SelectItem>
                  <SelectItem value="UYU">UYU - Pesos Uruguayos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Titular de la cuenta *</Label>
            <Input
              id="accountHolder"
              value={formData.accountHolder}
              onChange={(e) =>
                setFormData({ ...formData, accountHolder: e.target.value })
              }
              placeholder="Nombre completo del titular"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de cuenta *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountType: value })
                }
              >
                <SelectTrigger id="accountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Caja de ahorro">Caja de ahorro</SelectItem>
                  <SelectItem value="Cuenta corriente">
                    Cuenta corriente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Numero de cuenta *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="123456789"
                required
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="swiftCode">Codigo SWIFT/BIC</Label>
              <Input
                id="swiftCode"
                value={formData.swiftCode || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    swiftCode: e.target.value || undefined,
                  })
                }
                placeholder="BABORUXXMVD"
                className="font-mono uppercase"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Para transferencias internacionales
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    routingNumber: e.target.value || undefined,
                  })
                }
                placeholder="123456789"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Orden de visualizacion</Label>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Las cuentas con menor numero se muestran primero
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value || undefined,
                })
              }
              placeholder="Notas internas sobre esta cuenta..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <div>
              <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
                Cuenta activa
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Las cuentas inactivas no se muestran a los usuarios
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
              {isEditing ? 'Guardar cambios' : 'Crear cuenta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
