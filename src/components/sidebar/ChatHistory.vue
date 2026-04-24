<script setup lang="ts">
import { computed, watch } from 'vue'

import { useChatStore } from '@/stores/chat'
import { useCharactersStore } from '@/stores/characters'
import { useChatsStore } from '@/stores/chats'

const chatsStore = useChatsStore()
const charactersStore = useCharactersStore()
const chatStore = useChatStore()
let fetchToken = 0

watch(
  () => charactersStore.activeCharacterId,
  async (characterId) => {
    if (characterId) {
      const token = ++fetchToken
      chatStore.prepareNewChat(characterId)
      const chats = await chatsStore.fetchChats(characterId)

      if (token !== fetchToken) {
        return
      }

      if (chats.length > 0) {
        chatStore.setCurrentChat(chats[0].id, characterId)
      }
    }
    else {
      chatStore.setCurrentCharacter(null)
      chatStore.clearMessages()
    }
  },
  { immediate: true },
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

  chatStore.prepareNewChat(characterId)
}

const handleSelectChat = (chatId: string) => {
  const characterId = charactersStore.activeCharacterId
  if (characterId) {
    chatStore.setCurrentChat(chatId, characterId)
  }
}

const handleDeleteChat = async (chatId: string, event: Event) => {
  event.stopPropagation()
  const characterId = charactersStore.activeCharacterId || chatStore.currentCharacterId

  if (!confirm('确定要删除这个聊天吗？')) {
    return
  }

  try {
    await chatsStore.deleteChat(chatId)
    if (chatStore.currentChatId === chatId) {
      const nextChat = sortedChats.value.find(chat => chat.id !== chatId)
      if (nextChat && characterId) {
        chatStore.setCurrentChat(nextChat.id, characterId)
      } else if (characterId) {
        chatStore.prepareNewChat(characterId)
      } else {
        chatStore.clearMessages()
        chatStore.currentChatId = null
      }
    }
  }
  catch (error) {
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
  }
  if (days === 1) {
    return '昨天'
  }
  if (days < 7) {
    return `${days}天前`
  }

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <div class="chat-history flex flex-col h-full">
    <div class="flex items-center justify-between mb-3 gap-3">
      <h3 class="section-title text-sm font-semibold">聊天历史</h3>
      <button
        class="create-button px-3 py-1 text-xs rounded-md transition-colors"
        @click="handleCreateChat"
      >
        新建聊天
      </button>
    </div>

    <div v-if="chatsStore.loading" class="section-meta text-sm">加载中...</div>

    <div v-else-if="sortedChats.length === 0" class="section-meta text-sm">暂无聊天记录</div>

    <div v-else class="space-y-2 overflow-y-auto flex-1">
      <div
        v-for="chat in sortedChats"
        :key="chat.id"
        class="chat-item p-3 rounded-lg cursor-pointer transition-colors relative group"
        :class="{ 'is-active': chatStore.currentChatId === chat.id }"
        @click="handleSelectChat(chat.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="chat-title text-sm font-medium truncate">{{ chat.title }}</div>
            <div class="chat-time text-xs mt-1">{{ formatDate(chat.updated_at) }}</div>
          </div>
          <button
            class="delete-button opacity-0 group-hover:opacity-100 transition-opacity"
            title="删除聊天"
            @click="(e) => handleDeleteChat(chat.id, e)"
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
.section-title {
  color: #0081b3;
}

.section-meta {
  color: rgb(0 129 179 / 0.7);
}

.create-button {
  background: rgb(240 252 255 / 0.88);
  border: 1px solid rgb(152 236 255 / 0.55);
  color: #0081b3;
}

.create-button:hover {
  background: rgb(197 252 255 / 0.94);
}

.chat-item {
  user-select: none;
  background: rgb(240 252 255 / 0.58);
  border: 1px solid rgb(152 236 255 / 0.28);
}

.chat-item:hover {
  background: rgb(197 252 255 / 0.72);
  border-color: rgb(152 236 255 / 0.44);
}

.chat-item.is-active {
  background: rgb(152 236 255 / 0.3);
  border-color: rgb(0 152 196 / 0.34);
  box-shadow: inset 0 0 0 1px rgb(0 129 179 / 0.08);
}

.chat-title {
  color: #0071a0;
}

.chat-time {
  color: rgb(0 113 160 / 0.72);
}

.delete-button {
  color: rgb(0 129 179 / 0.62);
}

.delete-button:hover {
  color: #0081b3;
}

.dark .section-title {
  color: #c5fcff;
}

.dark .section-meta {
  color: rgb(152 236 255 / 0.72);
}

.dark .create-button {
  background: rgb(0 51 69 / 0.82);
  border-color: rgb(41 189 226 / 0.35);
  color: #c5fcff;
}

.dark .create-button:hover {
  background: rgb(0 71 102 / 0.9);
}

.dark .chat-item {
  background: rgb(0 51 69 / 0.5);
  border-color: rgb(41 189 226 / 0.2);
}

.dark .chat-item:hover {
  background: rgb(0 71 102 / 0.62);
  border-color: rgb(41 189 226 / 0.32);
}

.dark .chat-item.is-active {
  background: rgb(41 189 226 / 0.22);
  border-color: rgb(152 236 255 / 0.28);
  box-shadow: inset 0 0 0 1px rgb(197 252 255 / 0.08);
}

.dark .chat-title {
  color: #c5fcff;
}

.dark .chat-time,
.dark .delete-button {
  color: rgb(152 236 255 / 0.74);
}

.dark .delete-button:hover {
  color: #f0fcff;
}
</style>
