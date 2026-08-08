'use client'

import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts'

interface PieChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export default function PieChart({ data }: PieChartProps) {
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
    <div className="h-full w-full min-h-[250px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#020617',
              borderColor: '#1f2937',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#ffffff'
            }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#050816" strokeWidth={2} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
