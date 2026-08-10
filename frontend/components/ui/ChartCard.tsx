import React from 'react'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function ChartCard({
  title,
  description,
  children,
  actions
}: ChartCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      <div className="flex-1 w-full min-h-[280px] flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
