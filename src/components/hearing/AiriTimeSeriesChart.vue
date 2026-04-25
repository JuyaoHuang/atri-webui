<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  history: Readonly<number[]>
  currentValue: number
  threshold?: number | null
  isActive: boolean
  title?: string
  subtitle?: string
  activeLabel?: string
  activeLegendLabel?: string
  inactiveLegendLabel?: string
  thresholdLabel?: string
  height?: number
  minDataPoints?: number
}

const props = withDefaults(defineProps<Props>(), {
  threshold: null,
  title: 'Time Series',
  subtitle: 'Recent data',
  activeLabel: 'Active',
  activeLegendLabel: 'Active state',
  inactiveLegendLabel: 'Inactive state',
  thresholdLabel: 'Threshold',
  height: 80,
  minDataPoints: 5,
})

const chartWidth = 360
const chartHeight = computed(() => props.height)

const visibleHistory = computed(() => props.history.slice(-96))

const smoothPath = computed(() => {
  const history = visibleHistory.value
  if (history.length < 2) {
    return ''
  }

  let path = `M0,${chartHeight.value - history[0] * chartHeight.value}`
  for (let index = 1; index < history.length; index++) {
    const x = (index / (history.length - 1)) * chartWidth
    const y = chartHeight.value - history[index] * chartHeight.value
    if (index === 1) {
      path += ` Q${x / 2},${chartHeight.value - history[0] * chartHeight.value} ${x},${y}`
    } else {
      const previousX = ((index - 1) / (history.length - 1)) * chartWidth
      const previousY = chartHeight.value - history[index - 1] * chartHeight.value
      path += ` Q${(previousX + x) / 2},${previousY} ${x},${y}`
    }
  }
  return path
})

const areaPath = computed(() => {
  if (!smoothPath.value) {
    return ''
  }
  return `${smoothPath.value} L${chartWidth},${chartHeight.value} L0,${chartHeight.value} Z`
})

const thresholdY = computed(() => {
  if (props.threshold === null || props.threshold === undefined) {
    return 0
  }
  return chartHeight.value - Math.max(0, Math.min(1, props.threshold)) * chartHeight.value
})
</script>

<template>
  <div v-if="history.length > minDataPoints" class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="text-sm font-medium">
        {{ title }}
      </div>
      <div class="text-xs text-neutral-500">
        {{ subtitle }}
      </div>
    </div>

    <div
      class="relative overflow-hidden border border-neutral-200 rounded-lg from-neutral-50 to-neutral-100 bg-gradient-to-b dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900"
      :style="{ height: `${height}px` }"
    >
      <svg class="h-full w-full" viewBox="0 0 360 80" preserveAspectRatio="none">
        <defs>
          <pattern id="airi-hearing-grid" width="20" height="10" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 10" fill="none" stroke="rgb(156 163 175 / 0.1)" stroke-width="0.5" />
          </pattern>
          <linearGradient id="airi-hearing-area" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#5f95ff" stop-opacity="0.3" />
            <stop offset="50%" stop-color="#5f95ff" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#5f95ff" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        <rect width="360" height="80" fill="url(#airi-hearing-grid)" />
        <rect
          v-if="threshold !== null && threshold !== undefined"
          x="0"
          :y="thresholdY"
          width="360"
          :height="chartHeight - thresholdY"
          fill="rgb(95 149 255 / 0.1)"
        />
        <line
          v-if="threshold !== null && threshold !== undefined"
          x1="0"
          :y1="thresholdY"
          x2="360"
          :y2="thresholdY"
          stroke="rgb(95 149 255 / 0.25)"
          stroke-width="1.5"
          stroke-dasharray="4,4"
        />
        <path v-if="areaPath" :d="areaPath" fill="url(#airi-hearing-area)" />
        <path
          v-if="smoothPath"
          :d="smoothPath"
          fill="none"
          stroke="#5f95ff"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div
        class="absolute right-2 top-2 border border-neutral-200 rounded-md bg-white px-2 py-1 shadow-sm transition-all duration-200 dark:border-neutral-700 dark:bg-neutral-800"
        :class="isActive ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900' : ''"
      >
        <div class="text-xs font-medium" :class="isActive ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400'">
          {{ `${(currentValue * 100).toFixed(0)}%` }}
        </div>
      </div>

      <Transition name="fade">
        <div
          v-if="isActive"
          class="absolute left-2 top-2 flex items-center gap-1.5 border border-primary-200 rounded-md bg-primary-50 px-2 py-1 dark:border-primary-800 dark:bg-primary-900"
        >
          <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
          <span class="text-xs text-primary-700 font-medium dark:text-primary-300">{{ activeLabel }}</span>
        </div>
      </Transition>
    </div>

    <div class="flex flex-wrap items-center justify-between text-xs text-neutral-500">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1 text-nowrap">
          <div class="h-2 w-2 rounded-full bg-primary-600" />
          {{ activeLegendLabel }}
        </span>
        <span class="flex items-center gap-1 text-nowrap">
          <div class="h-2 w-2 rounded-full bg-primary-300" />
          {{ inactiveLegendLabel }}
        </span>
      </div>
      <span v-if="threshold !== null && threshold !== undefined" class="text-nowrap">
        {{ thresholdLabel }}: {{ (threshold * 100).toFixed(0) }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
