'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import ChartCard from '../../../components/ui/ChartCard'
import BarChart from '../../../components/ui/BarChart'
import MetricBadge from '../../../components/ui/MetricBadge'
import { andhraPradeshStateData } from '../../../lib/mock/states'
import { apDistrictsData } from '../../../lib/mock/districts'
import { AlertIcon, ActivityIcon, PoliceIcon } from '../../../components/icons'
import { apiService } from '../../../services/api'

export default function StateDashboardPage() {
  const state = andhraPradeshStateData
  const [liveIncidentsCount, setLiveIncidentsCount] = useState<number>(0)
  const [liveHospitalsCount, setLiveHospitalsCount] = useState<number>(0)
  const [activeEmergencyTeams, setActiveEmergencyTeams] = useState<number>(state.activeEmergencyTeams)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      apiService.getDashboardOverview(),
      apiService.getFacilities({ facility_type: 'HOSPITAL' })
    ]).then(([overviewRes, facilitiesRes]) => {
      if (!isMounted) return
      setLiveIncidentsCount(overviewRes.active_incidents_count)
      setLiveHospitalsCount(facilitiesRes.total)
      if (overviewRes.resources?.allocated !== undefined) {
        setActiveEmergencyTeams(overviewRes.resources.allocated)
      }
    }).catch(err => {
      console.warn("Offline state dashboard overview loading fallback", err)
    })
    return () => { isMounted = false }
  }, [])

  // Dynamic District Merge (Visakhapatnam District pulls real database coordinates and counts)
  const districts = apDistrictsData.map(d => {
    if (d.name === 'Visakhapatnam') {
      return {
        ...d,
        activeIncidents: liveIncidentsCount || d.activeIncidents,
        hospitalsCount: liveHospitalsCount || d.hospitalsCount
      }
    }
    return d
  })

  const chartData = districts.map(d => ({
    name: d.name,
    incidents: d.activeIncidents,
    hospitals: d.hospitalsCount
  }))

  return (
    <DashboardLayout userRole="dept_head">
      <div className="space-y-6">
        <PageHeader
          title="State Operations Center - Andhra Pradesh"
          description="State-wide emergency dispatches, district statistics, and inter-district asset deployments."
          breadcrumbs={[{ label: 'Home' }, { label: 'State Dashboard' }]}
        />

        {/* 1. State KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Districts Managed"
            value={state.districtsCount}
            description="26 administrative zones"
            icon={<PoliceIcon className="h-5 w-5 text-blue-400" />}
          />
          <StatCard
            title="Active Emergency Teams"
            value={activeEmergencyTeams}
            change={6}
            changeType="increase"
            description="on field duty (DB Live)"
            icon={<ActivityIcon className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            title="State Risk Level"
            value="High Risk"
            description="Coastal Storm Warning"
            icon={<AlertIcon className="h-5 w-5 text-orange-400" />}
            glow={true}
          />
          <StatCard
            title="Emergency Hotlines"
            value="112 Active"
            description="Toll-free 24/7 helpline"
            icon={<ActivityIcon className="h-5 w-5 text-purple-400" />}
          />
        </div>

        {/* 2. District Analytics Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="District Incidents vs Hospital Facilities" description="Active incident load across AP districts">
            <BarChart
              data={chartData}
              xAxisKey="name"
              series={[
                { key: 'incidents', color: '#ef4444', name: 'Incidents' },
                { key: 'hospitals', color: '#10b981', name: 'Hospitals' }
              ]}
            />
          </ChartCard>

          {/* District Table Overview */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
              <h4 className="text-base font-bold text-white tracking-wide">Districts Status Breakdown</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Headquarters</th>
                    <th className="py-2.5 px-3">Active Incidents</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {districts.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">
                        {d.name} {d.name === 'Visakhapatnam' && <span className="text-[8px] text-emerald-400 ml-1.5 border border-emerald-800 px-1 py-0.2 rounded bg-emerald-950/30">DB LIVE</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{d.headquarters}</td>
                      <td className="py-2.5 px-3 font-mono-data font-bold text-red-400">{d.activeIncidents}</td>
                      <td className="py-2.5 px-3">
                        <MetricBadge value={d.riskLevel} type={d.riskLevel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
