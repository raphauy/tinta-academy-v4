'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { checkEmailAction, sendOtpAction, verifyOtpAction } from './actions'

type Step = 'email' | 'otp'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledEmail = searchParams.get('email') || ''
  const callbackUrl = searchParams.get('callbackUrl')

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(prefilledEmail)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First check if email is valid
      const checkResult = await checkEmailAction(email)
      if (!checkResult.success) {
        toast.error(checkResult.error)
        return
      }

      // Send OTP
      const sendResult = await sendOtpAction(email)
      if (!sendResult.success) {
        toast.error(sendResult.error)
        return
      }

      toast.success(sendResult.message)
      setStep('otp')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await verifyOtpAction(email, otp)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success('Acceso exitoso')
      const redirectTo = callbackUrl || result.redirectUrl || '/'
      router.push(redirectTo)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtp('')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          {step === 'email' ? 'Iniciar sesión' : 'Verificar código'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 'email'
            ? 'Ingresa tu email para recibir un código de acceso'
            : `Ingresa el código de 6 dígitos enviado a ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Continuar'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="block text-center">Código de verificación</Label>
              <InputOTP
                containerClassName="justify-center"
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleBackToEmail}
              disabled={isLoading}
            >
              Volver al email
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
