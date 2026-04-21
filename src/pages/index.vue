<script setup lang="ts">
import Sidebar from '@/components/sidebar/Sidebar.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
</script>

<template>
  <div class="app-container w-full h-full bg-gray-900 flex">
    <Sidebar />
    <ChatArea />
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
}
</style>
