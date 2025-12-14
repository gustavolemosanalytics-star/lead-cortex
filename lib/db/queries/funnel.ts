import { prisma } from '../prisma'

export interface FunnelStage {
  name: string
  value: number
  percentage: number
  conversionFromPrevious: number
  avgTime: number | null
  color: string
}

export interface SourceFunnel {
  source: string
  total: number
  contacted: number
  qualified: number
  converted: number
  contactRate: number
  qualificationRate: number
  conversionRate: number
}

export async function getFunnelAnalysis() {
  const [total, contacted, qualified, converted] = await Promise.all([
    prisma.fct_leads.count(),
    prisma.fct_leads.count({
      where: { lead_status: { in: ['contacted', 'qualified', 'converted'] } },
    }),
    prisma.fct_leads.count({
      where: { lead_status: { in: ['qualified', 'converted'] } },
    }),
    prisma.fct_leads.count({
      where: { lead_status: 'converted' },
    }),
  ])

  const stages: FunnelStage[] = [
    {
      name: 'Novos Leads',
      value: total,
      percentage: 100,
      conversionFromPrevious: 100,
      avgTime: null,
      color: '#7c3aed',
    },
    {
      name: 'Contactados',
      value: contacted,
      percentage: total > 0 ? (contacted / total) * 100 : 0,
      conversionFromPrevious: total > 0 ? (contacted / total) * 100 : 0,
      avgTime: 12, // Mock average hours
      color: '#3b82f6',
    },
    {
      name: 'Qualificados',
      value: qualified,
      percentage: total > 0 ? (qualified / total) * 100 : 0,
      conversionFromPrevious: contacted > 0 ? (qualified / contacted) * 100 : 0,
      avgTime: 48, // Mock average hours
      color: '#22d3ee',
    },
    {
      name: 'Convertidos',
      value: converted,
      percentage: total > 0 ? (converted / total) * 100 : 0,
      conversionFromPrevious: qualified > 0 ? (converted / qualified) * 100 : 0,
      avgTime: 96, // Mock average hours
      color: '#22c55e',
    },
  ]

  return stages
}

export async function getFunnelBySource() {
  const sources = await prisma.dim_lead_sources.findMany()
  const results: SourceFunnel[] = []

  for (const source of sources) {
    const [total, contacted, qualified, converted] = await Promise.all([
      prisma.fct_leads.count({ where: { source_id: source.source_id } }),
      prisma.fct_leads.count({
        where: {
          source_id: source.source_id,
          lead_status: { in: ['contacted', 'qualified', 'converted'] },
        },
      }),
      prisma.fct_leads.count({
        where: {
          source_id: source.source_id,
          lead_status: { in: ['qualified', 'converted'] },
        },
      }),
      prisma.fct_leads.count({
        where: {
          source_id: source.source_id,
          lead_status: 'converted',
        },
      }),
    ])

    if (total > 0) {
      results.push({
        source: source.source_name,
        total,
        contacted,
        qualified,
        converted,
        contactRate: (contacted / total) * 100,
        qualificationRate: contacted > 0 ? (qualified / contacted) * 100 : 0,
        conversionRate: (converted / total) * 100,
      })
    }
  }

  return results.sort((a, b) => b.total - a.total)
}

export async function getConversionTrend(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyLeads = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: { created_at: { gte: startDate } },
    _count: { lead_id: true },
  })

  const dailyConverted = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: {
      created_at: { gte: startDate },
      lead_status: 'converted',
    },
    _count: { lead_id: true },
  })

  const dailyQualified = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: {
      created_at: { gte: startDate },
      lead_status: { in: ['qualified', 'converted'] },
    },
    _count: { lead_id: true },
  })

  const leadsMap = new Map(dailyLeads.map((l) => [l.date_key, l._count.lead_id]))
  const convertedMap = new Map(dailyConverted.map((c) => [c.date_key, c._count.lead_id]))
  const qualifiedMap = new Map(dailyQualified.map((q) => [q.date_key, q._count.lead_id]))

  const dates: { date: string; leads: number; qualified: number; converted: number; conversionRate: number }[] = []
  const current = new Date(startDate)
  const today = new Date()

  while (current <= today) {
    const dateKey = parseInt(current.toISOString().slice(0, 10).replace(/-/g, ''))
    const leads = leadsMap.get(dateKey) || 0
    const qualified = qualifiedMap.get(dateKey) || 0
    const converted = convertedMap.get(dateKey) || 0

    dates.push({
      date: current.toISOString().slice(0, 10),
      leads,
      qualified,
      converted,
      conversionRate: leads > 0 ? (converted / leads) * 100 : 0,
    })
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export async function getDropOffAnalysis() {
  const total = await prisma.fct_leads.count()
  const unqualified = await prisma.fct_leads.count({
    where: { lead_status: 'unqualified' },
  })
  const newLeads = await prisma.fct_leads.count({
    where: { lead_status: 'new' },
  })

  const contacted = await prisma.fct_leads.count({
    where: { lead_status: 'contacted' },
  })

  return {
    total,
    unqualified,
    stuckAtNew: newLeads,
    stuckAtContacted: contacted,
    unqualifiedRate: total > 0 ? (unqualified / total) * 100 : 0,
    stuckAtNewRate: total > 0 ? (newLeads / total) * 100 : 0,
    stuckAtContactedRate: total > 0 ? (contacted / total) * 100 : 0,
  }
}
