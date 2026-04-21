import { computed } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useChatStore } from '@/stores/chat'
import { WebSocketManager } from '@/utils/websocket'

export function useWebSocket() {
  const wsStore = useWebSocketStore()
  const chatStore = useChatStore()

  const connect = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8430/ws'
    const wsManager = new WebSocketManager(wsUrl)

    // 监听连接状态
    wsManager.on('connected', () => {
      wsStore.connected = true
      wsStore.reconnecting = false
      wsStore.error = null
    })

    wsManager.on('disconnected', () => {
      wsStore.connected = false
      wsStore.reconnecting = true
    })

    wsManager.on('error', (error: unknown) => {
      wsStore.error = String(error)
    })

    // 监听消息
    wsManager.on('chat:chunk', (data: unknown) => {
      const chunkData = data as { chunk?: string }
      chatStore.appendStreamingChunk(chunkData.chunk || '')
    })

    wsManager.on('chat:complete', (data: unknown) => {
      const completeData = data as { full_reply?: string }
      chatStore.completeStreaming(completeData.full_reply || '')
    })

    wsManager.on('chat:error', (data: unknown) => {
      const errorData = data as { message?: string }
      wsStore.error = errorData.message || '对话错误'
      chatStore.isStreaming = false
    })

    wsManager.connect()
    wsStore.wsManager = wsManager
  }

  const disconnect = () => {
    wsStore.wsManager?.disconnect()
    wsStore.wsManager = null
    wsStore.connected = false
    wsStore.reconnecting = false
  }

  return {
    connected: computed(() => wsStore.connected),
    reconnecting: computed(() => wsStore.reconnecting),
    error: computed(() => wsStore.error),
    connect,
    disconnect
  }
}
