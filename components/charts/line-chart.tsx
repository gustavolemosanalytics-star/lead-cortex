'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineChartProps {
  data: any[]
  lines: { dataKey: string; name: string; color: string }[]
  xAxisKey: string
  height?: number
  showLegend?: boolean
  formatValue?: (value: number) => string
  formatLabel?: (value: string) => string
}

export function LineChartComponent({
  data,
  lines,
  xAxisKey,
  height = 300,
  showLegend = true,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  formatLabel = (v) => {
    if (v.includes('-')) {
      const parts = v.split('-')
      return `${parts[2]}/${parts[1]}`
    }
    return v
  },
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          formatter={(value: number, name: string) => [formatValue(value), name]}
          labelFormatter={formatLabel}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'var(--foreground-muted)' }}>{value}</span>}
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: line.color }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
