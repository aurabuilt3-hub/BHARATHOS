'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import ChartCard from '../../../components/ui/ChartCard'
import AreaChart from '../../../components/ui/AreaChart'
import BarChart from '../../../components/ui/BarChart'
import PieChart from '../../../components/ui/PieChart'
import LineChart from '../../../components/ui/LineChart'
import ScenarioSimulatorWidget from '../../../components/widgets/ScenarioSimulatorWidget'
import { KPIEngine } from '../../../lib/analytics/kpiEngine'
import { ForecastEngine } from '../../../lib/analytics/forecastEngine'
import { TrendEngine } from '../../../lib/analytics/trendEngine'
import { DepartmentEngine } from '../../../lib/analytics/departmentEngine'
import { ReportExporter } from '../../../lib/reportExporter'
import { incidentCategoryPieData, responseTimeHistoryData } from '../../../lib/mock/analytics'
import { TrendIcon, ActivityIcon, AlertIcon } from '../../../components/icons'
import { apiService, DashboardOverview } from '../../../services/api'

export default function StrategicAnalyticsPage() {
  const kpis = KPIEngine.calculateSummary()
  const forecasts = ForecastEngine.getPredictiveForecasts()
  const weeklyTrends = TrendEngine.getWeeklyTrendData()
  const deptPerformance = DepartmentEngine.getDepartmentPerformanceData()

  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    Promise.all([
      apiService.getIncidents({ limit: 200 }),
      apiService.getDashboardOverview()
    ]).then(([incidentsRes, overviewRes]) => {
      if (!isMounted) return
      setIncidents(incidentsRes)
      setOverview(overviewRes)
      setLoading(false)
    }).catch(err => {
      console.warn("Analytics data fetch fallback active", err)
      if (isMounted) setLoading(false)
    })
    return () => { isMounted = false }
  }, [])

  // Dynamically calculate pie categories from active database incidents
  const categoryCounts = incidents.reduce((acc: Record<string, number>, inc) => {
    const cat = String(inc.category || 'Other').trim()
    const capitalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
    acc[capitalized] = (acc[capitalized] || 0) + 1
    return acc
  }, {})

  const chartColors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#a855f7', '#06b6d4']
  const dynamicPieData = Object.keys(categoryCounts).map((cat, idx) => ({
    name: cat,
    value: categoryCounts[cat],
    color: chartColors[idx % chartColors.length],
    fill: chartColors[idx % chartColors.length]
  }))

  const finalPieData = dynamicPieData.length > 0 ? dynamicPieData : incidentCategoryPieData

  const handleExportCSV = () => {
    ReportExporter.exportToCSV('BharatOS_Analytics_Report', weeklyTrends)
  }

  const handleExportPDF = () => {
    ReportExporter.exportToPDF('BharatOS Strategic Analytics Executive Report')
  }

  // Dynamic values derived from overview
  const sensorHealth = overview?.telemetry?.status === 'active' ? 100 : kpis.sensorHealthPercent
  const sensorCount = overview?.telemetry?.total_records !== undefined ? `${overview.telemetry.total_records} Logs` : '98 active'
  const resolutionRate = overview?.active_incidents_count !== undefined && overview?.total_incidents_count 
    ? Math.round(((overview.total_incidents_count - overview.active_incidents_count) / overview.total_incidents_count) * 100) 
    : kpis.resolutionRatePercent

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 print:p-0">
        <PageHeader
          title="Strategic Analytics & Decision Intelligence"
          description="Operational KPI metrics, predictive AI disaster forecasting, scenario simulations, and downloadable reports."
          breadcrumbs={[{ label: 'Home' }, { label: 'Strategic Analytics' }]}
          actions={
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              >
                📊 Export CSV Data
              </button>
              <button
                onClick={handleExportPDF}
                className="px-3 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30"
              >
                📄 Print / Export PDF
              </button>
            </div>
          }
        />

        {/* 1. KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Avg Incident Response Time"
            value={`${kpis.avgResponseTimeMinutes} mins`}
            change={1.8}
            changeType="decrease"
            description="target: <15.0 mins"
            icon={<TrendIcon className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            title="Incident Resolution Rate"
            value={`${resolutionRate}%`}
            change={2.4}
            changeType="increase"
            description="overall completion rate (DB Live)"
            icon={<ActivityIcon className="h-5 w-5 text-blue-400" />}
            glow={true}
          />
          <StatCard
            title="Critical Incident Ratio"
            value={`${kpis.criticalIncidentRatio}%`}
            change={0.4}
            changeType="decrease"
            description="high-risk incident proportion"
            icon={<AlertIcon className="h-5 w-5 text-orange-400" />}
          />
          <StatCard
            title="IoT Telemetry Health"
            value={`${sensorHealth}%`}
            change={0.1}
            changeType="increase"
            description={`${sensorCount} registered (DB Live)`}
            icon={<AlertIcon className="h-5 w-5 text-cyan-400" />}
          />
        </div>

        {/* 2. Scenario Simulator Widget */}
        <ScenarioSimulatorWidget />

        {/* 3. Predictive AI Forecasting Cards */}
        <div className="glass-panel border-l-4 border-l-purple-500 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <ActivityIcon className="h-5 w-5 text-purple-400 animate-pulse" />
              <h4 className="text-base font-bold text-white tracking-wide">Predictive AI Risk Forecasts (Gemini 2.5 Pro)</h4>
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-950/40 border border-purple-900/30 px-3 py-1 rounded-full font-mono-data">
              Predictive Models Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecasts.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-800 bg-[#050816] p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{f.timeframe}</span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono-data bg-emerald-950/40 border border-emerald-900/20 px-1.5 py-0.5 rounded">
                      {f.confidence}% Confidence
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white mt-2">{f.title}</h5>
                  <p className="text-[11px] text-purple-300 mt-1 font-mono-data leading-relaxed">{f.metric}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 space-y-1">
                  <p><span className="font-bold text-white">Action:</span> {f.recommendation}</p>
                  <p><span className="font-bold text-emerald-400">Impact:</span> {f.expectedImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Incident Category Breakdown" description="Proportional volume across all logged categories">
            <PieChart data={finalPieData} />
          </ChartCard>

          <ChartCard title="Department Resolution Efficiency" description="Dispatched vs Resolved ticket metrics">
            <BarChart
              data={deptPerformance}
              xAxisKey="department"
              series={[
                { key: 'dispatched', color: '#3b82f6', name: 'Dispatched' },
                { key: 'resolved', color: '#10b981', name: 'Resolved' }
              ]}
            />
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  )
}
