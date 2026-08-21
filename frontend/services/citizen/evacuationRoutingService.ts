import { 
  EmergencyRoute, 
  EmergencyRouteType, 
  LocationInfo, 
  RouteSourceType 
} from '../../types/citizen'
import { IndexedDbService } from '../offline/indexedDbService'

export class EvacuationRoutingService {

  static async calculateEvacuationRoute(
    origin: LocationInfo, 
    routeType: EmergencyRouteType = 'general',
    isOnline: boolean = true
  ): Promise<EmergencyRoute> {
    
    // Check if offline
    if (!isOnline) {
      try {
        const cachedRoute = await IndexedDbService.getCachedEvacuationRoute(routeType)
        if (cachedRoute) {
          return {
            ...cachedRoute,
            sourceType: 'CACHED ROUTE',
            isCached: true
          }
        }
      } catch (err) {
        console.warn('[EvacuationRoutingService] IndexedDB offline route fetch error:', err)
      }

      return {
        id: `route-off-${Date.now()}`,
        origin,
        destination: {
          name: 'Visakhapatnam District Relief Shelter (MVP Colony)',
          address: 'Sector 2, MVP Colony, Visakhapatnam',
          latitude: 17.7345,
          longitude: 83.3190,
          facilityType: 'Evacuation Assembly Shelter'
        },
        routeType,
        distanceKm: 1.8,
        estimatedMinutes: null, // Travel time omitted when unreliable offline
        hazards: [],
        blockedSegments: [],
        sourceType: 'ROUTE UNAVAILABLE',
        sourceAuthority: undefined,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'unavailable',
        isOfficial: false,
        isCached: true,
        isSimulated: true,
        officialInstructions: [
          'Stay in a safe location until connectivity or responder units arrive.',
          'Call 112 or 108 emergency lines for immediate rescue.',
          'Keep your mobile phone line free.'
        ],
        coordinatesPath: [
          [origin.latitude, origin.longitude],
          [17.7345, 83.3190]
        ]
      }
    }

    // Default calculated route simulation based on Visakhapatnam center
    const simulatedDestination = routeType === 'medical' ? {
      name: 'King George Hospital (KGH) Trauma Center',
      address: 'Maharanipeta, Visakhapatnam',
      latitude: 17.7089,
      longitude: 83.3054,
      facilityType: 'Trauma & Emergency Facility'
    } : routeType === 'fire' ? {
      name: 'Suryabagh Central Fire Command Station',
      address: 'Suryabagh, Visakhapatnam',
      latitude: 17.7123,
      longitude: 83.3012,
      facilityType: 'Fire & Rescue Station'
    } : {
      name: 'MVP High School Designated Evacuation Shelter',
      address: 'Sector 2, MVP Colony, Visakhapatnam',
      latitude: 17.7345,
      longitude: 83.3190,
      facilityType: 'Relief Shelter'
    }

    const calculatedRoute: EmergencyRoute = {
      id: `route-calc-${Date.now()}`,
      origin,
      destination: simulatedDestination,
      routeType,
      distanceKm: 2.4,
      estimatedMinutes: 8,
      hazards: [
        {
          name: 'Waterlogged Underpass Corridor',
          type: 'Waterlogging',
          severity: 'high',
          latitude: 17.7250,
          longitude: 83.3150
        }
      ],
      blockedSegments: [
        {
          roadName: 'Beach Road Underpass Sector 3',
          reason: 'Drainage Overflow & Structural Closure'
        }
      ],
      sourceType: 'CALCULATED SAFE ROUTE',
      sourceAuthority: 'BHARATOS Development Simulation',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'available',
      isOfficial: false,
      isCached: false,
      isSimulated: true,
      officialInstructions: [
        'Follow designated high-ground corridors away from low-lying underpasses.',
        'Do NOT attempt to drive through submerged underpass sections.',
        'Proceed toward MVP High School Designated Evacuation Assembly Node.'
      ],
      coordinatesPath: [
        [origin.latitude, origin.longitude],
        [17.7300, 83.3200],
        [simulatedDestination.latitude, simulatedDestination.longitude]
      ]
    }

    // Cache in IndexedDB for offline capability
    try {
      await IndexedDbService.saveEvacuationRoute(calculatedRoute)
    } catch (e) {
      console.warn('[EvacuationRoutingService] Local route cache write error:', e)
    }

    return calculatedRoute
  }

  // Source Transparency Wording Translator
  static getSourceLabel(sourceType: RouteSourceType): { label: string; text: string; color: string } {
    switch (sourceType) {
      case 'OFFICIAL EVACUATION ROUTE':
        return {
          label: 'OFFICIAL EVACUATION ROUTE',
          text: 'Confirmed by authorized emergency authority.',
          color: 'bg-emerald-950 text-emerald-400 border-emerald-800'
        }
      case 'CALCULATED SAFE ROUTE':
        return {
          label: 'SUGGESTED ROUTE (CALCULATED)',
          text: 'Suggested route based on available information.',
          color: 'bg-sky-950 text-sky-400 border-sky-800'
        }
      case 'CACHED ROUTE':
        return {
          label: 'CACHED ROUTE',
          text: 'Previously downloaded/stored evacuation information.',
          color: 'bg-amber-950 text-amber-400 border-amber-800'
        }
      case 'LAST KNOWN ROUTE':
        return {
          label: 'LAST KNOWN ROUTE',
          text: 'Historical route information that may be stale.',
          color: 'bg-slate-900 text-slate-300 border-slate-700'
        }
      case 'ROUTE UNAVAILABLE':
      default:
        return {
          label: 'ROUTE UNAVAILABLE',
          text: 'Safe route information is not currently available.',
          color: 'bg-red-950 text-red-400 border-red-800'
        }
    }
  }
}
