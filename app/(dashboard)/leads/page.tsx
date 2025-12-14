'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Trophy,
  Zap,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { LeadTable } from '@/components/dashboard/lead-table'
import { LeadDetailPanel } from '@/components/dashboard/lead-detail-panel'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface LeadFilters {
  search: string
  status: string
  source: string
  campaign: string
  scoreMin: string
  scoreMax: string
}

async function fetchLeads(filters: LeadFilters, page: number, sortBy: string, sortOrder: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    sortBy,
    sortOrder,
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.source && filters.source !== 'all') params.set('source', filters.source)
  if (filters.campaign && filters.campaign !== 'all') params.set('campaign', filters.campaign)
  if (filters.scoreMin) params.set('scoreMin', filters.scoreMin)
  if (filters.scoreMax) params.set('scoreMax', filters.scoreMax)

  const response = await fetch(`/api/leads?${params}`)
  if (!response.ok) throw new Error('Failed to fetch leads')
  return response.json()
}

async function fetchLeadDetail(leadId: number) {
  const response = await fetch(`/api/leads/${leadId}`)
  if (!response.ok) throw new Error('Failed to fetch lead')
  return response.json()
}

async function updateLeadStatus(leadId: number, status: string) {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error('Failed to update lead')
  return response.json()
}

async function bulkUpdateLeads(leadIds: number[], status: string) {
  const response = await fetch('/api/leads', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadIds, status }),
  })
  if (!response.ok) throw new Error('Failed to update leads')
  return response.json()
}

function LeadsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[600px]" />
    </div>
  )
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  new: { label: 'Novo', variant: 'info' },
  contacted: { label: 'Contactado', variant: 'warning' },
  qualified: { label: 'Qualificado', variant: 'success' },
  converted: { label: 'Convertido', variant: 'success' },
  unqualified: { label: 'Não Qualificado', variant: 'error' },
}

export default function LeadsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    source: 'all',
    campaign: 'all',
    scoreMin: '',
    scoreMax: '',
  })
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', filters, page, sortBy, sortOrder],
    queryFn: () => fetchLeads(filters, page, sortBy, sortOrder),
  })

  const { data: selectedLead, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['lead', selectedLeadId],
    queryFn: () => fetchLeadDetail(selectedLeadId!),
    enabled: !!selectedLeadId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: number; status: string }) =>
      updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] })
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ leadIds, status }: { leadIds: number[]; status: string }) =>
      bulkUpdateLeads(leadIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setSelectedLeads([])
    },
  })

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }, [sortBy])

  const handleSelectLead = useCallback((leadId: number) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (!data?.leads) return
    if (selectedLeads.length === data.leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(data.leads.map((lead: any) => lead.lead_id))
    }
  }, [data?.leads, selectedLeads.length])

  const handleFilterChange = useCallback((key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      source: 'all',
      campaign: 'all',
      scoreMin: '',
      scoreMax: '',
    })
    setPage(1)
  }, [])

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.source !== 'all' ||
    filters.campaign !== 'all' ||
    filters.scoreMin ||
    filters.scoreMax

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--error)]">Erro ao carregar leads</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Leads" subtitle="Gestão completa de leads" />

      <div className="p-6 space-y-6">
        {isLoading && !data ? (
          <LeadsSkeleton />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Total</p>
                        <p className="text-2xl font-bold">{data?.stats?.total || 0}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Novos</p>
                        <p className="text-2xl font-bold">{data?.stats?.new || 0}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--info)]/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-[var(--info)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Qualificados</p>
                        <p className="text-2xl font-bold">{data?.stats?.qualified || 0}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-[var(--success)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Convertidos</p>
                        <p className="text-2xl font-bold">{data?.stats?.converted || 0}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-[var(--success)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SpotlightCard className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Score Médio</p>
                        <p className="text-2xl font-bold">{data?.stats?.avgScore || 0}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-[var(--warning)]/20 flex items-center justify-center">
                        <UserX className="h-5 w-5 text-[var(--warning)]" />
                      </div>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            </div>

            {/* Filters and Actions Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <SpotlightCard>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Search and Quick Actions */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
                        <Input
                          placeholder="Buscar por nome, empresa ou cargo..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowFilters(!showFilters)}
                          className={hasActiveFilters ? 'border-[var(--primary)]' : ''}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filtros
                          {hasActiveFilters && (
                            <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                              !
                            </Badge>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => refetch()}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--glass-border)]"
                      >
                        <div>
                          <label className="text-sm text-[var(--foreground-muted)] mb-1 block">
                            Status
                          </label>
                          <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          >
                            <option value="all">Todos</option>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-[var(--foreground-muted)] mb-1 block">
                            Fonte
                          </label>
                          <select
                            value={filters.source}
                            onChange={(e) => handleFilterChange('source', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          >
                            <option value="all">Todas</option>
                            {data?.sources?.map((source: any) => (
                              <option key={source.source_id} value={source.source_id}>
                                {source.source_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-[var(--foreground-muted)] mb-1 block">
                            Campanha
                          </label>
                          <select
                            value={filters.campaign}
                            onChange={(e) => handleFilterChange('campaign', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          >
                            <option value="all">Todas</option>
                            {data?.campaigns?.map((campaign: any) => (
                              <option key={campaign.campaign_id} value={campaign.campaign_id}>
                                {campaign.campaign_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-[var(--foreground-muted)] mb-1 block">
                            Score
                          </label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="Min"
                              min={0}
                              max={100}
                              value={filters.scoreMin}
                              onChange={(e) => handleFilterChange('scoreMin', e.target.value)}
                              className="w-20"
                            />
                            <span className="text-[var(--foreground-muted)]">-</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              min={0}
                              max={100}
                              value={filters.scoreMax}
                              onChange={(e) => handleFilterChange('scoreMax', e.target.value)}
                              className="w-20"
                            />
                          </div>
                        </div>

                        {hasActiveFilters && (
                          <div className="md:col-span-4 flex justify-end">
                            <Button variant="ghost" onClick={handleClearFilters}>
                              <X className="h-4 w-4 mr-2" />
                              Limpar filtros
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Bulk Actions */}
                    {selectedLeads.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 pt-4 border-t border-[var(--glass-border)]"
                      >
                        <span className="text-sm text-[var(--foreground-muted)]">
                          {selectedLeads.length} lead(s) selecionado(s)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => bulkUpdateMutation.mutate({ leadIds: selectedLeads, status: 'contacted' })}
                            disabled={bulkUpdateMutation.isPending}
                          >
                            Marcar Contactado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => bulkUpdateMutation.mutate({ leadIds: selectedLeads, status: 'qualified' })}
                            disabled={bulkUpdateMutation.isPending}
                          >
                            Marcar Qualificado
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => bulkUpdateMutation.mutate({ leadIds: selectedLeads, status: 'unqualified' })}
                            disabled={bulkUpdateMutation.isPending}
                          >
                            Desqualificar
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </SpotlightCard>
            </motion.div>

            {/* Leads Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SpotlightCard>
                <CardContent className="pt-6">
                  {data?.leads && (
                    <LeadTable
                      leads={data.leads}
                      pagination={data.pagination}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      selectedLeads={selectedLeads}
                      onSort={handleSort}
                      onPageChange={setPage}
                      onSelectLead={handleSelectLead}
                      onSelectAll={handleSelectAll}
                      onViewLead={setSelectedLeadId}
                      onEditLead={setSelectedLeadId}
                    />
                  )}
                </CardContent>
              </SpotlightCard>
            </motion.div>
          </>
        )}
      </div>

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        isOpen={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onStatusChange={(status) => {
          if (selectedLeadId) {
            updateStatusMutation.mutate({ leadId: selectedLeadId, status })
          }
        }}
      />
    </div>
  )
}
