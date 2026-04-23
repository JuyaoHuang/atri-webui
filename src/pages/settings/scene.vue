<script setup lang="ts">
import BackgroundCustomizer from '@/components/settings/BackgroundCustomizer.vue'
</script>

<template>
  <div flex="~ col gap-4" font-normal>
    <div
      rounded-2xl
      border="neutral-200/70 dark:neutral-800/70"
      bg="neutral-50/80 dark:neutral-900/70"
      p-4 md:p-6
      backdrop-blur-sm
    >
      <BackgroundCustomizer />
    </div>

    <div
      v-motion
      pointer-events-none
      fixed bottom-0 right--5 top="[calc(100dvh-15rem)]" z--1
      size-60
      flex items-center justify-center
      text="neutral-200/50 dark:neutral-600/20"
      :initial="{ scale: 0.9, opacity: 0, y: 20 }"
      :enter="{ scale: 1, opacity: 1, y: 0 }"
      :duration="500"
    >
      <div text="60" i-solar:armchair-2-bold-duotone />
    </div>
  </div>
</template>
