<script setup lang="ts">
import { computed } from 'vue'

import { useUserStore } from '@/stores/user'
import type { Message } from '@/types/message'

interface Props {
  message: Message
}

const props = defineProps<Props>()
const userStore = useUserStore()

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const displayName = computed(() => {
  if (props.message.role === 'human') {
    return userStore.settings.nickname
  }

  return props.message.name || 'AI'
})

const avatarSrc = computed(() => {
  if (props.message.role === 'human') {
    return `/avatars/${userStore.settings.avatar}`
  }

  return props.message.avatar ? `/avatars/${props.message.avatar}` : null
})
</script>

<template>
  <div class="message-item" :class="message.role === 'human' ? 'human-message' : 'ai-message'">
    <div v-if="message.role === 'ai'" class="message-avatar">
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="displayName"
        class="w-8 h-8 rounded-full object-cover"
      >
      <div v-else class="fallback-avatar ai-fallback">
        AI
      </div>
    </div>

    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ displayName }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-text">{{ message.content }}</div>
    </div>

    <div v-if="message.role === 'human'" class="message-avatar">
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="displayName"
        class="w-8 h-8 rounded-full object-cover"
      >
      <div v-else class="fallback-avatar user-fallback">
        {{ displayName.slice(0, 2) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-item.ai-message {
  flex-direction: row;
  justify-content: flex-start;
}

.message-item.human-message {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.fallback-avatar {
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: white;
  font-size: 0.875rem;
}

.ai-fallback {
  background: #0081b3;
}

.user-fallback {
  background: #737373;
}

.message-content {
  max-width: 70%;
  min-width: 5rem;
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.message-item.ai-message .message-content {
  background: rgb(240 252 255 / 0.8);
  box-shadow: 0 1px 2px rgb(152 236 255 / 0.5);
  color: #0071a0;
}

.message-item.human-message .message-content {
  background: rgb(245 245 245 / 0.8);
  box-shadow: 0 1px 2px rgb(229 229 229 / 0.5);
  color: rgb(38 38 38);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.message-role {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 400;
  color: rgb(0 0 0 / 0.6);
}

.message-time {
  font-size: 0.75rem;
  color: rgb(0 0 0 / 0.42);
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.dark .message-item.ai-message .message-content {
  background: rgb(0 51 69 / 0.8);
  box-shadow: none;
  color: #c5fcff;
}

.dark .message-item.human-message .message-content {
  background: rgb(38 38 38 / 0.8);
  box-shadow: none;
  color: rgb(245 245 245);
}

.dark .message-role {
  color: rgb(255 255 255 / 0.65);
}

.dark .message-time {
  color: rgb(255 255 255 / 0.42);
}
</style>
