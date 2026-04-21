import client from './client'
import type { CharacterResponse, CharacterDetailResponse } from './types'

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
  }
}
