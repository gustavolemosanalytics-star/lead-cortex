'use client'

import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export function GradientText({
  children,
  className = '',
  animate = true,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-[var(--primary)] via-[var(--accent-cyan)] to-[var(--accent-pink)] bg-clip-text text-transparent',
        animate && 'bg-[length:200%_200%] animate-[gradient-shift_5s_ease_infinite]',
        className
      )}
    >
      {children}
    </span>
  )
}
