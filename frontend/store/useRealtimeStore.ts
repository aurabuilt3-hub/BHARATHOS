import { create } from 'zustand'

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR'

interface RealtimeState {
  connectionState: ConnectionState
  lastEventTimestamp: string | null
  error: string | null
  wsActive: boolean
  reconnectAttempt: number
  connect: (token: string) => void
  disconnect: () => void
  addListener: (event: string, callback: (data: any) => void) => () => void
  removeListener: (event: string, callback: (data: any) => void) => void
}

// Registry of listeners map: eventName -> Set of callback functions
const eventListeners: Record<string, Set<(data: any) => void>> = {}

let ws: WebSocket | null = null
let reconnectTimeoutId: any = null
let currentToken: string | null = null
let refreshCallback: (() => void) | null = null

const RECONNECT_BACKOFFS = [1000, 2000, 4000, 8000, 10000]

const getWsUrl = (token: string) => {
  const restUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  const wsProtocol = restUrl.startsWith('https') ? 'wss:' : 'ws:'
  const host = restUrl.replace(/^https?:\/\//, '').split('/')[0]
  return `${wsProtocol}//${host}/ws/dashboard?token=${encodeURIComponent(token)}`
}

export const registerOnReconnectRefresh = (callback: () => void) => {
  refreshCallback = callback
}

export const useRealtimeStore = create<RealtimeState>((set, get) => {
  const attemptReconnect = () => {
    if (!currentToken) return

    const { reconnectAttempt } = get()
    const delay = RECONNECT_BACKOFFS[Math.min(reconnectAttempt, RECONNECT_BACKOFFS.length - 1)]
    
    set({ connectionState: 'RECONNECTING', reconnectAttempt: reconnectAttempt + 1 })
    console.log(`[Realtime WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempt + 1})`)

    if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId)
    reconnectTimeoutId = setTimeout(() => {
      if (currentToken) {
        get().connect(currentToken)
      }
    }, delay)
  }

  return {
    connectionState: 'DISCONNECTED',
    lastEventTimestamp: null,
    error: null,
    wsActive: false,
    reconnectAttempt: 0,

    connect: (token: string) => {
      if (!token) return
      currentToken = token

      // If already connected or connecting, don't create a duplicate connection
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        return
      }

      console.log('[Realtime WebSocket] Connecting to dashboard stream...')
      if (ws) {
        try {
          ws.close()
        } catch (e) {}
      }

      set({ connectionState: 'CONNECTING', error: null })

      try {
        const url = getWsUrl(token)
        ws = new WebSocket(url)

        ws.onopen = () => {
          console.log('[Realtime WebSocket] Connection established successfully.')
          set({ connectionState: 'CONNECTED', wsActive: true, reconnectAttempt: 0, error: null })
          
          // Re-fetch fresh REST overview snap on reconnect to synchronize stale states
          if (refreshCallback) {
            console.log('[Realtime WebSocket] Triggering REST snapshot synchronization.')
            refreshCallback()
          }
        }

        ws.onmessage = (event) => {
          // Heartbeat or event validation
          if (event.data === 'pong') return

          try {
            const payload = JSON.parse(event.data)
            const eventName = payload.event
            set({ lastEventTimestamp: payload.timestamp || new Date().toISOString() })

            if (eventName && eventListeners[eventName]) {
              eventListeners[eventName].forEach((callback) => {
                try {
                  callback(payload.data)
                } catch (err) {
                  console.error(`[Realtime WebSocket] Error executing callback for event ${eventName}:`, err)
                }
              });
            }
            
            // Allow wildcard listeners as well
            if (eventListeners['*']) {
              eventListeners['*'].forEach((callback) => {
                try {
                  callback(payload)
                } catch (err) {}
              })
            }
          } catch (e) {
            console.warn('[Realtime WebSocket] Failed to parse message payload:', event.data)
          }
        }

        ws.onclose = (event) => {
          console.log(`[Realtime WebSocket] Connection closed: code=${event.code}, reason=${event.reason || 'None'}`)
          set({ connectionState: 'DISCONNECTED', wsActive: false })
          
          // Only attempt reconnect if it was not closed cleanly (code 1000)
          // and if we didn't explicitly log out (currentToken cleared)
          if (event.code !== 1000 && currentToken) {
            attemptReconnect()
          }
        }

        ws.onerror = (err) => {
          console.error('[Realtime WebSocket] Connection error occurred:', err)
          set({ connectionState: 'ERROR', error: 'WebSocket connection failed' })
        }
      } catch (err: any) {
        console.error('[Realtime WebSocket] Exception setting up connection:', err)
        set({ connectionState: 'ERROR', error: err.message || 'Setup exception' })
        attemptReconnect()
      }
    },

    disconnect: () => {
      currentToken = null
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId)
        reconnectTimeoutId = null
      }
      if (ws) {
        console.log('[Realtime WebSocket] Intentionally closing connection.')
        try {
          ws.close(1000, 'Explicit logout / disconnect')
        } catch (e) {}
        ws = null
      }
      set({ connectionState: 'DISCONNECTED', wsActive: false, reconnectAttempt: 0 })
    },

    addListener: (event: string, callback: (data: any) => void) => {
      if (!eventListeners[event]) {
        eventListeners[event] = new Set()
      }
      eventListeners[event].add(callback)
      
      // Return a cleanup unsubscribe function
      return () => {
        get().removeListener(event, callback)
      }
    },

    removeListener: (event: string, callback: (data: any) => void) => {
      if (eventListeners[event]) {
        eventListeners[event].delete(callback)
        if (eventListeners[event].size === 0) {
          delete eventListeners[event]
        }
      }
    }
  }
})
