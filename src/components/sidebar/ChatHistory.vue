<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useChatStore } from '@/stores/chat'
import { useCharactersStore } from '@/stores/characters'
import { useChatsStore } from '@/stores/chats'

interface Props {
  autoSelectFirst?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoSelectFirst: true,
})
const emit = defineEmits<{
  createChat: [characterId: string]
  selectChat: [chatId: string]
}>()
const chatsStore = useChatsStore()
const charactersStore = useCharactersStore()
const chatStore = useChatStore()
let fetchToken = 0
const DELETE_CONFIRM_SKIP_KEY = 'ui/chat-history/delete-confirm-skip-until'
const DELETE_CONFIRM_SKIP_MS = 30 * 60 * 1000
const deleteConfirmChatId = ref<string | null>(null)
const deleteSkipConfirm = ref(false)

watch(
  () => charactersStore.activeCharacterId,
  async (characterId) => {
    if (characterId) {
      if (chatStore.currentCharacterId === characterId && chatsStore.chatList.length > 0) {
        return
      }

      const token = ++fetchToken
      chatStore.prepareNewChat(characterId)
      const chats = await chatsStore.fetchChats(characterId)

      if (token !== fetchToken) {
        return
      }

      if (chats.length > 0 && props.autoSelectFirst) {
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

const deleteConfirmChat = computed(() => {
  if (!deleteConfirmChatId.value) {
    return null
  }

  return chatsStore.chatList.find(chat => chat.id === deleteConfirmChatId.value) || null
})

const handleCreateChat = async () => {
  const characterId = charactersStore.activeCharacterId
  if (!characterId) {
    alert('请先选择角色')
    return
  }

  chatStore.prepareNewChat(characterId)
  emit('createChat', characterId)
}

const handleSelectChat = (chatId: string) => {
  const characterId = charactersStore.activeCharacterId
  if (characterId) {
    chatStore.setCurrentChat(chatId, characterId)
    emit('selectChat', chatId)
  }
}

function shouldSkipDeleteConfirm() {
  const expiresAt = Number(window.localStorage.getItem(DELETE_CONFIRM_SKIP_KEY))
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
    return false
  }

  if (Date.now() < expiresAt) {
    return true
  }

  window.localStorage.removeItem(DELETE_CONFIRM_SKIP_KEY)
  return false
}

function cacheDeleteConfirmSkip() {
  window.localStorage.setItem(
    DELETE_CONFIRM_SKIP_KEY,
    String(Date.now() + DELETE_CONFIRM_SKIP_MS),
  )
}

function closeDeleteConfirm() {
  deleteConfirmChatId.value = null
  deleteSkipConfirm.value = false
}

const deleteChatById = async (chatId: string) => {
  const characterId = charactersStore.activeCharacterId || chatStore.currentCharacterId

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
    return true
  }
  catch (error) {
    console.error('删除聊天失败:', error)
    alert('删除聊天失败，请重试')
    return false
  }
}

const handleDeleteChat = async (chatId: string, event: Event) => {
  event.stopPropagation()

  if (shouldSkipDeleteConfirm()) {
    await deleteChatById(chatId)
    return
  }

  deleteConfirmChatId.value = chatId
  deleteSkipConfirm.value = false
}

const confirmDeleteChat = async () => {
  if (!deleteConfirmChatId.value) {
    return
  }

  const shouldCacheSkip = deleteSkipConfirm.value
  const deleted = await deleteChatById(deleteConfirmChatId.value)
  if (deleted && shouldCacheSkip) {
    cacheDeleteConfirmSkip()
  }
  closeDeleteConfirm()
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

    <div v-else-if="sortedChats.length === 0" class="section-meta text-sm">暂无聊天记录，请点击“新建聊天”。</div>

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

    <div
      v-if="deleteConfirmChat"
      class="delete-confirm-overlay"
      @click.self="closeDeleteConfirm"
    >
      <div class="delete-confirm-panel">
        <div class="delete-confirm-title">删除聊天历史</div>
        <p class="delete-confirm-copy">
          将删除「{{ deleteConfirmChat.title }}」的聊天记录。此操作会移除前端聊天列表中的标题和消息文件。
        </p>
        <label class="delete-confirm-option">
          <input v-model="deleteSkipConfirm" type="checkbox">
          <span>30 分钟内不再确认删除聊天历史</span>
        </label>
        <div class="delete-confirm-actions">
          <button type="button" class="delete-confirm-cancel" @click="closeDeleteConfirm">
            取消
          </button>
          <button type="button" class="delete-confirm-submit" @click="confirmDeleteChat">
            删除
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

.delete-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 51 69 / 0.22);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.delete-confirm-panel {
  width: min(22rem, 100%);
  border: 1px solid rgb(152 236 255 / 0.48);
  border-radius: 1rem;
  background: rgb(240 252 255 / 0.94);
  padding: 1rem;
  box-shadow: 0 24px 48px rgb(0 81 115 / 0.18);
  color: #0071a0;
}

.delete-confirm-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #006f98;
}

.delete-confirm-copy {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgb(0 113 160 / 0.82);
}

.delete-confirm-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  font-size: 0.78rem;
  color: rgb(0 113 160 / 0.78);
}

.delete-confirm-option input {
  width: 0.9rem;
  height: 0.9rem;
  accent-color: #0081b3;
}

.delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.delete-confirm-cancel,
.delete-confirm-submit {
  border-radius: 0.7rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.delete-confirm-cancel {
  border: 1px solid rgb(152 236 255 / 0.55);
  background: rgb(255 255 255 / 0.62);
  color: #0071a0;
}

.delete-confirm-cancel:hover {
  background: rgb(197 252 255 / 0.66);
}

.delete-confirm-submit {
  border: 1px solid rgb(248 113 113 / 0.36);
  background: rgb(254 226 226 / 0.9);
  color: #b91c1c;
}

.delete-confirm-submit:hover {
  background: rgb(254 202 202 / 0.95);
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

.dark .delete-confirm-overlay {
  background: rgb(0 19 29 / 0.48);
}

.dark .delete-confirm-panel {
  border-color: rgb(41 189 226 / 0.28);
  background: rgb(0 51 69 / 0.94);
  box-shadow: 0 24px 48px rgb(0 0 0 / 0.34);
  color: #c5fcff;
}

.dark .delete-confirm-title {
  color: #f0fcff;
}

.dark .delete-confirm-copy,
.dark .delete-confirm-option {
  color: rgb(197 252 255 / 0.78);
}

.dark .delete-confirm-cancel {
  border-color: rgb(41 189 226 / 0.34);
  background: rgb(0 71 102 / 0.72);
  color: #c5fcff;
}

.dark .delete-confirm-cancel:hover {
  background: rgb(0 91 128 / 0.86);
}

.dark .delete-confirm-submit {
  border-color: rgb(248 113 113 / 0.28);
  background: rgb(127 29 29 / 0.72);
  color: #fecaca;
}

.dark .delete-confirm-submit:hover {
  background: rgb(153 27 27 / 0.78);
}
</style>
