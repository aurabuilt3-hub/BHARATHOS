import React from 'react'

interface MetricBadgeProps {
  value: string
  type?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success'
}

export default function MetricBadge({
  value,
  type = 'info'
}: MetricBadgeProps) {
  
  const getBadgeStyles = (t: string) => {
    switch (t) {
      case 'critical':
        return 'text-red-400 bg-red-950/40 border-red-900/30'
      case 'high':
        return 'text-orange-400 bg-orange-950/40 border-orange-900/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30'
      case 'low':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
      case 'success':
        return 'text-green-400 bg-green-950/40 border-green-900/30'
      case 'info':
      default:
        return 'text-blue-400 bg-blue-950/40 border-blue-900/30'
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider font-mono-data ${
      getBadgeStyles(type)
    }`}>
      {value}
    </span>
  )
}
