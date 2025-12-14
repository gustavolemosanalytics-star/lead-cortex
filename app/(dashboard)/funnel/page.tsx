'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Trophy,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { LineChartComponent } from '@/components/charts/line-chart'

async function fetchFunnelData(days: number) {
  const response = await fetch(`/api/funnel?days=${days}`)
  if (!response.ok) throw new Error('Failed to fetch funnel data')
  return response.json()
}

function FunnelSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-[400px]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

const sourceColors: Record<string, string> = {
  'Meta Ads': '#7c3aed',
  'Google Ads': '#3b82f6',
  'TikTok Ads': '#ec4899',
  'Organic Search': '#22c55e',
  'Organic Social': '#22d3ee',
  Direct: '#f59e0b',
  Referral: '#8b5cf6',
  Email: '#06b6d4',
  Other: '#64748b',
}

export default function FunnelPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['funnel', 30],
    queryFn: () => fetchFunnelData(30),
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--error)]">Erro ao carregar dados do funil</p>
      </div>
    )
  }

  const totalLeads = data?.funnel?.[0]?.value || 0
  const converted = data?.funnel?.[3]?.value || 0
  const overallConversion = totalLeads > 0 ? (converted / totalLeads) * 100 : 0

  return (
    <div className="min-h-screen">
      <Header title="Funil" subtitle="Análise de conversão e jornada do lead" />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <FunnelSkeleton />
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
                        <p className="text-sm text-[var(--foreground-muted)]">Taxa de Conversão</p>
                        <p className="text-2xl font-bold">{formatPercent(overallConversion)}</p>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">
                          {converted} de {totalLeads} leads
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-[var(--success)]" />
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
                        <p className="text-sm text-[var(--foreground-muted)]">Leads Parados</p>
                        <p className="text-2xl font-bold">{data?.dropOff?.stuckAtNew || 0}</p>
                        <p className="text-xs text-[var(--warning)] mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {formatPercent(data?.dropOff?.stuckAtNewRate || 0)} sem contato
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--warning)]/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-[var(--warning)]" />
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
                        <p className="text-sm text-[var(--foreground-muted)]">Desqualificados</p>
                        <p className="text-2xl font-bold">{data?.dropOff?.unqualified || 0}</p>
                        <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {formatPercent(data?.dropOff?.unqualifiedRate || 0)} do total
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--error)]/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[var(--error)]" />
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
                        <p className="text-sm text-[var(--foreground-muted)]">Em Qualificação</p>
                        <p className="text-2xl font-bold">{data?.dropOff?.stuckAtContacted || 0}</p>
                        <p className="text-xs text-[var(--info)] mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Aguardando avaliação
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--info)]/20 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-[var(--info)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Main Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SpotlightCard>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.funnel && (
                    <div className="py-4">
                      <FunnelChart stages={data.funnel} />
                    </div>
                  )}
                </CardContent>
              </SpotlightCard>
            </motion.div>

            {/* Stage Details */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data?.funnel?.map((stage: any, index: number) => (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                >
                  <SpotlightCard className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-[var(--foreground-muted)]">Quantidade</span>
                          <span className="font-bold">{stage.value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[var(--foreground-muted)]">Do total</span>
                          <span className="text-sm">{formatPercent(stage.percentage)}</span>
                        </div>
                        {index > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-[var(--foreground-muted)]">
                              Conversão anterior
                            </span>
                            <span
                              className={`text-sm ${
                                stage.conversionFromPrevious >= 50
                                  ? 'text-[var(--success)]'
                                  : stage.conversionFromPrevious >= 30
                                  ? 'text-[var(--warning)]'
                                  : 'text-[var(--error)]'
                              }`}
                            >
                              {formatPercent(stage.conversionFromPrevious)}
                            </span>
                          </div>
                        )}
                        {stage.avgTime && (
                          <div className="flex justify-between">
                            <span className="text-sm text-[var(--foreground-muted)]">
                              Tempo médio
                            </span>
                            <span className="text-sm">{stage.avgTime}h</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Conversion Trend */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle>Evolução da Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.trend && (
                      <LineChartComponent
                        data={data.trend}
                        lines={[
                          { dataKey: 'leads', name: 'Novos Leads', color: '#7c3aed' },
                          { dataKey: 'qualified', name: 'Qualificados', color: '#22d3ee' },
                          { dataKey: 'converted', name: 'Convertidos', color: '#22c55e' },
                        ]}
                        xAxisKey="date"
                        height={300}
                      />
                    )}
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              {/* Source Comparison */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle>Conversão por Fonte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {data?.bySource?.map((source: any, index: number) => (
                        <motion.div
                          key={source.source}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="p-3 rounded-lg bg-[var(--glass-bg)]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: sourceColors[source.source] || '#64748b' }}
                              />
                              <span className="font-medium text-sm">{source.source}</span>
                            </div>
                            <Badge variant="default">{source.total} leads</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                            <span>{source.contacted} contactados</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{source.qualified} qualificados</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-[var(--success)]">{source.converted} convertidos</span>
                          </div>
                          <div className="mt-2 flex gap-4 text-xs">
                            <span>
                              Contato: <span className="font-medium">{formatPercent(source.contactRate)}</span>
                            </span>
                            <span>
                              Qualificação:{' '}
                              <span className="font-medium">{formatPercent(source.qualificationRate)}</span>
                            </span>
                            <span>
                              Conversão:{' '}
                              <span
                                className={`font-medium ${
                                  source.conversionRate >= 15
                                    ? 'text-[var(--success)]'
                                    : source.conversionRate >= 10
                                    ? 'text-[var(--warning)]'
                                    : 'text-[var(--error)]'
                                }`}
                              >
                                {formatPercent(source.conversionRate)}
                              </span>
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
