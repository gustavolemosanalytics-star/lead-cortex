'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Target,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChartComponent, MultiBarChart } from '@/components/charts/bar-chart'
import { LineChartComponent } from '@/components/charts/line-chart'
import { SourcePieChart } from '@/components/charts/pie-chart'

async function fetchCampaignData(days: number) {
  const response = await fetch(`/api/campaigns?days=${days}`)
  if (!response.ok) throw new Error('Failed to fetch campaign data')
  return response.json()
}

function CampaignsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

const platformColors: Record<string, string> = {
  Meta: '#7c3aed',
  Google: '#3b82f6',
  TikTok: '#ec4899',
}

const funnelStageLabels: Record<string, string> = {
  tof: 'Topo',
  mof: 'Meio',
  bof: 'Fundo',
}

export default function CampaignsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', 30],
    queryFn: () => fetchCampaignData(30),
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--error)]">Erro ao carregar dados de campanhas</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Campanhas" subtitle="Analytics de performance de campanhas" />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <CampaignsSkeleton />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Campanhas Ativas</p>
                        <p className="text-2xl font-bold">{data?.stats?.totalCampaigns || 0}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Investimento Total</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(data?.stats?.totalSpend || 0)}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--warning)]/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-[var(--warning)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Leads Gerados</p>
                        <p className="text-2xl font-bold">{data?.stats?.totalLeads || 0}</p>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">
                          CPL: {formatCurrency(data?.stats?.avgCpl || 0)}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--info)]/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[var(--info)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">ROI Geral</p>
                        <p className="text-2xl font-bold">
                          {formatPercent(data?.stats?.roi || 0)}
                        </p>
                        <p
                          className={`text-xs mt-1 flex items-center gap-1 ${
                            (data?.stats?.roi || 0) >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                          }`}
                        >
                          {(data?.stats?.roi || 0) >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {formatCurrency(data?.stats?.totalRevenue || 0)} receita
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-[var(--success)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Platform Comparison */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                      Comparativo por Plataforma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.platforms && (
                      <MultiBarChart
                        data={data.platforms}
                        bars={[
                          { dataKey: 'leads', name: 'Leads', color: '#7c3aed' },
                          { dataKey: 'spend', name: 'Investimento', color: '#3b82f6' },
                        ]}
                        xAxisKey="platform"
                        height={280}
                        formatValue={(v) => v.toLocaleString('pt-BR')}
                      />
                    )}
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              {/* Platform Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-[var(--primary)]" />
                      Distribuição de Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.platforms && (
                      <SourcePieChart
                        data={data.platforms.map((p: any) => ({
                          name: p.platform,
                          value: p.leads,
                          color: platformColors[p.platform] || '#64748b',
                        }))}
                        height={280}
                      />
                    )}
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Spend Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SpotlightCard>
                <CardHeader>
                  <CardTitle>Evolução de Investimento e CPL</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.spendTrend && (
                    <LineChartComponent
                      data={data.spendTrend}
                      lines={[
                        { dataKey: 'spend', name: 'Investimento (R$)', color: '#7c3aed' },
                        { dataKey: 'cpl', name: 'CPL (R$)', color: '#22d3ee' },
                      ]}
                      xAxisKey="date"
                      height={300}
                    />
                  )}
                </CardContent>
              </SpotlightCard>
            </motion.div>

            {/* Campaigns Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <SpotlightCard>
                <CardHeader>
                  <CardTitle>Performance por Campanha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--glass-border)]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Campanha
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Plataforma
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Estágio
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Leads
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Investimento
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            CPL
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            Conversão
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">
                            ROI
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.campaigns?.map((campaign: any, index: number) => (
                          <motion.tr
                            key={campaign.campaign_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="font-medium truncate max-w-[200px] block">
                                {campaign.campaign_name}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                style={{
                                  backgroundColor: `${platformColors[campaign.platform]}20`,
                                  color: platformColors[campaign.platform],
                                }}
                              >
                                {campaign.platform}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-[var(--foreground-muted)]">
                                {funnelStageLabels[campaign.funnel_stage] || campaign.funnel_stage}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.leads}
                            </td>
                            <td className="py-3 px-4 text-right text-[var(--foreground-muted)]">
                              {formatCurrency(campaign.spend)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={
                                  campaign.cpl <= 50
                                    ? 'text-[var(--success)]'
                                    : campaign.cpl <= 100
                                    ? 'text-[var(--warning)]'
                                    : 'text-[var(--error)]'
                                }
                              >
                                {formatCurrency(campaign.cpl)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {formatPercent(campaign.conversionRate)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`flex items-center justify-end gap-1 ${
                                  campaign.roi >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                                }`}
                              >
                                {campaign.roi >= 0 ? (
                                  <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3" />
                                )}
                                {formatPercent(campaign.roi)}
                              </span>
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
