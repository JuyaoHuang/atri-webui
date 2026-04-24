<script setup lang="ts">
import type { Character } from '@/types/character'

import CharacterCard from './CharacterCard.vue'

defineProps<{
  characters: Character[]
  activeCharacterId: string | null
  selectedCharacterId: string | null
}>()

defineEmits<{
  open: [characterId: string]
  edit: [characterId: string]
  delete: [characterId: string]
  export: [characterId: string]
  activate: [characterId: string]
}>()
</script>

<template>
  <div
    class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
  >
    <slot name="prefix" />

    <CharacterCard
      v-for="character in characters"
      :key="character.id"
      :character="character"
      :is-active="activeCharacterId === character.id"
      :is-selected="selectedCharacterId === character.id"
      @open="$emit('open', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @export="$emit('export', $event)"
      @activate="$emit('activate', $event)"
    />

    <div
      v-if="characters.length === 0"
      class="col-span-full rounded-2xl border border-dashed border-[#98ecff]/45 bg-white/40 p-10 text-center text-[#0071a0]/72 backdrop-blur-sm dark:border-[#29bde2]/24 dark:bg-[#02212b]/60 dark:text-[#c5fcff]/74"
    >
      <div i-solar:card-search-broken class="mx-auto mb-4 text-6xl text-[#98ecff] dark:text-[#29bde2]" />
      <p class="text-base">
        当前筛选条件下没有角色卡。
      </p>
    </div>
  </div>
</template>
