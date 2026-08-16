'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import ChartCard from '../../../components/ui/ChartCard'
import LineChart from '../../../components/ui/LineChart'
import { apiService } from '../../../services/api'
import { CloudRain, AlertTriangle, AlertCircle, Info, TrendingUp, HelpCircle, Thermometer } from 'lucide-react'

// Month names list
const MONTHS_MAP: Record<number, string> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
}

// Crop fields for physical demo mapping
const CROPS = [
  { name: 'Paddy / Rice', type: 'High water requirement, vulnerable to root rot if fully submerged' },
  { name: 'Maize / Corn', type: 'Moderate water requirement, very sensitive to standing water' },
  { name: 'Sugarcane', type: 'High tolerance, but high waterlogging affects sucrose yield' },
  { name: 'Chilli / Peppers', type: 'Low tolerance, waterlogging leads to wilting and disease' },
  { name: 'Cotton', type: 'Sensitive, standing water causes square shedding and root disease' },
  { name: 'Groundnut', type: 'Low tolerance, waterlogging damages pod development' },
  { name: 'Black Gram / Pulses', type: 'Extremely sensitive, standing water destroys roots in 24h' },
  { name: 'Millets', type: 'Low water requirement, susceptible to rot under heavy waterlogging' },
  { name: 'Tobacco', type: 'Low tolerance, waterlogging causes immediate leaf decay' }
]

export default function RuralDashboardPage() {
  const [baseline, setBaseline] = useState<any>(null)
  const [loadingBaseline, setLoadingBaseline] = useState(true)
  const [simLoading, setSimLoading] = useState(false)
  const [simResult, setSimResult] = useState<any>(null)
  const [simError, setSimError] = useState<string | null>(null)

  // Simulation input state
  const [selectedMonth, setSelectedMonth] = useState<number>(5) // Default to May
  const [rainfallScenario, setRainfallScenario] = useState<number>(12.0) // Default to 12mm/day

  // Offline/Fallback baseline data if API is offline
  const fallbackBaseline = {
    district: 'Visakhapatnam',
    total_records: 175,
    date_range: { start: '2025-01-01', end: '2025-06-30' },
    percentiles: { p50: 0.065, p75: 2.13, p90: 8.59, p95: 11.50, p99: 15.40 },
    monthly_stats: [
      { month: 1, record_count: 31, avg_rainfall: 0.0016, max_rainfall: 0.028, std_rainfall: 0.0052 },
      { month: 2, record_count: 26, avg_rainfall: 0.0096, max_rainfall: 0.196, std_rainfall: 0.0384 },
      { month: 3, record_count: 31, avg_rainfall: 0.256, max_rainfall: 2.293, std_rainfall: 0.564 },
      { month: 4, record_count: 30, avg_rainfall: 1.771, max_rainfall: 8.876, std_rainfall: 2.540 },
      { month: 5, record_count: 27, avg_rainfall: 8.358, max_rainfall: 54.016, std_rainfall: 10.244 },
      { month: 6, record_count: 30, avg_rainfall: 4.004, max_rainfall: 15.224, std_rainfall: 4.298 }
    ],
    agency_name: 'NRSC VIC MODEL',
    source_type: 'HISTORICAL_DATASET'
  }

  // Load baseline statistics
  useEffect(() => {
    setLoadingBaseline(true)
    apiService.getRuralBaseline()
      .then(res => {
        setBaseline(res)
        setLoadingBaseline(false)
      })
      .catch(err => {
        console.warn('Rural baseline API offline. Using built-in fallback.', err)
        setBaseline(fallbackBaseline)
        setLoadingBaseline(false)
      })
  }, [])

  // Trigger scenario simulation
  useEffect(() => {
    setSimLoading(true)
    setSimError(null)
    apiService.runRuralSimulation(selectedMonth, rainfallScenario)
      .then(res => {
        setSimResult(res)
        setSimLoading(false)
      })
      .catch(err => {
        console.warn('Simulation API offline. Generating local scenario assessment.', err)
        // Perform local simulation logic in case of offline fallback
        const base = baseline || fallbackBaseline
        const mStat = base.monthly_stats.find((m: any) => m.month === selectedMonth) || base.monthly_stats[4]
        const p75 = base.percentiles.p75
        const p90 = base.percentiles.p90
        const p99 = base.percentiles.p99

        let riskLevel = 'LOW'
        if (rainfallScenario > p99) riskLevel = 'CRITICAL'
        else if (rainfallScenario > p90) riskLevel = 'HIGH'
        else if (rainfallScenario > p75) riskLevel = 'MEDIUM'

        const mean = mStat.avg_rainfall
        const std = mStat.std_rainfall
        const zScore = std > 0 ? (rainfallScenario - mean) / std : 0.0
        const pctDev = mean > 0 ? ((rainfallScenario - mean) / mean) * 100.0 : 0.0

        const drivers = []
        const evidence = [
          `Scenario rainfall: ${rainfallScenario.toFixed(2)} mm/day vs. Monthly average: ${mean.toFixed(2)} mm/day.`,
          `Z-score: ${zScore.toFixed(2)} standard deviations from the monthly mean.`,
          `Percentile thresholds: P75=${p75.toFixed(2)}mm, P90=${p90.toFixed(2)}mm, P99=${p99.toFixed(2)}mm.`
        ]

        if (rainfallScenario > p99) {
          drivers.append('Extreme rainfall event exceeding the 99th percentile of historical records.')
        } else if (rainfallScenario > p90) {
          drivers.append('Heavy rainfall event exceeding the 90th percentile of historical records.')
        }
        if (rainfallScenario > mStat.max_rainfall) {
          drivers.append(`Scenario rainfall exceeds the historical maximum observed for Month ${selectedMonth} (${mStat.max_rainfall.toFixed(2)} mm/day).`)
        }
        if (zScore > 1.5) {
          drivers.append(`Moderate precipitation anomaly detected (Z-score > 1.5).`)
        }
        if (drivers.length === 0) {
          drivers.push('Rainfall is within normal historical baseline fluctuations.')
        }

        let agImpact = []
        if (riskLevel === 'LOW') {
          agImpact = [
            'Potential agricultural impact: Minimal.',
            'Sufficient crop watering under normal absorption conditions.',
            'Precautions: Standard agricultural monitoring is sufficient.'
          ]
        } else if (riskLevel === 'MEDIUM') {
          agImpact = [
            'Potential agricultural impact: Minor waterlogging risk in low-lying fields.',
            'Increased soil moisture may affect recently sown crops.',
            'Precautions: Monitor crop roots for water congestion. Clear secondary drainage trenches.'
          ]
        } else if (riskLevel === 'HIGH') {
          agImpact = [
            'Potential agricultural impact: Moderate to severe waterlogging across field zones.',
            'High moisture levels risk spoiling chemical applications and rotting crop roots.',
            'Precautions: Clear all main field drainage outlets. Postpone chemical sprays. Move harvested crops to elevated storage.'
          ]
        } else {
          agImpact = [
            'Potential agricultural impact: Extensive waterlogging and localized agricultural field flooding.',
            'High risk of crop root rot, topsoil erosion, and crop washing.',
            'Precautions: Execute emergency field drainage. Protect harvested seedbeds immediately. Postpone all planting.'
          ]
        }

        const mockAiAdvise = `### AI-DERIVED RECOMMENDATION

**Risk Explanation:** The simulated scenario of **${rainfallScenario.toFixed(2)} mm/day** in **${MONTHS_MAP[selectedMonth]}** creates a **${riskLevel}** risk situation. This represents a deviation of **${pctDev.toFixed(1)}%** from the seasonal baseline, with a statistical z-score of **${zScore.toFixed(2)}**.

**Agricultural Precautions:**
- Farmers cultivating recently sown pulses or tobacco should initiate emergency soil drainage.
- Postpone scheduled pesticide and fertilizer applications to prevent run-off.
- Cover and secure all harvested fodder and grain storage bags.

**Authority Recommendations:**
- Alert Panchayat extension officers to monitor low-lying agricultural zones.
- Release advisory notices via community radio regarding drainage maintenance.

**Communication Guidelines:**
- *Advisory Message Template:* "Panchayat Advisory: Expected rainfall exceeds seasonal average. Clear field channels. Protect seedbeds."`

        setSimResult({
          location: 'Visakhapatnam Rural',
          risk_level: riskLevel,
          scenario: { month: selectedMonth, rainfall_mm: rainfallScenario },
          historical_baseline: {
            monthly_avg_mm: mean,
            monthly_max_mm: mStat.max_rainfall,
            monthly_std_mm: std,
            percentiles: base.percentiles
          },
          metrics: { z_score: zScore, pct_deviation: pctDev, is_anomaly: zScore > 1.0 },
          risk_drivers: drivers,
          evidence,
          agricultural_impact: agImpact,
          ai_recommendation: mockAiAdvise,
          agency_name: 'NRSC VIC MODEL',
          source_type: 'HISTORICAL_DATASET'
        })
        setSimLoading(false)
      })
  }, [selectedMonth, rainfallScenario, baseline])

  // Process data for baseline line chart
  const getChartData = () => {
    if (!baseline || !baseline.monthly_stats) return []
    return baseline.monthly_stats.map((m: any) => ({
      name: MONTHS_MAP[m.month]?.substring(0, 3) || `M${m.month}`,
      'Average Rainfall': parseFloat(m.avg_rainfall.toFixed(2)),
      'Max Rainfall': parseFloat(m.max_rainfall.toFixed(2))
    }))
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
      case 'MEDIUM': return 'bg-yellow-950/60 border-yellow-800 text-yellow-400'
      case 'HIGH': return 'bg-orange-950/60 border-orange-800 text-orange-400 animate-pulse'
      case 'CRITICAL': return 'bg-red-950/60 border-red-800 text-red-400 animate-pulse'
      default: return 'bg-slate-950 border-slate-800 text-slate-400'
    }
  }

  const getFieldWaterLevelColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'bg-emerald-900/10 border-emerald-900/30'
      case 'MEDIUM': return 'bg-yellow-950/30 border-yellow-800/40'
      case 'HIGH': return 'bg-blue-900/40 border-blue-700/50'
      case 'CRITICAL': return 'bg-blue-950 border-blue-500'
      default: return 'bg-slate-900/30'
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-slate-950">
        
        <PageHeader 
          title="Rural Flood Intelligence" 
          description="Visakhapatnam District — Agricultural Flood-Risk Anomaly Assessment"
          breadcrumbs={[
            { label: 'India', path: '/dashboard/national' },
            { label: 'Andhra Pradesh', path: '/dashboard/state' },
            { label: 'Visakhapatnam', path: '/dashboard/city' },
            { label: 'Rural Intelligence' }
          ]}
          actions={
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono tracking-wider">
                HISTORICAL DATA — NOT LIVE TELEMETRY
              </span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-sky-950 border border-sky-800 text-sky-400 font-mono tracking-wider">
                SOURCE: NRSC VIC MODEL
              </span>
            </div>
          }
        />

        {/* Dataset Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Dataset Region</span>
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">Visakhapatnam</p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">District Spelling Normalization Applied</p>
            </div>
          </div>
          
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Historical Record Range</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-black text-white">Jan 2025 – Jun 2025</p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">Deduplicated: {baseline?.total_records || 175} Unique Observations</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Record Count (Provenance)</span>
              <CloudRain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">350 (Raw Rows)</p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">Original District: Visakhapatanam</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Statistical Baseline</span>
              <Thermometer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white font-mono">
                P75={baseline?.percentiles?.p75.toFixed(2)}mm
              </p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">
                P90={baseline?.percentiles?.p90.toFixed(2)}mm • P99={baseline?.percentiles?.p99.toFixed(2)}mm
              </p>
            </div>
          </div>
        </div>

        {/* Historical Baseline Trends & Scenario Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Historical Trend Chart */}
          <div className="lg:col-span-2">
            <ChartCard 
              title="Historical Monthly Rainfall Metrics" 
              description="NRSC VIC hydrological model daily records average and extreme maximums per month (mm/day)"
            >
              {loadingBaseline ? (
                <div className="h-full flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-transparent"></div>
                </div>
              ) : (
                <LineChart 
                  data={getChartData()} 
                  xAxisKey="name" 
                  series={[
                    { key: 'Average Rainfall', color: '#38bdf8', name: 'Average Daily (mm)' },
                    { key: 'Max Rainfall', color: '#ef4444', name: 'Extreme Daily Max (mm)' }
                  ]}
                />
              )}
            </ChartCard>
          </div>

          {/* Scenario Sim Inputs */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div className="border-b border-slate-900 pb-4">
              <h4 className="text-lg font-bold text-white tracking-tight flex items-center">
                <SlidersIcon className="h-5 w-5 mr-2 text-sky-400" />
                Scenario Simulator
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Configure simulated precipitation parameters to assess statistical anomaly and risk status.
              </p>
            </div>

            <div className="flex-1 py-6 space-y-6">
              {/* Month Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 font-mono block uppercase">Simulation Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                >
                  {baseline?.monthly_stats.map((m: any) => (
                    <option key={m.month} value={m.month}>
                      {MONTHS_MAP[m.month]} (Historical Avg: {m.avg_rainfall.toFixed(2)} mm/day)
                    </option>
                  )) || (
                    <option value={5}>May</option>
                  )}
                </select>
              </div>

              {/* Rainfall Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 font-mono uppercase">Scenario Precipitation</label>
                  <span className="text-sm font-black text-sky-400 font-mono bg-sky-950/40 border border-sky-900/30 px-2 py-0.5 rounded">
                    {rainfallScenario.toFixed(1)} mm/day
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="60.0" 
                  step="0.5"
                  value={rainfallScenario}
                  onChange={(e) => setRainfallScenario(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold font-mono">
                  <span>0.0 mm (Dry)</span>
                  <span>Baseline Max: {baseline?.monthly_stats.find((m: any) => m.month === selectedMonth)?.max_rainfall.toFixed(1) || 'N/A'} mm</span>
                  <span>60.0 mm (Extreme)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex items-start space-x-3 text-slate-400">
              <Info className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
              <p className="text-[10px] leading-relaxed font-medium">
                This simulation assesses risk against the **historical distribution** of AP daily rainfall. Changes represent hypothetical scenarios and do not influence real-time city alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Simulation Output Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Deterministic Risk assessment */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col space-y-4">
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <h5 className="text-sm font-black text-white uppercase tracking-wider font-mono">Deterministic Assessment</h5>
              <span className="text-[9px] font-bold text-slate-500 font-mono">DATA-DERIVED HISTORICAL BASELINES</span>
            </div>

            {simLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-transparent"></div>
              </div>
            ) : simResult ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Risk Display */}
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-slate-400 font-bold">Flood Risk Level:</span>
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 border rounded-full ${getRiskBadgeColor(simResult.risk_level)}`}>
                      {simResult.risk_level} Risk
                    </span>
                  </div>

                  {/* Anomaly metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-3">
                      <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">Anomaly Z-Score</p>
                      <p className="text-lg font-black text-white font-mono mt-1">
                        {simResult.metrics.z_score >= 0 ? '+' : ''}{simResult.metrics.z_score.toFixed(2)} σ
                      </p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-3">
                      <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">Pct. Deviation</p>
                      <p className="text-lg font-black text-white font-mono mt-1">
                        {simResult.metrics.pct_deviation >= 0 ? '+' : ''}{simResult.metrics.pct_deviation.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence & Drivers */}
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <p className="text-xs font-bold text-slate-300 font-mono uppercase">Primary Risk Drivers:</p>
                  <ul className="space-y-1.5">
                    {simResult.risk_drivers.map((drv: string, idx: number) => (
                      <li key={idx} className="flex items-start text-[11px] text-slate-400 leading-relaxed font-medium">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <span>{drv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
                Awaiting simulation trigger...
              </div>
            )}
          </div>

          {/* AI Recommendation markdown output */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col space-y-4 lg:col-span-2">
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <h5 className="text-sm font-black text-white uppercase tracking-wider font-mono">Qualitative Extension Advisory</h5>
              <span className="text-[9px] font-bold text-sky-400 font-mono px-2 py-0.5 rounded bg-sky-950/30 border border-sky-850 animate-pulse">
                GEMINI 3.5 FLASH
              </span>
            </div>

            {simLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-transparent"></div>
              </div>
            ) : simResult ? (
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-900">
                {/* Simulated AI Output representation */}
                <div className="text-xs text-slate-300 leading-relaxed font-medium space-y-4 whitespace-pre-line font-sans">
                  {simResult.ai_recommendation}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
                Awaiting simulation trigger...
              </div>
            )}
          </div>
        </div>

        {/* Physical Demonstration Origami Map Block */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                Physical Origami Field Demonstration
              </h5>
              <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">
                CONCEPTUAL SIMULATION SCHEMATIC — NOT LIVE TELEMETRY
              </p>
            </div>
            <span className="text-[9px] font-bold bg-purple-950/40 border border-purple-900 text-purple-400 px-2.5 py-0.5 rounded font-mono">
              ORIGAMI-GRID
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Detailed description panel of fields */}
            <div className="glass-panel bg-slate-950/40 border border-slate-900/60 p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-300 font-mono uppercase">Demonstration Scheme</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-2">
                  This mock dashboard grid maps directly to our Physical Origami Demonstration board. In physical trials, water pumps and servo gates replicate this grid's status.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-800" />
                    <span>Low Risk: Well drained, stable fields.</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
                    <span className="w-2.5 h-2.5 rounded bg-yellow-950/60 border border-yellow-800" />
                    <span>Medium Risk: Soft soils, saturated fields.</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
                    <span className="w-2.5 h-2.5 rounded bg-blue-900/40 border border-blue-700" />
                    <span>High Risk: Minor pooling, drainage stress.</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
                    <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-500 animate-pulse" />
                    <span>Critical Risk: Submerged, heavy root rot hazard.</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-900">
                <p className="text-[10px] text-slate-500 font-bold font-mono">CURRENT SIMULATED INTENSITY</p>
                <p className="text-sm font-black text-sky-400 font-mono mt-0.5">{rainfallScenario.toFixed(2)} mm/day</p>
              </div>
            </div>

            {/* Simulated origami crop fields layout */}
            <div className="md:col-span-2 grid grid-cols-3 gap-3 p-1">
              {CROPS.map((crop, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${getFieldWaterLevelColor(simResult?.risk_level)}`}
                >
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 font-mono block">Field Block 0{idx + 1}</span>
                    <span className="text-xs font-black text-white block mt-1">{crop.name}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal font-semibold font-mono line-clamp-2">
                    {crop.type}
                  </p>
                  
                  {/* Decorative grid overlay for technical feel */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
                  
                  {/* Simulated water accumulation indicator bar */}
                  {simResult && simResult.risk_level !== 'LOW' && (
                    <div className="w-full bg-slate-950/70 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          simResult.risk_level === 'MEDIUM' ? 'bg-yellow-500 w-[30%]' :
                          simResult.risk_level === 'HIGH' ? 'bg-blue-400 w-[65%]' : 'bg-blue-500 w-full animate-pulse'
                        }`} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

function SlidersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  )
}
