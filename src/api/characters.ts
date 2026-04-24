import client from './client'
import type {
  AvatarUploadResponse,
  CharacterCreateRequest,
  CharacterDetailResponse,
  CharacterResponse,
  CharacterUpdateRequest,
} from './types'

export const charactersApi = {
  /**
   * 获取角色列表
   */
  async getList(): Promise<CharacterResponse[]> {
    const { data } = await client.get<CharacterResponse[]>('/api/characters')
    return data
  },

  /**
   * 获取角色详情
   */
  async getDetail(characterId: string): Promise<CharacterDetailResponse> {
    const { data } = await client.get<CharacterDetailResponse>(`/api/characters/${characterId}`)
    return data
  },

  /**
   * 创建角色
   */
  async create(payload: CharacterCreateRequest): Promise<CharacterDetailResponse> {
    const { data } = await client.post<CharacterDetailResponse>('/api/characters', payload)
    return data
  },

  /**
   * 更新角色
   */
  async update(characterId: string, payload: CharacterUpdateRequest): Promise<CharacterDetailResponse> {
    const { data } = await client.put<CharacterDetailResponse>(`/api/characters/${characterId}`, payload)
    return data
  },

  /**
   * 删除角色
   */
  async remove(characterId: string): Promise<void> {
    await client.delete(`/api/characters/${characterId}`)
  },

  /**
   * 上传头像
   */
  async uploadAvatar(characterId: string, file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData()
    formData.append('avatar', file)

    const { data } = await client.post<AvatarUploadResponse>(
      `/api/characters/${characterId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data
  }
}
