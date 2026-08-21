import { CitizenIncident, CitizenAlert, EmergencyResource, SyncEvent, EmergencyRoute } from '../../types/citizen'

const DB_NAME = 'BharatOSCitizenDB'
const DB_VERSION = 2

export class IndexedDbService {
  private static dbPromise: Promise<IDBDatabase> | null = null

  private static getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB is unavailable in SSR context'))
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('incidents')) {
            db.createObjectStore('incidents', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'eventId' })
          }
          if (!db.objectStoreNames.contains('alerts')) {
            db.createObjectStore('alerts', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('resources')) {
            db.createObjectStore('resources', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('routes')) {
            db.createObjectStore('routes', { keyPath: 'id' })
          }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }

    return this.dbPromise
  }

  // Incidents Store Operations
  static async saveIncident(incident: CitizenIncident): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('incidents', 'readwrite')
      tx.objectStore('incidents').put(incident)
    } catch (err) {
      console.warn('[IndexedDB] Failed to save incident locally:', err)
    }
  }

  static async getAllIncidents(): Promise<CitizenIncident[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('incidents', 'readonly')
        const req = tx.objectStore('incidents').getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.warn('[IndexedDB] Failed to fetch local incidents:', err)
      return []
    }
  }

  // Sync Queue Store Operations
  static async enqueueSyncEvent(event: SyncEvent): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('syncQueue', 'readwrite')
      tx.objectStore('syncQueue').put(event)
    } catch (err) {
      console.warn('[IndexedDB] Failed to enqueue sync event:', err)
    }
  }

  static async getSyncQueue(): Promise<SyncEvent[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('syncQueue', 'readonly')
        const req = tx.objectStore('syncQueue').getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.warn('[IndexedDB] Failed to fetch sync queue:', err)
      return []
    }
  }

  static async removeSyncEvent(eventId: string): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('syncQueue', 'readwrite')
      tx.objectStore('syncQueue').delete(eventId)
    } catch (err) {
      console.warn('[IndexedDB] Failed to remove sync event:', err)
    }
  }

  // Alerts Caching
  static async saveAlerts(alerts: CitizenAlert[]): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('alerts', 'readwrite')
      const store = tx.objectStore('alerts')
      alerts.forEach(a => store.put(a))
    } catch (err) {
      console.warn('[IndexedDB] Failed to cache alerts:', err)
    }
  }

  static async getCachedAlerts(): Promise<CitizenAlert[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('alerts', 'readonly')
        const req = tx.objectStore('alerts').getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.warn('[IndexedDB] Failed to get cached alerts:', err)
      return []
    }
  }

  // Resources Caching
  static async saveResources(resources: EmergencyResource[]): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('resources', 'readwrite')
      const store = tx.objectStore('resources')
      resources.forEach(r => store.put(r))
    } catch (err) {
      console.warn('[IndexedDB] Failed to cache resources:', err)
    }
  }

  static async getCachedResources(): Promise<EmergencyResource[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('resources', 'readonly')
        const req = tx.objectStore('resources').getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.warn('[IndexedDB] Failed to get cached resources:', err)
      return []
    }
  }

  // Evacuation Routes Caching
  static async saveEvacuationRoute(route: EmergencyRoute): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('routes', 'readwrite')
      tx.objectStore('routes').put(route)
    } catch (err) {
      console.warn('[IndexedDB] Failed to save route locally:', err)
    }
  }

  static async getCachedEvacuationRoute(routeType: string): Promise<EmergencyRoute | null> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('routes', 'readonly')
        const req = tx.objectStore('routes').getAll()
        req.onsuccess = () => {
          const list: EmergencyRoute[] = req.result || []
          const match = list.find(r => r.routeType === routeType) || list[0] || null
          resolve(match)
        }
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.warn('[IndexedDB] Failed to get cached route:', err)
      return null
    }
  }
}
