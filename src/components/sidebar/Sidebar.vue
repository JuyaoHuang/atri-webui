<script setup lang="ts">
import CharacterSelector from './CharacterSelector.vue'
import ChatHistory from './ChatHistory.vue'
</script>

<template>
  <div class="sidebar w-80 h-full flex flex-col">
    <div class="p-4 border-b border-gray-700/50">
      <h2 class="text-xl font-bold text-white">Atri</h2>
    </div>

    <!-- Character selector -->
    <div class="p-4 border-b border-gray-700/50">
      <CharacterSelector />
    </div>

    <!-- Chat history -->
    <div class="flex-1 overflow-hidden p-4">
      <ChatHistory />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}
</style>
