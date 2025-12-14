'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Sparkles,
  Target,
  Lightbulb,
  BarChart3,
  LineChart,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { GlitchText } from '@/components/animations/glitch-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChartComponent } from '@/components/charts/bar-chart'
import { LineChartComponent } from '@/components/charts/line-chart'

async function fetchPredictiveData() {
  const response = await fetch('/api/predictive')
  if (!response.ok) throw new Error('Failed to fetch predictive data')
  return response.json()
}

function PredictiveSkeleton() {
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

const insightTypeConfig = {
  success: { icon: TrendingUp, color: 'var(--success)' },
  warning: { icon: AlertTriangle, color: 'var(--warning)' },
  info: { icon: Lightbulb, color: 'var(--info)' },
  error: { icon: TrendingDown, color: 'var(--error)' },
}

export default function PredictivePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['predictive'],
    queryFn: fetchPredictiveData,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--error)]">Erro ao carregar dados preditivos</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Preditivo" subtitle="Insights de IA e análise preditiva" />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <PredictiveSkeleton />
        ) : (
          <>
            {/* AI Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent-cyan)]/10" />
              <div className="relative flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent-cyan)] flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <GlitchText text="Cortex AI" className="inline" />
                    <Sparkles className="h-5 w-5 text-[var(--warning)]" />
                  </h2>
                  <p className="text-[var(--foreground-muted)]">
                    Análise preditiva baseada em {data?.scoreDistribution?.reduce((sum: number, s: any) => sum + s.count, 0) || 0} leads
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Insights Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data?.insights?.map((insight: any, index: number) => {
                const config = insightTypeConfig[insight.type as keyof typeof insightTypeConfig]
                const Icon = config.icon
                return (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <SpotlightCard className="h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-[var(--foreground-muted)] mb-1">
                              {insight.title}
                            </p>
                            <p className="text-2xl font-bold">{insight.value}</p>
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                              {insight.description}
                            </p>
                          </div>
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            <Icon className="h-5 w-5" style={{ color: config.color }} />
                          </div>
                        </div>
                      </CardContent>
                    </SpotlightCard>
                  </motion.div>
                )
              })}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Score Distribution */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                      Distribuição de Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.scoreDistribution && (
                      <BarChartComponent
                        data={data.scoreDistribution}
                        dataKey="count"
                        xAxisKey="range"
                        height={280}
                        colors={data.scoreDistribution.map((s: any) => s.color)}
                        formatValue={(v) => `${v} leads`}
                      />
                    )}
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              {/* Conversion Probability */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[var(--primary)]" />
                      Probabilidade de Conversão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.conversionProbability?.map((item: any) => (
                        <div key={item.scoreRange} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">
                              Score {item.scoreRange}
                            </span>
                            <span className="font-medium">{item.probability.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[var(--glass-bg)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${item.probability}%`,
                                backgroundColor:
                                  item.probability >= 20
                                    ? 'var(--success)'
                                    : item.probability >= 10
                                    ? 'var(--warning)'
                                    : 'var(--error)',
                              }}
                            />
                          </div>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {item.converted} de {item.total} leads convertidos
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Forecast and Best Times */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Forecast */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-[var(--primary)]" />
                      Previsão de Leads (7 dias)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.forecast?.forecast && (
                      <>
                        <div className="mb-4 p-3 rounded-lg bg-[var(--glass-bg)]">
                          <p className="text-sm text-[var(--foreground-muted)]">
                            Média diária histórica:{' '}
                            <span className="font-bold text-[var(--foreground)]">
                              {data.forecast.avgDailyLeads} leads/dia
                            </span>
                          </p>
                        </div>
                        <LineChartComponent
                          data={data.forecast.forecast}
                          lines={[
                            { dataKey: 'predicted', name: 'Previsão', color: '#7c3aed' },
                            { dataKey: 'upper', name: 'Limite Superior', color: '#22c55e' },
                            { dataKey: 'lower', name: 'Limite Inferior', color: '#f59e0b' },
                          ]}
                          xAxisKey="date"
                          height={250}
                        />
                      </>
                    )}
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              {/* Best Contact Times */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <SpotlightCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[var(--primary)]" />
                      Melhores Horários para Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.bestContactTimes?.map((time: any, index: number) => (
                        <motion.div
                          key={time.hour}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-[var(--glass-bg)]"
                        >
                          <div className="text-lg font-bold w-16">{time.hour}</div>
                          <div className="flex-1">
                            <div className="w-full h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${time.successRate}%`,
                                  backgroundColor:
                                    time.successRate >= 40
                                      ? 'var(--success)'
                                      : time.successRate >= 30
                                      ? 'var(--warning)'
                                      : 'var(--error)',
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{time.successRate.toFixed(1)}%</p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                              {time.conversions}/{time.attempts}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Anomalies */}
            {data?.anomalies && data.anomalies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SpotlightCard>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
                      Alertas e Anomalias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {data.anomalies.map((anomaly: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.55 + index * 0.05 }}
                          className={`p-4 rounded-lg border ${
                            anomaly.type === 'error'
                              ? 'border-[var(--error)]/50 bg-[var(--error)]/10'
                              : anomaly.type === 'warning'
                              ? 'border-[var(--warning)]/50 bg-[var(--warning)]/10'
                              : 'border-[var(--info)]/50 bg-[var(--info)]/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              className={`h-5 w-5 mt-0.5 ${
                                anomaly.type === 'error'
                                  ? 'text-[var(--error)]'
                                  : anomaly.type === 'warning'
                                  ? 'text-[var(--warning)]'
                                  : 'text-[var(--info)]'
                              }`}
                            />
                            <div>
                              <h4 className="font-medium mb-1">{anomaly.title}</h4>
                              <p className="text-sm text-[var(--foreground-muted)] mb-2">
                                {anomaly.description}
                              </p>
                              <Badge
                                variant={
                                  anomaly.type === 'error'
                                    ? 'error'
                                    : anomaly.type === 'warning'
                                    ? 'warning'
                                    : 'info'
                                }
                              >
                                {anomaly.action}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
