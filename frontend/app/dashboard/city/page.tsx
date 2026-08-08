'use client'

import React, { useState } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import WeatherWidget from '../../../components/widgets/WeatherWidget'
import TrafficWidget from '../../../components/widgets/TrafficWidget'
import ResourceWidget from '../../../components/widgets/ResourceWidget'
import SensorWidget from '../../../components/widgets/SensorWidget'
import AISummaryWidget from '../../../components/widgets/AISummaryWidget'
import IncidentQueueWidget from '../../../components/widgets/IncidentQueueWidget'
import ActivityFeedWidget from '../../../components/widgets/ActivityFeedWidget'
import CommandWorkflowWidget from '../../../components/widgets/CommandWorkflowWidget'
import TimeMachineSlider from '../../../components/widgets/TimeMachineSlider'
import ChartCard from '../../../components/ui/ChartCard'
import PieChart from '../../../components/ui/PieChart'
import LineChart from '../../../components/ui/LineChart'
import { visakhapatnamCityData } from '../../../lib/mock/cities'
import { incidentCategoryPieData, responseTimeHistoryData } from '../../../lib/mock/analytics'

type AdminLevel = 'national' | 'state' | 'district' | 'city' | 'ward'

export default function CityDashboardPage() {
  const [level, setLevel] = useState<AdminLevel>('city')
  const city = visakhapatnamCityData

  const getHeaderDetails = () => {
    switch (level) {
      case 'national':
        return {
          title: 'National Operations Command Center',
          desc: 'Unified administrative control covering all 28 States and 8 UTs. Live tracking of inter-state resource deployments.'
        }
      case 'state':
        return {
          title: 'State Operations Center - Andhra Pradesh',
          desc: 'Monitoring 26 districts, coastal IMD storm surge sectors, and state police deployment telemetry.'
        }
      case 'district':
        return {
          title: 'District Emergency Console - Visakhapatnam',
          desc: 'High-level coordinating views for Collector and SP. 148 active field response teams online.'
        }
      case 'ward':
        return {
          title: 'Ward Operations Center - Ward 45',
          desc: 'Micro-level GIS telemetry: Ward 12 & 45 storm drain water depth gauges and street flooding alert zones.'
        }
      case 'city':
      default:
        return {
          title: `Smart City Command Center - ${city.name}`,
          desc: `Real-time municipal digital twin telemetry, IoT sensor networks, and automated multi-agent triage (${city.zonesCount} zones, ${city.wardsCount} wards).`
        }
    }
  }

  const info = getHeaderDetails()

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6">
        <PageHeader
          title={info.title}
          description={info.desc}
          breadcrumbs={[{ label: 'Home' }, { label: 'City Dashboard' }]}
          actions={
            <div className="flex items-center space-x-3">
              <TimeMachineSlider />
              <div className="flex border border-slate-800 rounded-xl bg-[#050816] p-1 text-xs">
                {(['national', 'state', 'district', 'city', 'ward'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      level === lvl
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        {/* 1. Top Row: Weather & AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherWidget />
          <AISummaryWidget />
        </div>

        {/* 2. Middle Row: Resource, Sensor & Traffic Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResourceWidget />
          <SensorWidget />
          <TrafficWidget />
        </div>

        {/* 3. Incidents Queue & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CommandWorkflowWidget />
            <IncidentQueueWidget />
          </div>

          <div className="space-y-6">
            <ActivityFeedWidget />
            <ChartCard title="Incident Category Breakdown">
              <PieChart data={incidentCategoryPieData} />
            </ChartCard>
            <ChartCard title="Average Response Time (Minutes)">
              <LineChart
                data={responseTimeHistoryData}
                xAxisKey="time"
                series={[{ key: 'avgMinutes', color: '#3b82f6', name: 'Avg Min' }]}
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
