'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Flame,
  HeartPulse,
  Truck,
  Activity,
  Cpu,
  TrendingUp,
  Users,
  Compass,
  MapPin,
  MessageSquare,
  Send,
  Zap,
  Radio,
  Sparkles,
  Server,
  CloudRain,
  Layers,
  Database,
  Search,
  Bell,
  Play,
  FileText,
  CornerDownLeft,
  Minimize2,
  Car,
  Waves
} from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker, MapPolygon, MapHeatPoint } from '../../../components/ui/MapContainer'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart as RechartsBarChart, 
  Bar, 
  Cell, 
  PieChart as RechartsPieChart, 
  Pie 
} from 'recharts'
import { 
  apiService, 
  DashboardOverview, 
  BackendIncident, 
  BackendFacility, 
  BackendResource, 
  BackendDigitalTwinNode, 
  BackendAlert 
} from '../../../services/api'
import { useRealtimeStore, registerOnReconnectRefresh } from '../../../store/useRealtimeStore'

// Charts static/historical configuration
const responseTimeData = [
  { time: '00:00', duration: 4.2 },
  { time: '04:00', duration: 3.8 },
  { time: '08:00', duration: 5.1 },
  { time: '12:00', duration: 6.2 },
  { time: '16:00', duration: 4.8 },
  { time: '20:00', duration: 3.9 },
  { time: '24:00', duration: 3.2 }
]

const departmentPerformanceData = [
  { name: 'Police', efficiency: 94, color: '#38bdf8' },
  { name: 'Fire', efficiency: 91, color: '#f59e0b' },
  { name: 'Health', efficiency: 88, color: '#10b981' },
  { name: 'Hazmat', efficiency: 85, color: '#a855f7' },
  { name: 'Traffic', efficiency: 96, color: '#06b6d4' }
]

const resourceAllocationData = [
  { name: 'Active Patrols', value: 420, fill: '#38bdf8' },
  { name: 'Fire Tenders', value: 85, fill: '#f59e0b' },
  { name: 'Ambulances', value: 140, fill: '#10b981' },
  { name: 'Rescue Teams', value: 95, fill: '#a855f7' }
]

const incidentTrendsData = [
  { day: 'Mon', incidents: 38 },
  { day: 'Tue', incidents: 42 },
  { day: 'Wed', incidents: 56 },
  { day: 'Thu', incidents: 48 },
  { day: 'Fri', incidents: 64 },
  { day: 'Sat', incidents: 72 },
  { day: 'Sun', incidents: 45 }
]

const mapPolygons: MapPolygon[] = [
  {
    id: 'poly-1',
    positions: [
      [17.7250, 83.3100],
      [17.7300, 83.3250],
      [17.7150, 83.3300],
      [17.7100, 83.3150]
    ],
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.18,
    label: 'MVP Sector 4 Critical Inundation Zone'
  },
  {
    id: 'poly-2',
    positions: [
      [17.6950, 83.2100],
      [17.6900, 83.2300],
      [17.6750, 83.2350],
      [17.6780, 83.2150]
    ],
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.12,
    label: 'Gajuwaka Industrial Alert Area'
  }
]

const mapHeatpoints: MapHeatPoint[] = [
  { position: [17.7200, 83.3150], radius: 600, color: '#ef4444' },
  { position: [17.6850, 83.2200], radius: 800, color: '#f59e0b' }
]

interface AIAgent {
  name: string
  status: 'online' | 'processing' | 'standby' | 'offline'
  confidence: number
  latency: number
  task: string
}

const translations = {
  en: {
    pilot: "Live Data Pilot: Visakhapatnam (Other Regions: Integration Ready / Data Coverage Pending)",
    title: "Urban Flood Early Warning & Response System",
    warningsTitle: "Active Hydrological Warnings & Alerts",
    statusNormal: "Normal",
    statusWatch: "Watch",
    statusWarning: "Warning",
    statusCritical: "Critical",
    mvpColony: "MVP Colony Outfall Sector 4",
    beachRoad: "Beach Road Beach Bypass Corridor",
    gajuwaka: "Gajuwaka Industrial runoff reservoir",
    warningDetail1: "High tide combined with rainfall exceeds culvert capacity.",
    warningDetail2: "Runoff velocity exceeds discharge threshold. Divert light traffic.",
    warningDetail3: "Water level is normal. SCADA sensor gate operating normally."
  },
  te: {
    pilot: "ప్రత్యక్ష డేటా పైలట్: విశాఖపట్నం (ఇతర ప్రాంతాలు: అనుసంధానానికి సిద్ధం / డేటా పెండింగ్)",
    title: "పట్టణ వరద ముందస్తు హెచ్చరిక & ప్రతిస్పందన వేదిక",
    warningsTitle: "క్రియాశీల జలసంబంధిత హెచ్చరికలు",
    statusNormal: "సాధారణం",
    statusWatch: "నిఘా ఉంచండి",
    statusWarning: "హెచ్చరిక",
    statusCritical: "తీవ్రమైన ప్రమాదం",
    mvpColony: "ఎమ్విపి కాలనీ అవుట్‌ఫాల్ సెక్టార్ 4",
    beachRoad: "బీచ్ రోడ్ బైపాస్ కారిడార్",
    gajuwaka: "గాజువాక పారిశ్రామిక రన్-ఆఫ్ జలాశయం",
    warningDetail1: "అధిక అలల ఉధృతి మరియు భారీ వర్షపాతం వల్ల డ్రైనేజీ నిండిపోయింది.",
    warningDetail2: "రన్-ఆఫ్ వేగం డిశ్చార్జ్ పరిమితిని మించిపోయింది. ట్రాఫిక్ మళ్లించండి.",
    warningDetail3: "నీటి మట్టం సాధారణంగా ఉంది. స్కాడా సెన్సార్ సాధారణంగా పనిచేస్తోంది."
  },
  hi: {
    pilot: "लाइव डेटा पायलट: विशाखापत्तनम (अन्य क्षेत्र: एकीकरण के लिए तैयार / डेटा लंबित)",
    title: "शहरी बाढ़ पूर्व चेतावनी एवं प्रतिक्रिया प्रणाली",
    warningsTitle: "सक्रिय जल विज्ञान चेतावनियाँ और अलर्ट",
    statusNormal: "सामान्य",
    statusWatch: "निगरानी रखें",
    statusWarning: "चेतावनी",
    statusCritical: "गंभीर खतरा",
    mvpColony: "एमवीपी कॉलोनी आउटफॉल सेक्टर 4",
    beachRoad: "बीच रोड बाईपास कॉरिडोर",
    gajuwaka: "गाजुवाका अपवाह जलाशय",
    warningDetail1: "उच्च ज्वार और भारी बारिश के कारण जल निकासी क्षमता समाप्त हो गई है।",
    warningDetail2: "अपवाह वेग निर्वहन सीमा से अधिक है। यातायात को डायवर्ट करें।",
    warningDetail3: "जल स्तर सामान्य है। स्काडा सेंसर गेट सामान्य रूप से काम कर रहा है।"
  }
}

export default function NationalCommandPage() {
  // DB Live States
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [incidents, setIncidents] = useState<BackendIncident[]>([])
  const [facilities, setFacilities] = useState<BackendFacility[]>([])
  const [resources, setResources] = useState<BackendResource[]>([])
  const [nodes, setNodes] = useState<BackendDigitalTwinNode[]>([])
  const [alerts, setAlerts] = useState<BackendAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en')

  // Dispatch Drawer / Reporting state additions
  const [selectedIncident, setSelectedIncident] = useState<BackendIncident | null>(null)
  const [incidentResources, setIncidentResources] = useState<BackendResource[]>([])
  const [allDepartments, setAllDepartments] = useState<any[]>([])
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
  const [actioningAlertId, setActioningAlertId] = useState<string | null>(null)

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'NEOC Lead', text: 'Confirming coordinate overlays with Visakhapatnam command center.', time: '22:10' },
    { sender: 'AI Coordinator', text: 'Spatial GIS twin synchronized. Heatmap outlines flood zones.', time: '22:11' }
  ])
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'user', content: 'Confirming coordinate overlays with Visakhapatnam command center.' },
    { role: 'assistant', content: 'Spatial GIS twin synchronized. Heatmap outlines flood zones.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Simulation overlays
  const [actionAlert, setActionAlert] = useState<string | null>(null)

  // AI Agents state
  const [agents, setAgents] = useState<AIAgent[]>([
    { name: 'Coordinator', status: 'online', confidence: 99.4, latency: 12, task: 'Orchestrating agent workflows' },
    { name: 'Citizen Agent', status: 'online', confidence: 96.8, latency: 45, task: 'Synthesizing voice emergency feeds' },
    { name: 'Weather Sensor', status: 'online', confidence: 98.2, latency: 18, task: 'Buffering IMD radar cyclone cones' },
    { name: 'Traffic Intel', status: 'processing', confidence: 95.4, latency: 68, task: 'Rerouting NH16 Beach Bypass grids' },
    { name: 'Healthcare Node', status: 'online', confidence: 97.9, latency: 22, task: 'Querying bed databases in Vizag' },
    { name: 'Emergency Dispatch', status: 'online', confidence: 99.1, latency: 14, task: 'Triggering NDRF Battalion 10 links' },
    { name: 'Police Dispatch', status: 'standby', confidence: 94.8, latency: 25, task: 'Monitoring active patrol GPS coordinates' },
    { name: 'Fire Response', status: 'online', confidence: 96.2, latency: 31, task: 'Deploying Gajuwaka Hazmat Tender 3' }
  ])

  // Ingestion history log
  const [incidentLogs, setIncidentLogs] = useState<Array<{ id: number; time: string; msg: string; type: string }>>([
    { id: 1, time: '22:14:02', msg: 'MVP colony Sector 4 waterlogged warning active.', type: 'critical' },
    { id: 2, time: '22:15:30', msg: 'NIC secure SSO handshake verified for State Operations AP.', type: 'info' }
  ])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const fetchAll = () => {
      Promise.all([
        apiService.getDashboardOverview(),
        apiService.getIncidents({ limit: 10 }),
        apiService.getFacilities({ limit: 50 }),
        apiService.getResources({ limit: 50 }),
        apiService.getDigitalTwinNodes({ limit: 50 }),
        apiService.getAlerts({ limit: 10 }),
        apiService.getDepartments()
      ]).then(([overviewRes, incidentsRes, facilitiesRes, resourcesRes, nodesRes, alertsRes, deptsRes]) => {
        if (!isMounted) return
        setOverview(overviewRes)
        setIncidents(incidentsRes)
        setFacilities(facilitiesRes.items || [])
        setResources(resourcesRes.items || [])
        setNodes(nodesRes.items || [])
        setAlerts(alertsRes.items || [])
        setAllDepartments(deptsRes || [])
        setLoading(false)

        // Sync logs from alerts
        const logMapped = (alertsRes.items || []).map((alert, idx) => ({
          id: idx,
          time: new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          msg: `${alert.title}: ${alert.description}`,
          type: alert.severity === 'critical' || alert.severity === 'high' ? 'critical' : 'warning'
        }))
        if (logMapped.length > 0) {
          setIncidentLogs(logMapped)
        }
      }).catch(err => {
        console.error("Failed to fetch dashboard overview", err)
        if (isMounted) setLoading(false)
      })
    }

    fetchAll()

    // Hook websocket event listeners from useRealtimeStore
    const { addListener } = useRealtimeStore.getState()
    
    // Refresh snapshot on WebSocket reconnect
    registerOnReconnectRefresh(() => {
      if (isMounted) fetchAll()
    })

    const unsubIncidentCreated = addListener('INCIDENT_CREATED', (newInc: BackendIncident) => {
      if (!isMounted) return
      setIncidents(prev => {
        if (prev.some(x => x.id === newInc.id)) return prev
        return [newInc, ...prev].slice(0, 10)
      })
      setOverview(prev => prev ? {
        ...prev,
        total_incidents_count: prev.total_incidents_count + 1,
        active_incidents_count: prev.active_incidents_count + 1
      } : null)
    })

    const unsubIncidentStatus = addListener('INCIDENT_STATUS_CHANGED', (updatedInc: Partial<BackendIncident>) => {
      if (!isMounted) return
      setIncidents(prev => prev.map(x => x.id === updatedInc.id ? { ...x, ...updatedInc } as BackendIncident : x))
      if (updatedInc.status === 'resolved' || updatedInc.status === 'closed') {
        setOverview(prev => prev ? {
          ...prev,
          active_incidents_count: Math.max(0, prev.active_incidents_count - 1)
        } : null)
      }
    })

    const unsubIncidentAssigned = addListener('INCIDENT_ASSIGNED', (assignedInc: Partial<BackendIncident>) => {
      if (!isMounted) return
      setIncidents(prev => prev.map(x => x.id === assignedInc.id ? { ...x, ...assignedInc } as BackendIncident : x))
    })

    const unsubAlertCreated = addListener('ALERT_CREATED', (newAlert: BackendAlert) => {
      if (!isMounted) return
      setAlerts(prev => {
        if (prev.some(x => x.id === newAlert.id)) return prev
        return [newAlert, ...prev].slice(0, 10)
      })
      setIncidentLogs(prev => [
        {
          id: Date.now(),
          time: new Date(newAlert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          msg: `${newAlert.title}: ${newAlert.description}`,
          type: newAlert.severity === 'critical' || newAlert.severity === 'high' ? 'critical' : 'warning'
        },
        ...prev
      ])
      setOverview(prev => prev ? {
        ...prev,
        active_alerts_count: prev.active_alerts_count + 1
      } : null)
    })

    const unsubAlertStatus = addListener('ALERT_STATUS_CHANGED', (updatedAlert: Partial<BackendAlert>) => {
      if (!isMounted) return
      setAlerts(prev => prev.map(x => x.id === updatedAlert.id ? { ...x, ...updatedAlert } as BackendAlert : x))
      if (updatedAlert.status === 'resolved' || updatedAlert.status === 'expired') {
        setOverview(prev => prev ? {
          ...prev,
          active_alerts_count: Math.max(0, prev.active_alerts_count - 1)
        } : null)
      }
    })

    const unsubResourceAllocated = addListener('RESOURCE_ALLOCATED', (alloc: any) => {
      if (!isMounted) return
      setResources(prev => prev.map(r => r.id === alloc.id ? { ...r, status: 'allocated' } : r))
      setOverview(prev => prev ? {
        ...prev,
        resources: {
          ...prev.resources,
          allocated: (prev.resources?.allocated || 0) + 1,
          available: Math.max(0, (prev.resources?.available || 0) - 1),
          total: prev.resources?.total || 0
        }
      } : null)
    })

    const unsubResourceReleased = addListener('RESOURCE_RELEASED', (release: any) => {
      if (!isMounted) return
      setResources(prev => prev.map(r => r.id === release.id ? { ...r, status: 'available' } : r))
      setOverview(prev => prev ? {
        ...prev,
        resources: {
          ...prev.resources,
          allocated: Math.max(0, (prev.resources?.allocated || 0) - 1),
          available: (prev.resources?.available || 0) + 1,
          total: prev.resources?.total || 0
        }
      } : null)
    })

    const unsubResourceUpdated = addListener('RESOURCE_UPDATED', (updatedRes: BackendResource) => {
      if (!isMounted) return
      setResources(prev => prev.map(r => r.id === updatedRes.id ? { ...r, ...updatedRes } : r))
    })

    const unsubTelemetry = addListener('TELEMETRY_UPDATED', (telemetry: any) => {
      if (!isMounted) return
      setNodes(prev => prev.map(n => n.id === telemetry.node_id ? {
        ...n,
        last_telemetry: {
          ...n.last_telemetry,
          [telemetry.metric_type]: telemetry.value,
          unit: telemetry.unit
        },
        status: telemetry.status
      } as BackendDigitalTwinNode : n))
    })

    const unsubNode = addListener('DIGITAL_TWIN_NODE_UPDATED', (updatedNode: BackendDigitalTwinNode) => {
      if (!isMounted) return
      setNodes(prev => prev.map(n => n.id === updatedNode.id ? { ...n, ...updatedNode } : n))
    })

    // REST Polling fallback loop
    const pollInterval = setInterval(() => {
      const isWsConnected = useRealtimeStore.getState().connectionState === 'CONNECTED'
      if (!isWsConnected) {
        apiService.getDashboardOverview()
          .then(res => {
            if (isMounted) setOverview(res)
          })
      }
    }, 15000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
      unsubIncidentCreated()
      unsubIncidentStatus()
      unsubIncidentAssigned()
      unsubAlertCreated()
      unsubAlertStatus()
      unsubResourceAllocated()
      unsubResourceReleased()
      unsubResourceUpdated()
      unsubTelemetry()
      unsubNode()
    }
  }, [])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Randomize latencies slightly for premium micro-interactions
  useEffect(() => {
    const timer = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        latency: Math.max(4, Math.floor(a.latency + (Math.random() > 0.5 ? 2 : -2)))
      })))
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    const userMsg = { sender: 'NEOC Lead', text: chatInput, time: timeStr }
    
    setChatMessages(prev => [...prev, userMsg])
    setChatHistory(prev => [...prev, { role: 'user', content: chatInput }])
    
    const messageToSend = chatInput
    setChatInput('')

    try {
      const res = await apiService.postAIChat(messageToSend, chatHistory)
      const aiReply = { 
        sender: 'AI Coordinator', 
        text: res.answer, 
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
      }
      setChatMessages(prev => [...prev, aiReply])
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.answer }])
    } catch (err: any) {
      const errorReply = {
        sender: 'AI Coordinator',
        text: `Error contacting agent cluster: ${err.message || 'Connection offline.'}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages(prev => [...prev, errorReply])
    }
  }

  const handleMapMarkerClick = (marker: MapMarker) => {
    if (String(marker.id).startsWith('incident-')) {
      const incId = String(marker.id).replace('incident-', '')
      const found = incidents.find(i => i.id === incId)
      if (found) {
        setSelectedIncident(found)
        // Fetch resources for this incident
        apiService.getIncidentResources(incId)
          .then(res => setIncidentResources(res || []))
          .catch(() => setIncidentResources([]))
      }
    }
  }

  const handleReportIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingIncident(true)
    try {
      const newInc = await apiService.createIncident({
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
      
      // Update global list
      setIncidents(prev => [newInc, ...prev].slice(0, 10))
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
      await apiService.assignIncident(selectedIncident.id, deptId, "Dispatched from National Command Desk")
      
      // Update locally
      setSelectedIncident(prev => prev ? {
        ...prev,
        status: 'assigned',
        assignments: [{ department_id: deptId, notes: "Dispatched from National Command Desk" }]
      } : null)
      
      // Refresh incidents
      apiService.getIncidents({ limit: 10 }).then(res => setIncidents(res))
      
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
      await apiService.updateIncidentStatus(selectedIncident.id, status, "Status updated from NEOC console")
      
      // Update locally
      setSelectedIncident(prev => prev ? {
        ...prev,
        status: status as any
      } : null)
      
      // Refresh incidents
      apiService.getIncidents({ limit: 10 }).then(res => setIncidents(res))
      
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
      
      // Refresh resources list for this incident
      const updatedList = await apiService.getIncidentResources(selectedIncident.id)
      setIncidentResources(updatedList || [])
      
      // Refresh global resources
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
      
      // Refresh list
      const updatedList = await apiService.getIncidentResources(selectedIncident.id)
      setIncidentResources(updatedList || [])
      
      // Refresh global list
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

  const handleAcknowledgeAlert = async (alertId: string) => {
    setActioningAlertId(alertId)
    try {
      await apiService.acknowledgeAlert(alertId)
      
      // Refresh alerts list
      const updatedAlerts = await apiService.getAlerts({ limit: 10 })
      setAlerts(updatedAlerts.items || [])
      
      setActionAlert("ALERT ACKNOWLEDGED")
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Ack Failed: ${err.message || 'Error'}`)
    } finally {
      setActioningAlertId(null)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    setActioningAlertId(alertId)
    try {
      await apiService.resolveAlert(alertId)
      
      // Refresh alerts list
      const updatedAlerts = await apiService.getAlerts({ limit: 10 })
      setAlerts(updatedAlerts.items || [])
      
      setActionAlert("ALERT RESOLVED")
    } catch (err: any) {
      console.error(err)
      setActionAlert(`Resolve Failed: ${err.message || 'Error'}`)
    } finally {
      setActioningAlertId(null)
    }
  }

  const triggerQuickAction = (actionName: string) => {
    if (actionName === 'NEW INCIDENT REGISTRATION') {
      setShowReportModal(true)
      return
    }
    
    setActionAlert(`${actionName} SEQUENCE ENGAGED`)
    
    // Add to incident logs
    const now = new Date().toLocaleTimeString('en-US', { hour12: false })
    const newLog = { 
      id: Date.now(), 
      time: now, 
      msg: `System trigger: "${actionName}" executed from Operations Board.`, 
      type: actionName === 'SOS TRIGGER' ? 'critical' : 'warning' 
    }
    setIncidentLogs(prev => [newLog, ...prev])

    setTimeout(() => setActionAlert(null), 3000)
  }

  // Map markers mapping coordinates cleanly
  const mapMarkers: MapMarker[] = [
    ...incidents.map(inc => ({
      id: `incident-${inc.id}`,
      position: [inc.latitude, inc.longitude] as [number, number],
      title: inc.title,
      description: inc.description,
      category: inc.severity === 'critical' ? 'critical' as const : inc.severity === 'high' ? 'high' as const : inc.severity === 'medium' ? 'medium' as const : 'low' as const
    })),
    ...facilities.map(fac => ({
      id: `facility-${fac.id}`,
      position: [fac.latitude, fac.longitude] as [number, number],
      title: fac.name,
      description: `Address: ${fac.address || 'N/A'}, Type: ${fac.facility_type}, Source: ${fac.source_type}`,
      category: 'info' as const
    })),
    ...resources.map(res => ({
      id: `resource-${res.id}`,
      position: [res.latitude, res.longitude] as [number, number],
      title: res.name,
      description: `Type: ${res.type}, Status: ${res.status}`,
      category: 'info' as const
    })),
    ...nodes.map(node => ({
      id: `node-${node.id}`,
      position: [node.latitude, node.longitude] as [number, number],
      title: node.name,
      description: `Type: ${node.type}, Status: ${node.status}`,
      category: 'info' as const
    }))
  ].filter(marker => marker.position[0] !== undefined && marker.position[1] !== undefined && !isNaN(marker.position[0]) && !isNaN(marker.position[1]))

  const activeIncidentsCount = overview?.active_incidents_count ?? 0
  const activeAlertsCount = overview?.active_alerts_count ?? 0
  const totalResources = overview?.resources?.total ?? 0
  const availableResources = overview?.resources?.available ?? 0
  const allocatedResources = overview?.resources?.allocated ?? 0
  const weatherTemp = overview?.weather?.temperature !== undefined ? `${overview.weather.temperature}°C` : '29°C'
  const isSimulated = resources.some(r => r.name.includes('[SIMULATED]'))

  return (
    <DashboardLayout>
      <div className="space-y-5 text-slate-200">
        
        {/* ACTION FLASHING NOTIFICATION */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-xl border border-red-500/40 bg-red-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center font-mono text-sm font-bold text-red-300 flex items-center space-x-3.5 tracking-wider animate-pulse"
            >
              <AlertCircle className="w-5 h-5 animate-spin" />
              <span>{actionAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multilingual Early Warning & Pilot Banner */}
        <div className="glass-panel border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-extrabold text-emerald-400 font-mono uppercase tracking-widest bg-emerald-950/60 border border-emerald-900/40 px-2.5 py-0.5 rounded">
                  {translations[lang].pilot}
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-wide">{translations[lang].title}</h2>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5 border border-slate-850 rounded-xl bg-[#050816] p-1 self-start md:self-auto font-mono text-[10px]">
              {(['en', 'te', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                    lang === l
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'te' ? 'తెలుగు' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Status Grid */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">{translations[lang].warningsTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Alert 1: MVP Colony */}
              <div className="p-4 rounded-xl border border-red-950 bg-red-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{translations[lang].mvpColony}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-900/60 border border-red-800 text-red-300 font-mono uppercase">
                    {translations[lang].statusCritical}
                  </span>
                </div>
                <p className="text-[11px] text-slate-450 leading-relaxed">{translations[lang].warningDetail1}</p>
                <div className="text-[10px] font-mono-data text-red-400 bg-red-950/40 px-2 py-1 rounded border border-red-900/20">
                  Level: 4.18m / Limit: 3.50m
                </div>
              </div>

              {/* Alert 2: Beach Road */}
              <div className="p-4 rounded-xl border border-orange-950 bg-orange-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{translations[lang].beachRoad}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-900/60 border border-orange-800 text-orange-300 font-mono uppercase">
                    {translations[lang].statusWarning}
                  </span>
                </div>
                <p className="text-[11px] text-slate-450 leading-relaxed">{translations[lang].warningDetail2}</p>
                <div className="text-[10px] font-mono-data text-orange-400 bg-orange-950/40 px-2 py-1 rounded border border-orange-900/20">
                  Level: 3.12m / Limit: 3.00m
                </div>
              </div>

              {/* Alert 3: Gajuwaka */}
              <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{translations[lang].gajuwaka}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-450 font-mono uppercase">
                    {translations[lang].statusNormal}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{translations[lang].warningDetail3}</p>
                <div className="text-[10px] font-mono-data text-slate-400 bg-slate-900/40 px-2 py-1 rounded border border-slate-800">
                  Level: 1.45m / Limit: 4.00m
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 1. TOP PREMIUM DENSE KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-3">
          
          {/* KPI 1 */}
          <div className="p-3 rounded-xl border border-red-900/60 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.06)] flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-[7.5px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">ACTIVE</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider font-mono truncate">Active Incidents</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{activeIncidentsCount}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate flex items-center space-x-1 border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="truncate text-red-450">All India Sync</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="p-3 rounded-xl border border-amber-900/60 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.06)] flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[7.5px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">WARNING</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono truncate">Critical Alerts</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{activeAlertsCount}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-400 font-mono">Monsoonal System</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">ACTIVE</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Total Fleet</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{totalResources}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-emerald-400 font-mono">API Database</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[7.5px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">AVAILABLE</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Available Fleet</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{availableResources}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">Standby Response</span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">ALLOCATED</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Allocated Fleet</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{allocatedResources}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-emerald-400 font-mono">Dispatched Teams</span>
            </div>
          </div>

          {/* KPI 6 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <HeartPulse className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">HUBS</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Total Facilities</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{overview?.facilities_count ?? 'N/A'}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">Vizag Public Data</span>
            </div>
          </div>

          {/* KPI 7 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">METEOROLOGY</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Weather Temp</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{weatherTemp}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-blue-400 font-mono">{overview?.weather?.freshness || 'N/A'}</span>
            </div>
          </div>

          {/* KPI 8 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">TOPOLOGY</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Twin Nodes</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{overview?.digital_twin_nodes_count ?? 'N/A'}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">GIS System Mesh</span>
            </div>
          </div>

          {/* KPI 9 */}
          <div className="p-3 rounded-xl border border-purple-900/60 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.06)] flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0">COGNITIVE</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider font-mono truncate">AI Status</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">Online</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate flex items-center space-x-1 border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
              <span className="truncate text-purple-400 font-mono">Agentic Triage</span>
            </div>
          </div>

          {/* KPI 10 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 shrink-0">MUNICIPAL</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Sensor Logs</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{overview?.telemetry?.total_records ?? 'N/A'}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">Linked IoT Nodes</span>
            </div>
          </div>

        </div>
        {/* 2. DYNAMIC WORKSPACE GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
          
          {/* A. LEFT COLUMN: AI OPERATIONS PANEL */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-3.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">AI Cognitive Agents</h4>
              </div>
              <span className="text-[9px] font-bold text-slate-500 font-mono shrink-0">8 NODES RUNNING</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-950">
              {agents.map((agent) => {
                const getAgentIcon = (name: string) => {
                  const cn = "w-4 h-4 shrink-0"
                  if (name.includes('Coordinator')) return <Compass className={`${cn} text-sky-400`} />
                  if (name.includes('Citizen')) return <Users className={`${cn} text-purple-400`} />
                  if (name.includes('Weather')) return <CloudRain className={`${cn} text-yellow-400`} />
                  if (name.includes('Traffic')) return <Car className={`${cn} text-orange-400`} />
                  if (name.includes('Healthcare')) return <HeartPulse className={`${cn} text-rose-400`} />
                  if (name.includes('Emergency')) return <AlertTriangle className={`${cn} text-red-400`} />
                  if (name.includes('Police')) return <Shield className={`${cn} text-blue-500`} />
                  if (name.includes('Fire')) return <Flame className={`${cn} text-amber-500`} />
                  return <Cpu className={`${cn} text-purple-400`} />
                }

                return (
                  <div 
                    key={agent.name}
                    className="p-3 rounded-xl border border-slate-900/60 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-800 transition-all flex flex-col space-y-1.5 group cursor-pointer min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center space-x-2 min-w-0">
                        {getAgentIcon(agent.name)}
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{agent.name}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 font-mono text-[9px] shrink-0 ml-2">
                        <span className="text-purple-400">{agent.confidence}% conf</span>
                        <span className="text-slate-650">•</span>
                        <span className="text-slate-500">{agent.latency}ms</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono break-words whitespace-normal leading-normal">
                      <span className="text-slate-600 font-bold mr-1">&gt;_</span>
                      {agent.task}
                    </p>

                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 pt-0.5 border-t border-slate-900/40 shrink-0">
                      <span className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                          agent.status === 'online' ? 'bg-emerald-500 animate-pulse' :
                          agent.status === 'processing' ? 'bg-purple-500 animate-ping' :
                          agent.status === 'standby' ? 'bg-amber-500' : 'bg-slate-600'
                        }`} />
                        <span>HEARTBEAT OK</span>
                      </span>
                      <svg className="w-10 h-3 text-sky-500/40 shrink-0" viewBox="0 0 100 30">
                        <path 
                          d="M0,15 L30,15 L40,5 L50,25 L60,10 L70,15 L100,15" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                        />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* B. CENTER COLUMN: LARGE DIGITAL TWIN MAP */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 text-xs shrink-0">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-400 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">Digital Twin Spatial Map</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-400">
                <span className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5" />
                  <span>Real-time DB Markers</span>
                </span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-900">ZOOM: 12</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-950 overflow-hidden bg-slate-950 h-[460px]">
              <MapContainer 
                center={[17.6868, 83.2185]} 
                zoom={12} 
                markers={mapMarkers}
                polygons={mapPolygons}
                heatpoints={mapHeatpoints}
                onMarkerClick={handleMapMarkerClick}
              />

              <div className="absolute top-16 right-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-2">
                <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Legend</h5>
                <div className="space-y-1.5 text-[9px] font-mono text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span>Active Incidents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Twin / Public Facilities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-lg border border-red-500 bg-red-950/20 block" />
                    <span>Flood Zone Boundary</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C. RIGHT COLUMN: NATIONAL ALERTS, RECOMMENDATIONS, LOGS, SECURE CHAT */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            <div className="space-y-3.5 shrink-0">
              
              {/* National Alert */}
              <div className="p-3.5 rounded-xl border border-red-900/60 bg-red-950/30 text-xs flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-red-400 uppercase tracking-wider text-[10px] font-mono">NDMA Incident Warning</h5>
                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px] break-words whitespace-normal">
                    {alerts.length > 0 ? `${alerts[0].title}: ${alerts[0].description}` : 'No active critical alerts in boundary.'}
                  </p>
                  {alerts.length > 0 && alerts[0].status !== 'resolved' && alerts[0].status !== 'expired' && (
                    <div className="flex items-center space-x-2 mt-2">
                      {alerts[0].status === 'active' && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alerts[0].id)}
                          disabled={actioningAlertId !== null}
                          className="px-2 py-1 rounded bg-amber-950/60 border border-amber-900 text-amber-400 font-bold font-mono text-[9px] hover:bg-amber-900 hover:text-white transition-all cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveAlert(alerts[0].id)}
                        disabled={actioningAlertId !== null}
                        className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-900 text-emerald-400 font-bold font-mono text-[9px] hover:bg-emerald-900 hover:text-white transition-all cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                  {alerts.length > 0 && (alerts[0].status === 'resolved' || alerts[0].status === 'expired') && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-bold font-mono text-[8px] uppercase tracking-wider">
                      {alerts[0].status}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-3.5 rounded-xl border border-purple-900/60 bg-purple-950/30 text-xs flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="font-bold text-purple-400 uppercase tracking-wider text-[10px] font-mono">AI Cognitive Advisory</h5>
                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px] break-words whitespace-normal">
                    Divert transport off waterlogged beach road bypass. Coordinate police patrols for coastal wards.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Operations Feed Log */}
            <div className="flex-1 my-4 flex flex-col min-h-0 border-t border-b border-slate-900 py-3.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 block shrink-0">Incident Timeline Log</span>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-slate-950 text-[10px] font-mono">
                {incidentLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 py-1 border-b border-slate-900/40 min-w-0">
                    <span className="text-slate-500 font-bold shrink-0">{log.time}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                      log.type === 'critical' ? 'bg-red-500 animate-pulse' :
                      log.type === 'warning' ? 'bg-amber-500' :
                      log.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
                    }`} />
                    <p className="text-slate-300 leading-normal break-words whitespace-normal min-w-0 flex-1">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secure Command Chat Box */}
            <div className="flex flex-col min-h-0 bg-slate-950/60 rounded-xl border border-slate-900 p-3 shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 block flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Secure Command chat</span>
              </span>

              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[140px] pr-1 scrollbar-thin text-[10px] font-mono mb-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'NEOC Lead' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-1 mb-0.5 text-slate-500 text-[8px] font-bold uppercase">
                      <span>{msg.sender}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className={`p-2 rounded-lg max-w-[85%] leading-normal break-words whitespace-normal ${
                      msg.sender === 'NEOC Lead' 
                        ? 'bg-sky-600/90 text-white rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Query system coordinator..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500/50 min-w-0"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 hover:shadow-[0_0_10px_rgba(56,189,248,0.25)] text-white transition-all border border-sky-400/20 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* 3. CENTER BOTTOM CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Response Time Telemetry</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Average dispatch duration (hours)</h4>
            </div>
            <div className="h-36 w-full mt-4 font-mono text-[9px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData}>
                  <defs>
                    <linearGradient id="gradientDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#38bdf8', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="duration" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#gradientDuration)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Agency Performance</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Efficiency rating percent</h4>
            </div>
            <div className="h-36 w-full mt-4 font-mono text-[9px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={departmentPerformanceData}>
                  <XAxis dataKey="name" stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8', fontSize: '10px' }}
                  />
                  <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                    {departmentPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Resource Deployment</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Deployment node share</h4>
            </div>
            <div className="h-36 w-full mt-4 flex items-center justify-between font-mono text-[9px] min-w-0">
              <div className="w-[60%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={resourceAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {resourceAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[40%] flex flex-col space-y-1 text-[9px] justify-center min-w-0">
                {resourceAllocationData.map((entry) => (
                  <div key={entry.name} className="flex items-center space-x-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-slate-400 truncate min-w-0">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Weekly Incident Trends</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Weekly volume index</h4>
            </div>
            <div className="h-36 w-full mt-4 font-mono text-[9px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentTrendsData}>
                  <defs>
                    <linearGradient id="gradientIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#a855f7', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="incidents" stroke="#a855f7" strokeWidth={1.5} fillOpacity={1} fill="url(#gradientIncidents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 4. EMERGENCY QUICK ACTIONS */}
        <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/60 p-4 space-y-3">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Emergency Quick dispatch control board</span>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerQuickAction('NEW INCIDENT REGISTRATION')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Create Incident</span>
            </button>
            <button
              onClick={() => triggerQuickAction('BROADCAST EMERGENCY ALERT')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Broadcast Alert</span>
            </button>
            <button
              onClick={() => triggerQuickAction('POLICE DISPATCH INITIATION')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Deploy Police</span>
            </button>
            <button
              onClick={() => triggerQuickAction('FIRE RESPONSE DISPATCH')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Deploy Fire</span>
            </button>
            <button
              onClick={() => triggerQuickAction('AMBULANCE RESPONSE DISPATCH')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Dispatch Ambulance</span>
            </button>
            <button
              onClick={() => triggerQuickAction('GENERATING REGULATORY AUDIT REPORT')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Generate Report</span>
            </button>
            <button
              onClick={() => triggerQuickAction('SOS TRIGGER')}
              className="h-10 px-4 rounded-lg border border-red-500 bg-red-950/80 hover:bg-red-950 text-red-200 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer border-dashed shrink-0 min-w-[140px] flex-1 min-w-0 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]"
            >
              <Zap className="w-3.5 h-3.5 text-red-500 animate-bounce shrink-0" />
              <span className="truncate">SOS PANIC</span>
            </button>
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
