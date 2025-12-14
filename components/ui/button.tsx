'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg hover:shadow-[var(--glow-primary)] active:scale-[0.98]',
        destructive:
          'bg-[var(--error)] text-white hover:bg-[var(--error)]/90 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]',
        outline:
          'border border-[var(--glass-border)] bg-transparent hover:bg-[var(--glass-bg)] text-[var(--foreground)]',
        secondary:
          'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-elevated)]',
        ghost:
          'hover:bg-[var(--glass-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-[var(--primary)] to-[var(--accent-purple)] text-white hover:opacity-90 shadow-lg hover:shadow-[var(--glow-primary)] active:scale-[0.98]',
        glow:
          'bg-[var(--primary)] text-white animate-pulse-glow hover:animate-none active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
