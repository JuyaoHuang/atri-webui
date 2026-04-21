<script setup lang="ts">
// Sidebar container - will contain CharacterSelector and ChatHistory in US-FE-004
</script>

<template>
  <div class="sidebar w-80 h-full bg-gray-900 bg-opacity-90 flex flex-col">
    <div class="p-4 border-b border-gray-700">
      <h2 class="text-xl font-bold text-white">Atri</h2>
    </div>

    <!-- Character selector placeholder -->
    <div class="p-4 border-b border-gray-700">
      <p class="text-gray-400 text-sm">角色选择器 (US-FE-004)</p>
    </div>

    <!-- Chat history placeholder -->
    <div class="flex-1 overflow-y-auto p-4">
      <p class="text-gray-400 text-sm">聊天历史 (US-FE-004)</p>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}
</style>
