<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useMouse } from '@vueuse/core'

import { useTheme } from '@/composables/useTheme'
import Live2DCanvas from '@/components/live2d/Live2DCanvas.vue'
import StageHeader from '@/components/live2d/StageHeader.vue'
import StageChatShell from '@/components/live2d/StageChatShell.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
import Sidebar from '@/components/sidebar/Sidebar.vue'
import { useCharactersStore } from '@/stores/characters'
import { useLive2dStore } from '@/stores/live2d'

const { isDark, toggleDark } = useTheme()
const charactersStore = useCharactersStore()
const live2dStore = useLive2dStore()
const isLive2dMode = computed(() => live2dStore.enabled)
const mouse = useMouse()

onMounted(() => {
  void charactersStore.fetchCharacters()
  void live2dStore.fetchModels()
})

watch(isLive2dMode, (enabled) => {
  if (enabled) {
    void live2dStore.fetchModels()
  }
})
</script>

<template>
  <div class="app-container w-full h-full flex" :class="{ 'stage-mode': isLive2dMode }">
    <div v-if="!isLive2dMode" class="top-actions">
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

    <template v-if="!isLive2dMode">
      <Sidebar />
      <ChatArea />
    </template>

    <template v-else>
      <div class="stage-layout-shell">
        <div class="stage-header-row">
          <StageHeader />
        </div>

        <div class="stage-layout">
          <div class="stage-page">
            <div class="stage-scene">
              <div class="stage-canvas-shell">
                <Live2DCanvas
                  :model-url="live2dStore.activeModel?.modelUrl"
                  :position="live2dStore.position"
                  :scale="live2dStore.scale"
                  :expression-request="live2dStore.expressionRequest"
                  :model-parameters="live2dStore.modelParameters"
                  :focus-at="{ x: mouse.x.value, y: mouse.y.value }"
                  :disable-focus="live2dStore.disableFocus"
                  :auto-blink-enabled="live2dStore.autoBlinkEnabled"
                  :force-auto-blink-enabled="live2dStore.forceAutoBlinkEnabled"
                  :shadow-enabled="live2dStore.shadowEnabled"
                  :max-fps="live2dStore.maxFps"
                  :resolution="live2dStore.renderScale"
                  empty-text="未找到可用的 Live2D 模型。前往 /settings/models 导入模型后即可启用完整舞台。"
                />
              </div>
            </div>

            <div class="stage-chat-shell">
              <StageChatShell />
            </div>
          </div>
        </div>

        <div class="stage-orb stage-orb-left" />
        <div class="stage-orb stage-orb-right" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  background: transparent;
}

.stage-mode {
  display: block;
}

.top-actions {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stage-layout-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
}

.stage-header-row {
  padding: 0.25rem 0 0.25rem;
}

.stage-layout {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100dvh - 4.25rem);
}

.stage-page {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
}

.stage-scene {
  flex: 1 1 auto;
  min-width: 50%;
  position: relative;
  height: 100%;
  min-height: calc(100dvh - 100px - 56px);
}

.stage-canvas-shell {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-height: calc(100dvh - 100px - 56px);
}

.stage-chat-shell {
  position: absolute;
  right: 1rem;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  z-index: 35;
  width: min(31.25rem, calc(100vw - 2rem));
  min-width: 30%;
  height: 85dvh;
  min-height: 0;
}

.stage-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(56px);
  pointer-events: none;
  opacity: 0.8;
}

.stage-orb-left {
  top: 12%;
  left: 18%;
  width: 16rem;
  height: 16rem;
  background: rgb(152 236 255 / 0.22);
}

.stage-orb-right {
  right: 8%;
  bottom: 20%;
  width: 14rem;
  height: 14rem;
  background: rgb(24 181 216 / 0.18);
}

@media (max-width: 768px) {
  .top-actions {
    top: 1rem;
    right: 1rem;
  }

  .stage-chat-shell {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    width: auto;
    height: min(27rem, calc(100vh - 23rem));
  }

  .stage-layout {
    height: 100dvh;
  }

  .stage-scene,
  .stage-canvas-shell {
    min-height: calc(100dvh - 23rem);
    max-height: calc(100dvh - 23rem);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
