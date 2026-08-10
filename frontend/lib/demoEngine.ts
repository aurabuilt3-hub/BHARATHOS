export type DemoScenarioName = 
  | 'Heavy Rain & Coastal Flood' 
  | 'Chemical Factory Fire' 
  | 'Cyclone Warning' 
  | 'Major Road Accident'

export interface DemoStepEvent {
  step: number
  title: string
  description: string
}

export class DemoEngine {
  public static getScenarios(): DemoScenarioName[] {
    return [
      'Heavy Rain & Coastal Flood',
      'Chemical Factory Fire',
      'Cyclone Warning',
      'Major Road Accident'
    ]
  }

  public static getScenarioData(scenario: DemoScenarioName) {
    switch (scenario) {
      case 'Chemical Factory Fire':
        return {
          title: 'Chemical Factory Fire Alarm',
          location: 'Gajuwaka Industrial Zone Ward 45',
          severity: 'critical',
          aiPlan: 'Deploy 4 Hazmat Fire Tenders and issue air quality stay-indoors advisory.',
          confidence: 96.5,
          department: 'Fire Department',
          activity: '20:14:00 Hazmat Level 2 Chemical Alarm Triggered'
        }
      case 'Cyclone Warning':
        return {
          title: 'Category 3 Coastal Cyclone Alert',
          location: 'Visakhapatnam Coastal Belt',
          severity: 'critical',
          aiPlan: 'Evacuate 1,200 ground-floor residents to Sector 3 emergency shelters.',
          confidence: 98.2,
          department: 'Disaster Management',
          activity: '20:14:00 NDMA Coastal Storm Surge Warning Activated'
        }
      case 'Major Road Accident':
        return {
          title: 'NH16 Multi-Vehicle Collision',
          location: 'Gajuwaka Highway Flyover',
          severity: 'high',
          aiPlan: 'Dispatch 3 heavy tow cranes and route traffic via Inner Ring Road bypass.',
          confidence: 91.8,
          department: 'Police Department',
          activity: '20:14:00 Highway Gridlock Detected by Traffic Sensors'
        }
      case 'Heavy Rain & Coastal Flood': default:
        return {
          title: 'Coastal High Tide Flood Inundation',
          location: 'Beach Road, MVP Colony Sector 4',
          severity: 'critical',
          aiPlan: 'Divert vehicular traffic onto Inner Ring Road and deploy dewatering pump M-12.',
          confidence: 94.2,
          department: 'Municipal Corporation',
          activity: '20:14:00 Ward 12 Storm Drain Gauge Breached 4.2m Threshold'
        }
    }
  }

  public static async executeDemoSequence(
    scenario: DemoScenarioName,
    onStep: (step: DemoStepEvent) => void
  ) {
    const steps: DemoStepEvent[] = [
      { step: 1, title: 'Initializing Demo Environment', description: 'Clearing session cache & connecting WebSockets...' },
      { step: 2, title: 'Seeding Spatial Incidents & Assets', description: 'Mapping Visakhapatnam GeoJSON wards & Leaflet pins...' },
      { step: 3, title: 'Starting IoT Telemetry Engine', description: 'Simulating Ward 12 storm drain water depth surge (4.3m)...' },
      { step: 4, title: 'Orchestrating Gemini 2.5 Pro AI Graph', description: 'LangGraph Citizen -> Coordinator -> Specialized Agents pipeline running...' },
      { step: 5, title: 'Broadcasting Priority Alarms', description: 'Dispatching real-time system alerts to Notification Center...' },
      { step: 6, title: 'Animating Digital Twin Spatial Map', description: 'Highlighting flood hazard heatmap polygon overlays...' },
      { step: 7, title: 'Populating Strategic & Executive Dashboards', description: 'Updating Collector & Commissioner KPI decision cards...' },
      { step: 8, title: 'Live Activity Feed Synchronized', description: 'Demo Mode Active! BharatOS Operational Center Ready.' }
    ]

    for (const st of steps) {
      onStep(st)
      await new Promise(resolve => setTimeout(resolve, 600))
    }
  }
}
