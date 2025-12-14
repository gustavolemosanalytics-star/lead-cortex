'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Globe,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Lead {
  lead_id: number
  name_first: string | null
  company_name: string | null
  job_title: string | null
  lead_status: string
  lead_score: number | null
  created_at: Date | string
  contacted_at: Date | string | null
  qualified_at: Date | string | null
  converted_at: Date | string | null
  deal_value: number | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  source?: { source_name: string; source_type: string } | null
  campaign?: { campaign_name: string; platform: string; funnel_stage: string } | null
  landing_page?: { page_name: string; page_url: string; offer_name: string } | null
}

interface LeadDetailPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (status: string) => void
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  new: { label: 'Novo', variant: 'info' },
  contacted: { label: 'Contactado', variant: 'warning' },
  qualified: { label: 'Qualificado', variant: 'success' },
  converted: { label: 'Convertido', variant: 'success' },
  unqualified: { label: 'Não Qualificado', variant: 'error' },
}

const statusFlow = ['new', 'contacted', 'qualified', 'converted']

function formatDate(date: Date | string | null) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(value: number | null) {
  if (!value) return 'N/A'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onStatusChange,
}: LeadDetailPanelProps) {
  if (!lead) return null

  const scoreColor =
    (lead.lead_score || 0) >= 70
      ? 'var(--success)'
      : (lead.lead_score || 0) >= 40
      ? 'var(--warning)'
      : 'var(--error)'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg glass-card border-l border-[var(--glass-border)] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--glass-border)] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">
                    {lead.name_first || 'Lead'}
                  </h2>
                  <p className="text-[var(--foreground-muted)]">
                    {lead.company_name || 'Empresa não informada'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Score and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-sm text-[var(--foreground-muted)]">Score</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="var(--glass-border)"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={scoreColor}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(lead.lead_score || 0) * 1.76} 176`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                        style={{ color: scoreColor }}
                      >
                        {lead.lead_score || 0}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      {(lead.lead_score || 0) >= 70
                        ? 'Alta probabilidade'
                        : (lead.lead_score || 0) >= 40
                        ? 'Média probabilidade'
                        : 'Baixa probabilidade'}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-sm text-[var(--foreground-muted)]">Status</span>
                  </div>
                  <Badge
                    variant={statusConfig[lead.lead_status]?.variant || 'default'}
                    className="text-sm"
                  >
                    {statusConfig[lead.lead_status]?.label || lead.lead_status}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Alterar Status</h3>
                <div className="flex flex-wrap gap-2">
                  {statusFlow.map((status) => (
                    <Button
                      key={status}
                      variant={lead.lead_status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onStatusChange(status)}
                      disabled={lead.lead_status === status}
                    >
                      {statusConfig[status].label}
                    </Button>
                  ))}
                  <Button
                    variant={lead.lead_status === 'unqualified' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => onStatusChange('unqualified')}
                    disabled={lead.lead_status === 'unqualified'}
                  >
                    Desqualificar
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Informações</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-sm">{lead.name_first || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-sm">{lead.company_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-sm">{lead.job_title || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[var(--primary)]" />
                    <div>
                      <p className="text-sm font-medium">Criado</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>
                  {lead.contacted_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[var(--warning)]" />
                      <div>
                        <p className="text-sm font-medium">Contactado</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {formatDate(lead.contacted_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  {lead.qualified_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[var(--info)]" />
                      <div>
                        <p className="text-sm font-medium">Qualificado</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {formatDate(lead.qualified_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  {lead.converted_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[var(--success)]" />
                      <div>
                        <p className="text-sm font-medium">Convertido</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {formatDate(lead.converted_at)}
                        </p>
                        {lead.deal_value && (
                          <p className="text-sm text-[var(--success)] font-medium mt-1">
                            {formatCurrency(lead.deal_value)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attribution */}
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Atribuição</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)]">Fonte</span>
                    <span className="text-sm font-medium">
                      {lead.source?.source_name || lead.utm_source || 'Direto'}
                    </span>
                  </div>
                  {lead.campaign && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground-muted)]">Campanha</span>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {lead.campaign.campaign_name}
                      </span>
                    </div>
                  )}
                  {lead.campaign && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground-muted)]">Plataforma</span>
                      <span className="text-sm font-medium">{lead.campaign.platform}</span>
                    </div>
                  )}
                  {lead.landing_page && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground-muted)]">Landing Page</span>
                      <span className="text-sm font-medium">{lead.landing_page.page_name}</span>
                    </div>
                  )}
                  {lead.utm_medium && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground-muted)]">UTM Medium</span>
                      <span className="text-sm font-medium">{lead.utm_medium}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
