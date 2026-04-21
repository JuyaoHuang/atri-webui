<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types/message'
import { useUserStore } from '@/stores/user'

interface Props {
  message: Message
}

const props = defineProps<Props>()
const userStore = useUserStore()

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 获取显示名称
const displayName = computed(() => {
  if (props.message.role === 'human') {
    return userStore.settings.nickname
  }
  return props.message.name || 'AI'
})

// 获取头像
const avatarSrc = computed(() => {
  if (props.message.role === 'human') {
    return `/avatars/${userStore.settings.avatar}`
  }
  return props.message.avatar ? `/avatars/${props.message.avatar}` : null
})
</script>

<template>
  <div class="message-item" :class="message.role === 'human' ? 'human-message' : 'ai-message'">
    <!-- AI 头像 -->
    <div v-if="message.role === 'ai'" class="message-avatar">
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="displayName"
        class="w-8 h-8 rounded-full object-cover"
      />
      <div v-else class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
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

    <!-- 用户头像 -->
    <div v-if="message.role === 'human'" class="message-avatar">
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="displayName"
        class="w-8 h-8 rounded-full object-cover"
      />
      <div v-else class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">
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

/* AI 消息：头像在左，内容在右 */
.message-item.ai-message {
  flex-direction: row;
  justify-content: flex-start;
}

.message-item.ai-message .message-content {
  background: rgba(59, 130, 246, 0.1);
}

.message-item.ai-message .message-role {
  color: #60a5fa;
}

/* 用户消息：头像在右，内容在左 */
.message-item.human-message {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-item.human-message .message-content {
  background: rgba(34, 197, 94, 0.1);
}

.message-item.human-message .message-role {
  color: #4ade80;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  border-radius: 12px;
  padding: 12px 16px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.75rem;
}

.message-role {
  font-weight: 600;
}

.message-time {
  color: #9ca3af;
}

.message-text {
  color: #e5e7eb;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
