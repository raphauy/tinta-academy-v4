'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
import { checkEmailAction, sendOtpAction, verifyOtpAction, updateUserNameAction } from './actions'

type Step = 'email' | 'otp' | 'name'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update: updateSession } = useSession()
  const prefilledEmail = searchParams.get('email') || ''
  const callbackUrl = searchParams.get('callbackUrl')

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(prefilledEmail)
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState<string | null>(null)
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

      // If user doesn't have a name, go to name step
      if (!result.hasName) {
        setPendingRedirectUrl(callbackUrl || result.redirectUrl || '/')
        setStep('name')
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

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateUserNameAction(email, name)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      // Update session with the new name
      await updateSession({ name: result.name })

      toast.success('Acceso exitoso')
      const redirectTo = pendingRedirectUrl || result.redirectUrl || '/'
      router.push(redirectTo)
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
          {step === 'email' && 'Iniciar sesión'}
          {step === 'otp' && 'Verificar código'}
          {step === 'name' && 'Tu nombre'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 'email' && 'Ingresa tu email para recibir un código de acceso'}
          {step === 'otp' && `Ingresa el código de 6 dígitos enviado a ${email}`}
          {step === 'name' && 'Ingresa tu nombre para continuar'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' && (
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
        )}
        {step === 'otp' && (
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
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="name"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Guardando...' : 'Continuar'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
