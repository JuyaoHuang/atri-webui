<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChat } from '@/composables/useChat'
import MessageItem from './MessageItem.vue'

const { messages, streamingText, isStreaming } = useChat()
const messageListRef = ref<HTMLElement | null>(null)

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

watch([messages, streamingText], () => {
  scrollToBottom()
})
</script>

<template>
  <div ref="messageListRef" class="message-list flex-1 overflow-y-auto p-6 space-y-4">
    <div v-if="messages.length === 0 && !isStreaming" class="text-center text-gray-400 mt-20">
      <p class="text-lg">开始对话吧！</p>
    </div>

    <MessageItem v-for="message in messages" :key="message.id" :message="message" />

    <!-- 流式输出中的消息 -->
    <div v-if="isStreaming && streamingText" class="message-item ai-message">
      <div class="message-content">
        <div class="message-header">
          <span class="message-role">AI</span>
          <span class="message-time">正在输入...</span>
        </div>
        <div class="message-text">{{ streamingText }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  scroll-behavior: smooth;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  background: rgba(59, 130, 246, 0.1);
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
  color: #60a5fa;
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
