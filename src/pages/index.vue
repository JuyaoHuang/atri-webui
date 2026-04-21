<script setup lang="ts">
import Background from '@/components/background/Background.vue'
import Sidebar from '@/components/sidebar/Sidebar.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
</script>

<template>
  <div class="app-container w-full h-full">
    <Background />
    <div class="main-layout flex h-full">
      <Sidebar />
      <ChatArea />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
}

.main-layout {
  position: relative;
  z-index: 1;
}
</style>
