import { NextRequest, NextResponse } from 'next/server'
import { getLeadById, updateLeadStatus, updateLeadScore } from '@/lib/db/queries/leads'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const leadId = parseInt(id)

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
    }

    const lead = await getLeadById(leadId)

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const leadId = parseInt(id)

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
    }

    const body = await request.json()
    const { status, score } = body

    let lead

    if (status) {
      lead = await updateLeadStatus(leadId, status)
    }

    if (score !== undefined) {
      lead = await updateLeadScore(leadId, score)
    }

    if (!lead) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
