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
    <h3 class="section-title text-sm font-semibold mb-2">选择角色</h3>

    <div v-if="charactersStore.loading" class="section-meta text-sm">加载中...</div>

    <div v-else class="space-y-2">
      <div
        v-for="character in charactersStore.characters"
        :key="character.id"
        class="character-item group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer"
        :class="{ 'is-active': charactersStore.activeCharacterId === character.id }"
        @click="handleSelectCharacter(character.id)"
      >
        <div class="character-avatar w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
          <img
            v-if="character.avatar"
            :src="`/avatars/${character.avatar}`"
            :alt="character.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="avatar-fallback text-lg">{{ character.name[0] }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="character-name text-sm font-medium truncate">{{ character.name }}</div>
          <div v-if="character.greeting" class="character-greeting text-xs truncate">
            {{ character.greeting }}
          </div>
        </div>
        <div class="character-hover-indicator" aria-hidden="true">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  color: #0081b3;
}

.section-meta {
  color: rgb(0 129 179 / 0.7);
}

.character-item {
  user-select: none;
  background: rgb(240 252 255 / 0.58);
  border: 1px solid rgb(152 236 255 / 0.28);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.character-item:hover {
  background: rgb(197 252 255 / 0.72);
  border-color: rgb(152 236 255 / 0.44);
  box-shadow: 0 8px 18px rgb(0 129 179 / 0.08);
  transform: translateY(-1px);
}

.character-item.is-active {
  background: rgb(152 236 255 / 0.3);
  border-color: rgb(0 152 196 / 0.34);
  box-shadow: inset 0 0 0 1px rgb(0 129 179 / 0.08);
}

.character-hover-indicator {
  color: rgb(0 129 179 / 0.58);
  opacity: 0;
  transform: translateX(4px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.character-item:hover .character-hover-indicator {
  opacity: 1;
  transform: translateX(0);
}

.character-item.is-active .character-hover-indicator {
  opacity: 1;
  transform: translateX(0);
  color: #0081b3;
}

.character-avatar {
  background: rgb(152 236 255 / 0.24);
  border: 1px solid rgb(152 236 255 / 0.35);
}

.avatar-fallback {
  color: #0081b3;
}

.character-name {
  color: #0071a0;
}

.character-greeting {
  color: rgb(0 113 160 / 0.72);
}

.dark .section-title {
  color: #c5fcff;
}

.dark .section-meta {
  color: rgb(152 236 255 / 0.72);
}

.dark .character-item {
  background: rgb(0 51 69 / 0.5);
  border-color: rgb(41 189 226 / 0.2);
}

.dark .character-item:hover {
  background: rgb(0 71 102 / 0.62);
  border-color: rgb(41 189 226 / 0.32);
  box-shadow: 0 8px 18px rgb(0 0 0 / 0.22);
}

.dark .character-item.is-active {
  background: rgb(41 189 226 / 0.22);
  border-color: rgb(152 236 255 / 0.28);
  box-shadow: inset 0 0 0 1px rgb(197 252 255 / 0.08);
}

.dark .character-hover-indicator {
  color: rgb(152 236 255 / 0.68);
}

.dark .character-item.is-active .character-hover-indicator {
  color: #f0fcff;
}

.dark .character-avatar {
  background: rgb(41 189 226 / 0.15);
  border-color: rgb(41 189 226 / 0.24);
}

.dark .avatar-fallback,
.dark .character-name {
  color: #c5fcff;
}

.dark .character-greeting {
  color: rgb(152 236 255 / 0.74);
}
</style>
