/**
 * Skeleton components for checkout pages
 * Used within Suspense boundaries for loading states
 */

import { Card } from '@/components/ui/card'

/**
 * CheckoutFormSkeleton - Loading skeleton for the main checkout form
 */
export function CheckoutFormSkeleton() {
  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 animate-pulse">
      {/* Left column - Payment options */}
      <div className="lg:col-span-3 space-y-6">
        {/* Coupon section */}
        <div className="h-12 bg-muted rounded-lg" />

        {/* Payment method selector */}
        <div className="space-y-3">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="grid gap-3">
            <PaymentMethodCardSkeleton />
            <PaymentMethodCardSkeleton />
          </div>
        </div>

        {/* Submit button */}
        <div className="h-12 bg-muted rounded-lg" />

        {/* Security notice */}
        <div className="h-16 bg-muted/50 rounded-lg" />
      </div>

      {/* Right column - Order summary */}
      <div className="lg:col-span-2">
        <CheckoutSummarySkeleton />
      </div>
    </div>
  )
}

/**
 * PaymentMethodCardSkeleton - Loading skeleton for payment method option
 */
function PaymentMethodCardSkeleton() {
  return (
    <div className="border border-border rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-5 h-5 bg-muted rounded-full flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-muted rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
          <div className="h-4 w-48 bg-muted rounded mb-2" />
          <div className="h-6 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * CheckoutSummarySkeleton - Loading skeleton for order summary card
 */
export function CheckoutSummarySkeleton() {
  return (
    <Card className="p-5 lg:sticky lg:top-8">
      <div className="space-y-4 animate-pulse">
        {/* Course image */}
        <div className="aspect-video w-full bg-muted rounded-lg" />

        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded-full" />
        </div>

        {/* Title */}
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-6 w-3/4 bg-muted rounded" />

        {/* Educator */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Course details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 w-40 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 w-36 bg-muted rounded" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-5 w-12 bg-muted rounded" />
            <div className="h-6 w-24 bg-verde-uva-100 rounded" />
          </div>
        </div>

        {/* Currency label */}
        <div className="h-3 w-32 bg-muted rounded mx-auto" />
      </div>
    </Card>
  )
}

/**
 * SuccessPageSkeleton - Loading skeleton for checkout success page
 */
export function SuccessPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* Success header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto" />
        <div className="h-8 w-64 bg-muted rounded mx-auto" />
        <div className="h-5 w-80 bg-muted rounded mx-auto" />
      </div>

      {/* WSET banner placeholder */}
      <div className="h-24 bg-amber-50 rounded-xl" />

      {/* Order details card */}
      <Card className="overflow-hidden">
        {/* Course image */}
        <div className="aspect-video w-full bg-muted" />

        <div className="p-6 space-y-4">
          {/* Title */}
          <div className="h-6 w-3/4 bg-muted rounded" />

          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>

          {/* Educator */}
          <div className="h-4 w-40 bg-muted rounded" />

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Course details */}
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 w-40 bg-muted rounded" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Payment info */}
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <div className="h-11 w-40 bg-verde-uva-100 rounded-lg" />
        <div className="h-11 w-44 bg-muted rounded-lg" />
      </div>

      {/* Help text */}
      <div className="h-4 w-72 bg-muted rounded mx-auto" />
    </div>
  )
}

/**
 * PendingPageSkeleton - Loading skeleton for checkout pending page
 */
export function PendingPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* Pending header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto" />
        <div className="h-8 w-56 bg-muted rounded mx-auto" />
        <div className="h-5 w-72 bg-muted rounded mx-auto" />
      </div>

      {/* Order summary card */}
      <Card className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-full bg-muted rounded" />
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-muted rounded-full" />
              <div className="h-4 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-7 w-28 bg-verde-uva-100 rounded" />
        </div>
      </Card>

      {/* Bank accounts */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded" />
        <BankAccountCardSkeleton />
        <BankAccountCardSkeleton />
      </div>

      {/* Instructions */}
      <Card className="p-6 space-y-3">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full bg-muted rounded" />
          ))}
        </div>
      </Card>

      {/* Important notice */}
      <div className="h-20 bg-amber-50 rounded-xl" />

      {/* Mark as sent form */}
      <Card className="p-6 space-y-4">
        <div className="h-5 w-56 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
        <div className="h-11 bg-muted rounded-lg" />
      </Card>
    </div>
  )
}

/**
 * BankAccountCardSkeleton - Loading skeleton for bank account card
 */
function BankAccountCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-5 w-12 bg-muted rounded-full" />
      </div>
      <div className="h-px bg-border" />
      <div className="grid gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/**
 * FreeCheckoutSkeleton - Loading skeleton for free checkout page
 */
export function FreeCheckoutSkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <Card className="overflow-hidden">
        {/* Course image */}
        <div className="aspect-video w-full bg-muted" />

        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>

          {/* Title */}
          <div className="h-6 w-full bg-muted rounded" />

          {/* Educator */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>

          {/* Course details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 w-40 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 w-36 bg-muted rounded" />
            </div>
          </div>

          {/* Free badge */}
          <div className="h-16 bg-green-50 rounded-lg" />

          {/* Button */}
          <div className="h-11 bg-verde-uva-100 rounded-lg" />
        </div>
      </Card>
    </div>
  )
}
