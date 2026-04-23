<script setup lang="ts" generic="TSection, TItem">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { computed, toRef } from 'vue'

import { useGridRipple } from '@/composables/useGridRipple'

interface VirtualSection {
  _isVirtual: true
  items: TItem[]
}

interface KeyableItem {
  id?: string | number
  key?: string | number
}

interface SectionWithItems<TItem> {
  items?: TItem[]
}

const props = withDefaults(defineProps<{
  items?: TItem[]
  sections?: TSection[]
  getItems?: (section: TSection) => TItem[]
  getKey?: (item: TItem) => string | number
  columns?: number | Record<string, number>
  originIndex?: number
  animationInitial?: Record<string, unknown>
  animationEnter?: Record<string, unknown>
  animationDuration?: number
  delayPerUnit?: number
}>(), {
  columns: () => ({ default: 1, sm: 2, xl: 3 }),
  originIndex: 0,
  animationInitial: () => ({ opacity: 0, y: 10 }),
  animationEnter: () => ({ opacity: 1, y: 0 }),
  animationDuration: 250,
  delayPerUnit: 80,
  getItems: (section: TSection) => (section as unknown as SectionWithItems<TItem>).items || [],
  getKey: (item: TItem) => {
    const keyable = item as unknown as KeyableItem
    return keyable.id ?? keyable.key ?? ''
  },
})

const emit = defineEmits<{
  itemClick: [payload: { item: TItem, globalIndex: number }]
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const columnOrder = ['2xl', 'xl', 'lg', 'md', 'sm'] as const

const isFlat = computed(() => !!props.items && !props.sections)
const normalizedSections = computed(() => {
  if (isFlat.value && props.items) {
    return [{ _isVirtual: true, items: props.items }] as unknown as TSection[]
  }

  return props.sections || []
})

const currentColumns = computed(() => {
  if (typeof props.columns === 'number') {
    return props.columns
  }

  for (const key of columnOrder) {
    if (props.columns[key] && breakpoints.greaterOrEqual(key).value) {
      return props.columns[key]
    }
  }

  return props.columns.default || 1
})

const sectionMeta = computed(() => {
  let globalCounter = 0

  return normalizedSections.value.map((section) => {
    const items = isFlat.value
      ? (section as unknown as VirtualSection).items
      : props.getItems(section)
    const startIndex = globalCounter

    globalCounter += items.length

    return {
      items,
      startIndex,
      count: items.length,
    }
  })
})

const sectionItemCounts = computed(() => sectionMeta.value.map(meta => meta.count))

const { getDelay } = useGridRipple({
  cols: currentColumns,
  originIndex: toRef(props, 'originIndex'),
  sectionItemCounts,
  delayPerUnit: props.delayPerUnit,
})

function handleItemClick(item: TItem, globalIndex: number) {
  emit('itemClick', { item, globalIndex })
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <template v-for="(section, sectionIndex) in normalizedSections" :key="sectionIndex">
      <div v-if="$slots.header && !isFlat" :class="{ 'my-5': sectionIndex > 0 }">
        <slot name="header" :section="section" :index="sectionIndex" />
      </div>

      <div
        class="grid gap-4 pb-4"
        :style="{
          gridTemplateColumns: `repeat(${currentColumns}, minmax(0, 1fr))`
        }"
      >
        <div
          v-for="(item, itemIndex) in sectionMeta[sectionIndex].items"
          :key="getKey(item)"
          v-motion
          :initial="animationInitial"
          :enter="{
            ...animationEnter,
            transition: {
              duration: animationDuration,
              delay: getDelay(sectionMeta[sectionIndex].startIndex + itemIndex)
            }
          }"
          @click="handleItemClick(item, sectionMeta[sectionIndex].startIndex + itemIndex)"
        >
          <slot
            name="item"
            :item="item"
            :index="sectionMeta[sectionIndex].startIndex + itemIndex"
            :active="originIndex === sectionMeta[sectionIndex].startIndex + itemIndex"
          />
        </div>
      </div>
    </template>
  </div>
</template>
