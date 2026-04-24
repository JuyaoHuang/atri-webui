<script setup lang="ts">
import { computed } from 'vue'

import { useLive2dStore } from '@/stores/live2d'

const live2dStore = useLive2dStore()

const scalePercentage = computed(() => `${Math.round(live2dStore.scale * 100)}%`)
</script>

<template>
  <div class="position-control">
    <div class="control-header">
      <div>
        <h3>位置与尺寸</h3>
        <p>调整当前模型在主舞台中的位置和缩放，设置会自动保存。</p>
      </div>

      <button class="reset-button" @click="live2dStore.resetTransform()">
        重置
      </button>
    </div>

    <label class="control-item">
      <div class="control-label">
        <span>缩放</span>
        <strong>{{ scalePercentage }}</strong>
      </div>
      <input
        :value="live2dStore.scale"
        type="range"
        min="0.4"
        max="2.4"
        step="0.01"
        @input="live2dStore.setScale(Number(($event.target as HTMLInputElement).value))"
      >
    </label>

    <label class="control-item">
      <div class="control-label">
        <span>X 偏移</span>
        <strong>{{ live2dStore.position.x }}px</strong>
      </div>
      <input
        :value="live2dStore.position.x"
        type="range"
        min="-360"
        max="360"
        step="1"
        @input="live2dStore.setPosition({ x: Number(($event.target as HTMLInputElement).value) })"
      >
    </label>

    <label class="control-item">
      <div class="control-label">
        <span>Y 偏移</span>
        <strong>{{ live2dStore.position.y }}px</strong>
      </div>
      <input
        :value="live2dStore.position.y"
        type="range"
        min="-260"
        max="260"
        step="1"
        @input="live2dStore.setPosition({ y: Number(($event.target as HTMLInputElement).value) })"
      >
    </label>
  </div>
</template>

<style scoped>
.position-control {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.control-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.control-header h3 {
  color: #0071a0;
  font-size: 1rem;
  font-weight: 700;
}

.control-header p {
  margin-top: 0.35rem;
  color: rgb(0 129 179 / 0.72);
  font-size: 0.9rem;
  line-height: 1.6;
}

.reset-button {
  flex-shrink: 0;
  border: 1px solid rgb(152 236 255 / 0.55);
  border-radius: 999px;
  background: rgb(240 252 255 / 0.82);
  color: #0081b3;
  padding: 0.55rem 1rem;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.reset-button:hover {
  background: rgb(197 252 255 / 0.94);
  transform: translateY(-1px);
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: rgb(0 113 160 / 0.82);
  font-size: 0.9rem;
}

.control-label strong {
  color: #0081b3;
  font-weight: 700;
}

input[type='range'] {
  width: 100%;
  accent-color: #18b5d8;
}

.dark .control-header h3,
.dark .control-label strong {
  color: #c5fcff;
}

.dark .control-header p,
.dark .control-label {
  color: rgb(152 236 255 / 0.78);
}

.dark .reset-button {
  background: rgb(0 51 69 / 0.82);
  border-color: rgb(41 189 226 / 0.32);
  color: #c5fcff;
}

.dark .reset-button:hover {
  background: rgb(0 71 102 / 0.9);
}
</style>
