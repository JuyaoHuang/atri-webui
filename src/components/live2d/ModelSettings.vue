<script setup lang="ts">
import { ref } from 'vue'

import ModelSettingsPanel from './ModelSettingsPanel.vue'
import ModelSettingsPreviewStage from './ModelSettingsPreviewStage.vue'

withDefaults(defineProps<{
  palette: string[]
  settingsClass?: string | string[]
  allowExtractColors?: boolean
  live2dSceneClass?: string | string[]
}>(), {
  allowExtractColors: true,
})

defineEmits<{
  (e: 'extractColorsFromModel'): void
}>()

const previewStageRef = ref<{ capturePreviewFrame: () => Promise<Blob | undefined> }>()

async function capturePreviewFrame() {
  return previewStageRef.value?.capturePreviewFrame()
}

defineExpose({
  capturePreviewFrame,
})
</script>

<template>
  <ModelSettingsPanel
    :allow-extract-colors="allowExtractColors"
    :palette="palette"
    :settings-class="settingsClass"
    @extract-colors-from-model="$emit('extractColorsFromModel')"
  />
  <ModelSettingsPreviewStage
    ref="previewStageRef"
    :live2d-scene-class="live2dSceneClass"
  />
</template>
