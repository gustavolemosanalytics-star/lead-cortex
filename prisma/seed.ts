import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Parse the DATABASE_URL for connection options
function parseConnectionString(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  }
}

const connectionOptions = parseConnectionString(process.env.DATABASE_URL || '')

const adapter = new PrismaMariaDb({
  host: connectionOptions.host,
  port: connectionOptions.port,
  user: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

// Helper to generate random number in range
const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

// Helper to generate random date in range
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

// Hash function simulation
const hash = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.fct_offline_conversions.deleteMany()
  await prisma.fct_lead_attribution.deleteMany()
  await prisma.fct_ad_spend.deleteMany()
  await prisma.fct_leads.deleteMany()
  await prisma.raw_form_submissions.deleteMany()
  await prisma.dim_campaigns.deleteMany()
  await prisma.dim_landing_pages.deleteMany()
  await prisma.dim_lead_sources.deleteMany()
  await prisma.dim_dates.deleteMany()

  console.log('📅 Creating dates...')

  // Create dates for 2024-2025
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2025-12-31')
  const dates: any[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateKey = parseInt(current.toISOString().slice(0, 10).replace(/-/g, ''))
    dates.push({
      date_key: dateKey,
      full_date: new Date(current),
      day_of_week: current.getDay() + 1,
      day_of_week_name: current.toLocaleDateString('en-US', { weekday: 'long' }),
      day_of_month: current.getDate(),
      day_of_year: Math.floor(
        (current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / 86400000
      ),
      week_of_year: Math.ceil(
        ((current.getTime() - new Date(current.getFullYear(), 0, 1).getTime()) / 86400000 +
          new Date(current.getFullYear(), 0, 1).getDay() +
          1) /
          7
      ),
      month_number: current.getMonth() + 1,
      month_name: current.toLocaleDateString('en-US', { month: 'long' }),
      quarter: Math.ceil((current.getMonth() + 1) / 3),
      year: current.getFullYear(),
      is_weekend: current.getDay() === 0 || current.getDay() === 6,
      is_holiday: false,
    })
    current.setDate(current.getDate() + 1)
  }

  await prisma.dim_dates.createMany({ data: dates })
  console.log(`  ✅ Created ${dates.length} dates`)

  console.log('📊 Creating lead sources...')

  const sources = await prisma.dim_lead_sources.createMany({
    data: [
      { source_name: 'Meta Ads', source_type: 'Paid', is_paid: true },
      { source_name: 'Google Ads', source_type: 'Paid', is_paid: true },
      { source_name: 'TikTok Ads', source_type: 'Paid', is_paid: true },
      { source_name: 'Organic Search', source_type: 'Organic', is_paid: false },
      { source_name: 'Organic Social', source_type: 'Organic', is_paid: false },
      { source_name: 'Direct', source_type: 'Direct', is_paid: false },
      { source_name: 'Referral', source_type: 'Organic', is_paid: false },
      { source_name: 'Email', source_type: 'Owned', is_paid: false },
      { source_name: 'Other', source_type: 'Other', is_paid: false },
    ],
  })
  console.log(`  ✅ Created lead sources`)

  console.log('🎯 Creating campaigns...')

  const campaignData = [
    {
      platform: 'Meta',
      platform_campaign_id: 'meta_001',
      campaign_name: '[META] Captação Leads - TOF',
      campaign_objective: 'LEAD_GENERATION',
      funnel_stage: 'tof',
      utm_source: 'facebook',
      utm_medium: 'cpc',
    },
    {
      platform: 'Meta',
      platform_campaign_id: 'meta_002',
      campaign_name: '[META] Remarketing - MOF',
      campaign_objective: 'CONVERSIONS',
      funnel_stage: 'mof',
      utm_source: 'facebook',
      utm_medium: 'cpc',
    },
    {
      platform: 'Meta',
      platform_campaign_id: 'meta_003',
      campaign_name: '[META] Lookalike - TOF',
      campaign_objective: 'LEAD_GENERATION',
      funnel_stage: 'tof',
      utm_source: 'instagram',
      utm_medium: 'cpc',
    },
    {
      platform: 'Google',
      platform_campaign_id: 'google_001',
      campaign_name: '[GOOGLE] Search - Branded',
      campaign_objective: 'CONVERSIONS',
      funnel_stage: 'bof',
      utm_source: 'google',
      utm_medium: 'cpc',
    },
    {
      platform: 'Google',
      platform_campaign_id: 'google_002',
      campaign_name: '[GOOGLE] Search - Generic',
      campaign_objective: 'LEAD_GENERATION',
      funnel_stage: 'tof',
      utm_source: 'google',
      utm_medium: 'cpc',
    },
    {
      platform: 'Google',
      platform_campaign_id: 'google_003',
      campaign_name: '[GOOGLE] Display - Remarketing',
      campaign_objective: 'CONVERSIONS',
      funnel_stage: 'mof',
      utm_source: 'google',
      utm_medium: 'display',
    },
    {
      platform: 'TikTok',
      platform_campaign_id: 'tiktok_001',
      campaign_name: '[TIKTOK] Awareness - Gen Z',
      campaign_objective: 'AWARENESS',
      funnel_stage: 'tof',
      utm_source: 'tiktok',
      utm_medium: 'cpc',
    },
  ]

  for (const campaign of campaignData) {
    await prisma.dim_campaigns.create({
      data: {
        ...campaign,
        platform_account_id: `act_${random(100000, 999999)}`,
        is_active: true,
        first_seen_date: new Date('2024-01-01'),
        last_seen_date: new Date(),
      },
    })
  }
  console.log(`  ✅ Created ${campaignData.length} campaigns`)

  console.log('📄 Creating landing pages...')

  await prisma.dim_landing_pages.createMany({
    data: [
      {
        page_url: 'https://demo.cortexanalytics.com.br/lp/principal',
        page_name: 'LP Principal',
        page_type: 'form',
        offer_name: 'Consultoria Gratuita',
        is_active: true,
      },
      {
        page_url: 'https://demo.cortexanalytics.com.br/lp/ebook',
        page_name: 'LP Ebook',
        page_type: 'ebook',
        offer_name: 'Ebook Marketing Digital',
        is_active: true,
      },
      {
        page_url: 'https://demo.cortexanalytics.com.br/lp/webinar',
        page_name: 'LP Webinar',
        page_type: 'webinar',
        offer_name: 'Webinar Performance',
        is_active: true,
      },
    ],
  })
  console.log(`  ✅ Created landing pages`)

  // Get created data for references
  const allSources = await prisma.dim_lead_sources.findMany()
  const allCampaigns = await prisma.dim_campaigns.findMany()
  const allLandingPages = await prisma.dim_landing_pages.findMany()

  console.log('👥 Creating leads...')

  const firstNames = [
    'João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Gabriel', 'Beatriz',
    'Rafael', 'Larissa', 'Bruno', 'Camila', 'Diego', 'Fernanda', 'Eduardo',
    'Gabriela', 'Felipe', 'Helena', 'Gustavo', 'Isabela', 'Henrique', 'Laura',
    'Igor', 'Mariana', 'Leonardo', 'Natalia', 'Matheus', 'Patricia', 'Nicolas',
    'Renata', 'Ricardo', 'Sabrina', 'Thiago', 'Vanessa', 'Victor', 'Amanda',
  ]

  const companies = [
    'Tech Solutions', 'Digital Corp', 'Inovare', 'StartupXYZ', 'Agência Flow',
    'E-commerce Brasil', 'Fintech Pro', 'SaaS Master', 'Marketplace Plus',
    'Consultoria ABC', 'Vendas Online', 'Marketing 360', 'Growth Hacking',
    'Performance Media', 'Data Analytics', 'Cloud Services', 'Mobile First',
  ]

  const jobTitles = [
    'CEO', 'CMO', 'Gerente de Marketing', 'Coordenador de Vendas', 'Diretor Comercial',
    'Head de Growth', 'Analista de Marketing', 'Gerente de E-commerce', 'Founder',
    'Head de Performance', 'Gerente de Produto', 'Diretor de Operações',
  ]

  const statuses = ['new', 'contacted', 'qualified', 'converted', 'unqualified']
  const statusWeights = [0.35, 0.25, 0.2, 0.12, 0.08]

  const getWeightedStatus = () => {
    const rand = Math.random()
    let sum = 0
    for (let i = 0; i < statuses.length; i++) {
      sum += statusWeights[i]
      if (rand < sum) return statuses[i]
    }
    return 'new'
  }

  const leadDataStart = new Date('2024-09-01')
  const leadDataEnd = new Date()
  const leads: any[] = []

  for (let i = 0; i < 600; i++) {
    const createdAt = randomDate(leadDataStart, leadDataEnd)
    const dateKey = parseInt(createdAt.toISOString().slice(0, 10).replace(/-/g, ''))
    const status = getWeightedStatus()
    const source = allSources[random(0, allSources.length - 1)]
    const campaign = source.is_paid ? allCampaigns[random(0, allCampaigns.length - 1)] : null
    const landingPage = allLandingPages[random(0, allLandingPages.length - 1)]
    const firstName = firstNames[random(0, firstNames.length - 1)]
    const email = `${firstName.toLowerCase()}${random(1, 999)}@${companies[random(0, companies.length - 1)].toLowerCase().replace(/\s/g, '')}.com.br`

    const lead: any = {
      date_key: dateKey,
      email_hash: hash(email),
      phone_hash: hash(`11${random(900000000, 999999999)}`),
      name_first: firstName,
      company_name: companies[random(0, companies.length - 1)],
      job_title: jobTitles[random(0, jobTitles.length - 1)],
      landing_page_id: landingPage.landing_page_id,
      source_id: source.source_id,
      campaign_id: campaign?.campaign_id || null,
      utm_source: campaign?.utm_source || (source.is_paid ? null : source.source_name.toLowerCase()),
      utm_medium: campaign?.utm_medium || null,
      lead_status: status,
      lead_score: random(20, 100),
      created_at: createdAt,
    }

    // Add status timestamps based on status
    if (['contacted', 'qualified', 'converted'].includes(status)) {
      lead.contacted_at = new Date(createdAt.getTime() + random(1, 24) * 3600000)
    }
    if (['qualified', 'converted'].includes(status)) {
      lead.qualified_at = new Date((lead.contacted_at || createdAt).getTime() + random(1, 72) * 3600000)
    }
    if (status === 'converted') {
      lead.converted_at = new Date((lead.qualified_at || createdAt).getTime() + random(24, 168) * 3600000)
      lead.deal_value = random(5000, 150000)
    }

    leads.push(lead)
  }

  await prisma.fct_leads.createMany({ data: leads })
  console.log(`  ✅ Created ${leads.length} leads`)

  console.log('💰 Creating ad spend data...')

  const spendData: any[] = []
  const spendStart = new Date('2024-09-01')
  const spendEnd = new Date()
  const currentDate = new Date(spendStart)

  while (currentDate <= spendEnd) {
    const dateKey = parseInt(currentDate.toISOString().slice(0, 10).replace(/-/g, ''))

    for (const campaign of allCampaigns) {
      const baseSpend = random(50, 500)
      const impressions = random(1000, 50000)
      const clicks = Math.floor(impressions * (random(5, 30) / 1000))

      spendData.push({
        date_key: dateKey,
        campaign_id: campaign.campaign_id,
        impressions: BigInt(impressions),
        reach: BigInt(Math.floor(impressions * 0.7)),
        clicks: BigInt(clicks),
        link_clicks: BigInt(Math.floor(clicks * 0.8)),
        spend: baseSpend,
        leads_platform: random(0, 10),
        cpm: (baseSpend / impressions) * 1000,
        cpc: baseSpend / clicks,
        ctr: (clicks / impressions) * 100,
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Insert in batches
  const batchSize = 100
  for (let i = 0; i < spendData.length; i += batchSize) {
    const batch = spendData.slice(i, i + batchSize)
    await prisma.fct_ad_spend.createMany({ data: batch })
  }
  console.log(`  ✅ Created ${spendData.length} ad spend records`)

  console.log('🔗 Creating lead attributions...')

  const leadsWithCampaigns = await prisma.fct_leads.findMany({
    where: { campaign_id: { not: null } },
    select: { lead_id: true, campaign_id: true, deal_value: true },
  })

  const attributions = leadsWithCampaigns.map((lead) => ({
    lead_id: lead.lead_id,
    campaign_id: lead.campaign_id!,
    attribution_model: 'last_click',
    attribution_weight: 1.0,
    attributed_value: lead.deal_value,
  }))

  await prisma.fct_lead_attribution.createMany({ data: attributions })
  console.log(`  ✅ Created ${attributions.length} attributions`)

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
