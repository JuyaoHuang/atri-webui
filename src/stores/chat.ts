import { defineStore } from 'pinia'
import type { Message } from '@/types/message'

export interface ChatState {
  currentChatId: string | null
  currentCharacterId: string | null
  messages: Message[]
  isStreaming: boolean
  streamingText: string
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    currentChatId: null,
    currentCharacterId: null,
    messages: [],
    isStreaming: false,
    streamingText: ''
  }),

  actions: {
    setCurrentChat(chatId: string, characterId: string) {
      this.currentChatId = chatId
      this.currentCharacterId = characterId
    },

    addMessage(message: Message) {
      this.messages.push(message)
    },

    appendStreamingChunk(chunk: string) {
      this.streamingText += chunk
    },

    completeStreaming(fullReply: string, name?: string, avatar?: string) {
      if (this.currentChatId && this.currentCharacterId) {
        this.messages.push({
          id: `msg_${Date.now()}`,
          chat_id: this.currentChatId,
          role: 'ai',
          content: fullReply,
          timestamp: new Date().toISOString(),
          name,
          avatar
        })
      }
      this.streamingText = ''
      this.isStreaming = false
    },

    clearMessages() {
      this.messages = []
      this.streamingText = ''
      this.isStreaming = false
    }
  }
})
