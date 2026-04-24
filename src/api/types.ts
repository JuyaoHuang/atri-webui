// API 请求和响应类型定义

// 角色相关
export interface CharacterResponse {
  character_id: string
  name: string
  avatar: string | null
  avatar_url?: string | null
  greeting: string | null
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
  is_system?: boolean
}

export interface CharacterDetailResponse extends CharacterResponse {
  system_prompt: string
}

export interface CharacterCreateRequest {
  character_id?: string
  name: string
  greeting?: string
  description?: string
  system_prompt: string
}

export interface CharacterUpdateRequest {
  name?: string
  greeting?: string
  description?: string
  system_prompt?: string
}

export interface AvatarUploadResponse {
  character_id: string
  avatar: string
  avatar_url: string
}

// Live2D 相关
export interface Live2DModelResponse {
  id: string
  name: string
  model_path: string
  model_url: string
  thumbnail_url?: string | null
  expressions: string[]
  created_at: string
  is_default: boolean
}

export interface Live2DExpressionResponse {
  model_id: string
  expressions: string[]
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
  defer_title?: boolean
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
