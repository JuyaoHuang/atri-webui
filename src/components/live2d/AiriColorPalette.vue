<script setup lang="ts">
defineProps<{
  colors: Array<{ hex?: string, name: string }>
}>()
</script>

<template>
  <div v-if="colors.length" class="airi-color-palette">
    <button
      v-for="{ hex, name } in colors"
      :key="hex || name"
      class="airi-color-palette__item"
      :style="hex ? { background: hex } : undefined"
      :title="name"
    />
  </div>
</template>

<style scoped>
.airi-color-palette {
  display: flex;
  gap: 0.5rem;
}

.airi-color-palette__item {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgb(59 130 246);
  transition: all 0.25s ease-in-out;
}

.airi-color-palette__item:hover {
  transform: scale(1.1);
}
</style>
