import { defineStore } from 'pinia'

export interface WebSocketState {
  connected: boolean
  reconnecting: boolean
  error: string | null
}

export const useWebSocketStore = defineStore('websocket', {
  state: (): WebSocketState => ({
    connected: false,
    reconnecting: false,
    error: null
  }),

  actions: {
    init() {
      // Will be implemented in US-FE-005
      // Initialize WebSocketManager + event listeners
    },

    send(_message: unknown) {
      // Will be implemented in US-FE-005
      // Send message via WebSocketManager
    },

    disconnect() {
      // Will be implemented in US-FE-005
      // Disconnect WebSocket
    }
  }
})
