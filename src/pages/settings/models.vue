<script setup lang="ts">
import { onMounted } from 'vue'

import Live2DCanvas from '@/components/live2d/Live2DCanvas.vue'
import Live2DManager from '@/components/live2d/Live2DManager.vue'
import Live2DPositionControl from '@/components/live2d/Live2DPositionControl.vue'
import { useLive2dStore } from '@/stores/live2d'

const live2dStore = useLive2dStore()

onMounted(() => {
  void live2dStore.fetchModels()
})
</script>

<template>
  <div flex="~ col gap-4" font-normal>
    <div class="models-grid">
      <div class="content-card">
        <Live2DManager />
      </div>

      <div class="preview-column">
        <div class="content-card preview-card">
          <div class="preview-header">
            <div>
              <p class="preview-kicker">Live Preview</p>
              <h2>当前模型预览</h2>
              <p>
                这里会实时展示你当前选中的 Live2D 模型，位置和缩放设置会直接同步到首页舞台。
              </p>
            </div>
          </div>

          <div class="preview-stage">
            <div class="preview-glow" />
            <Live2DCanvas
              :model-url="live2dStore.activeModel?.modelUrl"
              :position="live2dStore.position"
              :scale="live2dStore.scale"
              :expression-request="live2dStore.expressionRequest"
              empty-text="还没有当前模型。先在左侧上传或选择一个 Live2D 模型。"
            />
          </div>
        </div>

        <div class="content-card">
          <Live2DPositionControl />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.models-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 1rem;
}

.preview-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-card {
  border-radius: 1.6rem;
  border: 1px solid rgb(152 236 255 / 0.32);
  background: rgb(240 252 255 / 0.54);
  padding: 1.1rem;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.preview-card {
  overflow: hidden;
}

.preview-header h2 {
  margin-top: 0.25rem;
  color: #0071a0;
  font-size: 1.12rem;
  font-weight: 800;
}

.preview-kicker {
  color: rgb(0 129 179 / 0.58);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preview-header p:last-child {
  margin-top: 0.55rem;
  color: rgb(0 129 179 / 0.74);
  line-height: 1.7;
}

.preview-stage {
  position: relative;
  height: 28rem;
  margin-top: 1rem;
  border-radius: 1.45rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 5%, rgb(255 255 255 / 0.96), transparent 34%),
    linear-gradient(180deg, rgb(235 252 255 / 0.96), rgb(197 252 255 / 0.18));
}

.preview-glow {
  position: absolute;
  inset: auto 12% -32% 12%;
  height: 58%;
  background: radial-gradient(circle, rgb(24 181 216 / 0.22), transparent 70%);
  filter: blur(28px);
  pointer-events: none;
}

.dark .content-card {
  background: rgb(0 51 69 / 0.56);
  border-color: rgb(41 189 226 / 0.22);
}

.dark .preview-header h2 {
  color: #c5fcff;
}

.dark .preview-kicker,
.dark .preview-header p:last-child {
  color: rgb(152 236 255 / 0.78);
}

.dark .preview-stage {
  background:
    radial-gradient(circle at 50% 5%, rgb(197 252 255 / 0.18), transparent 34%),
    linear-gradient(180deg, rgb(0 71 102 / 0.94), rgb(0 51 69 / 0.62));
}

@media (max-width: 1100px) {
  .models-grid {
    grid-template-columns: 1fr;
  }
}
</style>
