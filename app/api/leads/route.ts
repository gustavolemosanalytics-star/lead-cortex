import { NextRequest, NextResponse } from 'next/server'
import {
  getLeads,
  getLeadSources,
  getCampaigns,
  getLeadStats,
  bulkUpdateLeadStatus,
} from '@/lib/db/queries/leads'
import { serializeBigInt } from '@/lib/utils/serialize'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const source = searchParams.get('source') || undefined
    const campaign = searchParams.get('campaign') || undefined
    const scoreMin = searchParams.get('scoreMin')
      ? parseInt(searchParams.get('scoreMin')!)
      : undefined
    const scoreMax = searchParams.get('scoreMax')
      ? parseInt(searchParams.get('scoreMax')!)
      : undefined

    const filters = {
      search,
      status,
      source,
      campaign,
      scoreMin,
      scoreMax,
    }

    const pagination = { page, limit, sortBy, sortOrder }

    const [leadsData, sources, campaigns, stats] = await Promise.all([
      getLeads(filters, pagination),
      getLeadSources(),
      getCampaigns(),
      getLeadStats(),
    ])

    return NextResponse.json(serializeBigInt({
      ...leadsData,
      sources,
      campaigns,
      stats,
    }))
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadIds, status } = body

    if (!leadIds || !Array.isArray(leadIds) || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: leadIds (array) and status' },
        { status: 400 }
      )
    }

    const result = await bulkUpdateLeadStatus(leadIds, status)

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    console.error('Error updating leads:', error)
    return NextResponse.json(
      { error: 'Failed to update leads' },
      { status: 500 }
    )
  }
}
