import { defineStore } from 'pinia'
import type { Character } from '@/types/character'

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
      // Will be implemented in US-FE-004
      this.loading = true
      try {
        // Placeholder - will call charactersApi.getList()
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
