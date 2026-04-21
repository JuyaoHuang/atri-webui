<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useChat } from '@/composables/useChat'
import { useChatStore } from '@/stores/chat'
import MessageList from './MessageList.vue'
import InputBox from './InputBox.vue'

const { connect, connected, reconnecting } = useWebSocket()
const { loadHistory } = useChat()
const chatStore = useChatStore()

onMounted(() => {
  connect()
})

// 当切换聊天时，加载历史消息
watch(
  () => chatStore.currentChatId,
  (chatId) => {
    if (chatId) {
      loadHistory(chatId)
    } else {
      chatStore.clearMessages()
    }
  }
)
</script>

<template>
  <div class="chat-area flex-1 flex flex-col">
    <!-- Header -->
    <div class="h-16 bg-gray-800 bg-opacity-80 flex items-center justify-between px-6 border-b border-gray-700">
      <h3 class="text-lg font-semibold text-white">对话区域</h3>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="connected ? 'bg-green-500' : reconnecting ? 'bg-yellow-500' : 'bg-red-500'"
        />
        <span class="text-sm text-gray-400">
          {{ connected ? '已连接' : reconnecting ? '重连中...' : '未连接' }}
        </span>
      </div>
    </div>

    <!-- Message list -->
    <MessageList />

    <!-- Input box -->
    <InputBox />
  </div>
</template>

<style scoped>
.chat-area {
  backdrop-filter: blur(10px);
}
</style>
