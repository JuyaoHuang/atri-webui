<script setup lang="ts">
import { onMounted } from 'vue'
import { useCharactersStore } from '@/stores/characters'

const charactersStore = useCharactersStore()

onMounted(() => {
  charactersStore.fetchCharacters()
})

const handleSelectCharacter = (characterId: string) => {
  charactersStore.setActiveCharacter(characterId)
}
</script>

<template>
  <div class="character-selector">
    <h3 class="text-sm font-semibold text-gray-400 mb-2">选择角色</h3>

    <div v-if="charactersStore.loading" class="text-gray-500 text-sm">加载中...</div>

    <div v-else class="space-y-2">
      <div
        v-for="character in charactersStore.characters"
        :key="character.id"
        class="character-item flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
        :class="{
          'bg-blue-600 bg-opacity-20': charactersStore.activeCharacterId === character.id,
          'hover:bg-gray-700': charactersStore.activeCharacterId !== character.id
        }"
        @click="handleSelectCharacter(character.id)"
      >
        <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <span class="text-lg">{{ character.name[0] }}</span>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-white">{{ character.name }}</div>
          <div v-if="character.greeting" class="text-xs text-gray-400 truncate">
            {{ character.greeting }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-item {
  user-select: none;
}
</style>
