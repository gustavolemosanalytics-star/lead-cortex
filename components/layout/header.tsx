'use client'

import { Bell, Search, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--glass-border)] bg-[var(--background)]/80 backdrop-blur-xl px-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--foreground-muted)]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:block w-64">
          <Input
            placeholder="Buscar..."
            icon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        {/* Last update indicator */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
          <span className="status-dot status-dot-success" />
          <span>
            Atualizado às{' '}
            {lastUpdate.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Refresh button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="h-9 w-9"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{
              duration: 1,
              repeat: isRefreshing ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.div>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--error)]" />
        </Button>
      </div>
    </header>
  )
}
