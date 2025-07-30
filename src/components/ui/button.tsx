import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Modern base styles - smooth and beautiful
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 transform disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary - Black as main color
        default:
          "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:scale-[1.02] hover:bg-primary/90",
        // Destructive - Still available but styled better
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:scale-[1.02]",
        // Ghost - Subtle and smooth
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        // Keep outline for compatibility but modernize
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        // Keep secondary for compatibility
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Keep link for compatibility
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
