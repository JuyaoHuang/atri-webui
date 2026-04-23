<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import Sidebar from '@/components/sidebar/Sidebar.vue'
import ChatArea from '@/components/chat/ChatArea.vue'

const { isDark, toggleDark } = useTheme()
</script>

<template>
  <div class="app-container w-full h-full flex">
    <!-- 右上角按钮组 - 直接使用 AIRI 的原生代码 -->
    <div class="top-actions">
      <!-- 主题切换按钮 - 来自 AIRI MobileInteractiveArea.vue 第 199-204 行 -->
      <button
        border="2 solid neutral-100/60 dark:neutral-800/30"
        bg="neutral-50/70 dark:neutral-800/70"
        w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md
        title="Theme"
        @click="toggleDark()"
      >
        <Transition name="fade" mode="out-in">
          <div v-if="isDark" i-solar:moon-outline size-5 text="neutral-500 dark:neutral-400" />
          <div v-else i-solar:sun-2-outline size-5 text="neutral-500 dark:neutral-400" />
        </Transition>
      </button>

      <!-- 设置按钮 - 来自 AIRI MobileInteractiveArea.vue 第 211-213 行 -->
      <RouterLink
        to="/settings"
        border="2 solid neutral-100/60 dark:neutral-800/30"
        bg="neutral-50/70 dark:neutral-800/70"
        w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md
        title="Settings"
      >
        <div i-solar:settings-outline size-5 text="neutral-500 dark:neutral-400" />
      </RouterLink>
    </div>

    <Sidebar />
    <ChatArea />
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  background: transparent;
}

.top-actions {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .top-actions {
    top: 1rem;
    right: 1rem;
  }
}

/* AIRI 的 fade 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
