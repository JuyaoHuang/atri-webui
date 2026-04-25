<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useVoiceInput } from '@/composables/useVoiceInput'
import { useASRStore } from '@/stores/asr'

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const emit = defineEmits<{
  transcript: [text: string]
}>()

const asrStore = useASRStore()
const voiceInput = useVoiceInput({
  onTranscript: text => emit('transcript', text)
})

const buttonTitle = computed(() => {
  if (voiceInput.isTranscribing.value) {
    return 'Transcribing'
  }
  if (voiceInput.isBusy.value) {
    return 'Stop voice input'
  }
  return 'Start voice input'
})

const buttonShapeClass = computed(() => props.compact
  ? 'h-8 w-8 rounded-md border border-transparent text-lg'
  : 'h-10 w-10 rounded-full border border-primary-200/50 shadow-sm dark:border-primary-700/40'
)

const buttonClass = computed(() => {
  if (voiceInput.isBusy.value) {
    return 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/25'
  }

  return props.compact
    ? 'text-neutral-500 hover:bg-neutral-100/70 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
    : 'bg-white/80 text-primary-700 hover:bg-primary-50 dark:bg-neutral-900/70 dark:text-primary-100 dark:hover:bg-primary-900/30'
})

const pulseClass = computed(() => props.compact ? 'rounded-md' : 'rounded-full')
const overlayOffsetClass = computed(() => props.compact ? 'bottom-10' : 'bottom-12')

async function toggleVoiceInput() {
  if (voiceInput.isBusy.value) {
    await voiceInput.stop()
    return
  }

  if (!asrStore.configured) {
    await asrStore.load()
  }
  await voiceInput.start()
}

onMounted(() => {
  if (!asrStore.providers.length) {
    void asrStore.load()
  }
})
</script>

<template>
  <div class="relative flex flex-col items-center">
    <button
      type="button"
      class="relative flex shrink-0 items-center justify-center outline-none transition-all duration-200 active:scale-95"
      :class="[buttonShapeClass, buttonClass]"
      :title="buttonTitle"
      :disabled="voiceInput.isTranscribing.value"
      @click="toggleVoiceInput"
    >
      <span
        v-if="voiceInput.isListening.value || voiceInput.isRecording.value"
        class="absolute inset-0 bg-primary-500/20 animate-ping"
        :class="pulseClass"
      />
      <div
        v-if="voiceInput.isTranscribing.value"
        class="i-solar:refresh-bold-duotone h-5 w-5 animate-spin"
      />
      <div
        v-else-if="voiceInput.isBusy.value"
        class="i-solar:stop-circle-bold-duotone h-5 w-5"
      />
      <div
        v-else
        class="i-solar:microphone-bold-duotone h-5 w-5"
      />
    </button>

    <div
      v-if="voiceInput.interimText.value"
      class="absolute left-1/2 w-56 rounded-lg border border-primary-200/70 bg-white/90 p-2 text-xs text-primary-700 shadow-lg backdrop-blur-md -translate-x-1/2 dark:border-primary-800/60 dark:bg-neutral-900/90 dark:text-primary-200"
      :class="overlayOffsetClass"
    >
      {{ voiceInput.interimText.value }}
    </div>

    <div
      v-if="voiceInput.error.value"
      class="absolute left-1/2 w-64 rounded-lg border border-red-200/70 bg-red-50/95 p-2 text-xs text-red-700 shadow-lg backdrop-blur-md -translate-x-1/2 dark:border-red-800/60 dark:bg-red-900/80 dark:text-red-200"
      :class="overlayOffsetClass"
    >
      {{ voiceInput.error.value }}
    </div>
  </div>
</template>
