<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import { getApiErrorMessage } from '@/api/client'
import Button from '@/components/airi-ui/Button.vue'
import Callout from '@/components/airi-ui/Callout.vue'
import { useDataCleanup } from '@/composables/useDataCleanup'
import { useCharactersStore } from '@/stores/characters'
import { useChatsStore } from '@/stores/chats'
import type { Character } from '@/types/character'
import type { Chat } from '@/types/chat'
import { resolveAvatarUrl } from '@/utils/avatar'

const charactersStore = useCharactersStore()
const chatsStore = useChatsStore()
const {
  currentChatId,
  deleteChatSession,
  clearShortTermMemory,
  clearLongTermMemory,
} = useDataCleanup()

const selectedCharacterId = ref<string | null>(null)
const selectedShortMemoryChatId = ref<string | null>(null)
const pendingChatId = ref<string | null>(null)
const pendingAction = ref<'short' | 'long' | null>(null)
const chatDeleteConfirmId = ref<string | null>(null)
const shortMemoryConfirm = ref(false)
const longMemoryConfirm = ref(false)
const refreshIcon = 'i-solar:refresh-line-duotone'
const trashIcon = 'i-solar:trash-bin-trash-line-duotone'
const broomIcon = 'i-solar:broom-line-duotone'
const cloudCrossIcon = 'i-solar:cloud-cross-line-duotone'

onMounted(async () => {
  await charactersStore.fetchCharacters()
  selectedCharacterId.value = charactersStore.activeCharacterId || charactersStore.characters[0]?.id || null
})

watch(selectedCharacterId, async (characterId) => {
  selectedShortMemoryChatId.value = null
  shortMemoryConfirm.value = false
  longMemoryConfirm.value = false
  chatDeleteConfirmId.value = null

  if (!characterId) {
    return
  }
  await chatsStore.fetchChats(characterId)
}, { immediate: true })

const selectedCharacter = computed(() => {
  if (!selectedCharacterId.value) {
    return null
  }
  return charactersStore.characters.find(character => character.id === selectedCharacterId.value) || null
})

const chats = computed(() => chatsStore.chatList.filter(chat => chat.character_id === selectedCharacterId.value))

const selectedShortMemoryChat = computed(() => {
  if (!selectedShortMemoryChatId.value) {
    return null
  }
  return chats.value.find(chat => chat.id === selectedShortMemoryChatId.value) || null
})

const chatDeleteCandidate = computed(() => {
  if (!chatDeleteConfirmId.value) {
    return null
  }
  return chats.value.find(chat => chat.id === chatDeleteConfirmId.value) || null
})

const chatCountLabel = computed(() => `${chats.value.length} 个标题`)

const shortMemoryConfirmLabel = computed(() => {
  if (!selectedShortMemoryChat.value) {
    return '确认清理所选聊天标题的短期记忆'
  }
  return `确认清理「${selectedShortMemoryChat.value.title}」的短期记忆`
})

watch(chats, (nextChats) => {
  if (!selectedCharacterId.value) {
    selectedShortMemoryChatId.value = null
    shortMemoryConfirm.value = false
    return
  }

  if (selectedShortMemoryChatId.value && nextChats.some(chat => chat.id === selectedShortMemoryChatId.value)) {
    return
  }

  selectedShortMemoryChatId.value = nextChats[0]?.id || null
  shortMemoryConfirm.value = false
}, { immediate: true })

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function avatarFor(character: Character) {
  return resolveAvatarUrl(character.avatar, character.avatarUrl)
}

async function refreshChats(characterId = selectedCharacterId.value) {
  if (!characterId) {
    return
  }
  await chatsStore.fetchChats(characterId)
}

async function handleDeleteChat(chat: Chat) {
  if (!selectedCharacterId.value) {
    return
  }

  pendingChatId.value = chat.id
  try {
    await deleteChatSession(chat.id, selectedCharacterId.value)
    toast.success(`已删除「${chat.title}」`)
    chatDeleteConfirmId.value = null
    await refreshChats()
  } catch (error) {
    console.error(error)
    toast.error(`删除聊天历史失败：${getApiErrorMessage(error)}`)
  } finally {
    pendingChatId.value = null
  }
}

async function handleClearShortTerm() {
  const characterId = selectedCharacterId.value
  const chatId = selectedShortMemoryChatId.value
  if (!characterId || !chatId) {
    return
  }

  pendingAction.value = 'short'
  try {
    const response = await clearShortTermMemory(characterId, chatId)
    toast.success(response.message)
    shortMemoryConfirm.value = false
  } catch (error) {
    console.error(error)
    toast.error(`清理短期记忆失败：${getApiErrorMessage(error)}`)
  } finally {
    pendingAction.value = null
  }
}

async function handleClearLongTerm() {
  const characterId = selectedCharacterId.value
  if (!characterId) {
    return
  }

  pendingAction.value = 'long'
  try {
    const response = await clearLongTermMemory(characterId)
    toast.success(response.message || '长期记忆删除已提交，可能稍后完成。')
    longMemoryConfirm.value = false
  } catch (error) {
    console.error(error)
    toast.error(`清理长期记忆失败：${getApiErrorMessage(error)}`)
  } finally {
    pendingAction.value = null
  }
}
</script>

<template>
  <div flex="~ col gap-4" font-normal pb-8>
    <Callout label="清理范围" theme="primary">
      <p class="text-sm leading-6">
        数据操作只作用于当前登录用户和选中的角色。聊天历史与短期记忆按标题单独清理，长期记忆会提交给 mem0 异步处理。
      </p>
    </Callout>

    <div class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <section class="settings-panel p-3">
        <div class="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <h2 class="text-sm font-semibold text-[#0071a0] dark:text-[#f0fcff]">角色</h2>
            <p class="mt-1 text-xs text-[#0071a0]/62 dark:text-[#98ecff]/64">
              {{ charactersStore.characters.length }} 个可用角色
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            :icon="refreshIcon"
            :loading="charactersStore.loading"
            @click="charactersStore.fetchCharacters()"
          />
        </div>

        <div class="flex flex-col gap-2">
          <button
            v-for="character in charactersStore.characters"
            :key="character.id"
            type="button"
            class="character-row"
            :class="{ 'is-active': selectedCharacterId === character.id }"
            @click="selectedCharacterId = character.id"
          >
            <div class="character-avatar">
              <img
                v-if="avatarFor(character)"
                :src="avatarFor(character) || ''"
                :alt="character.name"
              >
              <span v-else>{{ character.name.slice(0, 1) }}</span>
            </div>
            <div class="min-w-0 flex-1 text-left">
              <div class="truncate text-sm font-medium">{{ character.name }}</div>
              <div class="mt-0.5 truncate text-xs opacity-70">
                {{ character.isSystem ? 'System' : 'Custom' }}
              </div>
            </div>
            <div v-if="selectedCharacterId === character.id" i-solar:check-circle-bold-duotone class="size-4 shrink-0" />
          </button>
        </div>
      </section>

      <section class="flex min-w-0 flex-col gap-4">
        <div class="settings-panel p-4 md:p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-lg font-semibold text-[#0071a0] dark:text-[#f0fcff]">
                  {{ selectedCharacter?.name || '请选择角色' }}
                </h2>
                <span v-if="selectedCharacter" class="scope-pill">
                  当前用户
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-[#0071a0]/72 dark:text-[#c5fcff]/70">
                {{ selectedCharacter?.description || '选择角色后，可以独立清理聊天标题、短期记忆和长期记忆。' }}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              :icon="refreshIcon"
              :disabled="!selectedCharacterId"
              :loading="chatsStore.loading"
              @click="refreshChats()"
            >
              刷新聊天
            </Button>
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
          <section class="settings-panel min-h-80 p-4 md:p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 class="section-title">
                  聊天历史
                </h3>
                <p class="mt-1 text-xs text-[#0071a0]/62 dark:text-[#98ecff]/64">
                  {{ chatCountLabel }}
                </p>
              </div>
              <div i-solar:chat-round-line-duotone class="size-7 text-[#0081b3]/55 dark:text-[#98ecff]/58" />
            </div>

            <div v-if="chatsStore.loading" class="empty-state">
              <div i-solar:refresh-line-duotone class="size-6 animate-spin" />
              <span>正在加载聊天标题</span>
            </div>

            <div v-else-if="!selectedCharacterId" class="empty-state">
              <div i-solar:user-rounded-linear class="size-6" />
              <span>先选择一个角色</span>
            </div>

            <div v-else-if="chats.length === 0" class="empty-state">
              <div i-solar:chat-line-linear class="size-6" />
              <span>这个角色还没有聊天标题</span>
            </div>

            <div v-else class="flex flex-col gap-2">
              <article
                v-for="chat in chats"
                :key="chat.id"
                class="chat-row"
                :class="{
                  'is-current': currentChatId === chat.id,
                  'is-memory-selected': selectedShortMemoryChatId === chat.id
                }"
                role="button"
                tabindex="0"
                @click="selectedShortMemoryChatId = chat.id"
                @keydown.enter.prevent="selectedShortMemoryChatId = chat.id"
                @keydown.space.prevent="selectedShortMemoryChatId = chat.id"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="truncate text-sm font-medium text-[#0071a0] dark:text-[#f0fcff]">
                      {{ chat.title }}
                    </h4>
                    <span v-if="currentChatId === chat.id" class="current-pill">打开中</span>
                    <span v-if="selectedShortMemoryChatId === chat.id" class="memory-pill">短期记忆</span>
                  </div>
                  <p class="mt-1 text-xs text-[#0071a0]/58 dark:text-[#98ecff]/58">
                    {{ formatDate(chat.updated_at) }}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  :icon="trashIcon"
                  :loading="pendingChatId === chat.id"
                  @click.stop="chatDeleteConfirmId = chat.id"
                />
              </article>
            </div>
          </section>

          <aside class="flex min-w-0 flex-col gap-4">
            <section class="settings-panel p-4 md:p-5">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 class="section-title">
                    短期记忆
                  </h3>
                  <p class="mt-1 text-xs text-[#0071a0]/62 dark:text-[#98ecff]/64">
                    文件与内存状态同步清理
                  </p>
                </div>
                <div i-solar:bolt-circle-line-duotone class="size-7 text-amber-500/70" />
              </div>

              <p class="mb-4 text-sm leading-6 text-[#0071a0]/72 dark:text-[#c5fcff]/70">
                清理选中聊天标题的 recent messages、active blocks 和 meta blocks，不影响同角色下的其他标题。
              </p>

              <div class="memory-target" :class="{ 'is-empty': !selectedShortMemoryChat }">
                <div class="min-w-0">
                  <div class="text-[0.68rem] font-semibold uppercase tracking-wide text-[#0071a0]/55 dark:text-[#98ecff]/58">
                    目标聊天
                  </div>
                  <div class="mt-1 truncate text-sm font-medium text-[#0071a0] dark:text-[#f0fcff]">
                    {{ selectedShortMemoryChat?.title || '没有可清理的聊天标题' }}
                  </div>
                  <div v-if="selectedShortMemoryChat" class="mt-1 text-xs text-[#0071a0]/58 dark:text-[#98ecff]/58">
                    {{ formatDate(selectedShortMemoryChat.updated_at) }}
                  </div>
                </div>
                <div
                  v-if="selectedShortMemoryChat"
                  i-solar:check-circle-bold-duotone
                  class="size-5 shrink-0 text-amber-500/80"
                />
              </div>

              <label class="confirm-row">
                <input v-model="shortMemoryConfirm" type="checkbox" :disabled="!selectedShortMemoryChat">
                <span>{{ shortMemoryConfirmLabel }}</span>
              </label>

              <Button
                class="mt-3"
                block
                variant="caution"
                :icon="broomIcon"
                :disabled="!selectedCharacterId || !selectedShortMemoryChatId || !shortMemoryConfirm"
                :loading="pendingAction === 'short'"
                @click="handleClearShortTerm"
              >
                清理短期记忆
              </Button>
            </section>

            <section class="settings-panel p-4 md:p-5">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 class="section-title">
                    长期记忆
                  </h3>
                  <p class="mt-1 text-xs text-[#0071a0]/62 dark:text-[#98ecff]/64">
                    mem0 user_id + agent_id
                  </p>
                </div>
                <div i-solar:cloud-storage-line-duotone class="size-7 text-[#0081b3]/62 dark:text-[#98ecff]/64" />
              </div>

              <p class="mb-4 text-sm leading-6 text-[#0071a0]/72 dark:text-[#c5fcff]/70">
                清理请求会提交给 mem0，Dashboard 中的数据可能稍后才完成删除。
              </p>

              <label class="confirm-row">
                <input v-model="longMemoryConfirm" type="checkbox">
                <span>确认提交长期记忆删除</span>
              </label>

              <Button
                class="mt-3"
                block
                variant="danger"
                :icon="cloudCrossIcon"
                :disabled="!selectedCharacterId || !longMemoryConfirm"
                :loading="pendingAction === 'long'"
                @click="handleClearLongTerm"
              >
                清理长期记忆
              </Button>
            </section>
          </aside>
        </div>
      </section>
    </div>

    <div
      v-if="chatDeleteCandidate"
      class="confirm-overlay"
      @click.self="chatDeleteConfirmId = null"
    >
      <div class="confirm-panel">
        <div class="flex items-start gap-3">
          <div class="confirm-icon" i-solar:trash-bin-trash-bold-duotone />
          <div class="min-w-0">
            <h3 class="text-base font-semibold text-[#0071a0] dark:text-[#f0fcff]">
              删除聊天历史
            </h3>
            <p class="mt-2 text-sm leading-6 text-[#0071a0]/72 dark:text-[#c5fcff]/70">
              将删除「{{ chatDeleteCandidate.title }}」的聊天记录。这个操作和首页侧边栏删除单个聊天标题一致。
            </p>
          </div>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" @click="chatDeleteConfirmId = null">
            取消
          </Button>
          <Button
            variant="danger"
            :icon="trashIcon"
            :loading="pendingChatId === chatDeleteCandidate.id"
            @click="handleDeleteChat(chatDeleteCandidate)"
          >
            删除
          </Button>
        </div>
      </div>
    </div>

    <div
      v-motion
      pointer-events-none
      fixed bottom-0 right--5 top="[calc(100dvh-15rem)]" z--1
      size-60
      flex items-center justify-center
      text="neutral-200/50 dark:neutral-600/20"
      :initial="{ scale: 0.9, opacity: 0, y: 20 }"
      :enter="{ scale: 1, opacity: 1, y: 0 }"
      :duration="500"
    >
      <div text="60" i-solar:database-bold-duotone />
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  border: 1px solid rgb(152 236 255 / 0.35);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.68);
  box-shadow: 0 20px 50px rgb(0 129 179 / 0.08);
  backdrop-filter: blur(14px);
}

.dark .settings-panel {
  border-color: rgb(41 189 226 / 0.22);
  background: rgb(2 44 56 / 0.72);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.24);
}

.section-title {
  color: #0071a0;
  font-size: 0.95rem;
  font-weight: 650;
}

.dark .section-title {
  color: #f0fcff;
}

.character-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 4rem;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.9rem;
  color: #0071a0;
  background: rgb(255 255 255 / 0.46);
  transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.character-row:hover,
.character-row.is-active {
  border-color: rgb(0 129 179 / 0.22);
  background: rgb(152 236 255 / 0.2);
  transform: translateY(-1px);
}

.dark .character-row {
  color: #c5fcff;
  background: rgb(255 255 255 / 0.06);
}

.dark .character-row:hover,
.dark .character-row.is-active {
  border-color: rgb(152 236 255 / 0.24);
  background: rgb(152 236 255 / 0.1);
}

.character-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgb(255 255 255 / 0.48);
  border-radius: 0.9rem;
  background: rgb(152 236 255 / 0.22);
  font-weight: 650;
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scope-pill,
.current-pill,
.memory-pill {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgb(0 129 179 / 0.1);
  color: #0081b3;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
}

.dark .scope-pill,
.dark .current-pill,
.dark .memory-pill {
  background: rgb(152 236 255 / 0.12);
  color: #c5fcff;
}

.memory-pill {
  background: rgb(245 158 11 / 0.14);
  color: #b45309;
}

.dark .memory-pill {
  background: rgb(245 158 11 / 0.16);
  color: #fde68a;
}

.chat-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid rgb(152 236 255 / 0.24);
  border-radius: 0.9rem;
  background: rgb(255 255 255 / 0.5);
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.chat-row:hover,
.chat-row:focus-visible {
  border-color: rgb(0 129 179 / 0.3);
  background: rgb(152 236 255 / 0.16);
  outline: none;
  transform: translateY(-1px);
}

.chat-row.is-current {
  border-color: rgb(0 129 179 / 0.34);
  background: rgb(152 236 255 / 0.2);
}

.chat-row.is-memory-selected {
  border-color: rgb(245 158 11 / 0.45);
  background: rgb(245 158 11 / 0.1);
}

.dark .chat-row {
  border-color: rgb(41 189 226 / 0.18);
  background: rgb(255 255 255 / 0.06);
}

.dark .chat-row:hover,
.dark .chat-row:focus-visible {
  border-color: rgb(152 236 255 / 0.25);
  background: rgb(152 236 255 / 0.1);
}

.dark .chat-row.is-current {
  border-color: rgb(152 236 255 / 0.25);
  background: rgb(152 236 255 / 0.1);
}

.dark .chat-row.is-memory-selected {
  border-color: rgb(245 158 11 / 0.36);
  background: rgb(245 158 11 / 0.12);
}

.memory-target {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  padding: 0.8rem;
  border: 1px solid rgb(245 158 11 / 0.32);
  border-radius: 0.85rem;
  background: rgb(245 158 11 / 0.08);
}

.memory-target.is-empty {
  border-color: rgb(0 129 179 / 0.18);
  background: rgb(255 255 255 / 0.34);
}

.dark .memory-target {
  border-color: rgb(245 158 11 / 0.26);
  background: rgb(245 158 11 / 0.1);
}

.dark .memory-target.is-empty {
  border-color: rgb(152 236 255 / 0.14);
  background: rgb(255 255 255 / 0.04);
}

.empty-state {
  min-height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.65rem;
  border: 1px dashed rgb(0 129 179 / 0.2);
  border-radius: 0.9rem;
  color: rgb(0 113 160 / 0.6);
  background: rgb(255 255 255 / 0.34);
}

.dark .empty-state {
  border-color: rgb(152 236 255 / 0.16);
  color: rgb(197 252 255 / 0.62);
  background: rgb(255 255 255 / 0.04);
}

.confirm-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: rgb(0 113 160 / 0.72);
  font-size: 0.84rem;
}

.confirm-row input {
  width: 0.95rem;
  height: 0.95rem;
  accent-color: #0081b3;
}

.dark .confirm-row {
  color: rgb(197 252 255 / 0.72);
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(0 35 51 / 0.28);
  backdrop-filter: blur(10px);
}

.confirm-panel {
  width: min(28rem, 100%);
  border: 1px solid rgb(152 236 255 / 0.42);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.94);
  box-shadow: 0 28px 70px rgb(0 51 71 / 0.22);
  padding: 1.25rem;
}

.dark .confirm-panel {
  border-color: rgb(41 189 226 / 0.28);
  background: rgb(0 51 69 / 0.94);
}

.confirm-icon {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  color: #ef4444;
}
</style>
