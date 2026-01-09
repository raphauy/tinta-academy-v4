import { Logo } from '@/components/shared/logo'
import Link from 'next/link'

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Minimal Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
