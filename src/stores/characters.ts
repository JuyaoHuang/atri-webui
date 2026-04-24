import { defineStore } from 'pinia'
import { charactersApi } from '@/api/characters'
import type {
  CharacterCreateRequest,
  CharacterDetailResponse,
  CharacterResponse,
  CharacterUpdateRequest
} from '@/api/types'
import type { Character } from '@/types/character'

export interface CharactersState {
  characters: Character[]
  details: Record<string, Character>
  activeCharacterId: string | null
  loading: boolean
  submitting: boolean
}

export const useCharactersStore = defineStore('characters', {
  state: (): CharactersState => ({
    characters: [],
    details: {},
    activeCharacterId: null,
    loading: false,
    submitting: false
  }),

  actions: {
    mapCharacter(char: CharacterResponse | CharacterDetailResponse): Character {
      const character = char as CharacterDetailResponse
      return {
        id: character.character_id,
        name: character.name,
        avatar: character.avatar || undefined,
        avatarUrl: character.avatar_url || undefined,
        greeting: character.greeting || undefined,
        description: character.description || undefined,
        systemPrompt: character.system_prompt || undefined,
        createdAt: character.created_at || undefined,
        updatedAt: character.updated_at || undefined,
        isSystem: character.is_system ?? false
      }
    },

    upsertCharacter(character: Character) {
      const index = this.characters.findIndex(item => item.id === character.id)
      if (index >= 0) {
        this.characters.splice(index, 1, {
          ...this.characters[index],
          ...character
        })
      } else {
        this.characters.push(character)
      }

      this.details[character.id] = {
        ...this.details[character.id],
        ...character
      }

      if (this.characters.length > 0 && !this.activeCharacterId) {
        this.activeCharacterId = this.characters[0].id
      }
    },

    async fetchCharacters() {
      this.loading = true
      try {
        const response = await charactersApi.getList()
        const mappedCharacters = response.map(char => this.mapCharacter(char))
        this.characters = mappedCharacters
        this.details = Object.fromEntries(
          mappedCharacters.map(character => [
            character.id,
            {
              ...this.details[character.id],
              ...character
            }
          ])
        )

        // 自动选择第一个角色
        if (this.characters.length > 0 && !this.activeCharacterId) {
          this.activeCharacterId = this.characters[0].id
        }
      } catch (error) {
        console.error('获取角色列表失败:', error)
        this.characters = []
      } finally {
        this.loading = false
      }
    },

    async fetchCharacterDetail(characterId: string, force = false) {
      if (!force && this.details[characterId]?.systemPrompt) {
        return this.details[characterId]
      }

      const response = await charactersApi.getDetail(characterId)
      const character = this.mapCharacter(response)
      this.upsertCharacter(character)
      return character
    },

    async createCharacter(payload: CharacterCreateRequest, avatarFile?: File | null) {
      this.submitting = true
      try {
        const response = await charactersApi.create(payload)
        let character = this.mapCharacter(response)

        if (avatarFile) {
          const avatar = await charactersApi.uploadAvatar(response.character_id, avatarFile)
          character = {
            ...character,
            avatar: avatar.avatar,
            avatarUrl: avatar.avatar_url
          }
        }

        this.upsertCharacter(character)
        return character
      } finally {
        this.submitting = false
      }
    },

    async updateCharacter(
      characterId: string,
      payload: CharacterUpdateRequest,
      avatarFile?: File | null,
    ) {
      this.submitting = true
      try {
        const response = await charactersApi.update(characterId, payload)
        let character = this.mapCharacter(response)

        if (avatarFile) {
          const avatar = await charactersApi.uploadAvatar(characterId, avatarFile)
          character = {
            ...character,
            avatar: avatar.avatar,
            avatarUrl: avatar.avatar_url
          }
        }

        this.upsertCharacter(character)
        return character
      } finally {
        this.submitting = false
      }
    },

    async deleteCharacter(characterId: string) {
      this.submitting = true
      try {
        await charactersApi.remove(characterId)
        this.characters = this.characters.filter(character => character.id !== characterId)
        delete this.details[characterId]

        if (this.activeCharacterId === characterId) {
          this.activeCharacterId = this.characters[0]?.id || null
        }
      } finally {
        this.submitting = false
      }
    },

    setActiveCharacter(characterId: string) {
      this.activeCharacterId = characterId
    }
  }
})
