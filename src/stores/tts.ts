import { defineStore } from 'pinia'

import { ttsApi } from '@/api/tts'
import type {
  TTSConfig,
  TTSProviderConfig,
  TTSProviderStatus,
  TTSSynthesisRequest,
  TTSVoiceInfo
} from '@/api/types'

const DEFAULT_CONFIG: TTSConfig = {
  tts_model: 'edge_tts',
  enabled: false,
  auto_play: false,
  show_player_on_home: false,
  volume: 1,
  edge_tts: {
    rate: '+0%',
    pitch: '+0Hz',
    volume: '+0%',
    format: 'mp3'
  },
  gpt_sovits_tts: {
    api_url: 'http://127.0.0.1:9880/tts',
    timeout_seconds: 120
  },
  siliconflow_tts: {
    default_voice: 'FunAudioLLM/CosyVoice2-0.5B:claire',
    sample_rate: 32000,
    stream: false,
    speed: 1,
    gain: 0,
    timeout_seconds: 120
  }
}

let loadPromise: Promise<void> | null = null
const PROVIDER_WRITE_ALLOWLISTS: Record<string, Set<string>> = {
  gpt_sovits_tts: new Set(['api_url', 'timeout_seconds'])
}
const PROVIDER_WRITE_BLOCKLISTS: Record<string, Set<string>> = {
  edge_tts: new Set(['voice']),
  siliconflow_tts: new Set(['api_url', 'default_model', 'api_key', 'response_format'])
}

export interface TTSState {
  loaded: boolean
  config: TTSConfig
  providers: TTSProviderStatus[]
  voices: TTSVoiceInfo[]
  loading: boolean
  saving: boolean
  synthesizing: boolean
  error: string | null
}

function cloneConfig(config: TTSConfig): TTSConfig {
  return JSON.parse(JSON.stringify(config)) as TTSConfig
}

function normalizeConfig(config?: Partial<TTSConfig>): TTSConfig {
  return {
    ...cloneConfig(DEFAULT_CONFIG),
    ...(config || {}),
    edge_tts: {
      ...DEFAULT_CONFIG.edge_tts,
      ...(config?.edge_tts || {})
    },
    gpt_sovits_tts: {
      ...DEFAULT_CONFIG.gpt_sovits_tts,
      ...(config?.gpt_sovits_tts || {})
    },
    siliconflow_tts: {
      ...DEFAULT_CONFIG.siliconflow_tts,
      ...(config?.siliconflow_tts || {})
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function sanitizeProviderPatch(provider: string, patch: TTSProviderConfig): TTSProviderConfig {
  const allowlist = PROVIDER_WRITE_ALLOWLISTS[provider]
  if (allowlist) {
    return Object.fromEntries(
      Object.entries(patch).filter(([key]) => allowlist.has(key))
    ) as TTSProviderConfig
  }

  const blocklist = PROVIDER_WRITE_BLOCKLISTS[provider]
  if (!blocklist) {
    return patch
  }
  return Object.fromEntries(
    Object.entries(patch).filter(([key]) => !blocklist.has(key))
  ) as TTSProviderConfig
}

export const useTTSStore = defineStore('tts', {
  state: (): TTSState => ({
    loaded: false,
    config: cloneConfig(DEFAULT_CONFIG),
    providers: [],
    voices: [],
    loading: false,
    saving: false,
    synthesizing: false,
    error: null
  }),

  getters: {
    activeProvider(state): TTSProviderStatus | undefined {
      return state.providers.find(provider => provider.name === state.config.tts_model)
    },

    activeProviderConfig(state): TTSProviderConfig {
      const value = state.config[state.config.tts_model]
      return value && typeof value === 'object' && !Array.isArray(value)
        ? value as TTSProviderConfig
        : {}
    },

    moduleEnabled(state): boolean {
      return Boolean(state.config.enabled)
    },

    autoPlayEnabled(state): boolean {
      return Boolean(state.config.auto_play)
    },

    showPlayerOnHome(state): boolean {
      return Boolean(state.config.show_player_on_home)
    },

    outputVolume(state): number {
      return Number(state.config.volume ?? 1)
    },

    configured(state): boolean {
      return Boolean(state.config.tts_model)
    }
  },

  actions: {
    async load() {
      if (loadPromise) {
        await loadPromise
        return
      }

      loadPromise = (async () => {
        this.loading = true
        this.error = null
        try {
          const response = await ttsApi.getConfig()
          this.config = normalizeConfig(response.config)
          this.providers = response.providers
          this.loaded = true
        } catch (error) {
          this.error = errorMessage(error)
        } finally {
          this.loading = false
          loadPromise = null
        }
      })()

      await loadPromise
    },

    async ensureLoaded() {
      if (!this.loaded) {
        await this.load()
      }
    },

    async refreshProviders() {
      try {
        this.providers = await ttsApi.listProviders()
      } catch (error) {
        this.error = errorMessage(error)
      }
    },

    async loadVoices(provider?: string) {
      this.error = null
      try {
        const response = await ttsApi.getVoices(provider || this.config.tts_model)
        this.voices = response.voices
      } catch (error) {
        this.voices = []
        this.error = errorMessage(error)
      }
    },

    async savePatch(patch: Partial<TTSConfig>) {
      this.saving = true
      this.error = null
      try {
        const response = await ttsApi.updateConfig(patch)
        this.config = normalizeConfig(response.config)
        this.providers = response.providers
        this.loaded = true
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
        const response = await ttsApi.switchProvider(provider)
        this.config = normalizeConfig(response.config)
        this.providers = response.providers
        this.loaded = true
        await this.loadVoices(provider)
      } catch (error) {
        this.error = errorMessage(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateProviderConfig(provider: string, patch: TTSProviderConfig) {
      const sanitizedPatch = sanitizeProviderPatch(provider, patch)
      if (Object.keys(sanitizedPatch).length === 0) {
        return
      }

      await this.savePatch({
        [provider]: sanitizedPatch
      } as Partial<TTSConfig>)
    },

    async updateEnabled(enabled: boolean) {
      await this.savePatch({ enabled })
    },

    async updateAutoPlay(autoPlay: boolean) {
      await this.savePatch({ auto_play: autoPlay })
    },

    async updateShowPlayerOnHome(showPlayerOnHome: boolean) {
      await this.savePatch({ show_player_on_home: showPlayerOnHome })
    },

    async updateVolume(volume: number) {
      await this.savePatch({ volume })
    },

    async synthesize(payload: TTSSynthesisRequest): Promise<Blob> {
      this.synthesizing = true
      this.error = null
      try {
        const response = await ttsApi.synthesize({
          ...payload,
          provider: payload.provider || this.config.tts_model
        })
        return response.blob
      } catch (error) {
        this.error = errorMessage(error)
        throw error
      } finally {
        this.synthesizing = false
      }
    }
  }
})
