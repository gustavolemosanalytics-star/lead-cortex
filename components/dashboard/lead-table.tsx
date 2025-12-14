'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

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
  source?: { source_name: string } | null
  campaign?: { campaign_name: string; platform: string } | null
}

interface LeadTableProps {
  leads: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedLeads: number[]
  onSort: (field: string) => void
  onPageChange: (page: number) => void
  onSelectLead: (leadId: number) => void
  onSelectAll: () => void
  onViewLead: (leadId: number) => void
  onEditLead: (leadId: number) => void
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  new: { label: 'Novo', variant: 'info' },
  contacted: { label: 'Contactado', variant: 'warning' },
  qualified: { label: 'Qualificado', variant: 'success' },
  converted: { label: 'Convertido', variant: 'success' },
  unqualified: { label: 'Não Qualificado', variant: 'error' },
}

function SortIcon({ field, currentSort, sortOrder }: { field: string; currentSort: string; sortOrder: 'asc' | 'desc' }) {
  if (currentSort !== field) {
    return <ChevronUp className="h-4 w-4 opacity-30" />
  }
  return sortOrder === 'asc' ? (
    <ChevronUp className="h-4 w-4 text-[var(--primary)]" />
  ) : (
    <ChevronDown className="h-4 w-4 text-[var(--primary)]" />
  )
}

export function LeadTable({
  leads,
  pagination,
  sortBy,
  sortOrder,
  selectedLeads,
  onSort,
  onPageChange,
  onSelectLead,
  onSelectAll,
  onViewLead,
  onEditLead,
}: LeadTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const allSelected = leads.length > 0 && selectedLeads.length === leads.length
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-[var(--glass-border)]">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
              <th className="p-4 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onSelectAll}
                />
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => onSort('name_first')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Nome
                  <SortIcon field="name_first" currentSort={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => onSort('company_name')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Empresa
                  <SortIcon field="company_name" currentSort={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="p-4 text-left">
                <span className="text-sm font-medium text-[var(--foreground-muted)]">Fonte</span>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => onSort('lead_status')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Status
                  <SortIcon field="lead_status" currentSort={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => onSort('lead_score')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Score
                  <SortIcon field="lead_score" currentSort={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => onSort('created_at')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Data
                  <SortIcon field="created_at" currentSort={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="p-4 text-center w-20">
                <span className="text-sm font-medium text-[var(--foreground-muted)]">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {leads.map((lead, index) => (
                <motion.tr
                  key={lead.lead_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-[var(--glass-border)] transition-colors ${
                    selectedLeads.includes(lead.lead_id)
                      ? 'bg-[var(--primary)]/10'
                      : hoveredRow === lead.lead_id
                      ? 'bg-[var(--glass-bg)]'
                      : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(lead.lead_id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedLeads.includes(lead.lead_id)}
                      onChange={() => onSelectLead(lead.lead_id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--foreground)]">
                        {lead.name_first || 'N/A'}
                      </span>
                      {lead.job_title && (
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {lead.job_title}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--foreground-muted)]">
                    {lead.company_name || 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm">{lead.source?.source_name || lead.utm_source || 'Direto'}</span>
                      {lead.campaign && (
                        <span className="text-xs text-[var(--foreground-muted)] truncate max-w-[150px]">
                          {lead.campaign.platform}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={statusConfig[lead.lead_status]?.variant || 'default'}>
                      {statusConfig[lead.lead_status]?.label || lead.lead_status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-[var(--glass-bg)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${lead.lead_score || 0}%`,
                            background:
                              (lead.lead_score || 0) >= 70
                                ? 'var(--success)'
                                : (lead.lead_score || 0) >= 40
                                ? 'var(--warning)'
                                : 'var(--error)',
                          }}
                        />
                      </div>
                      <span className="text-sm text-[var(--foreground-muted)] w-8">
                        {lead.lead_score || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--foreground-muted)] text-sm">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewLead(lead.lead_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditLead(lead.lead_id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--foreground-muted)]">
          Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
          {pagination.total} leads
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum: number
            if (pagination.totalPages <= 5) {
              pageNum = i + 1
            } else if (pagination.page <= 3) {
              pageNum = i + 1
            } else if (pagination.page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i
            } else {
              pageNum = pagination.page - 2 + i
            }
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
