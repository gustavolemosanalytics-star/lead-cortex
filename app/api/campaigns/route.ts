import { NextRequest, NextResponse } from 'next/server'
import {
  getCampaignPerformance,
  getPlatformComparison,
  getSpendOverTime,
  getCampaignStats,
} from '@/lib/db/queries/campaigns'
import { serializeBigInt } from '@/lib/utils/serialize'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const [campaigns, platforms, spendTrend, stats] = await Promise.all([
      getCampaignPerformance(days),
      getPlatformComparison(days),
      getSpendOverTime(days),
      getCampaignStats(days),
    ])

    return NextResponse.json(serializeBigInt({
      campaigns,
      platforms,
      spendTrend,
      stats,
    }))
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
