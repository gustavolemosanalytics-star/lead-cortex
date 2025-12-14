'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlitchTextProps {
  text: string
  className?: string
  glitchColors?: [string, string]
}

export function GlitchText({
  text,
  className = '',
  glitchColors = ['#22d3ee', '#ec4899'],
}: GlitchTextProps) {
  return (
    <span className={cn('relative inline-block', className)}>
      <span className="relative z-10">{text}</span>

      {/* Cyan glitch layer */}
      <motion.span
        className="absolute left-0 top-0 -z-10"
        style={{ color: glitchColors[0] }}
        aria-hidden
        animate={{
          x: [-2, 2, -1, 2, 0],
          opacity: [0.7, 0.3, 0.7, 0.3, 0],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatDelay: 4,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.span>

      {/* Pink glitch layer */}
      <motion.span
        className="absolute left-0 top-0 -z-10"
        style={{ color: glitchColors[1] }}
        aria-hidden
        animate={{
          x: [2, -2, 1, -2, 0],
          opacity: [0.7, 0.3, 0.7, 0.3, 0],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatDelay: 4,
          delay: 0.05,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.span>
    </span>
  )
}
