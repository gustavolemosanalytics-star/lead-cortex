import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import crypto from 'crypto'

function hashPII(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

function calculateLeadScore(data: any): number {
  let score = 50 // Base score

  // Company name provided
  if (data.company) {
    score += 10
  }

  // UTM source quality
  if (data.utm_source) {
    if (['google', 'facebook', 'meta'].includes(data.utm_source.toLowerCase())) {
      score += 15
    } else if (['organic', 'direct'].includes(data.utm_source.toLowerCase())) {
      score += 5
    }
  }

  // Has tracking pixels
  if (data.fbc || data.fbp) {
    score += 10
  }

  if (data.gclid) {
    score += 10
  }

  // Random variance
  score += Math.floor(Math.random() * 20) - 10

  return Math.max(20, Math.min(100, score))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, phone, company, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbc, fbp, gclid, landing_page } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get or create source
    let sourceId = 6 // Default to "Direct"
    if (utm_source) {
      const sourceMap: Record<string, string> = {
        facebook: 'Meta Ads',
        instagram: 'Meta Ads',
        meta: 'Meta Ads',
        google: 'Google Ads',
        tiktok: 'TikTok Ads',
        organic: 'Organic Search',
      }
      const sourceName = sourceMap[utm_source.toLowerCase()] || 'Other'
      const source = await prisma.dim_lead_sources.findFirst({
        where: { source_name: sourceName },
      })
      if (source) {
        sourceId = source.source_id
      }
    }

    // Get campaign if UTM parameters match
    let campaignId: number | null = null
    if (utm_source && utm_medium) {
      const campaign = await prisma.dim_campaigns.findFirst({
        where: {
          utm_source: utm_source,
          utm_medium: utm_medium,
        },
      })
      if (campaign) {
        campaignId = Number(campaign.campaign_id)
      }
    }

    // Get landing page
    let landingPageId = 1 // Default
    if (landing_page) {
      const lp = await prisma.dim_landing_pages.findFirst({
        where: { page_url: { contains: landing_page } },
      })
      if (lp) {
        landingPageId = lp.landing_page_id
      }
    }

    // Calculate date key
    const now = new Date()
    const dateKey = parseInt(now.toISOString().slice(0, 10).replace(/-/g, ''))

    // Calculate lead score
    const leadScore = calculateLeadScore(body)

    // Create lead with hashed PII
    const lead = await prisma.fct_leads.create({
      data: {
        date_key: dateKey,
        email_hash: hashPII(email),
        phone_hash: phone ? hashPII(phone) : null,
        name_first: name?.split(' ')[0] || null,
        company_name: company || null,
        landing_page_id: landingPageId,
        source_id: sourceId,
        campaign_id: campaignId,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        fbc: fbc || null,
        fbp: fbp || null,
        gclid: gclid || null,
        lead_status: 'new',
        lead_score: leadScore,
        created_at: now,
      },
    })

    // Store raw submission
    await prisma.raw_form_submissions.create({
      data: {
        lead_id: lead.lead_id,
        submission_source: 'landing_page',
        raw_payload: body,
        processed_status: 'success',
      },
    })

    // Create attribution if campaign exists
    if (campaignId) {
      await prisma.fct_lead_attribution.create({
        data: {
          lead_id: lead.lead_id,
          campaign_id: campaignId,
          attribution_model: 'last_click',
          attribution_weight: 1.0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      leadId: lead.lead_id,
      score: leadScore,
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
