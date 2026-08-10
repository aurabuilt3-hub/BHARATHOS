const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'

export type MessageHandler = (data: any) => void

export class RealtimeWebSocketClient {
  private topic: string
  private socket: WebSocket | null = null
  private handlers: MessageHandler[] = []
  private reconnectAttempts = 0
  private maxReconnectDelay = 10000
  private isExplicitDisconnect = false

  constructor(topic: 'dashboard' | 'incidents' | 'sensors' | 'notifications') {
    this.topic = topic
  }

  public connect() {
    this.isExplicitDisconnect = false
    const url = `${WS_BASE_URL}/${this.topic}`

    try {
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        console.log(`[WebSocket] Connected to /ws/${this.topic}`)
        this.reconnectAttempts = 0
      }

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          this.handlers.forEach(h => h(parsed))
        } catch (err) {
          console.warn(`[WebSocket] Error parsing message on /ws/${this.topic}:`, err)
        }
      }

      this.socket.onclose = () => {
        if (!this.isExplicitDisconnect) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = () => {
        this.socket?.close()
      }
    } catch (err) {
      this.scheduleReconnect()
    }
  }

  public subscribe(handler: MessageHandler) {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler)
    }
  }

  public disconnect() {
    this.isExplicitDisconnect = true
    if (this.socket) {
      this.socket.close()
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts += 1
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay)
    console.log(`[WebSocket] Reconnecting to /ws/${this.topic} in ${delay}ms...`)
    setTimeout(() => this.connect(), delay)
  }
}
