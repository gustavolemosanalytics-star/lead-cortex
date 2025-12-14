'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'

interface BarChartProps {
  data: any[]
  dataKey: string
  xAxisKey: string
  height?: number
  color?: string
  colors?: string[]
  showLegend?: boolean
  formatValue?: (value: number) => string
  formatLabel?: (value: string) => string
}

const defaultColors = ['#7c3aed', '#3b82f6', '#22d3ee', '#22c55e', '#f59e0b', '#ec4899']

export function BarChartComponent({
  data,
  dataKey,
  xAxisKey,
  height = 300,
  color = '#7c3aed',
  colors,
  showLegend = false,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  formatLabel = (v) => v,
}: BarChartProps) {
  const useColors = colors || defaultColors

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--foreground-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatLabel}
        />
        <YAxis
          stroke="var(--foreground-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: 'var(--foreground)' }}
          formatter={(value: number) => [formatValue(value), dataKey]}
        />
        {showLegend && <Legend />}
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors ? useColors[index % useColors.length] : color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

interface MultiBarChartProps {
  data: any[]
  bars: { dataKey: string; name: string; color: string }[]
  xAxisKey: string
  height?: number
  showLegend?: boolean
  formatValue?: (value: number) => string
}

export function MultiBarChart({
  data,
  bars,
  xAxisKey,
  height = 300,
  showLegend = true,
  formatValue = (v) => v.toLocaleString('pt-BR'),
}: MultiBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--foreground-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--foreground-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: 'var(--foreground)' }}
          formatter={(value: number, name: string) => [formatValue(value), name]}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'var(--foreground-muted)' }}>{value}</span>}
          />
        )}
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
