<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import AiriAlert from '@/components/hearing/AiriAlert.vue'
import AiriErrorContainer from '@/components/hearing/AiriErrorContainer.vue'
import AiriRadioCardSimple from '@/components/hearing/AiriRadioCardSimple.vue'
import AiriTestDummyMarker from '@/components/hearing/AiriTestDummyMarker.vue'
import Button from '@/components/airi-ui/Button.vue'
import Checkbox from '@/components/airi-ui/Checkbox.vue'
import FieldCheckbox from '@/components/airi-ui/FieldCheckbox.vue'
import FieldComboboxSelect from '@/components/airi-ui/FieldComboboxSelect.vue'
import FieldRange from '@/components/airi-ui/FieldRange.vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import type { TTSProviderConfig } from '@/api/types'
import { useTTSStore } from '@/stores/tts'

const ttsStore = useTTSStore()
const audioPlayer = useAudioPlayer()

const testText = ref('你好，我是 ATRI。今天也会陪你继续推进。')
const testError = ref('')

const activeProviderName = computed({
  get: () => ttsStore.config.tts_model,
  set: (value: string) => {
    void ttsStore.switchProvider(value)
  }
})

const moduleEnabled = computed({
  get: () => ttsStore.moduleEnabled,
  set: (value: boolean) => {
    void ttsStore.updateEnabled(value)
  }
})

const autoPlayEnabled = computed({
  get: () => ttsStore.autoPlayEnabled,
  set: (value: boolean) => {
    void ttsStore.updateAutoPlay(value)
  }
})

const showPlayerOnHome = computed({
  get: () => ttsStore.showPlayerOnHome,
  set: (value: boolean) => {
    void ttsStore.updateShowPlayerOnHome(value)
  }
})

const outputVolume = computed({
  get: () => ttsStore.outputVolume,
  set: (value: number) => {
    void ttsStore.updateVolume(value)
  }
})

const activeProvider = computed(() => ttsStore.activeProvider)
const activeConfig = computed(() => ttsStore.activeProviderConfig)
const voiceModelProviders = new Set(['edge_tts', 'siliconflow_tts'])

const selectedVoice = computed({
  get: () => {
    if (activeProviderName.value === 'edge_tts') {
      return configString('voice', 'zh-CN-XiaoxiaoNeural')
    }
    if (activeProviderName.value === 'siliconflow_tts') {
      return configString('default_voice', 'FunAudioLLM/CosyVoice2-0.5B:claire')
    }
    if (activeProviderName.value === 'cosyvoice3_tts') {
      return configString('sft_dropdown')
    }
    return ''
  },
  set: (value: string) => {
    if (activeProviderName.value === 'edge_tts') {
      void updateActiveProviderConfig({ voice: value })
      return
    }
    if (activeProviderName.value === 'siliconflow_tts') {
      void updateActiveProviderConfig({ default_voice: value })
      return
    }
  }
})

const voiceOptions = computed(() => {
  const voices = ttsStore.voices.map(voice => ({
    label: voice.language ? `${voice.name} (${voice.language})` : voice.name,
    value: voice.id,
    description: voice.description || undefined
  }))

  if (voices.length > 0) {
    return voices
  }

  return [
    {
      label: selectedVoice.value || 'Configured voice',
      value: selectedVoice.value,
      description: 'Configured voice'
    }
  ]
})

const testButtonIconClass = computed(() => ttsStore.synthesizing
  ? 'i-solar:refresh-bold-duotone mr-2 text-lg animate-spin'
  : 'i-solar:play-bold-duotone mr-2 text-lg'
)

const moduleToggleIconClass = 'i-solar:user-speak-rounded-bold-duotone h-5 w-5'

function configString(key: string, fallback = '') {
  const value = activeConfig.value[key]
  return typeof value === 'string' ? value : fallback
}

function configNumber(key: string, fallback: number) {
  const value = activeConfig.value[key]
  return typeof value === 'number' ? value : fallback
}

function configBoolean(key: string, fallback = false) {
  const value = activeConfig.value[key]
  return typeof value === 'boolean' ? value : fallback
}

async function updateActiveProviderConfig(patch: TTSProviderConfig) {
  await ttsStore.updateProviderConfig(activeProviderName.value, patch)
}

function updateTextConfig(key: string, event: Event) {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
  void updateActiveProviderConfig({ [key]: value })
}

async function testSynthesis() {
  testError.value = ''
  if (!ttsStore.moduleEnabled) {
    testError.value = 'TTS module is disabled'
    return
  }
  if (!testText.value.trim()) {
    testError.value = 'Test text is empty'
    return
  }

  try {
    const options: { source: 'test', voiceId?: string } = { source: 'test' }
    if (voiceModelProviders.has(activeProviderName.value) && selectedVoice.value) {
      options.voiceId = selectedVoice.value
    }
    await audioPlayer.enqueueText(testText.value, options)
  } catch (error) {
    testError.value = error instanceof Error ? error.message : String(error)
  }
}

watch(activeProviderName, (provider) => {
  void ttsStore.loadVoices(provider)
})

onMounted(async () => {
  await ttsStore.load()
  await ttsStore.loadVoices()
})
</script>

<template>
  <div flex="~ col md:row gap-6">
    <div bg="neutral-100 dark:[rgba(0,0,0,0.3)]" rounded-xl p-4 flex="~ col gap-4" class="h-fit w-full md:w-[40%]">
      <AiriErrorContainer v-if="ttsStore.error" title="TTS Error" :error="ttsStore.error" />

      <label class="tts-module-toggle">
        <div class="tts-module-toggle__icon">
          <div :class="moduleToggleIconClass" />
        </div>
        <div class="tts-module-toggle__copy">
          <span class="tts-module-toggle__label">TTS Module</span>
          <span class="tts-module-toggle__hint">
            {{ ttsStore.moduleEnabled ? 'Voice output is enabled' : 'Voice output is disabled' }}
          </span>
        </div>
        <Checkbox
          class="tts-module-toggle__switch"
          v-model="moduleEnabled"
        />
      </label>

      <div flex="~ col gap-4">
        <div>
          <h2 class="text-lg text-neutral-500 md:text-2xl dark:text-neutral-500">
            Providers
          </h2>
          <div text="neutral-400 dark:neutral-400">
            Select the TTS provider used for voice output.
          </div>
        </div>

        <fieldset
          v-if="ttsStore.providers.length > 0"
          class="grid grid-cols-1 gap-3"
          min-w-0
          role="radiogroup"
        >
          <AiriRadioCardSimple
            v-for="provider in ttsStore.providers"
            :id="provider.name"
            :key="provider.name"
            v-model="activeProviderName"
            name="provider"
            :value="provider.name"
            :title="provider.display_name"
            :description="provider.description"
          >
            <template #topRight>
              <div
                class="size-2.5 rounded-full"
                :class="provider.available ? 'bg-green-500' : 'bg-amber-400'"
                :title="provider.reason || (provider.available ? 'Available' : 'Unavailable')"
              />
            </template>
          </AiriRadioCardSimple>
        </fieldset>
        <AiriAlert v-else type="loading">
          <template #title>
            Loading providers
          </template>
        </AiriAlert>
      </div>

      <AiriAlert v-if="activeProvider && !activeProvider.available" type="warning">
        <template #title>
          Provider unavailable
        </template>
        <template #content>
          {{ activeProvider.reason }}
        </template>
      </AiriAlert>

      <div class="border-t border-neutral-200 pt-4 dark:border-neutral-700" flex="~ col gap-4">
        <FieldCheckbox
          v-model="autoPlayEnabled"
          label="Auto-play AI replies"
          description="Speak completed AI replies after streaming finishes."
        />

        <FieldCheckbox
          v-model="showPlayerOnHome"
          label="Show playback control on home"
          description="Display the floating player on / while speech is playing."
        />

        <FieldRange
          v-model="outputVolume"
          label="Playback volume"
          description="Adjust browser playback volume for generated speech."
          :min="0"
          :max="1"
          :step="0.05"
          :format-value="value => `${Math.round(value * 100)}%`"
        />
      </div>
    </div>

    <div flex="~ col gap-6" class="w-full md:w-[60%]">
      <div w-full rounded-xl bg="neutral-50 dark:[rgba(0,0,0,0.3)]" p-4 flex="~ col gap-4">
        <h2 class="text-lg text-neutral-500 md:text-2xl dark:text-neutral-400">
          Provider Settings
        </h2>

        <div v-if="activeProviderName === 'edge_tts'" flex="~ col gap-4">
          <FieldComboboxSelect
            v-model="selectedVoice"
            label="Voice model"
            description="Edge neural voice id."
            :options="voiceOptions"
            layout="vertical"
          />
          <div class="grid gap-2">
            <label class="text-sm font-medium">Rate</label>
            <input
              class="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900"
              :value="configString('rate', '+0%')"
              placeholder="+0%"
              @change="event => updateTextConfig('rate', event)"
            >
          </div>
        </div>

        <div v-else-if="activeProviderName === 'siliconflow_tts'" flex="~ col gap-4">
          <FieldComboboxSelect
            v-model="selectedVoice"
            label="Voice model"
            description="SiliconFlow voice id."
            :options="voiceOptions"
            layout="vertical"
          />
          <FieldCheckbox
            :model-value="configBoolean('stream', false)"
            label="Request streaming mode"
            description="The backend still returns a complete audio response."
            @update:model-value="value => updateActiveProviderConfig({ stream: value })"
          />
        </div>

        <div v-else-if="activeProviderName === 'cosyvoice3_tts'" flex="~ col gap-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Model</label>
            <input
              class="cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500 outline-none dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400"
              :value="configString('sft_dropdown', '中文女')"
              readonly
              disabled
            >
          </div>
          <FieldCheckbox
            :model-value="configBoolean('stream', false)"
            label="Request streaming mode"
            description="The backend still returns a complete audio response."
            @update:model-value="value => updateActiveProviderConfig({ stream: value })"
          />
          <FieldRange
            :model-value="configNumber('speed', 1)"
            label="Speed"
            description="Speech speed multiplier."
            :min="0.5"
            :max="2"
            :step="0.05"
            :format-value="value => `${value.toFixed(2)}x`"
            @update:model-value="value => updateActiveProviderConfig({ speed: value })"
          />
        </div>
      </div>

      <div w-full rounded-xl bg="neutral-50 dark:[rgba(0,0,0,0.3)]" p-4 flex="~ col gap-4">
        <h2 class="text-lg text-neutral-500 md:text-2xl dark:text-neutral-400">
          <div class="inline-flex items-center gap-4">
            <AiriTestDummyMarker />
            <div>Speech Test</div>
          </div>
        </h2>

        <AiriErrorContainer v-if="testError || audioPlayer.error.value" title="Error occurred" :error="testError || audioPlayer.error.value" />

        <div class="grid gap-2">
          <label class="text-sm font-medium">Text</label>
          <textarea
            v-model="testText"
            class="min-h-28 resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900"
          />
        </div>

        <Button
          :disabled="!ttsStore.moduleEnabled || ttsStore.synthesizing"
          @click="testSynthesis"
        >
          <div :class="testButtonIconClass" />
          {{ ttsStore.synthesizing ? 'Synthesizing...' : 'Play test speech' }}
        </Button>

        <div class="text-xs text-neutral-500 dark:text-neutral-400">
          <div>Provider: <span class="font-medium">{{ activeProvider?.display_name || activeProviderName }}</span></div>
          <div>Format: <span class="font-medium">{{ activeProvider?.media_type || 'audio/mpeg' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tts-module-toggle {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-height: 4.25rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgb(255 255 255 / 0.78);
  border-radius: 1rem;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.9), rgb(240 252 255 / 0.78));
  box-shadow:
    0 12px 30px rgb(0 129 179 / 0.08),
    inset 0 1px 0 rgb(255 255 255 / 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.tts-module-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  border-radius: 0.85rem;
  color: #0081b3;
  background: rgb(152 236 255 / 0.3);
}

.tts-module-toggle__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.12rem;
}

.tts-module-toggle__label {
  color: #0071a0;
  font-size: 0.92rem;
  font-weight: 800;
}

.tts-module-toggle__hint {
  color: rgb(0 129 179 / 0.66);
  font-size: 0.78rem;
  line-height: 1.45;
}

.tts-module-toggle__switch {
  flex: 0 0 auto;
}

.dark .tts-module-toggle {
  border-color: rgb(41 189 226 / 0.25);
  background:
    linear-gradient(135deg, rgb(0 51 69 / 0.78), rgb(0 24 32 / 0.72));
  box-shadow:
    0 12px 30px rgb(0 0 0 / 0.2),
    inset 0 1px 0 rgb(255 255 255 / 0.05);
}

.dark .tts-module-toggle__icon {
  color: #c5fcff;
  background: rgb(41 189 226 / 0.18);
}

.dark .tts-module-toggle__label {
  color: #c5fcff;
}

.dark .tts-module-toggle__hint {
  color: rgb(197 252 255 / 0.64);
}
</style>
