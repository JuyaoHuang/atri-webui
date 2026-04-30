import client from './client'
import type { DataCleanupResponse } from './types'

export const dataApi = {
  async clearShortTermMemory(characterId: string, chatId: string): Promise<DataCleanupResponse> {
    const { data } = await client.delete<DataCleanupResponse>(
      `/api/data/characters/${encodeURIComponent(characterId)}/chats/${encodeURIComponent(chatId)}/short-term-memory`
    )
    return data
  },

  async clearLongTermMemory(characterId: string): Promise<DataCleanupResponse> {
    const { data } = await client.delete<DataCleanupResponse>(
      `/api/data/characters/${encodeURIComponent(characterId)}/long-term-memory`
    )
    return data
  }
}
