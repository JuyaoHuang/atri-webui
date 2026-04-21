<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'

const settingsStore = useSettingsStore()

const backgroundStyle = computed(() => {
  const { type, value, opacity } = settingsStore.background

  if (type === 'image') {
    return {
      backgroundImage: `url(${value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: opacity / 100
    }
  } else {
    return {
      backgroundColor: value,
      opacity: opacity / 100
    }
  }
})
</script>

<template>
  <div class="fixed inset-0 -z-10" :style="backgroundStyle"></div>
</template>

<style scoped>
/* Background layer is behind all content */
</style>
