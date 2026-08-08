'use client'

import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts'

interface BarChartProps {
  data: any[]
  xAxisKey: string
  series: {
    key: string
    color: string
    name?: string
  }[]
}

export default function BarChart({
  data,
  xAxisKey,
  series
}: BarChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="h-full w-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#64748b" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#020617', 
              borderColor: '#1f2937',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#ffffff'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {series.map((s, idx) => (
            <Bar
              key={idx}
              dataKey={s.key}
              name={s.name || s.key}
              fill={s.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
