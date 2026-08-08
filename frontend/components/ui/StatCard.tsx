import React from 'react'
import { TrendIcon } from '../icons'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  description?: string
  glow?: boolean
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeType = 'increase',
  description,
  glow = false
}: StatCardProps) {
  const isTrendUp = changeType === 'increase'
  const isTrendDown = changeType === 'decrease'

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-6 ${glow ? 'animate-pulse-glow border-blue-500/30' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/40 text-blue-400 border border-blue-900/30">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight text-white font-mono-data">{value}</h3>
        
        {(change !== undefined || description) && (
          <div className="mt-2 flex items-center space-x-2">
            {change !== undefined && (
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                isTrendUp ? 'bg-green-950/30 text-green-400 border border-green-900/30' : 
                isTrendDown ? 'bg-red-950/30 text-red-400 border border-red-900/30' : 
                'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {isTrendUp ? '+' : ''}{change}%
                <TrendIcon className={`ml-1 h-3 w-3 ${isTrendDown ? 'rotate-180' : ''}`} />
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
