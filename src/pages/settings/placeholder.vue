<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => (route.meta.title as string | undefined) || '开发中')
const description = computed(() => (route.meta.description as string | undefined) || '该设置页仍在建设中。')
const phase = computed(() => route.meta.phase as string | undefined)
const icon = computed(() => (route.meta.icon as string | undefined) || 'i-solar:settings-bold-duotone')
</script>

<template>
  <div flex="~ col gap-4" font-normal>
    <div
      rounded-2xl
      border="amber-200/70 dark:amber-400/20"
      bg="amber-50/80 dark:amber-500/10"
      p-5 md:p-6
      backdrop-blur-sm
    >
      <div flex="~ row items-start gap-4">
        <div
          size-12
          flex items-center justify-center
          rounded-xl
          bg="amber-100/80 dark:amber-400/10"
          text="amber-600 dark:amber-300"
        >
          <div i-solar:settings-bold-duotone text-2xl />
        </div>

        <div flex-1>
          <h2 text-lg font-medium>
            {{ title }}
          </h2>

          <p mt-2 text="sm neutral-600 dark:neutral-300/80">
            {{ description }}
          </p>

          <p mt-3 text="sm neutral-500 dark:neutral-400">
            当前已经切换到 AIRI 风格的设置页壳层，这个功能页的业务表单会在后续阶段补齐。
          </p>

          <div
            v-if="phase"
            mt-4 inline-flex items-center rounded-full
            bg="neutral-900/5 dark:neutral-100/10"
            px-3 py-1.5
            text="xs neutral-600 dark:neutral-300"
          >
            {{ phase }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-motion
      pointer-events-none
      fixed bottom-0 right--8 top="[calc(100dvh-14rem)]" z--1
      size-60
      flex items-center justify-center
      text="neutral-200/50 dark:neutral-600/20"
      :initial="{ scale: 0.9, opacity: 0, y: 20 }"
      :enter="{ scale: 1, opacity: 1, y: 0 }"
      :duration="500"
    >
      <div text="60" :class="icon" />
    </div>
  </div>
</template>
