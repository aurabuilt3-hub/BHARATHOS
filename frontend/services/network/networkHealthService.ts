import { useCitizenStore } from '../../store/useCitizenStore'
import { NetworkHealthState, NetworkNode } from '../../types/citizen'
import { SyncManager } from '../offline/syncManager'

export class NetworkHealthService {
  private static activeNode: NetworkNode = {
    id: 'node-central-1',
    name: 'BHARATOS Central Cloud Gateway',
    type: 'CENTRAL',
    status: 'active',
    latencyMs: 32,
    authenticated: true
  }

  static initListener(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      useCitizenStore.getState().setNetworkState('RECOVERING')
      setTimeout(() => {
        useCitizenStore.getState().setNetworkState('ONLINE')
        SyncManager.processQueue()
      }, 1200)
    })

    window.addEventListener('offline', () => {
      useCitizenStore.getState().setNetworkState('OFFLINE')
    })
  }

  static getActiveNode(): NetworkNode {
    return this.activeNode
  }

  static simulateEdgeFailover(nodeType: 'DISTRICT' | 'POLICE' | 'FIRE' | 'HEALTHCARE' | 'MOBILE_COMMAND'): void {
    useCitizenStore.getState().setNetworkState('FAILOVER')
    this.activeNode = {
      id: `node-${nodeType.toLowerCase()}-edge`,
      name: `Visakhapatnam ${nodeType} Edge Command Node`,
      type: nodeType,
      status: 'active',
      latencyMs: 14,
      authenticated: true
    }
  }
}
