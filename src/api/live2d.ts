import client from './client'
import type {
  Live2DExpressionResponse,
  Live2DModelResponse
} from './types'

export const live2dApi = {
  async list(): Promise<Live2DModelResponse[]> {
    const { data } = await client.get<Live2DModelResponse[]>('/api/live2d/models')
    return data
  },

  async upload(file: File, name?: string): Promise<Live2DModelResponse> {
    const formData = new FormData()
    formData.append('model', file)
    if (name?.trim()) {
      formData.append('name', name.trim())
    }

    const { data } = await client.post<Live2DModelResponse>('/api/live2d/models', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return data
  },

  async remove(modelId: string): Promise<void> {
    await client.delete(`/api/live2d/models/${encodeURIComponent(modelId)}`)
  },

  async getExpressions(modelId: string): Promise<Live2DExpressionResponse> {
    const { data } = await client.get<Live2DExpressionResponse>(
      `/api/live2d/models/${encodeURIComponent(modelId)}/expressions`
    )
    return data
  }
}
