import client from './client'
import type { AxiosError } from 'axios'
import type {
  TTSConfig,
  TTSConfigResponse,
  TTSHealthResponse,
  TTSProviderStatus,
  TTSSynthesisRequest,
  TTSVoicesResponse
} from './types'

export interface TTSAudioResponse {
  blob: Blob
  mediaType: string
  provider?: string
}

function isRetryableTtsError(error: unknown): boolean {
  const status = (error as AxiosError | undefined)?.response?.status
  return !status || status === 429 || status >= 500
}

export const ttsApi = {
  async listProviders(): Promise<TTSProviderStatus[]> {
    const { data } = await client.get<TTSProviderStatus[]>('/api/tts/providers')
    return data
  },

  async getConfig(): Promise<TTSConfigResponse> {
    const { data } = await client.get<TTSConfigResponse>('/api/tts/config')
    return data
  },

  async updateConfig(payload: Partial<TTSConfig>): Promise<TTSConfigResponse> {
    const { data } = await client.put<TTSConfigResponse>('/api/tts/config', payload)
    return data
  },

  async switchProvider(provider: string): Promise<TTSConfigResponse> {
    const { data } = await client.post<TTSConfigResponse>('/api/tts/switch', { provider })
    return data
  },

  async health(): Promise<TTSHealthResponse> {
    const { data } = await client.get<TTSHealthResponse>('/api/tts/health')
    return data
  },

  async getVoices(provider?: string): Promise<TTSVoicesResponse> {
    const { data } = await client.get<TTSVoicesResponse>('/api/tts/voices', {
      params: provider ? { provider } : undefined
    })
    return data
  },

  async synthesize(payload: TTSSynthesisRequest): Promise<TTSAudioResponse> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await client.post<Blob>('/api/tts/synthesize', payload, {
          responseType: 'blob',
          timeout: 120000
        })

        const mediaType = String(response.headers['content-type'] || payload.options?.media_type || 'audio/mpeg')
        return {
          blob: response.data,
          mediaType,
          provider: String(response.headers['x-tts-provider'] || payload.provider || '')
        }
      } catch (error) {
        if (attempt === 0 && isRetryableTtsError(error)) {
          continue
        }
        throw error
      }
    }

    throw new Error('TTS synthesis failed')
  }
}
