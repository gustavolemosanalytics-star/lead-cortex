import { NextResponse } from 'next/server'
import {
  getDashboardKPIs,
  getDailyLeadsData,
  getSourceDistribution,
  getFunnelData,
  getRecentLeads,
  getTopCampaigns,
} from '@/lib/db/queries/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const [kpis, dailyLeads, sourceDistribution, funnelData, recentLeads, topCampaigns] =
      await Promise.all([
        getDashboardKPIs(days),
        getDailyLeadsData(days),
        getSourceDistribution(),
        getFunnelData(),
        getRecentLeads(10),
        getTopCampaigns(5),
      ])

    return NextResponse.json({
      kpis,
      dailyLeads,
      sourceDistribution,
      funnelData,
      recentLeads: recentLeads.map((lead) => ({
        ...lead,
        lead_id: lead.lead_id.toString(),
        campaign_id: lead.campaign_id?.toString(),
        deal_value: lead.deal_value?.toString(),
      })),
      topCampaigns: topCampaigns.map((c) => ({
        ...c,
        id: c.id?.toString(),
      })),
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
