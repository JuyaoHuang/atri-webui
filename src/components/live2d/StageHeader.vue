<script setup lang="ts">
import { RouterLink } from 'vue-router'

import HeaderLink from '@/components/layouts/HeaderLink.vue'
import { useTheme } from '@/composables/useTheme'
import { useLive2dStore } from '@/stores/live2d'

const { isDark, toggleDark } = useTheme()
const live2dStore = useLive2dStore()
</script>

<template>
  <header class="stage-header">
    <HeaderLink />

    <div class="stage-header-actions">
      <div class="stage-header-status">
        <span class="stage-header-status__label">AIRI Stage</span>
        <span class="stage-header-status__model">
          {{ live2dStore.activeModel?.name || '未选择模型' }}
        </span>
      </div>

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
  </header>
</template>

<style scoped>
.stage-header {
  margin-bottom: 0.25rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.stage-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stage-header-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.38rem 0.55rem 0.38rem 0.38rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.76);
  border: 1px solid rgb(152 236 255 / 0.38);
  box-shadow: 0 12px 24px rgb(0 129 179 / 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.stage-header-status__label {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #18b5d8, #63d9dc);
  color: white;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stage-header-status__model {
  color: #0071a0;
  font-size: 0.86rem;
  font-weight: 700;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dark .stage-header-status {
  background: rgb(0 51 69 / 0.74);
  border-color: rgb(41 189 226 / 0.24);
  box-shadow: 0 12px 24px rgb(0 0 0 / 0.2);
}

.dark .stage-header-status__model {
  color: #c5fcff;
}

@media (max-width: 768px) {
  .stage-header {
    display: none;
  }
}
</style>
