<script setup lang="ts">
import type { Message } from '@/types/message'

interface Props {
  message: Message
}

defineProps<Props>()

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="message-item" :class="message.role === 'human' ? 'human-message' : 'ai-message'">
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ message.role === 'human' ? '你' : 'AI' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-text">{{ message.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 16px;
}

.human-message {
  justify-content: flex-end;
}

.human-message .message-content {
  background: rgba(34, 197, 94, 0.1);
}

.human-message .message-role {
  color: #4ade80;
}

.ai-message {
  justify-content: flex-start;
}

.ai-message .message-content {
  background: rgba(59, 130, 246, 0.1);
}

.ai-message .message-role {
  color: #60a5fa;
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
