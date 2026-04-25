<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  threshold: number
  min?: number
  max?: number
  numBars?: number
  label?: string
  unit?: string
  precision?: number
  height?: number
  showHeader?: boolean
  showLegend?: boolean
  belowLabel?: string
  aboveLabel?: string
  thresholdLabel?: string
  formatValue?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1,
  numBars: 20,
  label: 'Value',
  unit: '%',
  precision: 1,
  height: 24,
  showHeader: true,
  showLegend: true,
  belowLabel: 'Below',
  aboveLabel: 'Above',
  thresholdLabel: 'Threshold',
})

const thresholdBars = computed(() => {
  const normalizedValue = Math.max(0, Math.min(1, (props.value - props.min) / (props.max - props.min)))
  const normalizedThreshold = Math.max(0, Math.min(1, (props.threshold - props.min) / (props.max - props.min)))
  const activeBars = Math.floor(normalizedValue * props.numBars)
  const thresholdBar = Math.floor(normalizedThreshold * props.numBars)

  return Array.from({ length: props.numBars }, (_, index) => ({
    active: index < activeBars,
    isThreshold: index === thresholdBar,
    isAboveThreshold: index < activeBars && index >= thresholdBar,
    isBelowThreshold: index < activeBars && index < thresholdBar,
  }))
})
</script>

<template>
  <div>
    <div v-if="showHeader" class="mb-2 flex items-center justify-between">
      <span class="text-sm font-medium">{{ label }}</span>
      <span class="text-sm text-neutral-500">
        {{ formatValue ? formatValue(value) : `${(value * 100).toFixed(precision)}${unit}` }}
      </span>
    </div>

    <div
      class="flex items-end gap-1 rounded bg-neutral-200/45 p-1 dark:bg-neutral-700"
      :style="{ height: `${height}px` }"
    >
      <div
        v-for="(bar, index) in thresholdBars"
        :key="`threshold-${index}`"
        class="flex-1 rounded-sm transition-all duration-100"
        :class="[
          bar.isThreshold
            ? 'bg-white dark:bg-neutral-800'
            : bar.isAboveThreshold
              ? 'bg-green-500'
              : bar.isBelowThreshold
                ? 'bg-primary-300 dark:bg-primary-600'
                : 'bg-neutral-300 dark:bg-neutral-600',
        ]"
        :style="{ height: bar.active || bar.isThreshold ? '100%' : '20%' }"
      />
    </div>

    <div v-if="showLegend" class="mt-1 flex gap-3 text-xs text-neutral-500">
      <span class="flex items-center gap-1">
        <div class="inline-block h-0.5lh w-1lh rounded-full bg-primary-300 dark:bg-primary-600" />
        {{ belowLabel }}
      </span>
      <span class="flex items-center gap-1">
        <div class="inline-block h-0.5lh w-1lh rounded-full border border-neutral-400 bg-white dark:bg-neutral-800" />
        {{ thresholdLabel }}
      </span>
      <span class="flex items-center gap-1">
        <div class="inline-block h-0.5lh w-1lh rounded-full bg-green-500" />
        {{ aboveLabel }}
      </span>
    </div>
  </div>
</template>
