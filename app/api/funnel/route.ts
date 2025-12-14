import { NextRequest, NextResponse } from 'next/server'
import {
  getFunnelAnalysis,
  getFunnelBySource,
  getConversionTrend,
  getDropOffAnalysis,
} from '@/lib/db/queries/funnel'
import { serializeBigInt } from '@/lib/utils/serialize'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const [funnel, bySource, trend, dropOff] = await Promise.all([
      getFunnelAnalysis(),
      getFunnelBySource(),
      getConversionTrend(days),
      getDropOffAnalysis(),
    ])

    return NextResponse.json(serializeBigInt({
      funnel,
      bySource,
      trend,
      dropOff,
    }))
  } catch (error) {
    console.error('Error fetching funnel data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 }
    )
  }
}
