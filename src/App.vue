<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'

import AudioPlayer from '@/components/chat/AudioPlayer.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const route = useRoute()

const showGlobalBackground = computed(() => {
  return Boolean(settingsStore.background.imageUrl) && !route.path.startsWith('/settings')
})

onMounted(() => {
  settingsStore.loadSettings()
})
</script>

<template>
  <div
    v-if="showGlobalBackground"
    class="global-background"
    :style="{
      backgroundImage: `url(${settingsStore.background.imageUrl})`,
      opacity: settingsStore.background.opacity / 100,
      filter: `blur(${settingsStore.background.blur}px)`,
    }"
  />

  <Toaster position="top-center" :duration="2000" />
  <AudioPlayer />
  <RouterView />
</template>

<style>
.global-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  pointer-events: none;
}
</style>
