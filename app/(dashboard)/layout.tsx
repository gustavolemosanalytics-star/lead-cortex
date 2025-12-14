'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Aurora } from '@/components/backgrounds/aurora'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Aurora />
      <Sidebar />
      <main className="ml-[280px] min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
