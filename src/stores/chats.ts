import { defineStore } from 'pinia'
import type { Chat } from '@/types/chat'

export interface ChatsState {
  chatList: Chat[]
  currentChat: Chat | null
  loading: boolean
}

export const useChatsStore = defineStore('chats', {
  state: (): ChatsState => ({
    chatList: [],
    currentChat: null,
    loading: false
  }),

  actions: {
    async fetchChats(_characterId?: string) {
      // Will be implemented in US-FE-004
      this.loading = true
      try {
        // Placeholder - will call chatsApi.list()
        this.chatList = []
      } finally {
        this.loading = false
      }
    },

    async createChat(_characterId: string, _firstMessage: string) {
      // Will be implemented in US-FE-004
      // Placeholder - will call chatsApi.create()
      return null
    },

    async deleteChat(_chatId: string) {
      // Will be implemented in US-FE-004
      // Placeholder - will call chatsApi.delete()
    },

    async updateChatTitle(_chatId: string, _title: string) {
      // Will be implemented in US-FE-004
      // Placeholder - will call chatsApi.update()
    }
  }
})
