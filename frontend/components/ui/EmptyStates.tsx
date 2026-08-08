import React from 'react'
import { 
  AlertIcon, 
  SearchIcon, 
  BellIcon, 
  TrendIcon, 
  DocumentIcon 
} from '../icons'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onActionClick?: () => void
}

/**
 * ------------------------------------------------------------------------
 * Reusable Base Empty State Component
 * ------------------------------------------------------------------------
 */
function BaseEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onActionClick
}: EmptyStateProps & { icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#111827]/20 max-w-md mx-auto my-4 animate-fadeIn">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-4">
        {icon}
      </div>
      <h5 className="text-sm font-bold text-white tracking-wide">{title}</h5>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{description}</p>
      
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/**
 * 1. No Incidents State
 * JSDoc:
 *   Purpose: Displays layout when incident queue is empty.
 *   Props: EmptyStateProps
 */
export function NoIncidents(props: EmptyStateProps) {
  return (
    <BaseEmptyState
      {...props}
      icon={<AlertIcon className="h-6 w-6" />}
    />
  )
}

/**
 * 2. No Alerts State
 * JSDoc:
 *   Purpose: Displays layout when active system emergency alerts count is 0.
 *   Props: EmptyStateProps
 */
export function NoAlerts(props: EmptyStateProps) {
  return (
    <BaseEmptyState
      {...props}
      icon={<DocumentIcon className="h-6 w-6" />}
    />
  )
}

/**
 * 3. No Notifications State
 * JSDoc:
 *   Purpose: Displays layout when notification panel history is clear.
 *   Props: EmptyStateProps
 */
export function NoNotifications(props: EmptyStateProps) {
  return (
    <BaseEmptyState
      {...props}
      icon={<BellIcon className="h-6 w-6" />}
    />
  )
}

/**
 * 4. No Analytics State
 * JSDoc:
 *   Purpose: Displays layout when metrics reports returns zero datasets.
 *   Props: EmptyStateProps
 */
export function NoAnalytics(props: EmptyStateProps) {
  return (
    <BaseEmptyState
      {...props}
      icon={<TrendIcon className="h-6 w-6" />}
    />
  )
}

/**
 * 5. No Search Results State
 * JSDoc:
 *   Purpose: Displays layout when global filters return empty outputs.
 *   Props: EmptyStateProps
 */
export function NoSearchResults(props: EmptyStateProps) {
  return (
    <BaseEmptyState
      {...props}
      icon={<SearchIcon className="h-6 w-6" />}
    />
  )
}
