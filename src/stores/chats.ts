import { defineStore } from 'pinia'
import type { Chat } from '@/types/chat'
import { chatsApi } from '@/api/chats'

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
    async fetchChats(characterId?: string) {
      this.loading = true
      try {
        const response = await chatsApi.list(characterId ? { character_id: characterId } : {})
        this.chatList = response
      } catch (error) {
        console.error('获取聊天列表失败:', error)
        this.chatList = []
      } finally {
        this.loading = false
      }
    },

    async createChat(characterId: string, firstMessage: string) {
      try {
        const response = await chatsApi.create({
          character_id: characterId,
          first_message: firstMessage
        })

        // 添加到列表
        this.chatList.unshift(response)

        return response
      } catch (error) {
        console.error('创建聊天失败:', error)
        throw error
      }
    },

    async deleteChat(chatId: string) {
      try {
        await chatsApi.delete(chatId)

        // 从列表中移除
        this.chatList = this.chatList.filter((chat) => chat.id !== chatId)
      } catch (error) {
        console.error('删除聊天失败:', error)
        throw error
      }
    },

    async updateChatTitle(chatId: string, title: string) {
      try {
        const response = await chatsApi.update(chatId, { title })

        // 更新列表中的标题
        const chat = this.chatList.find((c) => c.id === chatId)
        if (chat) {
          chat.title = response.title
          chat.updated_at = response.updated_at
        }
      } catch (error) {
        console.error('更新聊天标题失败:', error)
        throw error
      }
    }
  }
})
