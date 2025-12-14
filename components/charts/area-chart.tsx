'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DataPoint {
  date: string
  leads: number
  qualified?: number
  converted?: number
}

interface LeadsAreaChartProps {
  data: DataPoint[]
  showQualified?: boolean
  showConverted?: boolean
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-[var(--glass-border)]">
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">
          {format(new Date(label), "dd 'de' MMMM", { locale: ptBR })}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--foreground-muted)]">{entry.name}:</span>
            <span className="font-medium text-[var(--foreground)]">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function LeadsAreaChart({
  data,
  showQualified = true,
  showConverted = false,
  height = 300,
}: LeadsAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="qualifiedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="convertedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.3)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString('pt-BR')}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="leads"
          name="Total Leads"
          stroke="#7c3aed"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#leadsGradient)"
        />
        {showQualified && (
          <Area
            type="monotone"
            dataKey="qualified"
            name="Qualificados"
            stroke="#22d3ee"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#qualifiedGradient)"
          />
        )}
        {showConverted && (
          <Area
            type="monotone"
            dataKey="converted"
            name="Convertidos"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#convertedGradient)"
          />
        )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
