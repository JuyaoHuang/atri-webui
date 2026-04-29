import { computed } from 'vue'

import { dataApi } from '@/api/data'
import { chatsApi } from '@/api/chats'
import { useChatStore } from '@/stores/chat'
import { useChatsStore } from '@/stores/chats'

export function useDataCleanup() {
  const chatStore = useChatStore()
  const chatsStore = useChatsStore()

  const currentChatId = computed(() => chatStore.currentChatId)

  async function deleteChatSession(chatId: string, characterId: string) {
    await chatsApi.delete(chatId)
    chatsStore.chatList = chatsStore.chatList.filter(chat => chat.id !== chatId)

    if (chatStore.currentChatId === chatId) {
      const nextChat = chatsStore.chatList.find(chat => chat.character_id === characterId)
      if (nextChat) {
        chatStore.setCurrentChat(nextChat.id, characterId)
      } else {
        chatStore.prepareNewChat(characterId)
      }
    }
  }

  async function clearShortTermMemory(characterId: string) {
    return dataApi.clearShortTermMemory(characterId)
  }

  async function clearLongTermMemory(characterId: string) {
    return dataApi.clearLongTermMemory(characterId)
  }

  return {
    currentChatId,
    deleteChatSession,
    clearShortTermMemory,
    clearLongTermMemory
  }
}
