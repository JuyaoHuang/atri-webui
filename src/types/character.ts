export interface Character {
  id: string
  name: string
  avatar?: string
  avatarUrl?: string
  description?: string
  greeting?: string
  systemPrompt?: string
  createdAt?: string
  updatedAt?: string
  isSystem?: boolean
}

export interface CharacterFormPayload {
  characterId?: string
  name: string
  greeting?: string
  description?: string
  systemPrompt: string
}

export interface CharacterExportPayload {
  character_id?: string
  name: string
  greeting?: string
  description?: string
  system_prompt: string
  avatar?: string | null
  avatar_url?: string | null
  avatar_data_url?: string | null
}
