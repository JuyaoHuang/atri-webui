<script setup lang="ts">
import { ref } from 'vue'

import { useChat } from '@/composables/useChat'

const { sendMessage, isStreaming } = useChat()
const inputText = ref('')

const handleSend = async () => {
  if (!inputText.value.trim() || isStreaming.value) {
    return
  }

  const sent = await sendMessage(inputText.value.trim())
  if (sent) {
    inputText.value = ''
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void handleSend()
  }
}
</script>

<template>
  <div class="input-box h-32 p-4 flex gap-3">
    <textarea
      v-model="inputText"
      class="chat-input flex-1 rounded-t-xl p-4 resize-none focus:outline-none"
      placeholder="说点什么..."
      :disabled="isStreaming"
      @keydown="handleKeydown"
    />
    <button
      class="send-button px-5 py-2 rounded-xl transition-colors font-medium"
      :disabled="!inputText.trim() || isStreaming"
      @click="() => void handleSend()"
    >
      {{ isStreaming ? '发送中...' : '发送' }}
    </button>
  </div>
</template>

<style scoped>
.input-box {
  background: rgb(152 236 255 / 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.chat-input {
  min-height: 100%;
  border: 0;
  background: transparent;
  color: #0081b3;
  font-weight: 500;
  line-height: 1.6;
}

.chat-input::placeholder {
  color: #0098c4;
}

.send-button {
  align-self: flex-end;
  background: rgb(240 252 255 / 0.88);
  border: 1px solid rgb(152 236 255 / 0.55);
  color: #0081b3;
}

.send-button:hover {
  background: rgb(197 252 255 / 0.94);
}

.send-button:disabled {
  background: rgb(245 245 245 / 0.78);
  border-color: rgb(229 229 229 / 0.7);
  color: rgb(115 115 115);
  cursor: not-allowed;
}

.dark .input-box {
  background: rgb(41 189 226 / 0.2);
}

.dark .chat-input {
  color: #c5fcff;
}

.dark .chat-input::placeholder {
  color: #98ecff;
}

.dark .send-button {
  background: rgb(0 51 69 / 0.82);
  border-color: rgb(41 189 226 / 0.35);
  color: #c5fcff;
}

.dark .send-button:hover {
  background: rgb(0 71 102 / 0.9);
}

.dark .send-button:disabled {
  background: rgb(38 38 38 / 0.7);
  border-color: rgb(63 63 70 / 0.7);
  color: rgb(161 161 170);
}
</style>
