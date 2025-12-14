import { prisma } from '../prisma'

export interface DailyLeadsReport {
  full_date: Date
  day_of_week_name: string
  total_leads: number
  qualified_leads: number
  converted_leads: number
  qualification_rate: number
  conversion_rate: number
  ad_spend: number
  ad_clicks: number
  cpl_real: number | null
  total_deal_value: number | null
}

export interface CampaignPerformance {
  platform: string
  campaign_name: string
  adset_name: string
  funnel_stage: string
  impressions: number
  clicks: number
  spend: number
  attributed_leads: number
  qualified_leads: number
  converted_leads: number
  cpl: number | null
  cpql: number | null
  revenue: number
  roi: number | null
}

export interface FunnelAnalysis {
  source_name: string
  is_paid: boolean
  total_leads: number
  contacted: number
  qualified: number
  converted: number
  contact_rate: number
  qualification_rate: number
  close_rate: number
  overall_conversion_rate: number
  total_revenue: number | null
  avg_deal_value: number | null
  avg_days_to_convert: number | null
}

export async function getDashboardKPIs(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - days)

  // Current period
  const currentLeads = await prisma.fct_leads.count({
    where: {
      created_at: { gte: startDate },
    },
  })

  const currentQualified = await prisma.fct_leads.count({
    where: {
      created_at: { gte: startDate },
      lead_status: 'qualified',
    },
  })

  const currentConverted = await prisma.fct_leads.count({
    where: {
      created_at: { gte: startDate },
      lead_status: 'converted',
    },
  })

  const currentSpend = await prisma.fct_ad_spend.aggregate({
    where: {
      date: {
        full_date: { gte: startDate },
      },
    },
    _sum: { spend: true },
  })

  const currentRevenue = await prisma.fct_leads.aggregate({
    where: {
      created_at: { gte: startDate },
      lead_status: 'converted',
    },
    _sum: { deal_value: true },
  })

  // Previous period
  const previousLeads = await prisma.fct_leads.count({
    where: {
      created_at: { gte: previousStartDate, lt: startDate },
    },
  })

  const previousSpend = await prisma.fct_ad_spend.aggregate({
    where: {
      date: {
        full_date: { gte: previousStartDate, lt: startDate },
      },
    },
    _sum: { spend: true },
  })

  const spend = Number(currentSpend._sum.spend || 0)
  const revenue = Number(currentRevenue._sum.deal_value || 0)
  const previousSpendValue = Number(previousSpend._sum.spend || 0)

  return {
    totalLeads: currentLeads,
    previousLeads,
    qualifiedLeads: currentQualified,
    convertedLeads: currentConverted,
    conversionRate: currentLeads > 0 ? (currentConverted / currentLeads) * 100 : 0,
    qualificationRate: currentLeads > 0 ? (currentQualified / currentLeads) * 100 : 0,
    totalSpend: spend,
    previousSpend: previousSpendValue,
    cpl: currentLeads > 0 ? spend / currentLeads : 0,
    revenue,
    roi: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
  }
}

export async function getDailyLeadsData(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const leads = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: {
      created_at: { gte: startDate },
    },
    _count: { lead_id: true },
  })

  const qualified = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: {
      created_at: { gte: startDate },
      lead_status: { in: ['qualified', 'converted'] },
    },
    _count: { lead_id: true },
  })

  const converted = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: {
      created_at: { gte: startDate },
      lead_status: 'converted',
    },
    _count: { lead_id: true },
  })

  // Create a map for easy lookup
  const leadsMap = new Map(leads.map((l) => [l.date_key, l._count.lead_id]))
  const qualifiedMap = new Map(qualified.map((q) => [q.date_key, q._count.lead_id]))
  const convertedMap = new Map(converted.map((c) => [c.date_key, c._count.lead_id]))

  // Get all dates in the range
  const dates: { date: string; leads: number; qualified: number; converted: number }[] = []
  const current = new Date(startDate)
  const today = new Date()

  while (current <= today) {
    const dateKey = parseInt(current.toISOString().slice(0, 10).replace(/-/g, ''))
    dates.push({
      date: current.toISOString().slice(0, 10),
      leads: leadsMap.get(dateKey) || 0,
      qualified: qualifiedMap.get(dateKey) || 0,
      converted: convertedMap.get(dateKey) || 0,
    })
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export async function getSourceDistribution() {
  const sources = await prisma.fct_leads.groupBy({
    by: ['source_id'],
    _count: { lead_id: true },
  })

  const sourceDetails = await prisma.dim_lead_sources.findMany()
  const sourceMap = new Map(sourceDetails.map((s) => [s.source_id, s]))

  const colors: Record<string, string> = {
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

  return sources
    .map((s) => {
      const source = sourceMap.get(s.source_id || 0)
      return {
        name: source?.source_name || 'Desconhecido',
        value: s._count.lead_id,
        color: colors[source?.source_name || 'Other'] || '#64748b',
      }
    })
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
}

export async function getFunnelData() {
  const total = await prisma.fct_leads.count()
  const contacted = await prisma.fct_leads.count({
    where: { lead_status: { in: ['contacted', 'qualified', 'converted'] } },
  })
  const qualified = await prisma.fct_leads.count({
    where: { lead_status: { in: ['qualified', 'converted'] } },
  })
  const converted = await prisma.fct_leads.count({
    where: { lead_status: 'converted' },
  })

  return [
    {
      name: 'Novos Leads',
      value: total,
      percentage: 100,
      color: '#7c3aed',
    },
    {
      name: 'Contactados',
      value: contacted,
      percentage: total > 0 ? (contacted / total) * 100 : 0,
      color: '#3b82f6',
    },
    {
      name: 'Qualificados',
      value: qualified,
      percentage: total > 0 ? (qualified / total) * 100 : 0,
      color: '#22d3ee',
    },
    {
      name: 'Convertidos',
      value: converted,
      percentage: total > 0 ? (converted / total) * 100 : 0,
      color: '#22c55e',
    },
  ]
}

export async function getRecentLeads(limit: number = 10) {
  return prisma.fct_leads.findMany({
    take: limit,
    orderBy: { created_at: 'desc' },
    include: {
      source: true,
      campaign: true,
    },
  })
}

export async function getTopCampaigns(limit: number = 5) {
  const campaigns = await prisma.fct_leads.groupBy({
    by: ['campaign_id'],
    _count: { lead_id: true },
    orderBy: { _count: { lead_id: 'desc' } },
    take: limit,
  })

  const campaignDetails = await prisma.dim_campaigns.findMany({
    where: {
      campaign_id: { in: campaigns.map((c) => c.campaign_id!).filter(Boolean) },
    },
  })

  const campaignMap = new Map(campaignDetails.map((c) => [Number(c.campaign_id), c]))

  return campaigns.map((c) => {
    const campaign = campaignMap.get(Number(c.campaign_id))
    return {
      id: c.campaign_id,
      name: campaign?.campaign_name || 'Desconhecida',
      platform: campaign?.platform || 'Unknown',
      leads: c._count.lead_id,
    }
  })
}
