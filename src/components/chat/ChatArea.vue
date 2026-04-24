<script setup lang="ts">
import { onMounted, watch } from 'vue'

import { useChat } from '@/composables/useChat'
import { useWebSocket } from '@/composables/useWebSocket'
import { useChatStore } from '@/stores/chat'

import InputBox from './InputBox.vue'
import MessageList from './MessageList.vue'

const { connect, connected, reconnecting } = useWebSocket()
const { loadHistory } = useChat()
const chatStore = useChatStore()

onMounted(() => {
  connect()
})

watch(
  () => chatStore.currentChatId,
  (chatId) => {
    if (chatId) {
      if (chatId.startsWith('draft_')) {
        return
      }
      if (chatStore.consumeSkipNextHistoryLoad(chatId)) {
        return
      }
      loadHistory(chatId)
    }
    else {
      chatStore.clearMessages()
    }
  },
)
</script>

<template>
  <div class="chat-area flex-1 flex flex-col">
    <div class="chat-header h-16 flex items-center justify-between px-6 border-b">
      <h3 class="chat-title text-lg font-semibold">对话区域</h3>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="connected ? 'bg-green-500' : reconnecting ? 'bg-yellow-500' : 'bg-red-500'"
        />
        <span class="chat-status text-sm">
          {{ connected ? '已连接' : reconnecting ? '重连中...' : '未连接' }}
        </span>
      </div>
    </div>

    <MessageList />
    <InputBox />
  </div>
</template>

<style scoped>
.chat-area {
  background: transparent;
}

.chat-header {
  background: rgb(152 236 255 / 0.2);
  border-color: rgb(152 236 255 / 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.chat-title {
  color: #0081b3;
}

.chat-status {
  color: rgb(0 129 179 / 0.78);
}

.dark .chat-header {
  background: rgb(41 189 226 / 0.2);
  border-color: rgb(41 189 226 / 0.28);
}

.dark .chat-title {
  color: #c5fcff;
}

.dark .chat-status {
  color: rgb(152 236 255 / 0.8);
}
</style>
