'use client'

import React, { useState, useEffect } from 'react'
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
import { 
  apiService, 
  BackendIncident, 
  BackendResource 
} from '../../../services/api'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

type AdminLevel = 'national' | 'state' | 'district' | 'city' | 'ward'

export default function CityDashboardPage() {
  const [level, setLevel] = useState<AdminLevel>('city')
  const city = visakhapatnamCityData

  // E2E Dispatch Drawer & Reporting Modal state
  const [selectedIncident, setSelectedIncident] = useState<BackendIncident | null>(null)
  const [incidentResources, setIncidentResources] = useState<BackendResource[]>([])
  const [allDepartments, setAllDepartments] = useState<any[]>([])
  const [resources, setResources] = useState<BackendResource[]>([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportForm, setReportForm] = useState({
    category: 'Flood',
    title: '',
    description: '',
    severity: 'medium',
    latitude: 17.7289,
    longitude: 83.3214,
    address: 'Beach Road, Sector 4, MVP Colony'
  })
  
  const [submittingIncident, setSubmittingIncident] = useState(false)
  const [allocatingResourceId, setAllocatingResourceId] = useState<string | null>(null)
  const [assigningDeptId, setAssigningDeptId] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [actionAlert, setActionAlert] = useState<string | null>(null)

  // Fetch initial metadata
  useEffect(() => {
    Promise.all([
      apiService.getDepartments(),
      apiService.getResources({ limit: 100 })
    ]).then(([deptsRes, resourcesRes]) => {
      setAllDepartments(deptsRes || [])
      setResources(resourcesRes.items || [])
    }).catch(err => {
      console.warn("Offline fallback loading metadata", err)
    })
  }, [])

  // E2E Dispatch & workflow handler actions
  const handleSelectIncident = async (item: any) => {
    try {
      const inc = await apiService.getIncidentById(item.id)
      setSelectedIncident(inc)
      const res = await apiService.getIncidentResources(item.id)
      setIncidentResources(res || [])
    } catch (err) {
      console.error("Failed to load incident detail", err)
    }
  }

  const handleReportIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingIncident(true)
    try {
      await apiService.createIncident({
        category: reportForm.category,
        title: reportForm.title,
        description: reportForm.description,
        latitude: reportForm.latitude,
        longitude: reportForm.longitude,
        address: reportForm.address,
        severity: reportForm.severity
      })
      
      // Close modal & reset
      setShowReportModal(false)
      setReportForm({
        category: 'Flood',
        title: '',
        description: '',
        severity: 'medium',
        latitude: 17.7289,
        longitude: 83.3214,
        address: 'Beach Road, Sector 4, MVP Colony'
      })
      
      setActionAlert("CITIZEN INCIDENT REPORTED")
      // Quick refresh page by resetting selected incident
      setSelectedIncident(null)
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Report Failed: ${err.message || 'Error'}`)
    } finally {
      setSubmittingIncident(false)
    }
  }

  const handleAssignDept = async (deptId: string) => {
    if (!selectedIncident || !deptId) return
    setAssigningDeptId(deptId)
    try {
      await apiService.assignIncident(selectedIncident.id, deptId, "Dispatched from City Command Center")
      
      setSelectedIncident(prev => prev ? {
        ...prev,
        status: 'assigned',
        assignments: [{ department_id: deptId, notes: "Dispatched from City Command Center" }]
      } : null)
      
      setActionAlert("DEPARTMENT DISPATCHED")
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Assign Failed: ${err.message || 'Error'}`)
    } finally {
      setAssigningDeptId(null)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedIncident) return
    setUpdatingStatus(status)
    try {
      await apiService.updateIncidentStatus(selectedIncident.id, status, "Status updated from city dashboard")
      
      setSelectedIncident(prev => prev ? {
        ...prev,
        status: status as any
      } : null)
      
      setActionAlert(`INCIDENT STATUS: ${status.toUpperCase()}`)
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Update Failed: ${err.message || 'Error'}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleAllocateResource = async (resourceId: string) => {
    if (!selectedIncident || !resourceId) return
    setAllocatingResourceId(resourceId)
    try {
      await apiService.allocateIncidentResource(selectedIncident.id, resourceId)
      
      const updatedList = await apiService.getIncidentResources(selectedIncident.id)
      setIncidentResources(updatedList || [])
      
      const refreshedResources = await apiService.getResources({ limit: 100 })
      setResources(refreshedResources.items || [])
      
      setActionAlert("FLEET ASSET ALLOCATED")
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Allocation Failed: ${err.message || 'Error'}`)
    } finally {
      setAllocatingResourceId(null)
    }
  }

  const handleReleaseResource = async (resourceId: string) => {
    if (!selectedIncident || !resourceId) return
    setAllocatingResourceId(resourceId)
    try {
      await apiService.releaseIncidentResource(selectedIncident.id, resourceId)
      
      const updatedList = await apiService.getIncidentResources(selectedIncident.id)
      setIncidentResources(updatedList || [])
      
      const refreshedResources = await apiService.getResources({ limit: 100 })
      setResources(refreshedResources.items || [])
      
      setActionAlert("RESOURCE RELEASED")
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Release Failed: ${err.message || 'Error'}`)
    } finally {
      setAllocatingResourceId(null)
    }
  }

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
        
        {/* Action feedback flash */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl border border-sky-500/40 bg-sky-950/80 backdrop-blur-md shadow-2xl text-center font-mono text-xs font-bold text-sky-300 flex items-center space-x-2"
            >
              <span>{actionAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <PageHeader
          title={info.title}
          description={info.desc}
          breadcrumbs={[{ label: 'Home' }, { label: 'City Dashboard' }]}
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-350 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-sky-450 shrink-0" />
                <span>Report Incident</span>
              </button>
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
            <IncidentQueueWidget onSelectIncident={handleSelectIncident} />
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

        {/* REPORT CITIZEN INCIDENT MODAL */}
        <AnimatePresence>
          {showReportModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Report Citizen Incident</h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-slate-400 hover:text-white text-xs border border-slate-800 bg-slate-950 px-2 py-1 rounded cursor-pointer"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <form onSubmit={handleReportIncidentSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Category</label>
                      <select
                        value={reportForm.category}
                        onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {['Flood', 'Fire', 'Medical', 'Accident', 'Garbage', 'Water Leakage', 'Pothole', 'Street Light Failure', 'Fallen Tree', 'Infrastructure Damage'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Severity</label>
                      <select
                        value={reportForm.severity}
                        onChange={(e) => setReportForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {['critical', 'high', 'medium', 'low'].map(sev => (
                          <option key={sev} value={sev}>{sev}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block font-bold font-mono">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Drainage clog on main street"
                      value={reportForm.title}
                      onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block font-bold font-mono">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detailed description of water depth, blockage details..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block font-bold font-mono">Address / Landmark</label>
                    <input
                      type="text"
                      placeholder="Beach Road MVP Sector 4"
                      value={reportForm.address}
                      onChange={(e) => setReportForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={reportForm.latitude}
                        onChange={(e) => setReportForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={reportForm.longitude}
                        onChange={(e) => setReportForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingIncident}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                  >
                    {submittingIncident ? 'Registering...' : 'Submit Incident Report'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* INCIDENT DISPATCH DRAWER */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              className="fixed top-0 right-0 h-screen w-[420px] bg-[#0b0f19] border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[999] flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">Incident Dispatch Console</span>
                  <h3 className="text-sm font-extrabold text-white mt-1">Ticket: #{selectedIncident.ticket_number || 'N/A'}</h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-5 flex-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Category & Severity</span>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold text-white uppercase tracking-wider font-mono">
                      {selectedIncident.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded border font-bold uppercase tracking-wider font-mono ${
                      selectedIncident.severity === 'critical' ? 'bg-red-950 text-red-400 border-red-900' :
                      selectedIncident.severity === 'high' ? 'bg-orange-950 text-orange-400 border-orange-900' :
                      selectedIncident.severity === 'medium' ? 'bg-yellow-950 text-yellow-400 border-yellow-900' :
                      'bg-emerald-950 text-emerald-400 border-emerald-900'
                    }`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Title & Description</span>
                  <h4 className="font-extrabold text-slate-100 mt-1">{selectedIncident.title}</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">{selectedIncident.description}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Address & Coordinates</span>
                  <p className="text-slate-300 mt-1 leading-relaxed">Location: {selectedIncident.address || 'N/A'}</p>
                  <p className="text-slate-500 font-mono mt-0.5">[{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}]</p>
                </div>

                {/* AI Triage Information */}
                <div className="p-3.5 rounded-xl border border-purple-900/40 bg-purple-950/15">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono block">AI Triage Intel</span>
                  <p className="text-slate-300 mt-1.5 leading-relaxed">
                    Triage Priority: <span className="font-bold text-purple-300 uppercase">{selectedIncident.severity}</span>. Recommended routing to municipal pumps and traffic detours.
                  </p>
                </div>

                {/* Operations Assignment */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Operations dispatch controls</h5>

                  {/* Department Assign */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 block font-bold text-[10px] uppercase font-mono">Assign Department</label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedIncident.assignments?.[0]?.department_id || ''}
                        onChange={(e) => handleAssignDept(e.target.value)}
                        disabled={assigningDeptId !== null}
                        className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500/50 min-w-0"
                      >
                        <option value="">-- Select Department --</option>
                        {allDepartments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Incident Status */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 block font-bold text-[10px] uppercase font-mono">Update Ticket Status</label>
                    <select
                      value={selectedIncident.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      disabled={updatingStatus !== null}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Resource Allocation Section */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Resource Allocations</h5>
                    <span className="text-[9px] font-mono text-slate-500">({incidentResources.length} Allocated)</span>
                  </div>

                  {/* Allocate Resource dropdown */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAllocateResource(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        disabled={allocatingResourceId !== null}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Allocate Available Fleet Asset --</option>
                        {resources
                          .filter(r => r.status === 'available')
                          .map(r => (
                            <option key={r.id} value={r.id}>
                              [{r.type.toUpperCase()}] {r.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* List of allocated resources */}
                    <div className="space-y-1.5">
                      {incidentResources.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No resources allocated to this ticket yet.</p>
                      ) : (
                        incidentResources.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-900 text-[10px]">
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{r.name}</span>
                              <span className="text-slate-500 font-mono block uppercase text-[8px]">{r.type} • {r.status}</span>
                            </div>
                            <button
                              onClick={() => handleReleaseResource(r.id)}
                              disabled={allocatingResourceId !== null}
                              className="px-2 py-1 rounded bg-red-950/60 border border-red-900 text-red-400 font-bold font-mono text-[9px] hover:bg-red-900 hover:text-white transition-all cursor-pointer"
                            >
                              Release
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
