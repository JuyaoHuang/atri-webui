<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { Toaster } from 'vue-sonner'

const settingsStore = useSettingsStore()

// 应用启动时加载背景设置
onMounted(() => {
  settingsStore.loadSettings()
})
</script>

<template>
  <!-- 全局背景层 -->
  <div
    v-if="settingsStore.background.imageUrl"
    class="global-background"
    :style="{
      backgroundImage: `url(${settingsStore.background.imageUrl})`,
      opacity: settingsStore.background.opacity / 100,
      filter: `blur(${settingsStore.background.blur}px)`
    }"
  ></div>

  <!-- Toast 通知 -->
  <Toaster position="top-center" :duration="2000" />

  <!-- 路由视图 -->
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
