<script setup lang="ts">
import CharacterSelector from './CharacterSelector.vue'
import ChatHistory from './ChatHistory.vue'
</script>

<template>
  <div class="sidebar w-80 h-full flex flex-col">
    <div class="sidebar-section sidebar-header p-4">
      <h2 class="sidebar-title text-xl font-bold">Atri</h2>
    </div>

    <div class="sidebar-section p-4">
      <CharacterSelector />
    </div>

    <div class="sidebar-history flex-1 overflow-hidden p-4">
      <ChatHistory />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  background: rgb(240 252 255 / 0.46);
  border-right: 1px solid rgb(152 236 255 / 0.42);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 2px 0 14px rgb(0 129 179 / 0.08);
}

.sidebar-section {
  border-bottom: 1px solid rgb(152 236 255 / 0.35);
}

.sidebar-history {
  min-height: 0;
}

.sidebar-title {
  color: #0081b3;
}

.dark .sidebar {
  background: rgb(0 51 69 / 0.52);
  border-right-color: rgb(41 189 226 / 0.28);
  box-shadow: 2px 0 14px rgb(0 0 0 / 0.28);
}

.dark .sidebar-section {
  border-bottom-color: rgb(41 189 226 / 0.2);
}

.dark .sidebar-title {
  color: #c5fcff;
}
</style>
