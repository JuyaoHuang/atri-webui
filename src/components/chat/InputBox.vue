<script setup lang="ts">
import { ref } from 'vue'
import { useChat } from '@/composables/useChat'

const { sendMessage, isStreaming } = useChat()
const inputText = ref('')

const handleSend = () => {
  if (!inputText.value.trim() || isStreaming.value) return

  sendMessage(inputText.value.trim())
  inputText.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="input-box h-32 bg-gray-800 bg-opacity-80 border-t border-gray-700 p-4 flex gap-3">
    <textarea
      v-model="inputText"
      class="flex-1 bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
      :disabled="isStreaming"
      @keydown="handleKeydown"
    />
    <button
      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      :disabled="!inputText.trim() || isStreaming"
      @click="handleSend"
    >
      {{ isStreaming ? '发送中...' : '发送' }}
    </button>
  </div>
</template>

<style scoped>
textarea::placeholder {
  color: #9ca3af;
}
</style>
