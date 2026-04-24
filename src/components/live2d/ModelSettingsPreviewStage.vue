<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { computed, ref } from 'vue'

import Live2DCanvas from './Live2DCanvas.vue'
import { useLive2dStore } from '@/stores/live2d'

const props = defineProps<{
  live2dSceneClass?: string | string[]
}>()

const live2dStore = useLive2dStore()
const positionCursor = useMouse()
const live2dSceneRef = ref<{ captureFrame: () => Promise<Blob | undefined>, canvasElement: () => HTMLCanvasElement | undefined }>()

const live2dSceneClassList = computed(() => {
  if (!props.live2dSceneClass) {
    return []
  }

  return typeof props.live2dSceneClass === 'string'
    ? [props.live2dSceneClass]
    : props.live2dSceneClass
})

async function capturePreviewFrame() {
  return live2dSceneRef.value?.captureFrame()
}

defineExpose({
  capturePreviewFrame,
})
</script>

<template>
  <div :class="live2dSceneClassList">
    <Live2DCanvas
      ref="live2dSceneRef"
      :model-url="live2dStore.activeModel?.modelUrl"
      :position="live2dStore.position"
      :scale="live2dStore.scale"
      :expression-request="live2dStore.expressionRequest"
      :model-parameters="live2dStore.modelParameters"
      :focus-at="{ x: positionCursor.x.value, y: positionCursor.y.value }"
      :disable-focus="live2dStore.disableFocus"
      :auto-blink-enabled="live2dStore.autoBlinkEnabled"
      :force-auto-blink-enabled="live2dStore.forceAutoBlinkEnabled"
      :shadow-enabled="live2dStore.shadowEnabled"
      :max-fps="live2dStore.maxFps"
      :resolution="live2dStore.renderScale"
      empty-text="No current model."
    />
  </div>
</template>
