import client from './client'
import type {
  ChatListParams,
  ChatResponse,
  CreateChatRequest,
  CreateChatResponse,
  ChatDetailParams,
  ChatDetailResponse,
  UpdateChatTitleRequest
} from './types'

export const chatsApi = {
  /**
   * 获取聊天列表
   */
  async list(params?: ChatListParams): Promise<ChatResponse[]> {
    const { data } = await client.get<ChatResponse[]>('/api/chats', { params })
    return data
  },

  /**
   * 创建新聊天
   */
  async create(request: CreateChatRequest): Promise<CreateChatResponse> {
    const { data } = await client.post<CreateChatResponse>('/api/chats', request)
    return data
  },

  /**
   * 获取聊天详情（包含消息历史）
   */
  async get(params: ChatDetailParams): Promise<ChatDetailResponse> {
    const { chat_id, ...queryParams } = params
    const { data } = await client.get<ChatDetailResponse>(`/api/chats/${chat_id}`, {
      params: queryParams
    })
    return data
  },

  /**
   * 更新聊天标题
   */
  async update(chatId: string, request: UpdateChatTitleRequest): Promise<ChatResponse> {
    const { data } = await client.post<ChatResponse>(`/api/chats/${chatId}/update`, request)
    return data
  },

  /**
   * 删除聊天
   */
  async delete(chatId: string): Promise<void> {
    await client.post(`/api/chats/${chatId}/delete`)
  }
}
