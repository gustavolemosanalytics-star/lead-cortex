import { prisma } from '../prisma'

export interface CampaignWithMetrics {
  campaign_id: number
  platform: string
  campaign_name: string
  funnel_stage: string
  is_active: boolean
  leads: number
  qualified: number
  converted: number
  spend: number
  revenue: number
  cpl: number
  conversionRate: number
  roi: number
}

export async function getCampaignPerformance(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const campaigns = await prisma.dim_campaigns.findMany({
    where: { is_active: true },
  })

  const results: CampaignWithMetrics[] = []

  for (const campaign of campaigns) {
    const [leads, qualified, converted, spend, revenue] = await Promise.all([
      prisma.fct_leads.count({
        where: {
          campaign_id: campaign.campaign_id,
          created_at: { gte: startDate },
        },
      }),
      prisma.fct_leads.count({
        where: {
          campaign_id: campaign.campaign_id,
          created_at: { gte: startDate },
          lead_status: { in: ['qualified', 'converted'] },
        },
      }),
      prisma.fct_leads.count({
        where: {
          campaign_id: campaign.campaign_id,
          created_at: { gte: startDate },
          lead_status: 'converted',
        },
      }),
      prisma.fct_ad_spend.aggregate({
        where: {
          campaign_id: campaign.campaign_id,
          date: { full_date: { gte: startDate } },
        },
        _sum: { spend: true },
      }),
      prisma.fct_leads.aggregate({
        where: {
          campaign_id: campaign.campaign_id,
          created_at: { gte: startDate },
          lead_status: 'converted',
        },
        _sum: { deal_value: true },
      }),
    ])

    const totalSpend = Number(spend._sum.spend || 0)
    const totalRevenue = Number(revenue._sum.deal_value || 0)

    results.push({
      campaign_id: Number(campaign.campaign_id),
      platform: campaign.platform,
      campaign_name: campaign.campaign_name || 'Unknown Campaign',
      funnel_stage: campaign.funnel_stage || 'tof',
      is_active: campaign.is_active,
      leads,
      qualified,
      converted,
      spend: totalSpend,
      revenue: totalRevenue,
      cpl: leads > 0 ? totalSpend / leads : 0,
      conversionRate: leads > 0 ? (converted / leads) * 100 : 0,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
    })
  }

  return results.sort((a, b) => b.leads - a.leads)
}

export async function getCampaignTrend(campaignId: number, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyData = await prisma.fct_ad_spend.findMany({
    where: {
      campaign_id: campaignId,
      date: { full_date: { gte: startDate } },
    },
    include: { date: true },
    orderBy: { date: { full_date: 'asc' } },
  })

  return dailyData.map((d) => ({
    date: d.date.full_date.toISOString().slice(0, 10),
    spend: Number(d.spend),
    impressions: Number(d.impressions),
    clicks: Number(d.clicks),
    leads: d.leads_platform,
  }))
}

export async function getPlatformComparison(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const platforms = ['Meta', 'Google', 'TikTok']
  const results = []

  for (const platform of platforms) {
    const campaigns = await prisma.dim_campaigns.findMany({
      where: { platform },
      select: { campaign_id: true },
    })

    const campaignIds = campaigns.map((c) => c.campaign_id)

    const [leads, spend, revenue] = await Promise.all([
      prisma.fct_leads.count({
        where: {
          campaign_id: { in: campaignIds },
          created_at: { gte: startDate },
        },
      }),
      prisma.fct_ad_spend.aggregate({
        where: {
          campaign_id: { in: campaignIds },
          date: { full_date: { gte: startDate } },
        },
        _sum: { spend: true, impressions: true, clicks: true },
      }),
      prisma.fct_leads.aggregate({
        where: {
          campaign_id: { in: campaignIds },
          created_at: { gte: startDate },
          lead_status: 'converted',
        },
        _sum: { deal_value: true },
      }),
    ])

    const totalSpend = Number(spend._sum.spend || 0)
    const totalRevenue = Number(revenue._sum.deal_value || 0)

    results.push({
      platform,
      leads,
      spend: totalSpend,
      revenue: totalRevenue,
      impressions: Number(spend._sum.impressions || 0),
      clicks: Number(spend._sum.clicks || 0),
      cpl: leads > 0 ? totalSpend / leads : 0,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
    })
  }

  return results
}

export async function getSpendOverTime(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailySpend = await prisma.fct_ad_spend.groupBy({
    by: ['date_key'],
    where: {
      date: { full_date: { gte: startDate } },
    },
    _sum: { spend: true, impressions: true, clicks: true },
    orderBy: { date_key: 'asc' },
  })

  // Get leads per day
  const dailyLeads = await prisma.fct_leads.groupBy({
    by: ['date_key'],
    where: {
      created_at: { gte: startDate },
      campaign_id: { not: null },
    },
    _count: { lead_id: true },
  })

  const leadsMap = new Map(dailyLeads.map((l) => [l.date_key, l._count.lead_id]))

  return dailySpend.map((d) => {
    const dateStr = String(d.date_key)
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const leads = leadsMap.get(d.date_key) || 0
    const spend = Number(d._sum.spend || 0)

    return {
      date: `${year}-${month}-${day}`,
      spend,
      impressions: Number(d._sum.impressions || 0),
      clicks: Number(d._sum.clicks || 0),
      leads,
      cpl: leads > 0 ? spend / leads : 0,
    }
  })
}

export async function getCampaignStats(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalCampaigns, totalSpend, totalLeads, totalRevenue] = await Promise.all([
    prisma.dim_campaigns.count({ where: { is_active: true } }),
    prisma.fct_ad_spend.aggregate({
      where: { date: { full_date: { gte: startDate } } },
      _sum: { spend: true },
    }),
    prisma.fct_leads.count({
      where: {
        campaign_id: { not: null },
        created_at: { gte: startDate },
      },
    }),
    prisma.fct_leads.aggregate({
      where: {
        campaign_id: { not: null },
        created_at: { gte: startDate },
        lead_status: 'converted',
      },
      _sum: { deal_value: true },
    }),
  ])

  const spend = Number(totalSpend._sum.spend || 0)
  const revenue = Number(totalRevenue._sum.deal_value || 0)

  return {
    totalCampaigns,
    totalSpend: spend,
    totalLeads,
    totalRevenue: revenue,
    avgCpl: totalLeads > 0 ? spend / totalLeads : 0,
    roi: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
  }
}
