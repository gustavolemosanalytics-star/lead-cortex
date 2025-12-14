'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Target, DollarSign, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { KPICard } from '@/components/dashboard/kpi-card'
import { LeadsAreaChart } from '@/components/charts/area-chart'
import { SourcePieChart } from '@/components/charts/pie-chart'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { GlitchText } from '@/components/animations/glitch-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

async function fetchDashboardData() {
  const response = await fetch('/api/analytics?days=30')
  if (!response.ok) throw new Error('Failed to fetch data')
  return response.json()
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  new: { label: 'Novo', variant: 'info' },
  contacted: { label: 'Contactado', variant: 'warning' },
  qualified: { label: 'Qualificado', variant: 'success' },
  converted: { label: 'Convertido', variant: 'success' },
  unqualified: { label: 'Não Qualificado', variant: 'error' },
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 60000,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--error)]">Erro ao carregar dados do dashboard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Visão geral de performance" />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bem-vindo ao <GlitchText text="Cortex Analytics" className="inline" />
                  </h2>
                  <p className="text-[var(--foreground-muted)]">
                    Aqui está o resumo dos últimos 30 dias do seu funil de leads
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="status-dot status-dot-success" />
                  <span className="text-sm text-[var(--foreground-muted)]">Sistema operacional</span>
                </div>
              </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <KPICard
                  title="Total de Leads"
                  value={data.kpis.totalLeads}
                  previousValue={data.kpis.previousLeads}
                  icon={Users}
                  iconColor="#7c3aed"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <KPICard
                  title="Taxa de Conversão"
                  value={data.kpis.conversionRate}
                  suffix="%"
                  decimals={1}
                  icon={Target}
                  iconColor="#22d3ee"
                  trend={data.kpis.conversionRate > 10 ? 'up' : 'down'}
                  trendValue={Math.abs(data.kpis.conversionRate - 10)}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <KPICard
                  title="CPL Médio"
                  value={data.kpis.cpl}
                  prefix="R$ "
                  decimals={2}
                  icon={DollarSign}
                  iconColor="#f59e0b"
                  trend={data.kpis.cpl < 50 ? 'up' : 'down'}
                  trendValue={Math.abs(50 - data.kpis.cpl)}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <KPICard
                  title="ROI"
                  value={data.kpis.roi}
                  suffix="%"
                  decimals={1}
                  icon={TrendingUp}
                  iconColor="#22c55e"
                  trend={data.kpis.roi > 0 ? 'up' : 'down'}
                  trendValue={Math.abs(data.kpis.roi)}
                />
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Leads Over Time */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[var(--primary)]" />
                      Evolução de Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LeadsAreaChart data={data.dailyLeads} height={280} />
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              {/* Source Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle>Distribuição por Fonte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SourcePieChart data={data.sourceDistribution} height={280} />
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Funnel and Recent Leads */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Funnel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2"
              >
                <SpotlightCard>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Funil de Conversão</CardTitle>
                    <Link href="/funnel">
                      <Button variant="ghost" size="sm">
                        Ver detalhes <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <FunnelChart stages={data.funnelData} />
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              {/* Top Campaigns */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Top Campanhas</CardTitle>
                    <Link href="/campaigns">
                      <Button variant="ghost" size="sm">
                        Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.topCampaigns.map((campaign: any, index: number) => (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--background-elevated)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                              style={{
                                background:
                                  campaign.platform === 'Meta'
                                    ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                                    : 'linear-gradient(135deg, #3b82f6, #22d3ee)',
                              }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[150px]">
                                {campaign.name}
                              </p>
                              <p className="text-xs text-[var(--foreground-muted)]">
                                {campaign.platform}
                              </p>
                            </div>
                          </div>
                          <Badge variant="default">{campaign.leads} leads</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <SpotlightCard>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Leads Recentes</CardTitle>
                  <Link href="/leads">
                    <Button variant="ghost" size="sm">
                      Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--glass-border)]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Nome
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Empresa
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Fonte
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Score
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentLeads.map((lead: any) => (
                          <motion.tr
                            key={lead.lead_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="font-medium">{lead.name_first || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-4 text-[var(--foreground-muted)]">
                              {lead.company_name || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm">{lead.source?.source_name || 'Direto'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={statusConfig[lead.lead_status]?.variant || 'default'}>
                                {statusConfig[lead.lead_status]?.label || lead.lead_status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 rounded-full bg-[var(--glass-bg)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${lead.lead_score || 0}%`,
                                      background:
                                        lead.lead_score >= 70
                                          ? 'var(--success)'
                                          : lead.lead_score >= 40
                                          ? 'var(--warning)'
                                          : 'var(--error)',
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-[var(--foreground-muted)]">
                                  {lead.lead_score || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[var(--foreground-muted)] text-sm">
                              {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </SpotlightCard>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
