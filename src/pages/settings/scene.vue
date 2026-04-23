<script setup lang="ts">
import BackgroundCustomizer from '@/components/settings/BackgroundCustomizer.vue'
</script>

<template>
  <div class="scene-settings">
    <h2 class="text-2xl font-bold mb-2">场景设置</h2>
    <p class="text-gray-600 mb-6">自定义聊天背景，打造专属的聊天环境</p>

    <BackgroundCustomizer />
  </div>
</template>

<style scoped>
.scene-settings {
  padding: 2rem;
}
</style>
