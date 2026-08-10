import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '../icons'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs: BreadcrumbItem[]
  actions?: React.ReactNode
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 mb-6 space-y-4 md:space-y-0">
      <div className="space-y-1.5">
        {/* Breadcrumbs Navigation */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <React.Fragment key={idx}>
                  {crumb.path && !isLast ? (
                    <Link href={crumb.path} className="hover:text-slate-300 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-slate-400 font-semibold' : ''}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRightIcon className="h-3 w-3 text-slate-600" />}
                </React.Fragment>
              )
            })}
          </nav>
        )}

        {/* Title and Subtitle */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
          {description && (
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{description}</p>
          )}
        </div>
      </div>

      {/* Floating Action Elements (like Create Button) */}
      {actions && (
        <div className="flex items-center space-x-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
