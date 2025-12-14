'use client'

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DataPoint {
  name: string
  value: number
  color: string
}

interface SourcePieChartProps {
  data: DataPoint[]
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass-card p-3 rounded-lg border border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-[var(--foreground)]">{data.name}</span>
        </div>
        <p className="text-lg font-bold text-[var(--foreground)] mt-1">
          {data.value.toLocaleString('pt-BR')} leads
        </p>
        <p className="text-sm text-[var(--foreground-muted)]">
          {((data.value / payload[0].payload.total) * 100).toFixed(1)}% do total
        </p>
      </div>
    )
  }
  return null
}

const renderCustomLegend = (props: any) => {
  const { payload } = props
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-[var(--foreground-muted)]">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function SourcePieChart({ data, height = 300 }: SourcePieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  const dataWithTotal = data.map((item) => ({ ...item, total }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderCustomLegend} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
