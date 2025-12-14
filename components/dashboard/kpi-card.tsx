'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { Counter } from '@/components/animations/counter'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number
  previousValue?: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  iconColor?: string
  decimals?: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
}

export function KPICard({
  title,
  value,
  previousValue,
  prefix = '',
  suffix = '',
  icon: Icon,
  iconColor = 'var(--primary)',
  decimals = 0,
  trend,
  trendValue,
}: KPICardProps) {
  const calculatedTrend =
    trend ||
    (previousValue
      ? value > previousValue
        ? 'up'
        : value < previousValue
        ? 'down'
        : 'neutral'
      : undefined)

  const calculatedTrendValue =
    trendValue ||
    (previousValue
      ? Math.abs(((value - previousValue) / previousValue) * 100)
      : undefined)

  const TrendIcon =
    calculatedTrend === 'up'
      ? TrendingUp
      : calculatedTrend === 'down'
      ? TrendingDown
      : Minus

  return (
    <SpotlightCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <Counter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="text-3xl font-bold text-[var(--foreground)]"
            />
          </div>
          {calculatedTrend && calculatedTrendValue !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                calculatedTrend === 'up' && 'text-[var(--success)]',
                calculatedTrend === 'down' && 'text-[var(--error)]',
                calculatedTrend === 'neutral' && 'text-[var(--foreground-muted)]'
              )}
            >
              <TrendIcon className="h-4 w-4" />
              <span>{calculatedTrendValue.toFixed(1)}%</span>
              <span className="text-[var(--foreground-muted)] font-normal">
                vs período anterior
              </span>
            </motion.div>
          )}
        </div>
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconColor}20` }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </motion.div>
      </div>
    </SpotlightCard>
  )
}
