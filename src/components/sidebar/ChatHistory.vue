<script setup lang="ts">
import { computed, watch } from 'vue'
import { useChatsStore } from '@/stores/chats'
import { useCharactersStore } from '@/stores/characters'
import { useChatStore } from '@/stores/chat'

const chatsStore = useChatsStore()
const charactersStore = useCharactersStore()
const chatStore = useChatStore()

// 当选中角色变化时，重新加载聊天列表
watch(
  () => charactersStore.activeCharacterId,
  (characterId) => {
    if (characterId) {
      chatsStore.fetchChats(characterId)
    }
  },
  { immediate: true }
)

const sortedChats = computed(() => {
  return [...chatsStore.chatList].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})

const handleCreateChat = async () => {
  const characterId = charactersStore.activeCharacterId
  if (!characterId) {
    alert('请先选择角色')
    return
  }

  const firstMessage = prompt('请输入首条消息：')
  if (!firstMessage || !firstMessage.trim()) {
    return
  }

  try {
    const newChat = await chatsStore.createChat(characterId, firstMessage.trim())
    if (newChat) {
      // 切换到新聊天
      chatStore.setCurrentChat(newChat.id, characterId)
    }
  } catch (error) {
    console.error('创建聊天失败:', error)
    alert('创建聊天失败，请重试')
  }
}

const handleSelectChat = (chatId: string) => {
  const characterId = charactersStore.activeCharacterId
  if (characterId) {
    chatStore.setCurrentChat(chatId, characterId)
  }
}

const handleDeleteChat = async (chatId: string, event: Event) => {
  event.stopPropagation()

  if (!confirm('确定要删除这个聊天吗？')) {
    return
  }

  try {
    await chatsStore.deleteChat(chatId)
    // 如果删除的是当前聊天，清空当前聊天
    if (chatStore.currentChatId === chatId) {
      chatStore.clearMessages()
      chatStore.currentChatId = null
    }
  } catch (error) {
    console.error('删除聊天失败:', error)
    alert('删除聊天失败，请重试')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}
</script>

<template>
  <div class="chat-history flex flex-col h-full">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-400">聊天历史</h3>
      <button
        class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        @click="handleCreateChat"
      >
        新建聊天
      </button>
    </div>

    <div v-if="chatsStore.loading" class="text-gray-500 text-sm">加载中...</div>

    <div v-else-if="sortedChats.length === 0" class="text-gray-500 text-sm">暂无聊天记录</div>

    <div v-else class="space-y-2 overflow-y-auto flex-1">
      <div
        v-for="chat in sortedChats"
        :key="chat.id"
        class="chat-item p-3 rounded cursor-pointer transition-colors relative group"
        :class="{
          'bg-blue-600 bg-opacity-20': chatStore.currentChatId === chat.id,
          'hover:bg-gray-700': chatStore.currentChatId !== chat.id
        }"
        @click="handleSelectChat(chat.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ chat.title }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(chat.updated_at) }}</div>
          </div>
          <button
            class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
            @click="(e) => handleDeleteChat(chat.id, e)"
            title="删除聊天"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-item {
  user-select: none;
}
</style>
