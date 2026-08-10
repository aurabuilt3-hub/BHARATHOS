export interface IncidentItem {
  id: string
  category: 'Flood' | 'Fire' | 'Medical' | 'Accident' | 'Garbage' | 'Water Leakage' | 'Pothole' | 'Street Light Failure' | 'Fallen Tree' | 'Infrastructure Damage'
  title: string
  location: string
  coordinates: [number, number]
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'assigned' | 'in_progress' | 'resolved'
  timestamp: string // e.g. "09:15", "10:30", "11:45"
  timeHour: number  // e.g. 9, 10, 11, 12
  description: string
  assignedDepartment?: string
}

export const visakhapatnamIncidentsData: IncidentItem[] = [
  {
    id: 'inc-01',
    category: 'Flood',
    title: 'Waterlogging & Drain Overflow',
    location: 'Beach Road, Sector 4, MVP Colony',
    coordinates: [17.7289, 83.3214],
    severity: 'critical',
    status: 'active',
    timestamp: '09:15 AM',
    timeHour: 9,
    description: 'High tide combined with 45mm rainfall caused drain backup over Beach Road corridor.',
    assignedDepartment: 'Municipal Corporation'
  },
  {
    id: 'inc-02',
    category: 'Fire',
    title: 'Short Circuit Electrical Fire',
    location: 'Commercial Complex, Siripuram',
    coordinates: [17.7202, 83.3156],
    severity: 'high',
    status: 'in_progress',
    timestamp: '09:45 AM',
    timeHour: 9,
    description: 'Transformer spark caused localized fire on 2nd floor commercial unit.',
    assignedDepartment: 'Fire Department'
  },
  {
    id: 'inc-03',
    category: 'Accident',
    title: 'Multi-Vehicle Collision',
    location: 'Gajuwaka Highway Flyover',
    coordinates: [17.6812, 83.2104],
    severity: 'critical',
    status: 'assigned',
    timestamp: '10:15 AM',
    timeHour: 10,
    description: 'Heavy truck brake failure led to 3-car pileup during peak hour.',
    assignedDepartment: 'Police Department'
  },
  {
    id: 'inc-04',
    category: 'Water Leakage',
    title: 'Main Pipeline Rupture',
    location: 'Madhurawada Zone 2',
    coordinates: [17.8105, 83.3421],
    severity: 'medium',
    status: 'active',
    timestamp: '10:50 AM',
    timeHour: 10,
    description: 'Fresh water main line burst causing road erosion near Ward 14.',
    assignedDepartment: 'Municipal Corporation'
  },
  {
    id: 'inc-05',
    category: 'Fallen Tree',
    title: 'Tree Blocking Access Road',
    location: 'Waltair Main Road',
    coordinates: [17.7345, 83.3190],
    severity: 'medium',
    status: 'in_progress',
    timestamp: '11:10 AM',
    timeHour: 11,
    description: 'Old banyan branch snapped due to strong gusty winds.',
    assignedDepartment: 'Disaster Management'
  },
  {
    id: 'inc-06',
    category: 'Medical',
    title: 'Emergency Medical Dispatch Call',
    location: 'Dwaraka Nagar Bus Station',
    coordinates: [17.7241, 83.3052],
    severity: 'high',
    status: 'active',
    timestamp: '11:40 AM',
    timeHour: 11,
    description: 'Elderly commuter collapse, ambulance dispatched from KGH.',
    assignedDepartment: 'Emergency Health'
  },
  {
    id: 'inc-07',
    category: 'Pothole',
    title: 'Severe Asphalt Pothole Cavity',
    location: 'Jagadamba Junction',
    coordinates: [17.7112, 83.2980],
    severity: 'low',
    status: 'resolved',
    timestamp: '12:05 PM',
    timeHour: 12,
    description: 'Road surface cave-in patched by quick response team.',
    assignedDepartment: 'Municipal Corporation'
  }
]
