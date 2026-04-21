<script setup lang="ts">
// Chat area container - will contain MessageList and InputBox in US-FE-005
</script>

<template>
  <div class="chat-area flex-1 flex flex-col">
    <!-- Header -->
    <div class="h-16 bg-gray-800 bg-opacity-80 flex items-center px-6 border-b border-gray-700">
      <h3 class="text-lg font-semibold text-white">对话区域</h3>
    </div>

    <!-- Message list placeholder -->
    <div class="flex-1 overflow-y-auto p-6">
      <p class="text-gray-400 text-center">消息列表 (US-FE-005)</p>
    </div>

    <!-- Input box placeholder -->
    <div class="h-32 bg-gray-800 bg-opacity-80 border-t border-gray-700 p-4">
      <p class="text-gray-400 text-sm">输入框 (US-FE-005)</p>
    </div>
  </div>
</template>

<style scoped>
.chat-area {
  backdrop-filter: blur(10px);
}
</style>
