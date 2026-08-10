'use client'

import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts'

interface AreaChartProps {
  data: any[]
  xAxisKey: string
  series: {
    key: string
    color: string
    name?: string
  }[]
}

export default function AreaChart({
  data,
  xAxisKey,
  series
}: AreaChartProps) {
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
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={idx} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
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
            <Area
              key={idx}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              fillOpacity={1}
              fill={`url(#color-${s.key})`}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
