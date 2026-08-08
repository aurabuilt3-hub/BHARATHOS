'use client'

import React, { useState } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import MetricBadge from '../../../components/ui/MetricBadge'
import AISummaryWidget from '../../../components/widgets/AISummaryWidget'
import ResourceWidget from '../../../components/widgets/ResourceWidget'

import { AlertIcon, ActivityIcon, PoliceIcon, TrendIcon } from '../../../components/icons'
import { visakhapatnamIncidentsData } from '../../../lib/mock/incidents'

type ExecutiveRole = 'collector' | 'commissioner' | 'chief_sec' | 'chief_min' | 'ndma' | 'disaster'

export default function ExecutiveDashboardPage() {
  const [executiveRole, setExecutiveRole] = useState<ExecutiveRole>('collector')

  const criticalCount = visakhapatnamIncidentsData.filter(i => i.severity === 'critical').length
  const activeCount = visakhapatnamIncidentsData.filter(i => i.status === 'active').length

  const getRoleConfig = (role: ExecutiveRole) => {
    switch (role) {
      case 'ndma':
        return {
          title: 'National Disaster Management Authority (NDMA)',
          kpiLabel: 'National Rescue Staging',
          kpiValue: '18 Battalions'
        }
      case 'chief_min':
        return {
          title: 'Andhra Pradesh Chief Minister Command Suite',
          kpiLabel: 'CM Special Relief Fund',
          kpiValue: 'Active Allocation'
        }
      case 'chief_sec':
        return {
          title: 'State Chief Secretary Operations Dashboard',
          kpiLabel: 'Inter-Agency Compliance',
          kpiValue: '98.4% Rating'
        }
      case 'commissioner':
        return {
          title: 'GVMC Municipal Commissioner Command Console',
          kpiLabel: 'Municipal Drains Clear',
          kpiValue: '92.6% Cleaned'
        }
      case 'disaster':
        return {
          title: 'State Disaster Management Authority Command Center',
          kpiLabel: 'Coastal Estuary Inflow',
          kpiValue: 'Normal Sluice Gates'
        }
      case 'collector':
      default:
        return {
          title: 'Visakhapatnam District Collector situational Summary',
          kpiLabel: 'Collector Hotline Index',
          kpiValue: '99.8% Online'
        }
    }
  }

  const roleConfig = getRoleConfig(executiveRole)

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <PageHeader
          title="Executive Command Intelligence Room"
          description="Situational awareness, inter-agency resource allocations, and AI-assisted governance control parameters."
          breadcrumbs={[{ label: 'Home' }, { label: 'Executive Dashboard' }]}
          actions={
            <div className="flex border border-slate-800 rounded-xl bg-[#050816] p-1 text-xs select-none">
              {(['collector', 'commissioner', 'chief_sec', 'chief_min', 'ndma', 'disaster'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setExecutiveRole(r)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                    executiveRole === r
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          }
        />

        {/* Dynamic Executive Context Banner */}
        <div className="glass-panel border-l-4 border-l-blue-500 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 font-mono-data">
              Active Executive Context: {executiveRole.toUpperCase()}
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">
              {roleConfig.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Command level data synced to National, State, and Municipal SCADA sensor networks.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-900/40 px-3 py-1.5 rounded-xl font-mono-data animate-pulse">
              🚨 {criticalCount} Severe Emergency Vectors Active
            </span>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Unresolved Tickets"
            value={activeCount}
            change={2.1}
            changeType="increase"
            description="pending department dispatch"
            icon={<AlertIcon className="h-5 w-5 text-red-400" />}
            glow={true}
          />
          <StatCard
            title="Inter-Agency Response Rate"
            value="94.2%"
            change={1.5}
            changeType="increase"
            description="resolution index"
            icon={<TrendIcon className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            title={roleConfig.kpiLabel}
            value={roleConfig.kpiValue}
            description="Operational Index status"
            icon={<PoliceIcon className="h-5 w-5 text-blue-400" />}
          />
          <StatCard
            title="Disaster Emergency Level"
            value="Level 2 Alert"
            description="Monsoonal storm warning"
            icon={<ActivityIcon className="h-5 w-5 text-purple-400" />}
          />
        </div>

        {/* AI Advisory Plan & Resource Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AISummaryWidget />
          <ResourceWidget />
        </div>

        {/* Executive Incident Table */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h4 className="text-base font-bold text-white tracking-wide">High Priority Action Queue</h4>
            <span className="text-xs text-slate-500 font-mono-data">Filtered for Senior Leadership</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title & Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {visakhapatnamIncidentsData.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-400 font-mono-data">{inc.id}</td>
                    <td className="py-3 px-4 text-slate-300 font-bold">{inc.category}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{inc.title}</span>
                      <span className="text-[10px] text-slate-500">{inc.location}</span>
                    </td>
                    <td className="py-3 px-4">
                      <MetricBadge value={inc.severity} type={inc.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono-data bg-blue-950/40 border-blue-900/30 text-blue-400">
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{inc.assignedDepartment || 'Pending Assignment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
