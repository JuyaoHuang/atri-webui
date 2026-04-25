import client from './client'
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
  }
}
