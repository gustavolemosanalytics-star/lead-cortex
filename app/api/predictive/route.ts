import { NextRequest, NextResponse } from 'next/server'
import {
  getScoreDistribution,
  getConversionProbability,
  getBestContactTimes,
  getPredictiveInsights,
  getForecast,
  getAnomalies,
} from '@/lib/db/queries/predictive'
import { serializeBigInt } from '@/lib/utils/serialize'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forecastDays = parseInt(searchParams.get('forecastDays') || '7')

    const [
      scoreDistribution,
      conversionProbability,
      bestContactTimes,
      insights,
      forecast,
      anomalies,
    ] = await Promise.all([
      getScoreDistribution(),
      getConversionProbability(),
      getBestContactTimes(),
      getPredictiveInsights(),
      getForecast(forecastDays),
      getAnomalies(),
    ])

    return NextResponse.json(serializeBigInt({
      scoreDistribution,
      conversionProbability,
      bestContactTimes,
      insights,
      forecast,
      anomalies,
    }))
  } catch (error) {
    console.error('Error fetching predictive data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch predictive data' },
      { status: 500 }
    )
  }
}
