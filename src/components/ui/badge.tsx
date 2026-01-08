import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-secondary-foreground/10 bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-destructive/20 bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Course type variants
        "verde-uva":
          "border-verde-uva-600/20 bg-verde-uva-500 text-white",
        muted:
          "border-muted-foreground/20 bg-muted-foreground text-white",
        // Neutral variant for modality
        neutral:
          "border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
        // Status variants
        warning:
          "border-yellow-200 dark:border-yellow-700/30 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
        info:
          "border-blue-200 dark:border-blue-700/30 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        success:
          "border-emerald-200 dark:border-emerald-700/30 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        orange:
          "border-orange-200 dark:border-orange-700/30 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
        purple:
          "border-purple-200 dark:border-purple-700/30 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        stone:
          "border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
