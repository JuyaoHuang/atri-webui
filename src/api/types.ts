// API 请求和响应类型定义

// 角色相关
export interface CharacterResponse {
  character_id: string
  name: string
  avatar: string | null
  greeting: string | null
}

export interface CharacterDetailResponse extends CharacterResponse {
  system_prompt: string
}

// 聊天相关
export interface ChatListParams {
  character_id?: string
  user_id?: string
}

export interface ChatResponse {
  id: string
  character_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface CreateChatRequest {
  character_id: string
  first_message: string
  user_id?: string
}

export interface CreateChatResponse {
  id: string
  character_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatDetailParams {
  chat_id: string
  limit?: number
  offset?: number
}

export interface MessageResponse {
  role: 'human' | 'ai'
  content: string
  timestamp: string
  name?: string      // AI 消息的角色名称或 character_id
}

export interface ChatDetailResponse {
  metadata: {
    id: string
    character_id: string
    title: string
    created_at: string
    updated_at: string
  }
  messages: MessageResponse[]
}

export interface UpdateChatTitleRequest {
  title: string
}

export interface DeleteChatRequest {
  chat_id: string
}

// 健康检查
export interface HealthResponse {
  status: string
}
