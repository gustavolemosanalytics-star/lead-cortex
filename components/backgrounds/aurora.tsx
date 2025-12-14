'use client'

import { motion } from 'framer-motion'

interface AuroraProps {
  className?: string
}

export function Aurora({ className = '' }: AuroraProps) {
  const blobs = [
    { color: '#7c3aed', delay: 0, duration: 20, x: ['0%', '60%', '30%', '0%'], y: ['0%', '40%', '80%', '0%'] },
    { color: '#22d3ee', delay: 2, duration: 25, x: ['60%', '20%', '80%', '60%'], y: ['20%', '60%', '30%', '20%'] },
    { color: '#ec4899', delay: 4, duration: 22, x: ['30%', '70%', '10%', '30%'], y: ['70%', '20%', '50%', '70%'] },
    { color: '#3b82f6', delay: 6, duration: 28, x: ['80%', '40%', '60%', '80%'], y: ['50%', '80%', '10%', '50%'] },
  ]

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[var(--background)]" />
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-[120px] opacity-20"
          style={{
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            width: '60vw',
            height: '60vh',
          }}
          initial={{ x: blob.x[0], y: blob.y[0] }}
          animate={{
            x: blob.x,
            y: blob.y,
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: blob.delay,
          }}
        />
      ))}
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
