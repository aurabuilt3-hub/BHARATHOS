import { IndexedDbService } from './indexedDbService'
import { SyncEvent, SyncState } from '../../types/citizen'
import { useCitizenStore } from '../../store/useCitizenStore'

export class SyncManager {
  private static isProcessing = false

  static async enqueueEvent(eventType: 'CREATE_INCIDENT' | 'TRIGGER_SOS' | 'UPDATE_PROFILE', payload: any): Promise<SyncEvent> {
    const syncEvent: SyncEvent = {
      eventId: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType,
      timestamp: Date.now(),
      payload,
      retryCount: 0,
      status: 'PENDING'
    }

    await IndexedDbService.enqueueSyncEvent(syncEvent)
    useCitizenStore.getState().setSyncState('PENDING')
    
    // Attempt background sync if online
    if (navigator.onLine) {
      this.processQueue()
    }

    return syncEvent
  }

  static async processQueue(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      const queue = await IndexedDbService.getSyncQueue()
      if (queue.length === 0) {
        useCitizenStore.getState().setSyncState('SYNCED')
        this.isProcessing = false
        return
      }

      useCitizenStore.getState().setSyncState('SYNCING')

      for (const item of queue) {
        try {
          // Attempt API dispatch
          if (item.eventType === 'CREATE_INCIDENT' || item.eventType === 'TRIGGER_SOS') {
            await fetch('http://localhost:8000/api/v1/incidents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                category: item.payload.category || 'General',
                title: item.payload.title,
                description: item.payload.description,
                latitude: item.payload.location?.latitude || 17.7289,
                longitude: item.payload.location?.longitude || 83.3214,
                address: item.payload.location?.address || 'Visakhapatnam',
                severity: item.payload.severity || 'high'
              })
            })
          }

          // Successfully synced, remove from queue
          await IndexedDbService.removeSyncEvent(item.eventId)
        } catch (err) {
          console.warn(`[SyncManager] Retrying sync event ${item.eventId}:`, err)
          item.retryCount += 1
          if (item.retryCount > 5) {
            item.status = 'FAILED'
          }
        }
      }

      const remaining = await IndexedDbService.getSyncQueue()
      if (remaining.length === 0) {
        useCitizenStore.getState().setSyncState('SYNCED')
      } else {
        useCitizenStore.getState().setSyncState('PENDING')
      }
    } finally {
      this.isProcessing = false
    }
  }
}
