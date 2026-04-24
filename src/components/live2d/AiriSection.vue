<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  sectionIcon: string
  innerClass?: string
  expand?: boolean
  size?: 'sm' | 'md'
}>(), {
  expand: true,
  size: 'sm'
})

const visible = ref(props.expand)
</script>

<template>
  <div class="airi-section-wrapper">
    <button
      class="airi-section-trigger"
      :class="props.size === 'sm' ? 'airi-section-trigger--sm' : ''"
      @click="visible = !visible"
    >
      <div class="airi-section-trigger__left">
        <div :class="[sectionIcon, props.size === 'sm' ? 'size-4' : 'size-6']" />
        <span>{{ title }}</span>
      </div>
      <div
        i-solar:alt-arrow-down-linear
        class="airi-section-trigger__arrow"
        :class="{ 'rotate-180': visible }"
      />
    </button>

    <div v-show="visible" class="airi-section-body" :class="[innerClass, props.size === 'sm' ? 'p-2' : 'p-4']">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.airi-section-wrapper {
  display: grid;
  gap: 0.25rem;
}

.airi-section-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  outline: none;
  background: rgb(245 245 245);
  color: rgb(82 82 82);
  transition: all 0.25s ease-in-out;
}

.airi-section-trigger:hover {
  background: rgb(229 229 229);
}

.airi-section-trigger--sm {
  font-size: 0.875rem;
}

.airi-section-trigger__left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.airi-section-trigger__arrow {
  transition: transform 0.25s ease-in-out;
}

.airi-section-body {
  display: grid;
  gap: 0.5rem;
}

.dark .airi-section-trigger {
  background: rgb(38 38 38);
  color: rgb(163 163 163);
}

.dark .airi-section-trigger:hover {
  background: rgb(64 64 64);
}
</style>
