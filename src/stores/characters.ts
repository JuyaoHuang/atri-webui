import { defineStore } from 'pinia'
import type { Character } from '@/types/character'
import { charactersApi } from '@/api/characters'

export interface CharactersState {
  characters: Character[]
  activeCharacterId: string | null
  loading: boolean
}

export const useCharactersStore = defineStore('characters', {
  state: (): CharactersState => ({
    characters: [],
    activeCharacterId: null,
    loading: false
  }),

  actions: {
    async fetchCharacters() {
      this.loading = true
      try {
        const response = await charactersApi.getList()
        this.characters = response.map((char) => ({
          id: char.character_id,
          name: char.name,
          avatar: char.avatar || undefined,
          greeting: char.greeting || undefined
        }))

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

    setActiveCharacter(characterId: string) {
      this.activeCharacterId = characterId
    }
  }
})
