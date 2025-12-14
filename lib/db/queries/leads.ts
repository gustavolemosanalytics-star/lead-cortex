import { prisma } from '../prisma'

export interface LeadFilters {
  search?: string
  status?: string
  source?: string
  campaign?: string
  scoreMin?: number
  scoreMax?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getLeads(
  filters: LeadFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 20 }
) {
  const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination
  const skip = (page - 1) * limit

  const where: any = {}

  if (filters.status && filters.status !== 'all') {
    where.lead_status = filters.status
  }

  if (filters.source && filters.source !== 'all') {
    where.source_id = parseInt(filters.source)
  }

  if (filters.campaign && filters.campaign !== 'all') {
    where.campaign_id = parseInt(filters.campaign)
  }

  if (filters.scoreMin !== undefined || filters.scoreMax !== undefined) {
    where.lead_score = {}
    if (filters.scoreMin !== undefined) where.lead_score.gte = filters.scoreMin
    if (filters.scoreMax !== undefined) where.lead_score.lte = filters.scoreMax
  }

  if (filters.dateFrom || filters.dateTo) {
    where.created_at = {}
    if (filters.dateFrom) where.created_at.gte = filters.dateFrom
    if (filters.dateTo) where.created_at.lte = filters.dateTo
  }

  if (filters.search) {
    where.OR = [
      { name_first: { contains: filters.search } },
      { company_name: { contains: filters.search } },
      { job_title: { contains: filters.search } },
    ]
  }

  const orderBy: any = {}
  if (sortBy === 'source') {
    orderBy.source = { source_name: sortOrder }
  } else if (sortBy === 'campaign') {
    orderBy.campaign = { campaign_name: sortOrder }
  } else {
    orderBy[sortBy] = sortOrder
  }

  const [leads, total] = await Promise.all([
    prisma.fct_leads.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        source: true,
        campaign: true,
        landing_page: true,
      },
    }),
    prisma.fct_leads.count({ where }),
  ])

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getLeadById(leadId: number) {
  return prisma.fct_leads.findUnique({
    where: { lead_id: leadId },
    include: {
      source: true,
      campaign: true,
      landing_page: true,
      attributions: {
        include: {
          campaign: true,
        },
      },
    },
  })
}

export async function updateLeadStatus(leadId: number, status: string) {
  const updateData: any = {
    lead_status: status,
  }

  // Update status timestamps based on new status
  if (status === 'contacted') {
    updateData.contacted_at = new Date()
  } else if (status === 'qualified') {
    updateData.qualified_at = new Date()
  } else if (status === 'converted') {
    updateData.converted_at = new Date()
  }

  return prisma.fct_leads.update({
    where: { lead_id: leadId },
    data: updateData,
    include: {
      source: true,
      campaign: true,
    },
  })
}

export async function updateLeadScore(leadId: number, score: number) {
  return prisma.fct_leads.update({
    where: { lead_id: leadId },
    data: { lead_score: score },
  })
}

export async function bulkUpdateLeadStatus(leadIds: number[], status: string) {
  const updateData: any = {
    lead_status: status,
  }

  if (status === 'contacted') {
    updateData.contacted_at = new Date()
  } else if (status === 'qualified') {
    updateData.qualified_at = new Date()
  } else if (status === 'converted') {
    updateData.converted_at = new Date()
  }

  return prisma.fct_leads.updateMany({
    where: { lead_id: { in: leadIds } },
    data: updateData,
  })
}

export async function getLeadSources() {
  return prisma.dim_lead_sources.findMany({
    orderBy: { source_name: 'asc' },
  })
}

export async function getCampaigns() {
  return prisma.dim_campaigns.findMany({
    where: { is_active: true },
    orderBy: { campaign_name: 'asc' },
  })
}

export async function getLeadStats() {
  const [total, byStatus, avgScore] = await Promise.all([
    prisma.fct_leads.count(),
    prisma.fct_leads.groupBy({
      by: ['lead_status'],
      _count: { lead_id: true },
    }),
    prisma.fct_leads.aggregate({
      _avg: { lead_score: true },
    }),
  ])

  const statusCounts = byStatus.reduce((acc, item) => {
    acc[item.lead_status] = item._count.lead_id
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    new: statusCounts['new'] || 0,
    contacted: statusCounts['contacted'] || 0,
    qualified: statusCounts['qualified'] || 0,
    converted: statusCounts['converted'] || 0,
    unqualified: statusCounts['unqualified'] || 0,
    avgScore: Math.round(avgScore._avg.lead_score || 0),
  }
}
