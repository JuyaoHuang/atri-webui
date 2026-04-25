<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  level: number
  min?: number
  max?: number
  numBars?: number
  label?: string
  unit?: string
  height?: number
  showHeader?: boolean
  formatValue?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  numBars: 20,
  label: 'Level',
  unit: '%',
  height: 24,
  showHeader: true,
})

const levelBars = computed(() => {
  const normalizedLevel = Math.max(0, Math.min(100, ((props.level - props.min) / (props.max - props.min)) * 100))
  const activeBars = Math.floor((normalizedLevel / 100) * props.numBars)

  return Array.from({ length: props.numBars }, (_, index) => ({
    active: index < activeBars,
    level: (index / props.numBars) * 100,
  }))
})

function getBarColor(barLevel: number): string {
  if (barLevel <= 60) {
    return 'bg-green-500'
  }
  if (barLevel <= 80) {
    return 'bg-yellow-500'
  }
  return 'bg-red-500'
}
</script>

<template>
  <div>
    <div v-if="showHeader" class="mb-2 flex items-center justify-between">
      <span class="text-sm font-medium">{{ label }}</span>
      <span class="text-sm text-neutral-500">
        {{ formatValue ? formatValue(level) : `${Math.round(level)}${unit}` }}
      </span>
    </div>

    <div
      class="flex items-end gap-1 rounded bg-neutral-200/45 p-1 dark:bg-neutral-700"
      :style="{ height: `${height}px` }"
    >
      <div
        v-for="(bar, index) in levelBars"
        :key="index"
        class="flex-1 rounded-sm transition-all duration-75"
        :class="bar.active ? getBarColor(bar.level) : 'bg-neutral-200 dark:bg-neutral-600'"
        :style="{ height: bar.active ? '100%' : '20%' }"
      />
    </div>
  </div>
</template>
