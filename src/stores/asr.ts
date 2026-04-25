import { defineStore } from 'pinia'

import { asrApi } from '@/api/asr'
import type { ASRConfig, ASRProviderConfig, ASRProviderStatus } from '@/api/types'

const ENABLED_STORAGE_KEY = 'settings/hearing/enabled'
const AUDIO_INPUT_STORAGE_KEY = 'settings/hearing/audio-input'

const DEFAULT_CONFIG: ASRConfig = {
  asr_model: 'web_speech_api',
  auto_send: {
    enabled: false,
    delay_ms: 2000
  },
  web_speech_api: {
    language: 'zh-CN',
    continuous: true,
    interim_results: true,
    max_alternatives: 1
  },
  faster_whisper: {
    model_path: 'distil-medium.en',
    download_root: 'models/whisper',
    language: 'en',
    device: 'auto',
    compute_type: 'int8',
    prompt: ''
  },
  whisper_cpp: {
    model_name: 'small',
    model_dir: 'models/whisper',
    language: 'auto',
    print_realtime: false,
    print_progress: false,
    prompt: ''
  },
  openai_whisper: {
    model: 'whisper-1',
    api_key: '${OPENAI_API_KEY}',
    base_url: '',
    language: '',
    prompt: ''
  }
}

export interface ASRState {
  enabled: boolean
  config: ASRConfig
  providers: ASRProviderStatus[]
  audioInputs: MediaDeviceInfo[]
  selectedAudioInput: string
  loading: boolean
  saving: boolean
  error: string | null
}

function cloneConfig(config: ASRConfig): ASRConfig {
  return JSON.parse(JSON.stringify(config)) as ASRConfig
}

function normalizeConfig(config?: Partial<ASRConfig>): ASRConfig {
  return {
    ...cloneConfig(DEFAULT_CONFIG),
    ...(config || {}),
    auto_send: {
      ...DEFAULT_CONFIG.auto_send,
      ...(config?.auto_send || {})
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export const useASRStore = defineStore('asr', {
  state: (): ASRState => ({
    enabled: localStorage.getItem(ENABLED_STORAGE_KEY) !== 'false',
    config: cloneConfig(DEFAULT_CONFIG),
    providers: [],
    audioInputs: [],
    selectedAudioInput: localStorage.getItem(AUDIO_INPUT_STORAGE_KEY) || '',
    loading: false,
    saving: false,
    error: null
  }),

  getters: {
    activeProvider(state): ASRProviderStatus | undefined {
      return state.providers.find(provider => provider.name === state.config.asr_model)
    },

    activeProviderConfig(state): ASRProviderConfig {
      const value = state.config[state.config.asr_model]
      return value && typeof value === 'object' && !Array.isArray(value)
        ? value as ASRProviderConfig
        : {}
    },

    autoSendEnabled(state): boolean {
      return Boolean(state.config.auto_send?.enabled)
    },

    autoSendDelay(state): number {
      return Number(state.config.auto_send?.delay_ms ?? 2000)
    },

    moduleEnabled(state): boolean {
      return state.enabled
    },

    configured(state): boolean {
      return Boolean(state.config.asr_model)
    }
  },

  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const response = await asrApi.getConfig()
        this.config = normalizeConfig(response.config)
        this.providers = response.providers
      } catch (error) {
        this.error = errorMessage(error)
      } finally {
        this.loading = false
      }
    },

    async refreshProviders() {
      try {
        this.providers = await asrApi.listProviders()
      } catch (error) {
        this.error = errorMessage(error)
      }
    },

    async savePatch(patch: Partial<ASRConfig>) {
      this.saving = true
      this.error = null
      try {
        const response = await asrApi.updateConfig(patch)
        this.config = normalizeConfig(response.config)
        this.providers = response.providers
      } catch (error) {
        this.error = errorMessage(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async switchProvider(provider: string) {
      this.saving = true
      this.error = null
      try {
        const response = await asrApi.switchProvider(provider)
        this.config = normalizeConfig(response.config)
        this.providers = response.providers
      } catch (error) {
        this.error = errorMessage(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateProviderConfig(provider: string, patch: ASRProviderConfig) {
      const current = this.config[provider]
      const currentConfig = current && typeof current === 'object' && !Array.isArray(current)
        ? current as ASRProviderConfig
        : {}
      await this.savePatch({
        [provider]: {
          ...currentConfig,
          ...patch
        }
      } as Partial<ASRConfig>)
    },

    async updateAutoSend(enabled: boolean, delayMs?: number) {
      const resolvedDelayMs = delayMs ?? this.autoSendDelay
      await this.savePatch({
        auto_send: {
          enabled,
          delay_ms: resolvedDelayMs
        }
      })
    },

    setEnabled(value: boolean) {
      this.enabled = value
      localStorage.setItem(ENABLED_STORAGE_KEY, String(value))
    },

    async loadAudioInputs() {
      if (!navigator.mediaDevices?.enumerateDevices) {
        this.audioInputs = []
        return
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        this.audioInputs = devices.filter(device => device.kind === 'audioinput')
        if (!this.selectedAudioInput && this.audioInputs[0]) {
          this.setSelectedAudioInput(this.audioInputs[0].deviceId)
        }
      } catch (error) {
        this.error = errorMessage(error)
      }
    },

    setSelectedAudioInput(deviceId: string) {
      this.selectedAudioInput = deviceId
      localStorage.setItem(AUDIO_INPUT_STORAGE_KEY, deviceId)
    }
  }
})
