'use client'

import { motion } from 'framer-motion'

interface FunnelStage {
  name: string
  value: number
  percentage: number
  color: string
}

interface FunnelChartProps {
  stages: FunnelStage[]
}

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxValue = Math.max(...stages.map((s) => s.value))

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const width = (stage.value / maxValue) * 100
        const conversionFromPrevious =
          index > 0
            ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
            : null

        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--foreground)]">
                  {stage.name}
                </span>
                {conversionFromPrevious && (
                  <span className="text-xs text-[var(--foreground-muted)] bg-[var(--glass-bg)] px-2 py-0.5 rounded-full">
                    {conversionFromPrevious}% da etapa anterior
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {stage.value.toLocaleString('pt-BR')}
                </span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  ({stage.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="relative h-12 w-full overflow-hidden rounded-lg bg-[var(--glass-bg)]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{
                  background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}80 100%)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['0%', '500%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'linear',
                  delay: index * 0.2,
                }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
