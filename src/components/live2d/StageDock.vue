<script setup lang="ts">
import { ref } from 'vue'

import ChatHistory from '@/components/sidebar/ChatHistory.vue'
import CharacterSelector from '@/components/sidebar/CharacterSelector.vue'

const activeTab = ref<'history' | 'characters'>('history')
</script>

<template>
  <aside class="stage-dock">
    <div class="dock-header">
      <div>
        <p class="dock-kicker">Navigation</p>
        <h2>舞台面板</h2>
      </div>

      <div class="dock-tabs">
        <button
          class="dock-tab"
          :class="{ 'is-active': activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          聊天历史
        </button>
        <button
          class="dock-tab"
          :class="{ 'is-active': activeTab === 'characters' }"
          @click="activeTab = 'characters'"
        >
          角色选择
        </button>
      </div>
    </div>

    <div class="dock-content">
      <Transition name="dock-fade" mode="out-in">
        <div v-if="activeTab === 'history'" key="history" class="dock-panel">
          <ChatHistory />
        </div>

        <div v-else key="characters" class="dock-panel">
          <CharacterSelector />
        </div>
      </Transition>
    </div>
  </aside>
</template>

<style scoped>
.stage-dock {
  position: absolute;
  top: 5.5rem;
  left: 1.5rem;
  z-index: 40;
  width: min(24rem, calc(100vw - 2rem));
  border-radius: 1.75rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.8), rgb(240 252 255 / 0.68));
  border: 1px solid rgb(152 236 255 / 0.36);
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  box-shadow:
    0 24px 44px rgb(0 129 179 / 0.12),
    inset 0 1px 0 rgb(255 255 255 / 0.82);
  overflow: hidden;
}

.dock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.1rem 1rem;
  border-bottom: 1px solid rgb(152 236 255 / 0.3);
}

.dock-kicker {
  color: rgb(0 129 179 / 0.58);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dock-header h2 {
  margin-top: 0.2rem;
  color: #0071a0;
  font-size: 1rem;
  font-weight: 800;
}

.dock-tabs {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgb(152 236 255 / 0.14);
}

.dock-tab {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  color: rgb(0 129 179 / 0.72);
  font-size: 0.8rem;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.dock-tab:hover {
  transform: translateY(-1px);
}

.dock-tab.is-active {
  background: linear-gradient(135deg, #18b5d8, #63d9dc);
  color: white;
}

.dock-content {
  padding: 0.9rem;
  max-height: min(68vh, 42rem);
}

.dock-panel {
  min-height: 12rem;
}

.dock-fade-enter-active,
.dock-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.dock-fade-enter-from,
.dock-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.dark .stage-dock {
  background:
    linear-gradient(180deg, rgb(0 71 102 / 0.78), rgb(0 51 69 / 0.72));
  border-color: rgb(41 189 226 / 0.22);
  box-shadow:
    0 24px 44px rgb(0 0 0 / 0.28),
    inset 0 1px 0 rgb(197 252 255 / 0.08);
}

.dark .dock-header {
  border-bottom-color: rgb(41 189 226 / 0.18);
}

.dark .dock-kicker {
  color: rgb(152 236 255 / 0.68);
}

.dark .dock-header h2 {
  color: #c5fcff;
}

.dark .dock-tabs {
  background: rgb(41 189 226 / 0.14);
}

.dark .dock-tab {
  color: rgb(152 236 255 / 0.78);
}

@media (max-width: 960px) {
  .stage-dock {
    top: 4.8rem;
    left: 1rem;
    right: 1rem;
    width: auto;
  }

  .dock-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
