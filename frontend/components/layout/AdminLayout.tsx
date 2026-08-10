import React from 'react'
import DashboardLayout from './DashboardLayout'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout userRole="admin">
      <div className="border border-red-900/40 bg-red-950/5 rounded-xl px-4 py-2 mb-4 text-xs font-semibold text-red-400 max-w-max uppercase tracking-wider">
        System Admin Scope
      </div>
      {children}
    </DashboardLayout>
  )
}
